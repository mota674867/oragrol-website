import type { Metadata } from "next";
import FAQPageClient from "./faq-client";
import { languageAlternates, SHARE_IMAGE } from "@/app/lib/seo";
import { getTranslations } from "next-intl/server";

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
  const canonicalPath = isFr ? "/fr/faq" : "/faq";

  return {
    title: isFr
      ? "FAQ | Des réponses claires avant de commencer"
      : "FAQ | Clear Answers Before You Begin",
    description: isFr
      ? "Réponses sur la mise en route, l'achat, le paiement et les contrats, le fonctionnement du service, ce que vous recevez, le soutien technique, ainsi que l'entreprise et la confiance."
      : "Answers on getting started, how you purchase, payment and contracts, how the service works, what you receive, technical support, and company and trust.",
    alternates: {
      canonical: canonicalPath,
      languages: languageAlternates("/faq"),
    },
    openGraph: {
      images: [SHARE_IMAGE],
      title: isFr ? "FAQ | ORAGROL Global" : "FAQ | ORAGROL Global",
      description: isFr
        ? "Services, achat, soutien et notre façon de travailler — expliqués sans jargon technique inutile."
        : "Services, purchasing, support and how we work — explained without unnecessary technical language.",
      url: canonicalPath,
      siteName: "ORAGROL Global",
      locale: isFr ? "fr_CA" : "en_CA",
      alternateLocale: isFr ? "en_CA" : "fr_CA",
      type: "website",
    },
  };
}

// SEO pass (2026-11-17): FAQPage structured data built from the very same
// questions and answers the page displays (messages Faq.groups), so the
// markup can never say something the page does not.
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Faq" });
  const groups = t.raw("groups") as { items: { q: string; a: string }[] }[];
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: locale === "fr" ? "fr-CA" : "en-CA",
    mainEntity: groups.flatMap((group) =>
      group.items.map(({ q, a }) => ({
        "@type": "Question",
        name: q,
        acceptedAnswer: { "@type": "Answer", text: a },
      })),
    ),
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <FAQPageClient />
    </>
  );
}
