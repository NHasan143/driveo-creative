import { UserRound } from "lucide-react";
import Link from "next/link";
import { localePath, type Locale } from "@/i18n/config";
import styles from "./account-link.module.css";

/** Header link to the customer account; the page itself shows sign-in when needed. */
export function AccountLink({ locale, label }: { locale: Locale; label: string }) {
  return (
    <Link href={localePath(locale, "/account")} className={styles.link} aria-label={label}>
      <UserRound aria-hidden="true" />
      <span className={styles.text}>{label}</span>
    </Link>
  );
}
