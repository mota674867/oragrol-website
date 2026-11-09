// ORAGROL Lead Finder (pilot) — small text helpers. Pure code, no network.
//
// Kept separate from odo-crawl.ts on purpose: the Lead Finder is an isolated
// pilot module and must not change how the live ODO scan behaves.

function safeChr(n: number): string {
  return Number.isFinite(n) && n > 0 && n < 0x110000 ? String.fromCodePoint(n) : "";
}

const NAMED: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
  commat: "@", period: ".", lowbar: "_", hyphen: "-", dash: "-",
};

/** Decodes numeric (&#64; &#x40;) and the few named entities that matter for emails. */
export function decodeEntities(s: string): string {
  return s
    .replace(/&#x([0-9a-f]+);?/gi, (_m, h: string) => safeChr(parseInt(h, 16)))
    .replace(/&#(\d+);?/g, (_m, d: string) => safeChr(parseInt(d, 10)))
    .replace(/&([a-z]+);/gi, (m, n: string) => NAMED[n.toLowerCase()] ?? m);
}

/** Visible text of an HTML page: scripts and styles removed, block tags become line breaks. */
export function toText(html: string): string {
  const stripped = html
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(script|style|noscript|svg)\b[\s\S]*?<\/\1>/gi, " ")
    .replace(/<(br|\/p|\/div|\/li|\/h[1-6]|\/tr|\/section)\b[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, " ");
  return decodeEntities(stripped)
    .replace(/[ \t\f\v ]+/g, " ")
    .replace(/\s*\n\s*/g, "\n")
    .trim();
}

/** Lower-case, accents removed, punctuation turned into spaces: for matching names and titles. */
export function normalizeForMatch(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}
