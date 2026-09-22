import type { Metadata } from "next";
import CompanyPageClient from "./company-client";
import { languageAlternates } from "@/app/lib/seo";

/**
 * Bilingual (D-086, Task #21): converted from a static `metadata`
 * export to `generateMetadata({params})`, same fix as every prior
 * page.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isFr = locale === "fr";
  const canonicalPath = isFr ? "/fr/company" : "/company";

  return {
    title: isFr
      ? "Entreprise | Orchestrated AI Governance, Risk, Operations and Learning"
      : "Company | Orchestrated AI Governance, Risk, Operations and Learning",
    description: isFr
      ? "ORAGROL Global relie la cybersécurité, l'automatisation intelligente et la réflexion opérationnelle à la façon dont une entreprise fonctionne réellement. Dirigé par le fondateur, fondé sur une expérience opérationnelle réelle, basé à Thunder Bay, en Ontario."
      : "ORAGROL Global connects cybersecurity, intelligent automation and operational thinking around how a business actually works. Founder-led, built from real operating experience, headquartered in Thunder Bay, Ontario.",
    alternates: {
      canonical: canonicalPath,
      languages: languageAlternates("/company"),
    },
    openGraph: {
      title: isFr ? "Entreprise | ORAGROL Global" : "Company | ORAGROL Global",
      description: isFr
        ? "Conçu pour relier ce que les entreprises ne peuvent plus gérer séparément — cybersécurité, automatisation et réflexion opérationnelle, dirigé par le fondateur depuis l'Ontario, Canada."
        : "Built to connect what business can no longer manage separately — cybersecurity, automation and operational thinking, founder-led from Ontario, Canada.",
      url: canonicalPath,
      siteName: "ORAGROL Global",
      locale: isFr ? "fr_CA" : "en_CA",
      alternateLocale: isFr ? "en_CA" : "fr_CA",
      type: "website",
    },
  };
}

export default function Page() {
  return <CompanyPageClient />;
}
