"use client";

import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import type { VehicleClass } from "@/domain/booking";
import { useQuoteVehicle } from "../quote-vehicle-context";

interface RequestQuoteButtonProps {
  vehicle: VehicleClass;
  children: ReactNode;
  className?: string;
}

/** Jumps to the quote form with the given vehicle preselected. */
export function RequestQuoteButton({ vehicle, children, className }: RequestQuoteButtonProps) {
  const { requestQuoteFor } = useQuoteVehicle();

  return (
    <Button className={className} onClick={() => requestQuoteFor(vehicle)}>
      {children} <ArrowRight aria-hidden="true" className="rtl:-scale-x-100" />
    </Button>
  );
}
