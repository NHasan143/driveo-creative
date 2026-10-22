import { Reveal } from "@/components/motion/reveal";
import { Eyebrow } from "@/components/ui/eyebrow";
import { siteConfig } from "@/config/site";
import { CITIES } from "@/domain/booking";
import type { Dictionary } from "@/i18n/get-dictionary";
import styles from "./cities-section.module.css";

export function CitiesSection({ cities }: { cities: Dictionary["cities"] }) {
  return (
    <section id="cities" className="section-band bg-background">
      <div className="site-shell grid items-center gap-16 lg:grid-cols-[0.8fr_1.2fr]">
        <Reveal>
          <Eyebrow>{cities.eyebrow}</Eyebrow>
          <h2 className="section-title">
            {cities.titleLine1}
            <br />
            {cities.titleLine2}
          </h2>
          <p className="mt-6 max-w-md leading-7 text-muted-foreground">{cities.copy}</p>
        </Reveal>

        <Reveal stagger className={styles.grid}>
          {CITIES.map((city, index) => (
            <article key={city} className={styles.city}>
              <span className="mono-label">{String(index + 1).padStart(2, "0")}</span>
              <h3>{cities.names[city]}</h3>
              <p className="mono-label">{siteConfig.shortName}</p>
            </article>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
