import { Caption, Container, H3, Section, Text } from "../../ui";
import { Reveal } from "../../motion/reveal";

/**
 * Stage Sequence — Step 8. Copy LOCKED verbatim, supplied by Mohammad.
 *
 * Layout: a vertical connecting spine with alternating left/right stage
 * blocks, scaled up from `home/how-we-work.tsx`'s own teaser (same
 * pattern: spine + numbered circle + label) to page-level weight with
 * full paragraph copy instead of a one-liner — the same "reuse the
 * established technique, scale it up for a full page" move Cyber
 * Health's `Flow` already made from `Approach.tsx`'s spine+circles
 * pattern. Vertical (not `Flow`'s horizontal row) because a horizontal
 * chip layout has no room for a 3-sentence paragraph per stage; a
 * horizontal row of 4 wide text blocks with a top spine also doesn't
 * read as connected the way a vertical spine threading through each
 * block does.
 */

interface Stage {
  n: string;
  label: string;
  copy: string;
}

const STAGES: Stage[] = [
  {
    n: "01",
    label: "Understand",
    copy: "We start by learning how your business actually operates, not by running through a generic checklist. That means your systems, your data, your people, and the way work really gets done every day. A recommendation built on a real picture of your environment is worth far more than one built on assumptions.",
  },
  {
    n: "02",
    label: "Prioritize",
    copy: "Every finding is ranked by real risk and real business impact, not just technical severity. You receive a short, clear list of what matters most first, instead of a lengthy report that never gets opened. For a growing business, this is what turns a security review into something you can actually act on.",
  },
  {
    n: "03",
    label: "Protect",
    copy: "We put the right controls in place for what matters most, whether that means a specific service, a policy change, or ongoing monitoring. Our team works alongside yours so nothing is left as advice sitting on a page. This is where the plan becomes real protection.",
  },
  {
    n: "04",
    label: "Improve",
    copy: "Security is not something you set up once and leave alone. We check in on a regular schedule, report on real progress, and adjust as your business and the threats around it change. What worked last year may not be enough this year, and this stage is how we keep pace.",
  },
];

export function StageSequence() {
  return (
    <Section environment="light-blue">
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
                  <div
                    className={
                      alignRight
                        ? "relative flex items-start gap-6 sm:flex-row-reverse sm:text-right"
                        : "relative flex items-start gap-6"
                    }
                  >
                    <span className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-accent bg-background font-data text-sm font-medium text-accent">
                      {stage.n}
                    </span>
                    <div className="pt-1.5 sm:max-w-md">
                      <Caption tone="accent" size="sm">
                        Stage {stage.n}
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
