import type { Metadata } from "next";
import Image from "next/image";
import {
  ArrowRightIcon,
  CurrencyDollarSimpleIcon,
  DeviceMobileCameraIcon,
  HeadsetSmallIcon,
  PathIcon,
  WalletIcon,
} from "@/components/icons/design-icons";
import { CheckList } from "@/components/site/check-list";
import { FaqSection } from "@/components/site/faq-section";
import { PhotoHero } from "@/components/site/photo-hero";
import { ReviewsSection } from "@/components/site/reviews-section";
import { SectionHeading, SectionIntro } from "@/components/site/section-intro";
import { buttonClassName } from "@/components/ui/button";
import { ANCHORS } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { buildPageMetadata } from "@/lib/seo/metadata";

const WHY_ICONS = [WalletIcon, PathIcon, CurrencyDollarSimpleIcon, DeviceMobileCameraIcon, HeadsetSmallIcon];

function mailto(subject: string) {
  return `mailto:${siteConfig.contact.email}?subject=${encodeURIComponent(subject)}`;
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getDictionary(locale);
  return buildPageMetadata(locale, t.site.chauffeurs.meta, "/chauffeurs");
}

/** For chauffeurs: recruiting professional drivers, from the "For chauffeurs" design. */
export default async function ChauffeursPage() {
  const locale = await getLocale();
  const t = await getDictionary(locale);
  const copy = t.site.chauffeurs;
  const applyHref = mailto(copy.applySubject);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <PhotoHero
        image="/media/site/chauffeurs/hero.jpg"
        imageAlt={copy.hero.imageAlt}
        imageClassName="object-[60%_82%]"
        lead={copy.hero.lead}
        accent={copy.hero.accent}
        stacked
        sub={copy.hero.sub}
        checks={copy.hero.checks}
        className="min-h-[36rem] xl:min-h-[43.4375rem]"
      >
        <a href={applyHref} className={buttonClassName()}>
          {copy.hero.cta}
          <ArrowRightIcon className="rtl:-scale-x-100" />
        </a>
      </PhotoHero>

      {/* Rides that come to you */}
      <section className="bg-white py-12 xl:pt-[4.375rem] xl:pb-[4.375rem]">
        <div className="site-shell flex max-w-[34.0625rem] flex-col items-center gap-4 text-center">
          <SectionHeading lead={copy.intro.lead} accent={copy.intro.accent} className="xl:text-[3.5rem] xl:whitespace-nowrap" />
          <p className="text-sm leading-[1.6] font-medium tracking-[-0.01em] text-ink xl:text-[0.9375rem]">{copy.intro.body}</p>
        </div>
      </section>

      {/* Why drive with us */}
      <section className="section-band bg-cream">
        <div className="site-shell flex flex-col items-center gap-8 xl:max-w-[53.125rem] xl:gap-14">
          <SectionIntro badge={copy.why.badge} lead={copy.why.lead} accent={copy.why.accent} stacked align="center" />
          <div className="flex w-full flex-col gap-8 md:flex-row md:items-start md:gap-[2.0625rem]">
            <div
              className="relative aspect-[419/523] overflow-hidden rounded-[1.6rem] md:w-[26.1875rem] md:shrink-0"
              style={{ backgroundImage: "var(--gradient-peach)" }}
            >
              <div className="absolute top-[11.5%] left-1/2 h-[122.9%] w-[81.8%] -translate-x-1/2">
                <Image src="/media/site/chauffeurs/driver-app.webp" alt={copy.why.imageAlt} fill sizes="(min-width: 768px) 430px, 90vw" className="object-cover object-top" />
              </div>
              <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[21%] bg-[linear-gradient(180deg,rgba(25,22,18,0)_15%,rgba(25,22,18,0.5)_100%)] opacity-80" />
            </div>
            <ul className="flex flex-col gap-6 md:p-8">
              {copy.why.items.map((item, index) => {
                const Icon = WHY_ICONS[index % WHY_ICONS.length];
                return (
                  <li key={item.title} className="flex items-start gap-3">
                    <Icon className="size-5 shrink-0 text-amber-text" />
                    <div className="flex flex-col gap-1.5 pe-3 md:max-w-[18.875rem]">
                      <h3 className="text-base leading-[1.3] font-semibold tracking-[-0.01em] text-ink">{item.title}</h3>
                      <p className="text-[0.9375rem] leading-[1.55] tracking-[-0.01em] text-muted-text">{item.copy}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>

      {/* How to join */}
      <section className="section-band bg-white">
        <div className="site-shell flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-[3.75rem] xl:max-w-[68.4375rem]">
          <div className="flex flex-col items-start gap-6 lg:w-[34.5625rem] lg:shrink-0 xl:gap-8">
            <SectionIntro badge={copy.join.badge} lead={copy.join.lead} accent={copy.join.accent} stacked className="gap-3" />
            <CheckList items={copy.join.steps} separator=" :" />
            <a href={applyHref} className={buttonClassName({ variant: "dark" })}>
              {copy.join.cta}
              <ArrowRightIcon className="rtl:-scale-x-100" />
            </a>
          </div>
          <div className="relative aspect-[482/562] w-full overflow-hidden rounded-3xl lg:flex-1">
            <Image src="/media/site/chauffeurs/join.jpg" alt={copy.join.imageAlt} fill sizes="(min-width: 1024px) 482px, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="section-band bg-white">
        <div className="site-shell flex flex-col-reverse gap-8 lg:flex-row lg:items-center lg:gap-[3.75rem] xl:max-w-[68.4375rem]">
          <div className="relative aspect-[482/562] w-full overflow-hidden rounded-3xl bg-ink lg:w-[30.125rem] lg:shrink-0">
            <Image src="/media/site/chauffeurs/requirements.jpg" alt={copy.requirements.imageAlt} fill sizes="(min-width: 1024px) 482px, 100vw" className="object-cover" />
          </div>
          <div className="flex flex-col items-start gap-6 xl:gap-8">
            <SectionIntro badge={copy.requirements.badge} lead={copy.requirements.lead} accent={copy.requirements.accent} stacked className="gap-3" />
            <CheckList items={copy.requirements.items} separator=" :" />
            <a href={mailto(copy.checklistSubject)} className={buttonClassName({ variant: "dark" })}>
              {copy.requirements.cta}
              <ArrowRightIcon className="rtl:-scale-x-100" />
            </a>
          </div>
        </div>
      </section>

      <ReviewsSection
        badge={copy.stories.badge}
        lead={copy.stories.lead}
        accent={copy.stories.accent}
        rating={t.site.reviews.rating}
        ratingLabel={t.site.reviews.ratingLabel}
        items={copy.stories.items}
        labels={t.site.carousel}
      />

      <FaqSection
        badge={t.site.faq.badge}
        lead={t.site.faq.lead}
        accent={copy.faqAccent}
        clarityTitle={t.site.faq.clarityTitle}
        clarityBody={t.site.faq.clarityBody}
        contactLabel={t.site.faq.contact}
        contactHref={`#${ANCHORS.contact}`}
        items={copy.faq}
      />
    </main>
  );
}
