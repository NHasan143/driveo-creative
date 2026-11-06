import { Plus } from "lucide-react";
import type { ReactNode } from "react";

export interface FaqItem {
  question: string;
  answer: ReactNode;
}

/** Questions as an accordion; native <details>, so it works before JavaScript loads. */
export function FaqList({ items }: { items: FaqItem[] }) {
  return (
    <div className="divide-y divide-border border-y border-border">
      {items.map((item) => (
        <details key={item.question} className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-start text-lg font-medium [&::-webkit-details-marker]:hidden">
            {item.question}
            <Plus
              aria-hidden="true"
              className="size-5 shrink-0 text-primary transition-transform duration-300 group-open:rotate-45"
            />
          </summary>
          <div className="max-w-3xl pb-6 text-base leading-7 text-muted-foreground">{item.answer}</div>
        </details>
      ))}
    </div>
  );
}
