"use client";

import { useEffect } from "react";
import { useBookingPreset, type BookingPreset } from "../booking-preset-context";

/** Pre-fills the booking form when a page opens, e.g. the service on its detail page. */
export function BookingPresetDefaults({ preset }: { preset: Partial<BookingPreset> }) {
  const { update } = useBookingPreset();
  const key = JSON.stringify(preset);

  useEffect(() => {
    update(JSON.parse(key) as Partial<BookingPreset>);
  }, [key, update]);

  return null;
}
