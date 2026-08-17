import Image from "next/image";
import { Caption, Container, H1, Section, Text } from "../../ui";
import { Reveal } from "../../motion/reveal";
import { GlowEffect } from "../services/glow-effect";

/**
 * Founder Bio — Company page section 1 of 4 (ORAGROL_ABOUT_PAGE_CONTENT_
 * FINAL.md). Doubles as the page's opening — no separate hero headline was
 * supplied in the content brief (unlike every other built page), so per
 * this project's own "don't invent copy" discipline (CLAUDE.md §8),
 * nothing is added above it.
 *
 * Flow, current state (2026-08-17, D-051): name + title only at top (no
 * photo) -> bio paragraphs as a narrative middle column -> a single photo
 * (public/images/founder-mohammad.jpg) beside a pull-quote as the closing
 * beat — the founder's photo now appears exactly once on the page, at the
 * close, not twice. Text unchanged from D-048/D-049.
 *
 * History: D-049 first restructured this section (2-column top-loaded
 * portrait -> identifier/bio/closing-photo flow) and added a second,
 * small circular headshot photo at the top. D-050 fixed that headshot's
 * crop (it was actually a 3/4-body composition mis-cropped into a
 * circle, plus a mis-extensioned PNG-as-.jpg) and redesigned the closing
 * photo — shrunk to ~224px (exactly one-third of its prior 672px stacked
 * width) beside a pull-quote (the bio's own first sentence, quoted
 * verbatim), reusing 21st.dev's "Editorial Testimonial" (id 9637)
 * small-photo-beside-pull-quote pairing per that round's research. D-051
 * (this pass) removes the top headshot entirely per explicit instruction
 * — `founder-mohammad-headshot.png` (D-050's corrected asset) is no
 * longer referenced anywhere in the codebase; left in place, unused,
 * same "kept for a possible revert" convention this project already uses
 * for StrataVisual/SchematicVisual after their own supersessions, rather
 * than deleted.
 *
 * Dark environment, container width, and every other structural decision
 * from D-048/D-049 (why Founder Bio opens Dark, not the brief's
 * "primarily light" framing) are unchanged — out of scope for this round.
 */
export function FounderBio() {
  return (
    <Section environment="dark" className="relative overflow-hidden pt-28 pb-20 md:pt-36 md:pb-28">
      <Container size="lg">
        {/* Top identifier — name + title only, no photo (D-051). */}
        <Reveal>
          <div className="text-center">
            <H1>Mohammad Chelouy Tabrizi</H1>
            <Caption tone="accent" className="mt-3">
              Founder &amp; CEO
            </Caption>
          </div>
        </Reveal>

        {/* Bio — narrative column, reads before the closing beat. */}
        <div className="mx-auto mt-14 max-w-2xl md:mt-20">
          <Reveal delay={0.05}>
            <Text size="lg" tone="primary">
              Mohammad built his first cybersecurity company in Iran in 2012, well before Oragrol
              existed. Running that business, rather than just studying the industry, is where the
              practical, business first approach behind Oragrol actually comes from.
            </Text>
          </Reveal>
          <Reveal delay={0.1}>
            <Text tone="secondary" className="mt-5">
              In the years since, he has spent more than fifteen years in regional market
              expansion, business development, and international operations, including building
              partnerships across Southeast Asia. His academic background includes software
              engineering, an MBA, and a PhD in Management.
            </Text>
          </Reveal>
          <Reveal delay={0.15}>
            <Text tone="secondary" className="mt-5">
              He founded Oragrol Global in Toronto in 2025 to bring that same practical approach to
              businesses across Canada and North America, starting with cybersecurity and building
              a broader technology company around it over time.
            </Text>
          </Reveal>
        </div>

        {/* Closing beat — small photo beside a verbatim pull-quote, not a giant stacked block. */}
        <Reveal delay={0.2}>
          <div className="mx-auto mt-16 max-w-2xl border-t border-border pt-14 md:mt-20">
            <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-center sm:gap-10">
              <div className="relative aspect-[3/4] w-40 shrink-0 sm:w-56">
                <div aria-hidden="true" className="pointer-events-none absolute -inset-4 opacity-40">
                  <GlowEffect blur="strong" />
                </div>
                <div className="relative h-full w-full overflow-hidden rounded-2xl border border-border shadow-xl shadow-accent/20">
                  <Image
                    src="/images/founder-mohammad.jpg"
                    alt="Mohammad Chelouy Tabrizi, Founder & CEO of Oragrol Global"
                    fill
                    sizes="224px"
                    className="object-cover"
                  />
                </div>
              </div>
              <blockquote className="flex-1 text-center sm:text-left">
                <p className="font-heading text-xl font-medium leading-snug text-text-primary sm:text-2xl">
                  &ldquo;Running that business, rather than just studying the industry, is where
                  the practical, business first approach behind Oragrol actually comes from.&rdquo;
                </p>
              </blockquote>
            </div>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
