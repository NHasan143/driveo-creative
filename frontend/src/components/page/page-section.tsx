import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface PageSectionProps {
  title: string;
  intro?: string;
  id?: string;
  /** `tinted` sits on the slightly lighter surface, like Blacklane's coloured bands. */
  tone?: "plain" | "tinted";
  align?: "center" | "start";
  children: ReactNode;
}

/** A content band with a large heading, used by every inner page. */
export function PageSection({ title, intro, id, tone = "plain", align = "start", children }: PageSectionProps) {
  return (
    <section id={id} className={cn("py-20 sm:py-24", tone === "tinted" && "bg-secondary")}>
      <div className="site-shell">
        <div className={cn(align === "center" && "mx-auto text-center")}>
          <h2
            className={cn(
              "max-w-3xl font-display text-[clamp(2rem,4vw,3.2rem)] leading-[1.08] font-medium text-balance",
              align === "center" && "mx-auto",
            )}
          >
            {title}
          </h2>
          {intro && (
            <p className={cn("mt-4 max-w-2xl text-base leading-7 text-muted-foreground", align === "center" && "mx-auto")}>
              {intro}
            </p>
          )}
        </div>
        <div className="mt-12">{children}</div>
      </div>
    </section>
  );
}
