import { Fragment } from "react";

/**
 * InlineMarkdown — the article bodies (ORAGROL_RESOURCES_ALL_ARTICLES_
 * FINAL.md) use exactly one inline markup convention: `**bold**` for
 * emphasis within a sentence (e.g. risk-tier labels, key questions). No
 * italics, links, or other inline markup appear anywhere in the source —
 * confirmed by grep before writing this. A single-purpose splitter for
 * `**bold**` is enough; not pulling in a markdown-parser dependency this
 * project doesn't otherwise have for one inline pattern.
 */
export function InlineMarkdown({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </>
  );
}
