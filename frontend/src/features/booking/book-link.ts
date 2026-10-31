import type { City, FleetVehicle, ServiceType } from "@/domain/booking";
import { localePath, type Locale } from "@/i18n/config";

/** The booking page. Its choices travel in the query string, so any link can pre-fill it. */
export const BOOK_PATH = "/book";

/** What a link or the booking bar can pre-fill on the booking page. */
export interface BookQuery {
  service?: ServiceType | "";
  city?: City | "";
  vehicle?: FleetVehicle | "";
  pickup?: string;
  dropoff?: string;
  /** `YYYY-MM-DD` */
  date?: string;
  /** `HH:MM` */
  time?: string;
  hours?: number;
}

/** `/book?lang=en&service=…`; empty choices are left out. */
export function bookHref(locale: Locale, query: BookQuery = {}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "") params.set(key, String(value));
  }
  const search = params.toString();
  return search ? `${localePath(locale, BOOK_PATH)}&${search}` : localePath(locale, BOOK_PATH);
}

/** The private page where a guest views, changes or cancels their booking. */
export function manageBookingHref(locale: Locale, reference: string, token?: string) {
  const query = new URLSearchParams({ ref: reference, ...(token && { token }) });
  return `${localePath(locale, "/booking")}&${query}`;
}
