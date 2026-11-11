import type { Metadata } from "next";
import IndustriesClient from "./industries-client";
import { languageAlternates, SHARE_IMAGE } from "@/app/lib/seo";

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
      images: [SHARE_IMAGE],
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
  // D-138: the hero photo is a CSS background, so the browser only finds it after the stylesheet.
  // These links (hoisted to <head> by React 19) start the download at once; the media queries
  // match the two CSS rules in gpt-pages.css so a phone never downloads the desktop file.
  return (
    <>
      <link
        rel="preload"
        as="image"
        href="/images/industries/hero-meeting-rings.webp"
        type="image/webp"
        media="(min-width: 701px)"
        fetchPriority="high"
      />
      <link
        rel="preload"
        as="image"
        href="/images/industries/hero-meeting-rings-mobile.webp"
        type="image/webp"
        media="(max-width: 700px)"
        fetchPriority="high"
      />
      <IndustriesClient />
    </>
  );
}
