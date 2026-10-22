import { Reveal } from "@/components/motion/reveal";
import type { Dictionary } from "@/i18n/get-dictionary";

export function AssuranceSection({ items }: { items: Dictionary["assurance"] }) {
  return (
    <section id="assurance" className="bg-secondary">
      <Reveal stagger className="site-shell grid gap-8 py-14 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item, index) => (
          <article key={item.title} className="border-s border-primary/40 ps-5">
            <p className="mono-label">{String(index + 1).padStart(2, "0")}</p>
            <h2 className="mt-3 font-display text-2xl">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.copy}</p>
          </article>
        ))}
      </Reveal>
    </section>
  );
}
