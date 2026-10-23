import { Reveal } from "@/components/motion/reveal";
import { Eyebrow } from "@/components/ui/eyebrow";
import type { Dictionary } from "@/i18n/get-dictionary";

interface AssuranceSectionProps {
  items: Dictionary["assurance"];
  /** Optional heading; the home page shows the strip without one. */
  heading?: { eyebrow: string; title: string };
}

export function AssuranceSection({ items, heading }: AssuranceSectionProps) {
  const Title = heading ? "h3" : "h2";

  return (
    <section id="assurance" className={heading ? "section-band bg-secondary" : "bg-secondary"}>
      <div className="site-shell">
        {heading && (
          <Reveal className="mb-12">
            <Eyebrow>{heading.eyebrow}</Eyebrow>
            <h2 className="section-title">{heading.title}</h2>
          </Reveal>
        )}
        <Reveal stagger className={`grid gap-8 sm:grid-cols-2 lg:grid-cols-4 ${heading ? "" : "py-14"}`}>
          {items.map((item, index) => (
            <article key={item.title} className="border-s border-primary/40 ps-5">
              <p className="mono-label">{String(index + 1).padStart(2, "0")}</p>
              <Title className="mt-3 font-display text-2xl">{item.title}</Title>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.copy}</p>
            </article>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
