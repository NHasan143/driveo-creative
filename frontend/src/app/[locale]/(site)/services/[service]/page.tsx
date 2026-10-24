import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/page/page-hero";
import { SERVICE_SLUGS, serviceFromSlug, serviceMedia, servicePath } from "@/config/services";
import { SERVICE_TYPES } from "@/domain/booking";
import { TestimonialSection } from "@/features/home/testimonial-section";
import { QuotePresetDefaults, QuoteSection } from "@/features/quote";
import { OtherServices } from "@/features/services/detail/other-services";
import { ServiceFacts } from "@/features/services/detail/service-facts";
import { ServiceFleet } from "@/features/services/detail/service-fleet";
import { ServiceGlanceCard } from "@/features/services/detail/service-glance-card";
import { ServiceOverview } from "@/features/services/detail/service-overview";
import { ServiceSteps } from "@/features/services/detail/service-steps";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { buildPageMetadata } from "@/lib/seo/metadata";

type Props = PageProps<"/[locale]/services/[service]">;

export async function generateStaticParams() {
  return SERVICE_TYPES.map((type) => ({ service: SERVICE_SLUGS[type] }));
}

async function resolveService(params: Props["params"]) {
  const type = serviceFromSlug((await params).service);
  if (!type) notFound();
  return type;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const type = await resolveService(params);
  const locale = await getLocale();
  const { pages } = await getDictionary(locale);
  return buildPageMetadata(locale, pages.serviceDetail.items[type].meta, servicePath(type));
}

/**
 * Every service is prerendered (generateStaticParams), so the page is complete
 * static HTML. Reading `params` makes Next.js flag client navigations here as
 * "not instant"; we accept that rather than wrapping the page in <Suspense>,
 * which would ship a placeholder and reveal the content only after JavaScript runs.
 */
export const instant = false;

export default async function ServiceDetailPage({ params }: Props) {
  const type = await resolveService(params);
  const locale = await getLocale();
  const t = await getDictionary(locale);
  const detail = t.pages.serviceDetail;
  const item = detail.items[type];
  const service = t.services.items[type];
  const media = serviceMedia[type];

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <QuotePresetDefaults preset={{ service: type }} />
      <PageHero
        locale={locale}
        crumbs={{
          home: t.pages.breadcrumbHome,
          trail: [{ label: t.nav.services, path: "/services" }, { label: service.title }],
        }}
        eyebrow={service.label}
        title={item.title}
        intro={service.copy}
        image={{ src: media.hero, alt: "" }}
        cta={t.hero.cta}
        whatsappLabel={t.hero.whatsapp}
        aside={
          <ServiceGlanceCard
            type={type}
            label={service.title}
            facts={item.facts}
            heading={detail.atAGlance}
            cta={t.pages.services.quoteCta}
          />
        }
      />
      <ServiceFacts eyebrow={detail.factsEyebrow} facts={item.facts} />
      <ServiceOverview eyebrow={detail.overviewEyebrow} item={item} image={media.overview} />
      <ServiceSteps eyebrow={detail.stepsEyebrow} title={detail.stepsTitle} steps={item.steps} />
      <ServiceFleet
        locale={locale}
        type={type}
        vehicles={media.vehicles}
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
        current={type}
        services={t.services.items}
        heading={{ eyebrow: detail.otherEyebrow, title: detail.otherTitle, viewDetails: detail.viewDetails }}
      />
      <QuoteSection locale={locale} quote={t.quote} cityNames={t.cities.names} />
    </main>
  );
}
