import type { Metadata } from "next";
import BusinessAutomationClient from "./ba-client";
import { languageAlternates } from "@/app/lib/seo";

/**
 * Bilingual (D-086, Task #21): converted from a static `metadata`
 * export to `generateMetadata({params})`, same fix as Homepage and
 * Services — a static export meant /fr/business-automation would have
 * gotten English-only title/description/canonical.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isFr = locale === "fr";
  const canonicalPath = isFr ? "/fr/business-automation" : "/business-automation";

  return {
    title: isFr
      ? "Business Automation | Cinq systèmes d'automatisation définis par résultat"
      : "Business Automation | Five Defined Outcome-Built Automation Systems",
    description: isFr
      ? "Cinq systèmes d'automatisation définis par résultat — ventes, service à la clientèle, finances, TI et marketing — connectés aux outils que votre entreprise utilise déjà."
      : "Five outcome-built automation systems — lead-to-close, customer support, operational intelligence, outsourced IT operations, and customer growth — connected to the tools your business already uses.",
    alternates: {
      canonical: canonicalPath,
      languages: languageAlternates("/business-automation"),
    },
    openGraph: {
      title: isFr
        ? "Business Automation | ORAGROL Global"
        : "Business Automation | ORAGROL Global",
      description: isFr
        ? "Cinq systèmes d'automatisation définis par résultat, connectés aux outils que votre entreprise utilise déjà. Aucune nouvelle plateforme requise."
        : "Five outcome-built automation systems, connected to the tools your business already uses. No new platform required.",
      url: canonicalPath,
      siteName: "ORAGROL Global",
      locale: isFr ? "fr_CA" : "en_CA",
      alternateLocale: isFr ? "en_CA" : "fr_CA",
      type: "website",
    },
  };
}

export default function Page() {
  return <BusinessAutomationClient />;
}
