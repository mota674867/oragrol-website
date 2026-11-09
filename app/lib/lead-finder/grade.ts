// ORAGROL Lead Finder (pilot) — grade ONE business: is there a named owner or
// manager with an email the business itself published, and can code prove it?
//
// THE RULE: the AI picks, code proves.
//   - Free code reads the site, finds every email, drops the generic ones and
//     checks for a "no solicitation" notice. The AI is only called when at
//     least one non-generic address exists.
//   - The AI sees a NUMBERED list of addresses and answers with a number. It
//     can never write or change an address.
//   - Code then checks the person's name is really written on the site.
//
// Grades:  A = name and email on the same page   (send)
//          B = name on one page, email on another (send, flagged)
//          C = reject (reason code says why)
//
// Nothing here sends anything or writes to any other system.

import { extractEmails, mergeEmails, classifyEmail, hasNoSolicitation, quebecHint, type FoundEmail } from "./emails";
import { findCandidateLinks } from "./pages";
import { normalizeForMatch, toText, decodeEntities } from "./text";
import { haikuCostUsd, type Usage } from "./cost";

export type Grade = "A" | "B" | "C";

export type FetchedPage = { url: string; html: string };
/** Returns the page, or null when it cannot be read (timeout, blocked, not HTML...). */
export type FetchPage = (url: string) => Promise<FetchedPage | null>;

export type PickCandidate = { index: number; email: string; pageUrl: string; snippet: string };
export type PickInput = {
  business: string;
  website: string;
  candidates: PickCandidate[];
  pages: Array<{ url: string; text: string }>;
};
export type PickOutput = {
  choice: { index: number; personName: string; title: string; roleType: "owner" | "manager" | "other" } | null;
  reason: string;
  usage?: Usage | null;
};
export type Picker = (input: PickInput) => Promise<PickOutput>;

export type LeadResult = {
  business: string;
  website: string;
  grade: Grade;
  reason: string;
  person: string | null;
  title: string | null;
  email: string | null;
  proofUrl: string | null;
  proofSnippet: string | null;
  proofDate: string;
  quebecHint: boolean;
  webmail: boolean;
  needsHumanCheck: boolean;
  pagesFetched: number;
  aiCalled: boolean;
  costUsd: number;
  ms: number;
};

const PAGE_TEXT_CAP = 2500;
const MAX_CANDIDATES = 6;

function normalizeUrl(site: string): string {
  const s = site.trim();
  return /^https?:\/\//i.test(s) ? s : `https://${s}`;
}

/** Every word of the name (at least first and last) must be written on the page. */
export function nameOnPage(pageTextNorm: string, name: string): boolean {
  const tokens = normalizeForMatch(name)
    .split(" ")
    .filter((t) => t.length >= 2 && !["dr", "mr", "mrs", "ms", "mx", "prof"].includes(t));
  if (tokens.length < 2) return false;
  return tokens.every((t) => new RegExp(`(^| )${t}( |$)`).test(pageTextNorm));
}

export async function gradeBusiness(p: {
  business: string;
  website: string;
  fetchPage: FetchPage;
  pick: Picker;
  now?: Date;
}): Promise<LeadResult> {
  const t0 = Date.now();
  const proofDate = (p.now ?? new Date()).toISOString().slice(0, 10);
  let costUsd = 0;
  let aiCalled = false;
  let pagesFetched = 0;
  let qc = false;

  const done = (grade: Grade, reason: string, extra: Partial<LeadResult> = {}): LeadResult => ({
    business: p.business,
    website: p.website,
    grade,
    reason,
    person: null,
    title: null,
    email: null,
    proofUrl: null,
    proofSnippet: null,
    proofDate,
    quebecHint: qc,
    webmail: false,
    needsHumanCheck: false,
    pagesFetched,
    aiCalled,
    costUsd,
    ms: Date.now() - t0,
    ...extra,
  });

  // 1. Read the site (free code).
  const homeUrl = normalizeUrl(p.website);
  const home = await p.fetchPage(homeUrl).catch(() => null);
  if (!home) return done("C", "unreadable");
  const rawPages: FetchedPage[] = [home];
  const links = findCandidateLinks(home.html, home.url || homeUrl, 4);
  const others = await Promise.all(links.map((u) => p.fetchPage(u).catch(() => null)));
  for (const o of others) if (o) rawPages.push(o);
  pagesFetched = rawPages.length;

  const pages = rawPages.map((pg) => {
    const text = toText(pg.html);
    return { url: pg.url, html: pg.html, text, norm: normalizeForMatch(text) };
  });
  qc = pages.some((pg) => quebecHint(pg.text));

  // 2. Rules that need no AI.
  if (pages.some((pg) => hasNoSolicitation(pg.text))) return done("C", "no-solicitation");
  const all: FoundEmail[] = mergeEmails(pages.map((pg) => extractEmails(pg.html, pg.url)));
  if (all.length === 0) return done("C", "no-email");
  const personal = all.filter((f) => classifyEmail(f.email).kind === "personal").slice(0, MAX_CANDIDATES);
  if (personal.length === 0) return done("C", "generic-only");

  // 3. The AI picks a NUMBER from the list.
  const candidates: PickCandidate[] = personal.map((f, i) => ({
    index: i + 1,
    email: f.email,
    pageUrl: f.pageUrls[0],
    snippet: f.snippet.slice(0, 300),
  }));
  let out: PickOutput;
  aiCalled = true;
  try {
    out = await p.pick({
      business: p.business,
      website: p.website,
      candidates,
      pages: pages.map((pg) => ({ url: pg.url, text: decodeEntities(pg.text).slice(0, PAGE_TEXT_CAP) })),
    });
  } catch (e) {
    const msg = String(e instanceof Error ? e.message : e).replace(/sk-[A-Za-z0-9_\-]+/g, "[redacted]").slice(0, 120);
    return done("C", `ai-error: ${msg}`);
  }
  costUsd += haikuCostUsd(out.usage);

  // 4. Code proves.
  if (!out.choice) return done("C", "no-owner-identified");
  const chosen = candidates.find((c) => c.index === out.choice!.index);
  if (!chosen) return done("C", "bad-index");
  const found = personal[chosen.index - 1];
  if (out.choice.roleType === "other") return done("C", "role-not-owner-or-manager");
  const person = out.choice.personName.trim();
  const title = out.choice.title.trim();
  if (normalizeForMatch(person).split(" ").filter((t) => t.length >= 2).length < 2) return done("C", "name-incomplete");

  const emailPages = pages.filter((pg) => found.pageUrls.includes(pg.url));
  const samePage = emailPages.find((pg) => nameOnPage(pg.norm, person));
  const otherPage = samePage ? undefined : pages.find((pg) => nameOnPage(pg.norm, person));
  if (!samePage && !otherPage) return done("C", "name-not-on-site");

  const proofPage = samePage ?? emailPages[0] ?? pages[0];
  const titleNorm = normalizeForMatch(title);
  const titleSeen = titleNorm.length > 0 && pages.some((pg) => pg.norm.includes(titleNorm));
  const wm = classifyEmail(found.email).webmail;

  return done(samePage ? "A" : "B", samePage ? "ok-same-page" : "ok-other-page", {
    person,
    title,
    email: found.email,
    proofUrl: proofPage.url,
    proofSnippet: found.snippet || `link on ${proofPage.url}`,
    webmail: wm,
    needsHumanCheck: !titleSeen || wm,
  });
}
