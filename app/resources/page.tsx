import type { Metadata } from "next";
import { ResourcesHero } from "../components/sections/resources/hero";
import { ResourcesExplorer } from "../components/sections/resources/resources-explorer";

export const metadata: Metadata = {
  title: "Resources | Oragrol Global",
  description:
    "Practical cybersecurity guidance for Canadian businesses: cyber health, identity & access, ransomware recovery, email security, and compliance.",
};

/**
 * Resources — Website Implementation Brief, Step 10. Built from the real
 * content brief (ORAGROL_RESOURCES_ALL_ARTICLES_FINAL.md, all 6
 * articles) — see DECISIONS.md D-052 for the research/build record.
 * Flow: Hero (no page-level copy was supplied; flagged, not invented) ->
 * ResourcesExplorer (faceted filters + content grid, Article 1 featured)
 * -> Footer (global, layout.tsx). No FinalCta here — the grid itself,
 * plus every individual article's own mapped CTA, already gives visitors
 * a clear next step; a generic closing CTA would be redundant on a
 * listing page whose entire purpose is picking one of those next steps.
 */
export default function ResourcesPage() {
  return (
    <>
      <ResourcesHero />
      <ResourcesExplorer />
    </>
  );
}
