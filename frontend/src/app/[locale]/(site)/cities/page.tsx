import type { Metadata } from "next";
import { PageHero } from "@/components/page/page-hero";
import { CityDirectory } from "@/features/cities/city-directory";
import { AssuranceSection } from "@/features/home/assurance-section";
import { QuoteSection } from "@/features/quote";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { buildPageMetadata } from "@/lib/seo/metadata";

const PATH = "/cities";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const { pages } = await getDictionary(locale);
  return buildPageMetadata(locale, pages.cities.meta, PATH);
}

export default async function CitiesPage() {
  const locale = await getLocale();
  const t = await getDictionary(locale);
  const page = t.pages.cities;

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <PageHero
        locale={locale}
        crumbs={{ home: t.pages.breadcrumbHome, trail: [{ label: t.nav.cities }] }}
        eyebrow={page.eyebrow}
        title={page.title}
        intro={page.intro}
        image={{ src: "/media/paris-hotel-evening.jpg", alt: "" }}
        cta={t.hero.cta}
        whatsappLabel={t.hero.whatsapp}
      />
      <CityDirectory cityNames={t.cities.names} serviceNames={t.quote.serviceOptions} page={page} />
      <AssuranceSection
        items={t.assurance}
        heading={{ eyebrow: page.standardEyebrow, title: page.standardTitle }}
      />
      <QuoteSection locale={locale} quote={t.quote} cityNames={t.cities.names} />
    </main>
  );
}
