import { ArrowRight, ClipboardList, FileText, Gauge, ListChecks, Search, Send } from "lucide-react";
import { Badge, Caption, Container, DataText, H2, Icon, RiskBadge, Section, Text, ButtonLink } from "../../ui";
import { Reveal } from "../../motion/reveal";

/**
 * Cyber Health — Step 4. Flagship section (brief section 11): the 42
 * Questions → ... → Sales follow-up flow, and the score/report output
 * shape, are LOCKED content. This is a Home-page teaser/preview, not the
 * actual 42-question flow (that's the dedicated Cyber Health page, later
 * build phase). The score shown is an explicit illustrative mock, labeled
 * as such — not a real result or a claim about any customer.
 */

const FLOW_STEPS = [
  { label: "42 Questions", icon: ClipboardList },
  { label: "Analysis", icon: Search },
  { label: "Cyber Health Score", icon: Gauge },
  { label: "Risk Priorities", icon: ListChecks },
  { label: "Action Plan", icon: FileText },
  { label: "Professional Report", icon: FileText },
  { label: "Sales Follow-up", icon: Send },
];

export function CyberHealth() {
  return (
    <Section environment="dark" transitionFrom="deep-blue">
      <Container size="xl" className="py-24 md:py-32">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <Reveal>
              <Caption tone="accent">The Cyber Health Platform</Caption>
            </Reveal>
            <Reveal delay={0.05}>
              <H2 className="mt-4 max-w-lg">Know your Cyber Health Score in minutes.</H2>
            </Reveal>
            <Reveal delay={0.1}>
              <Text tone="secondary" size="lg" className="mt-6 max-w-md">
                A focused set of questions. A clear score. A practical plan for what to do next —
                Oragrol&rsquo;s flagship diagnostic, built to feel like a premium security tool,
                not a generic form.
              </Text>
            </Reveal>
            <Reveal delay={0.15}>
              <ButtonLink href="/cyber-health" variant="primary" size="lg" className="mt-8">
                Get Your Cyber Health Score
              </ButtonLink>
            </Reveal>

            <Reveal delay={0.2}>
              <ol className="mt-14 flex flex-wrap items-center gap-x-2 gap-y-4">
                {FLOW_STEPS.map((step, i) => (
                  <li key={step.label} className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5">
                      <Icon icon={step.icon} size="sm" className="text-text-primary" />
                      <span className="font-body text-xs font-medium text-text-secondary">
                        {step.label}
                      </span>
                    </span>
                    {i < FLOW_STEPS.length - 1 && (
                      <Icon icon={ArrowRight} size="sm" className="text-text-muted" aria-hidden />
                    )}
                  </li>
                ))}
              </ol>
            </Reveal>
          </div>

          <Reveal delay={0.15}>
            <div className="rounded-2xl border border-border bg-surface p-8">
              <Caption tone="muted">Illustrative preview — not a real result</Caption>
              <div className="mt-4 flex items-baseline gap-2">
                <DataText size="xl" tone="accent">
                  78
                </DataText>
                <DataText size="lg" tone="secondary">
                  /100
                </DataText>
              </div>
              <div className="mt-4">
                <RiskBadge tier="medium" />
              </div>
              <div className="mt-8 flex flex-col gap-3 border-t border-border pt-6">
                <Text size="sm" tone="secondary">Sample report includes</Text>
                <div className="flex flex-wrap gap-2">
                  {["Executive Summary", "Score", "Risk Tier", "Top Risks", "Recommended Package", "Next Steps"].map(
                    (item) => (
                      <Badge key={item} tone="neutral">
                        {item}
                      </Badge>
                    ),
                  )}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
