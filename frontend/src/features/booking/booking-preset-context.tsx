"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { City, FleetVehicle, ServiceType } from "@/domain/booking";

export const BOOKING_SECTION_ID = "book";

/** Choices other parts of the page can pre-fill in the booking form. */
export interface BookingPreset {
  vehicle: FleetVehicle | "";
  city: City | "";
  service: ServiceType | "";
}

const EMPTY_PRESET: BookingPreset = { vehicle: "", city: "", service: "" };

interface BookingPresetContextValue {
  preset: BookingPreset;
  update: (changes: Partial<BookingPreset>) => void;
  reset: () => void;
  /** Applies the changes and brings the booking form into view. */
  requestBooking: (changes: Partial<BookingPreset>) => void;
}

const BookingPresetContext = createContext<BookingPresetContextValue | null>(null);

/**
 * Next.js keeps recently visited pages mounted but hidden (React `<Activity>`),
 * so several `#book` sections can exist at once; scroll to the visible one.
 */
function scrollToVisibleBooking() {
  const sections = document.querySelectorAll<HTMLElement>(`[id="${BOOKING_SECTION_ID}"]`);
  const visible = Array.from(sections).find((section) => section.getClientRects().length > 0);
  visible?.scrollIntoView({ behavior: "smooth" });
}

export function BookingPresetProvider({ children }: { children: ReactNode }) {
  const [preset, setPreset] = useState<BookingPreset>(EMPTY_PRESET);

  const update = useCallback((changes: Partial<BookingPreset>) => {
    setPreset((current) => ({ ...current, ...changes }));
  }, []);

  const reset = useCallback(() => setPreset(EMPTY_PRESET), []);

  const requestBooking = useCallback(
    (changes: Partial<BookingPreset>) => {
      update(changes);
      requestAnimationFrame(scrollToVisibleBooking);
    },
    [update],
  );

  const value = useMemo(
    () => ({ preset, update, reset, requestBooking }),
    [preset, update, reset, requestBooking],
  );

  return <BookingPresetContext.Provider value={value}>{children}</BookingPresetContext.Provider>;
}

export function useBookingPreset() {
  const context = useContext(BookingPresetContext);
  if (!context) throw new Error("useBookingPreset must be used inside <BookingPresetProvider>");
  return context;
}
