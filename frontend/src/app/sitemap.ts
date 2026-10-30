import type { MetadataRoute } from "next";
import { pagePath, SITE_PAGES } from "@/config/navigation";
import { locales } from "@/i18n/config";
import { getSiteServices } from "@/lib/content/site-services";
import { localeUrl } from "@/lib/seo/metadata";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = [pagePath(null), ...SITE_PAGES.map(({ segment }) => pagePath(segment))];
  const servicePages = (await getSiteServices("en")).map((service) => service.path);
  const legalPages = ["/privacy", "/terms", "/cookies"];

  return [...pages, ...servicePages, ...legalPages].flatMap((path) => {
    const languages = Object.fromEntries(locales.map((locale) => [locale, localeUrl(locale, path)]));
    return locales.map((locale) => ({
      url: localeUrl(locale, path),
      changeFrequency: "monthly" as const,
      priority: path === "/" ? 1 : servicePages.includes(path) ? 0.7 : legalPages.includes(path) ? 0.4 : 0.8,
      alternates: { languages },
    }));
  });
}
