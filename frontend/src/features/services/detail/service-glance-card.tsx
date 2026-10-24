import { serviceIcons } from "@/components/icons/service-icons";
import type { ServiceType } from "@/domain/booking";
import { RequestQuoteButton } from "@/features/quote";
import type { Dictionary } from "@/i18n/get-dictionary";

interface ServiceGlanceCardProps {
  type: ServiceType;
  label: string;
  facts: Dictionary["pages"]["serviceDetail"]["items"][ServiceType]["facts"];
  heading: string;
  cta: string;
}

/** Frosted summary card floated in the hero: three key facts and a quote action. */
export function ServiceGlanceCard({ type, label, facts, heading, cta }: ServiceGlanceCardProps) {
  const Icon = serviceIcons[type];

  return (
    <aside className="w-full rounded-xl border border-primary/30 bg-background/55 p-6 shadow-[0_30px_80px_color-mix(in_oklab,var(--background)_70%,transparent)] backdrop-blur-xl sm:w-80">
      <div className="flex items-center justify-between gap-4">
        <p className="mono-label">{heading}</p>
        <span className="grid size-10 place-items-center rounded-full border border-primary/45 text-primary">
          <Icon aria-hidden="true" className="size-4" strokeWidth={1.5} />
        </span>
      </div>
      <p className="mt-3 font-display text-2xl">{label}</p>

      <dl className="mt-6 grid gap-4 border-t border-border pt-5">
        {facts.slice(0, 3).map((fact) => (
          <div key={fact.label} className="flex items-baseline justify-between gap-4">
            <dt className="text-sm text-muted-foreground">{fact.label}</dt>
            <dd className="shrink-0 font-mono text-sm font-bold text-primary">{fact.value}</dd>
          </div>
        ))}
      </dl>

      <RequestQuoteButton preset={{ service: type }} className="mt-6 w-full">
        {cta}
      </RequestQuoteButton>
    </aside>
  );
}
