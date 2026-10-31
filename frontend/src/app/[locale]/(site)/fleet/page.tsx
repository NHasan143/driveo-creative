import type { Metadata } from "next";
import { BookCta } from "@/components/page/book-cta";
import { PageBanner } from "@/components/page/page-banner";
import { PageSection } from "@/components/page/page-section";
import { VehicleClasses } from "@/components/page/vehicle-classes";
import { BookingBar } from "@/features/booking";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { getSiteFleet } from "@/lib/content/site-services";
import { buildPageMetadata } from "@/lib/seo/metadata";

const PATH = "/fleet";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const { pages } = await getDictionary(locale);
  return buildPageMetadata(locale, pages.fleet.meta, PATH);
}

export default async function FleetPage() {
  const locale = await getLocale();
  const [t, fleet] = await Promise.all([getDictionary(locale), getSiteFleet(locale)]);
  const page = t.pages.fleet;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <PageBanner
        locale={locale}
        title={page.title}
        intro={page.intro}
        image="/media/fleet-first-2026-front.jpg"
        explore={t.servicePage.explore}
        crumbs={[{ label: t.pages.breadcrumbHome, path: "/" }, { label: t.nav.fleet }]}
      >
        <BookingBar locale={locale} labels={t.bookingBar} hoursUnit={t.booking.hoursUnit} cityNames={t.cities.names} />
      </PageBanner>

      <div id="content" className="scroll-mt-24">
        <PageSection title={t.fleet.title}>
          <VehicleClasses
            locale={locale}
            vehicles={fleet}
            showFeatures
            labels={{ upToPassengers: t.bookFlow.upToPassengers, upToLuggage: t.bookFlow.upToLuggage, book: t.fleet.button }}
          />
        </PageSection>

        <PageSection title={page.compareTitle} tone="tinted">
          <div className="overflow-x-auto rounded-3xl border border-border">
            <table className="w-full min-w-[36rem] border-collapse text-start text-sm">
              <thead>
                <tr className="border-b border-border bg-background/60">
                  {[page.compareClass, page.compareVehicle, page.passengers, page.luggage].map((column) => (
                    <th key={column} scope="col" className="px-6 py-4 text-start font-semibold">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fleet.map((vehicle) => (
                  <tr key={vehicle.id} className="border-b border-border last:border-b-0">
                    <th scope="row" className="px-6 py-4 text-start font-display text-lg font-medium">
                      {vehicle.name}
                    </th>
                    <td className="px-6 py-4 text-muted-foreground">{vehicle.model}</td>
                    <td className="px-6 py-4">
                      {page.upTo} {vehicle.passengers}
                    </td>
                    <td className="px-6 py-4">
                      {page.upTo} {vehicle.luggage}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PageSection>

        <BookCta locale={locale} title={t.booking.title} intro={t.booking.intro} cta={t.nav.book} />
      </div>
    </main>
  );
}
