"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { setAccountUser, useAccount } from "../account-store";
import { signIn } from "../api";
import { accountErrorKey, type AccountErrorKey } from "../errors";
import styles from "./account.module.css";
import { AccountField, FormMessage, SubmitButton } from "./form-parts";

interface SignInFormProps {
  locale: Locale;
  t: Dictionary["account"];
}

export function SignInForm({ locale, t }: SignInFormProps) {
  const router = useRouter();
  const { status, user } = useAccount();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<AccountErrorKey | null>(null);

  // Already signed in (e.g. the Account link while signed in): go to the account.
  useEffect(() => {
    if (status === "ready" && user) router.replace(localePath(locale, "/account"));
  }, [status, user, router, locale]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setBusy(true);
    setError(null);
    try {
      setAccountUser(await signIn(String(data.get("email")), String(data.get("password"))));
    } catch (caught) {
      setError(accountErrorKey(caught, {}, "invalidCredentials"));
      setBusy(false);
    }
  }

  return (
    <>
      <form className={styles.card} onSubmit={onSubmit}>
        <AccountField
          label={t.fields.email}
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={254}
        />
        <AccountField
          label={t.fields.password}
          name="password"
          type="password"
          autoComplete="current-password"
          required
          maxLength={128}
        />
        <FormMessage error={error && t.errors[error]} />
        <SubmitButton busy={busy} label={t.signIn.submit} busyLabel={t.signIn.sending} />
        <p className={styles.cardLinks}>
          <Link href={localePath(locale, "/account/forgot-password")}>{t.signIn.forgot}</Link>
        </p>
      </form>
      <p className={styles.links}>
        {t.signIn.noAccount} <Link href={localePath(locale, "/account/register")}>{t.signIn.register}</Link>
      </p>
    </>
  );
}
