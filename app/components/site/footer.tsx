import Link from "next/link";
import styles from "./footer.module.css";

/**
 * Shared site footer — one component, identical on every page. GPT's
 * second-pass footer redesign (denser head+hand particle network,
 * replacing the flatter first version) — content and layout unchanged
 * from that first pass, only the artwork and the styling mechanism
 * changed.
 *
 * Styling is a CSS Module (footer.module.css) — GPT's own choice this
 * time, and a better one than the `<style jsx global>` from the first
 * pass: CSS Modules hash every class name at build time, so there's no
 * risk of colliding with gpt-pages.css's old leftover classes, and
 * (unlike styled-jsx) they don't force this into a Client Component —
 * company/page.tsx and services/page.tsx stay Server Components.
 *
 * Legal links (Privacy Policy / Terms of Use / Accessibility) render as
 * plain, non-clickable text until those pages actually exist — never
 * link to a route that doesn't exist yet. Flip a slug into LIVE_LEGAL
 * once its page is built and wired in.
 */
function AccentTick() {
  return <span className={styles.tick} aria-hidden="true" />;
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M7.35 10v7M7.35 7.15v.1M11 17v-7m0 3.1c.65-2 5.55-2.2 5.55 1.55V17" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle className={styles.socialDot} cx="17.25" cy="6.8" r="0.8" />
    </svg>
  );
}

function HumanAINetwork() {
  const headNodes = [
    [74,55,1.4],[96,41,1.2],[120,37,1.55],[143,45,1.15],[164,60,1.4],[181,79,1.1],
    [91,76,1.15],[116,66,1.3],[140,72,1.05],[160,86,1.4],[77,100,1.3],[102,96,1.05],
    [126,99,1.55],[148,105,1.15],[173,111,1.45],[89,125,1.1],[113,122,1.45],[137,128,1.05],
    [159,133,1.35],[181,139,1.1],[76,151,1.25],[101,148,1.1],[124,154,1.5],[147,158,1.05],
    [169,164,1.35],[91,178,1.15],[115,181,1.4],[139,184,1.05],[160,190,1.3],[181,198,1.0],
    [80,206,1.2],[104,209,1.0],[127,212,1.45],[150,218,1.0],[170,225,1.25],[91,237,1.1],
    [115,240,1.35],[138,244,1.0],[159,251,1.2],[174,266,1.05],[83,269,1.2],[105,273,1.0],
    [128,277,1.35],[148,284,1.0]
  ] as const;

  const handNodes = [
    [48,322,1.2],[64,303,1.05],[81,290,1.3],[98,281,1.0],[112,292,1.2],[124,308,1.0],
    [139,297,1.25],[153,287,1.0],[166,298,1.2],[176,314,1.0],[188,306,1.15],[199,302,0.95],
    [190,326,1.2],[175,340,1.0],[158,349,1.25],[138,355,1.0],[116,358,1.3],[94,352,1.0],
    [74,343,1.2],[57,337,1.0]
  ] as const;

  const headLinks = [
    [0,1],[0,6],[0,10],[1,2],[1,6],[1,7],[2,3],[2,7],[2,8],[3,4],[3,8],[4,5],[4,9],
    [5,14],[6,7],[6,10],[6,11],[7,8],[7,11],[7,12],[8,9],[8,12],[8,13],[9,14],[10,11],
    [10,15],[10,20],[11,12],[11,15],[11,16],[12,13],[12,16],[12,17],[13,14],[13,17],[13,18],
    [14,19],[15,16],[15,20],[15,21],[16,17],[16,21],[16,22],[17,18],[17,22],[17,23],[18,19],
    [18,23],[18,24],[19,24],[20,21],[20,25],[20,30],[21,22],[21,25],[21,26],[22,23],[22,26],
    [22,27],[23,24],[23,27],[23,28],[24,29],[25,26],[25,30],[25,31],[26,27],[26,31],[26,32],
    [27,28],[27,32],[27,33],[28,29],[28,33],[28,34],[29,34],[30,31],[30,35],[30,40],[31,32],
    [31,35],[31,36],[32,33],[32,36],[32,37],[33,34],[33,37],[33,38],[34,39],[35,36],[35,40],
    [35,41],[36,37],[36,41],[36,42],[37,38],[37,42],[37,43],[38,39],[38,43],[40,41],[41,42],[42,43]
  ] as const;

  const handLinks = [
    [0,1],[0,19],[1,2],[1,18],[1,19],[2,3],[2,17],[2,18],[3,4],[3,17],[4,5],[4,6],
    [4,16],[4,17],[5,6],[5,15],[5,16],[6,7],[6,14],[6,15],[7,8],[7,14],[8,9],[8,12],
    [8,13],[9,10],[9,12],[10,11],[10,12],[12,13],[13,14],[14,15],[15,16],[16,17],[17,18],[18,19]
  ] as const;

  return (
    <g clipPath="url(#oragrol-o-clip)">
      <path className={styles.profileContour} d="M67 55C89 32 126 24 154 41c26 15 39 42 36 69-2 17 2 29 15 42 8 8 8 15-4 20l-10 4c4 7 3 13-5 17 6 6 3 13-6 16-7 3-10 8-10 16 0 18-10 27-28 27-16 0-27 4-33 16-8 15-6 30 0 45" />
      <path className={styles.faceDetail} d="M181 111c-4 12-6 21-4 29M178 174c-8 2-14 2-20-1M177 190c-7 5-15 6-23 3" />
      <path className={styles.handContour} d="M38 342c15-32 34-49 57-58 8-3 14-10 20-18 7-10 14-13 19-8 5 5 1 15-5 24 10-15 21-27 28-21 7 5-1 18-9 29 10-11 20-18 26-12 7 7-4 19-13 28 9-6 17-7 21-1 6 9-8 22-24 32-21 13-39 17-54 31" />

      <g className={styles.networkLines}>
        {headLinks.map(([a,b],i) => <line key={`h-${i}`} x1={headNodes[a][0]} y1={headNodes[a][1]} x2={headNodes[b][0]} y2={headNodes[b][1]} />)}
        {handLinks.map(([a,b],i) => <line key={`p-${i}`} x1={handNodes[a][0]} y1={handNodes[a][1]} x2={handNodes[b][0]} y2={handNodes[b][1]} />)}
      </g>
      <g className={styles.networkNodes}>
        {headNodes.map(([x,y,r],i) => <circle key={`hn-${i}`} cx={x} cy={y} r={r} />)}
        {handNodes.map(([x,y,r],i) => <circle key={`pn-${i}`} cx={x} cy={y} r={r} />)}
      </g>
      <g className={styles.particles}>
        <circle cx="199" cy="72" r="1.1"/><circle cx="209" cy="95" r=".75"/><circle cx="216" cy="126" r="1.15"/>
        <circle cx="206" cy="217" r=".8"/><circle cx="196" cy="246" r="1"/><circle cx="213" cy="282" r=".75"/>
        <circle cx="47" cy="211" r=".85"/><circle cx="56" cy="252" r="1.05"/>
      </g>
    </g>
  );
}

function ORArtwork() {
  return (
    <svg className={styles.orArtwork} viewBox="0 0 420 430" role="img" aria-label="OR monogram with an abstract human and artificial-intelligence network">
      <defs><clipPath id="oragrol-o-clip"><ellipse cx="123" cy="215" rx="111" ry="190" /></clipPath></defs>
      <HumanAINetwork />
      <ellipse className={styles.oOutline} cx="123" cy="215" rx="111" ry="190" />
      <path className={styles.rOutline} d="M234 25h54c64 0 105 36 105 92 0 55-41 93-105 93h-54m0 0h65c45 0 76 28 92 75l18 55c7 21 12 41 15 65M234 25v380" />
    </svg>
  );
}

const exploreLinks: [string, string][] = [["Services","/services"],["Business Automation","/business-automation"],["OR ONE","/or-one"],["Industries","/industries"]];
const companyLinks: [string, string][] = [["Company","/company"],["Resources","/resources"],["FAQ","/faq"],["Contact","/contact"]];

// Slugs whose page actually exists and is wired into the site. All three
// legal pages are now live: Privacy Policy (2026-09-05), Terms of Use
// (2026-09-06), and Accessibility (2026-09-06).
const legalLinks: [string, string][] = [["Privacy Policy","/privacy-policy"],["Terms of Use","/terms-of-use"],["Accessibility","/accessibility"]];
const LIVE_LEGAL = new Set<string>(["/privacy-policy", "/terms-of-use", "/accessibility"]);

function FooterColumn({ heading, links, className = "" }: { heading: string; links: [string, string][]; className?: string }) {
  return (
    <nav className={`${styles.column} ${className}`} aria-label={heading}>
      <h3>{heading}</h3>
      <ul>{links.map(([label,href]) => <li key={label}><Link href={href}>{label}</Link></li>)}</ul>
    </nav>
  );
}

function LegalColumn({ className = "" }: { className?: string }) {
  return (
    <nav className={`${styles.column} ${className}`} aria-label="Legal">
      <h3>LEGAL</h3>
      <ul>
        {legalLinks.map(([label, href]) =>
          LIVE_LEGAL.has(href) ? (
            <li key={label}><Link href={href}>{label}</Link></li>
          ) : (
            <li key={label}><span className={styles.legalPending} title="Coming soon">{label}</span></li>
          )
        )}
      </ul>
    </nav>
  );
}

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.grid}>
        <div className={`${styles.cell} ${styles.mark}`}><ORArtwork /></div>
        <div className={`${styles.cell} ${styles.intro}`}>
          <h2>ORAGROL GLOBAL</h2>
          <p>Cybersecurity, intelligent automation and coordinated operations for Canadian businesses.</p>
          <AccentTick />
        </div>
        <FooterColumn heading="EXPLORE" links={exploreLinks} className={`${styles.cell} ${styles.explore}`} />
        <FooterColumn heading="COMPANY" links={companyLinks} className={`${styles.cell} ${styles.company}`} />
        <LegalColumn className={`${styles.cell} ${styles.legal}`} />
        <div className={`${styles.cell} ${styles.meta}`}>
          <p>© 2026 ORAGROL GLOBAL</p><AccentTick /><p>Thunder Bay · Ontario · Canada</p><AccentTick /><p>EN / FR</p>
          <div className={styles.socials}>
            <a href="https://www.linkedin.com/company/oragrol-global/" aria-label="ORAGROL Global on LinkedIn" target="_blank" rel="noreferrer"><LinkedInIcon /></a>
            <a href="https://www.instagram.com/oragrolglobal/" aria-label="ORAGROL Global on Instagram" target="_blank" rel="noreferrer"><InstagramIcon /></a>
          </div>
        </div>
      </div>
      <div className={styles.base}><span>PROTECT / AUTOMATE / UNIFY</span><span className={styles.rule} aria-hidden="true" /></div>
    </footer>
  );
}
