import type { Metadata } from "next";
import IndustriesClient from "./industries-client";

export const metadata: Metadata = {
  title: "Industries | Cybersecurity, Automation & OR ONE by Sector",
  description:
    "Industry-specific cybersecurity priorities, automation opportunities and OR ONE coordination for professional services, healthcare, financial services, retail & e-commerce, and manufacturing.",
  alternates: {
    canonical: "/industries",
  },
  openGraph: {
    title: "Industries | ORAGROL Global",
    description:
      "How ORAGROL Global's cybersecurity, automation and OR ONE services apply to your industry's real risks and priorities.",
    url: "/industries",
    siteName: "ORAGROL Global",
    locale: "en_CA",
    type: "website",
  },
};

export default function Page() {
  return <IndustriesClient />;
}
