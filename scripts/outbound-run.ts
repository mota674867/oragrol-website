// ORAGROL Outbound engine — LOCAL run (the pilot of the full engine).
//
// Runs the same engine as the nightly route, but keeps its state in a private
// local folder instead of Redis. SENDS NOTHING. Writes nothing to HubSpot
// unless OUTBOUND_HUBSPOT_WRITE=1 is set.
//
// Needs internet, ANTHROPIC_API_KEY and GEOAPIFY_API_KEY in the environment
// (never paste keys in chat). Example, a 50-business pilot capped at CAD 10:
//
//   npx tsx --env-file=.env.local scripts/outbound-run.ts --max-scan 50 --max-cost-cad 10 --write-limit 10
//
// Options:
//   --max-scan 50        websites read (default 400)
//   --target 70          stop at this many valid leads (default 70)
//   --max-cost-cad 10    hard stop on AI cost for this run (default 25)
//   --no-write           find leads only, no Sonnet emails (cheapest)
//   --areas toronto,mississauga   only these plan areas
//   --sectors law,dental          only these plan sectors
//   --out outbound-local          private results folder (git-ignored)
//   --fresh              start from an empty state (forget earlier local runs)

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { runEngineSlice } from "../app/lib/outbound/engine";
import { makeLiveDeps } from "../app/lib/outbound/live";
import { DEFAULT_PLAN } from "../app/lib/outbound/plan";
import { buildDailyReport } from "../app/lib/outbound/report";
import { MemoryStore, type Lead, type Reject } from "../app/lib/outbound/store";

const arg = (n: string): string | undefined => { const i = process.argv.indexOf(`--${n}`); return i >= 0 ? process.argv[i + 1] : undefined; };
const flag = (n: string): boolean => process.argv.includes(`--${n}`);
const num = (n: string, d: number): number => {
  const v = arg(n);
  if (v === undefined) return d;
  const x = Number(v);
  if (!Number.isFinite(x) || x <= 0) throw new Error(`--${n} must be a positive number`);
  return x;
};
const list = (n: string): string[] | null => arg(n)?.split(",").map((s) => s.trim()).filter(Boolean) ?? null;

const cell = (v: unknown): string => { const s = v == null ? "" : String(v); return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
function csv<T>(rows: T[], cols: Array<keyof T>): string {
  return [cols.join(","), ...rows.map((r) => cols.map((c) => cell(r[c])).join(","))].join("\n") + "\n";
}

async function main(): Promise<void> {
  const out = arg("out") ?? "outbound-local";
  mkdirSync(out, { recursive: true });
  const stateFile = `${out}/state.json`;
  const store = !flag("fresh") && existsSync(stateFile) ? MemoryStore.fromJSON(JSON.parse(readFileSync(stateFile, "utf8"))) : new MemoryStore();

  const areas = list("areas");
  const sectors = list("sectors");
  await store.savePlan({
    areas: areas ? DEFAULT_PLAN.areas.filter((a) => areas.includes(a.id)) : DEFAULT_PLAN.areas,
    sectors: sectors ? DEFAULT_PLAN.sectors.filter((s) => sectors.includes(s.id)) : DEFAULT_PLAN.sectors,
  });
  // A local run is its own "day": clear today's finished run so it can run again.
  store.runs = {};
  store.batches = {};

  const deps = makeLiveDeps(store, { writeEmails: !flag("no-write"), log: (m) => console.log(`  ${m}`) });
  deps.limits = { maxScanPerDay: num("max-scan", 400), targetValid: num("target", 70), dailyCostCapCad: num("max-cost-cad", 25) };
  const writeLimit = arg("write-limit") ? num("write-limit", 10) : null;
  if (writeLimit !== null && deps.write) {
    const w = deps.write;
    let n = 0;
    deps.write = async (i) => { if (++n > writeLimit) throw new Error("write limit reached for this local run"); return w(i); };
  }

  console.log(`Outbound local run. Sending: OFF. HubSpot: ${deps.crm ? "ON" : "off"}. Emails: ${deps.write ? "written" : "not written"}.`);
  let res;
  do {
    res = await runEngineSlice(deps, { deadline: Date.now() + 60 * 60 * 1000 });
    writeFileSync(stateFile, JSON.stringify(store.toJSON()));
  } while (res.run.status !== "done");

  const date = res.run.date;
  const leads: Lead[] = Object.values(store.leads).filter((l) => l.foundOn === date);
  const rejects: Reject[] = await store.getRejects(date);
  const report = await buildDailyReport(store, date);
  const stamp = new Date().toISOString().replace(/[:T]/g, "-").slice(0, 16);
  writeFileSync(`${out}/leads-${stamp}.csv`, csv(leads.map((l) => ({ ...l, findings: l.findings.map((f) => f.fact).join(" / "), emails: l.emails ? "yes" : "no" })), [
    "grade", "status", "businessName", "website", "personName", "personTitle", "roleType", "email", "phone", "address", "city", "province",
    "sectorId", "areaId", "proofUrl", "proofSnippet", "needsHumanCheck", "findings", "emails", "costUsd",
  ]));
  writeFileSync(`${out}/rejects-${stamp}.csv`, csv(rejects, ["reason", "businessName", "website", "phone", "address", "areaId", "sectorId", "phoneList"]));
  writeFileSync(`${out}/emails-${stamp}.json`, JSON.stringify(leads.filter((l) => l.emails).map((l) => ({ business: l.businessName, to: l.personName, emails: l.emails })), null, 2));
  writeFileSync(`${out}/report-${stamp}.json`, JSON.stringify(report, null, 2));

  console.log("\n=== Report ===");
  console.log(`Stopped because: ${report.stoppedBecause}`);
  console.log(`Websites read: ${report.businessesScanned}   duplicates skipped: ${report.duplicatesSkipped}   valid leads: ${report.validLeads}`);
  console.log(`AI cost: CAD ${report.costTodayCad}   per valid lead: ${report.costPerValidLeadCad ?? "n/a"}`);
  console.log(`Rejects: ${JSON.stringify(report.rejectsByReason)}   phone list: ${report.phoneListCount}`);
  console.log(`Batch: ${JSON.stringify(report.batch)}`);
  console.log(`Files in ${out}/ (private business contact data: do not share, delete after review).`);
}

main().catch((e) => {
  console.error(String(e instanceof Error ? e.message : e).replace(/sk-[A-Za-z0-9_\-]+/g, "[redacted]"));
  process.exit(1);
});
