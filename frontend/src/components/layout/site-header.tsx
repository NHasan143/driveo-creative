import Link from "next/link";
import { BrandMark } from "@/components/brand/brand-mark";
import { ButtonLink } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { LanguageSwitcher } from "./language-switcher";
import { MainNav } from "./main-nav";

interface SiteHeaderProps {
  locale: Locale;
  nav: Dictionary["nav"];
  services: Dictionary["services"]["items"];
  allServices: string;
}

export function SiteHeader({ locale, nav, services, allServices }: SiteHeaderProps) {
  return (
    <header className="absolute inset-x-0 top-0 z-50 border-b border-border/60 bg-background/45 backdrop-blur-md">
      <div className="site-shell flex h-20 items-center justify-between gap-3">
        <Link href={localePath(locale)} className="flex min-w-0 items-center gap-3" aria-label={nav.home}>
          <BrandMark priority />
          <span className="max-w-[8.5rem] font-mono text-[0.58rem] leading-tight font-bold tracking-[0.1em] uppercase sm:max-w-64 sm:text-[0.68rem] sm:tracking-[0.18em]">
            {siteConfig.legalName}
          </span>
        </Link>

        <MainNav locale={locale} nav={nav} services={services} allServices={allServices} className="hidden items-center gap-8 lg:flex" />

        <div className="flex items-center gap-2">
          <LanguageSwitcher locale={locale} label={nav.language} />
          {/* Every page ends with the quote form, so this anchor always resolves. */}
          <ButtonLink href="#quote" size="compact">
            {nav.quote} <span aria-hidden="true">↘</span>
          </ButtonLink>
        </div>
      </div>

      {/* Below lg the page links move to a slim second row instead of a hamburger menu. */}
      <MainNav
        locale={locale}
        nav={nav}
        services={services}
        allServices={allServices}
        className="site-shell flex min-h-11 flex-wrap items-center gap-x-6 border-t border-border/60 lg:hidden"
        linkClassName="shrink-0 text-[0.6rem]"
      />
    </header>
  );
}
