import type { Metadata } from "next";
import { FounderBio } from "../components/sections/company/founder-bio";
import { MissionStory } from "../components/sections/company/mission-story";
import { TeamSection } from "../components/sections/company/team";
import { ValuesSection } from "../components/sections/company/values";
import { FinalCta } from "../components/sections/home/final-cta";

export const metadata: Metadata = {
  title: "Company | Oragrol Global",
  description:
    "Meet the founder behind Oragrol, why the company exists, and the practical, business-first approach it brings to cybersecurity.",
};

/**
 * Company / About — Website Implementation Brief, Step 11. Built from the
 * real supplied content brief (ORAGROL_ABOUT_PAGE_CONTENT_FINAL.md), which
 * supersedes PROJECT_MASTER.md's original placeholder outline (Hero / Who
 * Oragrol Is / Company Story / Philosophy / Experience & Expertise /
 * Partners & Ecosystem / Approach / CTA) — the same way D-046's real brief
 * superseded Contact's. See DECISIONS.md for the new structure's record.
 *
 * Flow: Founder Bio (doubles as the page's opening — no separate hero
 * copy was supplied, so none was invented) -> Mission/Story ("Why Oragrol
 * Exists") -> Team (deliberately minimal, founder-led today) -> Values
 * ("Our Difference") -> Final CTA (reused, consistency with every other
 * page — a structural choice, not invented content, same flag Industries
 * logged for the identical reuse) -> Footer (global, layout.tsx).
 *
 * Each of the 4 sections gets a distinct visual treatment (Dark 2-col
 * editorial photo / Light-blue single-column manifesto / minimal bordered
 * band / icon-led grid with a dark closing panel) rather than four
 * identically-stacked text blocks — see each section's own file for the
 * specific reasoning.
 */
export default function CompanyPage() {
  return (
    <>
      <FounderBio />
      <MissionStory />
      <TeamSection />
      <ValuesSection />
      <FinalCta />
    </>
  );
}
