import type { Metadata } from "next";
import CareersClient from "./careers-client";

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

export default function CareersPage() {
  return <CareersClient />;
}
