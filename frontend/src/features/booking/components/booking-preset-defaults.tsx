"use client";

import { useEffect } from "react";
import { useQuotePreset, type QuotePreset } from "../quote-preset-context";

/** Pre-fills the quote form when a page opens, e.g. the service on its detail page. */
export function QuotePresetDefaults({ preset }: { preset: Partial<QuotePreset> }) {
  const { update } = useQuotePreset();
  const key = JSON.stringify(preset);

  useEffect(() => {
    update(JSON.parse(key) as Partial<QuotePreset>);
  }, [key, update]);

  return null;
}
