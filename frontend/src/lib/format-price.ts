import { PRICE_CURRENCY } from "@/admin/lib/content/types";
import { localeMeta, type Locale } from "@/i18n/config";

/** A guide price in the visitor's language, e.g. "€95" or "95 €"; cents only when there are any. */
export function formatPrice(amount: number, locale: Locale) {
  return new Intl.NumberFormat(localeMeta[locale].ogLocale.replace("_", "-"), {
    style: "currency",
    currency: PRICE_CURRENCY,
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
