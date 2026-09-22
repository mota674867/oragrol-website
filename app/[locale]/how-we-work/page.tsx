import type { Metadata } from "next";
import { HowWeWorkHero } from "@/app/components/sections/how-we-work/hero";
import { StageSequence } from "@/app/components/sections/how-we-work/stage-sequence";
import { HowWeWorkClosingCta } from "@/app/components/sections/how-we-work/closing-cta";
import { languageAlternates } from "@/app/lib/seo";

// Full page copy supplied and built — no longer a visual-only prototype
// (see DECISIONS.md D-035 for the hero-visual round, D-036 for this one)
// — noindex removed, matching every other built page (Home/Services/
// Solutions/Cyber Health carry no robots restriction).
//
// Bilingual (Phase 2j, ORAGROL_HowWeWork_FR_Translation.md): converted
// from a static `metadata` export to `generateMetadata({params})`, same
// fix as every prior page. This is an orphan page (real and reachable,
// not linked in the footer nav -- see PROJECT_MEMORY) that still rides
// the OLD SiteHeader/SiteFooter/EmergencyCta chrome (not part of the GPT
// redesign's REDESIGNED_ROUTES set) -- that chrome was given a working
// locale switch in this same phase (see site-header.tsx/site-footer.tsx/
// emergency-cta.tsx) rather than rebuilding this page's own header.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isFr = locale === "fr";
  const canonicalPath = isFr ? "/fr/how-we-work" : "/how-we-work";

  return {
    title: isFr ? "Comment nous travaillons | Oragrol Global" : "How We Work | Oragrol Global",
    description: isFr
      ? "Le travail de sécurité échoue lorsqu'il demeure vague. Voici exactement comment nous travaillons avec vous, étape par étape, dès la première conversation."
      : "Security work fails when it stays vague. Here is exactly how we work with you, stage by stage, from the first conversation onward.",
    alternates: {
      canonical: canonicalPath,
      languages: languageAlternates("/how-we-work"),
    },
    openGraph: {
      title: isFr ? "Comment nous travaillons | ORAGROL Global" : "How We Work | ORAGROL Global",
      description: isFr
        ? "Une méthode claire, pas une boîte noire."
        : "A clear method, not a black box.",
      url: canonicalPath,
      siteName: "ORAGROL Global",
      locale: isFr ? "fr_CA" : "en_CA",
      alternateLocale: isFr ? "en_CA" : "fr_CA",
      type: "website",
    },
  };
}

/**
 * How We Work — Step 8. All copy LOCKED verbatim, supplied by Mohammad
 * — see each section component's own comment for exact sourcing. Flow:
 * Hero (headline/subhead + the connected-loop visual, D-035) -> Stage
 * Sequence (Understand/Prioritize/Protect/Improve, full paragraph copy
 * each) -> Closing CTA (single "Talk to Oragrol" button).
 */
export default function HowWeWorkPage() {
  return (
    <>
      <HowWeWorkHero />
      <StageSequence />
      <HowWeWorkClosingCta />
    </>
  );
}
