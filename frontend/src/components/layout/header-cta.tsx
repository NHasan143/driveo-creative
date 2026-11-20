"use client";

import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import { ArrowRightIcon } from "@/components/icons/design-icons";
import { buttonClassName } from "@/components/ui/button";
import { useAccount } from "@/features/account";
import { bookHref } from "@/features/booking/book-link";
import { localePath, type Locale } from "@/i18n/config";
import { cn } from "@/lib/cn";

interface HeaderCtaProps {
  locale: Locale;
  requestQuote: string;
  signIn: string;
  account: string;
}

/**
 * The gold pill on the right of the header: "Request Quote" on the home page
 * (desktop), and "Sign In" (or "Account" once signed in) everywhere else.
 */
export function HeaderCta({ locale, requestQuote, signIn, account }: HeaderCtaProps) {
  const home = useSelectedLayoutSegment() === null;
  const { user } = useAccount();
  const accountLabel = user ? account : signIn;
  const className = cn(buttonClassName({ size: "compact" }));

  return (
    <>
      {home && (
        <Link href={bookHref(locale)} className={cn(className, "hidden xl:inline-flex")}>
          {requestQuote}
          <ArrowRightIcon className="rtl:-scale-x-100" />
        </Link>
      )}
      <Link href={localePath(locale, "/account")} className={cn(className, home && "xl:hidden")}>
        {accountLabel}
        <ArrowRightIcon className="hidden xl:block rtl:-scale-x-100" />
      </Link>
    </>
  );
}
