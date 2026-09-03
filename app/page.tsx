import type { Metadata } from "next";
import HomeClient from "./home-client";
import { SITE_URL } from "./lib/site-config";

export const metadata: Metadata = {
  title: "Cybersecurity, Automation & Coordinated Protection for Canadian Businesses",
  description:
    "ORAGROL Global gives Canadian businesses cybersecurity that acts, automation that scales, and one coordinated system — OR ONE — that brings protection and operations together.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "ORAGROL Global | Cybersecurity that acts. Automation that scales.",
    description:
      "Cybersecurity, intelligent business automation and one coordinated operating system for Canadian businesses.",
    url: "/",
    siteName: "ORAGROL Global",
    locale: "en_CA",
    type: "website",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "ORAGROL Global",
  url: SITE_URL,
  // No `logo` field yet — no logo asset exists at public/ to point to,
  // and a broken image URL in structured data is worse than omitting the
  // field. Add it back once a real logo file is in place.
  description:
    "ORAGROL Global provides cybersecurity services, intelligent business automation and coordinated security operations (OR ONE) for Canadian small and medium-sized businesses.",
  areaServed: {
    "@type": "AdministrativeArea",
    name: "Ontario, Canada",
  },
  address: [
    {
      "@type": "PostalAddress",
      addressLocality: "Thunder Bay",
      addressRegion: "ON",
      addressCountry: "CA",
    },
    {
      "@type": "PostalAddress",
      addressLocality: "Toronto",
      addressRegion: "ON",
      addressCountry: "CA",
    },
  ],
  sameAs: [
    "https://www.linkedin.com/company/oragrol-global/",
    "https://www.instagram.com/oragrolglobal",
  ],
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <HomeClient />
    </>
  );
}
