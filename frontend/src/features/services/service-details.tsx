import { Reveal } from "@/components/motion/reveal";
import { ArrowLink } from "@/components/ui/arrow-link";
import { CheckList } from "@/components/ui/check-list";
import { servicePath } from "@/config/services";
import { SERVICE_TYPES } from "@/domain/booking";
import { RequestQuoteButton } from "@/features/quote";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";

interface ServiceDetailsProps {
  locale: Locale;
  services: Dictionary["services"];
  page: Dictionary["pages"]["services"];
  viewDetails: string;
}

/** One row per service: name on one side, description, inclusions and actions on the other. */
export function ServiceDetails({ locale, services, page, viewDetails }: ServiceDetailsProps) {
  return (
    <section className="section-band bg-background">
      <div className="site-shell">
        {SERVICE_TYPES.map((type, index) => {
          const item = services.items[type];
          return (
            <Reveal
              key={type}
              as="article"
              id={type}
              className="grid gap-8 border-t border-border py-14 first:border-t-0 first:pt-0 last:pb-0 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16"
            >
              <div>
                <p className="mono-label">
                  {String(index + 1).padStart(2, "0")} · {item.label}
                </p>
                <h2 className="mt-4 font-display text-[clamp(2.3rem,4.5vw,3.6rem)] leading-none font-medium">
                  {item.title}
                </h2>
              </div>

              <div>
                <p className="max-w-xl text-lg leading-8 text-muted-foreground">{item.copy}</p>
                <p className="mono-label mt-8 mb-4">{page.includedLabel}</p>
                <CheckList items={page.included[type]} className="sm:grid-cols-2 sm:gap-x-8" />
                <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
                  <RequestQuoteButton preset={{ service: type }}>{page.quoteCta}</RequestQuoteButton>
                  <ArrowLink href={localePath(locale, servicePath(type))}>{viewDetails}</ArrowLink>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
