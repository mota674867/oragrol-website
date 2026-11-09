// Offline tests for the Outbound engine (no internet, no keys, no Redis).
// Run: npx tsx scripts/test-outbound-engine.ts

import assert from "node:assert/strict";
import { approveBatch, runEngineSlice, type EngineDeps } from "../app/lib/outbound/engine";
import { DEFAULT_PLAN, nextItems, planKey, validatePlan, type Area, type SearchPlan, type Sector } from "../app/lib/outbound/plan";
import { domainKey, isSharedHost, nameKey, registrableDomain } from "../app/lib/outbound/dedupe";
import { parseRobots, robotsAllows } from "../app/lib/outbound/robots";
import { findingsFromChecks } from "../app/lib/outbound/first-look";
import { checkEmailSet, parseEmailSet, type EmailSet, type WriterInput } from "../app/lib/outbound/writer";
import { buildDailyReport } from "../app/lib/outbound/report";
import { MemoryStore } from "../app/lib/outbound/store";
import { prospectFromGeoapify, type Prospect, type Source } from "../app/lib/outbound/source-geoapify";
import { SENDING_ENABLED } from "../app/lib/outbound/config";
import { leadNoteBody, splitName } from "../app/lib/outbound/hubspot-sync";
import type { FetchPage, Picker } from "../app/lib/lead-finder/grade";

let pass = 0;
let fail = 0;
async function t(name: string, fn: () => unknown | Promise<unknown>): Promise<void> {
  try { await fn(); pass++; console.log(`PASS  ${name}`); }
  catch (e) { fail++; console.log(`FAIL  ${name}\n      ${e instanceof Error ? e.message : String(e)}`); }
}

// ---------- fixtures ----------
const AREA: Area = { id: "toronto", name: "Toronto", province: "ON", tier: 1, lat: 43.65, lon: -79.38, radiusKm: 10 };
const AREA_QC: Area = { id: "montreal", name: "Montreal", province: "QC", tier: 3, lat: 45.5, lon: -73.56, radiusKm: 10 };
const SECTOR: Sector = { id: "law", label: "Law firms", categories: ["office.lawyer"], size: "mid" };
const PLAN: SearchPlan = { areas: [AREA], sectors: [SECTOR] };

type Biz = { name: string; domain: string | null; person: string; title: string; email: string; phone?: string | null; province?: string };
const biz = (i: number, extra: Partial<Biz> = {}): Biz => ({
  name: `Firm ${i} LLP`, domain: `firm${i}.ca`, person: `Jane Doe${String.fromCharCode(65 + (i % 26))}`, title: "Office Manager",
  email: `jane${i}@firm${i}.ca`, phone: `416-555-${String(1000 + i)}`, ...extra,
});
const homepage = (b: Biz): string =>
  `<html><body><h1>${b.name}</h1><p>${b.person}, ${b.title}</p><a href="mailto:${b.email}">${b.email}</a></body></html>`;

function world(list: Biz[], o: { pageSize?: number; robots?: Record<string, string>; areaOf?: (b: Biz) => Area } = {}) {
  const byDomain = new Map(list.filter((b) => b.domain).map((b) => [b.domain!, b]));
  const prospects = (area: Area, sector: Sector): Prospect[] => list.map((b, i) => ({
    name: b.name, website: b.domain ? `https://www.${b.domain}` : null, phone: b.phone ?? null, address: `${i} King St`,
    city: area.name, province: b.province ?? area.province, postcode: `M5H ${i}A${i}`, sourceId: `p${i}`, source: "geoapify" as const,
    areaId: area.id, sectorId: sector.id,
  }));
  let sourceCalls = 0;
  const source: Source = async (area, sector, offset, limit) => {
    sourceCalls++;
    const all = prospects(area, sector);
    const slice = all.slice(offset, offset + limit);
    return { prospects: slice, exhausted: offset + limit >= all.length };
  };
  const fetchPage: FetchPage = async (url) => {
    const u = new URL(url);
    const d = u.hostname.replace(/^www\./, "");
    const b = byDomain.get(d);
    if (!b || (u.pathname !== "/" && u.pathname !== "")) return null;
    return { url: `https://www.${d}/`, html: homepage(b) };
  };
  const fetchText = async (url: string) => {
    const d = new URL(url).hostname.replace(/^www\./, "");
    return o.robots?.[d] ?? null;
  };
  let pickCalls = 0;
  const pick: Picker = async (input) => {
    pickCalls++;
    const d = new URL(input.website).hostname.replace(/^www\./, "");
    const b = byDomain.get(d)!;
    return { choice: { index: 1, personName: b.person, title: b.title, roleType: "manager" }, reason: "test", usage: { input_tokens: 10_000, output_tokens: 500 } };
  };
  return { source, fetchPage, fetchText, pick, counters: { get sourceCalls() { return sourceCalls; }, get pickCalls() { return pickCalls; } } };
}

const GOOD_SET = (i: WriterInput): EmailSet => {
  const body = (extra: string) => `Hi ${i.personName.split(" ")[0]}, ${extra} This is a short plain note from Oragrol Global about something we noticed when we looked at public records for your business email domain today. Want the one-page summary?`;
  return {
    day0: { subject: "Your email domain", body: body("we checked the public email records for your domain.") },
    day3: { subject: "One more thing", body: body("a second short point about the same records.") },
    day8: { subject: "Catalogue and free scan", body: `Hi ${i.personName.split(" ")[0]}, here is our catalogue {{CATALOGUE_LINK}} and the free Cyber Health scan {{SCAN_LINK}} if you want to see more about how we help a business like yours with security and automation work.` },
    day15: { subject: "Closing the loop", body: `Hi ${i.personName.split(" ")[0]}, I will not write again after this note. If the timing is better later, a reply any time is welcome and we will pick it up from there. Thanks for reading these short notes from Oragrol Global.` },
  };
};

function deps(w: ReturnType<typeof world>, store: MemoryStore, extra: Partial<EngineDeps> = {}): EngineDeps {
  let writes = 0;
  const d: EngineDeps = {
    store, source: w.source, fetchPage: w.fetchPage, fetchText: w.fetchText, pick: w.pick,
    write: async (i) => { writes++; return { emails: GOOD_SET(i), usage: { input_tokens: 1000, output_tokens: 800 } }; },
    firstLook: async (domain) => ({ domain, checkedAt: "x", findings: [{ id: "dmarc-missing", fact: `No DMARC record is published for ${domain}.`, proof: "dns" }] }),
    now: () => new Date("2026-11-10T07:00:00Z"),
    pageDelayMs: 0,
    limits: { targetValid: 5, sendPerDay: 4, maxScanPerDay: 400, dailyCostCapCad: 25, monthlyCostCapCad: 550, concurrency: 2, sourcePageSize: 10 },
    ...extra,
  };
  (d as unknown as { writes: () => number }).writes = () => writes;
  return d;
}
const far = () => Date.now() + 60_000;
const fresh = async (plan: SearchPlan = PLAN) => { const s = new MemoryStore(); await s.savePlan(plan); return s; };

async function main(): Promise<void> {
  // ---- plan ----
  await t("plan: GTA areas come first, resting and paused combinations are skipped", () => {
    const items = nextItems(DEFAULT_PLAN, {}, "2026-11-10", 90);
    assert.equal(items[0].area.tier, 1);
    assert.ok(items.findIndex((i) => i.area.tier === 2) > items.findLastIndex((i) => i.area.tier === 1));
    const state = { [planKey("toronto", "accounting")]: { offset: 0, finishedOn: "2026-10-01" } };
    assert.ok(!nextItems(DEFAULT_PLAN, state, "2026-11-10", 90).some((i) => i.key === planKey("toronto", "accounting")));
    assert.ok(nextItems(DEFAULT_PLAN, state, "2027-01-05", 90).some((i) => i.key === planKey("toronto", "accounting")));
    assert.ok(!nextItems({ ...DEFAULT_PLAN, paused: ["law"] }, {}, "2026-11-10", 90).some((i) => i.sector.id === "law"));
  });
  await t("plan: default plan is valid; a bad plan is refused", () => {
    assert.deepEqual(validatePlan(DEFAULT_PLAN), []);
    assert.ok(validatePlan({ areas: [{ ...AREA, lat: 10 }], sectors: [] }).length >= 2);
    assert.ok(!DEFAULT_PLAN.areas.some((a) => a.province === "QC"), "Quebec is held out of the default plan");
  });

  // ---- source ----
  await t("source: Geoapify place becomes a prospect with website, phone and address", () => {
    const p = prospectFromGeoapify({ name: "Smith Law", website: "https://smithlaw.ca", contact: { phone: "+1 416 555 0100" }, formatted: "1 King St W, Toronto", city: "Toronto", state_code: "ON", postcode: "M5H 1A1", place_id: "abc" }, AREA, SECTOR);
    assert.equal(p?.website, "https://smithlaw.ca");
    assert.equal(p?.phone, "+1 416 555 0100");
    assert.equal(p?.province, "ON");
    assert.equal(prospectFromGeoapify({ website: "x.ca" }, AREA, SECTOR), null);
  });

  // ---- dedupe ----
  await t("dedupe: one key per website domain, provincial domains and platforms handled", () => {
    assert.equal(registrableDomain("https://www.Smith-Law.ca/team"), "smith-law.ca");
    assert.equal(registrableDomain("toronto.smith-law.ca"), "smith-law.ca");
    assert.equal(registrableDomain("firm.on.ca"), "firm.on.ca");
    assert.equal(registrableDomain("not a url"), null);
    assert.ok(isSharedHost(registrableDomain("https://facebook.com/smithlaw")));
    assert.equal(nameKey("Smith Law LLP", "M5H 1A1"), nameKey("smith law", "m5h1a1"));
  });

  // ---- robots ----
  await t("robots: our own rules win over *, longest rule wins, Allow wins a tie", () => {
    const g = parseRobots("User-agent: *\nDisallow: /private\n\nUser-agent: OragrolResearchBot\nDisallow: /\nAllow: /team");
    assert.equal(robotsAllows(g, "/"), false);
    assert.equal(robotsAllows(g, "/team"), true);
    const star = parseRobots("User-agent: *\nDisallow: /private\n");
    assert.equal(robotsAllows(star, "/private/x"), false);
    assert.equal(robotsAllows(star, "/about"), true);
    assert.equal(robotsAllows([], "/"), true);
  });

  // ---- first look ----
  await t("first look: only observed facts become findings, never a timeout", () => {
    const nd = { state: "not_determined" as const, reason: "timeout", source: "x", collectedAt: "x" };
    assert.deepEqual(findingsFromChecks("a.ca", { spf: nd, dmarc: nd }), []);
    const f = findingsFromChecks("a.ca", {
      spf: { state: "absent", source: "x", collectedAt: "x" } as never,
      dmarc: { state: "observed", value: { raw: "v=DMARC1; p=none", policy: "none", isMonitorOnly: true, percentage: 100 }, source: "x", collectedAt: "x" },
    });
    assert.deepEqual(f.map((x) => x.id).sort(), ["dmarc-monitor-only", "spf-missing"]);
    assert.ok(f.every((x) => x.proof.length > 0));
  });

  // ---- writer checks ----
  const WI: WriterInput = { businessName: "Firm", personName: "Jane Doe", personTitle: "Office Manager", sectorLabel: "Law", size: "mid", city: "Toronto", findings: [{ id: "x", fact: "No DMARC record is published for firm.ca.", proof: "dns" }] };
  await t("writer: a clean set passes the code checks", () => assert.deepEqual(checkEmailSet(GOOD_SET(WI), WI), []));
  await t("writer: links before day 8, invented numbers, exclamation marks and missing day-8 links are caught", () => {
    const bad = GOOD_SET(WI);
    bad.day0.body += " See https://example.com";
    bad.day3.body += " 87% of firms are hacked!";
    bad.day8.body = bad.day8.body.replace("{{SCAN_LINK}}", "");
    const p = checkEmailSet(bad, WI).join(" | ");
    assert.match(p, /day0: contains a link/);
    assert.match(p, /day3: number "87%"/);
    assert.match(p, /day3: exclamation/);
    assert.match(p, /day8: link placeholders missing/);
  });
  await t("writer: reply parser needs all 4 emails", () => {
    assert.equal(parseEmailSet('{"day0":{"subject":"a","body":"b"}}'), null);
    assert.ok(parseEmailSet(`text ${JSON.stringify(GOOD_SET(WI))} more`));
  });

  // ---- engine ----
  await t("engine: stops at the valid-lead target and builds a batch (60/70 rule scaled down)", async () => {
    const w = world(Array.from({ length: 10 }, (_, i) => biz(i)));
    const s = await fresh();
    const r = await runEngineSlice(deps(w, s), { deadline: far() });
    assert.equal(r.run.status, "done");
    assert.equal(r.run.stoppedBecause, "target-reached");
    assert.equal(r.run.valid, 5);
    assert.equal(r.batch?.leadIds.length, 4);
    assert.equal(r.batch?.carryOverIds.length, 1);
    assert.equal(r.batch?.status, "waiting-approval");
    const lead = await s.getLead(r.batch!.leadIds[0]);
    assert.ok(lead?.emails && lead.proofUrl && lead.proofPageSha256 && lead.phone && lead.address);
    assert.equal(lead?.roleType, "manager");
  });
  await t("engine: never reads more than the scan cap", async () => {
    const list = Array.from({ length: 12 }, (_, i) => biz(i, { email: `info@firm${i}.ca` }));
    const s = await fresh();
    const d = deps(world(list), s);
    d.limits = { ...d.limits, maxScanPerDay: 7, targetValid: 70 };
    const r = await runEngineSlice(d, { deadline: far() });
    assert.equal(r.run.stoppedBecause, "scan-cap");
    assert.equal(r.run.scanned, 7);
    assert.equal(r.run.rejectsByReason["generic-only"], 7);
  });
  await t("engine: stops at the daily CAD cost cap", async () => {
    const s = await fresh();
    const d = deps(world(Array.from({ length: 10 }, (_, i) => biz(i))), s);
    d.limits = { ...d.limits, targetValid: 70, dailyCostCapCad: 0.02 };
    const r = await runEngineSlice(d, { deadline: far() });
    assert.equal(r.run.stoppedBecause, "daily-cost-cap");
    assert.ok(r.run.valid < 10);
  });
  await t("engine: does not start when the monthly cap is already used", async () => {
    const s = await fresh();
    await s.addMonthCost("2026-11", 1000);
    const r = await runEngineSlice(deps(world([biz(1)]), s), { deadline: far() });
    assert.equal(r.run.stoppedBecause, "monthly-cost-cap");
    assert.equal(r.run.scanned, 0);
  });
  await t("engine: duplicates are skipped free (same domain in a page, or seen within 90 days); 90+ days comes back", async () => {
    const s = await fresh();
    await s.markSeen([domainKey("firm1.ca")], "2026-10-01");
    await s.markSeen([domainKey("firm2.ca")], "2026-07-01");
    const list = [biz(1), biz(2), biz(3), { ...biz(3), name: "Firm 3 Branch" }];
    const d = deps(world(list), s);
    d.limits = { ...d.limits, targetValid: 70 };
    const r = await runEngineSlice(d, { deadline: far() });
    assert.equal(r.run.skippedDuplicates, 2);
    assert.equal(r.run.scanned, 2);
    assert.equal(r.run.valid, 2);
  });
  await t("engine: no website, a social page only, robots block and do-not-contact are recorded with reasons; phone list kept", async () => {
    const s = await fresh();
    await s.suppress(domainKey("firm4.ca"));
    const list = [biz(1, { domain: null }), biz(2, { domain: "facebook.com" }), biz(3), biz(4)];
    const w = world(list, { robots: { "firm3.ca": "User-agent: *\nDisallow: /" } });
    const d = deps(w, s);
    d.limits = { ...d.limits, targetValid: 70 };
    const r = await runEngineSlice(d, { deadline: far() });
    assert.equal(r.run.rejectsByReason["no-website"], 1);
    assert.equal(r.run.rejectsByReason["no-own-website"], 1);
    assert.equal(r.run.rejectsByReason["robots-blocked"], 1);
    assert.equal(r.run.rejectsByReason["do-not-contact"], 1);
    const rej = await s.getRejects("2026-11-10");
    assert.equal(rej.filter((x) => x.phoneList).length, 3, "do-not-contact never goes on the phone list");
    assert.equal(w.counters.pickCalls, 0, "no AI paid for any of them");
  });
  await t("engine: Quebec leads are held and no email is written for them", async () => {
    const s = await fresh({ areas: [AREA_QC], sectors: [SECTOR] });
    const d = deps(world([biz(1)]), s);
    const r = await runEngineSlice(d, { deadline: far() });
    const lead = Object.values(s.leads)[0];
    assert.equal(lead.status, "held-quebec");
    assert.equal(lead.emails, null);
    assert.equal((d as unknown as { writes: () => number }).writes(), 0);
    assert.equal(r.batch?.heldIds.length, 1);
    assert.equal(r.batch?.leadIds.length, 0);
  });
  await t("engine: a writer failure or bad emails leave the lead as needs-writing, never in the batch", async () => {
    const s = await fresh();
    const d = deps(world([biz(1), biz(2)]), s);
    let n = 0;
    d.write = async (i) => {
      n++;
      if (n === 1) throw new Error("boom");
      const bad = GOOD_SET(i); bad.day0.body += " www.x.com"; return { emails: bad, usage: null };
    };
    d.limits = { ...d.limits, targetValid: 70 };
    const r = await runEngineSlice(d, { deadline: far() });
    assert.equal(r.run.valid, 2);
    assert.deepEqual(Object.values(s.leads).map((l) => l.status), ["needs-writing", "needs-writing"]);
    assert.equal(r.batch?.leadIds.length, 0);
  });
  await t("engine: --no-write mode finds leads without calling Sonnet", async () => {
    const s = await fresh();
    const r = await runEngineSlice(deps(world([biz(1)]), s, { write: null }), { deadline: far() });
    assert.equal(r.run.valid, 1);
    assert.equal(r.run.writerCalls, 0);
  });
  await t("engine: runs in slices and resumes without losing or repeating a business", async () => {
    const s = await fresh();
    const w = world(Array.from({ length: 6 }, (_, i) => biz(i)));
    const d = deps(w, s);
    const slowFetch: FetchPage = async (u) => { await new Promise((r) => setTimeout(r, 20)); return w.fetchPage(u); };
    d.fetchPage = slowFetch;
    d.limits = { ...d.limits, targetValid: 70 };
    let deadlineHits = 0;
    let r = await runEngineSlice(d, { deadline: Date.now() + 30 });
    let guard = 0;
    while (r.run.status !== "done" && guard++ < 20) {
      deadlineHits++;
      r = await runEngineSlice(d, { deadline: guard < 3 ? Date.now() + 30 : far() });
    }
    assert.ok(deadlineHits >= 1, "the run really was split into slices");
    assert.equal(r.run.status, "done");
    assert.equal(r.run.valid, 6);
    assert.equal(r.run.scanned, 6);
    assert.equal(w.counters.pickCalls, 6);
  });
  await t("engine: businesses left on a page when the target is hit are picked up first next time", async () => {
    const s = await fresh();
    const d = deps(world(Array.from({ length: 10 }, (_, i) => biz(i))), s);
    await runEngineSlice(d, { deadline: far() });
    const st = await s.getPlanState();
    assert.equal(st[planKey("toronto", "law")].offset, 5);
    assert.equal(st[planKey("toronto", "law")].finishedOn, undefined);
  });
  await t("engine: a finished area x sector rests, and the run reports the plan is exhausted", async () => {
    const s = await fresh();
    const d = deps(world([biz(1)]), s);
    d.limits = { ...d.limits, targetValid: 70 };
    const r = await runEngineSlice(d, { deadline: far() });
    assert.equal(r.run.stoppedBecause, "plan-exhausted");
    assert.equal((await s.getPlanState())[planKey("toronto", "law")].finishedOn, "2026-11-10");
  });
  await t("engine: a CRM error never stops the run", async () => {
    const s = await fresh();
    const r = await runEngineSlice(deps(world([biz(1), biz(2)]), s, { crm: async () => { throw new Error("hubspot down"); } }), { deadline: far() });
    assert.equal(r.run.valid, 2);
  });
  await t("engine: a finished day is not run twice", async () => {
    const s = await fresh();
    const w = world(Array.from({ length: 10 }, (_, i) => biz(i)));
    await runEngineSlice(deps(w, s), { deadline: far() });
    const calls = w.counters.pickCalls;
    const r = await runEngineSlice(deps(w, s), { deadline: far() });
    assert.equal(r.processedThisSlice, 0);
    assert.equal(w.counters.pickCalls, calls);
  });

  // ---- approval ----
  await t("approval: send fewer today; the rest go back and lead the next batch; nothing is sent", async () => {
    const s = await fresh();
    const w = world(Array.from({ length: 10 }, (_, i) => biz(i)));
    const r = await runEngineSlice(deps(w, s), { deadline: far() });
    const b = await approveBatch(s, r.run.date, 2, "Mohammad", new Date("2026-11-10T14:00:00Z"));
    assert.equal(b.status, "approved-sending-off");
    assert.equal(b.leadIds.length, 2);
    assert.equal(b.carryOverIds.length, 3);
    await assert.rejects(() => approveBatch(s, r.run.date, 1, "Mohammad"));
    const d2 = deps(w, s, { now: () => new Date("2026-11-11T07:00:00Z") });
    const r2 = await runEngineSlice(d2, { deadline: far() });
    assert.deepEqual(r2.batch!.leadIds.slice(0, 3), b.carryOverIds);
    assert.equal(SENDING_ENABLED, false);
  });
  await t("approval: a count outside the batch is refused", async () => {
    const s = await fresh();
    const r = await runEngineSlice(deps(world(Array.from({ length: 10 }, (_, i) => biz(i))), s), { deadline: far() });
    await assert.rejects(() => approveBatch(s, r.run.date, 0, "M"));
    await assert.rejects(() => approveBatch(s, r.run.date, 99, "M"));
  });

  // ---- report ----
  await t("report: cost, cost per lead, month forecast, rejects and batch counts", async () => {
    const s = await fresh();
    const r = await runEngineSlice(deps(world(Array.from({ length: 10 }, (_, i) => biz(i))), s), { deadline: far() });
    const rep = await buildDailyReport(s, r.run.date);
    assert.equal(rep.validLeads, 5);
    assert.ok(rep.costTodayCad > 0);
    assert.ok(rep.costPerValidLeadCad! > 0);
    assert.equal(rep.monthForecastCad, Math.round(((rep.monthCostCad / 10) * 30) * 100) / 100);
    assert.equal(rep.batch?.toApprove, 4);
    assert.equal(rep.sendingEnabled, false);
    assert.equal((await buildDailyReport(s, "2026-12-01")).status, "not-started");
  });

  // ---- HubSpot mapping ----
  await t("HubSpot: name split and note carry proof, grade, source and 'not contacted yet'", async () => {
    assert.deepEqual(splitName("Dr. Jane Mary Doe"), { first: "Jane", last: "Mary Doe" });
    const s = await fresh();
    await runEngineSlice(deps(world([biz(1)]), s), { deadline: far() });
    const note = leadNoteBody(Object.values(s.leads)[0]);
    for (const part of ["NOT CONTACTED YET", "Proof:", "Grade: A", "Source: geoapify", "Main phone"]) assert.ok(note.includes(part), part);
  });

  console.log(`\n${pass} passed, ${fail} failed`);
  if (fail) process.exit(1);
}

main();
