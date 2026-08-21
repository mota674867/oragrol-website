import type { Metadata } from "next";
import { BusinessAutomationHero } from "../components/sections/business-automation/hero";
import { ProjectOffers } from "../components/sections/business-automation/project-offers";
import { RecurringPackages } from "../components/sections/business-automation/recurring-packages";
import { BusinessAutomationCategories } from "../components/sections/business-automation/categories";
import { FinalCta } from "../components/sections/home/final-cta";

export const metadata: Metadata = {
  title: "Business Automation | Oragrol Global",
  description: "Five categories, twenty-five services — AI and automation that save time and grow revenue.",
};

/**
 * Business Automation — new top-level page, 2026-08-20 nav split. Split
 * out of `/services` (see DECISIONS.md, same date) so Business Automation
 * is its own top-level nav item rather than an anchor-scrolled tier of
 * Services. Flow: Hero → Categories (the 5 real categories) → Final CTA
 * (reused from Home, same as `/services`) → Footer (global, layout.tsx).
 *
 * No `SolutionsBridge` here (unlike `/services`): that component's copy
 * is specifically about the Services-vs-Solutions distinction, with
 * cybersecurity-specific examples ("risk assessments or security
 * awareness training") — genuinely Services content, not generic, and
 * there's no equivalent real "Business Automation vs Solutions" copy
 * anywhere to reuse. Not invented here; flagged rather than silently
 * reused out of context or silently fabricated.
 *
 * 2026-08-21: real package data added (`oragrol-tier2-packages-data.json`)
 * — `ProjectOffers` (Assessment/Implementation, one-time) and
 * `RecurringPackages` (Starter/Growth/Scale/Enterprise) inserted between
 * Hero and Categories, same page rather than a separate route (see
 * DECISIONS.md for the reasoning). Categories (the individual à la carte
 * services) stays last before the Final CTA, since it's the "or buy
 * services individually" alternative to the packages above it.
 */
export default function BusinessAutomationPage() {
  return (
    <>
      <BusinessAutomationHero />
      <ProjectOffers />
      <RecurringPackages />
      <BusinessAutomationCategories />
      <FinalCta />
    </>
  );
}
