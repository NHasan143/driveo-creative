import { Plus } from "lucide-react";
import { ArrowLink } from "@/components/ui/arrow-link";
import { CheckList } from "@/components/ui/check-list";
import { FromPrice } from "@/components/ui/from-price";
import { RequestQuoteButton } from "@/features/quote";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { SiteService } from "@/lib/content/site-services";
import styles from "./services-page.module.css";

interface ServiceDetailsProps {
  locale: Locale;
  title: string;
  services: SiteService[];
  page: Dictionary["pages"]["services"];
  viewDetails: string;
  pricing: Dictionary["pricing"];
}

/** Factual service details and booking actions follow the photographic gallery. */
export function ServiceDetails({ locale, title, services, page, viewDetails, pricing }: ServiceDetailsProps) {
  return (
    <section className={styles.collection} aria-labelledby="service-collection-title">
      <div className={styles.collectionInner}>
        <div className={styles.collectionHeading}>
          <h2 id="service-collection-title">{title}</h2>
          <p className={styles.intro}>{page.intro}</p>
        </div>
        {services.map((item) => {
          return (
            <article
              key={item.slug}
              id={item.slug}
              className={styles.service}
              aria-labelledby={`${item.slug}-title`}
            >
              <h3 id={`${item.slug}-title`} className={styles.serviceTitle}>{item.title}</h3>
              <div>
                <p className={styles.copy}>{item.summary}</p>
                <FromPrice amount={item.fromPrice} unit={item.priceUnit} locale={locale} labels={pricing} className="mt-4" />
                <div className={styles.actions}>
                <ArrowLink href={localePath(locale, item.path)} className={styles.detailsLink}>
                  {viewDetails}
                </ArrowLink>
                <RequestQuoteButton preset={item.bookingType ? { service: item.bookingType } : {}} variant="secondary">
                  {page.quoteCta}
                </RequestQuoteButton>
                {item.included.length > 0 && (
                  <details className={styles.inclusions}>
                    <summary>{page.includedLabel}<Plus aria-hidden="true" /></summary>
                    <CheckList items={item.included} className={styles.includedList} />
                  </details>
                )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
