export const locales = ["en", "fr", "bg", "ar"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

/** Cookie that remembers an explicit language choice across visits. */
export const LOCALE_COOKIE = "NEXT_LOCALE";
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/** Public URLs carry the language as a query parameter: `/?lang=fr` (see proxy.ts). */
export const LANG_QUERY_PARAM = "lang";

/** Site-relative URL of a page in a given language, e.g. `/?lang=fr`. */
export function localePath(locale: Locale, path = "/") {
  return `${path}?${LANG_QUERY_PARAM}=${locale}`;
}

/** `label` is the language's own name (endonym), shown as-is in every locale. */
export const localeMeta: Record<
  Locale,
  { label: string; short: string; dir: "ltr" | "rtl"; ogLocale: string }
> = {
  en: { label: "English", short: "EN", dir: "ltr", ogLocale: "en_GB" },
  fr: { label: "Français", short: "FR", dir: "ltr", ogLocale: "fr_FR" },
  bg: { label: "Български", short: "BG", dir: "ltr", ogLocale: "bg_BG" },
  ar: { label: "العربية", short: "AR", dir: "rtl", ogLocale: "ar_AE" },
};

export function hasLocale(value: string | undefined | null): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}
