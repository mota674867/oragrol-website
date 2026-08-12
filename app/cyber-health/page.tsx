import type { Metadata } from "next";
import { CyberHealthHero } from "../components/sections/cyber-health/hero";
import { Flow } from "../components/sections/cyber-health/flow";
import { OutputShape } from "../components/sections/cyber-health/output-shape";
import { Reassurance } from "../components/sections/cyber-health/reassurance";
import { ClosingCta } from "../components/sections/cyber-health/closing-cta";

export const metadata: Metadata = {
  title: "Cyber Health | Oragrol Global",
  description:
    "Know your Cyber Health Score in minutes — a focused assessment, a clear score, and a practical plan for what to do next.",
};

/**
 * Cyber Health — Website Implementation Brief, Step 7.
 * Flow: Hero (GaugeVisual, D-008's "instrument-panel" motif; CTA to the
 * real live assessment) -> Flow (the locked 7-step sequence, page-level
 * weight) -> OutputShape (the locked output list + an illustrative report
 * preview) -> Reassurance (facts confirmed from the live form) ->
 * ClosingCta (page-specific, not the reused FinalCta) -> Footer (global,
 * layout.tsx).
 *
 * The actual 42-question assessment, scoring, AI analysis, email, and
 * CRM handoff run on the existing Tally-based MVP
 * (https://tally.so/r/2EzROb, confirmed live with real submissions by
 * Mohammad) — this page is the "product-facing experience" wrapper
 * PROJECT_MASTER.md Step 7 describes, not a rebuild of that flow.
 */
export default function CyberHealthPage() {
  return (
    <>
      <CyberHealthHero />
      <Flow />
      <OutputShape />
      <Reassurance />
      <ClosingCta />
    </>
  );
}
