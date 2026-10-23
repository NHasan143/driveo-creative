import type { ReactNode } from "react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { QuotePresetProvider } from "@/features/quote";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";

/** Chrome shared by every public page: header, footer and the quote form's pre-fill state. */
export default async function SiteLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale();
  const t = await getDictionary(locale);

  return (
    <QuotePresetProvider>
      <SiteHeader locale={locale} nav={t.nav} />
      {children}
      <SiteFooter
        locale={locale}
        nav={t.nav}
        footer={t.footer}
        install={t.install}
        cityNames={t.cities.names}
      />
    </QuotePresetProvider>
  );
}
