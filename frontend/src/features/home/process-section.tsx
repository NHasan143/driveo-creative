import { Reveal } from "@/components/motion/reveal";
import { ArrowLink } from "@/components/ui/arrow-link";
import { Eyebrow } from "@/components/ui/eyebrow";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";

interface ProcessSectionProps {
  locale: Locale;
  process: Dictionary["process"];
  /** Label of the link to the full Process page. */
  more: string;
}

export function ProcessSection({ locale, process, more }: ProcessSectionProps) {
  return (
    <section id="process" className="section-band bg-secondary">
      <div className="site-shell">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow>{process.eyebrow}</Eyebrow>
            <h2 className="section-title">{process.title}</h2>
          </div>
          <ArrowLink href={localePath(locale, "/process")}>{more}</ArrowLink>
        </Reveal>

        <Reveal stagger className="mt-16 grid gap-12 md:grid-cols-3">
          {process.items.map((step, index) => (
            <article key={step.title}>
              <span className="font-display text-[4.5rem] text-primary/45">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="card-title">{step.title}</h3>
              <p className="body-muted">{step.copy}</p>
            </article>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
