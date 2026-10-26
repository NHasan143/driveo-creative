import Image from "next/image";
import { isRemoteImage } from "@/lib/remote-image";
import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { WhatsAppIcon } from "@/components/icons/social-icons";
import { ParallaxSurface } from "@/components/motion/parallax-surface";
import { ScrollFade } from "@/components/motion/scroll-fade";
import { buttonClassName } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { siteConfig } from "@/config/site";
import { localePath, type Locale } from "@/i18n/config";
import { cn } from "@/lib/cn";
import styles from "./page-hero.module.css";

export interface Crumb {
  label: string;
  /** Site-relative path without `?lang=`; omit for the current page. */
  path?: string;
}

interface PageHeroProps {
  locale: Locale;
  /** Trail after "Home", ending with the current page, e.g. Services / Airport transfer. */
  crumbs: { home: string; trail: Crumb[] };
  eyebrow: string;
  title: string;
  intro: string;
  image: { src: string; alt: string };
  cta: string;
  whatsappLabel: string;
  /** Optional card floated beside the copy on large screens. */
  aside?: ReactNode;
}

/** Opening section of an inner page, styled as a compact version of the home hero. */
export function PageHero({
  locale,
  crumbs,
  eyebrow,
  title,
  intro,
  image,
  cta,
  whatsappLabel,
  aside,
}: PageHeroProps) {
  return (
    <ParallaxSurface as="section" id="top" className={styles.stage}>
      <div className={styles.camera}>
        <Image
          src={image.src}
          alt={image.alt}
          fill
          priority
          sizes="100vw"
          unoptimized={isRemoteImage(image.src)}
          className={styles.image}
        />
        <div className={styles.plane} aria-hidden="true" />
        <div className={styles.lightLine} aria-hidden="true" />
      </div>
      <div className={styles.shade} />

      <div className="site-shell relative z-10 grid items-end gap-10 pt-44 pb-16 sm:pb-20 lg:grid-cols-[1fr_auto] xl:pt-40">
        <ScrollFade className="max-w-3xl">
          <nav aria-label="Breadcrumb" className={cn(styles.breadcrumb, "mono-label animate-rise")}>
            <Link href={localePath(locale)}>{crumbs.home}</Link>
            {crumbs.trail.map((crumb) => (
              <Fragment key={crumb.label}>
                <span aria-hidden="true">/</span>
                {crumb.path ? (
                  <Link href={localePath(locale, crumb.path)}>{crumb.label}</Link>
                ) : (
                  <span aria-current="page" className="text-foreground">
                    {crumb.label}
                  </span>
                )}
              </Fragment>
            ))}
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
        {aside && <div className="animate-rise-delay">{aside}</div>}
      </div>
    </ParallaxSurface>
  );
}
