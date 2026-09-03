import type { Metadata } from "next";
import BusinessAutomationClient from "./ba-client";

export const metadata: Metadata = {
  title: "Business Automation | Five Defined Outcome-Built Automation Systems",
  description:
    "Five outcome-built automation systems — lead-to-close, customer support, operational intelligence, outsourced IT operations, and customer growth — connected to the tools your business already uses.",
  alternates: {
    canonical: "/business-automation",
  },
  openGraph: {
    title: "Business Automation | ORAGROL Global",
    description:
      "Five outcome-built automation systems, connected to the tools your business already uses. No new platform required.",
    url: "/business-automation",
    siteName: "ORAGROL Global",
    locale: "en_CA",
    type: "website",
  },
};

export default function Page() {
  return <BusinessAutomationClient />;
}
