import type { Metadata } from "next";
import { IndustriesHero } from "../components/sections/industries/hero";
import { IndustriesExplorer } from "../components/sections/industries/industries-explorer";
import { FinalCta } from "../components/sections/home/final-cta";

export const metadata: Metadata = {
  title: "Industries | Oragrol Global",
  description:
    "Cybersecurity isn't one-size-fits-all. See the risk, priorities, and approach Oragrol takes for your industry.",
};

/**
 * Industries — Website Implementation Brief, Step 9.
 * One elegant interactive experience, not 9 separate pages (PROJECT_MASTER.md
 * Step 9 brief): Hero -> IndustriesExplorer (sidebar/tabs + instant-swap
 * detail panel, all 9 industries) -> Final CTA (reused from Home, same
 * pattern as Solutions) -> Footer (global, layout.tsx).
 */
export default function IndustriesPage() {
  return (
    <>
      <IndustriesHero />
      <IndustriesExplorer />
      <FinalCta />
    </>
  );
}
