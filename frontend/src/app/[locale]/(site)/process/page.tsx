import type { Metadata } from "next";
import { PageHero } from "@/components/page/page-hero";
import { AssuranceSection } from "@/features/home/assurance-section";
import { ProcessTimeline } from "@/features/process/process-timeline";
import { RequestChecklist } from "@/features/process/request-checklist";
import { BookingSection } from "@/features/booking";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { buildPageMetadata } from "@/lib/seo/metadata";

const PATH = "/process";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const { pages } = await getDictionary(locale);
  return buildPageMetadata(locale, pages.process.meta, PATH);
}

export default async function ProcessPage() {
  const locale = await getLocale();
  const t = await getDictionary(locale);
  const page = t.pages.process;

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <PageHero
        locale={locale}
        crumbs={{ home: t.pages.breadcrumbHome, trail: [{ label: t.nav.process }] }}
        eyebrow={page.eyebrow}
        title={page.title}
        intro={page.intro}
        image={{ src: "/media/driveo-journey-poster.jpg", alt: "" }}
        cta={t.hero.cta}
        whatsappLabel={t.hero.whatsapp}
      />
      <ProcessTimeline steps={t.process.items} details={page.details} />
      <RequestChecklist page={page} />
      <AssuranceSection
        items={t.assurance}
        heading={{ eyebrow: page.commitmentsEyebrow, title: page.commitmentsTitle }}
      />
      <BookingSection locale={locale} booking={t.booking} cityNames={t.cities.names} />
    </main>
  );
}
