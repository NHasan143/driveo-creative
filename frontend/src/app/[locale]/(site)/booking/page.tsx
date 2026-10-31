import type { Metadata } from "next";
import { Suspense } from "react";
import { AccountPage } from "@/features/account";
import { ManageBooking } from "@/features/booking";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const { manageBooking } = await getDictionary(locale);
  // A private page: never indexed.
  return { ...buildPageMetadata(locale, manageBooking.meta, "/booking"), robots: { index: false, follow: false } };
}

/** Opened from the link in a booking email, or from My account: /booking?ref=…&token=… */
export default async function ManageBookingPage() {
  const locale = await getLocale();
  const t = await getDictionary(locale);

  return (
    <>
      <AccountPage eyebrow={t.manageBooking.eyebrow} wide>
        {/* The reference and token are only known in the browser, so the shell prerenders without them. */}
        <Suspense fallback={null}>
          <ManageBooking locale={locale} t={t.manageBooking} fields={t.booking} />
        </Suspense>
      </AccountPage>
    </>
  );
}
