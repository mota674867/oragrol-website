import type { Metadata } from "next";
import { Caption, Section, Text } from "../../components/ui";
import { SolutionsHero } from "../../components/sections/solutions/hero";
import { SolutionsHeroKineticPrototype } from "../../components/sections/solutions/hero-kinetic-prototype";

// Same convention as every prior prototype route this project has used:
// noindex, not linked from nav, deleted once Mohammad's decision is made.
export const metadata: Metadata = {
  title: "Prototype — Solutions Kinetic Grid Hero (internal)",
  robots: { index: false, follow: false },
};

/**
 * /solutions/prototype — D-039. Mohammad's instruction to reopen
 * Solutions' already-approved hero visual (D-008, isometric strata) and
 * replace it with a kinetic-grid canvas background, sourced via 21st.dev.
 * See `kinetic-grid.tsx`'s own file comment for the full sourcing note
 * and all 5 required-modification details.
 *
 * Shows the CURRENT live hero (unchanged `SolutionsHero`, `StrataVisual`)
 * stacked above the new prototype (`SolutionsHeroKineticPrototype`,
 * `KineticGrid`) for direct comparison — same identical copy in both, so
 * the visual treatment is the only variable. Nothing live is touched by
 * this route; `hero.tsx` still imports `StrataVisual`, unchanged.
 */
export default function SolutionsPrototypePage() {
  return (
    <>
      <Section environment="white">
        <div className="mx-auto w-full max-w-4xl px-6 py-10 text-center md:px-12">
          <Caption tone="accent">Internal — not linked from live navigation</Caption>
          <Text size="sm" tone="muted" className="mt-3">
            Current hero (StrataVisual) shown first, new prototype (KineticGrid) below —
            identical copy in both. Nothing on the live /solutions page is touched by this route.
          </Text>
        </div>
      </Section>

      <div className="border-t border-border">
        <Section environment="white">
          <div className="mx-auto w-full max-w-4xl px-6 pt-10 md:px-12">
            <span className="inline-flex items-center rounded-full border border-accent/30 bg-accent/10 px-3 py-1 font-body text-xs font-semibold uppercase tracking-wide text-accent">
              Current — live
            </span>
          </div>
        </Section>
        <SolutionsHero />
      </div>

      <div className="border-t border-border">
        <Section environment="white">
          <div className="mx-auto w-full max-w-4xl px-6 pt-10 md:px-12">
            <span className="inline-flex items-center rounded-full border border-accent/30 bg-accent/10 px-3 py-1 font-body text-xs font-semibold uppercase tracking-wide text-accent">
              Prototype — Kinetic Grid
            </span>
          </div>
        </Section>
        <SolutionsHeroKineticPrototype />
      </div>
    </>
  );
}
