import { Link } from "@/i18n/navigation";
import { Logo, type LogoTone } from "./logo";
import styles from "./header-logo.module.css";

/**
 * Header logo link used by every page header (2026-10-09 logo handoff).
 * Headers keep their existing height (Mohammad, 2026-10-09: "the size of
 * header and footer should not change"). The official vertical logo cannot
 * fit an ~88px header, so headers use the approved premium HORIZONTAL
 * lockup (header-only version): 48px desktop, 40px mobile.
 * The link carries the accessible name; the SVG inside is decorative.
 */
export function HeaderLogo({
  tone = "light-bg",
  label = "Oragrol Global home",
  className,
}: {
  tone?: LogoTone;
  label?: string;
  className?: string;
}) {
  return (
    <Link
      href="/"
      aria-label={label}
      className={`brand-header-logo ${styles.link}${className ? ` ${className}` : ""}`}
    >
      <Logo variant="horizontal" tone={tone} height={48} decorative className={styles.icon} />
    </Link>
  );
}
