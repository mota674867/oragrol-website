import { Caption, Container, DataText, H2, RiskBadge, Section, Text, type RiskTier } from "../../ui";
import { Reveal } from "../../motion/reveal";

/**
 * Output Shape — Step 7. The 6-item output list is LOCKED (same as the
 * Home teaser). Descriptions here are new, generic one-liners — not
 * inventing specifics, pricing, or methodology details.
 *
 * The illustrative report preview reuses the exact score/tier (78,
 * Medium) already approved on the Home teaser — not a new number. The
 * "Top Risks" bars use generic, universally-recognized security domain
 * names (not Oragrol-specific proprietary categories) and are explicitly
 * labeled illustrative, same governance precedent as the teaser's score.
 */

const OUTPUT_ITEMS = [
  { label: "Score", copy: "A single number, 0-100, showing overall security posture." },
  { label: "Risk Tier", copy: "Critical, High, Medium, or Low — the headline read on where you stand." },
  { label: "Executive Summary", copy: "A clear, non-technical overview of what the results actually mean." },
  { label: "Top Risks", copy: "The specific issues that matter most, ranked by priority." },
  { label: "Recommended Package", copy: "Which Oragrol solution level fits, based on the results." },
  { label: "Next Steps", copy: "A practical, prioritized plan for what to do first." },
];

interface RiskExample {
  label: string;
  tier: RiskTier;
  fillPercent: number;
}

const RISK_EXAMPLES: RiskExample[] = [
  { label: "Access Control", tier: "high", fillPercent: 70 },
  { label: "Patch Management", tier: "medium", fillPercent: 50 },
  { label: "Employee Training", tier: "medium", fillPercent: 45 },
  { label: "Backup & Recovery", tier: "low", fillPercent: 25 },
];

const riskFillClasses: Record<RiskTier, string> = {
  critical: "bg-risk-critical",
  high: "bg-risk-high",
  medium: "bg-risk-medium",
  low: "bg-risk-low",
};

export function OutputShape() {
  return (
    <Section environment="deep-blue">
      <Container size="lg" className="py-24 md:py-32">
        <Reveal>
          <Caption tone="accent">What you get</Caption>
        </Reveal>
        <Reveal delay={0.05}>
          <H2 className="mt-4 max-w-xl">A report built to be acted on, not filed away.</H2>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 gap-16 lg:grid-cols-[1fr_1fr] lg:items-start">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            {OUTPUT_ITEMS.map((item, i) => (
              <Reveal key={item.label} delay={i * 0.06}>
                <div>
                  <h3 className="font-heading text-base font-semibold text-text-primary">
                    {item.label}
                  </h3>
                  <Text size="sm" tone="secondary" className="mt-2">
                    {item.copy}
                  </Text>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.2}>
            <div className="rounded-2xl border border-border bg-surface p-8">
              <Caption tone="muted">Illustrative example — not a real result</Caption>
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

              <div className="mt-8 flex flex-col gap-4 border-t border-border pt-6">
                <Text size="sm" tone="secondary">
                  Top risks (example)
                </Text>
                {RISK_EXAMPLES.map((risk) => (
                  <div key={risk.label}>
                    <div className="flex items-center justify-between">
                      <Text size="sm" tone="primary">
                        {risk.label}
                      </Text>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-background">
                      <div
                        className={`h-full rounded-full ${riskFillClasses[risk.tier]}`}
                        style={{ width: `${risk.fillPercent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
