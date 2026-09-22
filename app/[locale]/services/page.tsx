import type { Metadata } from "next";
import ServicesClient from "./services-client";
import { SITE_URL } from "@/app/lib/site-config";
import { languageAlternates } from "@/app/lib/seo";
import {
  SERVICE_PACKAGES,
  INDIVIDUAL_SERVICES,
  SPECIALIST_ENGAGEMENTS,
} from "./services-catalog";

/**
 * Server shell for /services (2026-09-08 rebuild). Previously this route's
 * page.tsx was itself a "use client" component with no `metadata` export at
 * all, so /services inherited the site-wide default title/description from
 * app/layout.tsx instead of its own — a real SEO gap. Split into a plain
 * server component (this file, real metadata + JSON-LD) rendering the
 * interactive body (services-client.tsx), matching the pattern already used
 * by app/page.tsx, app/contact/page.tsx and app/business-automation/page.tsx.
 *
 * Bilingual (D-086, Task #21): converted from a static `metadata` export to
 * `generateMetadata({params})`, same fix as the Homepage — a static export
 * meant /fr/services got English-only title/description/canonical, which is
 * wrong for a page every visitor's browser and every search engine reads as
 * the actual content.
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isFr = locale === "fr";
  const canonicalPath = isFr ? "/fr/services" : "/services";

  return {
    title: isFr ? "Services de cybersécurité" : "Cybersecurity Services",
    description: isFr
      ? "Découvrez quatre forfaits de cybersécurité, douze services individuels et des mandats spécialisés adaptés à votre entreprise."
      : "Explore four cybersecurity packages, twelve individual services and specialist engagements tailored to your business.",
    alternates: {
      canonical: canonicalPath,
      languages: languageAlternates("/services"),
    },
    openGraph: {
      title: isFr
        ? "Services de cybersécurité | ORAGROL Global"
        : "Cybersecurity Services | ORAGROL Global",
      description: isFr
        ? "Quatre forfaits définis, douze services individuels et des mandats spécialisés — une cybersécurité conçue autour du fonctionnement de votre entreprise."
        : "Four defined packages, twelve individual services and specialist engagements — cybersecurity built around how your business operates.",
      url: canonicalPath,
      siteName: "ORAGROL Global",
      locale: isFr ? "fr_CA" : "en_CA",
      alternateLocale: isFr ? "en_CA" : "fr_CA",
      type: "website",
    },
  };
}

function billingCategory(billing: "monthly" | "one-time" | "per-application") {
  if (billing === "monthly") return "Monthly subscription";
  if (billing === "per-application") return "One-time, per application";
  return "One-time";
}

// Specialist engagement prices are "from" starting fees (updated
// 2026-09-08) — open-ended, not ranges, since final scope/fees are agreed
// in a proposal. Represented as a PriceSpecification with only minPrice
// set, which is the correct schema.org shape for a starting-from price.
function fromPrice(minPrice: number) {
  return {
    "@type": "PriceSpecification",
    priceCurrency: "CAD",
    minPrice,
  };
}

const servicesJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Managed Cybersecurity Services",
  name: "ORAGROL Cybersecurity Services",
  description:
    "Cybersecurity delivered as fixed packages, individual services or specialist engagements for Canadian businesses.",
  provider: {
    "@type": "Organization",
    name: "ORAGROL Global",
    url: SITE_URL,
  },
  areaServed: {
    "@type": "AdministrativeArea",
    name: "Ontario, Canada",
  },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "ORAGROL Cybersecurity Packages, Services & Specialist Engagements",
    itemListElement: [
      ...SERVICE_PACKAGES.map((p) => ({
        "@type": "Offer",
        name: `${p.name} Package`,
        description: p.value,
        price: p.price,
        priceCurrency: "CAD",
        category: "Cybersecurity Package · 12-month contract",
      })),
      ...INDIVIDUAL_SERVICES.map((s) => ({
        "@type": "Offer",
        name: s.name,
        description: s.line,
        price: s.price,
        priceCurrency: "CAD",
        category: billingCategory(s.billing),
      })),
      ...SPECIALIST_ENGAGEMENTS.flatMap((s) =>
        s.prices.map((p) => ({
          "@type": "Offer",
          name: `${s.name} — ${p.label}`,
          description: s.line,
          category: "Specialist Engagement",
          priceSpecification: fromPrice(p.minPrice),
        })),
      ),
    ],
  },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesJsonLd) }}
      />
      <ServicesClient />
    </>
  );
}
