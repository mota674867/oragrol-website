/**
 * Permanent Business Automation job registry — 6 entries, one per job
 * in app/business-automation/ba-client.tsx's `jobs` array.
 *
 * Same problem as OR ONE, same discipline as
 * or-one-capability-registry.ts: each job's existing `index` field
 * ("01"-"06") is exactly the kind of bare, position-derived label the
 * My Scope spec warns against trusting as a permanent code — it's a
 * *display* index, not designed to be permanent or unique beyond this
 * one array. `id` (e.g. "sales-flow") IS already a real stable
 * identifier — used as the ScopeTray id (`automation:${job.id}`) and
 * confirmed unchanged by the 2026-09-08 rename session — so `code`
 * here is keyed to `id`, not recomputed from array position.
 *
 * Assigned once (2026-09-09) from current order as a one-time
 * reference. Renaming a job's display name or reordering the array
 * must never change its code here.
 */

export type BusinessAutomationJobRegistryEntry = {
  /** Matches Job.id in ba-client.tsx — the true stable anchor. */
  id: string;
  /** Permanent, human-readable — BA0X. */
  code: string;
  /** Frozen at assignment time (2026-09-09) — see file header. */
  name: string;
};

export const BUSINESS_AUTOMATION_JOB_REGISTRY: readonly BusinessAutomationJobRegistryEntry[] = [
  { id: "sales-flow", code: "BA-01", name: "Sales" },
  { id: "customer-support", code: "BA-02", name: "Customer Service" },
  { id: "operational-intelligence", code: "BA-03", name: "Finance" },
  { id: "managed-it", code: "BA-04", name: "IT" },
  { id: "customer-growth", code: "BA-05", name: "Marketing" },
  { id: "tailored", code: "BA-06", name: "Tailored Automation" },
];

export const BUSINESS_AUTOMATION_JOB_BY_ID: ReadonlyMap<string, BusinessAutomationJobRegistryEntry> =
  new Map(BUSINESS_AUTOMATION_JOB_REGISTRY.map((j) => [j.id, j]));
