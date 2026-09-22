import type { Metadata } from "next";
import ResourcesPageClient from "./resources-client";
import { languageAlternates } from "@/app/lib/seo";

/**
 * Bilingual (D-086, Task #21, Phase 2i): converted from a static
 * `metadata` export to `generateMetadata({params})`, same fix as every
 * prior page.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isFr = locale === "fr";
  const canonicalPath = isFr ? "/fr/resources" : "/resources";

  return {
    title: isFr
      ? "Ressources | Intelligence en cybersécurité et automatisation pour les entreprises canadiennes"
      : "Resources | Cybersecurity & Automation Intelligence for Canadian Businesses",
    description: isFr
      ? "Des conseils pratiques en cybersécurité et en automatisation d'entreprise pour les dirigeants canadiens — articles, guides, listes de vérification et notes de synthèse conçus pour passer à l'action."
      : "Practical cybersecurity and business automation guidance for Canadian business leaders — articles, guides, checklists and executive briefs built for action.",
    alternates: {
      canonical: canonicalPath,
      languages: languageAlternates("/resources"),
    },
    openGraph: {
      title: isFr ? "Ressources | ORAGROL Global" : "Resources | ORAGROL Global",
      description: isFr
        ? "Une intelligence pratique en cybersécurité pour les dirigeants d'entreprises canadiennes — claire, crédible et conçue pour passer à l'action."
        : "Practical cybersecurity intelligence for Canadian business leaders — clear, credible and built for action.",
      url: canonicalPath,
      siteName: "ORAGROL Global",
      locale: isFr ? "fr_CA" : "en_CA",
      alternateLocale: isFr ? "en_CA" : "fr_CA",
      type: "website",
    },
  };
}

export default function Page() {
  return <ResourcesPageClient />;
}
