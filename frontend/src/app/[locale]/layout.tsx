import type { Metadata, Viewport } from "next";
import { siteConfig } from "@/config/site";
import { localeMeta, locales } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { fontVariables } from "../fonts";
import "@/styles/globals.css";

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  return buildPageMetadata(locale, dictionary.meta);
}

export const viewport: Viewport = {
  themeColor: siteConfig.themeColor,
  colorScheme: "dark",
};

export default async function LocaleLayout({ children }: LayoutProps<"/[locale]">) {
  const locale = await getLocale();

  return (
    <html lang={locale} dir={localeMeta[locale].dir} className={fontVariables}>
      <body>{children}</body>
    </html>
  );
}
