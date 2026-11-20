import type { ReactNode } from "react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { CookieBanner } from "@/components/legal/cookie-banner";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { getSiteServices, toNavServices } from "@/lib/content/site-services";

/** Chrome shared by every public page: header, footer and the cookie banner. */
export default async function SiteLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale();
  const t = await getDictionary(locale);
  const services = toNavServices(await getSiteServices(locale));

  return (
    <>
      <SiteHeader locale={locale} nav={t.nav} site={t.site.nav} services={services} />
      {children}
      <SiteFooter locale={locale} nav={t.nav} footer={t.footer} site={t.site} cityNames={t.cities.names} />
      <CookieBanner locale={locale} policyLabel={t.footer.cookies} />
    </>
  );
}
