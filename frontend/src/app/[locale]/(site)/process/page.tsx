import { Check } from "lucide-react";
import type { Metadata } from "next";
import { BookCta } from "@/components/page/book-cta";
import { FeatureCards } from "@/components/page/feature-cards";
import { PageBanner } from "@/components/page/page-banner";
import { PageSection } from "@/components/page/page-section";
import { StepCards } from "@/components/page/step-cards";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { buildPageMetadata } from "@/lib/seo/metadata";

const PATH = "/process";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const { pages } = await getDictionary(locale);
  return buildPageMetadata(locale, pages.process.meta, PATH);
}

export default async function ProcessPage() {
  const locale = await getLocale();
  const t = await getDictionary(locale);
  const page = t.pages.process;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <PageBanner
        locale={locale}
        title={page.title}
        intro={page.intro}
        image="/media/paris-hotel-evening.jpg"
        explore={t.servicePage.explore}
        crumbs={[{ label: t.pages.breadcrumbHome, path: "/" }, { label: t.nav.process }]}
      />

      <div id="content" className="scroll-mt-24">
        <PageSection title={t.process.title}>
          <StepCards
            steps={t.process.items.map((item, index) => ({ title: item.title, copy: page.details[index] ?? item.copy }))}
          />
        </PageSection>

        <PageSection title={page.checklistTitle} intro={page.checklistIntro} tone="tinted">
          <ul className="grid gap-3 sm:grid-cols-2">
            {page.checklist.map((item) => (
              <li key={item} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-5 text-sm">
                <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
                {item}
              </li>
            ))}
          </ul>
        </PageSection>

        <PageSection title={page.commitmentsTitle}>
          <FeatureCards items={t.assurance} columns={4} />
        </PageSection>

        <BookCta locale={locale} title={t.booking.title} intro={t.booking.intro} cta={t.nav.book} />
      </div>
    </main>
  );
}
