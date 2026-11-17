import type { Metadata } from "next";
import HomeClient from "./home-client";
import HomeCybersecurity from "./home-section-04";
import { SITE_URL } from "@/app/lib/site-config";
import { languageAlternates, SHARE_IMAGE } from "@/app/lib/seo";

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
    // SEO pass (2026-11-17): the old title was 78 characters (Google cuts titles
    // near 60) and neither title nor description named where Oragrol works.
    // NEEDS VERIFICATION by Mohammad: wording of the visible title/description.
    title: isFr
      ? "Cybersécurité et automatisation en Ontario | ORAGROL"
      : "Cybersecurity & Automation for Ontario Businesses | ORAGROL",
    description: isFr
      ? "ORAGROL Global : une cybersécurité qui agit, une automatisation qui évolue et OR ONE, un système unique pour les entreprises de l'Ontario et du Canada."
      : "ORAGROL Global gives Ontario and Canadian businesses cybersecurity that acts, automation that scales, and OR ONE, one system for protection and operations.",
    alternates: {
      canonical: canonicalPath,
      languages: languageAlternates("/"),
    },
    openGraph: {
      images: [SHARE_IMAGE],
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

// SEO pass (2026-11-17): the single basic Organization record became a small
// graph: the business itself (also typed ProfessionalService so search and AI
// tools read it as a service business) plus the WebSite. Every value below was
// already stated on the live site (homepage description, Ontario coverage,
// Toronto / Thunder Bay addresses, LinkedIn / Instagram). No prices, ratings,
// phone numbers or claims were added.
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["Organization", "ProfessionalService"],
      "@id": `${SITE_URL}/#organization`,
      name: "ORAGROL Global",
      url: SITE_URL,
      // No `logo` field yet — no logo asset exists at public/ to point to,
      // and a broken image URL in structured data is worse than omitting the
      // field. Add it back once a real logo file is in place.
      description:
        "ORAGROL Global provides cybersecurity services, intelligent business automation and coordinated security operations (OR ONE) for Canadian small and medium-sized businesses.",
      serviceType: [
        "Cybersecurity services",
        "Business automation",
        "Coordinated security operations (OR ONE)",
      ],
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
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "ORAGROL Global",
      inLanguage: ["en-CA", "fr-CA"],
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
  ],
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <HomeClient cybersecuritySection={<HomeCybersecurity />} />
    </>
  );
}
