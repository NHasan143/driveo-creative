/** Top-level site pages, in navigation order. `segment` is the route folder under app/[locale]/(site). */
export const SITE_PAGES = [
  { key: "services", segment: "services" },
  { key: "fleet", segment: "fleet" },
  { key: "cities", segment: "cities" },
  { key: "process", segment: "process" },
] as const;

export type SitePageKey = (typeof SITE_PAGES)[number]["key"];

/** Public path of a page (without the `?lang=` parameter); `null` is the home page. */
export function pagePath(segment: string | null) {
  return segment ? `/${segment}` : "/";
}
