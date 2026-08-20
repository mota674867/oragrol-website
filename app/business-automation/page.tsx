import type { Metadata } from "next";
import { BusinessAutomationHero } from "../components/sections/business-automation/hero";
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
 */
export default function BusinessAutomationPage() {
  return (
    <>
      <BusinessAutomationHero />
      <BusinessAutomationCategories />
      <FinalCta />
    </>
  );
}
