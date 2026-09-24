"use client";

import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { useId, useState } from "react";
import type { CSSProperties, FormEvent, ReactNode } from "react";
import styles from "./footer.module.css";
import { LinkedInIcon, InstagramIcon } from "./social-icons";
import { submitNewsletter } from "../../lib/submit-newsletter";

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
 * Careers / Talent / Partnerships shipped 2026-09-06 as their own
 * standalone logo-only pages (no shared nav/footer, per the handoff) and
 * are now real links here too.
 *
 * Bilingual (Phase 2l follow-up, discovered while translating the legal
 * pages): this component, despite already importing the locale-aware
 * `Link`, had ZERO actual text translation — every string was hardcoded
 * English, on every single redesigned page's French version (confirmed via
 * a live /fr/company screenshot showing an all-English footer). This was a
 * site-wide gap, not specific to Legal Pages, so it's fixed here rather
 * than flagged-and-deferred: added `useLocale` + `isFr` ternaries for the
 * section headings, newsletter copy, form labels/placeholders/messages, and
 * social aria-labels. Left in English, matching the established
 * nav-link-label convention used everywhere else on the site (site-header,
 * the old site-footer.tsx, OragrolMegaNav's NAV_ITEMS): the sitemap/
 * company/legal link LABELS themselves (Home, Services, Company, Privacy
 * Policy, ...) — these are page names, not sentence-level UI copy.
 */

type NewsletterSubmission = { firstName: string; email: string; consent: true };

export type SiteFooterProps = {
  /** Independent slot: swap in the real logo whenever it's ready. */
  logo?: ReactNode;
  logoStyle?: CSSProperties;
  /** Dashed "LOGO PENDING" box, for internal design review only — must stay false on a shipped page. */
  showLogoPlaceholder?: boolean;
  /** Defaults to the real HubSpot+Brevo signup (submit-newsletter.ts, POST /api/newsletter) — see D-085. Override only for tests/storybook. */
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
  ["Free Scan", "/scan"],
];

// Careers, Talent and Partnerships shipped 2026-09-06 as standalone
// logo-only pages (no shared nav/footer) — see
// app/components/site/oragrol-opportunity-page.tsx.
const companyLinks: [string, string | null][] = [
  ["Company", "/company"],
  ["Careers", "/careers"],
  ["Talent", "/talent"],
  ["Partnerships", "/partnerships"],
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

function NavLink({ label, href, isFr }: { label: string; href: string | null; isFr: boolean }) {
  return href ? <Link href={href}>{label}</Link> : <span className={styles.pending} title={isFr ? "Bientôt disponible" : "Coming soon"}>{label}</span>;
}

export default function SiteFooter({
  logo,
  logoStyle,
  showLogoPlaceholder = false,
  onSubscribe,
  year = 2026,
}: SiteFooterProps = {}) {
  const id = useId();
  const locale = useLocale();
  const isFr = locale === "fr";
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "pending") return;
    const form = event.currentTarget;
    const data = new FormData(form);
    if (data.get("consent") !== "on") return;
    setStatus("pending");
    setMessage("");
    try {
      await (onSubscribe ?? submitNewsletter)({
        firstName: String(data.get("firstName") || "").trim(),
        email: String(data.get("email") || "").trim(),
        consent: true,
      });
      setStatus("success");
      setMessage(isFr ? "Merci. Vous êtes maintenant abonné à l’infolettre mensuelle." : "Thank you. You’re subscribed to the monthly briefing.");
      form.reset();
    } catch {
      setStatus("error");
      setMessage(isFr ? "Nous n’avons pas pu terminer votre inscription. Veuillez réessayer." : "We couldn’t complete your signup. Please try again.");
    }
  }

  return (
    <footer className={styles.footer}>
      <div className={styles.grid}>
        <div>
          <h2 className={styles.heading} id={`${id}-sitemap`}>{isFr ? "PLAN DU SITE" : "SITEMAP"}</h2>
          <nav aria-labelledby={`${id}-sitemap`}>
            <ul className={styles.links}>
              {sitemapLinks.map(([label, href]) => <li key={label}><NavLink label={label} href={href} isFr={isFr} /></li>)}
            </ul>
          </nav>
          <div className={styles.socials}>
            <a href={SOCIAL_LINKS.linkedin} aria-label={isFr ? "ORAGROL Global sur LinkedIn" : "ORAGROL Global on LinkedIn"} target="_blank" rel="noreferrer"><LinkedInIcon /></a>
            <a href={SOCIAL_LINKS.instagram} aria-label={isFr ? "ORAGROL Global sur Instagram" : "ORAGROL Global on Instagram"} target="_blank" rel="noreferrer"><InstagramIcon /></a>
          </div>
        </div>

        <div>
          <h2 className={styles.heading} id={`${id}-company`}>{isFr ? "ENTREPRISE" : "COMPANY"}</h2>
          <nav aria-labelledby={`${id}-company`}>
            <ul className={styles.links}>
              {companyLinks.map(([label, href]) => <li key={label}><NavLink label={label} href={href} isFr={isFr} /></li>)}
            </ul>
          </nav>
        </div>

        <div>
          <h2 className={styles.heading} id={`${id}-legal`}>{isFr ? "MENTIONS LÉGALES" : "LEGAL"}</h2>
          <nav aria-labelledby={`${id}-legal`}>
            <ul className={styles.links}>
              {legalLinks.map(([label, href]) => <li key={label}><NavLink label={label} href={href} isFr={isFr} /></li>)}
            </ul>
          </nav>
        </div>

        <section aria-labelledby={`${id}-newsletter`} className={styles.newsletter}>
          <h2 className={styles.heading} id={`${id}-newsletter`}>{isFr ? "INFOLETTRE" : "NEWSLETTER"}</h2>
          <p className={styles.intro}>{isFr ? "Un bulletin mensuel pour des opérations plus intelligentes, une croissance ciblée et une protection renforcée." : "One monthly briefing for smarter operations, intelligent growth and stronger protection."}</p>
          <form onSubmit={submit} className={styles.form} aria-busy={status === "pending"}>
            <div className={styles.fields}>
              <label>
                <span className={styles.srOnly}>{isFr ? "Prénom" : "First name"}</span>
                <input name="firstName" placeholder={isFr ? "Prénom" : "First name"} autoComplete="given-name" />
              </label>
              <label>
                <span className={styles.srOnly}>{isFr ? "Courriel professionnel" : "Work email"}</span>
                <input name="email" placeholder={isFr ? "Courriel professionnel" : "Work email"} type="email" autoComplete="email" required />
              </label>
            </div>
            <button type="submit" disabled={status === "pending"}>
              {status === "pending" ? (isFr ? "Inscription…" : "Joining…") : (isFr ? "S’abonner à l’infolettre" : "Join the Briefing")}<span aria-hidden="true">→</span>
            </button>
            <div className={styles.consent}>
              <input id={`${id}-consent`} name="consent" type="checkbox" required />
              <div>
                <label htmlFor={`${id}-consent`}>{isFr ? "J’accepte de recevoir l’infolettre mensuelle." : "I agree to receive the monthly briefing."}</label>
                <p>{isFr ? "Désabonnement en tout temps. " : "Unsubscribe anytime. "}<Link href="/privacy-policy">{isFr ? "Politique de confidentialité" : "Privacy Policy"}</Link>.</p>
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
        <div className={styles.tagline}>{isFr ? <>PROTÉGER <i>/</i> AUTOMATISER <i>/</i> UNIFIER</> : <>PROTECT <i>/</i> AUTOMATE <i>/</i> UNIFY</>}</div>
      </div>
    </footer>
  );
}
