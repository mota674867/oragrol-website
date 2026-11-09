// ORAGROL Outbound engine — where the engine keeps its state.
//
// Two implementations with the same shape:
//   MemoryStore  — tests and the local pilot runner (can be saved to a file)
//   RedisStore   — production (same Upstash instance as ODO, keys "outbound:*")
// Contact data (names, emails) is business contact data: keep it private.

import { Redis } from "@upstash/redis";
import type { PlanState, SearchPlan } from "./plan";
import type { EmailSet } from "./writer";
import type { Finding } from "./first-look";
import type { Prospect } from "./source-geoapify";

export type LeadStatus = "ready" | "held-quebec" | "needs-writing" | "in-batch" | "approved" | "carry-over";

export type Lead = {
  id: string;
  foundOn: string;
  businessName: string;
  website: string;
  domain: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  postcode: string | null;
  areaId: string;
  sectorId: string;
  size: "small" | "mid";
  personName: string;
  personTitle: string;
  roleType: "owner" | "manager";
  email: string;
  grade: "A" | "B";
  needsHumanCheck: boolean;
  proofUrl: string;
  proofSnippet: string;
  proofPageSha256: string | null;
  findings: Finding[];
  emails: EmailSet | null;
  status: LeadStatus;
  costUsd: number;
  source: string;
  sourceId: string;
};

/** A business that did not become a lead, kept so we learn which sectors and sources to drop. */
export type Reject = {
  date: string;
  businessName: string;
  website: string | null;
  phone: string | null;
  address: string | null;
  areaId: string;
  sectorId: string;
  reason: string;
  /** True when a person could still call the published main line. */
  phoneList: boolean;
};

export type StopReason = "target-reached" | "scan-cap" | "daily-cost-cap" | "monthly-cost-cap" | "plan-exhausted" | "source-error";

export type RunState = {
  date: string;
  status: "running" | "done";
  stoppedBecause: StopReason | null;
  scanned: number;
  skippedDuplicates: number;
  valid: number;
  costUsd: number;
  aiCalls: number;
  writerCalls: number;
  rejectsByReason: Record<string, number>;
  validBySector: Record<string, number>;
  scannedBySector: Record<string, number>;
  /** Businesses taken from the source but not processed yet (so a stopped slice resumes without losing them). */
  pending: Prospect[];
  /** Plan item the pending businesses came from. */
  pendingKey: string | null;
  /** Source offset and size of the page the pending businesses came from. */
  pendingOffset: number;
  pendingTotal: number;
  startedAt: string;
  updatedAt: string;
  finishedAt: string | null;
};

export type Batch = {
  date: string;
  leadIds: string[];
  carryOverIds: string[];
  heldIds: string[];
  status: "waiting-approval" | "approved-sending-off";
  approvedCount: number | null;
  approvedBy: string | null;
  approvedAt: string | null;
};

export interface OutboundStore {
  getPlan(): Promise<SearchPlan | null>;
  savePlan(plan: SearchPlan): Promise<void>;
  getPlanState(): Promise<PlanState>;
  savePlanState(s: PlanState): Promise<void>;
  getRun(date: string): Promise<RunState | null>;
  saveRun(r: RunState): Promise<void>;
  /** Date last seen, or null. Keys come from dedupe.ts. */
  seenOn(key: string): Promise<string | null>;
  markSeen(keys: string[], date: string): Promise<void>;
  isSuppressed(key: string): Promise<boolean>;
  suppress(key: string): Promise<void>;
  saveLead(l: Lead): Promise<void>;
  getLead(id: string): Promise<Lead | null>;
  /** Lead ids with this status, oldest first. */
  leadIdsByStatus(status: LeadStatus): Promise<string[]>;
  addReject(r: Reject): Promise<void>;
  getRejects(date: string): Promise<Reject[]>;
  getBatch(date: string): Promise<Batch | null>;
  saveBatch(b: Batch): Promise<void>;
  addMonthCost(month: string, usd: number): Promise<number>;
  getMonthCost(month: string): Promise<number>;
}

export class MemoryStore implements OutboundStore {
  plan: SearchPlan | null = null;
  planState: PlanState = {};
  runs: Record<string, RunState> = {};
  seen: Record<string, string> = {};
  suppressed = new Set<string>();
  leads: Record<string, Lead> = {};
  rejects: Reject[] = [];
  batches: Record<string, Batch> = {};
  monthCost: Record<string, number> = {};

  async getPlan() { return this.plan; }
  async savePlan(p: SearchPlan) { this.plan = p; }
  async getPlanState() { return structuredClone(this.planState); }
  async savePlanState(s: PlanState) { this.planState = structuredClone(s); }
  async getRun(d: string) { return this.runs[d] ? structuredClone(this.runs[d]) : null; }
  async saveRun(r: RunState) { this.runs[r.date] = structuredClone(r); }
  async seenOn(k: string) { return this.seen[k] ?? null; }
  async markSeen(keys: string[], d: string) { for (const k of keys) this.seen[k] = d; }
  async isSuppressed(k: string) { return this.suppressed.has(k); }
  async suppress(k: string) { this.suppressed.add(k); }
  async saveLead(l: Lead) { this.leads[l.id] = structuredClone(l); }
  async getLead(id: string) { return this.leads[id] ? structuredClone(this.leads[id]) : null; }
  async leadIdsByStatus(s: LeadStatus) {
    return Object.values(this.leads).filter((l) => l.status === s).sort((a, b) => a.foundOn.localeCompare(b.foundOn) || a.id.localeCompare(b.id)).map((l) => l.id);
  }
  async addReject(r: Reject) { this.rejects.push(structuredClone(r)); }
  async getRejects(d: string) { return this.rejects.filter((r) => r.date === d); }
  async getBatch(d: string) { return this.batches[d] ? structuredClone(this.batches[d]) : null; }
  async saveBatch(b: Batch) { this.batches[b.date] = structuredClone(b); }
  async addMonthCost(m: string, usd: number) { this.monthCost[m] = (this.monthCost[m] ?? 0) + usd; return this.monthCost[m]; }
  async getMonthCost(m: string) { return this.monthCost[m] ?? 0; }

  toJSON() {
    return { plan: this.plan, planState: this.planState, runs: this.runs, seen: this.seen, suppressed: [...this.suppressed], leads: this.leads, rejects: this.rejects, batches: this.batches, monthCost: this.monthCost };
  }
  static fromJSON(j: ReturnType<MemoryStore["toJSON"]>): MemoryStore {
    const s = new MemoryStore();
    Object.assign(s, { ...j, suppressed: new Set(j.suppressed ?? []) });
    return s;
  }
}

const P = "outbound:";
const DAY = 86_400;

export class RedisStore implements OutboundStore {
  constructor(private r: Redis) {}

  static fromEnv(env: NodeJS.ProcessEnv = process.env): RedisStore {
    const url = env.REDIS_KV_REST_API_URL;
    const token = env.REDIS_KV_REST_API_TOKEN;
    if (!url || !token) throw new Error("REDIS_KV_REST_API_URL / REDIS_KV_REST_API_TOKEN are not configured.");
    return new RedisStore(new Redis({ url, token }));
  }

  async getPlan() { return (await this.r.get<SearchPlan>(`${P}plan`)) ?? null; }
  async savePlan(p: SearchPlan) { await this.r.set(`${P}plan`, p); }
  async getPlanState() { return (await this.r.get<PlanState>(`${P}plan-state`)) ?? {}; }
  async savePlanState(s: PlanState) { await this.r.set(`${P}plan-state`, s); }
  async getRun(d: string) { return (await this.r.get<RunState>(`${P}run:${d}`)) ?? null; }
  async saveRun(x: RunState) { await this.r.set(`${P}run:${x.date}`, x, { ex: 400 * DAY }); }
  async seenOn(k: string) { return (await this.r.get<string>(`${P}seen:${k}`)) ?? null; }
  async markSeen(keys: string[], d: string) {
    if (keys.length === 0) return;
    const p = this.r.pipeline();
    for (const k of keys) p.set(`${P}seen:${k}`, d, { ex: 400 * DAY });
    await p.exec();
  }
  async isSuppressed(k: string) { return (await this.r.sismember(`${P}suppressed`, k)) === 1; }
  async suppress(k: string) { await this.r.sadd(`${P}suppressed`, k); }
  async saveLead(l: Lead) {
    const prev = await this.getLead(l.id);
    const p = this.r.pipeline();
    p.set(`${P}lead:${l.id}`, l, { ex: 400 * DAY });
    if (prev && prev.status !== l.status) p.zrem(`${P}status:${prev.status}`, l.id);
    p.zadd(`${P}status:${l.status}`, { score: Date.parse(`${l.foundOn}T00:00:00Z`), member: l.id });
    await p.exec();
  }
  async getLead(id: string) { return (await this.r.get<Lead>(`${P}lead:${id}`)) ?? null; }
  async leadIdsByStatus(s: LeadStatus) { return (await this.r.zrange<string[]>(`${P}status:${s}`, 0, -1)) ?? []; }
  async addReject(x: Reject) {
    await this.r.rpush(`${P}rejects:${x.date}`, x);
    await this.r.expire(`${P}rejects:${x.date}`, 400 * DAY);
  }
  async getRejects(d: string) { return (await this.r.lrange<Reject>(`${P}rejects:${d}`, 0, -1)) ?? []; }
  async getBatch(d: string) { return (await this.r.get<Batch>(`${P}batch:${d}`)) ?? null; }
  async saveBatch(b: Batch) { await this.r.set(`${P}batch:${b.date}`, b, { ex: 400 * DAY }); }
  async addMonthCost(m: string, usd: number) { return Number(await this.r.incrbyfloat(`${P}cost:${m}`, usd)); }
  async getMonthCost(m: string) { return Number((await this.r.get<number | string>(`${P}cost:${m}`)) ?? 0); }
}
