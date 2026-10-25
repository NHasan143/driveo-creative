"use client";

import { Check } from "lucide-react";
import { createContext, useContext, type ReactNode } from "react";
import { percent, type Coverage } from "@/admin/lib/content/completeness";
import { LOCALE_LABELS, LOCALES, type Locale } from "@/admin/lib/content/types";
import { cn } from "@/admin/lib/cn";

const FormLocaleContext = createContext<Locale>("en");

/** The language every localized field in the form is currently showing. */
export function useFormLocale() {
  return useContext(FormLocaleContext);
}

export function FormLocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return <FormLocaleContext.Provider value={locale}>{children}</FormLocaleContext.Provider>;
}

interface LanguageSwitcherProps {
  value: Locale;
  onChange: (locale: Locale) => void;
  coverage: Coverage;
}

/** Segmented control above a form: pick the language to edit, see how complete each one is. */
export function LanguageSwitcher({ value, onChange, coverage }: LanguageSwitcherProps) {
  return (
    <div role="tablist" aria-label="Editing language" className="inline-flex flex-wrap gap-1 rounded-xl border border-border bg-surface p-1 shadow-card">
      {LOCALES.map((locale) => {
        const done = percent(coverage[locale]);
        const active = value === locale;
        return (
          <button
            key={locale}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(locale)}
            className={cn(
              "flex cursor-pointer items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors",
              active ? "bg-primary text-primary-foreground shadow-card" : "text-muted-foreground hover:bg-surface-muted hover:text-foreground",
            )}
          >
            <span lang={locale}>{LOCALE_LABELS[locale]}</span>
            {done === 100 ? (
              <Check aria-label="complete" className="size-3.5" />
            ) : (
              <span
                className={cn(
                  "rounded-full px-1.5 text-[0.65rem] font-bold tabular-nums",
                  active ? "bg-white/20" : "bg-warning-soft text-warning",
                )}
                aria-label={`${done}% translated`}
              >
                {done}%
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
