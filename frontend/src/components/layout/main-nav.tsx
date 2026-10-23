"use client";

import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import { SITE_PAGES, pagePath } from "@/config/navigation";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { cn } from "@/lib/cn";

interface MainNavProps {
  locale: Locale;
  nav: Dictionary["nav"];
  className?: string;
  linkClassName?: string;
}

/**
 * Page links with the current page marked. Reads the active route segment
 * rather than the URL, which stays correct behind the `?lang=` rewrite.
 */
export function MainNav({ locale, nav, className, linkClassName }: MainNavProps) {
  const active = useSelectedLayoutSegment();

  return (
    <nav aria-label={nav.main} className={className}>
      {SITE_PAGES.map(({ key, segment }) => {
        const current = active === segment;
        return (
          <Link
            key={key}
            href={localePath(locale, pagePath(segment))}
            aria-current={current ? "page" : undefined}
            className={cn(
              "mono-label relative transition-colors duration-300 hover:text-accent",
              current && "text-accent",
              linkClassName,
            )}
          >
            {nav[key]}
          </Link>
        );
      })}
    </nav>
  );
}
