import { BrandMark } from "@/components/brand/brand-mark";
import { Reveal } from "@/components/motion/reveal";
import { Eyebrow } from "@/components/ui/eyebrow";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { QUOTE_SECTION_ID } from "../quote-preset-context";
import { QuoteForm } from "./quote-form";
import styles from "./quote-section.module.css";

interface QuoteSectionProps {
  locale: Locale;
  quote: Dictionary["quote"];
  cityNames: Dictionary["cities"]["names"];
}

export function QuoteSection({ locale, quote, cityNames }: QuoteSectionProps) {
  return (
    <section id={QUOTE_SECTION_ID} className={styles.band}>
      <div className={styles.orbit} aria-hidden="true">
        <i />
        <i />
        <i />
      </div>

      <div className={`site-shell ${styles.layout}`}>
        <Reveal className={styles.intro}>
          <Eyebrow>{quote.eyebrow}</Eyebrow>
          <h2>{quote.title}</h2>
          <p className={styles.lead}>{quote.intro}</p>
          <div className={styles.seal}>
            <BrandMark />
            <span>
              {quote.seal.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </span>
          </div>
        </Reveal>

        <Reveal y={56}>
          <QuoteForm locale={locale} labels={quote} cityNames={cityNames} />
        </Reveal>
      </div>
    </section>
  );
}
