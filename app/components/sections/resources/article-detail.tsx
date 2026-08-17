import { BookOpen, Calendar, Clock, FileText } from "lucide-react";
import { Badge, ButtonLink, Caption, Container, H1, H2, Icon, Section, Text } from "../../ui";
import { Reveal } from "../../motion/reveal";
import { GlowEffect } from "../services/glow-effect";
import { InlineMarkdown } from "./inline-markdown";
import { ArticleBreadcrumb } from "./breadcrumb";
import { AUTHOR, PUBLISHED_DATE, type ResourceArticle, type ContentBlock } from "./articles-data";
import { articleReadingTime } from "../../../lib/reading-time";

const CONTENT_TYPE_ICON = { Article: FileText, Guide: BookOpen } as const;

function formatPublishedDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function ArticleBody({ body }: { body: ContentBlock[] }) {
  return (
    <div>
      {body.map((block, i) => {
        if (block.kind === "h2") {
          return (
            <H2 key={i} className="mt-12 first:mt-0">
              {block.text}
            </H2>
          );
        }
        if (block.kind === "ul") {
          return (
            <ul key={i} className="mt-4 space-y-2.5">
              {block.items.map((item, j) => (
                <li key={j} className="flex items-start gap-3">
                  <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  <Text tone="secondary" className="flex-1">
                    <InlineMarkdown text={item} />
                  </Text>
                </li>
              ))}
            </ul>
          );
        }
        return (
          <Text key={i} tone="secondary" size="lg" className="mt-5 first:mt-0">
            <InlineMarkdown text={block.text} />
          </Text>
        );
      })}
    </div>
  );
}

/**
 * Article detail template — Step 10. Every field the instruction asks
 * for: breadcrumb, content type/category, title, summary, author,
 * published date, reading time, body with proper H2 hierarchy (all
 * article subheadings render H2 — the source has only one heading tier
 * per article, no nested sub-subsections anywhere, so H1 title -> H2
 * subsections is the correct, non-skipping hierarchy; see D-052 for why
 * this differs from the source .md's own `###` markers, which are that
 * file's internal document structure, not a signal to mirror on the
 * rendered page), the "One next action" as a highlighted closing element,
 * then the article's own mapped CTA.
 *
 * Dark header (title/meta), matching every other page's entry-section
 * convention (SiteHeader's Dark-entry assumption — see company/
 * founder-bio.tsx's comment for the full reasoning, unchanged here).
 * Body in White for a readable long-form measure — "editorial, spacious"
 * per PROJECT_MASTER.md's Step 10 brief. No generic FinalCta at the very
 * end: this page already has its own specific, per-article-mapped CTA
 * (the "One next action" panel below), and stacking the site-wide
 * generic CTA on top of it would compete with/dilute that specific one
 * — same "don't add a redundant closing CTA" reasoning Contact's page
 * used (D-046) for skipping FinalCta there.
 */
export function ArticleDetail({ article }: { article: ResourceArticle }) {
  const TypeIcon = CONTENT_TYPE_ICON[article.contentType];
  const minutes = articleReadingTime(article.body);

  return (
    <>
      <Section environment="dark" className="pt-28 pb-16 md:pt-36 md:pb-20">
        <Container size="md">
          <Reveal>
            <ArticleBreadcrumb title={article.title} />
          </Reveal>
          <Reveal delay={0.05}>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Badge tone="accent" className="gap-1.5">
                <Icon icon={TypeIcon} size="sm" />
                {article.contentType}
              </Badge>
              <Caption tone="secondary">{article.topic}</Caption>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <H1 className="mt-4">{article.title}</H1>
          </Reveal>
          <Reveal delay={0.15}>
            <Text tone="secondary" size="lg" className="mt-5">
              {article.summary}
            </Text>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border pt-6 text-sm text-text-muted">
              <span>{AUTHOR}</span>
              <span className="inline-flex items-center gap-1.5">
                <Icon icon={Calendar} size="sm" />
                {formatPublishedDate(PUBLISHED_DATE)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Icon icon={Clock} size="sm" />
                {minutes} min read
              </span>
            </div>
          </Reveal>
        </Container>
      </Section>

      <Section environment="white" className="py-16 md:py-20">
        <Container size="md">
          <Reveal>
            <ArticleBody body={article.body} />
          </Reveal>

          <Reveal delay={0.1}>
            <div className="env-dark relative mt-14 overflow-hidden rounded-2xl border border-border bg-background p-8 md:p-10">
              <GlowEffect blur="strong" className="opacity-40" />
              <div className="relative">
                <Caption tone="accent">One next action</Caption>
                <Text size="lg" tone="primary" className="mt-3">
                  {article.oneNextAction}
                </Text>
                <ButtonLink href={article.ctaHref} variant="primary" size="lg" className="mt-6">
                  {article.ctaText}
                </ButtonLink>
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
