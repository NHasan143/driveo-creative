import { PageHero } from "@/components/page/page-hero";
import type { Locale } from "@/i18n/config";

export interface LegalSection {
  title: string;
  content: string[];
}

interface LegalArticleProps {
  locale: Locale;
  homeLabel: string;
  trailLabel: string;
  eyebrow: string;
  title: string;
  lastUpdated: string;
  intro: string;
  cta?: string;
  whatsappLabel?: string;
  sections: LegalSection[];
}

export function LegalArticle({
  locale,
  homeLabel,
  trailLabel,
  eyebrow,
  title,
  lastUpdated,
  intro,
  cta = "Book journey",
  whatsappLabel = "WhatsApp",
  sections,
}: LegalArticleProps) {
  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <PageHero
        locale={locale}
        crumbs={{ home: homeLabel, trail: [{ label: trailLabel }] }}
        eyebrow={eyebrow}
        title={title}
        intro={intro}
        image={{ src: "/media/driveo-journey-poster.jpg", alt: "" }}
        cta={cta}
        whatsappLabel={whatsappLabel}
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
