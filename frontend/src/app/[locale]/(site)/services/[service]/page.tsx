import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ClockLargeIcon, HandshakeIcon, ShieldCheckIcon, SketchLogoIcon } from "@/components/icons/design-icons";
import { AppSection } from "@/components/site/app-section";
import { CheckList, toCheckItem } from "@/components/site/check-list";
import { CitiesStrip } from "@/components/site/cities-strip";
import { FaqSection } from "@/components/site/faq-section";
import { IconCard } from "@/components/site/icon-card";
import { PhotoHero } from "@/components/site/photo-hero";
import { ReviewsSection } from "@/components/site/reviews-section";
import { SectionIntro } from "@/components/site/section-intro";
import { ANCHORS } from "@/config/navigation";
import { serviceStepImages, serviceUseCaseImages } from "@/config/services";
import { BookingBar } from "@/features/booking";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { getSiteServices } from "@/lib/content/site-services";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { splitTitle } from "@/lib/split-title";

type Props = PageProps<"/[locale]/services/[service]">;

const VALUE_ICONS = [ShieldCheckIcon, ClockLargeIcon, SketchLogoIcon, HandshakeIcon];

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
  return { service, locale };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { service, locale } = await resolveService(params);
  return buildPageMetadata(locale, { title: service.seoTitle, description: service.seoDescription }, service.path);
}

/**
 * Every published service is prerendered (generateStaticParams), so the page is
 * complete static HTML. Reading `params` makes Next.js flag client navigations
 * here as "not instant"; we accept that rather than wrapping the page in
 * <Suspense>, which would ship a placeholder and reveal the content only after
 * JavaScript runs.
 */
export const instant = false;

/**
 * A service page laid out like the design's "Hourly hire Service": the copy and
 * photographs come from the content admin, the section titles from the dictionary.
 */
export default async function ServiceDetailPage({ params }: Props) {
  const { service, locale } = await resolveService(params);
  const t = await getDictionary(locale);
  const copy = t.site.service;
  const [heroLead, heroAccent] = splitTitle(service.headline);
  const [overviewLead, overviewAccent] = splitTitle(service.overviewTitle);
  const faqAccent =
    service.bookingType === "hourly_hire" ? t.site.faq.accent : copy.faqAccent.replace("{service}", service.title);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <PhotoHero
        image={service.heroImage}
        imageAlt=""
        lead={heroLead}
        accent={heroAccent}
        align="bottom"
        className="min-h-[36rem] xl:min-h-[41rem]"
      >
        <BookingBar locale={locale} labels={t.site.bookingBar} service={service.bookingType} />
      </PhotoHero>
      <CitiesStrip label={t.site.cities.label} cityNames={t.cities.names} />

      {(service.overviewTitle || service.overviewBody) && (
        <section className="section-band bg-white">
          <div className="site-shell flex flex-col gap-7 xl:gap-0">
            <SectionIntro badge={service.label || service.title} lead={overviewLead} accent={overviewAccent} />
            <div className="flex flex-col gap-8 xl:ms-[27.875rem] xl:mt-10 xl:max-w-[47.75rem] xl:gap-10">
              {service.overviewBody && (
                <p className="text-base leading-[1.6] font-medium tracking-[0.01em] text-body xl:text-xl">{service.overviewBody}</p>
              )}
              {service.included.length > 0 && (
                <div className="flex flex-col gap-4 xl:gap-5">
                  <h3 className="text-base leading-[1.6] font-semibold tracking-[-0.03em] text-amber-text xl:text-lg">{copy.keyBenefits}</h3>
                  <CheckList items={service.included.map(toCheckItem)} className="gap-3 xl:gap-4" />
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {service.steps.length > 0 && (
        <section className="section-band bg-cream">
          <div className="site-shell flex flex-col gap-7 xl:gap-[3.25rem]">
            <SectionIntro badge={copy.how.badge} lead={copy.how.lead} accent={copy.how.accent} />
            <ol className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4 xl:gap-[1.5625rem]">
              {service.steps.map((step, index) => (
                <li key={step.title} className="flex flex-col gap-4">
                  <div className="relative aspect-[312/349] overflow-hidden rounded-[1.25rem]">
                    <Image
                      src={serviceStepImages[index % serviceStepImages.length]}
                      alt=""
                      fill
                      sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-base leading-[1.2] font-semibold tracking-[-0.01em] text-ink xl:text-lg">
                      <span className="text-amber-text">{String(index + 1).padStart(2, "0")}.</span> {step.title}
                    </h3>
                    <p className="text-sm leading-[1.5] tracking-[-0.01em] text-muted-text xl:text-[0.9375rem]">{step.copy}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {service.features.length > 0 && (
        <section className="section-band" style={{ backgroundImage: "var(--gradient-blush)" }}>
          <div className="site-shell flex flex-col gap-7 xl:gap-[3.75rem]">
            <SectionIntro badge={copy.values.badge} badgeTone="dark" lead={copy.values.lead} accent={copy.values.accent} stacked />
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {service.features.map((feature, index) => (
                <li key={feature.title} className="flex">
                  <IconCard icon={VALUE_ICONS[index % VALUE_ICONS.length]} title={feature.title} copy={feature.copy} className="w-full" />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="section-band bg-white">
        <div className="site-shell flex flex-col gap-7 xl:gap-14">
          <SectionIntro badge={copy.useCases.badge} lead={copy.useCases.lead} accent={copy.useCases.accent} />
          <ul className="grid gap-5 md:grid-cols-2 xl:gap-x-6 xl:gap-y-8">
            {copy.useCases.items.map((label, index) => (
              <li key={label} className="relative aspect-[350/286] overflow-hidden rounded-3xl bg-white xl:aspect-[648/529]">
                <Image
                  src={serviceUseCaseImages[index % serviceUseCaseImages.length]}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.02)_0%,rgba(0,0,0,0)_57%,rgba(0,0,0,0.2)_81%)]"
                />
                <p className="absolute bottom-0 left-1/2 w-[12.5rem] -translate-x-1/2 bg-[rgba(25,22,18,0.7)] p-2.5 text-center text-base leading-[1.2] font-medium tracking-[-0.03em] text-white xl:w-[15.6875rem] xl:text-xl">
                  {label}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <ReviewsSection {...t.site.reviews} labels={t.site.carousel} />
      <FaqSection
        badge={t.site.faq.badge}
        lead={t.site.faq.lead}
        accent={faqAccent}
        clarityTitle={t.site.faq.clarityTitle}
        clarityBody={t.site.faq.clarityBody}
        contactLabel={t.site.faq.contact}
        contactHref={`#${ANCHORS.contact}`}
        items={t.site.faq.items}
      />
      <AppSection copy={t.site.app} install={t.install} />
    </main>
  );
}
