import Link from "next/link";
import type { ReactNode } from "react";
import { BrandMark } from "@/components/brand/brand-mark";
import { socialIcons, WhatsAppIcon } from "@/components/icons/social-icons";
import { siteConfig, type SocialNetwork } from "@/config/site";
import { CITIES } from "@/domain/booking";
import { InstallAppButton } from "@/features/pwa/install-app-button";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { NavService } from "@/lib/content/site-services";
import { Copyright } from "./copyright";

interface SiteFooterProps {
  locale: Locale;
  nav: Dictionary["nav"];
  footer: Dictionary["footer"];
  install: Dictionary["install"];
  cityNames: Dictionary["cities"]["names"];
  services: NavService[];
  allServices: string;
}

const linkClass = "text-sm text-muted-foreground transition-colors hover:text-foreground";

function Column({ title, children }: { title: string; children: ReactNode }) {
  return (
    <nav aria-label={title}>
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <ul className="mt-4 grid gap-3">{children}</ul>
    </nav>
  );
}

export function SiteFooter({ locale, nav, footer, install, cityNames, services, allServices }: SiteFooterProps) {
  const socialNetworks = Object.keys(siteConfig.social) as SocialNetwork[];
  const href = (path: string) => localePath(locale, path);

  return (
    <footer id="contact" className="border-t border-border bg-secondary">
      <div className="site-shell py-14">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <Link href={href("/")} className="flex items-center gap-3" aria-label={nav.home}>
            <BrandMark size="md" />
            <span className="font-display text-xl">{siteConfig.name}</span>
          </Link>
          <InstallAppButton labels={install} />
        </div>

        <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <Column title={footer.company}>
            <li><Link href={href("/process")} className={linkClass}>{nav.process}</Link></li>
            <li><Link href={href("/fleet")} className={linkClass}>{nav.fleet}</Link></li>
            <li><Link href={href("/help")} className={linkClass}>{footer.help}</Link></li>
          </Column>

          <Column title={footer.servicesTitle}>
            {services.map((service) => (
              <li key={service.slug}>
                <Link href={href(service.path)} className={linkClass}>{service.title}</Link>
              </li>
            ))}
            <li><Link href={href("/services")} className={linkClass}>{allServices}</Link></li>
          </Column>

          <Column title={footer.cities}>
            {CITIES.map((city) => (
              <li key={city}>
                <Link href={`${href("/cities")}#${city}`} className={linkClass}>{cityNames[city]}</Link>
              </li>
            ))}
          </Column>

          <Column title={footer.explore}>
            <li><Link href={href("/booking")} className={linkClass}>{footer.manage}</Link></li>
            <li><Link href={href("/account")} className={linkClass}>{footer.account}</Link></li>
          </Column>

          <div>
            <p className="text-sm font-semibold text-foreground">{footer.contact}</p>
            <ul className="mt-4 grid gap-3">
              <li><a href={siteConfig.contact.phoneHref} className={linkClass} dir="ltr">{siteConfig.contact.phone}</a></li>
              <li><a href={`mailto:${siteConfig.contact.email}`} className={linkClass}>{siteConfig.contact.email}</a></li>
              <li className="text-sm text-muted-foreground/80">{footer.contactNote}</li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-6 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <Copyright text={footer.copyright} />
            <Link href={href("/terms")} className="transition-colors hover:text-foreground">{footer.terms}</Link>
            <Link href={href("/privacy")} className="transition-colors hover:text-foreground">{footer.privacy}</Link>
            <Link href={href("/cookies")} className="transition-colors hover:text-foreground">{footer.cookies}</Link>
          </div>

          <div className="flex flex-wrap gap-[0.65rem]" aria-label={footer.social}>
            <a
              href={siteConfig.contact.whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="social-icon"
              aria-label="WhatsApp"
              title="WhatsApp"
            >
              <WhatsAppIcon aria-hidden="true" />
            </a>
            {socialNetworks.map((network) => {
              const { label, Icon } = socialIcons[network];
              return (
                <a
                  key={network}
                  href={siteConfig.social[network]}
                  target="_blank"
                  rel="noreferrer"
                  className="social-icon"
                  aria-label={label}
                  title={label}
                >
                  <Icon aria-hidden="true" />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}
