import type { Metadata } from "next";
import ContactPageClient from "./contact-client";
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
  const canonicalPath = isFr ? "/fr/contact" : "/contact";

  return {
    title: isFr
      ? "Contact | Commencez par une conversation claire"
      : "Contact | Start a Clear Conversation",
    description: isFr
      ? "Commencez par une conversation claire sur la cybersécurité, l'automatisation d'affaires ou OR ONE. ORAGROL Global répond aux demandes admissibles dans un délai de deux jours ouvrables."
      : "Start with a clear conversation about cybersecurity, business automation or OR ONE. ORAGROL Global responds to qualified enquiries within two business days.",
    alternates: {
      canonical: canonicalPath,
      languages: languageAlternates("/contact"),
    },
    openGraph: {
      title: isFr ? "Contact | ORAGROL Global" : "Contact | ORAGROL Global",
      description: isFr
        ? "Choisissez votre conversation — cybersécurité, automatisation d'affaires, OR ONE ou une demande générale — et commencez par une réponse réfléchie, pas un argumentaire de vente automatisé."
        : "Choose your conversation — cybersecurity, business automation, OR ONE, or a general enquiry — and start with a considered response, not an automated sales pitch.",
      url: canonicalPath,
      siteName: "ORAGROL Global",
      locale: isFr ? "fr_CA" : "en_CA",
      alternateLocale: isFr ? "en_CA" : "fr_CA",
      type: "website",
    },
  };
}

export default function Page() {
  return <ContactPageClient />;
}
