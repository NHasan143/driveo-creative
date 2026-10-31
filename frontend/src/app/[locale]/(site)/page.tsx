import type { Metadata } from "next";
import { FromPrice } from "@/components/ui/from-price";
import { AppSection } from "@/features/home/app-section";
import { HeroSection } from "@/features/home/hero/hero-section";
import { ServicesCarousel } from "@/features/home/services-carousel";
import { StandardSection } from "@/features/home/standard-section";
import { StorySection } from "@/features/home/story-section";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { getSiteServices } from "@/lib/content/site-services";
import { LocalBusinessJsonLd } from "@/lib/seo/json-ld";
import { buildPageMetadata } from "@/lib/seo/metadata";

/** Photos for the four assurance points, in the order of `assurance` in the dictionaries. */
const STORY_IMAGES = [
  "/media/driveo-journey-poster.jpg",
  "/media/london-thames-night.jpg",
  "/media/fleet-first-2026-front.jpg",
  "/media/paris-hotel-evening.jpg",
];

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const { meta } = await getDictionary(locale);
  return buildPageMetadata(locale, meta);
}

export default async function HomePage() {
  const locale = await getLocale();
  const [t, services] = await Promise.all([getDictionary(locale), getSiteServices(locale)]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <LocalBusinessJsonLd locale={locale} description={t.meta.description} cityNames={t.cities.names} />
      <HeroSection
        locale={locale}
        hero={t.hero}
        bookingBar={t.bookingBar}
        hoursUnit={t.booking.hoursUnit}
        cityNames={t.cities.names}
      />
      <ServicesCarousel
        locale={locale}
        title={t.services.title}
        intro={t.services.intro}
        labels={t.home}
        services={services.map((service) => ({
          slug: service.slug,
          path: service.path,
          label: service.label,
          title: service.title,
          summary: service.summary,
          image: service.heroImage,
          price: (
            <FromPrice
              amount={service.fromPrice}
              unit={service.priceUnit}
              locale={locale}
              labels={t.pricing}
              className="mt-3"
            />
          ),
        }))}
      />
      <AppSection home={t.home} install={t.install} bookingBar={t.bookingBar} />
      <StorySection
        title={t.home.storyTitle}
        items={t.assurance.map((item, index) => ({ ...item, image: STORY_IMAGES[index % STORY_IMAGES.length] }))}
      />
      <StandardSection
        title={t.pages.services.standardTitle}
        intro={t.meta.ogDescription}
        cities={t.cities}
        fleet={{ title: t.fleet.title, copy: t.pages.fleet.intro }}
        chauffeurs={t.assurance[0]}
      />
    </main>
  );
}
