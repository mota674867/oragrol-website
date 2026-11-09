// ORAGROL Lead Finder (pilot) — run a list of businesses with hard limits.
//
// Limits (all enforced here, in code, whatever the AI says):
//   maxCostUsd   stop when the running AI cost reaches the cap
//   targetValid  stop once this many A or B leads are found (optional)
//   maxScan      stop after this many businesses have been scanned
// Because several businesses run at once, the cost can overshoot the cap by at
// most (concurrency x one business), which is a few cents.

import { gradeBusiness, type FetchPage, type LeadResult, type Picker } from "./grade";
import { USD_TO_CAD } from "./cost";

export type Business = { name: string; website: string };

export type RunOptions = {
  businesses: Business[];
  fetchPage: FetchPage;
  pick: Picker;
  maxCostUsd?: number;
  targetValid?: number;
  maxScan?: number;
  concurrency?: number;
  now?: Date;
  onResult?: (r: LeadResult, scanned: number) => void;
};

export type StopReason = "list-finished" | "cost-cap" | "target-reached" | "scan-cap";

export type RunSummary = {
  scanned: number;
  validA: number;
  validB: number;
  rejectedC: number;
  byReason: Record<string, number>;
  needsHumanCheck: number;
  aiCalls: number;
  totalCostUsd: number;
  totalCostCad: number;
  costPerValidLeadUsd: number | null;
  avgMsPerBusiness: number;
  stoppedBecause: StopReason;
};

export async function runPilot(o: RunOptions): Promise<{ results: LeadResult[]; summary: RunSummary }> {
  const maxCost = o.maxCostUsd ?? 7;
  const maxScan = o.maxScan ?? 400;
  const concurrency = Math.max(1, o.concurrency ?? 3);
  const results: LeadResult[] = [];
  let next = 0;
  let cost = 0;
  let valid = 0;
  let stopped: StopReason = "list-finished";

  const worker = async (): Promise<void> => {
    for (;;) {
      if (cost >= maxCost) { stopped = "cost-cap"; return; }
      if (o.targetValid != null && valid >= o.targetValid) { stopped = "target-reached"; return; }
      if (next >= maxScan) { stopped = "scan-cap"; return; }
      if (next >= o.businesses.length) return;
      const biz = o.businesses[next++];
      const r = await gradeBusiness({ business: biz.name, website: biz.website, fetchPage: o.fetchPage, pick: o.pick, now: o.now });
      results.push(r);
      cost += r.costUsd;
      if (r.grade !== "C") valid++;
      o.onResult?.(r, results.length);
    }
  };
  await Promise.all(Array.from({ length: concurrency }, () => worker()));

  return { results, summary: summarize(results, stopped) };
}

export function summarize(results: LeadResult[], stoppedBecause: StopReason): RunSummary {
  const byReason: Record<string, number> = {};
  for (const r of results) byReason[r.reason] = (byReason[r.reason] ?? 0) + 1;
  const validA = results.filter((r) => r.grade === "A").length;
  const validB = results.filter((r) => r.grade === "B").length;
  const totalCostUsd = results.reduce((s, r) => s + r.costUsd, 0);
  const valid = validA + validB;
  return {
    scanned: results.length,
    validA,
    validB,
    rejectedC: results.length - valid,
    byReason,
    needsHumanCheck: results.filter((r) => r.needsHumanCheck && r.grade !== "C").length,
    aiCalls: results.filter((r) => r.aiCalled).length,
    totalCostUsd,
    totalCostCad: totalCostUsd * USD_TO_CAD,
    costPerValidLeadUsd: valid > 0 ? totalCostUsd / valid : null,
    avgMsPerBusiness: results.length ? results.reduce((s, r) => s + r.ms, 0) / results.length : 0,
    stoppedBecause,
  };
}

const CSV_COLUMNS: Array<keyof LeadResult> = [
  "business", "website", "grade", "reason", "person", "title", "roleType", "email", "proofUrl", "proofSnippet",
  "proofDate", "needsHumanCheck", "webmail", "quebecHint", "pagesFetched", "aiCalled", "costUsd", "ms",
];

function csvCell(v: unknown): string {
  const s = v == null ? "" : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(results: LeadResult[]): string {
  const lines = [CSV_COLUMNS.join(",")];
  for (const r of results) lines.push(CSV_COLUMNS.map((c) => csvCell(r[c])).join(","));
  return lines.join("\n") + "\n";
}

/** Minimal CSV reader for the input list (header row: name,website). Handles quoted cells. */
export function parseBusinessCsv(text: string): Business[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') q = false;
      else cell += ch;
    } else if (ch === '"') q = true;
    else if (ch === ",") { row.push(cell); cell = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); cell = "";
      if (row.some((c) => c.trim())) rows.push(row);
      row = [];
    } else cell += ch;
  }
  row.push(cell);
  if (row.some((c) => c.trim())) rows.push(row);
  if (rows.length === 0) return [];
  const header = rows[0].map((h) => h.trim().toLowerCase());
  const ni = header.indexOf("name");
  const wi = header.indexOf("website");
  if (ni < 0 || wi < 0) throw new Error('The list needs a header row with "name" and "website" columns.');
  return rows.slice(1)
    .map((r) => ({ name: (r[ni] ?? "").trim(), website: (r[wi] ?? "").trim() }))
    .filter((b) => b.name && b.website);
}
