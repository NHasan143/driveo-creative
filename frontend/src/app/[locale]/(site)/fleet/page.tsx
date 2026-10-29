import type { Metadata } from "next";
import { PageHero } from "@/components/page/page-hero";
import { FleetComparison } from "@/features/fleet/fleet-comparison";
import { FleetShowcase } from "@/features/fleet/fleet-showcase";
import { BookingSection } from "@/features/booking";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { buildPageMetadata } from "@/lib/seo/metadata";

const PATH = "/fleet";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const { pages } = await getDictionary(locale);
  return buildPageMetadata(locale, pages.fleet.meta, PATH);
}

export default async function FleetPage() {
  const locale = await getLocale();
  const t = await getDictionary(locale);
  const page = t.pages.fleet;

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <PageHero
        locale={locale}
        crumbs={{ home: t.pages.breadcrumbHome, trail: [{ label: t.nav.fleet }] }}
        eyebrow={page.eyebrow}
        title={page.title}
        intro={page.intro}
        image={{ src: "/media/fleet-first-2026-front.jpg", alt: "" }}
        cta={t.hero.cta}
        whatsappLabel={t.hero.whatsapp}
      />
      <FleetShowcase fleet={t.fleet} page={page} />
      <FleetComparison fleet={t.fleet} page={page} />
      <BookingSection locale={locale} booking={t.booking} cityNames={t.cities.names} />
    </main>
  );
}
