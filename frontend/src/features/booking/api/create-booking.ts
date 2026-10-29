import { env } from "@/config/env";
import type { Locale } from "@/i18n/config";
import { sessionRequest } from "@/lib/api/session-client";
import type { BookingRequest } from "../schema";
import type { BookingDto } from "./bookings";

/** Wire format expected by the Django REST endpoint (snake_case). */
export interface BookingRequestDto {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  city: string;
  service: string;
  vehicle: string;
  pickup_location: string;
  destination: string;
  hire_hours: number | null;
  flight_number: string;
  journey_date: string;
  journey_time: string;
  passengers: number;
  luggage: number;
  notes: string;
  locale: Locale;
  honeypot: string;
}

/** The new booking, plus the private token that lets a guest manage it. */
export type CreatedBookingDto = Partial<BookingDto> & { reference: string; manage_token: string };

export const BOOKINGS_ENDPOINT = "/v1/bookings/";

export function toBookingRequestDto(request: BookingRequest, locale: Locale): BookingRequestDto {
  const hourly = request.service === "hourly_hire";
  return {
    first_name: request.firstName,
    last_name: request.lastName,
    email: request.email,
    phone: request.phone,
    city: request.city,
    service: request.service,
    vehicle: request.vehicle,
    pickup_location: request.pickupLocation,
    destination: hourly ? "" : request.destination,
    hire_hours: hourly ? request.hireHours : null,
    flight_number: request.service === "airport_transfer" ? request.flightNumber : "",
    journey_date: request.journeyDate,
    journey_time: request.journeyTime,
    passengers: request.passengers,
    luggage: request.luggage,
    notes: request.notes,
    locale,
    honeypot: request.honeypot,
  };
}

async function mockCreate(): Promise<CreatedBookingDto> {
  await new Promise((resolve) => setTimeout(resolve, 900));
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return { reference: `DRV-${suffix}`, status: "pending", manage_token: "mock" };
}

export async function createBooking(request: BookingRequest, locale: Locale): Promise<CreatedBookingDto> {
  if (env.apiMock) return mockCreate();

  // Sent with the session cookie and CSRF token: a signed-in customer's booking is
  // linked to their account, and the API refuses a signed-in post without the token.
  return sessionRequest<CreatedBookingDto>(BOOKINGS_ENDPOINT, {
    method: "POST",
    body: toBookingRequestDto(request, locale),
    locale,
  });
}
