import type { Metadata } from "next";
import OrOneClient from "./or-one-client";

export const metadata: Metadata = {
  title: "OR ONE | One Coordinated Security, Automation & Intelligence System",
  description:
    "OR ONE coordinates cybersecurity, automation and operational intelligence within one secure system, built around your business. Select your capabilities and see a preliminary system tier.",
  alternates: {
    canonical: "/or-one",
  },
  openGraph: {
    title: "OR ONE | ORAGROL Global",
    description:
      "One coordinated business system connecting security, automation and operational intelligence — built around your business.",
    url: "/or-one",
    siteName: "ORAGROL Global",
    locale: "en_CA",
    type: "website",
  },
};

export default function Page() {
  return <OrOneClient />;
}
