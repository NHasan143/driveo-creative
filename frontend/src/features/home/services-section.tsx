import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/page/section-heading";
import { ArrowLink } from "@/components/ui/arrow-link";
import { FromPrice } from "@/components/ui/from-price";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { SiteService } from "@/lib/content/site-services";

interface ServicesSectionProps {
  locale: Locale;
  heading: Pick<Dictionary["services"], "eyebrow" | "title" | "intro">;
  services: SiteService[];
  /** Label of the link to the full Services page. */
  more: string;
  /** Label of each card's link to its service detail page. */
  viewDetails: string;
  pricing: Dictionary["pricing"];
}

export function ServicesSection({ locale, heading, services, more, viewDetails, pricing }: ServicesSectionProps) {
  return (
    <section id="services" className="section-band bg-background">
      <div className="site-shell">
        <SectionHeading
          eyebrow={heading.eyebrow}
          title={heading.title}
          intro={heading.intro}
          action={<ArrowLink href={localePath(locale, "/services")}>{more}</ArrowLink>}
        />

        <Reveal
          stagger
          className="mt-12 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2"
        >
          {services.map((item, index) => {
            return (
              <article
                key={item.slug}
                className="bg-background p-8 transition-colors duration-300 hover:bg-secondary"
              >
                <p className="mono-label">
                  {String(index + 1).padStart(2, "0")} · {item.label}
                </p>
                <h3 className="card-title">{item.title}</h3>
                <p className="body-muted">{item.summary}</p>
                <FromPrice amount={item.fromPrice} unit={item.priceUnit} locale={locale} labels={pricing} className="mt-4" />
                <ArrowLink href={localePath(locale, item.path)} className="mt-6">
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
