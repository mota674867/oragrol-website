import type { Metadata } from "next";
import CyberHealthClient from "./cyber-health-client";
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
  const canonicalPath = isFr ? "/fr/cyber-health" : "/cyber-health";

  return {
    title: isFr
      ? "Évaluation Cyber Health | Connaissez votre pointage"
      : "Cyber Health Assessment | Know Your Score",
    description: isFr
      ? "Une évaluation Cyber Health gratuite de 5 à 7 minutes couvrant 42 questions de sécurité sur l'identité, le courriel, les appareils, l'infonuagique, le personnel, les données et la gouvernance — avec un pointage concret et des prochaines étapes."
      : "A free, 5-7 minute Cyber Health Assessment covering 42 security questions across identity, email, devices, cloud, people, data and governance — with a practical score and next steps.",
    alternates: {
      canonical: canonicalPath,
      languages: languageAlternates("/cyber-health"),
    },
    openGraph: {
      title: isFr
        ? "Évaluation Cyber Health | ORAGROL Global"
        : "Cyber Health Assessment | ORAGROL Global",
      description: isFr
        ? "Sachez où vous en êtes et quoi faire ensuite — une base Cyber Health concrète de 42 questions pour les entreprises canadiennes."
        : "Know where you stand and what to do next — a practical, 42-question Cyber Health baseline for Canadian businesses.",
      url: canonicalPath,
      siteName: "ORAGROL Global",
      locale: isFr ? "fr_CA" : "en_CA",
      alternateLocale: isFr ? "en_CA" : "fr_CA",
      type: "website",
    },
  };
}

export default function Page() {
  return <CyberHealthClient />;
}
