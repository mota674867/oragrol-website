// ORAGROL Outbound engine — the nightly run.
//
// Mohammad's rules (2026-11-10), all enforced here in code:
//   - Runs by itself every night; nobody chooses the businesses each day.
//   - Keeps going until 70 valid owner or manager emails are ready, then stops.
//   - Never reads more than 400 business websites in a day.
//   - Hard stop on AI cost: CAD 25 a day, and a monthly cap.
//   - No repeated deals: domain, name + address and email are checked before
//     any paid step; a business seen in the last 90 days is skipped.
//   - Every business that does not become a lead is recorded with a reason;
//     those with a published main phone go on the phone list.
//   - Haiku picks the person (cheap); Sonnet writes the 4 emails (valid leads only).
//   - Quebec leads are held for French and the Law 25 check.
//   - It prepares a daily batch for Mohammad's approval. IT NEVER SENDS.
//
// The run works in slices: each call does as much as fits before `deadline`,
// saves its progress, and the next call carries on. So it fits a serverless
// time limit and survives a crash without losing or repeating work.

import { createHash } from "node:crypto";
import { gradeBusiness, type FetchPage, type Picker } from "../lead-finder/grade";
import { OUTBOUND_LIMITS, SENDING_ENABLED, USD_TO_CAD, type OutboundLimits } from "./config";

// The engine has no sending code. This line fails the build if someone flips the switch without building sending properly.
const _sendingIsOff: false = SENDING_ENABLED;
void _sendingIsOff;
import { DEFAULT_PLAN, nextItems, validatePlan, type SearchPlan } from "./plan";
import type { Prospect, Source } from "./source-geoapify";
import { domainKey, emailKey, isSharedHost, nameKey, registrableDomain } from "./dedupe";
import { parseRobots, robotsAllows, sleep } from "./robots";
import type { FirstLook } from "./first-look";
import { checkEmailSet, writerCostUsd, type Writer } from "./writer";
import type { Batch, Lead, OutboundStore, Reject, RunState, StopReason } from "./store";
import { classifyEmail } from "../lead-finder/emails";

export type EngineDeps = {
  store: OutboundStore;
  source: Source;
  /** Plain page fetch (the engine adds robots.txt and the delay between pages). */
  fetchPage: FetchPage;
  /** Fetch a small text file (robots.txt). Null when missing or unreadable. */
  fetchText: (url: string) => Promise<string | null>;
  pick: Picker;
  /** Null = find leads but do not write emails (cheaper pilot mode). */
  write: Writer | null;
  firstLook: (domain: string) => Promise<FirstLook>;
  /** Optional CRM write (HubSpot). Errors never stop the run. */
  crm?: (lead: Lead) => Promise<void>;
  now?: () => Date;
  limits?: Partial<OutboundLimits>;
  /** Wait between pages of the same site. Default 1500 ms. */
  pageDelayMs?: number;
  log?: (msg: string) => void;
};

export function torontoDate(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Toronto", year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}

function newRun(date: string, nowIso: string): RunState {
  return {
    date, status: "running", stoppedBecause: null, scanned: 0, skippedDuplicates: 0, valid: 0, costUsd: 0,
    aiCalls: 0, writerCalls: 0, rejectsByReason: {}, validBySector: {}, scannedBySector: {}, pending: [],
    pendingKey: null, pendingOffset: 0, pendingTotal: 0, startedAt: nowIso, updatedAt: nowIso, finishedAt: null,
  };
}

const bump = (m: Record<string, number>, k: string, n = 1): void => { m[k] = (m[k] ?? 0) + n; };

function daysSince(a: string, b: string): number {
  return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000);
}

export type SliceResult = { run: RunState; batch: Batch | null; processedThisSlice: number };

export async function runEngineSlice(deps: EngineDeps, opts: { deadline: number }): Promise<SliceResult> {
  const L: OutboundLimits = { ...OUTBOUND_LIMITS, ...deps.limits };
  const now = deps.now ?? (() => new Date());
  const log = deps.log ?? (() => {});
  const { store } = deps;
  const today = torontoDate(now());
  const month = today.slice(0, 7);

  const plan: SearchPlan = (await store.getPlan()) ?? DEFAULT_PLAN;
  const planErrors = validatePlan(plan);
  if (planErrors.length) throw new Error(`Search plan is not valid: ${planErrors.join("; ")}`);

  const run = (await store.getRun(today)) ?? newRun(today, now().toISOString());
  if (run.status === "done") return { run, batch: await store.getBatch(today), processedThisSlice: 0 };
  let planState = await store.getPlanState();
  let processed = 0;

  const save = async (): Promise<void> => { run.updatedAt = now().toISOString(); await store.saveRun(run); };
  const sectorOf = (id: string) => plan.sectors.find((s) => s.id === id);

  const stopReason = async (): Promise<StopReason | null> => {
    if (run.valid >= L.targetValid) return "target-reached";
    if (run.scanned >= L.maxScanPerDay) return "scan-cap";
    if (run.costUsd * USD_TO_CAD >= L.dailyCostCapCad) return "daily-cost-cap";
    if ((await store.getMonthCost(month)) * USD_TO_CAD >= L.monthlyCostCapCad) return "monthly-cost-cap";
    return null;
  };

  const reject = async (p: Prospect, reason: string): Promise<void> => {
    bump(run.rejectsByReason, reason);
    const r: Reject = {
      date: today, businessName: p.name, website: p.website, phone: p.phone, address: p.address,
      areaId: p.areaId, sectorId: p.sectorId, reason, phoneList: !!p.phone && reason !== "do-not-contact" && reason !== "duplicate",
    };
    await store.addReject(r);
  };

  const addCost = async (usd: number): Promise<void> => {
    if (usd <= 0) return;
    run.costUsd += usd;
    await store.addMonthCost(month, usd);
  };

  /** One business, start to finish. */
  const processOne = async (p: Prospect): Promise<void> => {
    if (!p.website) return reject(p, "no-website");
    const domain = registrableDomain(p.website);
    if (!domain || isSharedHost(domain)) return reject(p, "no-own-website");

    const keys = [domainKey(domain), nameKey(p.name, p.postcode ?? p.address)];
    for (const k of keys) {
      if (await store.isSuppressed(k)) return reject(p, "do-not-contact");
      const seen = await store.seenOn(k);
      if (seen && daysSince(seen, today) < L.restDays) { run.skippedDuplicates++; bump(run.rejectsByReason, "duplicate"); return; }
    }
    await store.markSeen(keys, today);

    // robots.txt and a polite pause between pages of the same site.
    let origin: string;
    try { origin = new URL(/^https?:\/\//i.test(p.website) ? p.website : `https://${p.website}`).origin; } catch { return reject(p, "no-own-website"); }
    const robotsText = await deps.fetchText(`${origin}/robots.txt`).catch(() => null);
    const robots = robotsText ? parseRobots(robotsText) : [];
    if (!robotsAllows(robots, "/")) return reject(p, "robots-blocked");

    const html = new Map<string, string>();
    let chain: Promise<unknown> = Promise.resolve();
    let first = true;
    const politeFetch: FetchPage = (url) => {
      const job = chain.then(async () => {
        let path = "/";
        try { path = new URL(url).pathname || "/"; } catch { return null; }
        if (!robotsAllows(robots, path)) return null;
        if (!first) await sleep(deps.pageDelayMs ?? 1500);
        first = false;
        const pg = await deps.fetchPage(url);
        if (pg) html.set(pg.url, pg.html);
        return pg;
      });
      chain = job.catch(() => null);
      return job;
    };

    run.scanned++;
    bump(run.scannedBySector, p.sectorId);
    const g = await gradeBusiness({ business: p.name, website: p.website, fetchPage: politeFetch, pick: deps.pick, now: now() });
    if (g.aiCalled) run.aiCalls++;
    await addCost(g.costUsd);
    if (g.grade === "C" || !g.email || !g.person || !g.title || !g.proofUrl || (g.roleType !== "owner" && g.roleType !== "manager")) {
      return reject(p, g.reason);
    }

    const ek = emailKey(g.email);
    if (await store.isSuppressed(ek)) return reject(p, "do-not-contact");
    const seenEmail = await store.seenOn(ek);
    if (seenEmail && daysSince(seenEmail, today) < L.restDays) { run.skippedDuplicates++; bump(run.rejectsByReason, "duplicate"); return; }
    await store.markSeen([ek], today);

    const sector = sectorOf(p.sectorId);
    const quebec = (p.province ?? "").toUpperCase() === "QC" || g.quebecHint;
    const proofHtml = html.get(g.proofUrl);

    const lead: Lead = {
      id: createHash("sha256").update(`${domain}|${g.email}`).digest("hex").slice(0, 16),
      foundOn: today, businessName: p.name, website: p.website, domain, phone: p.phone, address: p.address,
      city: p.city, province: p.province, postcode: p.postcode, areaId: p.areaId, sectorId: p.sectorId,
      size: sector?.size ?? "small", personName: g.person, personTitle: g.title, roleType: g.roleType,
      email: g.email, grade: g.grade, needsHumanCheck: g.needsHumanCheck, proofUrl: g.proofUrl,
      proofSnippet: g.proofSnippet ?? "", proofPageSha256: proofHtml ? createHash("sha256").update(proofHtml).digest("hex") : null,
      findings: [], emails: null, status: quebec ? "held-quebec" : "ready", costUsd: g.costUsd,
      source: p.source, sourceId: p.sourceId,
    };

    if (!quebec) {
      const emailDomain = g.email.split("@")[1]?.toLowerCase() ?? domain;
      const checkDomain = classifyEmail(g.email).webmail ? domain : emailDomain;
      lead.findings = (await deps.firstLook(checkDomain).catch(() => null))?.findings ?? [];
      if (deps.write) {
        run.writerCalls++;
        try {
          const w = await deps.write({
            businessName: p.name, personName: g.person, personTitle: g.title, sectorLabel: sector?.label ?? p.sectorId,
            size: lead.size, city: p.city, findings: lead.findings,
          });
          const wc = writerCostUsd(w.usage);
          lead.costUsd += wc;
          await addCost(wc);
          const problems = checkEmailSet(w.emails, {
            businessName: p.name, personName: g.person, personTitle: g.title, sectorLabel: sector?.label ?? "", size: lead.size, city: p.city, findings: lead.findings,
          });
          if (problems.length === 0) lead.emails = w.emails;
          else { lead.status = "needs-writing"; log(`writer checks failed for ${p.name}: ${problems.join("; ")}`); }
        } catch (e) {
          const u = (e as { usage?: { input_tokens: number; output_tokens: number } }).usage;
          const wc = writerCostUsd(u);
          lead.costUsd += wc;
          await addCost(wc);
          lead.status = "needs-writing";
          log(`writer error for ${p.name}: ${String(e instanceof Error ? e.message : e).slice(0, 120)}`);
        }
      } else {
        lead.status = "needs-writing";
      }
    }

    await store.saveLead(lead);
    run.valid++;
    bump(run.validBySector, p.sectorId);
    if (deps.crm) await deps.crm(lead).catch((e) => log(`CRM write failed for ${p.name}: ${String(e).slice(0, 120)}`));
  };

  // Main loop.
  for (;;) {
    const stop = await stopReason();
    if (stop) { run.stoppedBecause = stop; break; }
    if (Date.now() >= opts.deadline) { await save(); return { run, batch: null, processedThisSlice: processed }; }

    if (run.pending.length === 0) {
      const items = nextItems(plan, planState, today, L.restDays);
      if (items.length === 0) { run.stoppedBecause = "plan-exhausted"; break; }
      const item = items[0];
      let page;
      try {
        page = await deps.source(item.area, item.sector, item.offset, L.sourcePageSize);
      } catch (e) {
        log(`source error for ${item.key}: ${String(e instanceof Error ? e.message : e).slice(0, 120)}`);
        run.stoppedBecause = "source-error";
        break;
      }
      planState = { ...planState, [item.key]: page.exhausted ? { offset: 0, finishedOn: today } : { offset: item.offset + L.sourcePageSize } };
      await store.savePlanState(planState);
      // One business per website domain within a page (chains list each branch).
      const seenDomains = new Set<string>();
      run.pending = page.prospects.filter((p) => {
        const d = registrableDomain(p.website);
        if (!d) return true;
        if (seenDomains.has(d)) { run.skippedDuplicates++; bump(run.rejectsByReason, "duplicate"); return false; }
        seenDomains.add(d);
        return true;
      });
      run.pendingKey = item.key;
      run.pendingOffset = item.offset;
      run.pendingTotal = page.prospects.length;
      await save();
      if (page.prospects.length === 0) continue;
    }

    // Take a small group, so the run stops close to the target.
    const room = Math.max(1, Math.min(L.concurrency, L.targetValid - run.valid, L.maxScanPerDay - run.scanned));
    const group = run.pending.slice(0, room);
    run.pending = run.pending.slice(group.length);
    await Promise.all(group.map((p) => processOne(p).catch(async (e) => {
      log(`error on ${p.name}: ${String(e instanceof Error ? e.message : e).slice(0, 120)}`);
      await reject(p, "engine-error");
    })));
    processed += group.length;
    await save();
  }

  // Businesses taken from the source but not reached today: rewind that plan
  // item so tomorrow's run starts with them instead of skipping them.
  if (run.pending.length > 0 && run.pendingKey) {
    const reached = run.pendingTotal - run.pending.length;
    planState = { ...planState, [run.pendingKey]: { offset: run.pendingOffset + Math.max(0, reached) } };
    await store.savePlanState(planState);
    run.pending = [];
  }
  run.status = "done";
  run.finishedAt = now().toISOString();
  await save();
  const batch = await buildBatch(store, today, L.sendPerDay);
  log(`run finished: ${run.stoppedBecause}; valid ${run.valid}, scanned ${run.scanned}, cost CAD ${(run.costUsd * USD_TO_CAD).toFixed(2)}`);
  return { run, batch, processedThisSlice: processed };
}

/** Today's batch: the oldest ready leads first (yesterday's spares go first), up to sendPerDay. */
export async function buildBatch(store: OutboundStore, date: string, sendPerDay: number): Promise<Batch> {
  const existing = await store.getBatch(date);
  if (existing) return existing;
  const ready = await store.leadIdsByStatus("ready");
  const chosen = ready.slice(0, sendPerDay);
  for (const id of chosen) {
    const l = await store.getLead(id);
    if (l) await store.saveLead({ ...l, status: "in-batch" });
  }
  const held = [];
  for (const id of await store.leadIdsByStatus("held-quebec")) {
    const l = await store.getLead(id);
    if (l?.foundOn === date) held.push(id);
  }
  const batch: Batch = {
    date, leadIds: chosen, carryOverIds: ready.slice(sendPerDay), heldIds: held,
    status: "waiting-approval", approvedCount: null, approvedBy: null, approvedAt: null,
  };
  await store.saveBatch(batch);
  return batch;
}

/**
 * Mohammad's daily approval. `count` lets him send fewer today; the rest go
 * back to "ready" and lead tomorrow's batch. Sending is OFF: the batch is
 * marked approved and nothing leaves. The dashboard must call this only after
 * the existing approvals gate has recorded his approval.
 */
export async function approveBatch(store: OutboundStore, date: string, count: number, approvedBy: string, at: Date = new Date()): Promise<Batch> {
  const b = await store.getBatch(date);
  if (!b) throw new Error(`No batch for ${date}.`);
  if (b.status !== "waiting-approval") throw new Error(`The batch for ${date} is already approved.`);
  if (!Number.isInteger(count) || count < 1 || count > b.leadIds.length) throw new Error(`Approve between 1 and ${b.leadIds.length}.`);
  const approved = b.leadIds.slice(0, count);
  const back = b.leadIds.slice(count);
  for (const id of approved) { const l = await store.getLead(id); if (l) await store.saveLead({ ...l, status: "approved" }); }
  for (const id of back) { const l = await store.getLead(id); if (l) await store.saveLead({ ...l, status: "ready" }); }
  const next: Batch = {
    ...b, leadIds: approved, carryOverIds: [...back, ...b.carryOverIds],
    status: "approved-sending-off",
    approvedCount: count, approvedBy, approvedAt: at.toISOString(),
  };
  await store.saveBatch(next);
  return next;
}
