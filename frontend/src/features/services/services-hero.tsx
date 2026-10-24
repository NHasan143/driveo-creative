import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { buttonClassName } from "@/components/ui/button";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import styles from "./services-page.module.css";

interface ServicesHeroProps {
  locale: Locale;
  page: Dictionary["pages"]["services"];
  home: string;
  cta: string;
}

export function ServicesHero({ locale, page, home, cta }: ServicesHeroProps) {
  return (
    <section id="top" className={styles.hero} aria-labelledby="services-title">
      <div className={`site-shell ${styles.heroInner}`}>
        <nav aria-label="Breadcrumb" className="sr-only">
          <Link href={localePath(locale)}>{home}</Link>
          <span aria-current="page">{page.eyebrow}</span>
        </nav>
        <h1 id="services-title" className={styles.title}>
          <span>{page.titleLead}</span>
          <em>{page.titleAccent}</em>
        </h1>
        <div className={styles.heroAside}>
          <div className={styles.heroActions}>
            <a href="#quote" className={buttonClassName({ size: "lg" }, styles.heroCta)}>
              {cta} <ArrowRight aria-hidden="true" className="rtl:-scale-x-100" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
