import { Clock, FileCheck, Sparkles, UserX } from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import { Container, Icon, Section, Text } from "../../ui";
import { Reveal } from "../../motion/reveal";

/**
 * Reassurance strip — Step 7. All four facts here were confirmed directly
 * from the live assessment (https://tally.so/r/2EzROb) at build time, not
 * invented: completion time, no-commitment framing, AI-generated
 * suggestions, and the executive PDF report are all stated on the form
 * itself.
 */

interface Point {
  copy: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

const POINTS: Point[] = [
  { copy: "5-7 minutes to complete", icon: Clock },
  { copy: "No commitment required", icon: UserX },
  { copy: "AI-generated, tailored suggestions", icon: Sparkles },
  { copy: "Executive PDF report included", icon: FileCheck },
];

export function Reassurance() {
  return (
    <Section environment="white" className="border-t border-border">
      <Container size="lg" className="py-14">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {POINTS.map((point, i) => (
            <Reveal key={point.copy} delay={i * 0.06}>
              <div className="flex items-center gap-3">
                <Icon icon={point.icon} size="md" className="shrink-0 text-accent" />
                <Text size="sm" tone="secondary">
                  {point.copy}
                </Text>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
