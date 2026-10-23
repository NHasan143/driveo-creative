import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Understated text link with an arrow, used for "see more" moments between sections. */
export function ArrowLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-2 font-mono text-[0.65rem] font-bold tracking-[0.2em] text-accent uppercase",
        className,
      )}
    >
      <span className="border-b border-transparent pb-0.5 transition-colors group-hover:border-accent">
        {children}
      </span>
      <ArrowRight
        aria-hidden="true"
        className="size-3.5 transition-transform group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1"
      />
    </Link>
  );
}
