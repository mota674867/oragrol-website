import type { Metadata } from "next";
import { HowWeWorkHero } from "../components/sections/how-we-work/hero";
import { StageSequence } from "../components/sections/how-we-work/stage-sequence";
import { HowWeWorkClosingCta } from "../components/sections/how-we-work/closing-cta";

// Full page copy supplied and built — no longer a visual-only prototype
// (see DECISIONS.md D-035 for the hero-visual round, D-036 for this one)
// — noindex removed, matching every other built page (Home/Services/
// Solutions/Cyber Health carry no robots restriction).
export const metadata: Metadata = {
  title: "How We Work | Oragrol Global",
  description:
    "Security work fails when it stays vague. Here is exactly how we work with you, stage by stage, from the first conversation onward.",
};

/**
 * How We Work — Step 8. All copy LOCKED verbatim, supplied by Mohammad
 * — see each section component's own comment for exact sourcing. Flow:
 * Hero (headline/subhead + the connected-loop visual, D-035) -> Stage
 * Sequence (Understand/Prioritize/Protect/Improve, full paragraph copy
 * each) -> Closing CTA (single "Talk to Oragrol" button).
 */
export default function HowWeWorkPage() {
  return (
    <>
      <HowWeWorkHero />
      <StageSequence />
      <HowWeWorkClosingCta />
    </>
  );
}
