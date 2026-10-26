import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/page/section-heading";
import type { SiteService } from "@/lib/content/site-services";

interface ServiceStepsProps {
  eyebrow: string;
  title: string;
  steps: SiteService["steps"];
}

/** Service-specific booking steps (usually three), styled like the home "How it works" band. */
export function ServiceSteps({ eyebrow, title, steps }: ServiceStepsProps) {
  return (
    <section className="section-band bg-secondary">
      <div className="site-shell">
        <SectionHeading eyebrow={eyebrow} title={title} />
        <Reveal stagger as="ol" className="mt-14 grid gap-12 md:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step.title} className="border-t border-primary/40 pt-6">
              <span className="font-display text-[4.5rem] leading-none text-primary/45">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="card-title">{step.title}</h3>
              <p className="body-muted">{step.copy}</p>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
