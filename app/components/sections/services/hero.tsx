import Image from "next/image";
import { Container, H1, Section, Text } from "../../ui";
import { Reveal } from "../../motion/reveal";

/**
 * Services Hero — full-bleed background integration (2026-08-22), on top
 * of D-076's landscape hero visual. Mohammad's instruction: stop treating
 * `services-hero.png` as a photo placed beside the text in a two-column
 * grid (D-075/D-076's layout) and instead integrate it as one continuous,
 * edge-to-edge cinematic background behind the whole hero — no visible
 * image frame/border/card, extending behind the fixed header at the top
 * and fading into the flat dark page background at the bottom. The face
 * itself, its proportions, cybernetic detail, and lighting are untouched
 * — this is a layout/integration change, not an image edit (the same
 * `services-hero.png` file from D-076, no re-crop, no regeneration).
 *
 * Structure: the image is a `pointer-events-none absolute inset-0 -z-10`
 * layer (D-070's own hardened "guaranteed behind content" pattern — an
 * `absolute` layer with `z-index:auto` does not reliably paint behind a
 * plain non-positioned sibling per CSS2.1's painting-order algorithm;
 * `-z-10` + `Section`'s own `isolate` stacking context makes it explicit
 * instead of relying on DOM order alone), sized via `object-cover` so it
 * fills the section's box in both dimensions without stretching — crops
 * top/bottom on wide desktop viewports (section proportionally wider than
 * the 1512:1145 image) and left/right on narrow/tall mobile viewports
 * (section proportionally taller), never both, and never distorts the
 * photo itself. `object-position` (`object-[62%_36%]`) is anchored near
 * the face's own position in the source frame so the crop stays
 * face-centered regardless of which axis a given viewport crops.
 *
 * Desktop repositioning (2026-08-22 follow-up): Mohammad reported the
 * face reading as too centered, overlapping the headline. Root cause:
 * at desktop widths the section's box is proportionally WIDER than the
 * 1512:1145 image, so `object-cover` scales to match width exactly —
 * there is zero horizontal excess left for `object-position`'s X value
 * to pan across (it only ever affects the vertical/top-bottom crop at
 * these viewports), which is why the face sat wherever the source
 * photo's own native composition placed it rather than anywhere
 * `object-position` implied. A first attempt (`transform: scale()` on
 * a shifted `transform-origin`) was tried and rejected after screenshot
 * review — it changed the framing but didn't land the face predictably
 * in the right half. Fixed instead with a plain `translateX` (`md:
 * translate-x-[10%] lg:translate-x-[16%] xl:translate-x-[20%]`,
 * desktop-only, mobile/tablet untouched): translating the already-fitted
 * `object-cover` box rightward reveals flat `--background` on its now-
 * exposed left edge (exactly the "clean dark left" the brief asks for,
 * with zero extra markup) while the image's own excess simply clips
 * further past the right edge, still fully covered. No zoom, no resize
 * — the face's on-screen size is unchanged, only its position shifted,
 * per the explicit "keep it large, don't shrink it to solve the
 * overlap" instruction. Verified via screenshot at 1440/1920/2560 (face
 * lands in the right ~45% at each, headline fully clear) and re-checked
 * at 390px mobile to confirm the unrelated breakpoints were untouched.
 *
 * Ultra-wide follow-up (2026-08-23): Mohammad reported the 14-inch
 * (~1440px) framing above as the correct reference, but on a 24-inch
 * desktop monitor the top of the head was pushed up far enough to clip
 * under the fixed header. Root cause, confirmed with live Playwright
 * screenshots at each width rather than assumed from the math alone: the
 * section's `min-h-*` caps at 740px from `xl` upward with no further
 * increase, while the section's width keeps growing well past that —
 * `object-cover` has to scale the image ever larger to keep covering that
 * width, so the fixed vertical crop this hero already relies on (see
 * above: box wider than the 1512:1145 image, top/bottom crop only, `62%
 * 36%` sets a 36%-from-top/64%-from-bottom split) removes a growing
 * number of *absolute* pixels off the top even though the split ratio
 * itself never changes — fine at 1440/1536, visibly clipping the
 * hairline by ~1920 and clipping into the forehead by 2560.
 *
 * Fixed by lowering just the Y component of `object-position` in three
 * screenshot-verified steps above `2xl` (1536px — below this, and at the
 * reference 1440px, nothing changes): `2xl:object-[62%_24%]` (clean at
 * 1600/1728/1920), `min-[2200px]:object-[62%_16%]`, `min-[2560px]:
 * object-[62%_5%]`. A lower Y value reveals more of the image's own top
 * (less top crop, more bottom crop) — visually the face/head settles
 * lower in the frame without moving via `transform`, so it isn't the same
 * "reveal flat background" mechanism `translate-x` above uses; this is a
 * genuine re-crop of the same untouched source file. `62%` (X) and every
 * `translate-x-*` step are unchanged — confirmed via screenshot that
 * horizontal placement stays correct at every one of these widths, this
 * was a vertical-only defect. No height, text, nav, or image-asset change.
 *
 * Top edge: no fade needed here — `SiteHeader` (`fixed`) already carries
 * its own two-stacked-gradient background (D-066/067's fix, "so the
 * header blends into the Hero image instead of sitting on a hard edge")
 * specifically built to let whatever's beneath it show through. Since
 * this hero's background image now starts at the section's own top edge
 * (true page y=0, same place the header already floats over), it reads
 * as "continuing behind the nav" with zero header changes.
 *
 * Bottom edge: a `bg-gradient-to-b from-transparent to-background`
 * overlay (same stacking layer as the image, painted after it) fades the
 * photo into the flat dark page background over the section's own lower
 * half — `--background` here is the identical flat color the next
 * section (`ServicesOverview`, also `environment="dark"`) already uses,
 * so the blend lands on a color with zero seam, no cross-environment
 * transition mechanics needed (D-069's `transitionFrom`/`transitionTo`
 * exist for a boundary between two DIFFERENT environment colors — this
 * is the same color fading into itself).
 *
 * Text: no grid, no second column — a single `max-w-xl` block sitting on
 * top of the full-bleed background via normal Container padding, left-
 * aligned, matching "not a photo placed beside the content." Same
 * headline/copy as before, no new label/badge/eyebrow (D-074's removal
 * stays; nothing reintroduced here). `min-h-*` per breakpoint keeps the
 * section's own aspect ratio from getting too extreme at any viewport
 * (an unbounded, content-only height would make mobile far too tall/
 * narrow relative to the image, forcing a much more aggressive left/
 * right crop than necessary).
 *
 * D-069/D-070: this section still carries no `transitionFrom`/
 * `transitionTo` prop — every section on `/services` is
 * `environment="dark"`, so there's no environment-color boundary here to
 * soften. Section's own layering (`isolate`) is what this pass's own
 * `-z-10` background layer relies on, untouched otherwise.
 */
export function ServicesHero() {
  return (
    <Section environment="dark" className="relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <Image
          src="/images/services-hero.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[62%_36%] md:translate-x-[10%] lg:translate-x-[16%] xl:translate-x-[20%] 2xl:object-[62%_24%] min-[2200px]:object-[62%_16%] min-[2560px]:object-[62%_5%]"
        />
        {/* Left-side scrim — reinforces the dark ground the headline/copy
            sit on. The source photo already fades dark on its own left
            edge, but at the crop windows this section actually renders
            (object-cover against a much wider-than-1512:1145 box on most
            viewports), that dark margin alone isn't reliably wide enough
            to keep body-copy-weight text legible against the brighter
            facial/rim-light area behind it — confirmed by screenshot, not
            assumed. This is the "extend the dark background further left,
            behind the text" instruction implemented directly, not a new
            visual element. */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to right, var(--color-background) 0%, color-mix(in srgb, var(--color-background) 60%, transparent) 40%, transparent 68%)",
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-b from-transparent to-background" />
      </div>

      <Container
        size="2xl"
        className="min-h-[520px] pb-16 pt-[calc(var(--header-height)_+_2rem)] sm:min-h-[560px] sm:pb-20 sm:pt-[calc(var(--header-height)_+_2.5rem)] md:min-h-[620px] md:pb-24 md:pt-[calc(var(--header-height)_+_3rem)] lg:min-h-[680px] lg:pt-[calc(var(--header-height)_+_3.5rem)] xl:min-h-[740px]"
      >
        <div className="max-w-xl">
          <Reveal>
            <H1 size="xl">Ten categories. One coordinated approach.</H1>
          </Reveal>
          <Reveal delay={0.06}>
            <Text tone="secondary" size="lg" className="mt-8 max-w-lg">
              Every service exists to answer one question: what does this business actually need
              to protect, and what&apos;s the most direct way to protect it?
            </Text>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
