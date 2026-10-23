import type { MetadataRoute } from "next";
import { pagePath, SITE_PAGES } from "@/config/navigation";
import { locales } from "@/i18n/config";
import { localeUrl } from "@/lib/seo/metadata";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [pagePath(null), ...SITE_PAGES.map(({ segment }) => pagePath(segment))];

  return paths.flatMap((path) => {
    const languages = Object.fromEntries(locales.map((locale) => [locale, localeUrl(locale, path)]));
    return locales.map((locale) => ({
      url: localeUrl(locale, path),
      changeFrequency: "monthly" as const,
      priority: path === "/" ? 1 : 0.8,
      alternates: { languages },
    }));
  });
}
