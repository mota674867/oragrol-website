import type { Metadata } from "next";
import { ServicesHero } from "../components/sections/services/hero";
import { LiveServices } from "../components/sections/services/live-services";
import { SolutionsBridge } from "../components/sections/services/solutions-bridge";
import { FinalCta } from "../components/sections/home/final-cta";

export const metadata: Metadata = {
  title: "Services | Oragrol Global",
  description:
    "Fifteen categories, sixty-four services — cybersecurity and business automation, one coordinated approach.",
};

/**
 * Services — 2026-08-20 full restructure (see DECISIONS.md, this date).
 * Flow: Hero → Services (Tier 1, 10 categories) + Business Automation
 * (Tier 2, 5 categories) — both now rendered by `LiveServices` — →
 * Services/Solutions bridge → Final CTA (reused from Home) → Footer
 * (global, layout.tsx). `AdditionalCapabilities` (the old "5-8 finalizing
 * capabilities" section, D-007) is no longer part of this page's render
 * tree — the new data has no live/finalizing distinction to preserve.
 * Left on disk unreferenced, not deleted, per this project's convention
 * for superseded components. Individual per-service detail pages now
 * exist (`/services/[code]`), superseding D-007's "out of scope for this
 * pass" note.
 */
export default function ServicesPage() {
  return (
    <>
      <ServicesHero />
      <LiveServices />
      <SolutionsBridge />
      <FinalCta />
    </>
  );
}
