import type { Metadata } from "next";
import { QuoteSection } from "@/features/quote";
import { ServiceDetails } from "@/features/services/service-details";
import { ServicesHero } from "@/features/services/services-hero";
import { ServicesGallery } from "@/features/services/services-gallery";
import { ServicesStandard } from "@/features/services/services-standard";
import styles from "@/features/services/services-page.module.css";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { getSiteServices } from "@/lib/content/site-services";
import { buildPageMetadata } from "@/lib/seo/metadata";

const PATH = "/services";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const { pages } = await getDictionary(locale);
  return buildPageMetadata(locale, pages.services.meta, PATH);
}

export default async function ServicesPage() {
  const locale = await getLocale();
  const t = await getDictionary(locale);
  const page = t.pages.services;
  const services = await getSiteServices(locale);

  return (
    <main className={styles.page}>
      <ServicesHero
        locale={locale}
        page={page}
        home={t.pages.breadcrumbHome}
        cta={t.hero.cta}
      />
      <ServicesGallery
        locale={locale}
        title={t.services.title}
        services={services}
        viewDetails={t.pages.serviceDetail.viewDetails}
      />
      <ServiceDetails
        locale={locale}
        title={t.services.title}
        services={services}
        page={page}
        viewDetails={t.pages.serviceDetail.viewDetails}
      />
      <ServicesStandard
        items={t.assurance}
        title={page.standardTitle}
      />
      <QuoteSection locale={locale} quote={t.quote} cityNames={t.cities.names} />
    </main>
  );
}
