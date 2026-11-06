import Link from "next/link";
import { BrandMark } from "@/components/brand/brand-mark";
import { buttonClassName } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { bookHref } from "@/features/booking/book-link";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { NavService } from "@/lib/content/site-services";
import { AccountLink } from "./account-link";
import { HeaderFrame } from "./header-frame";
import { LanguageSwitcher } from "./language-switcher";
import { MainNav } from "./main-nav";
import { MobileMenu } from "./mobile-menu";

interface SiteHeaderProps {
  locale: Locale;
  nav: Dictionary["nav"];
  services: NavService[];
  allServices: string;
}

/** One row: logo, page links (xl and up), language, account and the booking button; a menu below xl. */
export function SiteHeader({ locale, nav, services, allServices }: SiteHeaderProps) {
  return (
    <HeaderFrame>
      <div className="site-shell flex h-[4.5rem] items-center gap-3">
        <Link href={localePath(locale)} className="flex min-w-0 items-center gap-3" aria-label={nav.home}>
          <BrandMark priority />
          <span className="hidden font-display text-lg leading-none tracking-wide whitespace-nowrap lg:inline">
            {siteConfig.name}
          </span>
        </Link>

        <MainNav
          locale={locale}
          nav={nav}
          services={services}
          allServices={allServices}
          className="ms-auto hidden items-center gap-7 xl:flex"
          linkClassName="font-sans text-[0.9rem] font-medium tracking-normal normal-case text-foreground/85 hover:text-foreground"
        />

        <div className="ms-auto flex shrink-0 items-center gap-2 xl:ms-6">
          <LanguageSwitcher locale={locale} label={nav.language} />
          <AccountLink locale={locale} signIn={nav.signIn} account={nav.account} />
          <Link href={bookHref(locale)} className={buttonClassName({ size: "compact" })}>
            {nav.book}
          </Link>
          <MobileMenu locale={locale} nav={nav} services={services} allServices={allServices} />
        </div>
      </div>
    </HeaderFrame>
  );
}
