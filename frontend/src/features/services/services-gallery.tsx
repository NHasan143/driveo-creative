import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { serviceMedia, servicePath } from "@/config/services";
import { SERVICE_TYPES } from "@/domain/booking";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import styles from "./services-page.module.css";

interface ServicesGalleryProps {
  locale: Locale;
  services: Dictionary["services"];
  viewDetails: string;
}

export function ServicesGallery({ locale, services, viewDetails }: ServicesGalleryProps) {
  return (
    <section className={styles.gallery} aria-label={services.title}>
      <div className={styles.galleryGrid}>
        {SERVICE_TYPES.map((type, index) => {
          const item = services.items[type];
          return (
            <Link
              key={type}
              href={localePath(locale, servicePath(type))}
              className={styles.galleryPanel}
              aria-labelledby={`gallery-${type}-title`}
            >
              <Image
                src={serviceMedia[type].collection}
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
                <h2 id={`gallery-${type}-title`} className={styles.galleryTitle}>{item.title}</h2>
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
