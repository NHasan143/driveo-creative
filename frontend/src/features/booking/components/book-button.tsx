import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { buttonClassName } from "@/components/ui/button";
import type { Locale } from "@/i18n/config";
import { bookHref, type BookQuery } from "../book-link";

interface BookButtonProps {
  locale: Locale;
  /** Choices to pre-fill on the booking page, e.g. `{ vehicle: "first_class" }` or `{ city: "paris" }`. */
  preset?: BookQuery;
  children: ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
}

/** Opens the booking page with the given choices pre-filled. */
export function BookButton({ locale, preset, children, variant, className }: BookButtonProps) {
  return (
    <Link href={bookHref(locale, preset)} className={buttonClassName({ variant }, className)}>
      {children} <ArrowRight aria-hidden="true" className="rtl:-scale-x-100" />
    </Link>
  );
}
