import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";
import { ANCHORS } from "@/config/navigation";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { NavService } from "@/lib/content/site-services";
import { HeaderCta } from "./header-cta";
import { HeaderFrame } from "./header-frame";
import { LanguageSwitcher } from "./language-switcher";
import { MobileMenu, type MobileMenuLinks } from "./mobile-menu";
import { NavDropdown } from "./nav-dropdown";

interface SiteHeaderProps {
  locale: Locale;
  nav: Dictionary["nav"];
  site: Dictionary["site"]["nav"];
  services: NavService[];
}

const linkClass =
  "inline-flex min-h-11 items-center text-[0.9375rem] leading-[1.2] font-medium tracking-[-0.03em] whitespace-nowrap transition-opacity hover:opacity-70";

/** Logo, the five design links (xl and up), language and the gold call to action; a menu below xl. */
export function SiteHeader({ locale, nav, site, services }: SiteHeaderProps) {
  const href = (path: string) => localePath(locale, path);
  const links: MobileMenuLinks = {
    services: {
      label: site.ourServices,
      items: services.map((service) => ({ href: href(service.path), label: service.title, icon: service.icon })),
      footer: { href: href("/services"), label: site.allServices },
    },
    business: {
      label: site.forBusiness,
      items: site.businessMenu.map((item) => ({ href: `${href("/business")}#${item.hash}`, label: item.label })),
      footer: { href: href("/business"), label: site.forBusiness },
    },
    chauffeurs: { href: href("/chauffeurs"), label: site.forChauffeurs },
    about: { href: `${href("/")}#${ANCHORS.about}`, label: site.about },
    contact: { href: `#${ANCHORS.contact}`, label: site.contact },
  };

  return (
    <HeaderFrame>
      <div className="site-shell flex h-[var(--header-height)] items-center gap-4 xl:grid xl:grid-cols-[1fr_auto_1fr] xl:gap-8">
        <Link href={href("/")} className="flex shrink-0 items-center" aria-label={nav.home}>
          <BrandLogo
            tone="light"
            tagline={site.exclusive}
            priority
            className="hidden group-data-[overlay]/header:block"
          />
          <BrandLogo
            tone="dark"
            tagline={site.exclusive}
            priority
            className="group-data-[overlay]/header:hidden"
          />
        </Link>

        <nav aria-label={nav.main} className="hidden items-center gap-8 xl:flex">
          <NavDropdown label={links.services.label} items={links.services.items} footer={links.services.footer} className={linkClass} />
          <NavDropdown label={links.business.label} items={links.business.items} footer={links.business.footer} className={linkClass} />
          <Link href={links.chauffeurs.href} className={linkClass}>
            {links.chauffeurs.label}
          </Link>
          <Link href={links.about.href} className={linkClass}>
            {links.about.label}
          </Link>
          <a href={links.contact.href} className={linkClass}>
            {links.contact.label}
          </a>
        </nav>

        <div className="ms-auto flex shrink-0 items-center gap-3.5 xl:justify-self-end">
          <LanguageSwitcher locale={locale} label={nav.language} />
          <HeaderCta locale={locale} requestQuote={site.requestQuote} signIn={site.signIn} account={nav.account} />
          <MobileMenu locale={locale} nav={nav} site={site} links={links} />
        </div>
      </div>
    </HeaderFrame>
  );
}
