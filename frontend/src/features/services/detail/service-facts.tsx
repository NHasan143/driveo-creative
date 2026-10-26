import { Reveal } from "@/components/motion/reveal";
import type { SiteService } from "@/lib/content/site-services";

interface ServiceFactsProps {
  eyebrow: string;
  facts: SiteService["facts"];
}

/** Big-number strip of the service's key facts. */
export function ServiceFacts({ eyebrow, facts }: ServiceFactsProps) {
  return (
    <section aria-label={eyebrow} className="border-b border-border bg-secondary">
      <Reveal stagger className="site-shell grid grid-cols-2 gap-y-10 py-14 lg:grid-cols-4 lg:py-16">
        {facts.map((fact) => (
          <div key={fact.label} className="border-s border-primary/40 ps-5 sm:ps-7">
            <p className="font-display text-[clamp(2.4rem,5vw,4rem)] leading-none font-medium">{fact.value}</p>
            <p className="mono-label mt-3 leading-relaxed">{fact.label}</p>
          </div>
        ))}
      </Reveal>
    </section>
  );
}
