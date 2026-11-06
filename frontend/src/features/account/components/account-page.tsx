import type { ReactNode } from "react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { cn } from "@/lib/cn";
import styles from "./account.module.css";

interface AccountPageProps {
  eyebrow: string;
  /** Omit when the content renders its own heading (the dashboard greets by name). */
  title?: string;
  intro?: string;
  wide?: boolean;
  children: ReactNode;
}

/** Frame of every account page: heading, then the page's card(s). */
export function AccountPage({ eyebrow, title, intro, wide, children }: AccountPageProps) {
  return (
    <main className={styles.page}>
      <div className={cn("site-shell", styles.layout, wide && styles.wide)}>
        {title && (
          <header>
            <Eyebrow>{eyebrow}</Eyebrow>
            <h1 className={styles.title}>{title}</h1>
            {intro && <p className={styles.intro}>{intro}</p>}
          </header>
        )}
        {children}
      </div>
    </main>
  );
}
