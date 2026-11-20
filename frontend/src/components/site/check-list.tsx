import { CheckIcon } from "@/components/icons/design-icons";
import { cn } from "@/lib/cn";

export interface CheckItem {
  /** Bold lead-in, e.g. "Apply online". */
  label?: string;
  text: string;
}

/**
 * A ticked list. A plain string "Label: text" is split at the first colon so the
 * label is set in bold, as in the design's benefit lists.
 */
export function toCheckItem(value: string): CheckItem {
  const match = /^([^:：]{2,60})\s?[:：]\s*(.+)$/.exec(value);
  return match ? { label: match[1].trim(), text: match[2].trim() } : { text: value };
}

interface CheckListProps {
  items: CheckItem[];
  /** Separator after the bold label: the business and chauffeur pages use " :". */
  separator?: string;
  className?: string;
}

export function CheckList({ items, separator = ":", className }: CheckListProps) {
  return (
    <ul className={cn("flex flex-col gap-3", className)}>
      {items.map((item) => (
        <li key={`${item.label}-${item.text}`} className="flex items-start gap-1">
          <CheckIcon className="mt-1 size-4 shrink-0 text-ink" />
          <p className="text-[0.9375rem] leading-[1.6] tracking-[-0.01em] text-body">
            {item.label && (
              <strong className="font-semibold text-ink">
                {item.label}
                {separator}{" "}
              </strong>
            )}
            {item.text}
          </p>
        </li>
      ))}
    </ul>
  );
}

/** White ticks on the hero photographs ("Licensed chauffeurs", "Fixed pricing"…). */
export function HeroChecks({ items, className }: { items: string[]; className?: string }) {
  return (
    <ul className={cn("flex flex-wrap items-center justify-center gap-x-8 gap-y-2", className)}>
      {items.map((item) => (
        <li key={item} className="flex items-center gap-1 text-[0.9375rem] leading-[1.1] font-medium tracking-[-0.03em] text-white/80">
          <CheckIcon className="size-4 shrink-0 text-white/80" />
          {item}
        </li>
      ))}
    </ul>
  );
}
