import { ParallaxSurface } from "@/components/motion/parallax-surface";
import { Reveal } from "@/components/motion/reveal";
import { ArrowLink } from "@/components/ui/arrow-link";
import { Eyebrow } from "@/components/ui/eyebrow";
import { FLEET_VEHICLES } from "@/domain/booking";
import { BookButton } from "@/features/booking";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { FleetFrame } from "./fleet-frame";
import styles from "./fleet-section.module.css";

interface FleetSectionProps {
  locale: Locale;
  fleet: Dictionary["fleet"];
  /** Label of the link to the full Fleet page. */
  more: string;
}

export function FleetSection({ locale, fleet, more }: FleetSectionProps) {
  return (
    <section id="fleet" className="section-band bg-secondary">
      <div className="site-shell">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow>{fleet.eyebrow}</Eyebrow>
            <h2 className="section-title">{fleet.title}</h2>
          </div>
          <ArrowLink href={localePath(locale, "/fleet")}>{more}</ArrowLink>
        </Reveal>

        <Reveal stagger className={styles.grid}>
          {FLEET_VEHICLES.map((vehicle, index) => {
            const item = fleet.items[vehicle];
            return (
              <ParallaxSurface as="article" key={vehicle} className={styles.card}>
                <FleetFrame
                  vehicle={vehicle}
                  altSuffix={fleet.imageSuffix}
                  sizes="(min-width: 768px) 33vw, 100vw"
                  driftOffset={index}
                />
                <h3 className="card-title mt-5">{item.title}</h3>
                <p className="body-muted">{item.copy}</p>
                <BookButton preset={{ vehicle }} className={styles.button}>
                  {fleet.button}
                </BookButton>
              </ParallaxSurface>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
