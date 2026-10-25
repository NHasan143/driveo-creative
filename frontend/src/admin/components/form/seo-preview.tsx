"use client";

import { useWatch } from "react-hook-form";
import { DEFAULT_LOCALE } from "@/admin/lib/content/types";
import { useFormLocale } from "./form-locale";

interface SeoPreviewProps {
  /** Fallback title field, e.g. "title", used when the SEO title is empty. */
  titleFallback: string;
  descriptionFallback: string;
  path: (slug: string) => string;
}

/** Approximates how the page appears in Google for the language being edited. */
export function SeoPreview({ titleFallback, descriptionFallback, path }: SeoPreviewProps) {
  const locale = useFormLocale();
  const pick = (values: Record<string, string> | undefined) => values?.[locale]?.trim() || values?.[DEFAULT_LOCALE]?.trim() || "";
  const seoTitle = useWatch({ name: "seoTitle" }) as Record<string, string> | undefined;
  const seoDescription = useWatch({ name: "seoDescription" }) as Record<string, string> | undefined;
  const fallbackTitle = useWatch({ name: titleFallback }) as Record<string, string> | undefined;
  const fallbackDescription = useWatch({ name: descriptionFallback }) as Record<string, string> | undefined;
  const slug = (useWatch({ name: "slug" }) as string) || "page";

  const title = pick(seoTitle) || (pick(fallbackTitle) ? `${pick(fallbackTitle)} | Driveo Exclusive` : "Page title");
  const description = pick(seoDescription) || pick(fallbackDescription) || "A short description of the page.";

  return (
    <div className="rounded-lg border border-border bg-surface p-4" aria-label="Search result preview">
      <p className="truncate text-xs text-muted-foreground" dir="ltr">
        driveoexclusive.com{path(slug)}?lang={locale}
      </p>
      <p className="mt-1 truncate text-[1.05rem] leading-snug text-[#1a0dab] dark:text-[#8ab4f8]" dir={locale === "ar" ? "rtl" : "ltr"}>
        {title}
      </p>
      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground" dir={locale === "ar" ? "rtl" : "ltr"}>
        {description}
      </p>
    </div>
  );
}
