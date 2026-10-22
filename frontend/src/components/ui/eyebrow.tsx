import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("eyebrow", className)}>
      <span className="eyebrow-rule" aria-hidden="true" />
      {children}
    </p>
  );
}
