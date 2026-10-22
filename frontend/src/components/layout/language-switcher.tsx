"use client";

import { ChevronDown, Globe } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useTransition, type ChangeEvent } from "react";
import { LOCALE_COOKIE, localeMeta, locales, type Locale } from "@/i18n/config";
import styles from "./language-switcher.module.css";

interface LanguageSwitcherProps {
  locale: Locale;
  label: string;
}

export function LanguageSwitcher({ locale, label }: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    const next = event.target.value as Locale;
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;

    const segments = pathname.split("/");
    segments[1] = next;
    startTransition(() => router.push(segments.join("/") || `/${next}`, { scroll: false }));
  }

  return (
    <span className={styles.root} data-pending={isPending || undefined}>
      <Globe aria-hidden="true" />
      <select aria-label={label} value={locale} onChange={handleChange}>
        {locales.map((code) => (
          <option key={code} value={code} lang={code}>
            {localeMeta[code].label}
          </option>
        ))}
      </select>
      <ChevronDown aria-hidden="true" className={styles.chevron} />
    </span>
  );
}
