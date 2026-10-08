"use client";

import { Link } from "@/i18n/navigation";
import OragrolOpportunityPage from "@/app/components/site/oragrol-opportunity-page";
import { submitOpportunity } from "@/app/lib/submit-opportunity";
import { HeaderLogo } from "@/app/components/brand/header-logo";

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
        <HeaderLogo tone="dark-bg" />
      }
      privacyUrl="/privacy-policy"
      termsUrl="/terms-of-use"
      vacancies={VACANCIES}
      submissionsEnabled
      onSubmit={submitOpportunity}
    />
  );
}
