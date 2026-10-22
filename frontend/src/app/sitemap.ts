import type { MetadataRoute } from "next";
import { locales } from "@/i18n/config";
import { localeUrl } from "@/lib/seo/metadata";

export default function sitemap(): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(locales.map((locale) => [locale, localeUrl(locale)]));

  return locales.map((locale) => ({
    url: localeUrl(locale),
    changeFrequency: "monthly",
    priority: 1,
    alternates: { languages },
  }));
}
