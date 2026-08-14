import type { Metadata } from "next";
import { Caption, Section, Text } from "../../components/ui";
import { CyberHealthHero } from "../../components/sections/cyber-health/hero";
import { CyberHealthHeroAmbientPrototype } from "../../components/sections/cyber-health/hero-ambient-prototype";

// Same convention as every prior prototype route: noindex, not linked
// from nav, deleted once Mohammad's decision is made either way.
export const metadata: Metadata = {
  title: "Prototype — Cyber Health Ambient Hero (internal)",
  robots: { index: false, follow: false },
};

/**
 * /cyber-health/prototype-hero — D-043. Shows the CURRENT LIVE hero
 * (`CyberHealthHero`, `GaugeVisual`, unchanged) stacked above the new
 * prototype hero (`CyberHealthHeroAmbientPrototype`, `HeroAmbientLoader`)
 * with identical copy in both, for direct comparison — same pattern as
 * D-039's `/solutions/prototype`. `hero.tsx` and `GaugeVisual` are
 * completely untouched by this route.
 */
export default function PrototypeHeroPage() {
  return (
    <>
      <Section environment="dark" className="border-b border-border">
        <div className="mx-auto max-w-2xl px-6 pt-10 text-center md:px-12">
          <Caption tone="accent">Internal — current live hero (unchanged)</Caption>
        </div>
      </Section>
      <CyberHealthHero />

      <Section environment="dark" className="border-b border-border">
        <div className="mx-auto max-w-2xl px-6 pt-10 text-center md:px-12">
          <Caption tone="accent">Internal — D-043 prototype (ambient loader hero)</Caption>
          <Text size="sm" tone="muted" className="mt-3 max-w-md mx-auto">
            Not wired into the live `/cyber-health` page — see hero-ambient-loader.tsx&rsquo;s own
            comments for the required changes and reasoning.
          </Text>
        </div>
      </Section>
      <CyberHealthHeroAmbientPrototype />
    </>
  );
}
