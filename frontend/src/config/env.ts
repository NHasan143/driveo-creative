/**
 * Public runtime configuration. Only `NEXT_PUBLIC_*` variables are readable in
 * the browser, and Next.js inlines them at build time.
 */
export const env = {
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  /** Base URL of the shared Django REST API, e.g. https://api.driveoexclusive.com/api */
  apiBaseUrl: (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, ""),
  /** When true (or when no API URL is set) requests are answered by local mocks. */
  apiMock:
    process.env.NEXT_PUBLIC_API_MOCK === "true" || !process.env.NEXT_PUBLIC_API_BASE_URL,
} as const;
