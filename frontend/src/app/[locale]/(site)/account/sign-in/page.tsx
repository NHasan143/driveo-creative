import type { Metadata } from "next";
import { AccountPage, SignInForm } from "@/features/account";
import { accountMetadata } from "@/features/account/metadata";
import { QuoteSection } from "@/features/quote";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const { account } = await getDictionary(await getLocale());
  return accountMetadata("/account/sign-in", account.signIn.title);
}

export default async function SignInPage() {
  const locale = await getLocale();
  const t = await getDictionary(locale);

  return (
    <>
      <AccountPage eyebrow={t.account.eyebrow} title={t.account.signIn.title} intro={t.account.signIn.intro}>
        <SignInForm locale={locale} t={t.account} />
      </AccountPage>
      <QuoteSection locale={locale} quote={t.quote} cityNames={t.cities.names} />
    </>
  );
}
