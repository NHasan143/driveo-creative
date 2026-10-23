import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { localeMeta, localePath, locales, type Locale } from "@/i18n/config";

/** Public URL of a page in a given language, e.g. `https://site/services?lang=fr`. */
export function localeUrl(locale: Locale, path = "/") {
  return `${siteConfig.url}${localePath(locale, path)}`;
}

interface PageMeta {
  title: string;
  description: string;
  /** Social-card text; defaults to the description. */
  ogDescription?: string;
}

/** Full metadata for one page: title, canonical + hreflang for every language, social cards. */
export function buildPageMetadata(locale: Locale, meta: PageMeta, path = "/"): Metadata {
  const ogDescription = meta.ogDescription ?? meta.description;

  return {
    metadataBase: new URL(siteConfig.url),
    title: meta.title,
    description: meta.description,
    applicationName: siteConfig.name,
    authors: [{ name: siteConfig.legalName }],
    alternates: {
      canonical: localeUrl(locale, path),
      languages: {
        ...Object.fromEntries(locales.map((code) => [code, localeUrl(code, path)])),
        // Without `?lang=` the visitor is redirected to their own language.
        "x-default": `${siteConfig.url}${path}`,
      },
    },
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      title: meta.title,
      description: ogDescription,
      url: localeUrl(locale, path),
      locale: localeMeta[locale].ogLocale,
      images: [{ url: siteConfig.assets.heroPoster, width: 1344, height: 768 }],
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: ogDescription,
      images: [siteConfig.assets.heroPoster],
    },
    icons: {
      icon: [
        { url: siteConfig.assets.favicon, type: "image/svg+xml" },
        { url: siteConfig.assets.appIcon, type: "image/png" },
      ],
      apple: siteConfig.assets.appIcon,
    },
    appleWebApp: {
      capable: true,
      title: siteConfig.shortName,
      statusBarStyle: "black-translucent",
    },
  };
}
