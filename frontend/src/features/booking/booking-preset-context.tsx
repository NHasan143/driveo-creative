"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import {
  DEFAULT_VEHICLE_CLASS,
  type City,
  type ServiceType,
  type VehicleClass,
} from "@/domain/booking";

export const QUOTE_SECTION_ID = "quote";

/** Choices other parts of the page can pre-fill in the quote form. */
export interface QuotePreset {
  vehicle: VehicleClass;
  city: City | "";
  service: ServiceType | "";
}

const EMPTY_PRESET: QuotePreset = { vehicle: DEFAULT_VEHICLE_CLASS, city: "", service: "" };

interface QuotePresetContextValue {
  preset: QuotePreset;
  update: (changes: Partial<QuotePreset>) => void;
  reset: () => void;
  /** Applies the changes and brings the quote form into view. */
  requestQuote: (changes: Partial<QuotePreset>) => void;
}

const QuotePresetContext = createContext<QuotePresetContextValue | null>(null);

/**
 * Next.js keeps recently visited pages mounted but hidden (React `<Activity>`),
 * so several `#quote` sections can exist at once; scroll to the visible one.
 */
function scrollToVisibleQuote() {
  const sections = document.querySelectorAll<HTMLElement>(`[id="${QUOTE_SECTION_ID}"]`);
  const visible = Array.from(sections).find((section) => section.getClientRects().length > 0);
  visible?.scrollIntoView({ behavior: "smooth" });
}

export function QuotePresetProvider({ children }: { children: ReactNode }) {
  const [preset, setPreset] = useState<QuotePreset>(EMPTY_PRESET);

  const update = useCallback((changes: Partial<QuotePreset>) => {
    setPreset((current) => ({ ...current, ...changes }));
  }, []);

  const reset = useCallback(() => setPreset(EMPTY_PRESET), []);

  const requestQuote = useCallback(
    (changes: Partial<QuotePreset>) => {
      update(changes);
      requestAnimationFrame(scrollToVisibleQuote);
    },
    [update],
  );

  const value = useMemo(
    () => ({ preset, update, reset, requestQuote }),
    [preset, update, reset, requestQuote],
  );

  return <QuotePresetContext.Provider value={value}>{children}</QuotePresetContext.Provider>;
}

export function useQuotePreset() {
  const context = useContext(QuotePresetContext);
  if (!context) throw new Error("useQuotePreset must be used inside <QuotePresetProvider>");
  return context;
}
