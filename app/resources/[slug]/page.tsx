// Nav bar (2026-09-06): added the site's standard global nav — same
// `industry-header` shell used by Resources/Company/Industries/Contact/
// Privacy Policy (see app/gpt-pages.css) — above the existing breadcrumb.
// "Resources" is marked active since these article pages live under
// /resources. `.resource-header` below is this page's own tint modifier,
// matching its titanium/graphite palette the same way
// `.privacy-header`/`.company-header` match theirs.
//
// This replaces the old pre-redesign article-detail template (which only
// covered 6 of the 16 articles and used the old site chrome) with GPT's
// approved content and layout for all 16.

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Fragment, type ReactNode } from "react";
import PreFooterCta from "../../components/site/pre-footer-cta";
import SiteFooter from "../../components/site/footer";
import "../../gpt-pages.css";
import {
  RESOURCE_ARTICLES,
  RESOURCE_ARTICLES_BY_SLUG,
  type ResourceArticle,
} from "./ORAGROL_ResourceArticles";

type PageProps = { params: Promise<{ slug: string }> };

type BodyBlock =
  | { type: "heading"; text: string; id: string }
  | { type: "paragraph"; text: string }
  | { type: "unordered-list"; items: string[] }
  | { type: "ordered-list"; items: string[] };

// Same six links as the standard nav on Resources/Company/Industries/
// Contact/Privacy Policy.
const nav = [
  "Services",
  "Business Automation",
  "OR ONE",
  "Industries",
  "Resources",
  "Company",
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseBody(markdown: string): BodyBlock[] {
  const lines = markdown.split("\n");
  const blocks: BodyBlock[] = [];
  let paragraph: string[] = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    blocks.push({ type: "paragraph", text: paragraph.join(" ").trim() });
    paragraph = [];
  };

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trim();

    if (!line) {
      flushParagraph();
      continue;
    }

    if (line.startsWith("## ")) {
      flushParagraph();
      const text = line.slice(3).trim();
      blocks.push({ type: "heading", text, id: slugify(text) });
      continue;
    }

    if (line.startsWith("- ")) {
      flushParagraph();
      const items: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("- ")) {
        items.push(lines[i].trim().slice(2).trim());
        i += 1;
      }
      i -= 1;
      blocks.push({ type: "unordered-list", items });
      continue;
    }

    if (/^\d+\.\s/.test(line)) {
      flushParagraph();
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s/, ""));
        i += 1;
      }
      i -= 1;
      blocks.push({ type: "ordered-list", items });
      continue;
    }

    paragraph.push(line);
  }

  flushParagraph();
  return blocks;
}

function renderInline(text: string): ReactNode[] {
  const tokenPattern = /(\*\*[^*]+\*\*|\[[^\]]+\]\(https?:\/\/[^)]+\)|`[^`]+`)/g;
  const parts = text.split(tokenPattern).filter(Boolean);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }

    const link = part.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/);
    if (link) {
      return (
        <a key={index} href={link[2]} target="_blank" rel="noreferrer">
          {link[1]}
        </a>
      );
    }

    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={index}>{part.slice(1, -1)}</code>;
    }

    return <Fragment key={index}>{part}</Fragment>;
  });
}

function isRiskTierList(items: string[]) {
  return (
    items.length === 4 &&
    items.every((item) => /^(\*\*)?\d{1,3}[–-]\d{1,3}:/.test(item))
  );
}

function cleanRiskTier(item: string) {
  const clean = item.replaceAll("**", "");
  const [range, ...label] = clean.split(":");
  return { range, label: label.join(":").trim() };
}

function ArticleBody({ blocks }: { blocks: BodyBlock[] }) {
  return (
    <div className="resource-prose">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          return (
            <h2 id={block.id} key={`${block.id}-${index}`}>
              {block.text}
            </h2>
          );
        }

        if (block.type === "paragraph") {
          return <p key={index}>{renderInline(block.text)}</p>;
        }

        if (block.type === "unordered-list" && isRiskTierList(block.items)) {
          return (
            <div className="risk-grid" key={index} aria-label="Risk tiers">
              {block.items.map((item) => {
                const tier = cleanRiskTier(item);
                return (
                  <div className="risk-grid__item" key={item}>
                    <span>{tier.range}</span>
                    <strong>{tier.label}</strong>
                  </div>
                );
              })}
            </div>
          );
        }

        const ListTag = block.type === "ordered-list" ? "ol" : "ul";
        return (
          <ListTag key={index}>
            {block.items.map((item) => (
              <li key={item}>{renderInline(item)}</li>
            ))}
          </ListTag>
        );
      })}
    </div>
  );
}

function getRelatedArticles(article: ResourceArticle) {
  const topicRoot = article.topic.split("/")[0].trim();
  return RESOURCE_ARTICLES.filter((candidate) => candidate.slug !== article.slug)
    .map((candidate) => ({
      article: candidate,
      score:
        (candidate.topic.includes(topicRoot) ? 3 : 0) +
        (candidate.industry === article.industry ? 1 : 0),
    }))
    .sort((a, b) => b.score - a.score || Number(a.article.number) - Number(b.article.number))
    .slice(0, 3)
    .map(({ article: candidate }) => candidate);
}

export function generateStaticParams() {
  return RESOURCE_ARTICLES.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = RESOURCE_ARTICLES_BY_SLUG[slug];
  if (!article) return {};

  return {
    title: article.seoTitle,
    description: article.seoDescription,
    alternates: { canonical: `/resources/${article.slug}` },
    openGraph: {
      type: "article",
      title: article.seoTitle,
      description: article.seoDescription,
      url: `/resources/${article.slug}`,
      siteName: "ORAGROL Global",
    },
  };
}

export default async function ResourceDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const article = RESOURCE_ARTICLES_BY_SLUG[slug];
  if (!article) notFound();

  const blocks = parseBody(article.body);
  const headings = blocks.filter(
    (block): block is Extract<BodyBlock, { type: "heading" }> => block.type === "heading",
  );
  const related = getRelatedArticles(article);

  return (
    <>
      <main className="resource-detail">
        <header className="industry-header resource-header">
          <Link className="wordmark" href="/">
            <span>ORAGROL</span>
            <small>GLOBAL</small>
          </Link>
          <nav>
            {nav.map((n) => (
              <Link
                className={n === "Resources" ? "active" : ""}
                href={
                  n === "Services"
                    ? "/services"
                    : n === "Business Automation"
                      ? "/business-automation"
                      : n === "OR ONE"
                        ? "/or-one"
                        : n === "Industries"
                          ? "/industries"
                          : n === "Resources"
                            ? "/resources"
                            : "/company"
                }
                key={n}
              >
                {n}
              </Link>
            ))}
          </nav>
          <div>
            <a href="/resources#resource-library">Back to Resources</a>
            <button className="search" aria-label="Search">
              <span />
            </button>
            <button className="language">EN / FR</button>
          </div>
        </header>

        <header className="resource-hero">
          <div className="resource-shell">
            <nav className="resource-breadcrumb" aria-label="Breadcrumb">
              <Link href="/resources">Resources</Link>
              <span>/</span>
              <span>{article.topic.split("/")[0].trim()}</span>
              <span>/</span>
              <span aria-current="page">{article.title}</span>
            </nav>

            <div className="resource-hero__layout">
              <span className="resource-hero__number" aria-hidden="true">
                {article.number}
              </span>
              <div className="resource-hero__content">
                <p className="resource-eyebrow">
                  {article.type.toUpperCase()} · {article.topic.toUpperCase()}
                </p>
                <h1>{article.title}</h1>
                <p className="resource-summary">{article.summary}</p>
                <div className="resource-meta-line">
                  <span>◷ {article.estimatedRead.toUpperCase()}</span>
                  <span aria-hidden="true">·</span>
                  <span>{article.industry.toUpperCase()}</span>
                </div>
              </div>
            </div>

            <div className="resource-progress" aria-hidden="true">
              <span>0%</span><i /><span>100%</span>
            </div>
          </div>
        </header>

        <div className="resource-shell resource-article-grid">
          <aside className="resource-toc">
            <details open>
              <summary>IN THIS ARTICLE</summary>
              <nav aria-label="Article contents">
                {headings.map((heading) => (
                  <a href={`#${heading.id}`} key={heading.id}>{heading.text}</a>
                ))}
              </nav>
            </details>
          </aside>

          <article className="resource-article">
            <ArticleBody blocks={blocks} />

            <section className="next-action" aria-labelledby="next-action-title">
              <div>
                <p id="next-action-title">ONE NEXT ACTION</p>
                <h2>{article.nextAction}</h2>
              </div>
              <a href={article.primaryCta.href}>
                <span>{article.primaryCta.label}</span><span aria-hidden="true">↗</span>
              </a>
            </section>
          </article>

          <aside className="resource-facts" aria-label="Article details">
            <h2>ARTICLE DETAILS</h2>
            <dl>
              <div><dt>Type</dt><dd>{article.type}</dd></div>
              <div><dt>Industry</dt><dd>{article.industry}</dd></div>
              <div><dt>Updated</dt><dd>2026</dd></div>
              <div><dt>Reading time</dt><dd>{article.estimatedRead}</dd></div>
            </dl>
          </aside>
        </div>

        <div className="resource-shell resource-aftercare">
          <details className="resource-sources">
            <summary>SOURCES <span aria-hidden="true">+</span></summary>
            <ul>
              {article.sources.map((source) => (
                <li key={source.label}>
                  {source.href ? (
                    <a href={source.href} target="_blank" rel="noreferrer">
                      {source.label} ↗
                    </a>
                  ) : source.label}
                </li>
              ))}
            </ul>
          </details>

          <section className="related-resources" aria-labelledby="related-heading">
            <h2 id="related-heading">RELATED RESOURCES</h2>
            <div className="related-grid">
              {related.map((item) => (
                <a className="related-card" href={`/resources/${item.slug}`} key={item.slug}>
                  <span className="related-card__type">{item.type.toUpperCase()}</span>
                  <h3>{item.title}</h3>
                  <div><span>◷ {item.estimatedRead.toUpperCase()}</span><span aria-hidden="true">→</span></div>
                </a>
              ))}
            </div>
          </section>
        </div>
      </main>

      <PreFooterCta page="resources" />
      <SiteFooter />
      <style>{RESOURCE_DETAIL_STYLES}</style>
    </>
  );
}

const RESOURCE_DETAIL_STYLES = `
  .resource-detail {
    --orange: #ef4d00;
    --graphite: #111111;
    --titanium: #f3f1ec;
    --muted: #6c6a66;
    --rule: #d6d2ca;
    background: #fff;
    color: var(--graphite);
    font-family: var(--font-neue-haas-text, "Neue Haas Grotesk Text Pro"), "Helvetica Neue", Arial, sans-serif;
  }

  /* Tint modifier for the shared .industry-header shell, matching this
     page's own titanium/graphite palette -- same pattern as
     .privacy-header/.company-header (see app/gpt-pages.css). */
  .resource-header {
    background: #fff !important;
    border-color: var(--rule) !important;
    position: relative;
    z-index: 20;
  }

  .resource-header a,
  .resource-header button,
  .resource-header .wordmark span,
  .resource-header .wordmark small {
    color: var(--graphite) !important;
  }

  .resource-header nav a {
    opacity: 0.65;
  }

  .resource-header nav a.active {
    opacity: 1;
    color: var(--orange) !important;
  }

  .resource-header nav a:hover {
    opacity: 1;
  }

  .resource-shell {
    width: min(100%, 1500px);
    margin-inline: auto;
    padding-inline: clamp(24px, 4vw, 72px);
  }

  .resource-hero {
    min-height: 550px;
    display: grid;
    align-items: stretch;
    padding-top: clamp(34px, 4vw, 64px);
    background: var(--titanium);
  }

  .resource-breadcrumb {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    color: var(--muted);
    font-size: 13px;
  }

  .resource-breadcrumb a {
    color: inherit;
    text-decoration: none;
  }

  .resource-hero__layout {
    min-height: 405px;
    display: grid;
    grid-template-columns: minmax(130px, 0.6fr) minmax(0, 3.4fr);
    align-items: center;
    gap: clamp(38px, 5vw, 100px);
  }

  .resource-hero__number {
    color: #e1ded7;
    font-family: var(--font-neue-haas-display, "Neue Haas Grotesk Display Pro"), "Helvetica Neue", Arial, sans-serif;
    font-size: clamp(130px, 15vw, 245px);
    font-weight: 300;
    line-height: 0.8;
    letter-spacing: -0.09em;
  }

  .resource-hero__content {
    max-width: 980px;
  }

  .resource-eyebrow,
  .related-card__type,
  .next-action > div > p {
    color: var(--orange);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.04em;
  }

  .resource-hero h1 {
    margin: 18px 0 22px;
    font-family: var(--font-neue-haas-display, "Neue Haas Grotesk Display Pro"), "Helvetica Neue", Arial, sans-serif;
    font-size: clamp(50px, 5.6vw, 92px);
    font-weight: 400;
    line-height: 0.98;
    letter-spacing: -0.052em;
    text-wrap: balance;
  }

  .resource-summary {
    max-width: 820px;
    margin: 0;
    color: var(--muted);
    font-size: clamp(18px, 1.55vw, 25px);
    line-height: 1.48;
  }

  .resource-meta-line {
    display: flex;
    gap: 15px;
    margin-top: 28px;
    font-size: 12px;
    letter-spacing: 0.04em;
  }

  .resource-progress {
    display: grid;
    grid-template-columns: max-content 1fr max-content;
    gap: 20px;
    align-items: center;
    padding-bottom: 30px;
    color: var(--orange);
    font-size: 11px;
  }

  .resource-progress i {
    height: 2px;
    background: var(--orange);
  }

  .resource-article-grid {
    display: grid;
    grid-template-columns: minmax(170px, 0.78fr) minmax(0, 2.35fr) minmax(180px, 0.78fr);
    gap: clamp(32px, 4vw, 72px);
    padding-top: 72px;
    padding-bottom: 48px;
  }

  .resource-toc,
  .resource-facts {
    align-self: start;
    position: sticky;
    top: 110px;
  }

  .resource-toc {
    padding-right: 28px;
    border-right: 1px solid var(--rule);
  }

  .resource-toc summary,
  .resource-facts h2,
  .resource-sources summary,
  .related-resources > h2 {
    color: var(--graphite);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.035em;
  }

  .resource-toc summary {
    cursor: default;
    list-style: none;
  }

  .resource-toc nav {
    display: grid;
    gap: 23px;
    margin-top: 34px;
  }

  .resource-toc a {
    color: var(--muted);
    font-size: 13px;
    line-height: 1.45;
    text-decoration: none;
  }

  .resource-toc a:hover {
    color: var(--orange);
  }

  .resource-article {
    min-width: 0;
  }

  .resource-prose {
    max-width: 760px;
    margin-inline: auto;
    color: #262523;
    font-size: 18px;
    line-height: 1.76;
  }

  .resource-prose h2 {
    scroll-margin-top: 120px;
    margin: 58px 0 17px;
    color: var(--graphite);
    font-family: var(--font-neue-haas-display, "Neue Haas Grotesk Display Pro"), "Helvetica Neue", Arial, sans-serif;
    font-size: clamp(29px, 2.35vw, 40px);
    font-weight: 450;
    line-height: 1.12;
    letter-spacing: -0.032em;
  }

  .resource-prose h2:first-child {
    margin-top: 0;
  }

  .resource-prose p {
    margin: 0 0 22px;
  }

  .resource-prose ul,
  .resource-prose ol {
    display: grid;
    gap: 11px;
    margin: 12px 0 30px;
    padding-left: 24px;
  }

  .resource-prose li::marker {
    color: var(--orange);
  }

  .resource-prose a,
  .resource-sources a {
    color: inherit;
    text-decoration-color: var(--orange);
    text-underline-offset: 3px;
  }

  .resource-prose code {
    padding: 2px 5px;
    background: var(--titanium);
    font-size: 0.88em;
  }

  .risk-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    margin: 30px 0 36px;
    border: 1px solid var(--rule);
  }

  .risk-grid__item {
    min-height: 100px;
    display: grid;
    place-content: center;
    gap: 8px;
    text-align: center;
    border-left: 1px solid var(--rule);
  }

  .risk-grid__item:first-child {
    border-left: 0;
  }

  .risk-grid__item span {
    color: var(--orange);
    font-size: 22px;
  }

  .risk-grid__item strong {
    font-size: 11px;
    letter-spacing: 0.05em;
  }

  .resource-facts {
    padding-left: 28px;
    border-left: 1px solid var(--rule);
  }

  .resource-facts h2 {
    margin: 0;
  }

  .resource-facts dl {
    margin: 28px 0 0;
  }

  .resource-facts dl > div {
    padding: 19px 0;
    border-bottom: 1px solid var(--rule);
  }

  .resource-facts dt {
    margin-bottom: 7px;
    font-size: 11px;
    font-weight: 600;
  }

  .resource-facts dd {
    margin: 0;
    color: var(--muted);
    font-size: 13px;
    line-height: 1.4;
  }

  .next-action {
    max-width: 760px;
    min-height: 155px;
    margin: 66px auto 0;
    padding: 28px;
    display: grid;
    grid-template-columns: minmax(0, 1fr) max-content;
    gap: 32px;
    align-items: center;
    background: var(--graphite);
    color: #fff;
  }

  .next-action p {
    margin: 0 0 11px;
  }

  .next-action h2 {
    margin: 0;
    max-width: 480px;
    font-size: 18px;
    font-weight: 400;
    line-height: 1.45;
  }

  .next-action a {
    min-height: 50px;
    padding: 0 17px;
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    background: #fff;
    color: var(--graphite);
    font-size: 13px;
    text-decoration: none;
  }

  .resource-aftercare {
    padding-bottom: 78px;
  }

  .resource-sources {
    border-top: 1px solid var(--rule);
    border-bottom: 1px solid var(--rule);
  }

  .resource-sources summary {
    min-height: 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    list-style: none;
  }

  .resource-sources summary::-webkit-details-marker {
    display: none;
  }

  .resource-sources ul {
    display: grid;
    gap: 11px;
    margin: 0;
    padding: 0 0 24px 18px;
    color: var(--muted);
    font-size: 13px;
    line-height: 1.55;
  }

  .related-resources {
    padding-top: 42px;
  }

  .related-resources > h2 {
    margin: 0 0 24px;
  }

  .related-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 22px;
  }

  .related-card {
    min-height: 220px;
    padding: 24px;
    display: flex;
    flex-direction: column;
    border: 1px solid var(--rule);
    color: var(--graphite);
    text-decoration: none;
    transition: border-color 170ms ease, transform 170ms ease;
  }

  .related-card:hover {
    border-color: var(--orange);
    transform: translateY(-3px);
  }

  .related-card h3 {
    margin: 22px 0 30px;
    font-family: var(--font-neue-haas-display, "Neue Haas Grotesk Display Pro"), "Helvetica Neue", Arial, sans-serif;
    font-size: 24px;
    font-weight: 500;
    line-height: 1.08;
    letter-spacing: -0.025em;
  }

  .related-card > div {
    margin-top: auto;
    display: flex;
    justify-content: space-between;
    color: var(--muted);
    font-size: 11px;
  }

  .related-card > div span:last-child {
    color: var(--orange);
    font-size: 20px;
  }

  @media (max-width: 1060px) {
    .resource-article-grid {
      grid-template-columns: 180px minmax(0, 1fr);
    }

    .resource-facts {
      grid-column: 2;
      position: static;
      display: none;
    }
  }

  @media (max-width: 760px) {
    .resource-shell {
      padding-inline: 20px;
    }

    .resource-hero {
      min-height: 0;
      padding-top: 28px;
    }

    .resource-breadcrumb {
      gap: 7px;
      font-size: 11px;
    }

    .resource-hero__layout {
      min-height: 430px;
      grid-template-columns: 1fr;
      gap: 20px;
      align-content: center;
    }

    .resource-hero__number {
      font-size: 110px;
      position: absolute;
      opacity: 0.65;
    }

    .resource-hero__content {
      position: relative;
      z-index: 1;
      padding-top: 80px;
    }

    .resource-hero h1 {
      font-size: clamp(44px, 13vw, 66px);
    }

    .resource-article-grid {
      grid-template-columns: 1fr;
      gap: 38px;
      padding-top: 38px;
    }

    .resource-toc {
      position: static;
      padding: 0 0 22px;
      border-right: 0;
      border-bottom: 1px solid var(--rule);
    }

    .resource-toc details:not([open]) nav {
      display: none;
    }

    .resource-toc summary {
      cursor: pointer;
    }

    .resource-toc nav {
      gap: 14px;
      margin-top: 22px;
    }

    .resource-prose {
      font-size: 17px;
    }

    .risk-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .risk-grid__item:nth-child(3) {
      border-left: 0;
      border-top: 1px solid var(--rule);
    }

    .risk-grid__item:nth-child(4) {
      border-top: 1px solid var(--rule);
    }

    .next-action {
      grid-template-columns: 1fr;
    }

    .next-action a {
      width: 100%;
    }

    .related-grid {
      grid-template-columns: 1fr;
    }

    .related-card {
      min-height: 190px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .related-card { transition: none; }
  }
`;
