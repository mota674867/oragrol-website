import Image from "next/image";
import { CONTAINER_MAX_WIDTH, Container, H1, Section, Text } from "../../ui";
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
 * Structure: a `pointer-events-none absolute inset-0 -z-10` layer (D-070's
 * own hardened "guaranteed behind content" pattern — an `absolute` layer
 * with `z-index:auto` does not reliably paint behind a plain non-positioned
 * sibling per CSS2.1's painting-order algorithm; `-z-10` + `Section`'s own
 * `isolate` stacking context makes it explicit instead of relying on DOM
 * order alone) spans the full Section for the flat dark ground, but the
 * image itself lives inside an inner **master composition frame** — see
 * D-082 below for why that frame exists and what it fixed — sized via
 * `object-cover` so it fills THAT frame's box in both dimensions without
 * stretching — crops top/bottom at desktop-proportioned frame widths (frame
 * proportionally wider than the 1512:1145 image) and left/right at
 * narrow/tall mobile viewports (frame proportionally taller, since below
 * the frame's own max-width it simply equals the viewport), never both, and
 * never distorts the photo itself. `object-position` (`object-[62%_36%]`)
 * is anchored near the face's own position in the source frame so the crop
 * stays face-centered regardless of which axis a given width crops.
 *
 * Desktop repositioning (2026-08-22 follow-up): Mohammad reported the
 * face reading as too centered, overlapping the headline. Root cause:
 * at desktop widths the frame's box is proportionally WIDER than the
 * 1512:1145 image, so `object-cover` scales to match width exactly —
 * there is zero horizontal excess left for `object-position`'s X value
 * to pan across (it only ever affects the vertical/top-bottom crop at
 * these widths), which is why the face sat wherever the source photo's
 * own native composition placed it rather than anywhere `object-position`
 * implied. A first attempt (`transform: scale()` on a shifted
 * `transform-origin`) was tried and rejected after screenshot review — it
 * changed the framing but didn't land the face predictably in the right
 * half. Fixed instead with a plain `translateX` (`md:translate-x-[10%]
 * lg:translate-x-[16%] xl:translate-x-[20%]`, desktop-only, mobile/tablet
 * untouched): translating the already-fitted `object-cover` box rightward
 * reveals flat `--background` on its now-exposed left edge (exactly the
 * "clean dark left" the brief asks for, with zero extra markup) while the
 * image's own excess simply clips further past the right edge, still fully
 * covered. No zoom, no resize — the face's on-screen size is unchanged,
 * only its position shifted, per the explicit "keep it large, don't shrink
 * it to solve the overlap" instruction. Verified via screenshot at
 * 1440/1920/2560 (face lands in the right ~45% at each, headline fully
 * clear) and re-checked at 390px mobile to confirm the unrelated
 * breakpoints were untouched. This positioning is unaffected by D-082
 * below — it still translates the image relative to its own (now
 * frame-sized rather than section-sized) box, same mechanism either way.
 *
 * Ultra-wide saga, D-079 through D-081 (2026-08-23, all same day —
 * summarized here, full blow-by-blow in DECISIONS.md): Mohammad reported
 * the top of the head clipping under the header on a 24-inch monitor. Root
 * cause at the time: the section's `min-h-*` floor (740px from `xl` up)
 * never grows, but the section's WIDTH — which `object-cover` had to keep
 * covering — grew unboundedly with the raw viewport, so the fixed `62%
 * 36%` vertical crop removed a growing number of *absolute* pixels off the
 * top the wider the viewport got. Three consecutive attempts all tried to
 * COMPENSATE for that unbounded growth by making `object-position` a
 * function of `100vw`: D-079 (3 discrete Tailwind breakpoints — fixed the
 * clipping but visibly jumped at each edge, and over-corrected 1536×864, a
 * real laptop width that was never actually broken), D-080 (one continuous
 * `calc()`/`clamp()` formula — same idea, smoother, but shipped with an
 * inverted sign that went undetected locally and cropped the mouth off
 * once Mohammad's real 24-inch screenshot caught it), D-081 (fixed that
 * specific sign bug with a corrected, empirically-bisected coefficient —
 * worked, but was still fundamentally "guess a function of viewport width
 * and re-tune it every time a new width exposes a new problem").
 *
 * D-082 (2026-08-23, same day) — the actual structural fix: replaced the
 * whole "compensate for the section's ever-growing width" approach with
 * removing the cause of that growth. The image no longer sizes itself
 * against the full `Section` (= the raw viewport). It's wrapped in a
 * `relative mx-auto h-full w-full` frame using `CONTAINER_MAX_WIDTH["2xl"]`
 * — the EXACT SAME fluid max-width the `<Container size="2xl">` below
 * already uses for the text, imported from `container.tsx` rather than a
 * new literal (the same reuse pattern `nav.tsx` already established for
 * `CONTAINER_MAX_WIDTH.xl`). Since `next/image`'s `fill` sizes an image
 * against its nearest positioned ancestor, marking this frame `relative`
 * makes the image's `object-cover` box the FRAME, not the section — the
 * frame's width, not the viewport's, is what `object-position`/
 * `translate-x` now have to reckon with.
 *
 * Why this is the right fix and not another tuning pass: Container's
 * `2xl` size is `clamp(1600px, 940px + 40vw, 2000px)` — width-bound below
 * ~1650px (so at 1440/1536 the frame still equals the full section, byte-
 * for-byte the pre-D-082 behavior, zero regression) and CEILINGED at
 * 2000px beyond that. Once the viewport is wide enough that the clamp's
 * ceiling binds (roughly 2650px+), the frame's width — and therefore the
 * exact crop `object-cover` produces — physically CANNOT keep growing no
 * matter how wide the monitor gets, which is what makes 2560px and 3440px
 * render the identical composition instead of needing their own tuned
 * value. Between ~1650px and ~2650px the frame does still grow somewhat
 * (same clamp ramp), but that's the SAME box the text's own `Container`
 * lives in — both grow together, in lockstep, by construction (same
 * import, same class), so the face's position RELATIVE TO THE TEXT never
 * drifts even while the whole composition breathes slightly with the
 * viewport, exactly Mohammad's own "same relationship as the 14-inch
 * reference" framing. Previously the image (section-sized) and the text
 * (Container-sized) were tracking two DIFFERENT boxes that only happened
 * to coincide below ~1650px — that mismatch was the actual root cause
 * every prior object-position tuning pass was fighting without addressing.
 *
 * With the frame capping how extreme the crop math can ever get, the
 * plain, un-adjusted `object-[62%_36%]` from before the whole D-079–081
 * saga is correct again — confirmed by screenshot at 1920/2560/3440, not
 * assumed. All of D-079/080/081's `calc()`/`clamp()`/`min()`/`max()`
 * object-position machinery is gone.
 *
 * The two overlay layers (left scrim, bottom fade) moved inside the same
 * frame, for the same reason as the image: outside the frame there is no
 * photographic content to protect text legibility against or fade to
 * begin with — that area is already flat `--background` (Section's own
 * `bg-background`, D-070), which is the exact color the fade already
 * targets, so no separate treatment is needed there.
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
        {/* Master composition frame (D-082): the SAME fluid max-width
            `<Container size="2xl">` below uses for the text, so the image's
            own `object-cover` box tracks the text's box in lockstep instead
            of the raw, unboundedly-growing viewport. Below ~1650px this
            equals the section's full width (unchanged from before D-082);
            above it, it grows only as far as Container itself does, capping
            at 2000px — the actual structural fix, not another tuned value.
            `overflow-hidden` here (not just on `Section`) is load-bearing,
            not decorative: `translate-x-*` below shifts the already-sized
            image rightward AFTER `object-cover` sizes it to the frame —
            `getBoundingClientRect()` on the image confirmed its rendered
            box spills up to ~393px past the frame's own right edge at
            `xl`'s 20% translate on a ~1964px-wide frame. Without clipping
            the frame itself, that overshoot painted straight through where
            the right-edge fade below expects the frame to actually end,
            which is what the first version of this fix got wrong — found
            by inspecting the real rendered rects, not assumed fixed by the
            frame's width alone. */}
        <div className={`relative mx-auto h-full w-full overflow-hidden ${CONTAINER_MAX_WIDTH["2xl"]}`}>
          <Image
            src="/images/services-hero.png"
            alt=""
            fill
            priority
            sizes="(min-width: 2000px) 2000px, 100vw"
            className="object-cover object-[62%_36%] md:translate-x-[10%] lg:translate-x-[16%] xl:translate-x-[20%]"
          />
          {/* Left-side scrim — reinforces the dark ground the headline/copy
              sit on. The source photo already fades dark on its own left
              edge, but at the crop windows this frame actually renders
              (object-cover against a much wider-than-1512:1145 box at most
              widths), that dark margin alone isn't reliably wide enough to
              keep body-copy-weight text legible against the brighter
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

          {/* Right-edge bridge fade — found necessary AFTER building the
              D-082 frame above, not part of the original ask: once the
              frame is narrower than the section (>=~1920px), its bare right
              edge was a hard-cut vertical line straight through the image's
              own lit content — exactly the "visible image frame/border"
              this hero's own D-070 brief rules out. `width` is derived from
              the ACTUAL gap the frame leaves — half of (viewport minus the
              frame's own rendered width) — using the identical clamp
              `CONTAINER_MAX_WIDTH["2xl"]` compiles to (duplicated here as a
              literal since a compiled Tailwind class can't be read back out
              as a calc()-usable value; keep the two in sync if that tier's
              tuning ever changes), capped at 420px so it can't balloon on a
              huge monitor. This makes the fade PROVABLY zero-width at the
              1440px reference and below — `clamp(1600px, 940px + 40vw,
              2000px)` there evaluates to >=1440px, so `100vw - clamp(...)`
              is negative, `max(0px, ...)` floors it to exactly `0px`, and a
              0px-wide div renders nothing. Confirmed via screenshot: 1440px
              is unaffected, 1920/2560/3440 no longer show a hard edge. */}
          <div
            aria-hidden="true"
            className="absolute right-0 top-0 h-full"
            style={{
              width: "min(420px, max(0px, (100vw - clamp(1600px, 940px + 40vw, 2000px)) / 2))",
              backgroundImage: "linear-gradient(to right, transparent 0%, var(--color-background) 100%)",
            }}
          />
        </div>
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
