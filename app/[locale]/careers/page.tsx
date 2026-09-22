import type { Metadata } from "next";
import CareersClient from "./careers-client";
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
  const canonicalPath = isFr ? "/fr/careers" : "/careers";

  return {
    title: isFr ? "Carrières | ORAGROL Global" : "Careers | ORAGROL Global",
    description: isFr
      ? "Joignez-vous à ORAGROL Global par un emploi ou un travail rémunéré à la pièce — postes en ventes et croissance, et spécialistes certifiés (tests d'intrusion, audit SOC 2, QSA PCI-DSS, criminalistique numérique)."
      : "Join ORAGROL Global through employment or paid project-based specialist work — Sales & Growth roles, and certified specialists (penetration testing, SOC 2 audit, PCI-DSS QSA, digital forensics).",
    alternates: {
      canonical: canonicalPath,
      languages: languageAlternates("/careers"),
    },
    openGraph: {
      title: isFr ? "Carrières | ORAGROL Global" : "Careers | ORAGROL Global",
      description: isFr
        ? "Bâtissez ce qui vient ensuite avec ORAGROL Global — emploi et travail de spécialiste rémunéré à la pièce en cybersécurité et automatisation d'entreprise."
        : "Build what comes next with ORAGROL Global — employment and paid specialist project work in cybersecurity and business automation.",
      url: canonicalPath,
      siteName: "ORAGROL Global",
      locale: isFr ? "fr_CA" : "en_CA",
      alternateLocale: isFr ? "en_CA" : "fr_CA",
      type: "website",
    },
  };
}

export default function CareersPage() {
  return <CareersClient />;
}
