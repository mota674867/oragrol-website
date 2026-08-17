import { Caption, Container, H1, Section, Text } from "../../ui";
import { Reveal } from "../../motion/reveal";

/**
 * Resources Hero — Step 10. No page-level hero copy was supplied in
 * ORAGROL_RESOURCES_ALL_ARTICLES_FINAL.md (that file gives per-article
 * copy only) — flagged rather than invented marketing language, per
 * CLAUDE.md §8. The subhead below is grounded directly in the source
 * file's own explicit "Positioning" note ("Cybersecurity-first for
 * Canadian SMBs") rather than new claims; it describes what the page
 * actually contains, adds no statistics/credentials/promises.
 *
 * Dark environment — same reasoning as every other page's entry section
 * (see company/founder-bio.tsx's own comment, services/hero.tsx's
 * original one): SiteHeader assumes a Dark entry section.
 */
export function ResourcesHero() {
  return (
    <Section environment="dark" className="pt-28 pb-16 md:pt-36 md:pb-20">
      <Container size="lg">
        <Reveal>
          <Caption tone="accent">Resources</Caption>
        </Reveal>
        <Reveal delay={0.05}>
          <H1 className="mt-4 max-w-2xl">Practical cybersecurity guidance for Canadian businesses.</H1>
        </Reveal>
        <Reveal delay={0.1}>
          <Text tone="secondary" size="lg" className="mt-6 max-w-2xl">
            Cybersecurity-first guidance, written plainly and grounded in Oragrol&rsquo;s Cyber
            Health Assessment and recognized Canadian security guidance &mdash; not vague advice,
            not invented statistics.
          </Text>
        </Reveal>
      </Container>
    </Section>
  );
}
