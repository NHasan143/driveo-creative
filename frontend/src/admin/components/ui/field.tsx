import { AlertCircle } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/admin/lib/cn";

interface FieldProps {
  label: ReactNode;
  htmlFor?: string;
  hint?: ReactNode;
  error?: string;
  required?: boolean;
  /** Extra content on the label row, e.g. a character counter or a language badge. */
  aside?: ReactNode;
  className?: string;
  children: ReactNode;
}

/** Label, control, then either the error (when present) or the hint. */
export function Field({ label, htmlFor, hint, error, required, aside, className, children }: FieldProps) {
  return (
    <div className={cn("grid gap-1.5", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={htmlFor} className="text-[0.8125rem] font-semibold text-foreground">
          {label}
          {required && (
            <span className="ms-0.5 text-danger" aria-hidden="true">
              *
            </span>
          )}
        </label>
        {aside && <span className="text-xs text-muted-foreground">{aside}</span>}
      </div>
      {children}
      {error ? (
        <p role="alert" className="flex items-center gap-1.5 text-xs font-medium text-danger">
          <AlertCircle aria-hidden="true" className="size-3.5 shrink-0" />
          {error}
        </p>
      ) : (
        hint && <p className="text-xs leading-relaxed text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}
