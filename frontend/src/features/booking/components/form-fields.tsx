import { ChevronDown, Minus, Plus } from "lucide-react";
import type { ReactNode, SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import styles from "./quote-form.module.css";

interface FieldProps {
  label: string;
  wide?: boolean;
  hint?: ReactNode;
  children: ReactNode;
}

export function Field({ label, wide, hint, children }: FieldProps) {
  return (
    <label className={cn(styles.field, wide && styles.spanTwo)}>
      <span className={styles.label}>{label}</span>
      {children}
      {hint && <small className={styles.hint}>{hint}</small>}
    </label>
  );
}

export function Select({ children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <span className={styles.selectWrap}>
      <select {...props}>{children}</select>
      <ChevronDown aria-hidden="true" />
    </span>
  );
}

interface NumberStepperProps {
  label: string;
  name: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  labels: { increase: string; decrease: string; max: string };
}

export function NumberStepper({ label, name, value, min, max, onChange, labels }: NumberStepperProps) {
  const atMin = value <= min;
  const atMax = value >= max;

  return (
    <div className={styles.field} role="group" aria-label={label}>
      <span className={styles.label}>{label}</span>
      <span className={styles.stepper}>
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={atMin}
          aria-label={`${labels.decrease} ${label}`}
        >
          <Minus aria-hidden="true" />
        </button>
        <strong aria-live="polite">{value}</strong>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={atMax}
          aria-label={`${labels.increase} ${label}`}
        >
          <Plus aria-hidden="true" />
        </button>
        <input type="hidden" name={name} value={value} />
      </span>
      <small className={styles.hint}>
        {labels.max} {max}
      </small>
    </div>
  );
}
