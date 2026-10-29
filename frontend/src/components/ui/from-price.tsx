import type { PriceUnit } from "@/admin/lib/content/types";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format-price";

interface FromPriceProps {
  amount: number | null;
  unit: PriceUnit;
  locale: Locale;
  labels: Dictionary["pricing"];
  className?: string;
}

/** "From €95" (or "From €70 per hour"); renders nothing when the service has no guide price. */
export function FromPrice({ amount, unit, locale, labels, className }: FromPriceProps) {
  if (amount === null) return null;
  return (
    <p className={cn("font-mono text-sm font-bold text-primary", className)}>
      {labels.from.replace("{price}", formatPrice(amount, locale))}
      {unit === "hour" && <span className="font-normal text-muted-foreground"> {labels.perHour}</span>}
    </p>
  );
}
