import type { Metadata } from "next";
import { PageHero } from "@/components/page/page-hero";
import { AssuranceSection } from "@/features/home/assurance-section";
import { QuoteSection } from "@/features/quote";
import { ServiceDetails } from "@/features/services/service-details";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { buildPageMetadata } from "@/lib/seo/metadata";

const PATH = "/services";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const { pages } = await getDictionary(locale);
  return buildPageMetadata(locale, pages.services.meta, PATH);
}

export default async function ServicesPage() {
  const locale = await getLocale();
  const t = await getDictionary(locale);
  const page = t.pages.services;

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <PageHero
        locale={locale}
        crumbs={{ home: t.pages.breadcrumbHome, trail: [{ label: t.nav.services }] }}
        eyebrow={page.eyebrow}
        title={page.title}
        intro={page.intro}
        image={{ src: "/media/london-thames-night.jpg", alt: "" }}
        cta={t.hero.cta}
        whatsappLabel={t.hero.whatsapp}
      />
      <ServiceDetails
        locale={locale}
        services={t.services}
        page={page}
        viewDetails={t.pages.serviceDetail.viewDetails}
      />
      <AssuranceSection
        items={t.assurance}
        heading={{ eyebrow: page.standardEyebrow, title: page.standardTitle }}
      />
      <QuoteSection locale={locale} quote={t.quote} cityNames={t.cities.names} />
    </main>
  );
}
