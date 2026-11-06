import { Check } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BookCta } from "@/components/page/book-cta";
import { FaqList } from "@/components/page/faq-list";
import { FeatureCards } from "@/components/page/feature-cards";
import { PageBanner } from "@/components/page/page-banner";
import { PageSection } from "@/components/page/page-section";
import { buttonClassName } from "@/components/ui/button";
import { FromPrice } from "@/components/ui/from-price";
import { BookButton, BookingBar } from "@/features/booking";
import { localePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { getSiteServices } from "@/lib/content/site-services";
import { isRemoteImage } from "@/lib/remote-image";
import { buildPageMetadata } from "@/lib/seo/metadata";

const PATH = "/services";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const { pages } = await getDictionary(locale);
  return buildPageMetadata(locale, pages.services.meta, PATH);
}

export default async function ServicesPage() {
  const locale = await getLocale();
  const [t, services] = await Promise.all([getDictionary(locale), getSiteServices(locale)]);
  const page = t.pages.services;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <PageBanner
        locale={locale}
        title={page.title}
        intro={page.intro}
        image="/media/driveo-journey-poster.jpg"
        explore={t.servicePage.explore}
        crumbs={[{ label: t.pages.breadcrumbHome, path: "/" }, { label: t.nav.services }]}
      >
        <BookingBar locale={locale} labels={t.bookingBar} hoursUnit={t.booking.hoursUnit} cityNames={t.cities.names} />
      </PageBanner>

      <div id="content" className="scroll-mt-24">
        <section className="site-shell grid gap-20 py-12 sm:gap-28 sm:py-16">
          {services.map((service, index) => (
            <article
              key={service.slug}
              id={service.slug}
              className="grid scroll-mt-28 items-center gap-10 lg:grid-cols-2 lg:gap-16"
            >
              <div className={`relative aspect-[4/3] overflow-hidden rounded-3xl bg-muted ${index % 2 ? "lg:order-2" : ""}`}>
                <Image
                  src={service.heroImage}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                  unoptimized={isRemoteImage(service.heroImage)}
                />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{service.label}</p>
                <h2 className="mt-2 font-display text-[clamp(2rem,4vw,3.2rem)] leading-[1.08] font-medium">{service.title}</h2>
                <p className="mt-4 text-base leading-7 text-muted-foreground">{service.summary}</p>
                {service.included.length > 0 && (
                  <ul className="mt-6 grid gap-2.5">
                    {service.included.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-sm">
                        <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
                <FromPrice amount={service.fromPrice} unit={service.priceUnit} locale={locale} labels={t.pricing} className="mt-6" />
                <div className="mt-7 flex flex-wrap gap-3">
                  <BookButton locale={locale} preset={service.bookingType ? { service: service.bookingType } : {}}>
                    {page.bookCta}
                  </BookButton>
                  <Link href={localePath(locale, service.path)} className={buttonClassName({ variant: "secondary" })}>
                    {t.home.learnMore}
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </section>

        <PageSection title={page.standardTitle} tone="tinted">
          <FeatureCards items={t.assurance} columns={4} />
        </PageSection>

        <PageSection title={t.servicePage.faqTitle}>
          <FaqList items={t.help.faqs.slice(0, 5).map((faq) => ({ question: faq.q, answer: faq.a }))} />
        </PageSection>

        <BookCta locale={locale} title={t.booking.title} intro={t.booking.intro} cta={t.nav.book} />
      </div>
    </main>
  );
}
