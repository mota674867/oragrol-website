import type { Metadata } from "next";
import HomeClient from "./home-client";
import { SITE_URL } from "@/app/lib/site-config";
import { languageAlternates } from "@/app/lib/seo";

// Locale-aware metadata (was a static `export const metadata`, which meant
// the French render at /fr got English-only title/description/canonical —
// wrong for a page every visitor's browser and every search engine reads
// as the actual content). generateMetadata + `params` fixes that per-locale
// while languageAlternates() adds the hreflang pair Google needs to treat
// / and /fr as the same content in two languages, not duplicate content.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isFr = locale === "fr";
  const canonicalPath = isFr ? "/fr" : "/";

  return {
    title: isFr
      ? "Cybersécurité, automatisation et protection coordonnée pour les entreprises canadiennes"
      : "Cybersecurity, Automation & Coordinated Protection for Canadian Businesses",
    description: isFr
      ? "ORAGROL Global offre aux entreprises canadiennes une cybersécurité qui agit, une automatisation qui évolue avec elles, et un système coordonné — OR ONE — qui réunit protection et opérations."
      : "ORAGROL Global gives Canadian businesses cybersecurity that acts, automation that scales, and one coordinated system — OR ONE — that brings protection and operations together.",
    alternates: {
      canonical: canonicalPath,
      languages: languageAlternates("/"),
    },
    openGraph: {
      title: isFr
        ? "ORAGROL Global | Une cybersécurité qui agit. Une automatisation qui évolue."
        : "ORAGROL Global | Cybersecurity that acts. Automation that scales.",
      description: isFr
        ? "Cybersécurité, automatisation d'affaires intelligente et un système d'exploitation coordonné pour les entreprises canadiennes."
        : "Cybersecurity, intelligent business automation and one coordinated operating system for Canadian businesses.",
      url: canonicalPath,
      siteName: "ORAGROL Global",
      locale: isFr ? "fr_CA" : "en_CA",
      alternateLocale: isFr ? "en_CA" : "fr_CA",
      type: "website",
    },
  };
}

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
