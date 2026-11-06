"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { setAccountUser, useAccount } from "../account-store";
import { register } from "../api";
import { accountErrorKey, type AccountErrorKey } from "../errors";
import styles from "./account.module.css";
import { AccountField, FormMessage, SubmitButton } from "./form-parts";

interface RegisterFormProps {
  locale: Locale;
  t: Dictionary["account"];
}

export function RegisterForm({ locale, t }: RegisterFormProps) {
  const router = useRouter();
  const { status, user } = useAccount();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<AccountErrorKey | null>(null);

  useEffect(() => {
    if (status === "ready" && user) router.replace(localePath(locale, "/account"));
  }, [status, user, router, locale]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const text = (name: string) => String(data.get(name) ?? "").trim();
    setBusy(true);
    setError(null);
    try {
      const created = await register({
        first_name: text("firstName"),
        last_name: text("lastName"),
        email: text("email"),
        phone: text("phone"),
        // Emails (e.g. password resets) come in the language the account was created in.
        locale,
        password: String(data.get("password") ?? ""),
      });
      setAccountUser(created);
    } catch (caught) {
      setError(
        accountErrorKey(caught, {
          email: "emailTaken",
          password: "passwordWeak",
          phone: "phoneInvalid",
        }),
      );
      setBusy(false);
    }
  }

  return (
    <>
      <form className={styles.card} onSubmit={onSubmit}>
        <div className={styles.row}>
          <AccountField
            label={t.fields.firstName}
            name="firstName"
            autoComplete="given-name"
            required
            maxLength={150}
          />
          <AccountField
            label={t.fields.lastName}
            name="lastName"
            autoComplete="family-name"
            maxLength={150}
          />
        </div>
        <AccountField
          label={t.fields.email}
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={254}
        />
        <AccountField
          label={t.fields.phone}
          name="phone"
          type="tel"
          autoComplete="tel"
          maxLength={40}
          pattern={String.raw`[\d+ \(\)\.\/\-]{7,40}`}
          placeholder="+44"
          dir="ltr"
        />
        <AccountField
          label={t.fields.password}
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          maxLength={128}
          hint={t.register.passwordHint}
        />
        <FormMessage error={error && t.errors[error]} />
        <SubmitButton busy={busy} label={t.register.submit} busyLabel={t.register.sending} />
      </form>
      <p className={styles.links}>
        {t.register.haveAccount}{" "}
        <Link href={localePath(locale, "/account/sign-in")}>{t.register.signIn}</Link>
      </p>
    </>
  );
}
