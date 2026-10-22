import { Reveal } from "@/components/motion/reveal";
import { Eyebrow } from "@/components/ui/eyebrow";
import { SERVICE_TYPES } from "@/domain/booking";
import type { Dictionary } from "@/i18n/get-dictionary";

export function ServicesSection({ services }: { services: Dictionary["services"] }) {
  return (
    <section id="services" className="section-band bg-background">
      <div className="site-shell">
        <Reveal className="grid items-end gap-8 border-b border-border pb-10 md:grid-cols-[1.2fr_0.8fr]">
          <div>
            <Eyebrow>{services.eyebrow}</Eyebrow>
            <h2 className="section-title">{services.title}</h2>
          </div>
          <p className="max-w-lg leading-7 text-muted-foreground">{services.intro}</p>
        </Reveal>

        <Reveal
          stagger
          className="mt-12 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2"
        >
          {SERVICE_TYPES.map((type, index) => {
            const item = services.items[type];
            return (
              <article
                key={type}
                className="bg-background p-8 transition-colors duration-300 hover:bg-secondary"
              >
                <p className="mono-label">
                  {String(index + 1).padStart(2, "0")} · {item.label}
                </p>
                <h3 className="card-title">{item.title}</h3>
                <p className="body-muted">{item.copy}</p>
              </article>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
