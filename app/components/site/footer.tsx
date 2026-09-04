import Link from "next/link";
import "../../footer.css";

/**
 * Shared site footer — one component, identical on every page. GPT's
 * matched-set redesign of the CTA + footer (see pre-footer-cta.tsx).
 *
 * Legal links (Privacy Policy / Terms of Use / Accessibility) render as
 * plain, non-clickable text until those pages actually exist — never
 * link to a route that doesn't exist yet. Flip a slug into LIVE_LEGAL
 * once its page is built and wired in.
 *
 * Styling lives in app/footer.css (see that file for why — styled-jsx
 * would force this into a Client Component, which broke the Server
 * Component pages that render it) with class names prefixed
 * "oragrol-footer__" on purpose — the old, now-removed per-page footers
 * left behind generic classes (.footer-top, .social, .footer-base,
 * .footer-brand...) still defined in gpt-pages.css / homepage-v3.css.
 * Reusing those names would silently pull in their old styles on any
 * page that still imports those stylesheets.
 */
const ArrowMark = () => <span className="footer-tick" aria-hidden="true" />;

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M7.4 10v7M7.4 7.25v.1M11 17v-7m0 3.15c.7-2.05 5.6-2.2 5.6 1.55V17" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle className="social-dot" cx="17.3" cy="6.8" r="0.75" />
    </svg>
  );
}

function ORArtwork() {
  const nodes = [
    [67, 57, 2.1], [87, 45, 1.6], [104, 64, 1.8], [121, 51, 1.3],
    [139, 69, 1.6], [156, 58, 1.3], [176, 80, 1.8], [92, 88, 1.8],
    [115, 93, 1.25], [137, 101, 1.8], [158, 99, 1.2], [179, 112, 1.6],
    [73, 119, 1.5], [99, 124, 1.25], [123, 131, 1.7], [148, 126, 1.35],
    [171, 142, 1.9], [84, 153, 1.45], [109, 158, 1.75], [134, 155, 1.2],
    [155, 169, 1.5], [74, 185, 1.5], [99, 191, 1.25], [120, 183, 1.55],
    [142, 194, 1.2], [165, 188, 1.55], [69, 218, 1.5], [91, 224, 1.2],
    [112, 214, 1.7], [135, 221, 1.3], [157, 211, 1.45], [79, 248, 1.25],
    [103, 244, 1.7], [126, 251, 1.25], [150, 239, 1.6], [167, 259, 1.3],
    [71, 283, 1.45], [94, 273, 1.2], [117, 286, 1.6], [140, 276, 1.25],
    [158, 294, 1.45], [82, 315, 1.3], [106, 308, 1.6], [130, 320, 1.25],
    [151, 311, 1.4], [72, 347, 1.35], [97, 341, 1.2], [121, 352, 1.5],
    [145, 344, 1.25], [158, 365, 1.5]
  ];

  const links = [
    [0,1],[0,7],[1,2],[1,8],[2,3],[2,8],[2,9],[3,4],[3,9],[4,5],[4,10],
    [5,6],[5,10],[6,11],[7,8],[7,12],[8,9],[8,13],[9,10],[9,14],[10,11],
    [10,15],[11,16],[12,13],[12,17],[13,14],[13,18],[14,15],[14,19],[15,16],
    [15,20],[17,18],[17,21],[18,19],[18,22],[19,20],[19,23],[20,25],[21,22],
    [21,26],[22,23],[22,27],[23,24],[23,28],[24,25],[24,29],[25,30],[26,27],
    [26,31],[27,28],[27,32],[28,29],[28,33],[29,30],[29,34],[30,35],[31,32],
    [31,36],[32,33],[32,37],[33,34],[33,38],[34,35],[34,39],[35,40],[36,37],
    [36,41],[37,38],[37,42],[38,39],[38,43],[39,40],[39,44],[40,44],[41,42],
    [41,45],[42,43],[42,46],[43,44],[43,47],[44,48],[45,46],[46,47],[47,48],[48,49]
  ];

  return (
    <svg
      className="or-art"
      viewBox="0 0 410 430"
      role="img"
      aria-label="OR monogram with an abstract human and artificial-intelligence network"
    >
      <defs>
        <clipPath id="oragrol-o-clip">
          <ellipse cx="123" cy="215" rx="111" ry="190" />
        </clipPath>
      </defs>

      <g clipPath="url(#oragrol-o-clip)">
        <path
          className="human-profile"
          d="M72 52c39-24 92-11 111 25 11 21 8 44 18 62 8 14 23 22 25 35 2 10-8 17-18 22-4 3-5 9-3 16 3 11-2 18-12 22 6 8 3 18-8 23-12 5-23 0-33 6-10 7-14 23-10 42 6 27 20 52 34 78H39c18-33 30-68 31-104 1-34-13-54-21-80-16-50-14-113 23-145Z"
        />
        <path
          className="hand-line"
          d="M35 327c21-34 46-48 72-57 9-3 15-9 22-18 7-10 15-16 23-12 7 4 5 13 0 21 11-15 21-26 29-22 9 5 1 19-8 31 10-11 20-19 27-13 8 8-4 21-14 31 8-5 16-5 20 1 6 10-11 24-28 34-24 15-43 19-56 35"
        />

        <g className="network-lines">
          {links.map(([a, b], i) => (
            <line
              key={i}
              x1={nodes[a][0]}
              y1={nodes[a][1]}
              x2={nodes[b][0]}
              y2={nodes[b][1]}
            />
          ))}
        </g>
        <g className="network-nodes">
          {nodes.map(([x, y, r], i) => (
            <circle key={i} cx={x} cy={y} r={r} />
          ))}
        </g>
        <g className="particles">
          <circle cx="187" cy="66" r="1.3" /><circle cx="198" cy="91" r="0.9" />
          <circle cx="213" cy="119" r="1.4" /><circle cx="201" cy="151" r="0.8" />
          <circle cx="214" cy="203" r="1.1" /><circle cx="191" cy="238" r="1.4" />
          <circle cx="204" cy="276" r="0.9" /><circle cx="187" cy="321" r="1.2" />
        </g>
      </g>

      <ellipse className="o-outline" cx="123" cy="215" rx="111" ry="190" />
      <path
        className="r-outline"
        d="M234 25h54c64 0 105 36 105 92 0 55-41 93-105 93h-54m0 0h65c45 0 76 28 92 75l18 55c7 21 12 41 15 65M234 25v380"
      />
    </svg>
  );
}

const exploreLinks: [string, string][] = [
  ["Services", "/services"],
  ["Business Automation", "/business-automation"],
  ["OR ONE", "/or-one"],
  ["Industries", "/industries"],
];

const companyLinks: [string, string][] = [
  ["Company", "/company"],
  ["Resources", "/resources"],
  ["FAQ", "/faq"],
  ["Contact", "/contact"],
];

// Slugs whose page actually exists and is wired into the site. None of
// the three legal pages are live yet — see the Pending Items register —
// so all three currently render as plain text below, not links.
const legalLinks: [string, string][] = [
  ["Privacy Policy", "/privacy"],
  ["Terms of Use", "/terms"],
  ["Accessibility", "/accessibility"],
];
const LIVE_LEGAL = new Set<string>([]);

function FooterColumn({
  heading,
  links,
}: {
  heading: string;
  links: [string, string][];
}) {
  return (
    <nav className="footer-column" aria-label={heading}>
      <h3>{heading}</h3>
      <ul>
        {links.map(([label, href]) => (
          <li key={label}>
            <Link href={href}>{label}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function LegalColumn() {
  return (
    <nav className="footer-column" aria-label="Legal">
      <h3>LEGAL</h3>
      <ul>
        {legalLinks.map(([label, href]) =>
          LIVE_LEGAL.has(href) ? (
            <li key={label}>
              <Link href={href}>{label}</Link>
            </li>
          ) : (
            <li key={label}>
              <span className="footer-legal-pending" title="Coming soon">
                {label}
              </span>
            </li>
          )
        )}
      </ul>
    </nav>
  );
}

export default function SiteFooter() {
  return (
    <footer className="oragrol-footer">
      <div className="oragrol-footer__grid">
        <div className="oragrol-footer__mark">
          <ORArtwork />
        </div>

        <div className="oragrol-footer__intro">
          <h2>ORAGROL GLOBAL</h2>
          <p>
            Cybersecurity, intelligent automation and coordinated operations for
            Canadian businesses.
          </p>
          <ArrowMark />
        </div>

        <FooterColumn heading="EXPLORE" links={exploreLinks} />
        <FooterColumn heading="COMPANY" links={companyLinks} />
        <LegalColumn />

        <div className="oragrol-footer__meta">
          <p>© 2026 ORAGROL GLOBAL</p>
          <ArrowMark />
          <p>Thunder Bay · Ontario · Canada</p>
          <ArrowMark />
          <p>EN / FR</p>
          <div className="oragrol-footer__socials">
            <a
              href="https://www.linkedin.com/company/oragrol-global/"
              aria-label="ORAGROL Global on LinkedIn"
              target="_blank"
              rel="noreferrer"
            >
              <LinkedInIcon />
            </a>
            <a
              href="https://www.instagram.com/oragrolglobal/"
              aria-label="ORAGROL Global on Instagram"
              target="_blank"
              rel="noreferrer"
            >
              <InstagramIcon />
            </a>
          </div>
        </div>
      </div>

      <div className="oragrol-footer__base">
        <span>PROTECT / AUTOMATE / UNIFY</span>
        <span className="oragrol-footer__rule" aria-hidden="true" />
      </div>
    </footer>
  );
}
