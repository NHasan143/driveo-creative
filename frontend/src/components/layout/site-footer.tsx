import { BrandMark } from "@/components/brand/brand-mark";
import { socialIcons, WhatsAppIcon } from "@/components/icons/social-icons";
import { ButtonLink } from "@/components/ui/button";
import { siteConfig, type SocialNetwork } from "@/config/site";
import { CITIES } from "@/domain/booking";
import { InstallAppButton } from "@/features/pwa/install-app-button";
import type { Dictionary } from "@/i18n/get-dictionary";

interface SiteFooterProps {
  footer: Dictionary["footer"];
  install: Dictionary["install"];
  cityNames: Dictionary["cities"]["names"];
}

const footerLink = "inline-block text-[0.9rem] text-foreground transition-colors hover:text-accent";

export function SiteFooter({ footer, install, cityNames }: SiteFooterProps) {
  const socialNetworks = Object.keys(siteConfig.social) as SocialNetwork[];

  return (
    <footer id="contact" className="border-t border-border bg-secondary">
      <div className="site-shell py-16">
        <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <BrandMark size="md" />
              <span className="font-mono text-xs tracking-[0.28em] uppercase">{siteConfig.legalName}</span>
            </div>
            <p className="mt-6 max-w-sm font-display text-3xl">{footer.tagline}</p>
            <ButtonLink href="#quote" className="mt-7">
              {footer.cta} <span aria-hidden="true">↗</span>
            </ButtonLink>
          </div>

          <div>
            <p className="mono-label">{footer.contact}</p>
            <a href={siteConfig.contact.phoneHref} className={`${footerLink} mt-5`}>
              📞 {siteConfig.contact.phone}
            </a>
            <br />
            <a href={`mailto:${siteConfig.contact.email}`} className={`${footerLink} mt-3`}>
              📧 {siteConfig.contact.email}
            </a>
            <p className="mt-3 text-sm text-muted-foreground">{footer.contactNote}</p>

            <div className="mt-6 flex flex-wrap gap-[0.65rem]" aria-label={footer.social}>
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

            <div className="mt-5">
              <p className="mono-label">{install.label}</p>
              <InstallAppButton labels={install} />
            </div>
          </div>

          <div>
            <p className="mono-label">{footer.cities}</p>
            <ul className="mt-3 text-sm leading-7 text-muted-foreground">
              {CITIES.map((city) => (
                <li key={city}>{cityNames[city]}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-border pt-6 font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase sm:flex-row sm:justify-between">
          <span>{footer.copyright}</span>
          <span>{footer.motto}</span>
        </div>
      </div>
    </footer>
  );
}
