import Image from "next/image";
import Link from "next/link";
import { WhatsAppIcon } from "@/components/icons/social-icons";
import { ParallaxSurface } from "@/components/motion/parallax-surface";
import { ScrollFade } from "@/components/motion/scroll-fade";
import { buttonClassName } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { siteConfig } from "@/config/site";
import { localePath, type Locale } from "@/i18n/config";
import { cn } from "@/lib/cn";
import styles from "./page-hero.module.css";

interface PageHeroProps {
  locale: Locale;
  /** Breadcrumb labels: home, then the current page. */
  crumbs: { home: string; current: string };
  eyebrow: string;
  title: string;
  intro: string;
  image: { src: string; alt: string };
  cta: string;
  whatsappLabel: string;
}

/** Opening section of an inner page, styled as a compact version of the home hero. */
export function PageHero({ locale, crumbs, eyebrow, title, intro, image, cta, whatsappLabel }: PageHeroProps) {
  return (
    <ParallaxSurface as="section" id="top" className={styles.stage}>
      <div className={styles.camera}>
        <Image src={image.src} alt={image.alt} fill priority sizes="100vw" className={styles.image} />
        <div className={styles.plane} aria-hidden="true" />
        <div className={styles.lightLine} aria-hidden="true" />
      </div>
      <div className={styles.shade} />

      <div className="site-shell relative z-10 pt-44 pb-16 sm:pb-20 lg:pt-40">
        <ScrollFade className="max-w-3xl">
          <nav aria-label="Breadcrumb" className={cn(styles.breadcrumb, "mono-label animate-rise")}>
            <Link href={localePath(locale)}>{crumbs.home}</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page" className="text-foreground">
              {crumbs.current}
            </span>
          </nav>
          <Eyebrow className="animate-rise">{eyebrow}</Eyebrow>
          <h1 className={cn(styles.title, "animate-rise-delay")}>{title}</h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">{intro}</p>

          <div className="mt-9 flex flex-wrap gap-3">
            <a href="#quote" className={buttonClassName({ size: "lg" })}>
              {cta} <span aria-hidden="true">↘</span>
            </a>
            <a
              href={siteConfig.contact.whatsappHref}
              target="_blank"
              rel="noreferrer"
              className={cn("social-icon", styles.whatsapp)}
              aria-label={whatsappLabel}
              title="WhatsApp"
            >
              <WhatsAppIcon aria-hidden="true" />
            </a>
          </div>
        </ScrollFade>
      </div>
    </ParallaxSurface>
  );
}
