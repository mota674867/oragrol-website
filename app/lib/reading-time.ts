/**
 * Reading time — Resources (Step 10). Calculated from real word count, not
 * a hardcoded per-article guess, per the instruction ("calculate from word
 * count"). Standard 200 wpm baseline, rounded up, minimum 1 minute.
 */

const WORDS_PER_MINUTE = 200;

export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export function readingTimeMinutes(wordCount: number): number {
  return Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
}

/** Body-block shape accepted here is intentionally minimal (structural
 * duck-typing) so this file doesn't need to import Resources' own
 * ContentBlock type — kept a generic content-agnostic utility. */
type CountableBlock = { text?: string; items?: string[] };

export function articleReadingTime(body: CountableBlock[]): number {
  const words = body.reduce((total, block) => {
    if (block.items) return total + block.items.reduce((sum, item) => sum + countWords(item), 0);
    if (block.text) return total + countWords(block.text);
    return total;
  }, 0);
  return readingTimeMinutes(words);
}
