import type { Metadata } from "next";
import { AccountDashboard, AccountPage } from "@/features/account";
import { accountMetadata } from "@/features/account/metadata";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";

export function generateMetadata(): Promise<Metadata> {
  return accountMetadata("/account");
}

export default async function AccountHomePage() {
  const locale = await getLocale();
  const t = await getDictionary(locale);

  return (
    <>
      <AccountPage eyebrow={t.account.eyebrow} wide>
        <AccountDashboard locale={locale} t={t.account} />
      </AccountPage>
    </>
  );
}
