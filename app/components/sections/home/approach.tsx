import { Compass, ShieldCheck, SlidersHorizontal, TrendingUp } from "lucide-react";
import { Caption, Container, H2, Icon, Section, Text } from "../../ui";
import { Reveal } from "../../motion/reveal";

/**
 * Oragrol Approach — Step 4. Methodology labels and one-liners are LOCKED
 * verbatim from the brief. Presented as "one evolving visual system" that
 * builds progressively (staggered reveal + accumulating fill on the stage
 * markers), explicitly not four identical/generic cards.
 */

const STAGES = [
  { n: "01", label: "Understand", copy: "Assess the business, environment and current security posture.", icon: Compass },
  { n: "02", label: "Prioritize", copy: "Separate critical risks from everything else.", icon: SlidersHorizontal },
  { n: "03", label: "Protect", copy: "Apply the right combination of services and expertise.", icon: ShieldCheck },
  { n: "04", label: "Improve", copy: "Continue strengthening security posture.", icon: TrendingUp },
] as const;

// deep-blue (D-068): rhythm variation on Home's long section stack — was
// already dark by default; promoted for "supporting depth" alternation.
export function Approach() {
  return (
    <Section environment="deep-blue" transitionFrom="dark">
      <Container size="lg" className="py-24 md:py-32">
        <Reveal>
          <Caption tone="accent">The Oragrol Approach</Caption>
        </Reveal>
        <Reveal delay={0.05}>
          <H2 className="mt-4 max-w-xl">A continuous approach, not a one-time fix.</H2>
        </Reveal>

        <div className="relative mt-20">
          {/* connecting spine — the "one evolving visual system" */}
          <div
            aria-hidden="true"
            className="absolute left-0 right-0 top-6 hidden h-px bg-border md:block"
          />
          <div className="grid grid-cols-1 gap-10 md:grid-cols-4 md:gap-6">
            {STAGES.map((stage, i) => (
              <Reveal key={stage.n} delay={i * 0.12}>
                <div className="relative flex flex-col gap-4">
                  <div
                    className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border transition-colors"
                    style={{
                      borderColor: "var(--color-accent)",
                      backgroundColor: `color-mix(in srgb, var(--color-accent) ${(i + 1) * 22}%, transparent)`,
                    }}
                  >
                    <Icon icon={stage.icon} size="md" className="text-white" />
                  </div>
                  <div>
                    <span className="font-data text-xs text-text-muted">{stage.n}</span>
                    <h3 className="mt-1 font-heading text-xl font-semibold text-text-primary">
                      {stage.label}
                    </h3>
                    <Text size="sm" tone="secondary" className="mt-2">
                      {stage.copy}
                    </Text>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
