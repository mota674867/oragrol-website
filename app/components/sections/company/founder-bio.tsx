import Image from "next/image";
import { Caption, Container, H1, Section, Text } from "../../ui";
import { Reveal } from "../../motion/reveal";
import { GlowEffect } from "../services/glow-effect";

/**
 * Founder Bio — Company page section 1 of 4 (ORAGROL_ABOUT_PAGE_CONTENT_
 * FINAL.md). Doubles as the page's opening — no separate hero headline was
 * supplied in the content brief (unlike every other built page), so per
 * this project's own "don't invent copy" discipline (CLAUDE.md §8),
 * nothing is added above it: the founder's real photo + name/title carry
 * the page's opening weight instead.
 *
 * Dark environment — a deliberate exception to PROJECT_MASTER.md's
 * now-superseded Step 11 outline ("primarily light section"), flagged
 * rather than silent: SiteHeader is hardcoded env-dark with only a
 * 30%-opacity dark wash before ~140px of scroll (its own comment:
 * "Once light-first pages exist, this should read the entry section's
 * environment instead of assuming Dark" — not done, out of scope here).
 * Opening on White/Light-blue would put the header's white nav text on a
 * near-white page background at scroll position 0 — every page built so
 * far opens Dark for exactly this reason (see services/hero.tsx's own
 * comment, same reasoning). The remaining 3 of 4 sections below (Mission,
 * Team, Values) are White/Light-blue, honoring the "primarily light"
 * spirit everywhere it's safe to.
 *
 * Large-format editorial photo (the founder's own real photo, not stock —
 * public/images/founder-mohammad.jpg) with real visual weight, not a
 * small avatar. A soft ambient GlowEffect behind the frame reuses the same
 * accent-family "light-based depth" material as Services' Capability-
 * Spotlight (D-013) — genuine reuse of an already-approved premium
 * treatment, not a new invented style. The origin-story paragraph is
 * rendered at a larger "lede" size — a standard editorial-profile
 * convention — purely a typographic choice; the text itself is otherwise
 * unchanged, unreworded, verbatim from the source doc.
 */
export function FounderBio() {
  return (
    <Section environment="dark" className="relative overflow-hidden pt-28 pb-20 md:pt-36 md:pb-28">
      <Container size="lg">
        <div className="grid items-center gap-14 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:gap-16 lg:gap-20">
          <Reveal>
            <div className="relative mx-auto aspect-[3/4] w-full max-w-md md:max-w-none">
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
                  sizes="(min-width: 768px) 45vw, 90vw"
                  priority
                  className="object-cover"
                />
              </div>
            </div>
          </Reveal>

          <div>
            <Reveal>
              <Caption tone="accent">Founder &amp; CEO</Caption>
            </Reveal>
            <Reveal delay={0.05}>
              <H1 className="mt-4">Mohammad Chelouy Tabrizi</H1>
            </Reveal>
            <Reveal delay={0.1}>
              <Text size="lg" tone="primary" className="mt-6">
                Mohammad built his first cybersecurity company in Iran in 2012, well before Oragrol
                existed. Running that business, rather than just studying the industry, is where the
                practical, business first approach behind Oragrol actually comes from.
              </Text>
            </Reveal>
            <Reveal delay={0.15}>
              <Text tone="secondary" className="mt-5">
                In the years since, he has spent more than fifteen years in regional market
                expansion, business development, and international operations, including building
                partnerships across Southeast Asia. His academic background includes software
                engineering, an MBA, and a PhD in Management.
              </Text>
            </Reveal>
            <Reveal delay={0.2}>
              <Text tone="secondary" className="mt-5">
                He founded Oragrol Global in Toronto in 2025 to bring that same practical approach to
                businesses across Canada and North America, starting with cybersecurity and building
                a broader technology company around it over time.
              </Text>
            </Reveal>
          </div>
        </div>
      </Container>
    </Section>
  );
}
