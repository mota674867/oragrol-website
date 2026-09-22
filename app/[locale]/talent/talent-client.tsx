"use client";

import { Link } from "@/i18n/navigation";
import OragrolOpportunityPage from "@/app/components/site/oragrol-opportunity-page";
import { submitOpportunity } from "@/app/lib/submit-opportunity";

export default function TalentClient() {
  return (
    <OragrolOpportunityPage
      page="talent"
      logo={
        <Link className="op-wordmark" href="/" aria-label="ORAGROL Global home">
          ORAGROL<span>GLOBAL</span>
        </Link>
      }
      privacyUrl="/privacy-policy"
      termsUrl="/terms-of-use"
      submissionsEnabled
      onSubmit={submitOpportunity}
    />
  );
}
