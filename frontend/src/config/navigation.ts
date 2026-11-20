/** Top-level site pages, for the sitemap. `segment` is the route folder under app/[locale]/(site). */
export const SITE_PAGES = [
  { key: "services", segment: "services" },
  { key: "business", segment: "business" },
  { key: "chauffeurs", segment: "chauffeurs" },
  { key: "fleet", segment: "fleet" },
  { key: "cities", segment: "cities" },
  { key: "process", segment: "process" },
  { key: "help", segment: "help" },
] as const;

export type SitePageKey = (typeof SITE_PAGES)[number]["key"];

/** Public path of a page (without the `?lang=` parameter); `null` is the home page. */
export function pagePath(segment: string | null) {
  return segment ? `/${segment}` : "/";
}

/** In-page anchors the header and footer link to. */
export const ANCHORS = {
  /** The footer's contact column, on every page. */
  contact: "contact",
  /** The home page's "Why choose us" section. */
  about: "about",
  /** The FAQ section on pages that have one. */
  faq: "faq",
} as const;
