import Link from "next/link";
import { Container, Grid, NavLink, Section, Text } from "../ui";
import { OragrolLogo } from "../brand/oragrol-logo";
import { LinkedInIcon, InstagramIcon } from "./social-icons";

/**
 * SiteFooter — Step 4, restructured for the Footer overhaul (D-017).
 * Structure/information-architecture only borrowed from a Bell Business
 * reference page (per Mohammad's brief) — not its visual skin, which
 * stays inside this project's own locked palette/typography throughout.
 *
 * Three real nav columns grouped from existing site nav (nothing
 * invented): Company (the site's core pages), Resources (just the one
 * real page — /resources, Step 10, built D-052; deliberately not padded
 * with invented links to look fuller), Legal (unchanged from before).
 *
 * Logo: reuses OragrolLogo (the same component SiteHeader uses), not a
 * hand-typed "ORAGROL" span + bare OragrolRing — a prior version of this
 * file recreated the wordmark separately, which drifted from the header
 * (wrong case, missing the "GLOBAL" subtitle, wrong ring-to-text gap).
 * OragrolLogo is the single source of truth for the full lockup; every
 * place the logo appears should import it, never re-approximate it.
 *
 * Social icons: LinkedIn (supplied by Mohammad, 2026-08-13:
 * https://www.linkedin.com/company/oragrol-global/) and Instagram
 * (supplied 2026-08-15: https://www.instagram.com/oragrolglobal, D-046 —
 * replaces the earlier explicit "#" placeholder) both now have real
 * URLs. X/Twitter intentionally not added — "near future" only, per
 * instruction. Icons are small hand-drawn outline glyphs
 * (social-icons.tsx) since lucide-react 1.31.0 has no brand/social icon
 * exports.
 */

const COMPANY_LINKS = [
  { label: "Services", href: "/services" },
  { label: "Solutions", href: "/solutions" },
  { label: "Cyber Health", href: "/cyber-health" },
  { label: "Company", href: "/company" },
  { label: "Contact", href: "/contact" },
];

/** Just the one real page (Step 10, built — D-052) — not padded with
 * invented links to fill out the column. */
const RESOURCES_LINKS = [{ label: "Resources", href: "/resources" }];

const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "/legal/privacy" },
  { label: "Terms of Use", href: "/legal/terms" },
  { label: "Cookie Policy", href: "/legal/cookies" },
  { label: "Accessibility", href: "/legal/accessibility" },
];

function FooterNavColumn({ label, links }: { label: string; links: { label: string; href: string }[] }) {
  return (
    <nav aria-label={label}>
      <p className="font-body text-xs font-medium uppercase tracking-widest text-text-muted">{label}</p>
      <ul className="mt-4 flex flex-col gap-3">
        {links.map((link) => (
          <li key={link.href}>
            <NavLink href={link.href} className="text-sm">
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <Section environment="dark" as="footer">
      <Container size="xl" className="py-16">
        <Grid cols={{ base: 1, md: 5 }} gap="lg">
          <div className="flex flex-col gap-4 md:col-span-2">
            <Link href="/" className="inline-flex w-fit rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">
              <OragrolLogo height={36} />
            </Link>
            <Text size="sm" tone="secondary" className="max-w-sm">
              Cybersecurity clarity for modern businesses.
            </Text>
            <div className="flex items-center gap-4 pt-2">
              <a
                href="https://www.linkedin.com/company/oragrol-global/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Oragrol Global on LinkedIn"
                className="text-text-secondary transition-colors duration-150 hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent rounded-sm"
              >
                <LinkedInIcon className="h-5 w-5" />
              </a>
              <a
                href="https://www.instagram.com/oragrolglobal"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Oragrol Global on Instagram"
                className="text-text-secondary transition-colors duration-150 hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent rounded-sm"
              >
                <InstagramIcon className="h-5 w-5" />
              </a>
              <span className="font-body text-sm text-text-secondary">EN | FR</span>
            </div>
          </div>

          <FooterNavColumn label="Company" links={COMPANY_LINKS} />
          <FooterNavColumn label="Resources" links={RESOURCES_LINKS} />
          <FooterNavColumn label="Legal" links={LEGAL_LINKS} />
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
