import type { Metadata } from "next";
import ServicesClient from "./services-client";
import { SITE_URL } from "../lib/site-config";
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
 */

export const metadata: Metadata = {
  // Root layout applies the "%s | ORAGROL Global" template to this, so the
  // rendered <title> comes out as "Cybersecurity Services | ORAGROL Global"
  // — don't append the suffix here too, or it doubles (confirmed via a live
  // dev-server check before this fix).
  title: "Cybersecurity Services",
  description:
    "Explore four cybersecurity packages, twelve individual services and specialist engagements tailored to your business.",
  alternates: {
    canonical: "/services",
  },
  openGraph: {
    title: "Cybersecurity Services | ORAGROL Global",
    description:
      "Four defined packages, twelve individual services and specialist engagements — cybersecurity built around how your business operates.",
    url: "/services",
    siteName: "ORAGROL Global",
    locale: "en_CA",
    type: "website",
  },
};

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
