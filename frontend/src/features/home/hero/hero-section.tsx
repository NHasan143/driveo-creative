import { BrandMark } from "@/components/brand/brand-mark";
import { WhatsAppIcon } from "@/components/icons/social-icons";
import { ParallaxSurface } from "@/components/motion/parallax-surface";
import { ScrollFade } from "@/components/motion/scroll-fade";
import { buttonClassName } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { siteConfig } from "@/config/site";
import { CITIES } from "@/domain/booking";
import type { Dictionary } from "@/i18n/get-dictionary";
import { cn } from "@/lib/cn";
import { HeroVideo } from "./hero-video";
import styles from "./hero-section.module.css";

interface HeroSectionProps {
  hero: Dictionary["hero"];
  cityNames: Dictionary["cities"]["names"];
}

export function HeroSection({ hero, cityNames }: HeroSectionProps) {
  return (
    <ParallaxSurface as="section" id="top" className={styles.stage}>
      <div className={styles.camera}>
        <div className={cn(styles.plane, styles.planeBack)} aria-hidden="true" />
        <HeroVideo
          className={styles.video}
          sources={siteConfig.assets.heroVideos}
          poster={siteConfig.assets.heroPoster}
          label={hero.videoAlt}
        />
        <div className={cn(styles.plane, styles.planeGlass)} aria-hidden="true" />
        <div className={styles.lightLine} aria-hidden="true" />
      </div>
      <div className={styles.shade} />

      <div className="site-shell relative z-10 flex min-h-[92svh] items-center pt-40 pb-16 xl:pt-32">
        <ScrollFade className="max-w-4xl">
          <BrandMark
            size="lg"
            priority
            className="mb-4 opacity-90 shadow-[0_20px_60px_color-mix(in_oklab,var(--background)_75%,transparent)] sm:mb-6"
          />
          <Eyebrow className="animate-rise">{hero.eyebrow}</Eyebrow>
          <h1 className={cn(styles.title, "animate-rise-delay")}>
            {hero.titleLine1}
            <br />
            {hero.titleLine2} <em>{hero.titleEm}</em>
          </h1>
          <p className="mt-7 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">{hero.sub}</p>

          <div className="mt-9 flex flex-wrap gap-3">
            <a href="#quote" className={buttonClassName({ size: "lg" })}>
              {hero.cta} <span aria-hidden="true">↘</span>
            </a>
            <a
              href={siteConfig.contact.whatsappHref}
              target="_blank"
              rel="noreferrer"
              className={cn("social-icon", styles.whatsapp)}
              aria-label={hero.whatsapp}
              title="WhatsApp"
            >
              <WhatsAppIcon aria-hidden="true" />
            </a>
          </div>

          <div className={cn(styles.cities, "mt-14")}>
            {CITIES.map((city) => (
              <span key={city}>{cityNames[city]}</span>
            ))}
          </div>
        </ScrollFade>
      </div>

      <div className={styles.rail} aria-hidden="true">
        {hero.rail.map((word) => (
          <span key={word}>{word}</span>
        ))}
      </div>
    </ParallaxSurface>
  );
}
