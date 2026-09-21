import type { Metadata } from "next";
import CyberHealthClient from "./cyber-health-client";

export const metadata: Metadata = {
  title: "Cyber Health Assessment | Know Your Score",
  description:
    "A free, 5-7 minute Cyber Health Assessment covering 42 security questions across identity, email, devices, cloud, people, data and governance — with a practical score and next steps.",
  alternates: {
    canonical: "/cyber-health",
  },
  openGraph: {
    title: "Cyber Health Assessment | ORAGROL Global",
    description:
      "Know where you stand and what to do next — a practical, 42-question Cyber Health baseline for Canadian businesses.",
    url: "/cyber-health",
    siteName: "ORAGROL Global",
    locale: "en_CA",
    type: "website",
  },
};

export default function Page() {
  return <CyberHealthClient />;
}
