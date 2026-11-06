import type { Metadata } from "next";
import { BookCta } from "@/components/page/book-cta";
import { CityCards } from "@/components/page/city-cards";
import { FeatureCards } from "@/components/page/feature-cards";
import { PageBanner } from "@/components/page/page-banner";
import { PageSection } from "@/components/page/page-section";
import { BookingBar } from "@/features/booking";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { getSiteCities, getSiteServices } from "@/lib/content/site-services";
import { buildPageMetadata } from "@/lib/seo/metadata";

const PATH = "/cities";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const { pages } = await getDictionary(locale);
  return buildPageMetadata(locale, pages.cities.meta, PATH);
}

export default async function CitiesPage() {
  const locale = await getLocale();
  const [t, cities, services] = await Promise.all([getDictionary(locale), getSiteCities(locale), getSiteServices(locale)]);
  const page = t.pages.cities;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <PageBanner
        locale={locale}
        title={page.title}
        intro={page.intro}
        image="/media/london-thames-night.jpg"
        explore={t.servicePage.explore}
        crumbs={[{ label: t.pages.breadcrumbHome, path: "/" }, { label: t.nav.cities }]}
      >
        <BookingBar locale={locale} labels={t.bookingBar} hoursUnit={t.booking.hoursUnit} cityNames={t.cities.names} />
      </PageBanner>

      <div id="content" className="scroll-mt-24">
        <PageSection title={t.cities.titleLine1} intro={t.cities.copy}>
          <CityCards
            locale={locale}
            cities={cities}
            serviceNames={Object.fromEntries(services.map((service) => [service.id, service.title]))}
            labels={{ services: page.servicesLabel, book: page.bookCta }}
          />
        </PageSection>

        <PageSection title={page.standardTitle} tone="tinted">
          <FeatureCards items={t.assurance} columns={4} />
        </PageSection>

        <BookCta locale={locale} title={t.booking.title} intro={t.booking.intro} cta={t.nav.book} />
      </div>
    </main>
  );
}
