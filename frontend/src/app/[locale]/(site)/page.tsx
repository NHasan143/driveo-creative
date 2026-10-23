import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { FleetSection } from "@/features/fleet/fleet-section";
import { AssuranceSection } from "@/features/home/assurance-section";
import { CitiesSection } from "@/features/home/cities-section";
import { HeroSection } from "@/features/home/hero/hero-section";
import { ProcessSection } from "@/features/home/process-section";
import { ServicesSection } from "@/features/home/services-section";
import { TestimonialSection } from "@/features/home/testimonial-section";
import { QuoteSection, QuoteVehicleProvider } from "@/features/quote";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { LocalBusinessJsonLd } from "@/lib/seo/json-ld";

export default async function HomePage() {
  const locale = await getLocale();
  const t = await getDictionary(locale);

  return (
    <QuoteVehicleProvider>
      <LocalBusinessJsonLd locale={locale} description={t.meta.description} cityNames={t.cities.names} />
      <SiteHeader locale={locale} nav={t.nav} />
      <main className="min-h-screen overflow-hidden bg-background text-foreground">
        <HeroSection hero={t.hero} cityNames={t.cities.names} />
        <AssuranceSection items={t.assurance} />
        <ServicesSection services={t.services} />
        <FleetSection fleet={t.fleet} />
        <CitiesSection cities={t.cities} />
        <ProcessSection process={t.process} />
        <QuoteSection locale={locale} quote={t.quote} cityNames={t.cities.names} />
        <TestimonialSection testimonial={t.testimonial} />
      </main>
      <SiteFooter footer={t.footer} install={t.install} cityNames={t.cities.names} />
    </QuoteVehicleProvider>
  );
}
