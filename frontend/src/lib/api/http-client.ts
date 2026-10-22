import { env } from "@/config/env";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    /** Parsed response body, e.g. DRF field errors `{ email: ["..."] }`. */
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  locale?: string;
  signal?: AbortSignal;
  timeoutMs?: number;
}

/**
 * Thin JSON client for the shared Django REST API.
 * Paths are relative to `NEXT_PUBLIC_API_BASE_URL`, e.g. `/v1/quote-requests/`.
 */
export async function apiRequest<TResponse>(
  path: string,
  { method = "GET", body, locale, signal, timeoutMs = 15_000 }: RequestOptions = {},
): Promise<TResponse> {
  if (!env.apiBaseUrl) {
    throw new ApiError("NEXT_PUBLIC_API_BASE_URL is not configured", 0);
  }

  const timeout = AbortSignal.timeout(timeoutMs);
  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    method,
    headers: {
      Accept: "application/json",
      ...(body !== undefined && { "Content-Type": "application/json" }),
      ...(locale && { "Accept-Language": locale }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
  });

  const data: unknown = await response.json().catch(() => undefined);

  if (!response.ok) {
    throw new ApiError(`Request to ${path} failed with ${response.status}`, response.status, data);
  }

  return data as TResponse;
}
