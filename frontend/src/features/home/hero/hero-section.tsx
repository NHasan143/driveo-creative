import { siteConfig } from "@/config/site";
import { BookingBar } from "@/features/booking";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { HeroVideo } from "./hero-video";

interface HeroSectionProps {
  locale: Locale;
  hero: Dictionary["hero"];
  bookingBar: Dictionary["bookingBar"];
  hoursUnit: string;
  cityNames: Dictionary["cities"]["names"];
}

/** Full-bleed film, one headline and the booking bar: the first thing every visitor can act on. */
export function HeroSection({ locale, hero, bookingBar, hoursUnit, cityNames }: HeroSectionProps) {
  return (
    <section id="top" className="relative isolate flex min-h-[100svh] items-end overflow-hidden">
      <HeroVideo
        className="absolute inset-0 -z-20 size-full object-cover"
        sources={siteConfig.assets.heroVideos}
        poster={siteConfig.assets.heroPoster}
        label={hero.videoAlt}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,color-mix(in_oklab,var(--background)_55%,transparent)_0%,transparent_30%,color-mix(in_oklab,var(--background)_45%,transparent)_60%,var(--background)_100%)]"
      />

      <div className="site-shell pt-32 pb-12 sm:pb-16">
        <h1 className="animate-rise mx-auto max-w-4xl text-center font-display text-[clamp(2.6rem,6.5vw,5.6rem)] leading-[1.02] font-medium text-balance">
          {hero.titleLine2} <em className="text-primary">{hero.titleEm}</em>
        </h1>
        <p className="animate-rise-delay mx-auto mt-5 max-w-2xl text-center text-base leading-7 text-foreground/80 sm:text-lg">
          {hero.sub}
        </p>
        <BookingBar
          locale={locale}
          labels={bookingBar}
          hoursUnit={hoursUnit}
          cityNames={cityNames}
          className="mx-auto mt-10 max-w-6xl"
        />
      </div>
    </section>
  );
}
