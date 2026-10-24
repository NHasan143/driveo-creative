import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/page/section-heading";
import { ArrowLink } from "@/components/ui/arrow-link";
import { servicePath } from "@/config/services";
import { SERVICE_TYPES } from "@/domain/booking";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";

interface ServicesSectionProps {
  locale: Locale;
  services: Dictionary["services"];
  /** Label of the link to the full Services page. */
  more: string;
  /** Label of each card's link to its service detail page. */
  viewDetails: string;
}

export function ServicesSection({ locale, services, more, viewDetails }: ServicesSectionProps) {
  return (
    <section id="services" className="section-band bg-background">
      <div className="site-shell">
        <SectionHeading
          eyebrow={services.eyebrow}
          title={services.title}
          intro={services.intro}
          action={<ArrowLink href={localePath(locale, "/services")}>{more}</ArrowLink>}
        />

        <Reveal
          stagger
          className="mt-12 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2"
        >
          {SERVICE_TYPES.map((type, index) => {
            const item = services.items[type];
            return (
              <article
                key={type}
                className="bg-background p-8 transition-colors duration-300 hover:bg-secondary"
              >
                <p className="mono-label">
                  {String(index + 1).padStart(2, "0")} · {item.label}
                </p>
                <h3 className="card-title">{item.title}</h3>
                <p className="body-muted">{item.copy}</p>
                <ArrowLink href={localePath(locale, servicePath(type))} className="mt-6">
                  {viewDetails}
                </ArrowLink>
              </article>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
