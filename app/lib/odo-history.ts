// ORAGROL ODO — Wayback Machine staleness signal
//
// Section 33, Area 9: "Derive staleness from Wayback rather than only
// history: no substantive change in 24 months is a neglect proxy feeding
// automation readiness."
//
// GROUND-TRUTH CORRECTION: the master reference's Area 9 text says "Tavily
// and Wayback already run" — that is wrong. Wayback is not wired anywhere in
// this codebase (confirmed by search); `WebPresenceFindings.waybackFirstSeen`
// in odo-research.ts is a stub that has always returned null. This module is
// the actual first implementation, not a "mining an existing source" pass.
//
// Uses the Internet Archive's public CDX API (no key, no rate-limit
// registration) rather than the simpler `/wayback/available` endpoint,
// because staleness requires seeing every *distinct* archived version over
// time, not just the single closest snapshot to one timestamp.
// `collapse=digest` deduplicates consecutive identical-content captures, so
// the remaining rows are exactly the times the page's content actually
// changed — the signal the spec asks for.

import { type Determination, observed, notDetermined, fetchOrDetermine } from "./odo-evidence";
import { normalizeDomain } from "./odo-dns";

export type WaybackHistory = {
  firstSeen: string | null;
  lastSeen: string | null;
  totalDistinctVersions: number;
  /** Distinct content versions captured in roughly the last 24 months. */
  distinctVersionsLast24Months: number;
  /** At most one distinct version in the last 24 months — the neglect proxy the spec calls for. */
  staleFor24Months: boolean;
};

type CdxRow = [string, string]; // [timestamp, digest] per fl=timestamp,digest

function parseCdxTimestamp(ts: string): Date | null {
  // CDX timestamps are 14-digit yyyyMMddHHmmss.
  if (!/^\d{14}$/.test(ts)) return null;
  const iso = `${ts.slice(0, 4)}-${ts.slice(4, 6)}-${ts.slice(6, 8)}T${ts.slice(8, 10)}:${ts.slice(10, 12)}:${ts.slice(12, 14)}Z`;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function checkWaybackHistory(rawDomain: string): Promise<Determination<WaybackHistory>> {
  const domain = normalizeDomain(rawDomain);
  const url = `https://web.archive.org/cdx/search/cdx?url=${encodeURIComponent(domain)}&output=json&collapse=digest&fl=timestamp,digest&filter=statuscode:200&limit=2000`;

  const res = await fetchOrDetermine("wayback:cdx", url, { timeoutMs: 12000 });
  if (res.state !== "observed") return res as Determination<WaybackHistory>;

  let rows: string[][];
  try {
    rows = JSON.parse(res.value.body) as string[][];
  } catch {
    return notDetermined<WaybackHistory>("malformed CDX response", "wayback:cdx");
  }

  // CDX always returns the header row ["timestamp","digest"] first when
  // there is at least one capture, and returns [] (no header) when there
  // are none — that distinction is how "never archived" is told apart from
  // a parse failure.
  if (!Array.isArray(rows) || rows.length === 0) {
    return notDetermined<WaybackHistory>("no Wayback captures found for this domain", "wayback:cdx");
  }
  const dataRows = rows.slice(1) as unknown as CdxRow[];
  if (dataRows.length === 0) {
    return notDetermined<WaybackHistory>("Wayback has no successful (HTTP 200) captures for this domain", "wayback:cdx");
  }

  const timestamps = dataRows.map(([ts]) => parseCdxTimestamp(ts)).filter((d): d is Date => d !== null);
  if (timestamps.length === 0) {
    return notDetermined<WaybackHistory>("could not parse any CDX timestamps", "wayback:cdx");
  }
  timestamps.sort((a, b) => a.getTime() - b.getTime());

  const twentyFourMonthsAgo = new Date();
  twentyFourMonthsAgo.setMonth(twentyFourMonthsAgo.getMonth() - 24);
  const recentCount = timestamps.filter((d) => d >= twentyFourMonthsAgo).length;

  return observed(
    {
      firstSeen: timestamps[0].toISOString(),
      lastSeen: timestamps[timestamps.length - 1].toISOString(),
      totalDistinctVersions: timestamps.length,
      distinctVersionsLast24Months: recentCount,
      // A domain last captured long before the 24-month window (recentCount
      // === 0) is at least as stale as one with a single recent capture —
      // both mean "no more than one distinct version has existed recently."
      staleFor24Months: recentCount <= 1,
    },
    "wayback:cdx"
  );
}
