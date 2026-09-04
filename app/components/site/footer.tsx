import Link from "next/link";
import "../../footer.css";

/**
 * Shared site footer — one component, identical on every page (per
 * decision: a restrained, fixed footer is more premium than unique
 * per-page footer copy, since the pre-footer CTA already carries the
 * page-specific message). See app/footer.css for styling.
 *
 * Class names are prefixed "sf-" deliberately — the old, now-removed
 * per-page footers left behind generic classes (.footer-top, .social,
 * .footer-base, .footer-brand...) still defined in gpt-pages.css /
 * homepage-v3.css. Reusing those names would silently pull in their
 * old styles on any page that still imports those stylesheets.
 *
 * Legal links (Privacy Policy / Terms of Use / Accessibility) render as
 * plain, non-clickable text until those pages are actually built and
 * live — never link to a page that doesn't exist yet.
 */
function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.446-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.368-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="sf-top">
        <div className="sf-mark" aria-hidden="true">
          <span className="sf-or">
            <em>O</em>
            <b>R</b>
          </span>
          <p className="sf-caps">PROTECT / AUTOMATE / UNIFY</p>
        </div>
        <div className="sf-brand">
          <h2>ORAGROL GLOBAL</h2>
          <p>
            Cybersecurity, intelligent automation and coordinated
            operations for Canadian businesses.
          </p>
          <span className="sf-dash" />
        </div>
        <nav className="sf-col" aria-label="Explore ORAGROL">
          <span className="sf-col-head">EXPLORE</span>
          <Link href="/services">Services</Link>
          <Link href="/business-automation">Business Automation</Link>
          <Link href="/or-one">OR ONE</Link>
          <Link href="/industries">Industries</Link>
        </nav>
        <nav className="sf-col" aria-label="Company">
          <span className="sf-col-head">COMPANY</span>
          <Link href="/company">Company</Link>
          <Link href="/resources">Resources</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/contact">Contact</Link>
        </nav>
        <nav className="sf-col" aria-label="Legal">
          <span className="sf-col-head">LEGAL</span>
          <span className="sf-pending" title="Coming soon">
            Privacy Policy
          </span>
          <span className="sf-pending" title="Coming soon">
            Terms of Use
          </span>
          <span className="sf-pending" title="Coming soon">
            Accessibility
          </span>
        </nav>
        <div className="sf-meta">
          <span>© 2026 ORAGROL GLOBAL</span>
          <span>Thunder Bay · Ontario · Canada</span>
          <span>EN / FR</span>
          <div className="sf-social">
            <a
              aria-label="ORAGROL Global on LinkedIn"
              href="https://www.linkedin.com/company/oragrol-global/"
              target="_blank"
              rel="noreferrer me"
            >
              <LinkedInIcon />
            </a>
            <a
              aria-label="ORAGROL Global on Instagram"
              href="https://www.instagram.com/oragrolglobal"
              target="_blank"
              rel="noreferrer me"
            >
              <InstagramIcon />
            </a>
          </div>
        </div>
      </div>
      <div className="sf-base">
        <span>CYBER. AUTO. OPS.</span>
        <i className="sf-base-line" aria-hidden="true" />
      </div>
    </footer>
  );
}
