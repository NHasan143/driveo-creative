import type { Metadata } from "next";
import { LegalArticle } from "@/features/legal/legal-article";
import { LEGAL_DOCS } from "@/features/legal/legal-content";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { buildPageMetadata } from "@/lib/seo/metadata";

const PATH = "/privacy";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const doc = LEGAL_DOCS.privacy[locale];
  return buildPageMetadata(locale, { title: doc.metaTitle, description: doc.metaDescription }, PATH);
}

export default async function PrivacyPage() {
  const locale = await getLocale();
  const t = await getDictionary(locale);
  const doc = LEGAL_DOCS.privacy[locale];

  return (
    <LegalArticle
      locale={locale}
      homeLabel={t.pages.breadcrumbHome}
      trailLabel={t.footer.privacy}
      eyebrow={doc.eyebrow}
      title={doc.title}
      lastUpdated={doc.lastUpdated}
      intro={doc.intro}
      sections={doc.sections}
    />
  );
}
