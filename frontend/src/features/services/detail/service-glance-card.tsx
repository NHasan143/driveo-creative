import { serviceIcons } from "@/components/icons/service-icons";
import { FromPrice } from "@/components/ui/from-price";
import { RequestQuoteButton } from "@/features/quote";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { SiteService } from "@/lib/content/site-services";

interface ServiceGlanceCardProps {
  service: SiteService;
  heading: string;
  cta: string;
  locale: Locale;
  pricing: Dictionary["pricing"];
}

/** Frosted summary card floated in the hero: three key facts and a quote action. */
export function ServiceGlanceCard({ service, heading, cta, locale, pricing }: ServiceGlanceCardProps) {
  const Icon = serviceIcons[service.icon];

  return (
    <aside className="w-full rounded-xl border border-primary/30 bg-background/55 p-6 shadow-[0_30px_80px_color-mix(in_oklab,var(--background)_70%,transparent)] backdrop-blur-xl sm:w-80">
      <div className="flex items-center justify-between gap-4">
        <p className="mono-label">{heading}</p>
        <span className="grid size-10 place-items-center rounded-full border border-primary/45 text-primary">
          <Icon aria-hidden="true" className="size-4" strokeWidth={1.5} />
        </span>
      </div>
      <p className="mt-3 font-display text-2xl">{service.title}</p>
      <FromPrice amount={service.fromPrice} unit={service.priceUnit} locale={locale} labels={pricing} className="mt-2" />

      <dl className="mt-6 grid gap-4 border-t border-border pt-5">
        {service.facts.slice(0, 3).map((fact) => (
          <div key={fact.label} className="flex items-baseline justify-between gap-4">
            <dt className="text-sm text-muted-foreground">{fact.label}</dt>
            <dd className="shrink-0 font-mono text-sm font-bold text-primary">{fact.value}</dd>
          </div>
        ))}
      </dl>

      <RequestQuoteButton
        preset={service.bookingType ? { service: service.bookingType } : {}}
        className="mt-6 w-full"
      >
        {cta}
      </RequestQuoteButton>
    </aside>
  );
}
