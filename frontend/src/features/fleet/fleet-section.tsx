import Image from "next/image";
import { ParallaxSurface } from "@/components/motion/parallax-surface";
import { Reveal } from "@/components/motion/reveal";
import { Eyebrow } from "@/components/ui/eyebrow";
import { FLEET_VEHICLES } from "@/domain/booking";
import { RequestQuoteButton } from "@/features/quote";
import type { Dictionary } from "@/i18n/get-dictionary";
import { fleetMedia } from "./fleet-media";
import styles from "./fleet-section.module.css";

export function FleetSection({ fleet }: { fleet: Dictionary["fleet"] }) {
  return (
    <section id="fleet" className="section-band bg-secondary">
      <div className="site-shell">
        <Reveal>
          <Eyebrow>{fleet.eyebrow}</Eyebrow>
          <h2 className="section-title">{fleet.title}</h2>
        </Reveal>

        <Reveal stagger className={styles.grid}>
          {FLEET_VEHICLES.map((vehicle) => {
            const item = fleet.items[vehicle];
            const media = fleetMedia[vehicle];
            return (
              <ParallaxSurface as="article" key={vehicle} className={styles.card}>
                <div className={styles.frame}>
                  <div className={styles.imageClip}>
                    <Image
                      src={media.src}
                      alt={`${media.model} ${fleet.imageSuffix}`}
                      fill
                      sizes="(min-width: 768px) 33vw, 100vw"
                      className={styles.image}
                    />
                  </div>
                  <div className={styles.reflection} aria-hidden="true" />
                </div>
                <h3 className="card-title mt-5">{item.title}</h3>
                <p className="body-muted">{item.copy}</p>
                <RequestQuoteButton vehicle={vehicle} className={styles.button}>
                  {fleet.button}
                </RequestQuoteButton>
              </ParallaxSurface>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
