import type { Metadata } from "next";
import Image from "next/image";
import {
  ArrowRightIcon,
  ArrowRightSmallIcon,
  CheckHeavyIcon,
  CrossIcon,
  FileTextIcon,
  HeadsetIcon,
  LightningIcon,
  MapPinLineIcon,
  UserGearIcon,
  UsersIcon,
} from "@/components/icons/design-icons";
import { CheckList } from "@/components/site/check-list";
import { FaqSection } from "@/components/site/faq-section";
import { IconCard } from "@/components/site/icon-card";
import { PhotoHero } from "@/components/site/photo-hero";
import { ReviewsSection } from "@/components/site/reviews-section";
import { SectionHeading, SectionIntro } from "@/components/site/section-intro";
import { buttonClassName } from "@/components/ui/button";
import { ANCHORS } from "@/config/navigation";
import { CITIES } from "@/domain/booking";
import { EnquiryForm } from "@/features/business/enquiry-form";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { getSiteServices } from "@/lib/content/site-services";
import { buildPageMetadata } from "@/lib/seo/metadata";

const USE_CASE_IMAGES = [
  "/media/site/business/use-daily.jpg",
  "/media/site/business/use-out-of-town.jpg",
  "/media/site/business/use-airport.jpg",
  "/media/site/business/use-guests.jpg",
];
const STEP_IMAGES = ["/media/site/business/how-account.svg", "/media/site/business/how-book.svg", "/media/site/business/how-pay.svg"];
const BENEFIT_ICONS = [UsersIcon, FileTextIcon, UserGearIcon, HeadsetIcon, MapPinLineIcon, LightningIcon];
const ARTICLE_IMAGES = [
  "/media/site/business/article-destinations.jpg",
  "/media/site/business/article-tips.jpg",
  "/media/site/business/article-stories.jpg",
];
const ENQUIRY_ID = "company-account";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getDictionary(locale);
  return buildPageMetadata(locale, t.site.business.meta, "/business");
}

/** For Business: company accounts with one monthly invoice, from the "For Business" design. */
export default async function BusinessPage() {
  const locale = await getLocale();
  const [t, services] = await Promise.all([getDictionary(locale), getSiteServices(locale)]);
  const copy = t.site.business;
  const enquiryHref = `#${ENQUIRY_ID}`;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <PhotoHero
        image="/media/site/business/hero.jpg"
        imageAlt={copy.hero.imageAlt}
        imageClassName="object-[50%_64%]"
        lead={copy.hero.lead}
        accent={copy.hero.accent}
        stacked
        sub={copy.hero.sub}
        checks={copy.hero.checks}
        className="min-h-[36rem] xl:min-h-[41rem]"
      >
        <a href={enquiryHref} className={buttonClassName()}>
          {copy.hero.cta}
          <ArrowRightIcon className="rtl:-scale-x-100" />
        </a>
      </PhotoHero>

      {/* Use cases */}
      <section className="section-band bg-white">
        <div className="site-shell flex flex-col gap-7 xl:gap-14">
          <SectionIntro badge={copy.useCases.badge} lead={copy.useCases.lead} accent={copy.useCases.accent} />
          <ul className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4 xl:gap-[1.5625rem]">
            {copy.useCases.items.map((item, index) => (
              <li key={item.title} className="flex flex-col gap-4">
                <div className="relative aspect-[312/349] overflow-hidden rounded-[1.35rem]">
                  <Image src={USE_CASE_IMAGES[index % USE_CASE_IMAGES.length]} alt={item.alt} fill sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
                </div>
                <div className="flex flex-col gap-2 pe-3">
                  <h3 className="text-base leading-[1.2] font-semibold tracking-[-0.01em] text-ink xl:text-lg">{item.title}</h3>
                  <p className="text-sm leading-[1.5] tracking-[-0.01em] text-muted-text xl:text-[0.9375rem]">{item.copy}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="section-band scroll-mt-24 bg-cream">
        <div className="site-shell flex flex-col gap-7 xl:gap-14">
          <SectionIntro badge={copy.how.badge} lead={copy.how.lead} accent={copy.how.accent} />
          <ol className="grid gap-8 md:grid-cols-3 xl:gap-6">
            {copy.how.steps.map((step, index) => (
              <li key={step.title} className="flex flex-col gap-4">
                <div className="relative aspect-[424/433] overflow-hidden rounded-[1.25rem] bg-cream-deep">
                  <Image src={STEP_IMAGES[index % STEP_IMAGES.length]} alt="" fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
                </div>
                <div className="flex flex-col gap-2 pe-5">
                  <h3 className="text-base leading-[1.2] font-semibold tracking-[-0.01em] text-ink xl:text-lg">
                    <span className="text-amber-text">{String(index + 1).padStart(2, "0")}.</span>
                    {step.title}
                  </h3>
                  <p className="text-sm leading-[1.5] tracking-[-0.01em] text-muted-text xl:text-[0.9375rem]">{step.copy}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* The Driveo difference */}
      <section className="section-band bg-white">
        <div className="site-shell flex flex-col gap-7 xl:gap-14">
          <SectionIntro badge={copy.difference.badge} lead={copy.difference.lead} accent={copy.difference.accent} />
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-[4.75rem]">
            <div className="relative aspect-[489/468] overflow-hidden rounded-3xl lg:w-[30.5625rem] lg:shrink-0">
              <Image src="/media/site/business/difference.jpg" alt={copy.difference.imageAlt} fill sizes="(min-width: 1024px) 489px, 100vw" className="object-cover" />
            </div>
            <div className="flex flex-col items-start gap-6 lg:max-w-[40rem] xl:gap-8">
              <p className="text-base leading-[1.6] font-medium tracking-[0.01em] text-ink xl:text-xl">{copy.difference.intro}</p>
              <CheckList items={copy.difference.items} separator=" :" />
              <a href={enquiryHref} className={buttonClassName({ variant: "dark" })}>
                {copy.difference.cta}
                <ArrowRightIcon className="rtl:-scale-x-100" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Business benefits */}
      <section id="benefits" className="section-band scroll-mt-24" style={{ backgroundImage: "var(--gradient-blush)" }}>
        <div className="site-shell flex flex-col gap-7 xl:gap-10">
          <SectionIntro badge={copy.benefits.badge} badgeTone="dark" lead={copy.benefits.lead} accent={copy.benefits.accent} />
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 xl:gap-x-[1.375rem] xl:gap-y-6">
            {copy.benefits.items.map((item, index) => (
              <li key={item.title} className="flex">
                <IconCard icon={BENEFIT_ICONS[index % BENEFIT_ICONS.length]} title={item.title} copy={item.copy} large className="w-full" />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Comparison */}
      <section className="section-band bg-white xl:pb-24">
        <div className="site-shell flex flex-col gap-7 xl:gap-[4.5rem]">
          <SectionIntro badge={copy.comparison.badge} lead={copy.comparison.lead} accent={copy.comparison.accent} stacked />
          <div className="overflow-x-auto xl:px-[5.1875rem]">
            <table className="w-full min-w-[21.875rem] border-collapse text-start">
              <thead>
                <tr className="bg-cream-deep text-[0.6875rem] leading-[1.4] font-semibold uppercase xl:text-sm">
                  <th scope="col" className="w-[43%] p-2.5 text-start text-[#655941] xl:px-4 xl:py-4 xl:text-amber-text">
                    {copy.comparison.feature}
                  </th>
                  <th scope="col" className="p-2 text-center text-[#655941] xl:px-4 xl:text-start xl:text-amber-text">
                    {copy.comparison.taxi}
                  </th>
                  <th scope="col" className="w-[26%] bg-amber-text p-2 text-center text-white xl:px-6 xl:text-start">
                    {copy.comparison.driveo}
                  </th>
                </tr>
              </thead>
              <tbody>
                {copy.comparison.rows.map((row) => (
                  <tr key={row.label} className="odd:bg-white even:bg-cream">
                    <th scope="row" className="px-2.5 py-3 text-start text-sm leading-[1.45] font-normal tracking-[-0.01em] text-ink xl:px-4 xl:text-[0.9375rem]">
                      {row.label}
                    </th>
                    <td className="p-2 text-center xl:px-4 xl:text-start">
                      {row.taxi === "sometimes" ? (
                        <span className="inline-flex rounded-full bg-amber-soft px-2.5 py-1 text-xs font-semibold text-amber-text">{copy.comparison.sometimes}</span>
                      ) : (
                        <>
                          <CrossIcon className="inline size-[1.125rem] text-sand" />
                          <span className="sr-only">{copy.comparison.no}</span>
                        </>
                      )}
                    </td>
                    <td className="p-2 text-center xl:px-6 xl:text-start">
                      <CheckHeavyIcon className="inline size-5 text-ink xl:text-[#1c968c]" />
                      <span className="sr-only">{copy.comparison.yes}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <ReviewsSection {...t.site.reviews} labels={t.site.carousel} className="bg-white" />

      {/* Company account enquiry */}
      <section id={ENQUIRY_ID} className="section-band scroll-mt-24 bg-white xl:pt-24">
        <div className="site-shell flex flex-col items-center gap-8 xl:gap-14">
          <SectionHeading lead={copy.enquiry.lead} accent={copy.enquiry.accent} stacked className="text-center" />
          <EnquiryForm copy={copy.enquiry} cities={CITIES.map((city) => t.cities.names[city])} services={services.map((service) => service.title)} />
        </div>
      </section>

      {/* Articles */}
      <section className="section-band overflow-hidden bg-cream">
        <div className="site-shell flex flex-col gap-6 xl:gap-12">
          <SectionIntro badge={copy.articles.badge} lead={copy.articles.lead} accent={copy.articles.accent} />
          <ul className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 xl:gap-[1.5625rem]">
            {copy.articles.items.map((article, index) => (
              <li key={article.title} className="flex w-[18.875rem] shrink-0 snap-start flex-col gap-3 md:w-auto xl:gap-4">
                <div className="relative aspect-[302/252] overflow-hidden rounded-[1.25rem] md:aspect-[424/431]">
                  <Image src={ARTICLE_IMAGES[index % ARTICLE_IMAGES.length]} alt={article.alt} fill sizes="(min-width: 768px) 33vw, 80vw" className="object-cover" />
                </div>
                <div className="flex flex-col gap-2 pe-3">
                  <h3 className="flex items-center gap-3 text-lg leading-[1.2] font-semibold tracking-[-0.01em] text-ink xl:text-2xl">
                    <span>{article.title}</span>
                    <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-full bg-amber-text text-white">
                      <ArrowRightSmallIcon className="size-4 rtl:-scale-x-100" />
                    </span>
                  </h3>
                  <p className="text-[0.9375rem] leading-[1.6] tracking-[-0.01em] text-muted-text">{article.copy}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <FaqSection
        badge={t.site.faq.badge}
        lead={t.site.faq.lead}
        accent={copy.faqAccent}
        clarityTitle={t.site.faq.clarityTitle}
        clarityBody={t.site.faq.clarityBody}
        contactLabel={t.site.faq.contact}
        contactHref={`#${ANCHORS.contact}`}
        items={t.site.faq.items}
      />
    </main>
  );
}
