import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { serviceIcons } from "@/components/icons/service-icons";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/page/section-heading";
import { servicePath } from "@/config/services";
import { SERVICE_TYPES, type ServiceType } from "@/domain/booking";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";

interface OtherServicesProps {
  locale: Locale;
  current: ServiceType;
  services: Dictionary["services"]["items"];
  heading: { eyebrow: string; title: string; viewDetails: string };
}

/** Cross-links to the remaining three service pages. */
export function OtherServices({ locale, current, services, heading }: OtherServicesProps) {
  const others = SERVICE_TYPES.filter((type) => type !== current);

  return (
    <section className="section-band bg-secondary">
      <div className="site-shell">
        <SectionHeading eyebrow={heading.eyebrow} title={heading.title} />
        <Reveal
          stagger
          className="mt-12 grid gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-3"
        >
          {others.map((type) => {
            const item = services[type];
            const Icon = serviceIcons[type];
            return (
              <Link
                key={type}
                href={localePath(locale, servicePath(type))}
                className="group flex flex-col bg-background p-8 transition-colors duration-300 hover:bg-secondary"
              >
                <span className="grid size-11 place-items-center rounded-full border border-primary/45 text-primary">
                  <Icon aria-hidden="true" className="size-4" strokeWidth={1.5} />
                </span>
                <p className="mono-label mt-6">{item.label}</p>
                <h3 className="card-title mt-2">{item.title}</h3>
                <p className="body-muted flex-1">{item.copy}</p>
                <span className="mt-7 inline-flex items-center gap-2 font-mono text-[0.65rem] font-bold tracking-[0.2em] text-accent uppercase">
                  {heading.viewDetails}
                  <ArrowRight
                    aria-hidden="true"
                    className="size-3.5 transition-transform group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1"
                  />
                </span>
              </Link>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
