import type { ComponentType, SVGProps } from "react";
import { cn } from "@/lib/cn";

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

/** The 48px cream tile holding an orange 32px line icon. */
export function IconTile({ icon: Icon, className }: { icon: Icon; className?: string }) {
  return (
    <span className={cn("grid size-12 shrink-0 place-items-center rounded-[0.625rem] bg-cream text-orange", className)}>
      <Icon className="size-8" />
    </span>
  );
}

interface IconCardProps {
  icon: Icon;
  title: string;
  copy: string;
  className?: string;
  /** The design sets service values at 20px and business benefits at 22px. */
  large?: boolean;
}

/** White value or benefit card: icon and title at the top, the description pinned to the bottom. */
export function IconCard({ icon, title, copy, className, large = false }: IconCardProps) {
  return (
    <article
      className={cn(
        "flex min-h-[13rem] flex-col justify-between gap-10 rounded-3xl bg-white p-6 xl:min-h-[16.25rem] xl:gap-14",
        className,
      )}
    >
      <div className="flex flex-col items-start gap-5 xl:gap-6">
        <IconTile icon={icon} />
        <h3 className={cn("text-lg leading-[1.2] font-semibold tracking-[-0.01em] text-ink", large ? "xl:text-[1.375rem]" : "xl:text-xl")}>
          {title}
        </h3>
      </div>
      <p className="text-[0.9375rem] leading-[1.5] tracking-[-0.01em] text-[#363232]">{copy}</p>
    </article>
  );
}
