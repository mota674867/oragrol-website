"use client";

import Link from "next/link";
import OragrolOpportunityPage from "../components/site/oragrol-opportunity-page";
import { submitOpportunity } from "../lib/submit-opportunity";

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
