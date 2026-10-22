import { Reveal } from "@/components/motion/reveal";
import { Eyebrow } from "@/components/ui/eyebrow";
import type { Dictionary } from "@/i18n/get-dictionary";

export function ProcessSection({ process }: { process: Dictionary["process"] }) {
  return (
    <section id="process" className="section-band bg-secondary">
      <div className="site-shell">
        <Reveal>
          <Eyebrow>{process.eyebrow}</Eyebrow>
          <h2 className="section-title">{process.title}</h2>
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
