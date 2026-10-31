import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { BookCta } from "@/components/page/book-cta";
import { CityCards } from "@/components/page/city-cards";
import { FaqList, type FaqItem } from "@/components/page/faq-list";
import { FeatureCards } from "@/components/page/feature-cards";
import { PageBanner } from "@/components/page/page-banner";
import { PageSection } from "@/components/page/page-section";
import { ServiceCards } from "@/components/page/service-cards";
import { StepCards } from "@/components/page/step-cards";
import { VehicleClasses } from "@/components/page/vehicle-classes";
import { FromPrice } from "@/components/ui/from-price";
import { BookingBar } from "@/features/booking";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import {
  getServicePrices,
  getSiteCities,
  getSiteFleet,
  getSiteServices,
  lowestVehiclePrice,
  type SiteVehicle,
} from "@/lib/content/site-services";
import { formatPrice } from "@/lib/format-price";
import { isRemoteImage } from "@/lib/remote-image";
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
  const [t, fleet, cities, prices] = await Promise.all([
    getDictionary(locale),
    getSiteFleet(locale),
    getSiteCities(locale),
    getServicePrices(),
  ]);
  const detail = t.pages.serviceDetail;
  const page = t.servicePage;
  const preset = service.bookingType ? { service: service.bookingType } : {};

  const vehicles = service.vehicles
    .map((key) => fleet.find((vehicle) => vehicle.vehicleKey === key))
    .filter((vehicle): vehicle is SiteVehicle => vehicle !== undefined);
  const vehiclePrices = Object.fromEntries(
    vehicles.map((vehicle) => {
      const lowest =
        service.bookingType && vehicle.vehicleKey
          ? lowestVehiclePrice(prices, service.bookingType, vehicle.vehicleKey)
          : null;
      return [
        vehicle.id,
        lowest && <FromPrice amount={lowest.amount} unit={lowest.unit} locale={locale} labels={t.pricing} />,
      ];
    }),
  );
  const offeredIn = cities.filter((city) => city.serviceIds.includes(service.id));
  const serviceNames = Object.fromEntries(services.map((item) => [item.id, item.title]));

  const priceAnswer =
    service.fromPrice !== null
      ? `${t.pricing.from.replace("{price}", formatPrice(service.fromPrice, locale))}${
          service.priceUnit === "hour" ? ` ${t.pricing.perHour}` : ""
        }. ${t.booking.priceNote}`
      : page.noPrice;
  const faq: FaqItem[] = [
    ...(service.included.length > 0
      ? [{ question: page.faq.included, answer: <ul className="list-disc ps-5">{service.included.map((item) => <li key={item}>{item}</li>)}</ul> }]
      : []),
    ...(service.steps.length > 0
      ? [{ question: page.faq.how, answer: <ol className="list-decimal ps-5">{service.steps.map((step) => <li key={step.title}>{step.title}: {step.copy}</li>)}</ol> }]
      : []),
    { question: page.faq.price, answer: priceAnswer },
    ...(vehicles.length > 0
      ? [{ question: page.faq.cars, answer: vehicles.map((vehicle) => `${vehicle.name} (${vehicle.model})`).join(", ") }]
      : []),
  ];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <PageBanner
        locale={locale}
        title={service.headline}
        intro={service.summary}
        image={service.heroImage}
        explore={page.explore}
        crumbs={[{ label: t.pages.breadcrumbHome, path: "/" }, { label: t.nav.services, path: "/services" }, { label: service.title }]}
      >
        <BookingBar
          locale={locale}
          labels={t.bookingBar}
          hoursUnit={t.booking.hoursUnit}
          cityNames={t.cities.names}
          service={service.bookingType}
        />
      </PageBanner>

      <div id="content" className="scroll-mt-24">
        {service.features.length > 0 && (
          <div className="site-shell pt-6 pb-12">
            <FeatureCards items={service.features.slice(0, 4)} columns={service.features.length >= 4 ? 4 : 3} />
          </div>
        )}

        {(service.overviewTitle || service.overviewBody) && (
          <section className="py-16 sm:py-20">
            <div className="site-shell grid items-center gap-10 lg:grid-cols-2">
              <div>
                <h2 className="font-display text-[clamp(2rem,4vw,3.2rem)] leading-[1.08] font-medium text-balance">
                  {service.overviewTitle}
                </h2>
                <p className="mt-5 text-base leading-7 text-muted-foreground">{service.overviewBody}</p>
              </div>
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-muted">
                <Image
                  src={service.overviewImage}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                  unoptimized={isRemoteImage(service.overviewImage)}
                />
              </div>
            </div>
          </section>
        )}

        {vehicles.length > 0 && (
          <PageSection title={detail.fleetTitle} tone="tinted">
            <VehicleClasses
              locale={locale}
              vehicles={vehicles}
              preset={preset}
              prices={vehiclePrices}
              labels={{ upToPassengers: t.bookFlow.upToPassengers, upToLuggage: t.bookFlow.upToLuggage, book: t.fleet.button }}
            />
          </PageSection>
        )}

        {service.steps.length > 0 && (
          <PageSection title={detail.stepsTitle}>
            <StepCards steps={service.steps} />
          </PageSection>
        )}

        {offeredIn.length > 0 && (
          <PageSection title={page.citiesTitle} tone="tinted">
            <CityCards
              locale={locale}
              cities={offeredIn}
              serviceNames={serviceNames}
              preset={preset}
              labels={{ services: t.pages.cities.servicesLabel, book: t.pages.cities.bookCta }}
            />
          </PageSection>
        )}

        <PageSection title={page.faqTitle}>
          <FaqList items={faq} />
        </PageSection>

        {services.length > 1 && (
          <PageSection title={detail.otherTitle} tone="tinted">
            <ServiceCards
              locale={locale}
              services={services.filter((item) => item.slug !== service.slug)}
              learnMore={t.home.learnMore}
            />
          </PageSection>
        )}

        <BookCta
          locale={locale}
          title={t.booking.title}
          intro={t.booking.intro}
          cta={t.pages.services.bookCta}
          preset={preset}
        />
      </div>
    </main>
  );
}
