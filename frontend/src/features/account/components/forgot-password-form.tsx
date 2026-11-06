"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { requestPasswordReset } from "../api";
import { accountErrorKey, type AccountErrorKey } from "../errors";
import styles from "./account.module.css";
import { AccountField, FormMessage, SubmitButton } from "./form-parts";

interface ForgotPasswordFormProps {
  locale: Locale;
  t: Dictionary["account"];
}

export function ForgotPasswordForm({ locale, t }: ForgotPasswordFormProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<AccountErrorKey | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get("email") ?? "").trim();
    setBusy(true);
    setError(null);
    try {
      await requestPasswordReset(email, locale);
      setSentTo(email);
    } catch (caught) {
      setError(accountErrorKey(caught));
    } finally {
      setBusy(false);
    }
  }

  const back = (
    <p className={styles.links}>
      <Link href={localePath(locale, "/account/sign-in")}>{t.forgot.back}</Link>
    </p>
  );

  if (sentTo) {
    return (
      <>
        <div className={styles.card} role="status">
          <h2 className={styles.cardTitle}>{t.forgot.sentTitle}</h2>
          <p className={styles.notice}>{t.forgot.sentBody.replace("{email}", sentTo)}</p>
        </div>
        {back}
      </>
    );
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
        <FormMessage error={error && t.errors[error]} />
        <SubmitButton busy={busy} label={t.forgot.submit} busyLabel={t.forgot.sending} />
      </form>
      {back}
    </>
  );
}
