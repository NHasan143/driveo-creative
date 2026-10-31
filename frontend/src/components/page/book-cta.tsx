import { BookButton } from "@/features/booking";
import type { BookQuery } from "@/features/booking/book-link";
import type { Locale } from "@/i18n/config";

interface BookCtaProps {
  locale: Locale;
  title: string;
  intro: string;
  cta: string;
  preset?: BookQuery;
}

/** The closing band of every page: one line and the button to the booking page. */
export function BookCta({ locale, title, intro, cta, preset }: BookCtaProps) {
  return (
    <section className="bg-foreground py-20 text-background sm:py-24">
      <div className="site-shell text-center">
        <h2 className="mx-auto max-w-3xl font-display text-[clamp(2rem,4.5vw,3.6rem)] leading-[1.06] font-medium text-balance">
          {title}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-background/70">{intro}</p>
        <BookButton locale={locale} preset={preset} className="mt-8">
          {cta}
        </BookButton>
      </div>
    </section>
  );
}
