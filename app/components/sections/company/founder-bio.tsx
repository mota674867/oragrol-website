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
 * Restructured (2026-08-17, on request) from the original 2-column
 * "large photo | name+bio" layout into a narrative flow: a small photo
 * identifier (headshot, public/images/founder-mohammad-headshot.jpg) up
 * top alongside the name/title only, the bio text reading through the
 * middle as a single narrative column, then the original large-format
 * photo (public/images/founder-mohammad.jpg) reappearing at the end as
 * a deliberate closing visual — not a top-loaded portrait anymore. Text
 * content is byte-identical to the prior version; only the structure
 * changed.
 *
 * Dark environment — unchanged from the prior version, still a deliberate
 * exception to PROJECT_MASTER.md's now-superseded Step 11 outline
 * ("primarily light section"), flagged rather than silent: SiteHeader is
 * hardcoded env-dark with only a 30%-opacity dark wash before ~140px of
 * scroll (its own comment: "Once light-first pages exist, this should
 * read the entry section's environment instead of assuming Dark" — not
 * done, out of scope here). Opening on White/Light-blue would put the
 * header's white nav text on a near-white page background at scroll
 * position 0 — every page built so far opens Dark for exactly this reason
 * (see services/hero.tsx's own comment, same reasoning). The remaining 3
 * of 4 sections below (Mission, Team, Values) are White/Light-blue,
 * honoring the "primarily light" spirit everywhere it's safe to.
 *
 * The closing photo keeps the same premium treatment as before (a soft
 * ambient GlowEffect behind the frame, reusing the same accent-family
 * "light-based depth" material as Services' CapabilitySpotlight, D-013)
 * — now given more width as the section's deliberate final beat rather
 * than splitting the layout with text. The origin-story paragraph still
 * renders at a larger "lede" size — unchanged from the prior version,
 * purely typographic, the text itself unreworded/verbatim.
 *
 * The small top headshot is `alt=""` (decorative) rather than repeating
 * the same descriptive text a second time — the adjacent H1 already
 * announces the name to screen readers, and doubling it up on both
 * images in the same section would be redundant, not more accessible.
 * The large closing photo keeps the full descriptive alt text, since by
 * that point in the page it's the only image announcing who this is.
 */
export function FounderBio() {
  return (
    <Section environment="dark" className="relative overflow-hidden pt-28 pb-20 md:pt-36 md:pb-28">
      <Container size="lg">
        {/* Top identifier — small photo + name + title only. */}
        <Reveal>
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="relative h-20 w-20 overflow-hidden rounded-full border border-border shadow-lg shadow-accent/20 sm:h-24 sm:w-24">
              <Image
                src="/images/founder-mohammad-headshot.jpg"
                alt=""
                fill
                sizes="96px"
                priority
                className="object-cover"
              />
            </div>
            <div>
              <H1>Mohammad Chelouy Tabrizi</H1>
              <Caption tone="accent" className="mt-3">
                Founder &amp; CEO
              </Caption>
            </div>
          </div>
        </Reveal>

        {/* Bio — narrative column, reads before the closing photo. */}
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

        {/* Closing visual — the large-format photo, now the section's final beat. */}
        <Reveal delay={0.2}>
          <div className="relative mx-auto mt-16 aspect-[3/4] w-full max-w-2xl md:mt-24">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-8 opacity-40"
            >
              <GlowEffect blur="strongest" />
            </div>
            <div className="relative h-full w-full overflow-hidden rounded-3xl border border-border shadow-2xl shadow-accent/20">
              <Image
                src="/images/founder-mohammad.jpg"
                alt="Mohammad Chelouy Tabrizi, Founder & CEO of Oragrol Global"
                fill
                sizes="(min-width: 768px) 42rem, 90vw"
                className="object-cover"
              />
            </div>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
