import type { Metadata } from "next";
import { AppSection } from "@/components/site/app-section";
import { CitiesStrip } from "@/components/site/cities-strip";
import { ReviewsSection } from "@/components/site/reviews-section";
import { servicePath } from "@/config/services";
import { AdvantageSection } from "@/features/home/advantage-section";
import { ExperienceSection } from "@/features/home/experience-section";
import { HeroSection } from "@/features/home/hero-section";
import { ServicesShowcase } from "@/features/home/services-showcase";
import { WhySection } from "@/features/home/why-section";
import { localePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
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
  const { home, reviews } = t.site;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <LocalBusinessJsonLd locale={locale} description={t.meta.description} cityNames={t.cities.names} />
      <HeroSection locale={locale} hero={home.hero} bookingBar={t.site.bookingBar} />
      <CitiesStrip label={t.site.cities.label} cityNames={t.cities.names} />
      <WhySection copy={home.why} />
      <ServicesShowcase
        copy={home.services}
        hrefs={[
          localePath(locale, servicePath("airport_transfer")),
          localePath(locale, servicePath("hourly_hire")),
          localePath(locale, "/business"),
        ]}
      />
      <ExperienceSection copy={home.experience} />
      <AdvantageSection copy={home.advantage} />
      <ReviewsSection {...reviews} labels={t.site.carousel} />
      <AppSection copy={t.site.app} install={t.install} />
    </main>
  );
}
