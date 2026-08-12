import Link from "next/link";
import { Container, Grid, NavLink, Section, Text } from "../ui";
import { OragrolLogo } from "../brand/oragrol-logo";

/**
 * SiteFooter — Step 4. Structure per brief section 21: logo + short
 * statement, Services/Solutions/Cyber Health/Resources/Company/Contact,
 * EN | FR, LinkedIn, legal links. All destination pages other than Home
 * don't exist yet (later build phases) — links point at their intended
 * final paths so nothing needs rewiring when those pages ship.
 *
 * Logo: reuses OragrolLogo (the same component SiteHeader uses), not a
 * hand-typed "ORAGROL" span + bare OragrolRing — a prior version of this
 * file recreated the wordmark separately, which drifted from the header
 * (wrong case, missing the "GLOBAL" subtitle, wrong ring-to-text gap).
 * OragrolLogo is the single source of truth for the full lockup; every
 * place the logo appears should import it, never re-approximate it.
 *
 * LinkedIn href is "#": no real profile URL was supplied, and the brief
 * prohibits inventing partner/company details, so this is left as an
 * explicit placeholder rather than a guessed URL. Rendered as a text link,
 * not an icon: lucide-react 1.31.0 dropped all brand/social icons (no
 * Linkedin export), and hand-drawing the trademarked glyph as a custom SVG
 * isn't worth it for one footer link.
 */

const EXPLORE_LINKS = [
  { label: "Services", href: "/services" },
  { label: "Solutions", href: "/solutions" },
  { label: "Cyber Health", href: "/cyber-health" },
  { label: "Resources", href: "/insights" },
  { label: "Company", href: "/company" },
  { label: "Contact", href: "/contact" },
];

const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "/legal/privacy" },
  { label: "Terms of Use", href: "/legal/terms" },
  { label: "Cookie Policy", href: "/legal/cookies" },
  { label: "Accessibility", href: "/legal/accessibility" },
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <Section environment="dark" as="footer">
      <Container size="xl" className="py-16">
        <Grid cols={{ base: 1, md: 4 }} gap="lg">
          <div className="flex flex-col gap-4 md:col-span-2">
            <Link href="/" className="inline-flex w-fit rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">
              <OragrolLogo height={36} />
            </Link>
            <Text size="sm" tone="secondary" className="max-w-sm">
              Cybersecurity clarity for modern businesses.
            </Text>
            <div className="flex items-center gap-4 pt-2">
              <a
                href="#"
                className="font-body text-sm text-text-secondary transition-colors duration-150 hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent rounded-sm"
              >
                LinkedIn
              </a>
              <span className="font-body text-sm text-text-secondary">EN | FR</span>
            </div>
          </div>

          <nav aria-label="Explore">
            <p className="font-body text-xs font-medium uppercase tracking-widest text-text-muted">
              Explore
            </p>
            <ul className="mt-4 flex flex-col gap-3">
              {EXPLORE_LINKS.map((link) => (
                <li key={link.href}>
                  <NavLink href={link.href} className="text-sm">
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Legal">
            <p className="font-body text-xs font-medium uppercase tracking-widest text-text-muted">
              Legal
            </p>
            <ul className="mt-4 flex flex-col gap-3">
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <NavLink href={link.href} className="text-sm">
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </Grid>

        <div className="mt-12 border-t border-border pt-6">
          <Text size="sm" tone="muted">
            © {year} Oragrol Global. All rights reserved.
          </Text>
        </div>
      </Container>
    </Section>
  );
}
