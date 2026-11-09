// ORAGROL Lead Finder — PILOT runner. Reads a list of businesses, finds the owner
// or manager email each business PUBLISHED on its own site, grades it A / B / C
// and writes a results file for review.
//
// THIS SENDS NOTHING. No email, no HubSpot, no mailbox. It only reads public
// web pages and calls the cheap model (Haiku) to pick a person.
//
// Needs: internet, and an Anthropic API key in the environment (the key is never
// printed or saved). The planning workspace has neither, so run it on a machine
// that does, for example:
//
//   npx tsx --env-file=.env.local scripts/lead-finder-pilot.ts businesses.csv
//
// Options:
//   --max-cost-usd 7     stop when the AI cost reaches this (default 7, about CAD 10)
//   --target-valid 70    stop once this many A or B leads are found (default: whole list)
//   --max-scan 400       stop after this many businesses (default 400)
//   --concurrency 3      businesses read at the same time (default 3)
//   --no-ai              free dry run: reads sites and finds emails, no AI call, no key needed
//   --out pilot-results  folder for the results (private; git-ignored)
//
// The list is a CSV with a header row:  name,website

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { safeFetch } from "../app/lib/odo-ssrf-guard";
import { makeHaikuPicker } from "../app/lib/lead-finder/ai";
import { parseBusinessCsv, runPilot, toCsv } from "../app/lib/lead-finder/run";
import type { FetchPage, Picker } from "../app/lib/lead-finder/grade";

const UA = "Mozilla/5.0 (compatible; OragrolResearchBot/1.0)";

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}
const flag = (name: string): boolean => process.argv.includes(`--${name}`);
const num = (name: string, dflt?: number): number | undefined => {
  const v = arg(name);
  if (v === undefined) return dflt;
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) throw new Error(`--${name} must be a positive number`);
  return n;
};

const fetchPage: FetchPage = async (url) => {
  try {
    const res = await safeFetch(url, {
      headers: { "user-agent": UA, accept: "text/html,application/xhtml+xml" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    if (!/html|xml/i.test(res.headers.get("content-type") ?? "")) return null;
    const buf = await res.arrayBuffer();
    if (buf.byteLength > 2_000_000) return null;
    return { url: res.url || url, html: new TextDecoder().decode(buf) };
  } catch {
    return null;
  }
};

async function main(): Promise<void> {
  const file = process.argv[2];
  if (!file || file.startsWith("--")) {
    console.error("Usage: npx tsx --env-file=.env.local scripts/lead-finder-pilot.ts businesses.csv [options]");
    process.exit(1);
  }
  const businesses = parseBusinessCsv(readFileSync(file, "utf8"));
  if (businesses.length === 0) throw new Error("The list has no businesses.");

  const noAi = flag("no-ai");
  let pick: Picker;
  if (noAi) {
    pick = async () => ({ choice: null, reason: "dry run: no AI call", usage: null });
  } else {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) {
      console.error("ANTHROPIC_API_KEY is not set. Set it in the environment (never paste it in chat), or use --no-ai for a free dry run.");
      process.exit(1);
    }
    pick = makeHaikuPicker(key);
  }

  console.log(`Businesses in list: ${businesses.length}. Mode: ${noAi ? "dry run (no AI)" : "live (Haiku)"}.`);
  const { results, summary } = await runPilot({
    businesses,
    fetchPage,
    pick,
    maxCostUsd: num("max-cost-usd", 7),
    targetValid: num("target-valid"),
    maxScan: num("max-scan", 400),
    concurrency: num("concurrency", 3),
    onResult: (r, n) => console.log(`${String(n).padStart(3)}  ${r.grade}  ${r.reason.padEnd(26)} ${r.business}`),
  });

  const outDir = arg("out") ?? "pilot-results";
  mkdirSync(outDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:T]/g, "-").slice(0, 16);
  writeFileSync(`${outDir}/lead-finder-${stamp}.csv`, toCsv(results));
  writeFileSync(`${outDir}/lead-finder-${stamp}.json`, JSON.stringify({ summary, results }, null, 2));

  console.log("\n=== Summary ===");
  console.log(`Scanned: ${summary.scanned}   A: ${summary.validA}   B: ${summary.validB}   Rejected (C): ${summary.rejectedC}`);
  console.log("Reasons:", JSON.stringify(summary.byReason));
  console.log(`Reached the AI step (had a non-generic email): ${summary.aiCalls}   Need a human check: ${summary.needsHumanCheck}`);
  console.log(`AI cost: USD ${summary.totalCostUsd.toFixed(4)} (about CAD ${summary.totalCostCad.toFixed(2)})   per valid lead: ${summary.costPerValidLeadUsd === null ? "n/a" : "USD " + summary.costPerValidLeadUsd.toFixed(4)}`);
  console.log(`Average time per business: ${(summary.avgMsPerBusiness / 1000).toFixed(1)} s   Stopped because: ${summary.stoppedBecause}`);
  console.log(`Results saved in ${outDir}/ (private business contact data: do not share, delete after review).`);
}

main().catch((e) => {
  console.error(String(e instanceof Error ? e.message : e).replace(/sk-[A-Za-z0-9_\-]+/g, "[redacted]"));
  process.exit(1);
});
