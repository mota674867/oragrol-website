import type { Metadata } from "next";
import IndustriesClient from "./industries-client";
import { languageAlternates } from "@/app/lib/seo";

/**
 * Bilingual (D-086, Task #21): converted from a static `metadata` export
 * to `generateMetadata({params})`, same fix as every prior page.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isFr = locale === "fr";
  const canonicalPath = isFr ? "/fr/industries" : "/industries";

  return {
    title: isFr
      ? "Secteurs d'activité | Cybersécurité, automatisation et OR ONE par secteur"
      : "Industries | Cybersecurity, Automation & OR ONE by Sector",
    description: isFr
      ? "Priorités de cybersécurité, occasions d'automatisation et coordination OR ONE propres aux services professionnels, à la santé, aux services financiers, au commerce de détail et à la fabrication."
      : "Industry-specific cybersecurity priorities, automation opportunities and OR ONE coordination for professional services, healthcare, financial services, retail & e-commerce, and manufacturing.",
    alternates: {
      canonical: canonicalPath,
      languages: languageAlternates("/industries"),
    },
    openGraph: {
      title: isFr ? "Secteurs d'activité | ORAGROL Global" : "Industries | ORAGROL Global",
      description: isFr
        ? "Comment la cybersécurité, l'automatisation et OR ONE d'ORAGROL Global s'appliquent aux risques et priorités réels de votre secteur."
        : "How ORAGROL Global's cybersecurity, automation and OR ONE services apply to your industry's real risks and priorities.",
      url: canonicalPath,
      siteName: "ORAGROL Global",
      locale: isFr ? "fr_CA" : "en_CA",
      alternateLocale: isFr ? "en_CA" : "fr_CA",
      type: "website",
    },
  };
}

export default function Page() {
  return <IndustriesClient />;
}
