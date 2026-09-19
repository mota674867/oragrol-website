"use client";

import Link from "next/link";
import OragrolOpportunityPage from "../components/site/oragrol-opportunity-page";
import { submitOpportunity } from "../lib/submit-opportunity";

// Real vacancies only — see ORAGROL_Opportunity_Pages_Guide.md: with no
// confirmed openings, the component shows an honest empty state rather
// than a misleading role application form. Update this list the moment a
// real role opens; never add a placeholder entry.
const VACANCIES: never[] = [];

export default function CareersClient() {
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
      submissionsEnabled
      onSubmit={submitOpportunity}
    />
  );
}
