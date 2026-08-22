"use client";

import { useMemo, useState } from "react";
import { Container, Grid, Section, Text, cn } from "../../ui";
import { Reveal } from "../../motion/reveal";
import { ARTICLES, type ContentType, type Industry, type ResourceArticle } from "./articles-data";
import { ArticleCard, FeaturedArticleCard } from "./article-card";

/**
 * ResourcesExplorer — Step 10's filter + grid. Researched first
 * (`ui-ux-pro-max` UX-domain search + a `21st.dev` search for "filter
 * faceted content grid category", which surfaced a genuinely matching
 * component — "Filter Grid," segmented radio chips with live per-filter
 * counts that reflow as selection changes — the retrieval itself hit this
 * session's 21st.dev rate limit before the code could be pulled, so this
 * is a native rebuild of that same *pattern*, not a literal import;
 * flagged as such rather than presented as sourced).
 *
 * Faceted, not independent, filtering: each dimension's available chips
 * are computed from the OTHER two active filters, not the full unfiltered
 * dataset — a chip whose combination would currently match zero articles
 * is never rendered at all, which is what "hide any filter option with
 * zero matching content" means in practice once more than one filter can
 * be active at a time (e.g. selecting Industry: Professional Services
 * immediately hides "Article" from Content Type, since the one
 * Professional-Services piece is a Guide). If the active selection for a
 * dimension would no longer be valid after another filter narrows things,
 * it's reset automatically — same reasoning IndustriesExplorer/CategoryNav
 * already established for this project's other filter-like widgets, just
 * applied per-dimension here instead of per-single-selection.
 *
 * Single-select per dimension (Content Type / Topic / Industry), not
 * multi-select checkboxes — matches the instruction's "filters: by
 * Industry..., by Topic, by Content Type" framing (three independent
 * questions, one answer each) and keeps the interaction legible with
 * only 6 articles.
 */

interface FilterState {
  contentType: ContentType | null;
  topic: string | null;
  industry: Industry | null;
}

function matches(article: ResourceArticle, filters: FilterState, ignore: keyof FilterState): boolean {
  if (ignore !== "contentType" && filters.contentType && article.contentType !== filters.contentType) return false;
  if (ignore !== "topic" && filters.topic && article.topic !== filters.topic) return false;
  if (ignore !== "industry" && filters.industry && article.industry !== filters.industry) return false;
  return true;
}

function optionsFor<K extends keyof FilterState>(
  key: K,
  valueOf: (article: ResourceArticle) => NonNullable<FilterState[K]>,
  filters: FilterState,
): Array<{ value: NonNullable<FilterState[K]>; count: number }> {
  const counts = new Map<string, number>();
  for (const article of ARTICLES) {
    if (!matches(article, filters, key)) continue;
    const value = valueOf(article);
    counts.set(value as string, (counts.get(value as string) ?? 0) + 1);
  }
  return Array.from(counts.entries()).map(([value, count]) => ({
    value: value as NonNullable<FilterState[K]>,
    count,
  }));
}

function FilterGroup<T extends string>({
  label,
  active,
  options,
  totalCount,
  onSelect,
}: {
  label: string;
  active: T | null;
  options: Array<{ value: T; count: number }>;
  totalCount: number;
  onSelect: (value: T | null) => void;
}) {
  // A dimension with only one real value (plus "All") isn't a meaningful
  // choice — still shown for transparency (it tells the visitor what the
  // library currently covers) but as a single non-interactive chip pair
  // rather than implying more filtering power than exists.
  return (
    <fieldset className="min-w-0">
      <legend className="font-body text-xs font-medium uppercase tracking-widest text-text-muted">{label}</legend>
      <div className="mt-2.5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onSelect(null)}
          aria-pressed={active === null}
          className={cn(
            "rounded-full border px-3 py-1.5 font-body text-sm transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
            active === null
              ? "border-accent bg-accent/10 text-accent font-medium"
              : "border-border bg-surface text-text-secondary hover:border-text-secondary hover:text-text-primary",
          )}
        >
          All <span className="text-text-muted">({totalCount})</span>
        </button>
        {options.map(({ value, count }) => (
          <button
            key={value}
            type="button"
            onClick={() => onSelect(value)}
            aria-pressed={active === value}
            className={cn(
              "rounded-full border px-3 py-1.5 font-body text-sm transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
              active === value
                ? "border-accent bg-accent/10 text-accent font-medium"
                : "border-border bg-surface text-text-secondary hover:border-text-secondary hover:text-text-primary",
            )}
          >
            {value} <span className="text-text-muted">({count})</span>
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function ResourcesExplorer() {
  const [filters, setFilters] = useState<FilterState>({ contentType: null, topic: null, industry: null });

  const contentTypeOptions = useMemo(
    () => optionsFor("contentType", (a) => a.contentType, filters),
    [filters],
  );
  const topicOptions = useMemo(() => optionsFor("topic", (a) => a.topic, filters), [filters]);
  const industryOptions = useMemo(() => optionsFor("industry", (a) => a.industry, filters), [filters]);

  const filtered = useMemo(
    () =>
      ARTICLES.filter(
        (a) =>
          (!filters.contentType || a.contentType === filters.contentType) &&
          (!filters.topic || a.topic === filters.topic) &&
          (!filters.industry || a.industry === filters.industry),
      ),
    [filters],
  );

  const featured = filtered.find((a) => a.featured);
  const rest = filtered.filter((a) => a.slug !== featured?.slug);
  const anyFilterActive = filters.contentType || filters.topic || filters.industry;

  return (
    <Section environment="white" className="py-16 md:py-20">
      <Container size="xl">
        <Reveal>
          <div className="flex flex-col gap-6 rounded-2xl border border-border bg-surface p-6 sm:flex-row sm:flex-wrap sm:gap-x-10 sm:gap-y-5">
            <FilterGroup
              label="Content Type"
              active={filters.contentType}
              options={contentTypeOptions}
              totalCount={ARTICLES.filter((a) => matches(a, filters, "contentType")).length}
              onSelect={(v) => setFilters((f) => ({ ...f, contentType: v }))}
            />
            <FilterGroup
              label="Topic"
              active={filters.topic}
              options={topicOptions}
              totalCount={ARTICLES.filter((a) => matches(a, filters, "topic")).length}
              onSelect={(v) => setFilters((f) => ({ ...f, topic: v }))}
            />
            <FilterGroup
              label="Industry"
              active={filters.industry}
              options={industryOptions}
              totalCount={ARTICLES.filter((a) => matches(a, filters, "industry")).length}
              onSelect={(v) => setFilters((f) => ({ ...f, industry: v }))}
            />
          </div>
        </Reveal>

        <div className="mt-10">
          {filtered.length === 0 ? (
            <Reveal>
              <Text tone="secondary" className="py-16 text-center">
                No resources match this combination yet.
              </Text>
            </Reveal>
          ) : (
            <>
              {featured && (
                <Reveal>
                  <FeaturedArticleCard article={featured} />
                </Reveal>
              )}
              {rest.length > 0 && (
                // xl:4 (2026-08-22): this is a growing content listing (not
                // a fixed-count set), so unlike most grids in the site it
                // should keep adding columns as the viewport (and the
                // article count) grows, instead of holding `lg:3` flat.
                <Grid cols={{ base: 1, md: 2, lg: 3, xl: 4 }} gap="lg" className={featured ? "mt-8" : undefined}>
                  {rest.map((article, i) => (
                    <Reveal key={article.slug} delay={i * 0.05}>
                      <ArticleCard article={article} />
                    </Reveal>
                  ))}
                </Grid>
              )}
            </>
          )}
          {anyFilterActive && (
            <Text tone="muted" size="sm" className="mt-6">
              Showing {filtered.length} of {ARTICLES.length} resources.
            </Text>
          )}
        </div>
      </Container>
    </Section>
  );
}
