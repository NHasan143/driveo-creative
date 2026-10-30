import { Reveal } from "@/components/motion/reveal";
import { ArrowLink } from "@/components/ui/arrow-link";
import { Eyebrow } from "@/components/ui/eyebrow";
import { siteConfig } from "@/config/site";
import { CITIES } from "@/domain/booking";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { SiteCity } from "@/lib/content/site-services";
import styles from "./cities-section.module.css";

interface CitiesSectionProps {
  locale: Locale;
  cities: Dictionary["cities"];
  /** Label of the link to the full Cities page. */
  more: string;
  siteCities?: SiteCity[];
}

export function CitiesSection({ locale, cities, more, siteCities }: CitiesSectionProps) {
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
          <ArrowLink href={localePath(locale, "/cities")} className="mt-6">
            {more}
          </ArrowLink>
        </Reveal>

        <Reveal stagger className={styles.grid}>
          {siteCities && siteCities.length > 0
            ? siteCities.map((c, index) => {
                const name = c.name || (c.cityKey ? cities.names[c.cityKey] : c.id);
                return (
                  <article key={c.id} className={styles.city}>
                    <span className="mono-label">{String(index + 1).padStart(2, "0")}</span>
                    <h3>{name}</h3>
                    <p className="mono-label">{siteConfig.shortName}</p>
                  </article>
                );
              })
            : CITIES.map((city, index) => (
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
