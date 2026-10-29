"use client";

import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useBookingPreset, type BookingPreset } from "../booking-preset-context";

interface BookButtonProps {
  /** Form fields to pre-fill, e.g. `{ vehicle: "first_class" }` or `{ city: "paris" }`. */
  preset: Partial<BookingPreset>;
  children: ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
}

/** Jumps to the booking form with the given choices pre-filled. */
export function BookButton({ preset, children, variant, className }: BookButtonProps) {
  const { requestBooking } = useBookingPreset();

  return (
    <Button variant={variant} className={className} onClick={() => requestBooking(preset)}>
      {children} <ArrowRight aria-hidden="true" className="rtl:-scale-x-100" />
    </Button>
  );
}
