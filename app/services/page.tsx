import type { Metadata } from "next";
import { ServicesHero } from "../components/sections/services/hero";
import { ServicesOverview } from "../components/sections/services/overview";
import { LiveServices } from "../components/sections/services/live-services";
import { SolutionsBridge } from "../components/sections/services/solutions-bridge";
import { FinalCta } from "../components/sections/home/final-cta";

export const metadata: Metadata = {
  title: "Services | Oragrol Global",
  description:
    "Fifteen categories, sixty-four services — cybersecurity and business automation, one coordinated approach.",
};

/**
 * Services — Services Landing Page brief (2 levels):
 * Level 1 (landing/introduction, editorial composition): Hero → Overview
 * — two large rounded panels, mirrored asymmetry, same approved copy this
 * page already had, just recomposed (see `hero.tsx`/`overview.tsx`).
 * Level 2 (existing architecture, untouched): `LiveServices` (Tier 1, 10
 * categories) → Services/Solutions bridge → Final CTA (reused from Home)
 * → Footer (global, layout.tsx). `AdditionalCapabilities` (the old "5-8
 * finalizing capabilities" section, D-007) is no longer part of this
 * page's render tree — the new data has no live/finalizing distinction
 * to preserve. Left on disk unreferenced, not deleted, per this project's
 * convention for superseded components. Individual per-service detail
 * pages exist at `/services/[code]`.
 */
export default function ServicesPage() {
  return (
    <>
      <ServicesHero />
      <ServicesOverview />
      <LiveServices />
      <SolutionsBridge />
      <FinalCta />
    </>
  );
}
