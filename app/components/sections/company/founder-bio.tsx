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
 * Redesigned (2026-08-17, on request — D-050) after the first restructure
 * (D-049) shipped with two real problems: the top headshot cropped
 * awkwardly inside its circle, and the closing photo read as an oversized
 * stacked block. Fixes below; overall flow (identifier -> bio -> closing
 * beat) unchanged from D-049, text unchanged from D-048/D-049.
 *
 * TOP PHOTO FIX: public/images/founder-mohammad-headshot.png (renamed
 * from a mis-extensioned .jpg during D-049 — it was always real PNG
 * bytes, `xxd` confirms the PNG magic number; extension now matches
 * content) turned out, on close inspection, to be a 3/4-body composition
 * (1086x1448, same framing family as the main photo) rather than a tight
 * face crop — that mismatch, not a CSS bug, is why `object-cover`'s
 * default center-center crop put the face off-center. Fixed with
 * `object-position` biased toward the top of the frame (where the face
 * actually sits) plus a `scale` transform to zoom past what plain `cover`
 * can do on its own — `cover` alone can only choose WHICH slice of the
 * image is visible, not magnify past the image's natural cover-fit scale,
 * so positioning alone couldn't make the face fill the circle the way a
 * true tight headshot would. Verified visually against the live circle at
 * its real rendered size, not just computed from source coordinates.
 *
 * CLOSING PHOTO FIX + GENERAL REDESIGN: researched via `ui-ux-pro-max`
 * (`--domain landing`, `--domain ux`) and `21st.dev` (`search` for
 * "quote section small photo side text testimonial editorial") per
 * instruction. `ui-ux-pro-max` had no direct pattern match (0 results,
 * flagged rather than silently forced); `21st.dev` surfaced "Editorial
 * Testimonial" (jatin-yadav05, id 9637) — a small ringed circular photo
 * paired beside a bold pull-quote line, oversized faint index numeral,
 * generous whitespace. Its carousel/navigation machinery doesn't apply
 * (one founder, not a rotating list) but its core pairing — small photo
 * beside a pull-quote, not a giant stacked photo block — is exactly the
 * "smaller photo aligned to one side with a pull-quote... beside it"
 * pattern asked for, so that's the DNA reused here, adapted to a static
 * single closing beat. The photo shrinks from the prior max-w-2xl
 * (672px) stacked block to a ~224px (max-w-56, exactly one-third of
 * 672px) portrait thumbnail, paired beside a pull-quote — the section's
 * own first sentence, quoted verbatim (not new copy; a pull-quote by
 * definition re-displays existing text, the same "excerpt, don't
 * reword" principle Mission's display-scale statement already uses).
 *
 * Dark environment, container width, and every other structural decision
 * from D-048/D-049 (why Founder Bio opens Dark, not the brief's
 * "primarily light" framing) are unchanged — out of scope for this round.
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
                src="/images/founder-mohammad-headshot.png"
                alt=""
                fill
                sizes="96px"
                priority
                className="origin-[50%_25%] scale-[2] object-cover object-[50%_0%]"
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
