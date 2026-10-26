import { Check } from "lucide-react";
import Image from "next/image";
import { ParallaxSurface } from "@/components/motion/parallax-surface";
import { Reveal } from "@/components/motion/reveal";
import { Eyebrow } from "@/components/ui/eyebrow";
import type { SiteService } from "@/lib/content/site-services";
import { isRemoteImage } from "@/lib/remote-image";
import styles from "./service-overview.module.css";

interface ServiceOverviewProps {
  eyebrow: string;
  service: SiteService;
}

/** Description and four features beside a framed photo. */
export function ServiceOverview({ eyebrow, service }: ServiceOverviewProps) {
  return (
    <section className="section-band bg-background">
      <div className="site-shell grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
        <Reveal>
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 className="section-title">{service.overviewTitle}</h2>
          <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">{service.overviewBody}</p>

          <ul className="mt-10 grid gap-x-8 gap-y-7 sm:grid-cols-2">
            {service.features.map((feature) => (
              <li key={feature.title} className="flex gap-4">
                <span className="grid size-10 flex-none place-items-center rounded-full border border-primary/45 text-primary">
                  <Check aria-hidden="true" className="size-4" />
                </span>
                <div>
                  <h3 className="font-display text-xl">{feature.title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{feature.copy}</p>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal y={56}>
          <ParallaxSurface className={styles.stage}>
            <div className={styles.frame}>
              <Image
                src={service.overviewImage}
                unoptimized={isRemoteImage(service.overviewImage)}
                alt=""
                fill
                sizes="(min-width: 1024px) 45vw, 100vw"
                className={styles.image}
              />
              <div className={styles.sheen} aria-hidden="true" />
            </div>
            <div className={styles.accent} aria-hidden="true" />
          </ParallaxSurface>
        </Reveal>
      </div>
    </section>
  );
}
