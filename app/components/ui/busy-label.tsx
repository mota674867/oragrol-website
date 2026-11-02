import type { ReactNode } from "react";
import styles from "./busy-label.module.css";

/** A rotating ring and "working" text while a request runs, so people know the click was received. */
export function BusyLabel({ busy, children, working = "Working…" }: { busy: boolean; children: ReactNode; working?: string }) {
  if (!busy) return <>{children}</>;
  return <span className={styles.label}><span className={styles.spinner} aria-hidden="true" />{working}</span>;
}
