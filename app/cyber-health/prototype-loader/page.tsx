import type { Metadata } from "next";
import { Caption, Section, Text } from "../../components/ui";
import { AiLoader } from "../../components/sections/cyber-health/ai-loader";

// Same convention as every prior prototype route: noindex, not linked
// from nav, deleted once Mohammad's decision is made either way.
export const metadata: Metadata = {
  title: "Prototype — Cyber Health Processing Loader (internal)",
  robots: { index: false, follow: false },
};

/**
 * /cyber-health/prototype-loader — see `ai-loader.tsx`'s own file
 * comment for the full sourcing note and the two findings (no
 * "Processing Screen" spec in this repo; no in-app pipeline currently
 * exists for this to attach to) surfaced before building. This route
 * shows the component in isolation only — it is NOT wired into the
 * live `/cyber-health` page or its Tally-redirect CTAs.
 */
export default function PrototypeLoaderPage() {
  return (
    <Section environment="dark">
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center px-6 py-24 text-center md:px-12 md:py-32">
        <Caption tone="accent">Internal — not linked from live navigation</Caption>
        <Text size="sm" tone="muted" className="mt-3 max-w-md">
          Cyber Health processing-screen prototype. Not wired into the live assessment flow — see
          this file&rsquo;s and ai-loader.tsx&rsquo;s own comments for why.
        </Text>

        <div className="mt-16">
          <AiLoader />
        </div>
      </div>
    </Section>
  );
}
