import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { serviceIcons } from "@/components/icons/service-icons";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/page/section-heading";
import { localePath, type Locale } from "@/i18n/config";
import type { SiteService } from "@/lib/content/site-services";

interface OtherServicesProps {
  locale: Locale;
  /** Every published service except the current one. */
  services: SiteService[];
  heading: { eyebrow: string; title: string; viewDetails: string };
}

/** Cross-links to the other service pages. */
export function OtherServices({ locale, services, heading }: OtherServicesProps) {
  if (services.length === 0) return null;

  return (
    <section className="section-band bg-secondary">
      <div className="site-shell">
        <SectionHeading eyebrow={heading.eyebrow} title={heading.title} />
        <Reveal
          stagger
          className="mt-12 grid gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-3"
        >
          {services.map((item) => {
            const Icon = serviceIcons[item.icon];
            return (
              <Link
                key={item.slug}
                href={localePath(locale, item.path)}
                className="group flex flex-col bg-background p-8 transition-colors duration-300 hover:bg-secondary"
              >
                <span className="grid size-11 place-items-center rounded-full border border-primary/45 text-primary">
                  <Icon aria-hidden="true" className="size-4" strokeWidth={1.5} />
                </span>
                <p className="mono-label mt-6">{item.label}</p>
                <h3 className="card-title mt-2">{item.title}</h3>
                <p className="body-muted flex-1">{item.summary}</p>
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
