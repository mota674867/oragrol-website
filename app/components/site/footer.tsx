"use client";

import Link from "next/link";
import { useId, useState } from "react";
import type { CSSProperties, FormEvent, ReactNode } from "react";
import styles from "./footer.module.css";
import { LinkedInIcon, InstagramIcon } from "./social-icons";

/**
 * Shared site footer — one component, identical on every redesigned page.
 * Rebuilt 2026-09-05 per the user-approved reference image ("Codex Image
 * Sep 6, 2026, 01_45_47 AM.png") and its two handoff docs
 * (ORAGROL_Footer_Design_Instructions.md + a reference OragrolFooter.tsx
 * component). Replaces the previous head+hand monogram-artwork footer.
 *
 * "use client" is required for the newsletter form's pending/success/error
 * state, but every page importing this still stays a Server Component —
 * a Server Component can render a Client Component child, it just can't
 * itself use hooks.
 *
 * Legal links (Privacy Policy / Terms of Use / Accessibility) render as
 * plain, non-clickable text until those pages actually exist — never link
 * to a route that doesn't exist yet. All three are live as of this build.
 * Careers / Talent / Partnerships have no dedicated pages yet — the
 * handoff explicitly says not to invent destinations, so they render as
 * plain text too, same treatment as a not-yet-live legal page.
 */

type NewsletterSubmission = { firstName: string; email: string; consent: true };

export type SiteFooterProps = {
  /** Independent slot: swap in the real logo whenever it's ready. */
  logo?: ReactNode;
  logoStyle?: CSSProperties;
  /** Dashed "LOGO PENDING" box, for internal design review only — must stay false on a shipped page. */
  showLogoPlaceholder?: boolean;
  /** Wire up a real subscription service once one exists; until then submissions honestly report as unavailable rather than faking success. */
  onSubscribe?: (submission: NewsletterSubmission) => Promise<void>;
  year?: number;
};

const sitemapLinks: [string, string][] = [
  ["Home", "/"],
  ["Services", "/services"],
  ["Business Automation", "/business-automation"],
  ["OR ONE", "/or-one"],
  ["Industries", "/industries"],
  ["Resources", "/resources"],
];

// Careers, Talent and Partnerships have no live route yet — plain text,
// not a fake link, until those pages actually ship.
const companyLinks: [string, string | null][] = [
  ["Company", "/company"],
  ["Careers", null],
  ["Talent", null],
  ["Partnerships", null],
  ["FAQ", "/faq"],
  ["Contact", "/contact"],
];

// All three legal pages are live: Privacy Policy (2026-09-05), Terms of
// Use (2026-09-06), Accessibility (2026-09-06).
const legalLinks: [string, string][] = [
  ["Privacy Policy", "/privacy-policy"],
  ["Terms of Use", "/terms-of-use"],
  ["Accessibility", "/accessibility"],
];

// Verified, existing accounts — never invented destinations (carried over
// from the previous footer).
const SOCIAL_LINKS = {
  linkedin: "https://www.linkedin.com/company/oragrol-global/",
  instagram: "https://www.instagram.com/oragrolglobal/",
};

function NavLink({ label, href }: { label: string; href: string | null }) {
  return href ? <Link href={href}>{label}</Link> : <span className={styles.pending} title="Coming soon">{label}</span>;
}

export default function SiteFooter({
  logo,
  logoStyle,
  showLogoPlaceholder = false,
  onSubscribe,
  year = 2026,
}: SiteFooterProps = {}) {
  const id = useId();
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "pending") return;
    if (!onSubscribe) {
      setStatus("error");
      setMessage("Newsletter signup isn't connected yet — check back soon.");
      return;
    }
    const form = event.currentTarget;
    const data = new FormData(form);
    if (data.get("consent") !== "on") return;
    setStatus("pending");
    setMessage("");
    try {
      await onSubscribe({
        firstName: String(data.get("firstName") || "").trim(),
        email: String(data.get("email") || "").trim(),
        consent: true,
      });
      setStatus("success");
      setMessage("Thank you. You’re subscribed to the monthly briefing.");
      form.reset();
    } catch {
      setStatus("error");
      setMessage("We couldn’t complete your signup. Please try again.");
    }
  }

  return (
    <footer className={styles.footer}>
      <div className={styles.grid}>
        <div>
          <h2 className={styles.heading} id={`${id}-sitemap`}>SITEMAP</h2>
          <nav aria-labelledby={`${id}-sitemap`}>
            <ul className={styles.links}>
              {sitemapLinks.map(([label, href]) => <li key={label}><NavLink label={label} href={href} /></li>)}
            </ul>
          </nav>
          <div className={styles.socials}>
            <a href={SOCIAL_LINKS.linkedin} aria-label="ORAGROL Global on LinkedIn" target="_blank" rel="noreferrer"><LinkedInIcon /></a>
            <a href={SOCIAL_LINKS.instagram} aria-label="ORAGROL Global on Instagram" target="_blank" rel="noreferrer"><InstagramIcon /></a>
          </div>
        </div>

        <div>
          <h2 className={styles.heading} id={`${id}-company`}>COMPANY</h2>
          <nav aria-labelledby={`${id}-company`}>
            <ul className={styles.links}>
              {companyLinks.map(([label, href]) => <li key={label}><NavLink label={label} href={href} /></li>)}
            </ul>
          </nav>
        </div>

        <div>
          <h2 className={styles.heading} id={`${id}-legal`}>LEGAL</h2>
          <nav aria-labelledby={`${id}-legal`}>
            <ul className={styles.links}>
              {legalLinks.map(([label, href]) => <li key={label}><NavLink label={label} href={href} /></li>)}
            </ul>
          </nav>
        </div>

        <section aria-labelledby={`${id}-newsletter`} className={styles.newsletter}>
          <h2 className={styles.heading} id={`${id}-newsletter`}>NEWSLETTER</h2>
          <p className={styles.intro}>One monthly briefing for smarter operations, intelligent growth and stronger protection.</p>
          <form onSubmit={submit} className={styles.form} aria-busy={status === "pending"}>
            <div className={styles.fields}>
              <label>
                <span className={styles.srOnly}>First name</span>
                <input name="firstName" placeholder="First name" autoComplete="given-name" />
              </label>
              <label>
                <span className={styles.srOnly}>Work email</span>
                <input name="email" placeholder="Work email" type="email" autoComplete="email" required />
              </label>
            </div>
            <button type="submit" disabled={status === "pending"}>
              {status === "pending" ? "Joining…" : "Join the Briefing"}<span aria-hidden="true">→</span>
            </button>
            <div className={styles.consent}>
              <input id={`${id}-consent`} name="consent" type="checkbox" required />
              <div>
                <label htmlFor={`${id}-consent`}>I agree to receive the monthly briefing.</label>
                <p>Unsubscribe anytime. <Link href="/privacy-policy">Privacy Policy</Link>.</p>
              </div>
            </div>
            <p className={styles.status} role="status" aria-live="polite">{message}</p>
          </form>
        </section>
      </div>

      <div className={styles.logoSlot} style={logoStyle}>
        {logo || (showLogoPlaceholder ? <div className={styles.logoPlaceholder}>LOGO<br />PENDING</div> : null)}
      </div>

      <div className={styles.watermarkClip} aria-hidden="true">
        <div className={styles.watermark}><span>ORAGROL</span><span className={styles.global}>GLOBAL</span></div>
      </div>

      <div className={styles.meta}>
        <div className={styles.copyright}>© {year} ORAGROL GLOBAL<span>Ontario · Canada</span></div>
        <div className={styles.tagline}>PROTECT <i>/</i> AUTOMATE <i>/</i> UNIFY</div>
      </div>
    </footer>
  );
}
