import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

/** Short benefit cards in a row (Blacklane's "Competitive rates · Seamless travel · …" strip). */
export function FeatureCards({ items, columns = 3 }: { items: { title: string; copy: string }[]; columns?: 3 | 4 }) {
  return (
    <ul className={cn("grid gap-5 sm:grid-cols-2", columns === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4")}>
      {items.map((item) => (
        <li key={item.title} className="rounded-3xl border border-border bg-card p-6 sm:p-7">
          <span className="grid size-10 place-items-center rounded-full bg-primary/15 text-primary">
            <Check aria-hidden="true" className="size-5" />
          </span>
          <h3 className="mt-5 font-display text-xl font-medium">{item.title}</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.copy}</p>
        </li>
      ))}
    </ul>
  );
}
