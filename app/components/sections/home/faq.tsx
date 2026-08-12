import { ChevronDown } from "lucide-react";
import { Caption, Container, H2, Icon, Section } from "../../ui";
import { Reveal } from "../../motion/reveal";

/**
 * FAQ — Step 4. Categories are locked (brief section 17); no exact Q&A copy
 * was supplied, so the entries below are a draft, conversational first
 * pass — flagged for review. The pricing entry deliberately stays within
 * the sanctioned "being finalized" language rather than stating figures.
 *
 * Native <details>/<summary> — zero-JS, accessible-by-default disclosure,
 * no client component needed for this section.
 */

const FAQ_ITEMS = [
  {
    q: "What is the Cyber Health Assessment?",
    a: "A focused set of questions about your business and environment that produces a clear Cyber Health Score, your key risk priorities, and a practical next-step plan.",
  },
  {
    q: "What's the difference between Services and Solutions?",
    a: "Services are individual capabilities, like risk assessments or security awareness training. Solutions are packaged levels of protection that combine several services together.",
  },
  {
    q: "How does Oragrol decide what to prioritize?",
    a: "We follow a consistent approach — Understand, Prioritize, Protect, Improve — so recommendations are based on your actual risk, not a generic checklist.",
  },
  {
    q: "How much do Oragrol's solutions cost?",
    a: "Our packaged solutions are currently being finalized. Get in touch and we'll walk you through options based on your business.",
  },
  {
    q: "Can Oragrol help with compliance?",
    a: "Yes — our Risk Assessment & Compliance service helps you understand where you stand against the frameworks relevant to your business.",
  },
  {
    q: "How do I get started?",
    a: "The fastest way is to get your Cyber Health Score. It takes a few minutes and gives us a clear starting point for the conversation.",
  },
];

export function Faq() {
  return (
    <Section environment="light-blue">
      <Container size="md" className="py-24 md:py-32">
        <Reveal>
          <Caption tone="accent">Frequently Asked</Caption>
        </Reveal>
        <Reveal delay={0.05}>
          <H2 className="mt-4">Questions, answered plainly.</H2>
        </Reveal>

        <div className="mt-12 flex flex-col divide-y divide-border border-t border-border">
          {FAQ_ITEMS.map((item, i) => (
            <Reveal key={item.q} delay={i * 0.05}>
              <details className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-heading text-base font-semibold text-text-primary marker:content-none [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <Icon
                    icon={ChevronDown}
                    size="sm"
                    className="shrink-0 text-text-secondary transition-transform duration-200 group-open:rotate-180"
                  />
                </summary>
                <p className="mt-3 max-w-2xl font-body text-sm leading-relaxed text-text-secondary">
                  {item.a}
                </p>
              </details>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
