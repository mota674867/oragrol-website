import { Caption, Container, H2, Section, Text } from "../../ui";
import { Reveal } from "../../motion/reveal";

/**
 * Security Challenge — Step 4. Structure/tone from the brief ("present the
 * business/security problem clearly... editorial typography, restrained
 * visual tension, abstract/architectural graphics rather than stock cyber
 * imagery"); no exact copy was locked, so the copy below is a draft framing
 * of the problem, not commercial/claims content — flagged for review in the
 * Step 4 report. No stats, no invented claims.
 */

const PROBLEM_POINTS = [
  "Security decisions get made reactively, after something forces the issue — not strategically, ahead of it.",
  "Risk is spread across tools, vendors and spreadsheets with no single clear picture.",
  "Most teams don't have the time or in-house expertise to know what actually matters most.",
];

export function SecurityChallenge() {
  return (
    <Section environment="white" className="relative overflow-hidden">
      {/* restrained architectural graphic — thin outline slab, not stock imagery */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 top-0 hidden h-[420px] w-[420px] border border-border/60 lg:block"
        style={{ clipPath: "polygon(15% 0, 100% 10%, 85% 100%, 0 85%)" }}
      />

      <Container size="lg" className="relative py-24 md:py-32">
        <Reveal>
          <Caption tone="accent">The Challenge</Caption>
        </Reveal>
        <Reveal delay={0.05}>
          <H2 className="mt-4 max-w-2xl">
            Most businesses don&rsquo;t know where they&rsquo;re exposed until something forces
            them to find out.
          </H2>
        </Reveal>
        <Reveal delay={0.1}>
          <Text tone="secondary" size="lg" className="mt-6 max-w-xl">
            Security often gets attention only after an incident, an audit, or a client
            requirement forces the issue. By then, the cost of finding out is much higher than
            the cost of knowing in advance.
          </Text>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 gap-8 border-t border-border pt-10 md:grid-cols-3">
          {PROBLEM_POINTS.map((point, i) => (
            <Reveal key={point} delay={0.1 + i * 0.08}>
              <div className="flex flex-col gap-3">
                <span className="font-data text-sm text-text-muted">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <Text size="base">{point}</Text>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
