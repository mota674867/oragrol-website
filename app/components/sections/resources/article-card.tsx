import { ArrowRight, BookOpen, Clock, FileText } from "lucide-react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { Badge, Caption, H3, Icon, Text, cn } from "../../ui";
import { GlowEffect } from "../services/glow-effect";
import type { ResourceArticle } from "./articles-data";
import { articleReadingTime } from "../../../lib/reading-time";

const CONTENT_TYPE_ICON = { Article: FileText, Guide: BookOpen } as const;

// Same radial-gradient "material" icon badge as Services' CapabilitySpotlight
// (D-013) and Company's Values grid (D-048) — genuine reuse, not a new style.
const ICON_BADGE_STYLE: CSSProperties = {
  background:
    "radial-gradient(circle at 35% 30%, var(--color-accent-light), var(--color-accent) 55%, var(--color-accent-strong) 100%)",
  boxShadow:
    "inset 0 1.5px 0 0 color-mix(in srgb, white 45%, transparent), inset 0 -6px 12px -6px color-mix(in srgb, black 55%, transparent), 0 0 20px 3px color-mix(in srgb, var(--color-accent) 45%, transparent)",
};

function CardMeta({ article }: { article: ResourceArticle }) {
  const minutes = articleReadingTime(article.body);
  return (
    <div className="mt-4 flex items-center gap-4 text-text-muted">
      <span className="inline-flex items-center gap-1.5 text-xs">
        <Icon icon={Clock} size="sm" />
        {minutes} min read
      </span>
    </div>
  );
}

/**
 * Standard content-grid card. Content-type badge (icon + label) + topic
 * eyebrow + title + one-line summary + reading time — exactly the fields
 * the instruction's grid spec calls for. Reuses the shared `Card`
 * primitive (`interactive`, `href` — the whole card is one real link, no
 * separate "read more" needed).
 */
export function ArticleCard({ article }: { article: ResourceArticle }) {
  const TypeIcon = CONTENT_TYPE_ICON[article.contentType];
  return (
    <Link
      href={`/resources/${article.slug}`}
      className="group flex h-full flex-col rounded-2xl border border-border bg-surface p-6 transition-colors duration-200 hover:border-text-secondary hover:bg-text-primary/[0.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <div className="flex items-center justify-between gap-3">
        <Badge tone="accent" className="gap-1.5">
          <Icon icon={TypeIcon} size="sm" />
          {article.contentType}
        </Badge>
        <Icon
          icon={ArrowRight}
          size="sm"
          className="text-text-muted transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-accent"
        />
      </div>

      <Caption tone="secondary" className="mt-4">
        {article.topic}
      </Caption>
      <H3 className="mt-2">{article.title}</H3>
      <Text tone="secondary" size="sm" className="mt-3 flex-1">
        {article.summary}
      </Text>

      <CardMeta article={article} />
    </Link>
  );
}

/**
 * Featured card — Article 1 ("What Is a Cyber Health Score?") is marked
 * Featured: Yes in the source, and this task explicitly calls for
 * prominent placement. Full-width, premium dark elevated panel (env-dark
 * + GlowEffect + the same icon-badge material as CapabilitySpotlight /
 * Company's Values grid, D-013/D-048) rather than a bigger version of the
 * plain card — matches this site's established "nested dark panel on a
 * lighter section" premium-quality bar, not a new invented style.
 */
export function FeaturedArticleCard({ article }: { article: ResourceArticle }) {
  const TypeIcon = CONTENT_TYPE_ICON[article.contentType];
  const minutes = articleReadingTime(article.body);
  return (
    <Link
      href={`/resources/${article.slug}`}
      className={cn(
        "group relative block overflow-hidden rounded-3xl border border-border bg-background p-8 md:p-12",
        "env-dark shadow-2xl shadow-accent/30",
        "transition-[box-shadow,border-color,transform] duration-200 hover:-translate-y-1 hover:border-accent/40 hover:shadow-accent/50",
      )}
    >
      <GlowEffect blur="strong" className="opacity-50" />
      <div className="relative flex flex-col gap-8 md:flex-row md:items-center">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <Badge tone="accent">Featured</Badge>
            <Badge tone="neutral" className="gap-1.5">
              <Icon icon={TypeIcon} size="sm" />
              {article.contentType}
            </Badge>
          </div>
          <Caption tone="secondary" className="mt-4">
            {article.topic}
          </Caption>
          <H3 size="lg" className="mt-2 max-w-2xl">
            {article.title}
          </H3>
          <Text tone="secondary" size="lg" className="mt-4 max-w-2xl">
            {article.summary}
          </Text>
          <div className="mt-6 flex items-center gap-2 text-sm text-text-muted">
            <Icon icon={Clock} size="sm" />
            {minutes} min read
          </div>
        </div>
        <span
          aria-hidden="true"
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full transition-transform duration-200 group-hover:scale-110"
          style={ICON_BADGE_STYLE}
        >
          <Icon icon={ArrowRight} size="lg" className="text-white" />
        </span>
      </div>
    </Link>
  );
}
