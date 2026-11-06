import { PageBanner } from "@/components/page/page-banner";
import type { Locale } from "@/i18n/config";

export interface LegalSection {
  title: string;
  content: string[];
}

interface LegalArticleProps {
  locale: Locale;
  homeLabel: string;
  trailLabel: string;
  title: string;
  lastUpdated: string;
  intro: string;
  /** Unused since the banner redesign (no eyebrow or buttons); kept so the pages that pass them still compile. */
  eyebrow?: string;
  cta?: string;
  whatsappLabel?: string;
  sections: LegalSection[];
}

export function LegalArticle({
  locale,
  homeLabel,
  trailLabel,
  title,
  lastUpdated,
  intro,
  sections,
}: LegalArticleProps) {
  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <PageBanner
        locale={locale}
        title={title}
        intro={intro}
        crumbs={[{ label: homeLabel, path: "/" }, { label: trailLabel }]}
      />

      <section className="section-band bg-background">
        <div className="site-shell max-w-4xl">
          <p className="mono-label mb-10 text-muted-foreground">{lastUpdated}</p>
          <div className="space-y-12">
            {sections.map((section, idx) => (
              <article key={section.title} className="border-b border-border/60 pb-10 last:border-b-0">
                <h2 className="mb-4 font-display text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
                  <span className="me-3 font-mono text-sm text-primary">0{idx + 1}.</span>
                  {section.title}
                </h2>
                <div className="space-y-4 text-base leading-relaxed text-muted-foreground">
                  {section.content.map((paragraph, pIdx) => (
                    <p key={pIdx}>{paragraph}</p>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
