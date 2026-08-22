import { Layers, MoveRight } from "lucide-react";
import { Container, Icon, NavLink, Section, Text } from "../../ui";
import { Reveal } from "../../motion/reveal";

/**
 * Services -> Solutions bridge — Step 5. Short cross-link clarifying the
 * Services/Solutions distinction, not a full repeated section. Copy is
 * reused verbatim from Faq.tsx's existing (already-written) answer to
 * "What's the difference between Services and Solutions?" rather than
 * inventing new phrasing for the same fact.
 */
export function SolutionsBridge() {
  return (
    <Section environment="dark" className="border-t border-border">
      <Container size="lg" className="py-14">
        <Reveal>
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <Icon icon={Layers} size="md" className="mt-0.5 shrink-0 text-text-primary" />
              <Text tone="secondary" size="base" className="max-w-xl">
                Services are individual capabilities, like risk assessments or security awareness
                training. Solutions are packaged levels of protection that combine several
                services together.
              </Text>
            </div>
            <NavLink
              href="/solutions"
              className="flex shrink-0 items-center gap-1.5 text-base text-accent hover:text-accent/80"
            >
              Explore Solutions
              <Icon icon={MoveRight} size="sm" />
            </NavLink>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
