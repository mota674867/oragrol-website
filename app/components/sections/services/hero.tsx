import { CONTAINER_MAX_WIDTH, H1, Section, Text } from "../../ui";
import { Reveal } from "../../motion/reveal";
import { GlowEffect } from "./glow-effect";
import { HeroSchematicVisual } from "./hero-schematic-visual";
import { ServicesNetworkVisual } from "./network-visual";

/**
 * Services Hero — Services Landing Page, visual-correction pass (2026-08-22
 * follow-up to D-072), plus a same-day follow-up correction: the logo +
 * "Services" badge that used to sit above the headline are gone — the main
 * site nav already carries the ORAGROL logo, so repeating it inside the
 * hero was flagged as an unwanted duplicate, and the badge went with it
 * (no replacement label/eyebrow/marker — the hero now opens directly on
 * the H1). Real regression caught before shipping: that logo+badge stack's
 * own height had been the hero's only effective top clearance beneath
 * `SiteHeader` (`fixed`, not in normal flow — every page independently
 * reserves `--header-height`, 116px, see tokens.css). Removing them without
 * compensating made the H1 render under the fixed header on mobile,
 * confirmed via screenshot. Fixed the same way D-067 fixed the identical
 * bug class on Home: the wrapper's own `pt-*` now derives from
 * `calc(var(--header-height) + Nrem)` instead of a guessed flat value. D-072's version wrapped the whole hero in a large rounded,
 * `bg-surface/40` card with a full-panel `GlowEffect` washed in the accent
 * family at 25% opacity — read as "brown/orange card," the thing the first
 * correction pass removed. Composition reference: an external image (dark
 * ground, large two-tier headline + short description on the left, one
 * large visual bleeding toward the frame's own edge on the right,
 * restrained warm rim-light on the visual only) — used for COMPOSITION
 * only: brand, content, colors, typography, and the visual itself are all
 * ORAGROL's own (current D-068 palette; the brief re-quoted the pre-D-068
 * retired hex values a third time — flagged again, proceeding on the
 * authoritative tokens.css palette per standing precedent).
 *
 * No rounded card, no panel-wide accent wash. The row itself sits directly
 * on the section's own dark ground; only the visual half carries any glow,
 * and only in two small, deliberately restrained doses (ambient depth +
 * one tight accent rim) — "strategic accent," not a background color.
 *
 * Composition mechanics (no absolute-positioning hacks): a single CSS grid
 * row, `1fr` text / `1.3fr` visual, with zero right padding on the visual
 * side at `lg`+ so it can extend to the row's own right edge — the row
 * itself stays capped at the same fluid `2xl` container width (imported
 * from `CONTAINER_MAX_WIDTH`, not a duplicated literal) the rest of the
 * page uses, so this doesn't reopen the wide-viewport alignment issue a
 * prior session fixed. `overflow-x-clip` on the row guards against the
 * glow's own scale/blur poking past the true viewport edge on ultra-wide
 * screens without touching vertical bleed.
 *
 * Content is the same approved Services copy this page already had (see
 * git history) — not rewritten, not re-architected.
 *
 * Visual: no new illustration system. `HeroSchematicVisual` (dot-grid
 * ground + hub/connector schematic, D-012/D-013's own hero-scale variant)
 * is the dominant foreground layer; `ServicesNetworkVisual` (D-008/D-015)
 * is reused a second time, scaled up and set to near-transparent, as a
 * faint secondary layer behind it — real depth/layering from combining two
 * existing components, not a hand-drawn new one. `GlowEffect` appears
 * twice: once at its shared Deep-Blue "ambient depth" default (D-068/D-069
 * — untouched here), once with an explicit small, tightly-scoped accent
 * override for the one deliberate warm highlight the brief asks for.
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
        <div className="grid grid-cols-1 items-center gap-y-16 lg:grid-cols-[1fr_1.3fr] lg:gap-x-10">
          <div>
            <Reveal>
              <H1 size="xl" className="max-w-xl">
                Ten categories. One coordinated approach.
              </H1>
            </Reveal>
            <Reveal delay={0.06}>
              <Text tone="secondary" size="lg" className="mt-8 max-w-lg">
                Every service exists to answer one question: what does this business actually need
                to protect, and what&apos;s the most direct way to protect it. Explore what each
                category covers below.
              </Text>
            </Reveal>
          </div>

          <Reveal delay={0.2}>
            <div className="relative isolate flex min-h-[340px] w-full items-center justify-center sm:min-h-[420px] lg:min-h-[560px]">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -right-2 top-0 select-none font-data text-[10rem] font-bold leading-none text-white/[0.035] sm:text-[13rem] lg:-right-6 lg:text-[16rem]"
              >
                10
              </span>

              {/* Ambient depth — shared Deep-Blue default, restrained. */}
              <GlowEffect blur="strongest" className="opacity-[0.22]" style={{ transform: "scale(1.3)" }} />

              {/* One deliberate, tightly-scoped warm highlight — strategic
                  accent, not a panel wash: small footprint, low opacity. */}
              <GlowEffect
                blur="strong"
                className="absolute left-1/2 top-1/2 h-2/3 w-2/3 -translate-x-1/2 -translate-y-1/2 opacity-[0.16]"
                colors={["var(--color-accent-light)", "var(--color-accent)"]}
              />

              {/* Secondary layered field — the same network illustration
                  used elsewhere on this page, scaled up and near-transparent,
                  giving genuine depth behind the primary schematic without
                  inventing new artwork. */}
              <ServicesNetworkVisual className="pointer-events-none absolute inset-0 h-full w-full scale-125 opacity-[0.07]" />

              <HeroSchematicVisual className="relative z-10 h-full max-h-[420px] w-auto max-w-full sm:max-h-[480px] lg:max-h-[560px]" />
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
