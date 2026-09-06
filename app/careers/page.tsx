import type { Metadata } from "next";
import Link from "next/link";
import OragrolOpportunityPage from "../components/site/oragrol-opportunity-page";

export const metadata: Metadata = {
  title: "Careers | ORAGROL Global",
  description:
    "Join ORAGROL Global through employment or paid project-based specialist work — Sales & Growth roles, and certified specialists (penetration testing, SOC 2 audit, PCI-DSS QSA, digital forensics).",
  alternates: {
    canonical: "/careers",
  },
  openGraph: {
    title: "Careers | ORAGROL Global",
    description:
      "Build what comes next with ORAGROL Global — employment and paid specialist project work in cybersecurity and business automation.",
    url: "/careers",
    siteName: "ORAGROL Global",
    locale: "en_CA",
    type: "website",
  },
};

// Real vacancies only — see ORAGROL_Opportunity_Pages_Guide.md: with no
// confirmed openings, the component shows an honest empty state rather
// than a misleading role application form. Update this list the moment a
// real role opens; never add a placeholder entry.
const VACANCIES: never[] = [];

export default function CareersPage() {
  return (
    <OragrolOpportunityPage
      page="careers"
      logo={
        <Link className="op-wordmark" href="/" aria-label="ORAGROL Global home">
          ORAGROL<span>GLOBAL</span>
        </Link>
      }
      privacyUrl="/privacy-policy"
      termsUrl="/terms-of-use"
      vacancies={VACANCIES}
    />
  );
}
