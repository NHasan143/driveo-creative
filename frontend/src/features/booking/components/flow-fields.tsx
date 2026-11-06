import { ChevronDown, Minus, Plus } from "lucide-react";
import type { ReactNode, SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export const inputClass =
  "w-full min-h-12 rounded-xl border border-input bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:border-primary focus:outline-none [color-scheme:dark] user-invalid:border-destructive";

export function FlowField({
  label,
  hint,
  wide,
  children,
}: {
  label: string;
  hint?: ReactNode;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <label className={cn("grid content-start gap-2", wide && "sm:col-span-2")}>
      <span className="text-sm font-semibold">{label}</span>
      {children}
      {hint && <small className="text-xs leading-5 text-muted-foreground">{hint}</small>}
    </label>
  );
}

export function FlowSelect({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <span className="relative block">
      <select {...props} className={cn(inputClass, "appearance-none pe-10", className)}>
        {children}
      </select>
      <ChevronDown aria-hidden="true" className="pointer-events-none absolute end-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
    </span>
  );
}

interface StepperProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  labels: { increase: string; decrease: string; max: string };
}

export function FlowStepper({ label, value, min, max, onChange, labels }: StepperProps) {
  const button =
    "grid size-10 place-items-center rounded-full border border-input transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div className="grid content-start gap-2" role="group" aria-label={label}>
      <span className="text-sm font-semibold">{label}</span>
      <div className="flex min-h-12 items-center justify-between rounded-xl border border-input px-2">
        <button
          type="button"
          className={button}
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          aria-label={`${labels.decrease} ${label}`}
        >
          <Minus aria-hidden="true" className="size-4" />
        </button>
        <strong aria-live="polite" className="font-mono text-lg">
          {value}
        </strong>
        <button
          type="button"
          className={button}
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          aria-label={`${labels.increase} ${label}`}
        >
          <Plus aria-hidden="true" className="size-4" />
        </button>
      </div>
      <small className="text-xs text-muted-foreground">
        {labels.max} {max}
      </small>
    </div>
  );
}
