"use client";

import { UserRound } from "lucide-react";
import Link from "next/link";
import { useAccount } from "@/features/account";
import { localePath, type Locale } from "@/i18n/config";
import styles from "./account-link.module.css";

/** "Sign in", or "Account" once the visitor is signed in; both open the account page. */
export function AccountLink({ locale, signIn, account }: { locale: Locale; signIn: string; account: string }) {
  const { user } = useAccount();
  const label = user ? account : signIn;

  return (
    <Link href={localePath(locale, "/account")} className={styles.link} aria-label={label}>
      <UserRound aria-hidden="true" />
      <span className={styles.text}>{label}</span>
    </Link>
  );
}
