"use client";

import { useRef, useState } from "react";
import type { Locale } from "@/i18n/config";
import { submitQuoteRequest } from "../api/submit-quote-request";
import { quoteRequestSchema, type QuoteRequestInput } from "../schema";

export type SubmissionStatus = "idle" | "sending" | "sent" | "error";

/** Client-side guard against accidental double posts; the API rate-limits for real. */
const COOLDOWN_MS = 30_000;
const MAX_SUBMISSIONS_PER_VISIT = 5;

export function useQuoteSubmission(locale: Locale) {
  const [status, setStatus] = useState<SubmissionStatus>("idle");
  const [reference, setReference] = useState("");
  const lastSentAt = useRef(0);
  const sentCount = useRef(0);

  async function submit(input: QuoteRequestInput): Promise<boolean> {
    const throttled =
      Date.now() - lastSentAt.current < COOLDOWN_MS || sentCount.current >= MAX_SUBMISSIONS_PER_VISIT;
    if (status === "sending" || throttled) return false;

    const parsed = quoteRequestSchema.safeParse(input);
    if (!parsed.success) {
      setStatus("error");
      return false;
    }

    setStatus("sending");
    try {
      const response = await submitQuoteRequest(parsed.data, locale);
      lastSentAt.current = Date.now();
      sentCount.current += 1;
      setReference(response.reference);
      setStatus("sent");
      return true;
    } catch {
      setStatus("error");
      return false;
    }
  }

  return { status, reference, submit, reset: () => setStatus("idle") };
}
