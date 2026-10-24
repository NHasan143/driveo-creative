import type { Dictionary } from "@/i18n/get-dictionary";
import styles from "./services-page.module.css";

export function ServicesStandard({ title, items }: { title: string; items: Dictionary["assurance"] }) {
  return (
    <section className={styles.standard} aria-labelledby="services-standard-title">
      <div className={`site-shell ${styles.standardLayout}`}>
        <h2 id="services-standard-title" className={styles.standardTitle}>{title}</h2>
        <div className={styles.commitments}>
          {items.map((item) => (
            <div key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
