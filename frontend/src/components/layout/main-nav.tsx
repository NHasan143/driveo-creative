"use client";

import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import { SITE_PAGES, pagePath } from "@/config/navigation";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { NavService } from "@/lib/content/site-services";
import { cn } from "@/lib/cn";
import { ServicesDropdown } from "./services-dropdown";

interface MainNavProps {
  locale: Locale;
  nav: Dictionary["nav"];
  services: NavService[];
  allServices: string;
  className?: string;
  linkClassName?: string;
}

/**
 * Page links with the current page marked. Reads the active route segment
 * rather than the URL, which stays correct behind the `?lang=` rewrite.
 */
export function MainNav({ locale, nav, services, allServices, className, linkClassName }: MainNavProps) {
  const active = useSelectedLayoutSegment();

  return (
    <nav aria-label={nav.main} className={className}>
      {SITE_PAGES.map(({ key, segment }) => {
        const current = active === segment;
        const linkClasses = cn(
          "mono-label relative inline-flex min-h-11 items-center transition-colors duration-300 hover:text-accent",
          current && "text-accent",
          linkClassName,
        );
        if (key === "services") {
          return (
            <ServicesDropdown
              key={key}
              locale={locale}
              label={nav.services}
              items={services}
              allServices={allServices}
              current={current}
              className={linkClasses}
            />
          );
        }
        return (
          <Link
            key={key}
            href={localePath(locale, pagePath(segment))}
            aria-current={current ? "page" : undefined}
            className={linkClasses}
          >
            {nav[key]}
          </Link>
        );
      })}
    </nav>
  );
}
