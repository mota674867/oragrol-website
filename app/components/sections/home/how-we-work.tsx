import { Caption, cn, Container, H2, Section, Text } from "../../ui";
import { Reveal } from "../../motion/reveal";

/**
 * How We Work — Step 4. Same locked 4-stage methodology as Approach, but a
 * deliberately different treatment (brief: "reinforce... through a
 * continuous visual progression") — a connected vertical stepper with
 * alternating alignment, rather than Approach's compact horizontal build.
 * Not four generic cards in either place.
 *
 * Connector-line fix: this component was found (2026-08-14, while fixing
 * the same bug on the new How We Work page, D-037) to have the identical
 * defect Mohammad reported there — the spine sat at a fixed x-position
 * (`left-1/2 -translate-x-1/2`) while `sm:flex-row-reverse` alternation
 * packed each row's circle toward that row's own flex-start edge
 * (alternating left/right), never toward the spine's actual center.
 * Confirmed via direct measurement before this fix: circles at x=340/1100
 * at 1440px, spine at x=720 — never aligned. Same real fix applied here
 * as the How We Work page: circle is now explicitly placed in a CSS Grid
 * center column (`sm:col-start-2`) that the spine's own `left-1/2`
 * already targets, guaranteed by construction rather than incidental row
 * width. Mobile (below `sm`) unaffected — that layout was already
 * correct (single left-aligned column, no reversal applies there).
 */

const STAGES = [
  { n: "01", label: "Understand", copy: "Assess the business, environment and current security posture." },
  { n: "02", label: "Prioritize", copy: "Separate critical risks from everything else." },
  { n: "03", label: "Protect", copy: "Apply the right combination of services and expertise." },
  { n: "04", label: "Improve", copy: "Continue strengthening security posture." },
] as const;

export function HowWeWork() {
  return (
    <Section environment="deep-blue">
      <Container size="md" className="py-24 md:py-32">
        <Reveal>
          <Caption tone="accent">How We Work</Caption>
        </Reveal>
        <Reveal delay={0.05}>
          <H2 className="mt-4 max-w-lg">A methodology that scales with your business.</H2>
        </Reveal>

        <div className="relative mt-16">
          <div
            aria-hidden="true"
            className="absolute bottom-0 left-[19px] top-0 w-px bg-border sm:left-1/2 sm:-translate-x-1/2"
          />
          <div className="flex flex-col gap-12">
            {STAGES.map((stage, i) => {
              const alignRight = i % 2 === 1;
              return (
                <Reveal key={stage.n} delay={i * 0.1}>
                  <div className="relative flex items-start gap-6 sm:grid sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-x-10">
                    <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-background font-data text-sm text-text-primary sm:col-start-2 sm:row-start-1">
                      {stage.n}
                    </span>
                    <div
                      className={cn(
                        "pt-1.5 sm:row-start-1 sm:pt-0",
                        alignRight ? "sm:col-start-3 sm:text-left" : "sm:col-start-1 sm:text-right",
                      )}
                    >
                      <h3 className="font-heading text-xl font-semibold text-text-primary">
                        {stage.label}
                      </h3>
                      <Text size="base" tone="secondary" className="mt-2 max-w-sm">
                        {stage.copy}
                      </Text>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </Container>
    </Section>
  );
}
