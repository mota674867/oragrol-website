import type { Metadata } from "next";
import { ServicesHero } from "../components/sections/services/hero";
import { LiveServices } from "../components/sections/services/live-services";
import { AdditionalCapabilities } from "../components/sections/services/additional-capabilities";
import { SolutionsBridge } from "../components/sections/services/solutions-bridge";
import { FinalCta } from "../components/sections/home/final-cta";

export const metadata: Metadata = {
  title: "Services | Oragrol Global",
  description:
    "Eight security capabilities, one coordinated approach — from virtual CISO leadership to security awareness training.",
};

/**
 * Services — Website Implementation Brief, Step 5.
 * Flow (locked for this pass, see DECISIONS.md D-007): Hero → Live
 * Services (1-4) → Additional Capabilities (5-8) → Services/Solutions
 * bridge → Final CTA (reused from Home, not duplicated) → Footer (global,
 * layout.tsx). Individual per-service detail pages are explicitly out of
 * scope for this pass — see D-007.
 */
export default function ServicesPage() {
  return (
    <>
      <ServicesHero />
      <LiveServices />
      <AdditionalCapabilities />
      <SolutionsBridge />
      <FinalCta />
    </>
  );
}
