import type { Metadata } from "next";
import TalentClient from "./talent-client";
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
  const canonicalPath = isFr ? "/fr/talent" : "/talent";

  return {
    title: isFr ? "Talent | ORAGROL Global" : "Talent | ORAGROL Global",
    description: isFr
      ? "Présentez votre expertise ou proposez une idée à ORAGROL Global — collaboration exploratoire en IA, agents intelligents, automatisation, ventes, marketing et autres disciplines pertinentes."
      : "Introduce your expertise or propose an idea to ORAGROL Global — exploratory collaboration in AI, intelligent agents, automation, sales, marketing and other relevant disciplines.",
    alternates: {
      canonical: canonicalPath,
      languages: languageAlternates("/talent"),
    },
    openGraph: {
      title: isFr ? "Talent | ORAGROL Global" : "Talent | ORAGROL Global",
      description: isFr
        ? "Apportez votre expertise. Partagez ce qui vient ensuite — collaboration exploratoire avec ORAGROL Global, sans poste ou rôle de projet défini requis."
        : "Bring your expertise. Share what comes next — exploratory collaboration with ORAGROL Global, no defined job or project role required.",
      url: canonicalPath,
      siteName: "ORAGROL Global",
      locale: isFr ? "fr_CA" : "en_CA",
      alternateLocale: isFr ? "en_CA" : "fr_CA",
      type: "website",
    },
  };
}

export default function TalentPage() {
  return <TalentClient />;
}
