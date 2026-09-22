import type { Metadata } from "next";
import PartnershipsClient from "./partnerships-client";
import { languageAlternates } from "@/app/lib/seo";

/**
 * Bilingual (Phase 2k, ORAGROL_Careers_Talent_Partnerships_FR_Translation.md):
 * converted from a static `metadata` export to `generateMetadata({params})`,
 * same fix as every prior page.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isFr = locale === "fr";
  const canonicalPath = isFr ? "/fr/partnerships" : "/partnerships";

  return {
    title: isFr ? "Partenariats | ORAGROL Global" : "Partnerships | ORAGROL Global",
    description: isFr
      ? "Explorez une collaboration d'affaires, une présence régionale ou en succursale, ou un investissement technologique avec ORAGROL Global. Demande de renseignements seulement — ne constitue ni partenariat, ni nomination de succursale, ni entente d'investissement."
      : "Explore business collaboration, regional or branch presence, or technology investment with ORAGROL Global. Enquiry only — not a partnership, branch appointment or investment agreement.",
    alternates: {
      canonical: canonicalPath,
      languages: languageAlternates("/partnerships"),
    },
    openGraph: {
      title: isFr ? "Partenariats | ORAGROL Global" : "Partnerships | ORAGROL Global",
      description: isFr
        ? "Des résultats plus solides, bâtis ensemble — explorez la collaboration, la croissance régionale ou l'investissement technologique avec ORAGROL Global."
        : "Stronger outcomes, built together — explore collaboration, regional growth or technology investment with ORAGROL Global.",
      url: canonicalPath,
      siteName: "ORAGROL Global",
      locale: isFr ? "fr_CA" : "en_CA",
      alternateLocale: isFr ? "en_CA" : "fr_CA",
      type: "website",
    },
  };
}

export default function PartnershipsPage() {
  return <PartnershipsClient />;
}
