import { Reveal } from "@/components/motion/reveal";
import { CheckList } from "@/components/ui/check-list";
import { SERVICE_TYPES } from "@/domain/booking";
import { RequestQuoteButton } from "@/features/quote";
import type { Dictionary } from "@/i18n/get-dictionary";

interface ServiceDetailsProps {
  services: Dictionary["services"];
  page: Dictionary["pages"]["services"];
}

/** One row per service: name on one side, description, inclusions and quote action on the other. */
export function ServiceDetails({ services, page }: ServiceDetailsProps) {
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
                <RequestQuoteButton preset={{ service: type }} className="mt-9">
                  {page.quoteCta}
                </RequestQuoteButton>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
