import type { Metadata } from "next";
import PartnershipsClient from "./partnerships-client";

export const metadata: Metadata = {
  title: "Partnerships | ORAGROL Global",
  description:
    "Explore business collaboration, regional or branch presence, or technology investment with ORAGROL Global. Enquiry only — not a partnership, branch appointment or investment agreement.",
  alternates: {
    canonical: "/partnerships",
  },
  openGraph: {
    title: "Partnerships | ORAGROL Global",
    description:
      "Stronger outcomes, built together — explore collaboration, regional growth or technology investment with ORAGROL Global.",
    url: "/partnerships",
    siteName: "ORAGROL Global",
    locale: "en_CA",
    type: "website",
  },
};

export default function PartnershipsPage() {
  return <PartnershipsClient />;
}
