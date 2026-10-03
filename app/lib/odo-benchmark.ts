// ORAGROL ODO — Competitor benchmark line (Master Reference §37.7)
//
// "2 of 3 similar firms near you enforce email anti-impersonation
// protection; this domain does not." One plain, checkable comparison that
// makes a finding land harder than any adjective.
//
// Guardrails (Section 36 competitor rules):
//   - Passive only: a public DNS lookup of each competitor's _dmarc record,
//     exactly what any mail server does when it receives their email.
//   - Aggregate only: the line gives a count, never names which competitor
//     does or doesn't — no rankings, no "worse than X".
//   - Only when it is solid: at least 2 competitors actually determined, and
//     the visitor's own status determined too. Otherwise no line at all.

import { checkDmarc, normalizeDomain } from "./odo-dns";
import { reportableCompetitors, type CompetitorProfile } from "./odo-competitors";

export type Benchmark = {
  metric: "dmarc_enforced";
  compared: number;
  competitorsWith: number;
  self: boolean;
  line: string;
  checkedAt: string;
};

const enforced = (d: Awaited<ReturnType<typeof checkDmarc>>): boolean | null =>
  d.state === "observed" ? d.value.policy === "quarantine" || d.value.policy === "reject" : d.state === "absent" ? false : null;

async function within<T>(p: Promise<T>, ms: number): Promise<T | null> {
  return Promise.race([p, new Promise<null>((r) => setTimeout(() => r(null), ms))]);
}

export async function buildBenchmark(website: string | null, profiles: CompetitorProfile[] | null): Promise<Benchmark | null> {
  if (!website || !profiles?.length) return null;
  const own = normalizeDomain(website);
  if (!own) return null;
  const domains = reportableCompetitors(profiles)
    .map((c) => (c.website ? normalizeDomain(c.website) : ""))
    .filter((d, i, arr) => d && d !== own && arr.indexOf(d) === i)
    .slice(0, 3);
  if (domains.length < 2) return null;

  const [selfRes, ...compRes] = await Promise.all([own, ...domains].map((d) => within(checkDmarc(d), 8000)));
  const self = selfRes ? enforced(selfRes) : null;
  if (self === null) return null;
  const determined = compRes.map((r) => (r ? enforced(r) : null)).filter((x): x is boolean => x !== null);
  if (determined.length < 2) return null;

  const n = determined.length;
  const k = determined.filter(Boolean).length;
  const what = "enforce email anti-impersonation protection (DMARC)";
  let line: string;
  if (!self && k > 0) line = `${k} of ${n} similar businesses near you ${what}; ${own} does not yet.`;
  else if (!self) line = `None of ${n} similar businesses near you ${what} either — closing this gap would put ${own} ahead of its local peers.`;
  else if (k < n) line = `${own} ${what} — only ${k} of ${n} similar businesses near you do.`;
  else line = `${own} and all ${n} similar businesses near you ${what}.`;

  return { metric: "dmarc_enforced", compared: n, competitorsWith: k, self, line, checkedAt: new Date().toISOString() };
}
