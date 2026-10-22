import { siteConfig } from "@/config/site";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { localeUrl } from "./metadata";

export function LocalBusinessJsonLd({
  locale,
  description,
  cityNames,
}: {
  locale: Locale;
  description: string;
  cityNames: Dictionary["cities"]["names"];
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${siteConfig.url}/#business`,
    name: siteConfig.legalName,
    description,
    url: localeUrl(locale),
    image: `${siteConfig.url}${siteConfig.assets.heroPoster}`,
    logo: `${siteConfig.url}${siteConfig.assets.logo}`,
    telephone: siteConfig.contact.phone,
    email: siteConfig.contact.email,
    priceRange: "$$$",
    areaServed: Object.values(cityNames),
    sameAs: Object.values(siteConfig.social),
  };

  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is safe here: every value comes from our own config.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
