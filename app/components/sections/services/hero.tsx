import Image from "next/image";
import { CONTAINER_MAX_WIDTH, H1, Section, Text } from "../../ui";
import { Reveal } from "../../motion/reveal";

/**
 * Services Hero — extended-background visual swap (2026-08-22), on top of
 * the "face image implementation" pass. Mohammad supplied
 * `public/images/services-hero.png` (1512x1145, landscape) as a
 * finished, already-outpainted version of the previous portrait crop
 * (`services-hero-visual.jpg`, 457x618) — background extended outward on
 * all sides (dark fade left, warm amber/orange fade right and bottom),
 * face/lighting/mechanical detail unchanged. Produced outside this
 * codebase and handed over as a finished file per Mohammad's own
 * instruction, after this session's attempt to run Adobe's
 * `image_generative_expand` tool was blocked (no whitelisted URL for the
 * source image, and the local-file upload path was denied by this
 * environment's own safety classifier) — surfaced to Mohammad rather than
 * worked around, and he opted to produce the asset separately instead.
 *
 * Only the image swaps: same layout, same headline/copy, same nav/
 * structure. The container's aspect ratio changes from the old crop's
 * portrait `457:618` to this file's native landscape `1512:1145`
 * (~1.32:1) — `aspect-[1512/1145]`, `w-full` (fills the grid column,
 * height auto-derives from the ratio) rather than the previous
 * height-capped/width-auto sizing that portrait crop needed. A landscape
 * image in this landscape-ish `1.3fr` track doesn't risk the runaway
 * height a portrait image would at ultra-wide viewports, so no height cap
 * is needed to keep the hero from growing excessively tall — confirmed via
 * screenshot at 1440/1920/2560px, not assumed from the math alone.
 * `object-cover` kept for parity with the rest of the codebase's image
 * pattern (founder-bio.tsx); since the box always matches the image's own
 * ratio, cover never actually crops anything.
 *
 * No card, no border, no background panel around the image — it sits
 * directly on the section's own dark ground. Everything else from the
 * prior pass is untouched: logo/badge removal (D-074), the
 * `calc(var(--header-height) + Nrem)` clearance fix, and the shortened
 * supporting copy.
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
            <div className="relative aspect-[1512/1145] w-full">
              <Image
                src="/images/services-hero.png"
                alt=""
                fill
                priority
                sizes="(min-width: 1024px) 55vw, 100vw"
                className="object-cover"
              />
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
