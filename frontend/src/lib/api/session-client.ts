import { env } from "@/config/env";
import { ApiError } from "./http-client";

/**
 * Requests that carry the visitor's session: customer accounts and the quote form.
 *
 * The API signs people in with Django's session cookie (HttpOnly, on the API's
 * own origin), sent with `credentials: "include"`. This page can't read the
 * API's cookies, so the CSRF token comes in JSON responses (`csrf_token`) and
 * is kept in memory, then sent as `X-CSRFToken` on every write. The quote form
 * must send it too: a signed-in visitor's post is refused without it.
 */

const SESSION_PATH = "/v1/account/session/";

let csrfToken: string | null = null;

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  locale?: string;
  timeoutMs?: number;
}

function url(path: string) {
  if (!env.apiBaseUrl) throw new ApiError("NEXT_PUBLIC_API_BASE_URL is not configured", 0);
  return `${env.apiBaseUrl}${path}`;
}

async function fetchCsrfToken() {
  const response = await fetch(url(SESSION_PATH), {
    credentials: "include",
    headers: { Accept: "application/json" },
  });
  if (!response.ok)
    throw new ApiError(`Request to ${SESSION_PATH} failed with ${response.status}`, response.status);
  csrfToken = ((await response.json()) as { csrf_token: string }).csrf_token;
  return csrfToken;
}

function isCsrfFailure(data: unknown) {
  return (
    typeof data === "object" &&
    data !== null &&
    "detail" in data &&
    String(data.detail).startsWith("CSRF Failed")
  );
}

export async function sessionRequest<T>(
  path: string,
  { method = "GET", body, locale, timeoutMs = 15_000 }: RequestOptions = {},
  retried = false,
): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (locale) headers["Accept-Language"] = locale;
  if (method !== "GET") headers["X-CSRFToken"] = csrfToken ?? (await fetchCsrfToken());

  const response = await fetch(url(path), {
    method,
    headers,
    credentials: "include",
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutMs),
  });
  const data: unknown = response.status === 204 ? undefined : await response.json().catch(() => undefined);

  if (response.status === 403 && isCsrfFailure(data) && !retried) {
    // The token was rotated, e.g. by signing in in another tab: fetch a fresh one and retry once.
    await fetchCsrfToken();
    return sessionRequest<T>(path, { method, body, locale, timeoutMs }, true);
  }
  if (!response.ok)
    throw new ApiError(`Request to ${path} failed with ${response.status}`, response.status, data);

  // Signing in or out rotates the token; responses that do so carry the new one.
  if (typeof data === "object" && data !== null && "csrf_token" in data) csrfToken = String(data.csrf_token);
  return data as T;
}
