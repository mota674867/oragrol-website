// ORAGROL Outbound engine — the daily report (data behind the Outbound page and the daily PDF).

import { USD_TO_CAD } from "./config";
import type { OutboundStore } from "./store";

export type DailyReport = {
  date: string;
  status: "not-started" | "running" | "done";
  stoppedBecause: string | null;
  businessesScanned: number;
  duplicatesSkipped: number;
  validLeads: number;
  costTodayCad: number;
  costPerValidLeadCad: number | null;
  monthCostCad: number;
  monthForecastCad: number;
  rejectsByReason: Record<string, number>;
  phoneListCount: number;
  yieldBySector: Array<{ sectorId: string; scanned: number; valid: number }>;
  batch: { status: string; toApprove: number; carryOver: number; heldQuebec: number; approvedCount: number | null } | null;
  sendingEnabled: false;
};

const round2 = (n: number): number => Math.round(n * 100) / 100;

export async function buildDailyReport(store: OutboundStore, date: string): Promise<DailyReport> {
  const run = await store.getRun(date);
  const batch = await store.getBatch(date);
  const month = date.slice(0, 7);
  const monthUsd = await store.getMonthCost(month);
  const day = Number(date.slice(8, 10));
  const daysInMonth = new Date(Date.UTC(Number(date.slice(0, 4)), Number(date.slice(5, 7)), 0)).getUTCDate();
  const rejects = await store.getRejects(date);
  const sectors = new Set([...Object.keys(run?.scannedBySector ?? {}), ...Object.keys(run?.validBySector ?? {})]);

  return {
    date,
    status: run ? run.status : "not-started",
    stoppedBecause: run?.stoppedBecause ?? null,
    businessesScanned: run?.scanned ?? 0,
    duplicatesSkipped: run?.skippedDuplicates ?? 0,
    validLeads: run?.valid ?? 0,
    costTodayCad: round2((run?.costUsd ?? 0) * USD_TO_CAD),
    costPerValidLeadCad: run && run.valid > 0 ? round2((run.costUsd * USD_TO_CAD) / run.valid) : null,
    monthCostCad: round2(monthUsd * USD_TO_CAD),
    monthForecastCad: round2(day > 0 ? ((monthUsd * USD_TO_CAD) / day) * daysInMonth : 0),
    rejectsByReason: run?.rejectsByReason ?? {},
    phoneListCount: rejects.filter((r) => r.phoneList).length,
    yieldBySector: [...sectors].map((s) => ({ sectorId: s, scanned: run?.scannedBySector[s] ?? 0, valid: run?.validBySector[s] ?? 0 })),
    batch: batch
      ? { status: batch.status, toApprove: batch.leadIds.length, carryOver: batch.carryOverIds.length, heldQuebec: batch.heldIds.length, approvedCount: batch.approvedCount }
      : null,
    sendingEnabled: false,
  };
}
