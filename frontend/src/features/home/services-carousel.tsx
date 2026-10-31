"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef, type ReactNode } from "react";
import { localePath, type Locale } from "@/i18n/config";
import { isRemoteImage } from "@/lib/remote-image";

export interface CarouselService {
  slug: string;
  path: string;
  label: string;
  title: string;
  summary: string;
  image: string;
  /** Rendered "From €X" line, prepared on the server. */
  price: ReactNode;
}

interface ServicesCarouselProps {
  locale: Locale;
  title: string;
  intro: string;
  services: CarouselService[];
  labels: { learnMore: string; previous: string; next: string };
}

/** A tinted band: one large heading, then the services as a sideways-scrolling row of photo cards. */
export function ServicesCarousel({ locale, title, intro, services, labels }: ServicesCarouselProps) {
  const trackRef = useRef<HTMLUListElement>(null);

  function scroll(direction: 1 | -1) {
    const track = trackRef.current;
    const card = track?.querySelector("li");
    if (!track || !card) return;
    // Right-to-left layouts scroll the other way.
    const rtl = getComputedStyle(track).direction === "rtl";
    track.scrollBy({ left: direction * (rtl ? -1 : 1) * (card.clientWidth + 24), behavior: "smooth" });
  }

  const arrow =
    "grid size-11 place-items-center rounded-full border border-input text-foreground transition-colors hover:border-primary hover:text-primary";

  return (
    <section id="services" className="bg-secondary py-24 sm:py-32">
      <div className="site-shell text-center">
        <h2 className="mx-auto max-w-3xl font-display text-[clamp(2.4rem,5vw,4.2rem)] leading-[1.05] font-medium text-balance">
          {title}
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted-foreground">{intro}</p>
      </div>

      <ul
        ref={trackRef}
        className="site-shell mt-14 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {services.map((service) => (
          <li key={service.slug} className="w-[85%] shrink-0 snap-start sm:w-[calc(50%-0.75rem)]">
            <article className="flex h-full flex-col">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
                <Image
                  src={service.image}
                  alt=""
                  fill
                  sizes="(min-width: 640px) 50vw, 85vw"
                  className="object-cover transition-transform duration-700 hover:scale-[1.03]"
                  unoptimized={isRemoteImage(service.image)}
                />
              </div>
              <p className="mt-6 text-sm text-muted-foreground">{service.label}</p>
              <h3 className="mt-1 font-display text-2xl font-medium sm:text-3xl">{service.title}</h3>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">{service.summary}</p>
              {service.price}
              <Link
                href={localePath(locale, service.path)}
                className="mt-5 inline-flex w-fit items-center rounded-full border border-input px-5 py-2 text-sm font-semibold transition-colors hover:border-primary hover:text-primary"
              >
                {labels.learnMore}
              </Link>
            </article>
          </li>
        ))}
      </ul>

      {services.length > 2 && (
        <div className="site-shell mt-8 flex justify-center gap-3">
          <button type="button" className={arrow} aria-label={labels.previous} onClick={() => scroll(-1)}>
            <ArrowLeft aria-hidden="true" className="size-4 rtl:-scale-x-100" />
          </button>
          <button type="button" className={arrow} aria-label={labels.next} onClick={() => scroll(1)}>
            <ArrowRight aria-hidden="true" className="size-4 rtl:-scale-x-100" />
          </button>
        </div>
      )}
    </section>
  );
}
