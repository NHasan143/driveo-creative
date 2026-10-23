import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

/** Bulleted list with copper check marks. */
export function CheckList({ items, className }: { items: readonly string[]; className?: string }) {
  return (
    <ul className={cn("grid gap-3", className)}>
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 text-sm leading-6 text-foreground/90">
          <span className="mt-0.5 grid size-5 flex-none place-items-center rounded-full border border-primary/45 text-primary">
            <Check aria-hidden="true" className="size-3" />
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}
