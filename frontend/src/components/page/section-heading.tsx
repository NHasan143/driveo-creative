import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/reveal";
import { Eyebrow } from "@/components/ui/eyebrow";
import { cn } from "@/lib/cn";

interface SectionHeadingProps {
  eyebrow: string;
  title: ReactNode;
  intro?: string;
  /** Optional element shown under the intro, e.g. an ArrowLink. */
  action?: ReactNode;
  className?: string;
}

/** Eyebrow + display title (+ intro) block, matching the home page section headings. */
export function SectionHeading({ eyebrow, title, intro, action, className }: SectionHeadingProps) {
  const split = Boolean(intro || action);

  return (
    <Reveal
      className={cn(
        split && "grid items-end gap-8 border-b border-border pb-10 md:grid-cols-[1.2fr_0.8fr]",
        className,
      )}
    >
      <div>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="section-title">{title}</h2>
      </div>
      {split && (
        <div>
          {intro && <p className="max-w-lg leading-7 text-muted-foreground">{intro}</p>}
          {action && <div className={cn(intro && "mt-5")}>{action}</div>}
        </div>
      )}
    </Reveal>
  );
}
