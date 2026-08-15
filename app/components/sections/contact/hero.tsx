import { Caption, Container, H1, Section, Text } from "../../ui";
import { Reveal } from "../../motion/reveal";

/**
 * Contact Hero — Step 12. Headline is the exact line already locked in
 * `PROJECT_MASTER.md`'s Step 12 brief ("Let's make security clearer.") —
 * not new copy. The rest of that brief's original outline (a generic
 * Name/Business email/Company/Company size/Message form, plus a "Book a
 * consultation" CTA) is superseded by Mohammad's later, more specific
 * two-path instruction below — no booking flow exists anywhere in this
 * project to link a "Book a consultation" CTA to, so it's intentionally
 * dropped rather than invented, same reasoning as every other
 * no-real-destination gap this project flags instead of guessing.
 *
 * Dark environment, same SiteHeader-contrast reasoning as every other
 * page's opening section.
 */
export function ContactHero() {
  return (
    <Section environment="dark">
      <Container size="lg" className="py-24 md:py-32">
        <Reveal>
          <Caption tone="accent">Contact</Caption>
        </Reveal>
        <Reveal delay={0.05}>
          <H1 className="mt-4 max-w-2xl">Let&rsquo;s make security clearer.</H1>
        </Reveal>
        <Reveal delay={0.1}>
          <Text tone="secondary" size="lg" className="mt-6 max-w-xl">
            Whether you&rsquo;re exploring Oragrol for the first time or already a client who needs
            us now, there&rsquo;s a direct path below — no generic contact form in between.
          </Text>
        </Reveal>
      </Container>
    </Section>
  );
}
