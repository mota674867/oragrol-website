import { Caption, Container, H2, Section, Text } from "../../ui";
import { Reveal } from "../../motion/reveal";

/**
 * How We Work — Step 4. Same locked 4-stage methodology as Approach, but a
 * deliberately different treatment (brief: "reinforce... through a
 * continuous visual progression") — a connected vertical stepper with
 * alternating alignment, rather than Approach's compact horizontal build.
 * Not four generic cards in either place.
 */

const STAGES = [
  { n: "01", label: "Understand", copy: "Assess the business, environment and current security posture." },
  { n: "02", label: "Prioritize", copy: "Separate critical risks from everything else." },
  { n: "03", label: "Protect", copy: "Apply the right combination of services and expertise." },
  { n: "04", label: "Improve", copy: "Continue strengthening security posture." },
] as const;

export function HowWeWork() {
  return (
    <Section environment="light-blue">
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
                  <div
                    className={
                      alignRight
                        ? "relative flex items-start gap-6 sm:flex-row-reverse sm:text-right"
                        : "relative flex items-start gap-6"
                    }
                  >
                    <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-accent bg-background font-data text-sm text-accent">
                      {stage.n}
                    </span>
                    <div className="pt-1.5">
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
