"use client";

import { Link } from "@/i18n/navigation";
import OragrolOpportunityPage from "@/app/components/site/oragrol-opportunity-page";
import { submitOpportunity } from "@/app/lib/submit-opportunity";
import { HeaderLogo } from "@/app/components/brand/header-logo";

export default function PartnershipsClient() {
  return (
    <OragrolOpportunityPage
      page="partnerships"
      logo={
        <HeaderLogo tone="dark-bg" />
      }
      privacyUrl="/privacy-policy"
      termsUrl="/terms-of-use"
      submissionsEnabled
      onSubmit={submitOpportunity}
    />
  );
}
