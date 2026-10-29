import type { Metadata } from "next";
import { Suspense } from "react";
import { AccountPage, ResetPasswordForm } from "@/features/account";
import { accountMetadata } from "@/features/account/metadata";
import { BookingSection } from "@/features/booking";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const { account } = await getDictionary(await getLocale());
  return accountMetadata("/account/reset-password", account.reset.title);
}

export default async function ResetPasswordPage() {
  const locale = await getLocale();
  const t = await getDictionary(locale);

  return (
    <>
      <AccountPage eyebrow={t.account.eyebrow} title={t.account.reset.title} intro={t.account.reset.intro}>
        {/* The link's uid and token are only known in the browser, so the shell prerenders without them. */}
        <Suspense fallback={null}>
          <ResetPasswordForm locale={locale} t={t.account} />
        </Suspense>
      </AccountPage>
      <BookingSection locale={locale} booking={t.booking} cityNames={t.cities.names} />
    </>
  );
}
