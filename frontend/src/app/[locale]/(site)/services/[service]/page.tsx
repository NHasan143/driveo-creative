import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/page/page-hero";
import { TestimonialSection } from "@/features/home/testimonial-section";
import { QuotePresetDefaults, QuoteSection } from "@/features/quote";
import { OtherServices } from "@/features/services/detail/other-services";
import { ServiceFacts } from "@/features/services/detail/service-facts";
import { ServiceFleet } from "@/features/services/detail/service-fleet";
import { ServiceGlanceCard } from "@/features/services/detail/service-glance-card";
import { ServiceOverview } from "@/features/services/detail/service-overview";
import { ServiceSteps } from "@/features/services/detail/service-steps";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { getSiteServices } from "@/lib/content/site-services";
import { buildPageMetadata } from "@/lib/seo/metadata";

type Props = PageProps<"/[locale]/services/[service]">;

/** Published services are prerendered; one added later renders on its first visit. */
export async function generateStaticParams() {
  const services = await getSiteServices("en");
  return services.map((service) => ({ service: service.slug }));
}

async function resolveService(params: Props["params"]) {
  const [{ service: slug }, locale] = await Promise.all([params, getLocale()]);
  const services = await getSiteServices(locale);
  const service = services.find((item) => item.slug === slug);
  if (!service) notFound();
  return { service, services, locale };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { service, locale } = await resolveService(params);
  return buildPageMetadata(
    locale,
    { title: service.seoTitle, description: service.seoDescription },
    service.path,
  );
}

/**
 * Every published service is prerendered (generateStaticParams), so the page is
 * complete static HTML. Reading `params` makes Next.js flag client navigations
 * here as "not instant"; we accept that rather than wrapping the page in
 * <Suspense>, which would ship a placeholder and reveal the content only after
 * JavaScript runs.
 */
export const instant = false;

export default async function ServiceDetailPage({ params }: Props) {
  const { service, services, locale } = await resolveService(params);
  const t = await getDictionary(locale);
  const detail = t.pages.serviceDetail;
  const preset = service.bookingType ? { service: service.bookingType } : {};

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <QuotePresetDefaults preset={preset} />
      <PageHero
        locale={locale}
        crumbs={{
          home: t.pages.breadcrumbHome,
          trail: [{ label: t.nav.services, path: "/services" }, { label: service.title }],
        }}
        eyebrow={service.label}
        title={service.headline}
        intro={service.summary}
        image={{ src: service.heroImage, alt: "" }}
        cta={t.hero.cta}
        whatsappLabel={t.hero.whatsapp}
        aside={
          <ServiceGlanceCard
            service={service}
            heading={detail.atAGlance}
            cta={t.pages.services.quoteCta}
          />
        }
      />
      {service.facts.length > 0 && <ServiceFacts eyebrow={detail.factsEyebrow} facts={service.facts} />}
      {(service.overviewTitle || service.features.length > 0) && (
        <ServiceOverview eyebrow={detail.overviewEyebrow} service={service} />
      )}
      {service.steps.length > 0 && (
        <ServiceSteps eyebrow={detail.stepsEyebrow} title={detail.stepsTitle} steps={service.steps} />
      )}
      <ServiceFleet
        locale={locale}
        preset={preset}
        vehicles={service.vehicles}
        heading={{ eyebrow: detail.fleetEyebrow, title: detail.fleetTitle, more: t.pages.links.fleet }}
        fleet={t.fleet}
        capacity={{
          passengers: t.pages.fleet.passengers,
          luggage: t.pages.fleet.luggage,
          upTo: t.pages.fleet.upTo,
        }}
      />
      <TestimonialSection testimonial={t.testimonial} />
      <OtherServices
        locale={locale}
        services={services.filter((item) => item.slug !== service.slug)}
        heading={{ eyebrow: detail.otherEyebrow, title: detail.otherTitle, viewDetails: detail.viewDetails }}
      />
      <QuoteSection locale={locale} quote={t.quote} cityNames={t.cities.names} />
    </main>
  );
}
