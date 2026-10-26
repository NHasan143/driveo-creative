"use client";

import { useRef, useState } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { ApiError } from "@/lib/api/http-client";
import { submitQuoteRequest } from "../api/submit-quote-request";
import { quoteRequestSchema, type QuoteRequestInput } from "../schema";

export type SubmissionStatus = "idle" | "sending" | "sent" | "error";

/** Dictionary keys of the form's field labels. */
type FieldLabel = keyof Pick<
  Dictionary["quote"],
  | "firstName"
  | "lastName"
  | "email"
  | "phone"
  | "city"
  | "service"
  | "vehicle"
  | "pickup"
  | "destination"
  | "hoursField"
  | "date"
  | "time"
  | "passengers"
  | "luggage"
  | "notes"
>;

export type SubmissionError =
  /** The API or the schema rejected these fields (dictionary label keys). */
  | { kind: "invalid"; fields: FieldLabel[] }
  | { kind: "rateLimited" }
  | { kind: "failed" };

/** Client-side guard against accidental double posts; the API rate-limits for real. */
const COOLDOWN_MS = 30_000;
const MAX_SUBMISSIONS_PER_VISIT = 5;

/** API (snake_case) and schema (camelCase) field names → the form's own labels. */
const FIELD_LABELS: Record<string, FieldLabel> = {
  first_name: "firstName",
  firstName: "firstName",
  last_name: "lastName",
  lastName: "lastName",
  email: "email",
  phone: "phone",
  city: "city",
  service_type: "service",
  serviceType: "service",
  vehicle_class: "vehicle",
  vehicleClass: "vehicle",
  pickup_location: "pickup",
  pickupLocation: "pickup",
  destination: "destination",
  hire_hours: "hoursField",
  hireHours: "hoursField",
  journey_date: "date",
  journeyDate: "date",
  journey_time: "time",
  journeyTime: "time",
  passengers: "passengers",
  luggage: "luggage",
  notes: "notes",
};

function toLabels(fieldNames: Iterable<PropertyKey>): FieldLabel[] {
  const labels = new Set<FieldLabel>();
  for (const name of fieldNames) {
    const label = FIELD_LABELS[String(name)];
    if (label) labels.add(label);
  }
  return [...labels];
}

function describeFailure(error: unknown): SubmissionError {
  if (error instanceof ApiError) {
    if (error.status === 429) return { kind: "rateLimited" };
    if (error.status === 400 && error.details && typeof error.details === "object") {
      const fields = toLabels(Object.keys(error.details));
      if (fields.length > 0) return { kind: "invalid", fields };
    }
  }
  return { kind: "failed" };
}

export function useQuoteSubmission(locale: Locale) {
  const [status, setStatus] = useState<SubmissionStatus>("idle");
  const [error, setError] = useState<SubmissionError>({ kind: "failed" });
  const [reference, setReference] = useState("");
  const lastSentAt = useRef(0);
  const sentCount = useRef(0);

  function fail(reason: SubmissionError) {
    setError(reason);
    setStatus("error");
    return false;
  }

  async function submit(input: QuoteRequestInput): Promise<boolean> {
    if (status === "sending") return false;
    const throttled =
      Date.now() - lastSentAt.current < COOLDOWN_MS || sentCount.current >= MAX_SUBMISSIONS_PER_VISIT;
    if (throttled) return fail({ kind: "rateLimited" });

    const parsed = quoteRequestSchema.safeParse(input);
    if (!parsed.success) {
      const fields = toLabels(parsed.error.issues.map((issue) => issue.path[0] ?? ""));
      return fail(fields.length > 0 ? { kind: "invalid", fields } : { kind: "failed" });
    }

    setStatus("sending");
    try {
      const response = await submitQuoteRequest(parsed.data, locale);
      lastSentAt.current = Date.now();
      sentCount.current += 1;
      setReference(response.reference);
      setStatus("sent");
      return true;
    } catch (caught) {
      return fail(describeFailure(caught));
    }
  }

  return { status, error, reference, submit, reset: () => setStatus("idle") };
}
