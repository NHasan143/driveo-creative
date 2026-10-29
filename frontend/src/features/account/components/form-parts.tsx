import { LoaderCircle } from "lucide-react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import styles from "./account.module.css";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: ReactNode;
}

export function AccountField({ label, hint, ...input }: FieldProps) {
  return (
    <label className={styles.field}>
      <span className={styles.label}>{label}</span>
      <input {...input} />
      {hint && <small className={styles.hint}>{hint}</small>}
    </label>
  );
}

export function FormMessage({ error, notice }: { error?: string | null; notice?: string | null }) {
  if (error) {
    return (
      <p role="alert" className={styles.error}>
        {error}
      </p>
    );
  }
  return notice ? (
    <p role="status" className={styles.notice}>
      {notice}
    </p>
  ) : null;
}

export function SubmitButton({
  busy,
  label,
  busyLabel,
}: {
  busy: boolean;
  label: string;
  busyLabel: string;
}) {
  return (
    <Button type="submit" className={styles.submit} disabled={busy}>
      {busy ? (
        <>
          <LoaderCircle aria-hidden="true" className={styles.spinner} /> {busyLabel}
        </>
      ) : (
        label
      )}
    </Button>
  );
}
