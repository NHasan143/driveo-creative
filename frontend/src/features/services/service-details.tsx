import { Plus } from "lucide-react";
import { ArrowLink } from "@/components/ui/arrow-link";
import { CheckList } from "@/components/ui/check-list";
import { servicePath } from "@/config/services";
import { SERVICE_TYPES } from "@/domain/booking";
import { RequestQuoteButton } from "@/features/quote";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import styles from "./services-page.module.css";

interface ServiceDetailsProps {
  locale: Locale;
  services: Dictionary["services"];
  page: Dictionary["pages"]["services"];
  viewDetails: string;
}

/** Factual service details and booking actions follow the photographic gallery. */
export function ServiceDetails({ locale, services, page, viewDetails }: ServiceDetailsProps) {
  return (
    <section className={styles.collection} aria-labelledby="service-collection-title">
      <div className={styles.collectionInner}>
        <div className={styles.collectionHeading}>
          <h2 id="service-collection-title">{services.title}</h2>
          <p className={styles.intro}>{page.intro}</p>
        </div>
        {SERVICE_TYPES.map((type) => {
          const item = services.items[type];
          return (
            <article
              key={type}
              id={type}
              className={styles.service}
              aria-labelledby={`${type}-title`}
            >
              <h3 id={`${type}-title`} className={styles.serviceTitle}>{item.title}</h3>
              <div>
                <p className={styles.copy}>{item.copy}</p>
                <div className={styles.actions}>
                <ArrowLink href={localePath(locale, servicePath(type))} className={styles.detailsLink}>
                  {viewDetails}
                </ArrowLink>
                <RequestQuoteButton preset={{ service: type }} variant="secondary">
                  {page.quoteCta}
                </RequestQuoteButton>
                <details className={styles.inclusions}>
                  <summary>{page.includedLabel}<Plus aria-hidden="true" /></summary>
                  <CheckList items={page.included[type]} className={styles.includedList} />
                </details>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
