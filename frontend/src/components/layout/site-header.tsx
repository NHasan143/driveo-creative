import Link from "next/link";
import { BrandMark } from "@/components/brand/brand-mark";
import { ButtonLink } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { NavService } from "@/lib/content/site-services";
import { LanguageSwitcher } from "./language-switcher";
import { MainNav } from "./main-nav";

interface SiteHeaderProps {
  locale: Locale;
  nav: Dictionary["nav"];
  services: NavService[];
  allServices: string;
}

export function SiteHeader({ locale, nav, services, allServices }: SiteHeaderProps) {
  return (
    <header className="absolute inset-x-0 top-0 z-50 border-b border-border/60 bg-background/45 backdrop-blur-md">
      <div className="site-shell flex h-20 items-center justify-between gap-3">
        <Link href={localePath(locale)} className="flex min-w-0 items-center gap-3" aria-label={nav.home}>
          <BrandMark priority />
          {/* Phones show the logo alone; the buttons need the room and the link has an aria-label. */}
          <span className="hidden max-w-64 font-mono text-[0.68rem] leading-tight font-bold tracking-[0.18em] uppercase sm:line-clamp-2">
            {siteConfig.legalName}
          </span>
        </Link>

        <MainNav
          locale={locale}
          nav={nav}
          services={services}
          allServices={allServices}
          className="hidden shrink-0 items-center gap-8 xl:flex"
        />

        {/* The language switcher and quote button share one size so they read as a pair. */}
        <div className="flex shrink-0 items-center gap-2">
          <LanguageSwitcher locale={locale} label={nav.language} />
          {/* Every page ends with the quote form, so this anchor always resolves. */}
          <ButtonLink href="#quote" size="compact">
            {nav.quote} <span aria-hidden="true">↘</span>
          </ButtonLink>
        </div>
      </div>

      {/*
        Below xl (1280px) the page links move to a slim second row instead of a hamburger menu;
        between 1024 and 1279px there isn't room for them beside the buttons in French or Bulgarian.
        It must stay a single line: the hero padding assumes this header height, and the
        row can't scroll sideways because that would clip the Services dropdown. On phones
        the type and spacing scale with the viewport so even Bulgarian fits at 320px.
      */}
      <MainNav
        locale={locale}
        nav={nav}
        services={services}
        allServices={allServices}
        className="site-shell flex min-h-11 flex-nowrap items-center justify-between gap-x-2 border-t border-border/60 sm:justify-start sm:gap-x-6 xl:hidden"
        linkClassName="shrink-0 whitespace-nowrap text-[clamp(0.55rem,2.6vw,0.6rem)] tracking-[0.08em] sm:tracking-[0.2em]"
      />
    </header>
  );
}
