import { env } from "@/config/env";
import type { Locale } from "@/i18n/config";
import { sessionRequest } from "@/lib/api/session-client";
import type { QuoteRequest } from "../schema";

/** Wire format expected by the Django REST endpoint (snake_case). */
export interface QuoteRequestDto {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  city: string;
  service_type: string;
  vehicle_class: string;
  pickup_location: string;
  destination: string;
  hire_hours: number | null;
  journey_date: string;
  journey_time: string;
  passengers: number;
  luggage: number;
  notes: string;
  locale: Locale;
  honeypot: string;
}

export interface QuoteRequestResponseDto {
  reference: string;
}

export const QUOTE_REQUESTS_ENDPOINT = "/v1/quote-requests/";

export function toQuoteRequestDto(request: QuoteRequest, locale: Locale): QuoteRequestDto {
  return {
    first_name: request.firstName,
    last_name: request.lastName,
    email: request.email,
    phone: request.phone,
    city: request.city,
    service_type: request.serviceType,
    vehicle_class: request.vehicleClass,
    pickup_location: request.pickupLocation,
    destination: request.serviceType === "hourly_hire" ? "" : request.destination,
    hire_hours: request.serviceType === "hourly_hire" ? request.hireHours : null,
    journey_date: request.journeyDate,
    journey_time: request.journeyTime,
    passengers: request.passengers,
    luggage: request.luggage,
    notes: request.notes,
    locale,
    honeypot: request.honeypot,
  };
}

async function mockSubmit(): Promise<QuoteRequestResponseDto> {
  await new Promise((resolve) => setTimeout(resolve, 900));
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return { reference: `DRV-${suffix}` };
}

export async function submitQuoteRequest(
  request: QuoteRequest,
  locale: Locale,
): Promise<QuoteRequestResponseDto> {
  if (env.apiMock) return mockSubmit();

  // Sent with the session cookie and CSRF token: a signed-in customer's request is
  // linked to their account, and the API refuses a signed-in post without the token.
  return sessionRequest<QuoteRequestResponseDto>(QUOTE_REQUESTS_ENDPOINT, {
    method: "POST",
    body: toQuoteRequestDto(request, locale),
    locale,
  });
}
