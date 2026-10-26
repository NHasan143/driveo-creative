import { env } from "@/config/env";
import { ContentValidationError } from "./content/repository";

/**
 * Client for the admin's staff-only Django endpoints.
 *
 * Staff sign in with Django's session cookie (HttpOnly, set by the API's own
 * origin), sent with `credentials: "include"`. This page can't read the API's
 * cookies, so the CSRF token comes in JSON bodies and is kept in memory, then
 * sent as `X-CSRFToken` on every write. See backend/core/auth_views.py.
 */

export interface StaffUser {
  username: string;
  name: string;
  email: string;
}

interface SessionResponse {
  user: StaffUser;
  csrfToken: string;
}

/** The API refused the request because nobody (or a non-staff account) is signed in. */
export class NotSignedInError extends Error {
  constructor(message = "Your session has ended. Please sign in again.") {
    super(message);
    this.name = "NotSignedInError";
  }
}

/** The record asked for doesn't exist (any more). */
export class NotFoundError extends Error {
  constructor(message = "This entry no longer exists. It may have been deleted.") {
    super(message);
    this.name = "NotFoundError";
  }
}

let csrfToken: string | null = null;
const signedOutListeners = new Set<() => void>();

/** Called whenever the API answers "not signed in", so the sign-in screen can take over. */
export function onSignedOut(listener: () => void) {
  signedOutListeners.add(listener);
  return () => {
    signedOutListeners.delete(listener);
  };
}

function url(path: string) {
  if (!env.apiBaseUrl) throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured.");
  return `${env.apiBaseUrl}${path}`;
}

async function fetchCsrfToken() {
  const response = await fetch(url("/v1/auth/csrf/"), { credentials: "include" });
  if (!response.ok) throw new Error("Couldn't reach the Driveo API.");
  csrfToken = ((await response.json()) as { csrfToken: string }).csrfToken;
  return csrfToken;
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  /** JSON body, or FormData for uploads. */
  body?: unknown;
}

export async function adminRequest<T>(path: string, { method = "GET", body }: RequestOptions = {}, retried = false): Promise<T> {
  const isForm = body instanceof FormData;
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined && !isForm) headers["Content-Type"] = "application/json";
  if (method !== "GET") headers["X-CSRFToken"] = csrfToken ?? (await fetchCsrfToken());

  let response: Response;
  try {
    response = await fetch(url(path), {
      method,
      headers,
      credentials: "include",
      body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
      signal: AbortSignal.timeout(isForm ? 60_000 : 20_000),
    });
  } catch {
    throw new Error("Couldn't reach the Driveo API. Check your connection and try again.");
  }

  if (response.status === 204) return undefined as T;
  const data: unknown = await response.json().catch(() => undefined);
  if (response.ok) return data as T;

  const detail = typeof data === "object" && data !== null && "detail" in data ? String(data.detail) : undefined;
  if (response.status === 403 && detail?.startsWith("CSRF Failed") && !retried) {
    // The token was rotated (e.g. by signing in in another tab): fetch a fresh one and retry once.
    await fetchCsrfToken();
    return adminRequest<T>(path, { method, body }, true);
  }
  if (response.status === 401 || response.status === 403) {
    signedOutListeners.forEach((listener) => listener());
    throw new NotSignedInError(detail);
  }
  if (response.status === 400) throw toValidationError(data);
  if (response.status === 404) throw new NotFoundError();
  if (response.status === 429) throw new Error("Too many attempts. Please wait a few minutes and try again.");
  throw new Error(detail ?? `The Driveo API answered with an error (${response.status}). Please try again.`);
}

/**
 * Turns DRF errors such as `{ slug: ["…"] }` or `{ facts: { "0": { value: { en: ["…"] } } } }`
 * into one error for the first problem, with the form field path (`facts.0.value.en`).
 */
function toValidationError(data: unknown): ContentValidationError {
  const first = firstError(data, []);
  if (!first) return new ContentValidationError("Some details weren't accepted. Please check the form.");
  const [path, message] = first;
  const field = path.filter((part) => part !== "detail" && part !== "non_field_errors").join(".");
  return new ContentValidationError(message, field || undefined);
}

function firstError(value: unknown, path: string[]): [string[], string] | null {
  if (typeof value === "string") return [path, value];
  if (Array.isArray(value)) {
    // A list of messages, or a list of per-item errors (empty objects for valid items).
    for (const [index, item] of value.entries()) {
      const found = firstError(item, typeof item === "string" ? path : [...path, String(index)]);
      if (found) return found;
    }
    return null;
  }
  if (typeof value === "object" && value !== null) {
    for (const [key, item] of Object.entries(value)) {
      const found = firstError(item, [...path, key]);
      if (found) return found;
    }
  }
  return null;
}

export async function getSession(): Promise<StaffUser | null> {
  try {
    const session = await adminRequest<SessionResponse>("/v1/auth/session/");
    csrfToken = session.csrfToken;
    return session.user;
  } catch (error) {
    if (error instanceof NotSignedInError) return null;
    throw error;
  }
}

export async function signIn(username: string, password: string): Promise<StaffUser> {
  try {
    const session = await adminRequest<SessionResponse>("/v1/auth/session/", {
      method: "POST",
      body: { username, password },
    });
    // Signing in rotates the CSRF token.
    csrfToken = session.csrfToken;
    return session.user;
  } catch (error) {
    // A wrong password comes back as a 400 without a field; show its message as is.
    if (error instanceof ContentValidationError) throw new Error(error.message);
    throw error;
  }
}

export async function signOut() {
  await adminRequest("/v1/auth/session/", { method: "DELETE" });
  csrfToken = null;
}
