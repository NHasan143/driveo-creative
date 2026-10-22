export const locales = ["en", "fr", "bg", "ar"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

/** Cookie that remembers an explicit language choice across visits. */
export const LOCALE_COOKIE = "NEXT_LOCALE";

export const localeMeta: Record<Locale, { label: string; dir: "ltr" | "rtl"; ogLocale: string }> = {
  en: { label: "English", dir: "ltr", ogLocale: "en_GB" },
  fr: { label: "Français", dir: "ltr", ogLocale: "fr_FR" },
  bg: { label: "Български", dir: "ltr", ogLocale: "bg_BG" },
  ar: { label: "العربية", dir: "rtl", ogLocale: "ar_AE" },
};

export function hasLocale(value: string | undefined | null): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}
