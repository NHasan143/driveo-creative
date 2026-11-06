import type { Metadata } from "next";
import { AccountPage, RegisterForm } from "@/features/account";
import { accountMetadata } from "@/features/account/metadata";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const { account } = await getDictionary(await getLocale());
  return accountMetadata("/account/register", account.register.title);
}

export default async function RegisterPage() {
  const locale = await getLocale();
  const t = await getDictionary(locale);

  return (
    <>
      <AccountPage
        eyebrow={t.account.eyebrow}
        title={t.account.register.title}
        intro={t.account.register.intro}
      >
        <RegisterForm locale={locale} t={t.account} />
      </AccountPage>
    </>
  );
}
