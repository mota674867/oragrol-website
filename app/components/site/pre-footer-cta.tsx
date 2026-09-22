"use client";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import "../../pre-footer-cta.css";

/**
 * Shared pre-footer CTA — one component, used identically on every
 * redesigned page immediately before the footer. GPT's matched-set
 * redesign of the CTA + footer (see footer.tsx). Content is a single
 * dictionary keyed by page, so every page's exact copy lives in one
 * place instead of being re-typed as props at each call site.
 *
 * `page` is required deliberately (no pathname auto-detection) — every
 * call site passes it explicitly, which keeps the copy decoupled from
 * the URL matching what the caller intended.
 *
 * Styling lives in app/pre-footer-cta.css (see that file for why —
 * styled-jsx would force this into a Client Component on its own,
 * which broke the Server Component pages that used to render it).
 *
 * Bilingual (D-086, Task #21): found while building the Business
 * Automation page — this component was never converted in Phase 2, so
 * every "done" French page (Homepage, Services) was silently showing
 * this exact English block right before the footer. Fixed here, which
 * retroactively completes those two pages too, not just this one.
 *
 * Deliberately `"use client"` + `useTranslations` here, NOT
 * `getTranslations` — almost every call site (home-client.tsx,
 * services-client.tsx, ba-client.tsx, industries-client.tsx,
 * or-one-client.tsx, contact-client.tsx, resources-client.tsx,
 * faq-client.tsx) is itself a Client Component, and a Client Component
 * cannot render an async Server Component via a direct JSX import (the
 * exact bug this same build already hit once with HomeCybersecurity —
 * see home-section-04.tsx). Making this a small Client Component is the
 * one direction that's safe from every call site, server or client;
 * the two Server Component callers (company/page.tsx,
 * resources/[slug]/page.tsx) can render a Client Component with no
 * issue, so nothing else needed to change there.
 *
 * `messages.SharedCta` carries all 9 CTAKeys so every current and
 * future caller resolves cleanly under /fr; only the 3 pages actually
 * translated so far (home, services, business-automation) have real
 * French copy — the other 6 keys hold English placeholder text until
 * their own page's turn in Task #21, flagged in PROJECT_MEMORY rather
 * than left as a silent gap.
 */
export type CTAKey =
  | "home"
  | "services"
  | "business-automation"
  | "or-one"
  | "industries"
  | "resources"
  | "company"
  | "contact"
  | "faq";

// Hrefs are internal paths, not translatable copy — next-intl's Link
// prefixes them with /fr automatically, so these stay a plain lookup.
const SECONDARY_HREF: Record<CTAKey, string> = {
  home: "/services",
  // Was #or10-index (the old radial category index) — that anchor no
  // longer exists after the 2026-09-08 rebuild. Points at the new
  // page's real first buyable section instead.
  services: "/services#service-packages",
  "business-automation": "/business-automation#packages",
  "or-one": "/or-one#one-intro",
  industries: "/industries#industry-index",
  resources: "/resources#resource-library",
  company: "/contact",
  contact: "/contact#enquiry",
  faq: "/contact",
};

export default function PreFooterCta({ page }: { page: CTAKey }) {
  const t = useTranslations("SharedCta");

  return (
    <section className="oragrol-cta" aria-labelledby={`oragrol-cta-${page}`}>
      <div className="oragrol-cta__inner">
        <div className="oragrol-cta__copy">
          <p className="oragrol-cta__eyebrow">{t(`${page}.eyebrow`)}</p>
          <h2 id={`oragrol-cta-${page}`} className="oragrol-cta__headline">
            {t(`${page}.headline`)}
          </h2>
        </div>

        <div className="oragrol-cta__actions">
          <Link className="oragrol-cta__primary" href="/cyber-health">
            <span>{t("getCyberHealthScore")}</span>
            <span aria-hidden="true">↗</span>
          </Link>
          <Link className="oragrol-cta__secondary" href={SECONDARY_HREF[page]}>
            <span>{t(`${page}.secondaryLabel`)}</span>
            <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
