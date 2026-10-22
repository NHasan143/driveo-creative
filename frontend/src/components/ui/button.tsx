import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import styles from "./button.module.css";

type Variant = "primary" | "secondary";
/** `compact` shrinks the button on phones (used in the header). */
type Size = "md" | "lg" | "compact";

interface VariantProps {
  variant?: Variant;
  size?: Size;
}

export function buttonClassName({ variant = "primary", size = "md" }: VariantProps = {}, className?: string) {
  return cn(styles.base, styles[variant], size !== "md" && styles[size], className);
}

export function Button({
  variant,
  size,
  className,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & VariantProps) {
  return <button type={type} className={buttonClassName({ variant, size }, className)} {...props} />;
}

export function ButtonLink({
  variant,
  size,
  className,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & VariantProps) {
  return <a className={buttonClassName({ variant, size }, className)} {...props} />;
}
