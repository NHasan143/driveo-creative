import type { ReactNode } from "react";
import { EmblemIcon } from "@/components/icons/design-icons";
import { cn } from "@/lib/cn";

type Tone = "light" | "dark";

/**
 * The pill above every section title: the brand emblem and an uppercase label.
 * `light` sits on white or cream; `dark` is the ink pill used on dark or tinted bands.
 */
export function SectionBadge({ children, tone = "light", className }: { children: ReactNode; tone?: Tone; className?: string }) {
  return (
    <p
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-full border py-1 ps-1 pe-2.5",
        "text-[0.6875rem] leading-[1.2] font-semibold tracking-[0.04em] uppercase xl:text-sm",
        tone === "light" ? "border-cream-border bg-amber-soft text-ink-soft" : "border-body bg-ink-raised text-white",
        className,
      )}
    >
      <EmblemIcon disc={tone === "light" ? "#191612" : "#ffffff"} className="size-6 shrink-0" />
      {children}
    </p>
  );
}

interface SectionHeadingProps {
  lead: ReactNode;
  accent?: ReactNode;
  /** Put the muted half on its own line, as some sections do. */
  stacked?: boolean;
  tone?: Tone;
  as?: "h1" | "h2" | "h3";
  className?: string;
}

/** Two-tone serif title: ink, then a muted brown continuation (sand on dark backgrounds). */
export function SectionHeading({ lead, accent, stacked = false, tone = "light", as: Tag = "h2", className }: SectionHeadingProps) {
  return (
    <Tag className={cn("section-title", tone === "dark" && "section-title-light", className)}>
      {lead}
      {accent && (
        <>
          {stacked ? <br /> : " "}
          <span className="accent">{accent}</span>
        </>
      )}
    </Tag>
  );
}

interface SectionIntroProps extends Omit<SectionHeadingProps, "className"> {
  badge: ReactNode;
  /** Badge style; defaults to the heading tone. */
  badgeTone?: Tone;
  align?: "start" | "center";
  className?: string;
  headingClassName?: string;
}

/** Badge plus heading, the opening of most sections. */
export function SectionIntro({ badge, badgeTone, align = "start", className, headingClassName, ...heading }: SectionIntroProps) {
  return (
    <div className={cn("flex flex-col gap-4", align === "center" ? "items-center text-center" : "items-start", className)}>
      <SectionBadge tone={badgeTone ?? heading.tone}>{badge}</SectionBadge>
      <SectionHeading {...heading} className={headingClassName} />
    </div>
  );
}
