import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { localePath, type Locale } from "@/i18n/config";
import type { SiteService } from "@/lib/content/site-services";
import { isRemoteImage } from "@/lib/remote-image";
import styles from "./services-page.module.css";

interface ServicesGalleryProps {
  locale: Locale;
  title: string;
  services: SiteService[];
  viewDetails: string;
}

/** Up to five panels share one row; more are split evenly across rows (6 → 3 + 3, 7 → 4 + 3). */
function galleryColumns(count: number) {
  const rows = Math.max(1, Math.ceil(count / 5));
  return Math.max(1, Math.ceil(count / rows));
}

export function ServicesGallery({ locale, title, services, viewDetails }: ServicesGalleryProps) {
  const gridStyle = { "--gallery-columns": galleryColumns(services.length) } as CSSProperties;

  return (
    <section className={styles.gallery} aria-label={title}>
      <div className={styles.galleryGrid} style={gridStyle}>
        {services.map((item, index) => {
          return (
            <Link
              key={item.slug}
              href={localePath(locale, item.path)}
              className={styles.galleryPanel}
              aria-labelledby={`gallery-${item.slug}-title`}
            >
              <Image
                src={item.galleryImage}
                unoptimized={isRemoteImage(item.galleryImage)}
                alt=""
                fill
                preload={index === 0}
                loading={index > 0 ? "eager" : undefined}
                sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, (max-width: 1600px) 24vw, 380px"
                className={styles.galleryImage}
              />
              <span className={styles.panelArrow} aria-hidden="true">
                <ArrowRight className="rtl:-scale-x-100" strokeWidth={1.5} />
              </span>
              <div className={styles.panelCaption}>
                <h2 id={`gallery-${item.slug}-title`} className={styles.galleryTitle}>{item.title}</h2>
                <span className={styles.galleryAction}>
                  {viewDetails}<ArrowRight aria-hidden="true" className="rtl:-scale-x-100" strokeWidth={1.5} />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
