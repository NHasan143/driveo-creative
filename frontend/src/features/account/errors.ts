import type { Dictionary } from "@/i18n/get-dictionary";
import { ApiError } from "@/lib/api/http-client";

export type AccountErrorKey = keyof Dictionary["account"]["errors"];

/**
 * Turns an API failure into one of the account pages' translated messages.
 * The API's own messages are English, so the forms show these instead.
 *
 * `fields` maps a DRF field error (e.g. `{ email: [...] }`) to a message;
 * `on400` is used for a 400 without a mapped field (e.g. wrong password).
 */
export function accountErrorKey(
  error: unknown,
  fields: Record<string, AccountErrorKey> = {},
  on400: AccountErrorKey = "failed",
): AccountErrorKey {
  if (!(error instanceof ApiError)) return "failed";
  if (error.status === 0) return "unavailable";
  if (error.status === 429) return "rateLimited";
  if (error.status === 403) return "signedOut";
  if (error.status === 400) {
    if (error.details && typeof error.details === "object") {
      for (const field of Object.keys(error.details)) {
        if (fields[field]) return fields[field];
      }
    }
    return on400;
  }
  return "failed";
}
