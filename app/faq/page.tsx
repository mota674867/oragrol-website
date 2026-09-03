import type { Metadata } from "next";
import FAQPageClient from "./faq-client";

export const metadata: Metadata = {
  title: "FAQ | Clear Answers Before You Begin",
  description:
    "Answers on getting started, how you purchase, payment and contracts, how the service works, what you receive, technical support, and company and trust.",
  alternates: {
    canonical: "/faq",
  },
  openGraph: {
    title: "FAQ | ORAGROL Global",
    description:
      "Services, purchasing, support and how we work — explained without unnecessary technical language.",
    url: "/faq",
    siteName: "ORAGROL Global",
    locale: "en_CA",
    type: "website",
  },
};

export default function Page() {
  return <FAQPageClient />;
}
