import { BrandMark } from "@/components/brand/brand-mark";
import { ButtonLink } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { LanguageSwitcher } from "./language-switcher";

interface SiteHeaderProps {
  locale: Locale;
  nav: Dictionary["nav"];
}

export function SiteHeader({ locale, nav }: SiteHeaderProps) {
  const links = [
    { label: nav.services, href: "#services" },
    { label: nav.fleet, href: "#fleet" },
    { label: nav.cities, href: "#cities" },
    { label: nav.process, href: "#process" },
  ];

  return (
    <header className="absolute inset-x-0 top-0 z-50 border-b border-border/60 bg-background/45 backdrop-blur-md">
      <div className="site-shell flex h-20 items-center justify-between gap-3">
        <a href="#top" className="flex min-w-0 items-center gap-3" aria-label={nav.home}>
          <BrandMark priority />
          <span className="max-w-[8.5rem] font-mono text-[0.58rem] leading-tight font-bold tracking-[0.1em] uppercase sm:max-w-64 sm:text-[0.68rem] sm:tracking-[0.18em]">
            {siteConfig.legalName}
          </span>
        </a>

        <nav aria-label={nav.main} className="hidden items-center gap-8 lg:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="mono-label transition-colors duration-300 hover:text-accent"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher locale={locale} label={nav.language} />
          <ButtonLink href="#quote" size="compact">
            {nav.quote} <span aria-hidden="true">↘</span>
          </ButtonLink>
        </div>
      </div>
    </header>
  );
}
