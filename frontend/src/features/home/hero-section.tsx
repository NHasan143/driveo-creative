import Image from "next/image";
import { BookingBar } from "@/features/booking";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";

interface HeroSectionProps {
  locale: Locale;
  hero: Dictionary["site"]["home"]["hero"];
  bookingBar: Dictionary["site"]["bookingBar"];
}

/** Full-bleed photograph under the transparent header, the two-tone headline and the booking panel. */
export function HeroSection({ locale, hero, bookingBar }: HeroSectionProps) {
  return (
    <section id="top" className="relative isolate flex min-h-[39rem] items-end overflow-hidden bg-ink xl:min-h-[55.6875rem] xl:bg-[#f4f4f4]">
      {/* Phones: the photo fills the top and fades into ink behind the booking panel. */}
      <div className="absolute inset-x-0 top-0 -z-20 h-[27rem] xl:inset-0 xl:h-auto">
        <Image
          src="/media/site/home/hero.jpg"
          alt={hero.imageAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-[48%_center] xl:object-center"
        />
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 -z-10 h-[27rem] bg-[linear-gradient(180deg,rgba(0,0,0,0.5)_0%,rgba(0,0,0,0)_30%,rgba(25,22,18,0.4)_65%,var(--ink)_100%)] xl:inset-0 xl:h-auto xl:bg-[linear-gradient(180deg,rgba(0,0,0,0.5)_13%,rgba(0,0,0,0)_31%,rgba(0,0,0,0)_64%,rgba(0,0,0,0.5)_84%)]"
      />

      <div className="site-shell relative pt-[calc(var(--header-height)+8.5rem)] pb-5 xl:max-w-[63rem] xl:pt-[calc(var(--header-height)+6rem)] xl:pb-6">
        <div aria-hidden="true" className="hero-glow absolute inset-x-[-5%] top-[30%] -z-10 h-56 xl:top-[40%]" />
        <h1 className="animate-rise text-center font-display text-[2.25rem] leading-none font-medium tracking-[-0.02em] text-balance text-white xl:text-[4.25rem]">
          {hero.lead} <span className="text-orange">{hero.accent}</span>
        </h1>
        <BookingBar locale={locale} labels={bookingBar} className="animate-rise-delay mt-8 xl:mt-14" />
      </div>
    </section>
  );
}
