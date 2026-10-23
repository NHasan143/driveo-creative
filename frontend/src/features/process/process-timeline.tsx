import { Reveal } from "@/components/motion/reveal";
import type { Dictionary } from "@/i18n/get-dictionary";

interface ProcessTimelineProps {
  steps: Dictionary["process"]["items"];
  details: Dictionary["pages"]["process"]["details"];
}

/** The three booking steps as a vertical timeline with a copper rule. */
export function ProcessTimeline({ steps, details }: ProcessTimelineProps) {
  return (
    <section className="section-band bg-background">
      <div className="site-shell">
        <ol className="grid max-w-5xl">
          {steps.map((step, index) => (
            <Reveal
              key={step.title}
              as="li"
              className="relative grid gap-6 border-s border-primary/30 ps-8 pb-16 last:pb-0 sm:grid-cols-[9rem_1fr] sm:ps-12"
            >
              <span
                aria-hidden="true"
                className="absolute -start-[0.4rem] top-3 size-3 rounded-full bg-primary shadow-[0_0_18px_var(--primary)]"
              />
              <span className="font-display text-[4.5rem] leading-none text-primary/45">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h2 className="font-display text-[clamp(2rem,4vw,3rem)] leading-none font-medium">
                  {step.title}
                </h2>
                <p className="mt-4 text-lg leading-8">{step.copy}</p>
                <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">{details[index]}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
