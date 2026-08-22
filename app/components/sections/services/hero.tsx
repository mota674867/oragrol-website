import Image from "next/image";
import { CONTAINER_MAX_WIDTH, H1, Section, Text } from "../../ui";
import { Reveal } from "../../motion/reveal";

/**
 * Services Hero — "face image implementation" pass (2026-08-22), superseding
 * the abstract-schematic version this hero used since the prior two
 * visual-correction passes. Mohammad's explicit instruction: bring the
 * existing photographic asset from `_reference/` into the hero as the
 * dominant visual, in place of the illustrated network/schematic, with
 * Mohammad's explicit confirmation that Oragrol holds the rights to use
 * this specific file (asked directly before proceeding — the source file
 * is a screenshot of a different company's own marketing page, carrying
 * that company's own logo/headline baked into the pixels; using it as-is
 * would have been reproducing someone else's branded asset, not "drawing
 * inspiration from" it, so this wasn't implemented on the first ask).
 *
 * Asset handling: `_reference/8878.png` (1017x618) was cropped to
 * `public/images/services-hero-visual.jpg` (457x618, ~65KB) — the crop
 * keeps only the face/visual portion (roughly the right 45% of the
 * original frame) and deliberately excludes the other company's own logo
 * and headline text, which sat in the left ~55% of that same source image
 * and aren't part of what Mohammad confirmed rights to reuse as Oragrol's
 * own hero visual. No AI regeneration, no illustrated replacement, no new
 * visual invented — the actual photograph, cropped only to isolate the
 * subject, per the explicit "use the existing image, do not generate a
 * replacement" instruction.
 *
 * No card, no border, no background panel around the image — it sits
 * directly on the section's own dark ground, at its own native 457:618
 * aspect ratio (`aspect-[457/618]`) so `object-cover` never has anything
 * to crop beyond what the box's own height cap forces at the very
 * widest viewports (crops top/bottom evenly there, never stretches or
 * distorts — the photo's own aspect ratio is preserved by construction
 * whenever the box isn't height-capped, which is most viewports). Sized
 * by height (`max-h-*` per breakpoint) with width auto-derived from the
 * aspect ratio, rather than filling the grid column's own width — this
 * guarantees the face is never cropped more than marginally, at the
 * deliberate cost of not literally touching the row's right edge at
 * every viewport; `lg:ml-auto` still pushes it against that edge once
 * the two-column layout activates, which is where "bleed toward the
 * right edge" actually reads visually.
 *
 * Logo/badge removal (D-074) and the header-clearance fix that pass
 * required are untouched — this pass only replaces the visual half's
 * contents and updates the supporting copy to the shorter wording
 * supplied with this brief (same claim, same "explore what each category
 * covers below" idea folded into the single question, not new marketing
 * copy — provided verbatim in the brief itself).
 *
 * Colors: the brief re-quoted the pre-D-068 retired hex values a fourth
 * time (#080A0D background / #D95A2B accent, vs. the current authoritative
 * #0A0C12 / #DB5227) — flagged again, proceeding on the current tokens.css
 * palette via the existing semantic Tailwind classes (`H1`/`Text` already
 * resolve through `--text-primary`/`--text-secondary`; the section's own
 * `environment="dark"` background is `--palette-deep-ink`), so no raw hex
 * needed hardcoding here regardless. Warm Off-White (#E9E5DC) is identical
 * in both palettes, no discrepancy there.
 *
 * D-069/D-070: this section carries no `transitionFrom`/`transitionTo` —
 * every section on `/services` is `environment="dark"`. Section's own
 * layering (`isolate`, `-z-10` overlay) is untouched.
 */
export function ServicesHero() {
  return (
    <Section environment="dark">
      <div
        className={`mx-auto w-full overflow-x-clip pb-16 pl-6 pr-6 pt-[calc(var(--header-height)_+_2rem)] sm:pb-20 sm:pt-[calc(var(--header-height)_+_2.5rem)] md:pb-24 md:pl-12 md:pr-12 md:pt-[calc(var(--header-height)_+_3rem)] lg:pr-0 lg:pt-[calc(var(--header-height)_+_3.5rem)] ${CONTAINER_MAX_WIDTH["2xl"]}`}
      >
        <div className="grid grid-cols-1 items-center gap-y-12 lg:grid-cols-[1fr_1.3fr] lg:gap-x-10">
          <div>
            <Reveal>
              <H1 size="xl" className="max-w-xl">
                Ten categories. One coordinated approach.
              </H1>
            </Reveal>
            <Reveal delay={0.06}>
              <Text tone="secondary" size="lg" className="mt-8 max-w-lg">
                Every service exists to answer one question: what does this business actually need
                to protect, and what&apos;s the most direct way to protect it?
              </Text>
            </Reveal>
          </div>

          <Reveal delay={0.15}>
            <div className="relative mx-auto aspect-[457/618] w-auto max-w-full max-h-[420px] sm:max-h-[500px] md:max-h-[560px] lg:mx-0 lg:ml-auto lg:max-h-[620px] xl:max-h-[680px]">
              <Image
                src="/images/services-hero-visual.jpg"
                alt=""
                fill
                priority
                sizes="(min-width: 1280px) 500px, (min-width: 1024px) 460px, (min-width: 640px) 420px, 300px"
                className="object-cover"
              />
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
