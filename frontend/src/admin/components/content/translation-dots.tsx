import { coverageOf, percent } from "@/admin/lib/content/completeness";
import { LOCALE_LABELS, LOCALES } from "@/admin/lib/content/types";
import { cn } from "@/admin/lib/cn";

/** Four small language chips: green when fully translated, amber when partly, grey when empty. */
export function TranslationDots({ record }: { record: unknown }) {
  const coverage = coverageOf(record);
  return (
    <span className="inline-flex gap-1" aria-label="Translation status">
      {LOCALES.map((locale) => {
        const done = percent(coverage[locale]);
        return (
          <span
            key={locale}
            title={`${LOCALE_LABELS[locale]}: ${done}% translated`}
            className={cn(
              "rounded px-1 text-[0.625rem] leading-4 font-bold uppercase",
              done === 100 ? "bg-success-soft text-success" : done > 0 ? "bg-warning-soft text-warning" : "bg-surface-muted text-muted-foreground",
            )}
          >
            {locale}
            <span className="sr-only">: {done}%</span>
          </span>
        );
      })}
    </span>
  );
}
