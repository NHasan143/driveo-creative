"use client";

import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useQuotePreset, type QuotePreset } from "../quote-preset-context";

interface RequestQuoteButtonProps {
  /** Form fields to pre-fill, e.g. `{ vehicle: "first_class" }` or `{ city: "paris" }`. */
  preset: Partial<QuotePreset>;
  children: ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
}

/** Jumps to the quote form with the given choices pre-filled. */
export function RequestQuoteButton({ preset, children, variant, className }: RequestQuoteButtonProps) {
  const { requestQuote } = useQuotePreset();

  return (
    <Button variant={variant} className={className} onClick={() => requestQuote(preset)}>
      {children} <ArrowRight aria-hidden="true" className="rtl:-scale-x-100" />
    </Button>
  );
}
