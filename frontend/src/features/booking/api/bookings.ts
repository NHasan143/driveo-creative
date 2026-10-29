import type { LocalizedText } from "@/admin/lib/content/types";
import { env } from "@/config/env";
import { ApiError } from "@/lib/api/http-client";
import { sessionRequest } from "@/lib/api/session-client";

/** A booking as the API shows it to its customer (backend/bookings/serializers.py). */
export interface BookingDto {
  reference: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  service: string;
  service_name: LocalizedText | null;
  city: string;
  city_name: LocalizedText | null;
  vehicle: string;
  vehicle_name: LocalizedText | null;
  pickup_location: string;
  destination: string;
  hire_hours: number | null;
  flight_number: string;
  journey_date: string;
  journey_time: string;
  passengers: number;
  luggage: number;
  notes: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  currency: string;
  price_unit: "trip" | "hour";
  unit_price: string;
  total_price: string;
  chauffeur_name: string;
  chauffeur_phone: string;
  vehicle_details: string;
  can_change: boolean;
  change_deadline: string;
  created_at: string;
}

/** What a customer may change: date, time, route, car and party. */
export interface BookingChangeDto {
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
}

/** A guest proves access with the token from their email; a signed-in owner needs none. */
function access(token: string | null) {
  return token ? { headers: { "X-Booking-Token": token } } : {};
}

function path(reference: string) {
  return `/v1/bookings/${encodeURIComponent(reference)}/`;
}

function requireApi() {
  if (env.apiMock) throw new ApiError("Bookings need the Driveo API", 0);
}

export function getBooking(reference: string, token: string | null) {
  requireApi();
  return sessionRequest<BookingDto>(path(reference), access(token));
}

export function changeBooking(reference: string, token: string | null, changes: BookingChangeDto) {
  requireApi();
  return sessionRequest<BookingDto>(path(reference), { method: "PATCH", body: changes, ...access(token) });
}

export function cancelBooking(reference: string, token: string | null) {
  requireApi();
  return sessionRequest<BookingDto>(`${path(reference)}cancel/`, { method: "POST", ...access(token) });
}

export function listMyBookings() {
  requireApi();
  return sessionRequest<BookingDto[]>("/v1/account/bookings/");
}

/** The 409 the API sends when a booking can no longer be changed: "too_late" or "closed". */
export function closedReason(error: unknown): "too_late" | "closed" | null {
  if (!(error instanceof ApiError) || error.status !== 409) return null;
  const code = (error.details as { code?: string } | undefined)?.code;
  return code === "too_late" || code === "closed" ? code : null;
}
