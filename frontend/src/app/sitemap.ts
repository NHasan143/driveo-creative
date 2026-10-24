import type { MetadataRoute } from "next";
import { pagePath, SITE_PAGES } from "@/config/navigation";
import { servicePath } from "@/config/services";
import { SERVICE_TYPES } from "@/domain/booking";
import { locales } from "@/i18n/config";
import { localeUrl } from "@/lib/seo/metadata";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [pagePath(null), ...SITE_PAGES.map(({ segment }) => pagePath(segment))];
  const servicePages = SERVICE_TYPES.map(servicePath);

  return [...pages, ...servicePages].flatMap((path) => {
    const languages = Object.fromEntries(locales.map((locale) => [locale, localeUrl(locale, path)]));
    return locales.map((locale) => ({
      url: localeUrl(locale, path),
      changeFrequency: "monthly" as const,
      priority: path === "/" ? 1 : servicePages.includes(path) ? 0.7 : 0.8,
      alternates: { languages },
    }));
  });
}
