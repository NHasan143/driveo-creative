import type { Metadata } from "next";
import { AccountPage, ForgotPasswordForm } from "@/features/account";
import { accountMetadata } from "@/features/account/metadata";
import { BookingSection } from "@/features/booking";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const { account } = await getDictionary(await getLocale());
  return accountMetadata("/account/forgot-password", account.forgot.title);
}

export default async function ForgotPasswordPage() {
  const locale = await getLocale();
  const t = await getDictionary(locale);

  return (
    <>
      <AccountPage eyebrow={t.account.eyebrow} title={t.account.forgot.title} intro={t.account.forgot.intro}>
        <ForgotPasswordForm locale={locale} t={t.account} />
      </AccountPage>
      <BookingSection locale={locale} booking={t.booking} cityNames={t.cities.names} />
    </>
  );
}
