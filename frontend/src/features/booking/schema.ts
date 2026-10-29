import { z } from "zod";
import { CITIES, FLEET_VEHICLES, getVehicleCapacity, HIRE_HOURS, SERVICE_TYPES } from "@/domain/booking";

/** Collapses whitespace and strips control characters and angle brackets. */
const cleanText = (max: number) =>
  z
    .string()
    .transform((value) =>
      value
        .replace(/[\u0000-\u001F\u007F<>]/g, " ")
        .replace(/\s+/g, " ")
        .trim(),
    )
    .pipe(z.string().max(max));

/** The journey fields, shared by a new booking and a change to one. */
export const journeyFields = {
  vehicle: z.enum(FLEET_VEHICLES),
  pickupLocation: cleanText(300).pipe(z.string().min(2)),
  destination: cleanText(300),
  hireHours: z.number().int().min(HIRE_HOURS.min).max(HIRE_HOURS.max).nullable(),
  flightNumber: cleanText(12).pipe(z.string().regex(/^[A-Za-z0-9 ]*$/)),
  journeyDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  journeyTime: z.string().regex(/^\d{2}:\d{2}$/),
  passengers: z.number().int().min(1),
  luggage: z.number().int().min(0),
  notes: cleanText(1500),
};

/**
 * Client-side contract for a booking. The Django API re-validates every field
 * and prices the booking itself; this schema catches mistakes before a round trip.
 */
export const bookingRequestSchema = z
  .object({
    firstName: cleanText(60).pipe(z.string().min(2)),
    lastName: cleanText(60).pipe(z.string().min(1)),
    email: z.string().trim().pipe(z.email().max(254)),
    phone: cleanText(40).pipe(z.string().min(7).regex(/^[+0-9 ()./-]+$/)),
    city: z.enum(CITIES),
    service: z.enum(SERVICE_TYPES),
    ...journeyFields,
    /** Honeypot: real visitors never see or fill this field. */
    honeypot: z.string().max(500),
  })
  .superRefine((value, ctx) => {
    if (value.service === "hourly_hire" && value.hireHours === null) {
      ctx.addIssue({ code: "custom", path: ["hireHours"], message: "Select the number of hours" });
    }
    if (value.service !== "hourly_hire" && value.destination.length < 2) {
      ctx.addIssue({ code: "custom", path: ["destination"], message: "Enter a destination" });
    }

    const capacity = getVehicleCapacity(value.vehicle);
    if (value.passengers > capacity.passengers) {
      ctx.addIssue({ code: "custom", path: ["passengers"], message: "Too many passengers" });
    }
    if (value.luggage > capacity.luggage) {
      ctx.addIssue({ code: "custom", path: ["luggage"], message: "Too much luggage" });
    }
  });

export type BookingRequestInput = z.input<typeof bookingRequestSchema>;
export type BookingRequest = z.output<typeof bookingRequestSchema>;
