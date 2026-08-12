import type { Metadata } from "next";
import { SolutionsHero } from "../components/sections/solutions/hero";
import { TierCards } from "../components/sections/solutions/tier-cards";
import { PentestAddon } from "../components/sections/solutions/pentest-addon";
import { FinalCta } from "../components/sections/home/final-cta";

export const metadata: Metadata = {
  title: "Solutions | Oragrol Global",
  description:
    "Three levels of protection, one clear path forward — packaged security solutions matched to where your business is today.",
};

/**
 * Solutions — Website Implementation Brief, Step 6.
 * Flow: Hero (with StrataVisual, D-008's "ascending stacked planes" motif)
 * -> TierCards (3 levels) -> PentestAddon + status disclaimer -> Final CTA
 * (reused from Home) -> Footer (global, layout.tsx).
 *
 * No branded tier names, no pricing — PROJECT_MASTER.md Step 6 keeps
 * these explicitly unconfirmed; only the already-approved generic
 * "Level 01/02/03" labels and "currently being finalized" status
 * language are used, same as the Home teaser this replaces as the
 * canonical Solutions destination.
 */
export default function SolutionsPage() {
  return (
    <>
      <SolutionsHero />
      <TierCards />
      <PentestAddon />
      <FinalCta />
    </>
  );
}
