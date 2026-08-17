import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleDetail } from "../../components/sections/resources/article-detail";
import { ARTICLES, getArticle } from "../../components/sections/resources/articles-data";

export function generateStaticParams() {
  return ARTICLES.map((article) => ({ slug: article.slug }));
}

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};
  return {
    title: article.seoTitle,
    description: article.seoDescription,
  };
}

/**
 * Individual article page — Step 10. The source file's own "Slug" field
 * is the full `/resources/<slug>` path (its documentation convention);
 * `articles-data.ts` stores just the bare final segment (e.g.
 * `what-is-a-cyber-health-score`), matching this route's own `[slug]`
 * param and every internal `<Link href={\`/resources/${article.slug}\`}>`
 * directly — verified against the source's full path via the D-052
 * verification script, not just assumed to match.
 */
export default async function ResourceArticlePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  return <ArticleDetail article={article} />;
}
