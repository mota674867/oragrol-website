import type { Metadata } from "next";
import { SolutionsHero } from "../components/sections/solutions/hero";
import { TierCards } from "../components/sections/solutions/tier-cards";
import { AddonMenu } from "../components/sections/solutions/addon-menu";
import { PentestAddon } from "../components/sections/solutions/pentest-addon";
import { FinalCta } from "../components/sections/home/final-cta";

export const metadata: Metadata = {
  title: "Solutions | Oragrol Global",
  description:
    "Essential, Growth, and Enterprise — packaged security solutions matched to where your business is today, plus specialist add-ons.",
};

/**
 * Solutions — 2026-08-20, real content (see DECISIONS.md — supersedes
 * D-003's "pricing unconfirmed, keep generic" placeholder for this page).
 * Flow: Hero (StrataVisual, D-008's "ascending stacked planes" motif) ->
 * TierCards (Essential/Growth/Enterprise, real pricing + included
 * services) -> AddonMenu (12 real specialist add-ons, new section) ->
 * PentestAddon (real pricing, position/styling unchanged — its own
 * separate project-based engagement, not a 4th tier) + pricing
 * confidence note -> Final CTA (reused from Home) -> Footer (global,
 * layout.tsx).
 */
export default function SolutionsPage() {
  return (
    <>
      <SolutionsHero />
      <TierCards />
      <AddonMenu />
      <PentestAddon />
      <FinalCta />
    </>
  );
}
