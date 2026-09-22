"use client";

import { useTranslations } from "next-intl";
import { Caption, cn, Container, H3, Section, Text } from "../../ui";
import { Reveal } from "../../motion/reveal";

/**
 * Stage Sequence — Step 8. Copy LOCKED verbatim, supplied by Mohammad.
 *
 * Connector-line fix (Round 2): Mohammad reported the spine (fixed at a
 * static x-position) doesn't actually pass through the alternating
 * circles, and asked to check this component against `home/how-we-work.tsx`'s
 * own alternating spine, described as handling it correctly. Checked
 * directly before "fixing" anything — measured both components' actual
 * circle vs. spine positions on a live page, not assumed: at 1440px,
 * `home/how-we-work.tsx`'s own circles sit at x=340 (Understand/Protect)
 * and x=1100 (Prioritize/Improve), while its spine sits at x=719-720 —
 * the SAME disconnect Mohammad flagged here, confirmed via screenshot
 * too. The cited reference has the identical bug; copying its exact
 * technique would not have fixed anything. Root cause in both: a fixed-
 * position spine (`left-1/2 -translate-x-1/2`) combined with
 * `sm:flex-row-reverse` alternation, which packs each row's circle+
 * content group toward whichever edge is that row's flex-start — never
 * the actual center where the spine sits.
 *
 * Real fix: circles are now structurally placed in a dedicated CENTER
 * grid column (`sm:grid-cols-[1fr_auto_1fr]`, circle always
 * `sm:col-start-2`) that the spine's own `left-1/2` already targets —
 * the circle is guaranteed to sit on the spine by construction, not by
 * each row happening to size out to the right width. Content occupies
 * the left or right column depending on the stage, alone on its side,
 * text-aligned toward the spine. Mobile (below `sm`) is unaffected —
 * that layout was already correct (single left-aligned column, `flex`,
 * no reversal applies below `sm`, matching the fixed `left-6` spine
 * there) — this only restructures the `sm:` and up layout.
 *
 * Base pattern still credited to `home/how-we-work.tsx`'s teaser /
 * Cyber Health's `Flow` (spine + numbered circle + page-level scale-up
 * for full paragraphs) — only the circle-centering mechanic changes.
 */

interface Stage {
  n: string;
  label: string;
  copy: string;
}

const STAGE_NUMBERS = ["01", "02", "03", "04"];

export function StageSequence() {
  const t = useTranslations("HowWeWork.stages");
  const items = t.raw("items") as { label: string; copy: string }[];
  const STAGES: Stage[] = STAGE_NUMBERS.map((n, i) => ({ n, ...items[i] }));

  return (
    <Section environment="deep-blue" transitionFrom="dark">
      <Container size="md" className="py-24 md:py-32">
        <div className="relative">
          <div
            aria-hidden="true"
            className="absolute bottom-0 left-6 top-0 w-px bg-border sm:left-1/2 sm:-translate-x-1/2"
          />
          <div className="flex flex-col gap-16 md:gap-20">
            {STAGES.map((stage, i) => {
              const alignRight = i % 2 === 1;
              return (
                <Reveal key={stage.n} delay={i * 0.08}>
                  <div className="relative flex items-start gap-6 sm:grid sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-x-10">
                    <span className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-border bg-background font-data text-sm font-medium text-text-primary sm:col-start-2 sm:row-start-1">
                      {stage.n}
                    </span>
                    <div
                      className={cn(
                        "pt-1.5 sm:row-start-1 sm:pt-0",
                        alignRight ? "sm:col-start-3 sm:text-left" : "sm:col-start-1 sm:text-right",
                      )}
                    >
                      <Caption tone="accent" size="sm">
                        {t("stageLabel", { n: stage.n })}
                      </Caption>
                      <H3 className="mt-2">{stage.label}</H3>
                      <Text size="base" tone="secondary" className="mt-3">
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
