import Link from "next/link";
import "../../pre-footer-cta.css";

/**
 * Shared pre-footer CTA — one component, used identically on every
 * redesigned page immediately before the footer. GPT's matched-set
 * redesign of the CTA + footer (see footer.tsx). Content is a single
 * dictionary keyed by page, so every page's exact copy lives in one
 * place instead of being re-typed as props at each call site.
 *
 * `page` is required deliberately (no pathname auto-detection) — every
 * call site passes it explicitly, which keeps this a plain server-
 * renderable component (no "use client"/usePathname needed) and never
 * depends on the URL matching what the caller intended.
 *
 * Styling lives in app/pre-footer-cta.css (see that file for why —
 * styled-jsx would force this into a Client Component, which broke the
 * Server Component pages that render it).
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

type CTAContent = {
  eyebrow: string;
  headline: string;
  secondaryLabel: string;
  secondaryHref: string;
};

const CTA_CONTENT: Record<CTAKey, CTAContent> = {
  home: {
    eyebrow: "Clarity before complexity",
    headline:
      "Cybersecurity protection. Intelligent business automation. OR ONE coordinated system.",
    secondaryLabel: "Explore What ORAGROL Does",
    secondaryHref: "/services",
  },
  services: {
    eyebrow: "Your clearest next step",
    headline:
      "The right protection begins with understanding what matters most.",
    secondaryLabel: "Build Your Scope",
    secondaryHref: "/services#or10-index",
  },
  "business-automation": {
    eyebrow: "Your clearest next step",
    headline:
      "Find where time is being lost and where intelligent automation can create measurable value.",
    secondaryLabel: "Explore Automation Packages",
    secondaryHref: "/business-automation#packages",
  },
  "or-one": {
    eyebrow: "Begin privately",
    headline:
      "Bring security, automation and operational intelligence into one coordinated system.",
    secondaryLabel: "Explore OR ONE",
    secondaryHref: "/or-one#one-intro",
  },
  industries: {
    eyebrow: "Your clearest next step",
    headline:
      "Protection works better when it reflects how your industry actually operates.",
    secondaryLabel: "Find Your Industry",
    secondaryHref: "/industries#industry-index",
  },
  resources: {
    eyebrow: "One useful starting point",
    headline:
      "Turn credible insight into clearer decisions and practical action.",
    secondaryLabel: "Explore Our Resources",
    secondaryHref: "/resources#resource-library",
  },
  company: {
    eyebrow: "One clear starting point",
    headline:
      "Discover the thinking, experience and purpose behind ORAGROL Global.",
    secondaryLabel: "Start a Conversation",
    secondaryHref: "/contact",
  },
  contact: {
    eyebrow: "One clear starting point",
    headline:
      "Start with clarity. We will help you identify the most valuable next step.",
    secondaryLabel: "Submit an Enquiry",
    secondaryHref: "/contact#enquiry",
  },
  faq: {
    eyebrow: "Still have a question?",
    headline:
      "Still looking for clarity? Let us help you find the right answer.",
    secondaryLabel: "Contact ORAGROL",
    secondaryHref: "/contact",
  },
};

export default function PreFooterCta({ page }: { page: CTAKey }) {
  const content = CTA_CONTENT[page];

  return (
    <section className="oragrol-cta" aria-labelledby={`oragrol-cta-${page}`}>
      <div className="oragrol-cta__inner">
        <div className="oragrol-cta__copy">
          <p className="oragrol-cta__eyebrow">{content.eyebrow}</p>
          <h2 id={`oragrol-cta-${page}`} className="oragrol-cta__headline">
            {content.headline}
          </h2>
        </div>

        <div className="oragrol-cta__actions">
          <Link className="oragrol-cta__primary" href="/cyber-health">
            <span>Get Your Cyber Health Score</span>
            <span aria-hidden="true">↗</span>
          </Link>
          <Link className="oragrol-cta__secondary" href={content.secondaryHref}>
            <span>{content.secondaryLabel}</span>
            <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
