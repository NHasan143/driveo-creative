import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { localePath, type Locale } from "@/i18n/config";
import type { SiteService } from "@/lib/content/site-services";
import { isRemoteImage } from "@/lib/remote-image";

interface ServiceCardsProps {
  locale: Locale;
  services: SiteService[];
  learnMore: string;
  /** "From €X" per service slug. */
  prices?: Record<string, ReactNode>;
}

/** Photo cards linking to service pages. */
export function ServiceCards({ locale, services, learnMore, prices }: ServiceCardsProps) {
  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((service) => (
        <li key={service.slug}>
          <Link href={localePath(locale, service.path)} className="group flex h-full flex-col">
            <span className="relative block aspect-[4/3] overflow-hidden rounded-3xl bg-muted">
              <Image
                src={service.heroImage}
                alt=""
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                unoptimized={isRemoteImage(service.heroImage)}
              />
            </span>
            <span className="mt-5 text-sm text-muted-foreground">{service.label}</span>
            <span className="mt-1 font-display text-2xl font-medium">{service.title}</span>
            <span className="mt-2 text-sm leading-6 text-muted-foreground">{service.summary}</span>
            {prices?.[service.slug]}
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
              {learnMore}
              <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1" />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
