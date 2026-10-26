import type { Metadata } from "next";
import { FleetSection } from "@/features/fleet/fleet-section";
import { AssuranceSection } from "@/features/home/assurance-section";
import { CitiesSection } from "@/features/home/cities-section";
import { HeroSection } from "@/features/home/hero/hero-section";
import { ProcessSection } from "@/features/home/process-section";
import { ServicesSection } from "@/features/home/services-section";
import { TestimonialSection } from "@/features/home/testimonial-section";
import { QuoteSection } from "@/features/quote";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { getSiteServices } from "@/lib/content/site-services";
import { LocalBusinessJsonLd } from "@/lib/seo/json-ld";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const { meta } = await getDictionary(locale);
  return buildPageMetadata(locale, meta);
}

export default async function HomePage() {
  const locale = await getLocale();
  const t = await getDictionary(locale);
  const services = await getSiteServices(locale);

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <LocalBusinessJsonLd locale={locale} description={t.meta.description} cityNames={t.cities.names} />
      <HeroSection hero={t.hero} cityNames={t.cities.names} />
      <AssuranceSection items={t.assurance} />
      <ServicesSection
        locale={locale}
        heading={t.services}
        services={services}
        more={t.pages.links.services}
        viewDetails={t.pages.serviceDetail.viewDetails}
      />
      <FleetSection locale={locale} fleet={t.fleet} more={t.pages.links.fleet} />
      <CitiesSection locale={locale} cities={t.cities} more={t.pages.links.cities} />
      <ProcessSection locale={locale} process={t.process} more={t.pages.links.process} />
      <QuoteSection locale={locale} quote={t.quote} cityNames={t.cities.names} />
      <TestimonialSection testimonial={t.testimonial} />
    </main>
  );
}
