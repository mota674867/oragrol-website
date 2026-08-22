import { ClipboardList, FileText, Gauge, ListChecks, Search, Send } from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import { Caption, Container, H2, Icon, Section, Text } from "../../ui";
import { Reveal } from "../../motion/reveal";

/**
 * The Flow — Step 7. Same LOCKED 7-step sequence as the Home teaser
 * (CyberHealth.tsx), given full page-level visual weight instead of
 * compact pill-chips. Layout pattern reused from Approach.tsx (connecting
 * spine + numbered circles), extended from 4 to 7 items — grid-cols-7
 * isn't in the shared Grid component's column map, so this hand-writes
 * the grid classes directly, same as Approach.tsx already does for its
 * own irregular (4) column count rather than fighting the shared
 * component's fixed lookup.
 */

interface FlowStep {
  n: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

const FLOW_STEPS: FlowStep[] = [
  { n: "01", label: "42 Questions", icon: ClipboardList },
  { n: "02", label: "Analysis", icon: Search },
  { n: "03", label: "Cyber Health Score", icon: Gauge },
  { n: "04", label: "Risk Priorities", icon: ListChecks },
  { n: "05", label: "Action Plan", icon: FileText },
  { n: "06", label: "Professional Report", icon: FileText },
  { n: "07", label: "Sales Follow-up", icon: Send },
];

export function Flow() {
  return (
    <Section environment="dark">
      <Container size="xl" className="py-24 md:py-32">
        <Reveal>
          <Caption tone="accent">The flow</Caption>
        </Reveal>
        <Reveal delay={0.05}>
          <H2 className="mt-4 max-w-xl">From questions to a practical plan.</H2>
        </Reveal>
        <Reveal delay={0.1}>
          <Text tone="secondary" size="lg" className="mt-6 max-w-xl">
            One focused question at a time. No dashboards to learn, no jargon to decode.
          </Text>
        </Reveal>

        <div className="relative mt-16">
          {/* Spine only shows at lg, where all 7 steps sit in a single row
              (grid-cols-7) — at narrower breakpoints items wrap onto
              multiple rows and a flat line wouldn't align with the
              second/third row's circles. */}
          <div
            aria-hidden="true"
            className="absolute left-0 right-0 top-6 hidden h-px bg-border lg:block"
          />
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 md:grid-cols-4 md:gap-6 lg:grid-cols-7">
            {FLOW_STEPS.map((step, i) => (
              <Reveal key={step.n} delay={i * 0.06}>
                <div className="relative flex flex-col gap-3">
                  <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border border-border bg-background">
                    <Icon icon={step.icon} size="md" className="text-text-primary" />
                  </div>
                  <div>
                    <span className="font-data text-xs text-text-muted">{step.n}</span>
                    <h3 className="mt-1 font-heading text-sm font-semibold text-text-primary">
                      {step.label}
                    </h3>
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
