import type { Metadata } from "next";
import ResourcesPageClient from "./resources-client";

export const metadata: Metadata = {
  title: "Resources | Cybersecurity & Automation Intelligence for Canadian Businesses",
  description:
    "Practical cybersecurity and business automation guidance for Canadian business leaders — articles, guides, checklists and executive briefs built for action.",
  alternates: {
    canonical: "/resources",
  },
  openGraph: {
    title: "Resources | ORAGROL Global",
    description:
      "Practical cybersecurity intelligence for Canadian business leaders — clear, credible and built for action.",
    url: "/resources",
    siteName: "ORAGROL Global",
    locale: "en_CA",
    type: "website",
  },
};

export default function Page() {
  return <ResourcesPageClient />;
}
