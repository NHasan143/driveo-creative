import { z } from "zod";
import {
  CITIES,
  getVehicleCapacity,
  HIRE_HOURS,
  SERVICE_TYPES,
  VEHICLE_CLASSES,
} from "@/domain/booking";

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

/**
 * Client-side contract for a quote request. The Django API re-validates every
 * field; this schema exists to catch mistakes before a round trip.
 */
export const quoteRequestSchema = z
  .object({
    firstName: cleanText(60).pipe(z.string().min(2)),
    lastName: cleanText(60).pipe(z.string().min(1)),
    email: z.string().trim().pipe(z.email().max(254)),
    phone: cleanText(40).pipe(z.string().min(7).regex(/^[+0-9 ()./-]+$/)),
    city: z.enum(CITIES),
    serviceType: z.enum(SERVICE_TYPES),
    vehicleClass: z.enum(VEHICLE_CLASSES),
    pickupLocation: cleanText(300).pipe(z.string().min(2)),
    destination: cleanText(300),
    hireHours: z.number().int().min(HIRE_HOURS.min).max(HIRE_HOURS.max).nullable(),
    journeyDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    journeyTime: z.string().regex(/^\d{2}:\d{2}$/),
    passengers: z.number().int().min(1),
    luggage: z.number().int().min(0),
    notes: cleanText(1500),
    /** Honeypot: real visitors never see or fill this field. */
    honeypot: z.string().max(500),
  })
  .superRefine((value, ctx) => {
    if (value.serviceType === "hourly_hire" && value.hireHours === null) {
      ctx.addIssue({ code: "custom", path: ["hireHours"], message: "Select the number of hours" });
    }
    if (value.serviceType !== "hourly_hire" && value.destination.length < 2) {
      ctx.addIssue({ code: "custom", path: ["destination"], message: "Enter a destination" });
    }

    const capacity = getVehicleCapacity(value.vehicleClass);
    if (value.passengers > capacity.passengers) {
      ctx.addIssue({ code: "custom", path: ["passengers"], message: "Too many passengers" });
    }
    if (value.luggage > capacity.luggage) {
      ctx.addIssue({ code: "custom", path: ["luggage"], message: "Too much luggage" });
    }
  });

export type QuoteRequestInput = z.input<typeof quoteRequestSchema>;
export type QuoteRequest = z.output<typeof quoteRequestSchema>;
