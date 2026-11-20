import Link from "next/link";
import type { ReactNode } from "react";
import { BrandLogo } from "@/components/brand/brand-logo";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  MailboxIcon,
  MapPinOutlineIcon,
  PhoneIcon,
} from "@/components/icons/design-icons";
import { socialIcons } from "@/components/icons/social-icons";
import { ANCHORS } from "@/config/navigation";
import { servicePath } from "@/config/services";
import { siteConfig } from "@/config/site";
import { CITIES } from "@/domain/booking";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";

interface SiteFooterProps {
  locale: Locale;
  nav: Dictionary["nav"];
  footer: Dictionary["footer"];
  site: Dictionary["site"];
  cityNames: Dictionary["cities"]["names"];
}

const linkClass = "text-base leading-[1.6] tracking-[-0.01em] text-sand-light transition-colors hover:text-white xl:text-lg";
const TikTokIcon = socialIcons.tiktok.Icon;

function Column({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <nav aria-label={title} className={className}>
      <p className="text-base leading-[1.4] font-semibold tracking-[-0.01em] text-amber xl:text-lg">{title}</p>
      <ul className="mt-4 flex flex-col gap-3 xl:mt-5 xl:gap-4">{children}</ul>
    </nav>
  );
}

/** Dark footer: brand and socials, four link columns, and the copyright row between dashed rules. */
export function SiteFooter({ locale, nav, footer, site, cityNames }: SiteFooterProps) {
  const href = (path: string) => localePath(locale, path);
  const copy = site.footer;
  const socials = [
    { label: "Instagram", href: siteConfig.social.instagram, Icon: InstagramIcon },
    { label: "LinkedIn", href: siteConfig.social.linkedin, Icon: LinkedinIcon },
    { label: "Facebook", href: siteConfig.social.facebook, Icon: FacebookIcon },
    { label: "TikTok", href: siteConfig.social.tiktok, Icon: TikTokIcon },
  ];
  const contactRow = "flex items-center gap-2 text-sm leading-[1.6] font-medium tracking-[-0.01em] whitespace-nowrap text-sand-light xl:text-base";

  return (
    <footer id={ANCHORS.contact} className="scroll-mt-24 bg-night">
      <div className="site-shell pt-10 pb-12 xl:w-[min(100%-10.875rem,79.5rem)] xl:pt-[4.375rem] xl:pb-[4.5rem]">
        <div className="flex flex-col gap-10 xl:flex-row xl:items-center xl:gap-36">
          <div className="flex flex-col gap-8 xl:w-[21.75rem] xl:shrink-0 xl:gap-[4.5rem]">
            <div className="flex flex-col gap-4 xl:gap-6">
              <Link href={href("/")} aria-label={nav.home} className="w-fit">
                <BrandLogo tone="light" tagline={site.nav.exclusive} />
              </Link>
              <p className="text-sm leading-[1.6] tracking-[-0.01em] text-sand xl:text-[0.9375rem]">{copy.blurb}</p>
            </div>
            <div className="flex items-center justify-between gap-6 xl:justify-start">
              <p className="text-lg leading-[1.1] font-semibold tracking-[-0.01em] whitespace-nowrap text-[#f8faf8] xl:text-2xl">{copy.followUs}</p>
              <ul className="flex items-center gap-2.5" aria-label={footer.social}>
                {socials.map(({ label, href: url, Icon }) => (
                  <li key={label}>
                    <a href={url} target="_blank" rel="noreferrer" className="social-icon size-9 xl:size-11" aria-label={label} title={label}>
                      <Icon aria-hidden="true" className="size-5 xl:size-6" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-8 xl:flex xl:flex-1 xl:items-start xl:justify-between">
            <Column title={copy.services}>
              <li><Link href={href(servicePath("airport_transfer"))} className={linkClass}>{copy.airport}</Link></li>
              <li><Link href={href("/business")} className={linkClass}>{copy.business}</Link></li>
              <li><Link href={href(servicePath("hourly_hire"))} className={linkClass}>{copy.hourly}</Link></li>
              <li><Link href={href(servicePath("hourly_hire"))} className={linkClass}>{copy.fullDay}</Link></li>
            </Column>

            <Column title={copy.areas}>
              {CITIES.map((city) => (
                <li key={city}>
                  <Link href={`${href("/cities")}#${city}`} className={linkClass}>{cityNames[city]}</Link>
                </li>
              ))}
            </Column>

            <Column title={copy.company}>
              <li><Link href={`${href("/")}#${ANCHORS.about}`} className={linkClass}>{copy.about}</Link></li>
              <li><Link href={href("/fleet")} className={linkClass}>{copy.fleet}</Link></li>
              <li><Link href={href("/process")} className={linkClass}>{copy.how}</Link></li>
              <li><Link href={href("/help")} className={linkClass}>{copy.faq}</Link></li>
            </Column>

            <div className="col-span-2 xl:col-span-1">
              <p className="text-base leading-[1.4] font-semibold tracking-[-0.01em] text-amber xl:text-lg">{copy.contact}</p>
              <ul className="mt-4 flex flex-col gap-4 xl:mt-5">
                <li>
                  <a href={siteConfig.contact.phoneHref} className={contactRow} dir="ltr">
                    <PhoneIcon className="size-5 shrink-0 text-[#2fd3c6]" />
                    {siteConfig.contact.phone}
                  </a>
                </li>
                <li>
                  <a href={`mailto:${siteConfig.contact.email}`} className={contactRow}>
                    <MailboxIcon className="size-5 shrink-0 text-[#2fd3c6]" />
                    {siteConfig.contact.email}
                  </a>
                </li>
                <li className={contactRow}>
                  <MapPinOutlineIcon className="size-5 shrink-0 text-[#2fd3c6]" />
                  {copy.location}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 border-y border-dashed border-[#342e25] py-6 xl:mt-14">
          <div className="flex flex-col gap-3 text-sm leading-[1.6] tracking-[-0.04em] text-sand sm:flex-row sm:items-center sm:justify-between xl:text-[0.9375rem]">
            <p>{copy.copyright}</p>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <Link href={href("/privacy")} className="transition-colors hover:text-white">{footer.privacy}</Link>
              <Link href={href("/terms")} className="transition-colors hover:text-white">{footer.terms}</Link>
              <Link href={href("/cookies")} className="transition-colors hover:text-white">{footer.cookies}</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
