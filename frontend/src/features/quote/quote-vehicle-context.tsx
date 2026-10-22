"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { DEFAULT_VEHICLE_CLASS, type VehicleClass } from "@/domain/booking";

export const QUOTE_SECTION_ID = "quote";

interface QuoteVehicleContextValue {
  vehicle: VehicleClass;
  setVehicle: (vehicle: VehicleClass) => void;
  /** Preselects a vehicle and brings the quote form into view. */
  requestQuoteFor: (vehicle: VehicleClass) => void;
}

const QuoteVehicleContext = createContext<QuoteVehicleContextValue | null>(null);

export function QuoteVehicleProvider({ children }: { children: ReactNode }) {
  const [vehicle, setVehicle] = useState<VehicleClass>(DEFAULT_VEHICLE_CLASS);

  const requestQuoteFor = useCallback((next: VehicleClass) => {
    setVehicle(next);
    requestAnimationFrame(() =>
      document.getElementById(QUOTE_SECTION_ID)?.scrollIntoView({ behavior: "smooth" }),
    );
  }, []);

  const value = useMemo(() => ({ vehicle, setVehicle, requestQuoteFor }), [vehicle, requestQuoteFor]);

  return <QuoteVehicleContext.Provider value={value}>{children}</QuoteVehicleContext.Provider>;
}

export function useQuoteVehicle() {
  const context = useContext(QuoteVehicleContext);
  if (!context) throw new Error("useQuoteVehicle must be used inside <QuoteVehicleProvider>");
  return context;
}
