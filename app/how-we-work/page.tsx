import type { Metadata } from "next";
import { ButtonLink, Caption, Section } from "../components/ui";
import { HowWeWorkCycleVisual } from "../components/sections/how-we-work/cycle-visual";

// noindex while this is a visual-only prototype — same convention as
// every Services prototype route this project has used, though this one
// sits at the page's real eventual URL (Step 8 has no separate "current
// live" version to prototype next to, unlike Services' capability
// rounds) — see the file-level comment below for why.
export const metadata: Metadata = {
  title: "How We Work | Oragrol Global",
  robots: { index: false, follow: false },
};

/**
 * /how-we-work — Step 8, VISUAL PROTOTYPE ONLY, per Mohammad's explicit
 * instruction: "Prototype the visual at /how-we-work before touching any
 * live route." Deliberately minimal beyond the primary hero visual —
 * the instruction's own copy block did not come through (the message
 * contained the literal placeholder "[PASTE THE FULL COPY ABOVE HERE]",
 * not real text), and the project's own content-governance rule is
 * explicit: never invent claims/copy. Rather than guess a headline, body
 * copy, or page structure, this route currently contains ONLY:
 *  - the "How We Work" page label (the confirmed sitemap name, not new
 *    copy)
 *  - `HowWeWorkCycleVisual`, the requested primary hero visual — see
 *    that file's own reasoning-trail comment
 *  - the CTA button, exactly as instructed ("Talk to Oragrol", to stay
 *    consistent with Services), pointed at /contact per the same
 *    label/href pairing used everywhere else on the site
 *
 * Not yet built: headline, body copy, page structure beyond the hero
 * visual, and any section following it — all pending the actual copy
 * block. `noindex`'d until real content lands and this is reviewed.
 */
export default function HowWeWorkPage() {
  return (
    <Section environment="white">
      <div className="mx-auto w-full max-w-4xl px-6 py-24 text-center md:px-12 md:py-32">
        <Caption tone="accent">How We Work</Caption>

        <div className="mt-10">
          <HowWeWorkCycleVisual />
        </div>

        <ButtonLink href="/contact" variant="primary" size="lg" className="mt-10">
          Talk to Oragrol
        </ButtonLink>
      </div>
    </Section>
  );
}
