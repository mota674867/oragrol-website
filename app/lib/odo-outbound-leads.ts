// ORAGROL ODO — Outbound mode: similar-business discovery (extra competitors)
//
// WHY THIS EXISTS
// The standard competitor search (odo-competitors.ts) is deliberately strict:
// a candidate only counts once Google Places verifies it. For a client report
// that is right. For OUTBOUND — internal targeting intel that is never shown
// to the company — returning "0 competitors" is useless, so when the strict
// search finds fewer than 5, this widens the area (city -> province/country)
// and asks Claude to READ web-search results and pull out the real businesses
// named in them.
//
// HARD RULES (nothing here may be made up):
//   - Claude only extracts what is written in the search results it is given.
//   - A website is kept only if that exact site appears among the results'
//     own URLs; otherwise it is dropped to null — never guessed.
//   - The target company itself, and domains already listed, are removed.
//   - Everything returned from here is labelled UNVERIFIED in the dossier.

import Anthropic from "@anthropic-ai/sdk";
import { fetchTavily } from "./odo-research";
import { normalizeDomain } from "./odo-dns";

const MODEL = "claude-sonnet-4-6";

export type SimilarBusiness = { name: string; website: string | null; whatTheyDo: string };
export type SearchHit = { title: string; url: string; content: string };

const hostOf = (u: string): string => normalizeDomain(u).replace(/^www\./, "");

/** Pure: keep only extractions that honour the rules above. Exported for tests. */
export function filterLeads(
  raw: Array<{ name?: unknown; website?: unknown; whatTheyDo?: unknown }>,
  hits: SearchHit[],
  excludeDomains: string[],
  limit: number,
): SimilarBusiness[] {
  const resultHosts = new Set(hits.map((h) => hostOf(h.url)));
  const excluded = new Set(excludeDomains.map((d) => d.replace(/^www\./, "")));
  const seenNames = new Set<string>();
  const out: SimilarBusiness[] = [];
  for (const r of raw) {
    const name = typeof r.name === "string" ? r.name.trim().slice(0, 120) : "";
    if (!name || seenNames.has(name.toLowerCase())) continue;
    let website: string | null = typeof r.website === "string" && r.website.trim() ? r.website.trim() : null;
    if (website) {
      const host = hostOf(website);
      website = host && resultHosts.has(host) ? website : null; // only if it really appeared in the results
      if (host && excluded.has(host)) continue;
    }
    seenNames.add(name.toLowerCase());
    out.push({ name, website, whatTheyDo: typeof r.whatTheyDo === "string" ? r.whatTheyDo.trim().slice(0, 200) : "" });
    if (out.length >= limit) break;
  }
  return out;
}

export async function findSimilarBusinesses(p: {
  company: string;
  domain: string;
  category: string | null;
  city: string | null;
  region: string;
  excludeDomains: string[];
  need: number;
}): Promise<{ leads: SimilarBusiness[]; usage: { input_tokens: number; output_tokens: number } | null }> {
  if (!p.category || p.need <= 0 || !process.env.ANTHROPIC_API_KEY) return { leads: [], usage: null };
  try {
    const queries = [
      p.city ? `${p.category} companies in ${p.city}` : null,
      `${p.category} companies ${p.region}`,
    ].filter((q): q is string => Boolean(q));
    const settled = await Promise.allSettled(queries.map((q) => fetchTavily(q, 8)));
    const hits = settled.flatMap((s) => (s.status === "fulfilled" ? s.value : []));
    if (!hits.length) return { leads: [], usage: null };

    const system = [
      "You extract real businesses from web search results for a sales-research dossier.",
      `The target company is "${p.company}" (${p.domain}). Find businesses that offer SIMILAR services, preferably near ${p.city ?? p.region}.`,
      "RULES: use ONLY businesses actually named in the results below — never invent a business, a website or a service. Skip the target itself, directories, review sites, news articles and listicle pages themselves (but you may take the businesses a listicle names). `website` must be the business's own site and must be a URL that appears in the results; if it does not appear, use null. `whatTheyDo` is one short phrase taken from the results.",
      `Return at most ${Math.min(8, p.need + 3)} businesses. Return ONLY JSON: {"businesses":[{"name":string,"website":string|null,"whatTheyDo":string}]}`,
    ].join("\n");
    const user = hits.map((h, i) => `[${i + 1}] ${h.title}\n${h.url}\n${(h.content || "").slice(0, 600)}`).join("\n\n");

    const res = await new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }).messages.create(
      { model: MODEL, max_tokens: 1200, system, messages: [{ role: "user", content: user }] },
      { timeout: 45000 },
    );
    const usage = { input_tokens: res.usage.input_tokens, output_tokens: res.usage.output_tokens };
    const text = res.content.map((c) => (c.type === "text" ? c.text : "")).join("");
    const parsed = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1)) as { businesses?: unknown };
    const raw = Array.isArray(parsed.businesses) ? (parsed.businesses as Array<Record<string, unknown>>) : [];
    return { leads: filterLeads(raw, hits, [p.domain, ...p.excludeDomains], p.need), usage };
  } catch {
    return { leads: [], usage: null };
  }
}
