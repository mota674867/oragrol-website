import type { Metadata } from "next";
import OrOneClient from "./or-one-client";
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
  const canonicalPath = isFr ? "/fr/or-one" : "/or-one";

  return {
    title: isFr
      ? "OR ONE | Un système coordonné de sécurité, d'automatisation et d'intelligence"
      : "OR ONE | One Coordinated Security, Automation & Intelligence System",
    description: isFr
      ? "OR ONE coordonne la cybersécurité, l'automatisation et l'intelligence opérationnelle au sein d'un seul système sécurisé, conçu autour de votre entreprise. Sélectionnez vos capacités et découvrez un palier de système préliminaire."
      : "OR ONE coordinates cybersecurity, automation and operational intelligence within one secure system, built around your business. Select your capabilities and see a preliminary system tier.",
    alternates: {
      canonical: canonicalPath,
      languages: languageAlternates("/or-one"),
    },
    openGraph: {
      title: isFr ? "OR ONE | ORAGROL Global" : "OR ONE | ORAGROL Global",
      description: isFr
        ? "Un système d'affaires coordonné reliant la sécurité, l'automatisation et l'intelligence opérationnelle — conçu autour de votre entreprise."
        : "One coordinated business system connecting security, automation and operational intelligence — built around your business.",
      url: canonicalPath,
      siteName: "ORAGROL Global",
      locale: isFr ? "fr_CA" : "en_CA",
      alternateLocale: isFr ? "en_CA" : "fr_CA",
      type: "website",
    },
  };
}

export default function Page() {
  return <OrOneClient />;
}
