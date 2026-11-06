"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { confirmPasswordReset } from "../api";
import { accountErrorKey, type AccountErrorKey } from "../errors";
import styles from "./account.module.css";
import { AccountField, FormMessage, SubmitButton } from "./form-parts";

interface ResetPasswordFormProps {
  locale: Locale;
  t: Dictionary["account"];
}

/** Opened from the password reset email: /account/reset-password?lang=…&uid=…&token=… */
export function ResetPasswordForm({ locale, t }: ResetPasswordFormProps) {
  const params = useSearchParams();
  const uid = params.get("uid");
  const token = params.get("token");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<AccountErrorKey | null>(null);
  const [done, setDone] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const password = String(new FormData(event.currentTarget).get("password") ?? "");
    setBusy(true);
    setError(null);
    try {
      await confirmPasswordReset(uid ?? "", token ?? "", password);
      setDone(true);
    } catch (caught) {
      setError(
        accountErrorKey(caught, {
          token: "linkInvalid",
          uid: "linkInvalid",
          new_password: "passwordWeak",
        }),
      );
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className={styles.card} role="status">
        <h2 className={styles.cardTitle}>{t.reset.doneTitle}</h2>
        <p className={styles.notice}>{t.reset.doneBody}</p>
        <p className={styles.cardLinks}>
          <Link href={localePath(locale, "/account/sign-in")}>{t.reset.signIn}</Link>
        </p>
      </div>
    );
  }

  if (!uid || !token || error === "linkInvalid") {
    return (
      <div className={styles.card} role="alert">
        <p className={styles.notice}>{error ? t.errors.linkInvalid : t.reset.missingLink}</p>
        <p className={styles.cardLinks}>
          <Link href={localePath(locale, "/account/forgot-password")}>{t.reset.requestNew}</Link>
        </p>
      </div>
    );
  }

  return (
    <form className={styles.card} onSubmit={onSubmit}>
      <AccountField
        label={t.fields.newPassword}
        name="password"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        maxLength={128}
        hint={t.register.passwordHint}
      />
      <FormMessage error={error && t.errors[error]} />
      <SubmitButton busy={busy} label={t.reset.submit} busyLabel={t.reset.sending} />
    </form>
  );
}
