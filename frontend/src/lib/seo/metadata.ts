import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { defaultLocale, localeMeta, locales, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";

export function localeUrl(locale: Locale, path = "") {
  return `${siteConfig.url}/${locale}${path}`;
}

export function buildPageMetadata(locale: Locale, meta: Dictionary["meta"]): Metadata {
  return {
    metadataBase: new URL(siteConfig.url),
    title: meta.title,
    description: meta.description,
    applicationName: siteConfig.name,
    authors: [{ name: siteConfig.legalName }],
    alternates: {
      canonical: localeUrl(locale),
      languages: {
        ...Object.fromEntries(locales.map((code) => [code, localeUrl(code)])),
        "x-default": localeUrl(defaultLocale),
      },
    },
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      title: meta.title,
      description: meta.ogDescription,
      url: localeUrl(locale),
      locale: localeMeta[locale].ogLocale,
      images: [{ url: siteConfig.assets.heroPoster, width: 1344, height: 768 }],
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.ogDescription,
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
