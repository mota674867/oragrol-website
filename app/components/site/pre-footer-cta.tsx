import Link from "next/link";
import "../../pre-footer-cta.css";

/**
 * Shared pre-footer CTA — one component, used identically on every
 * redesigned page immediately before the footer. Only `eyebrow`,
 * `headline`, and the secondary action change per page; the primary
 * action is always "Get Your Cyber Health Score" → /cyber-health.
 *
 * Structure, size, colours, and both link styles are fixed here so no
 * page can drift from any other — see app/pre-footer-cta.css.
 */
export type PreFooterCtaProps = {
  eyebrow: string;
  headline: string;
  secondaryLabel: string;
  secondaryHref: string;
};

export default function PreFooterCta({
  eyebrow,
  headline,
  secondaryLabel,
  secondaryHref,
}: PreFooterCtaProps) {
  return (
    <section className="pf-cta">
      <div className="pf-cta-text">
        <p className="pf-cta-eyebrow">{eyebrow}</p>
        <h2 className="pf-cta-headline">{headline}</h2>
      </div>
      <div className="pf-cta-actions">
        <Link className="pf-cta-primary" href="/cyber-health">
          Get Your Cyber Health Score <span aria-hidden="true">↗</span>
        </Link>
        <Link className="pf-cta-secondary" href={secondaryHref}>
          {secondaryLabel} <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </section>
  );
}
