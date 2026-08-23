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
 * Fixed by lowering just the Y component of `object-position` — a lower Y
 * reveals more of the image's own top (less top crop, more bottom crop),
 * so the face/head settles lower in the frame as a genuine re-crop of the
 * same untouched source file, not the "reveal flat background" mechanism
 * `translate-x` above uses. `62%` (X) and every `translate-x-*` step are
 * unchanged — this was a vertical-only defect. No height, text, nav, or
 * image-asset change.
 *
 * First version of this fix (D-079, 2026-08-23) used three discrete
 * Tailwind breakpoints (`2xl:`/`min-[2200px]:`/`min-[2560px]:`). Superseded
 * same day (D-080) after confirming via `getBoundingClientRect` at the
 * exact 6 viewports Mohammad specified (1440x900/1536x864/1920x1080/
 * 1366x768/1280x720/390x844) that this section's rendered height is a flat
 * 740px at EVERY desktop size tested regardless of viewport height (900 vs
 * 864 vs 1080 vs 768 vs 720 all measured identically) — the box's aspect
 * ratio is driven entirely by width, since height is a fixed `min-h`
 * floor the short hero copy never exceeds. That also exposed a real flaw
 * in the discrete version: its `2xl` bucket started exactly at 1536px, so
 * 1536×864 (a real 16" laptop resolution, not the reported bug) was
 * getting shifted to 24% even though 36% was already correct there —
 * an unforced deviation from baseline at a viewport that never had the
 * problem, and a visible "jump" right at the 2xl edge instead of a smooth
 * response to width.
 *
 * D-080 replaced the 3 discrete breakpoints with one continuous formula:
 * `62% clamp(4%, calc(36% - max(0px, (100vw - 1536px)) * 0.0293), 36%)`.
 * It was WRONG — shipped, then caught by Mohammad's actual 1920px
 * screenshot: the top of the head cleared the header, but the mouth/chin
 * were now cropped off entirely.
 *
 * Root cause, worked out by testing plain percentages empirically rather
 * than trusting the calc() math (D-081, 2026-08-23): object-position's Y
 * percentage resolves as `offset = (box_height - scaled_image_height) *
 * Y/100`, and at these widths `(box_height - scaled_image_height)` is
 * NEGATIVE (the box is shorter than the scaled image). Subtracting a
 * positive px amount from `36%` in that formula makes the resolved offset
 * MORE negative, not less — i.e. it INCREASES top crop, the opposite of
 * D-080's intent — while `clamp(4%, …, 36%)` compares the three terms
 * AFTER they've each resolved through that same negative-reference
 * formula, so its "floor" of 4% actually resolves to a LESS negative
 * number than its "ceiling" of 36% — clamp() has no way to know the
 * authored min/max are inverted in the resolved domain, so it silently
 * snapped every width past 1536px straight to the 4% position: almost no
 * top crop at all, and nearly the entire vertical excess (~685px of it at
 * 1920px) removed from the bottom instead — which is exactly what ate the
 * mouth and chin. Confirmed by testing plain, unclamped percentages
 * (`62% 36%`, `62% 24%`, `62% 16%`) side by side: each behaves exactly as
 * D-079 originally found (lower % = more top visible, mouth/chin stay in
 * frame) — the bug was specific to combining `%` and `px` inside `calc()`/
 * `clamp()` against this particular negative reference, not to the
 * underlying idea of lowering Y.
 *
 * Fixed by flipping the sign — ADD to `36%` instead of subtracting — and
 * dropping the broken `clamp()` for a plain `min()` that only ever bounds
 * the correction's own magnitude (a pure length-to-length comparison, no
 * percentage involved, so no repeat of the same trap): `62% calc(36% +
 * min(400px, max(0px, (100vw - 1536px)) * 0.35))`. Below 1536px this is
 * still exactly `36%` (`max(0px, …)` is `0px`), so 1440/1366/1280/mobile
 * are provably untouched. The `0.35` coefficient was bisected empirically
 * against real screenshots at 1920px (not algebraically derived, since
 * the true target curve is quadratic in viewport width once you account
 * for the image having to scale to cover it — not worth a fragile
 * closed-form match) — verified at 1920px to clear the header AND keep
 * the full mouth/chin in frame, and `min(400px, …)` keeps the correction
 * from ever overshooting into revealing flat background above the image
 * at widths this hero isn't expected to see. Applied via inline `style`
 * (not a Tailwind arbitrary class) since Tailwind's space-to-underscore
 * escaping makes a `calc()`/`min()`/`max()` this deep unreadable as a
 * class string.
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
          className="object-cover md:translate-x-[10%] lg:translate-x-[16%] xl:translate-x-[20%]"
          style={{
            objectPosition: "62% calc(36% + min(400px, max(0px, (100vw - 1536px)) * 0.35))",
          }}
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
