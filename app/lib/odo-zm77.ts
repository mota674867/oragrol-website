// ORAGROL ODO -> ZM77 link.
//
// After a scan ends, a copy of the report goes to ZM77 (the review brain) as ODO's own role, ORs4.
// ZM77 runs its quality checks, sends faults back for correction, and puts the report in front of
// Mohammad. This file only TRANSLATES and SENDS. It never changes the report, the PDF, the scan
// questions, the research or the AI cost. It runs after the visitor already has their result,
// never throws, and does nothing at all unless the two env vars below are set.
//
// Env (Vercel): ZM77_BASE_URL (the Container App address, no trailing slash), ZM77_ORS4_KEY (ODO's key).

import { createHash } from "crypto";
import type { OdoReport, ReportFinding } from "./odo-report";
import type { OdoSession } from "./odo-redis";
import { bumpDailyMetric, torontoDateKey } from "./odo-redis";

export const ODO_CONSENT_VERSION = "odo-intake-v1";
const NO_WEBSITE_URL = "no-website.invalid";
const CONTACT_URL = "https://orgro.ca/contact";
const MAX_REVISIONS = 2; // ZM77 allows 3 rounds; after that it escalates the case to Mohammad himself

type Json = Record<string, unknown>;
type Visitor = Pick<OdoSession, "visitorName" | "visitorEmail" | "visitorCompany" | "visitorWebsite" | "consentTimestamp">;

const hostOf = (u: string | null): string => {
  if (!u) return NO_WEBSITE_URL;
  try { return new URL(/^https?:\/\//i.test(u) ? u : `https://${u}`).hostname.toLowerCase().replace(/^www\./, ""); } catch { return NO_WEBSITE_URL; }
};

function visitorBlock(v: Visitor): Json {
  return {
    name: v.visitorName, email: v.visitorEmail, company: v.visitorCompany, url: v.visitorWebsite || NO_WEBSITE_URL,
    consent_timestamp: new Date(v.consentTimestamp).toISOString(), consent_version: ODO_CONSENT_VERSION,
  };
}

function toFinding(f: ReportFinding, audience: "client" | "internal"): Json {
  const observed = f.tier === "observed";
  // ZM77 rule: high severity needs observed evidence. Cap an unconfirmed "high" to medium in the copy; the report itself is untouched.
  const capped = !observed && f.severity === "high";
  const fromVisitor = /visitor|answer|interview/i.test(f.source);
  return {
    id: f.id,
    text: f.fact,
    confidence: observed ? "observed" : "inferred",
    ...(observed ? { basis: fromVisitor ? "direct_answer" : "technical_fact", evidence_ids: [f.id], source: f.source } : {}),
    severity: capped ? "medium" : f.severity,
    ...(capped ? { severity_capped: true } : {}),
    polarity: f.polarity,
    audience,
  };
}

/** Pure: turns the finished ODO report into the shape ZM77 checks. */
export function buildZm77Payload(report: OdoReport, sessionId: string, visitor: Visitor, pdfSha256: string): Json {
  const client = report.findings.flatMap((s) => [...s.gaps, ...s.strengths]);
  const findings = [
    ...client.map((f) => toFinding(f, "client")),
    ...report.profile.map((f) => toFinding(f, "client")),
    ...report.internal.internalEvidence.map((f) => toFinding(f, "internal")),
  ];
  const ids = new Set(findings.map((f) => f.id as string));
  const service_matches = report.internal.allMatches
    .filter((m) => m.tier === "recommended" || m.tier === "worth_exploring")
    .map((m) => ({ service_code: m.code, tier: m.tier, score: m.score, finding_ids: m.evidenceIds.filter((id) => ids.has(id)) }));
  const swotText = (xs: unknown): string[] => (Array.isArray(xs) ? xs.map((x) => (typeof x === "string" ? x : String((x as { text?: string })?.text ?? ""))).filter(Boolean) : []);
  const swot = report.swot as unknown as Record<string, unknown>;
  return {
    session_id: sessionId,
    scan_condition: report.condition,
    reference: report.reference,
    visitor: visitorBlock(visitor),
    business: { domain: hostOf(visitor.visitorWebsite), industry: report.client.industry, size: report.client.businessSize },
    findings,
    swot: { strengths: swotText(swot.strengths), weaknesses: swotText(swot.weaknesses), opportunities: swotText(swot.opportunities), threats: swotText(swot.threats) },
    service_matches,
    custom_service_flag: Boolean(report.internal.customServiceFlag),
    report: { summary: report.summary, outcome: report.outcome, pdf_sha256: pdfSha256 },
  };
}

/** Pure: the short case sent when ODO stopped without a report. */
export function buildInsufficientPayload(sessionId: string, visitor: Visitor, reason: string): Json {
  return {
    session_id: sessionId, scan_condition: "insufficient_data", visitor: visitorBlock(visitor),
    business: { domain: hostOf(visitor.visitorWebsite) }, findings: [], reason,
  };
}

async function zm77(path: string, method: "GET" | "POST", body?: Json): Promise<{ status: number; json: Json }> {
  const base = process.env.ZM77_BASE_URL?.replace(/\/+$/, "");
  const key = process.env.ZM77_ORS4_KEY;
  if (!base || !key) return { status: 0, json: { skipped: "zm77_not_configured" } };
  const res = await fetch(`${base}${path}`, {
    method, signal: AbortSignal.timeout(15000),
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return { status: res.status, json: (await res.json().catch(() => ({}))) as Json };
}

async function renderPdfSha(report: OdoReport): Promise<string> {
  // Loaded only when a report is actually sent, so the heavy PDF code is not pulled in anywhere else.
  const [{ default: QRCode }, { renderToBuffer }, { OdoReportPdf }, { getCyberHealthReportPhotos }] = await Promise.all([
    import("qrcode"), import("@react-pdf/renderer"), import("./odo-report-pdf"), import("./cyber-health-photos"),
  ]);
  const qrDataUri = await QRCode.toDataURL(CONTACT_URL, { margin: 1, width: 200 }).catch(() => undefined);
  const { cover: coverImageUri, closing: closingImageUri } = getCyberHealthReportPhotos();
  const buf = Buffer.from(await renderToBuffer(OdoReportPdf({ report, qrDataUri, coverImageUri, closingImageUri })));
  return createHash("sha256").update(buf).digest("hex");
}

export async function submitToZm77(payload: Json): Promise<void> {
  let attempt = 0;
  let r = await zm77("/v1/odo/cases", "POST", payload);
  while (r.status === 0 || r.status >= 500) { // not configured / network / server trouble: retry briefly, never block anything
    if (r.status === 0 && (r.json as Json).skipped) { console.warn("[ODO] ZM77 not configured — skipping"); return; }
    if (++attempt > 3) { console.error("[ODO] ZM77 send gave up after retries"); return; }
    await new Promise((ok) => setTimeout(ok, 1500 * attempt));
    r = await zm77("/v1/odo/cases", "POST", payload).catch(() => ({ status: 0, json: {} }));
  }
  // ZM77 found a fault and wants a correction. Nothing can fix the report automatically, so resend until ZM77's own
  // three-round limit escalates the case to Mohammad. It is never lost and never silently dropped.
  let rounds = 0;
  while (r.status < 300 && r.json.stage === "needs_correction" && typeof r.json.case_id === "string" && rounds < MAX_REVISIONS) {
    rounds++;
    r = await zm77(`/v1/odo/cases/${r.json.case_id}/revision`, "POST", { ...payload, resubmission: rounds });
  }
  if (r.status >= 300) console.error("[ODO] ZM77 refused the report:", r.status, JSON.stringify(r.json).slice(0, 300));
  else console.log("[ODO] ZM77 case", r.json.case_id, r.json.stage);
}

export async function sendReportToZm77(report: OdoReport, sessionId: string, visitor: Visitor): Promise<void> {
  try {
    if (!process.env.ZM77_BASE_URL || !process.env.ZM77_ORS4_KEY) return;
    await submitToZm77(buildZm77Payload(report, sessionId, visitor, await renderPdfSha(report)));
  } catch (err) { console.error("[ODO] ZM77 send failed:", err instanceof Error ? err.message : err); }
}

export async function sendInsufficientToZm77(sessionId: string, visitor: Visitor, reason: string): Promise<void> {
  try { await submitToZm77(buildInsufficientPayload(sessionId, visitor, reason)); }
  catch (err) { console.error("[ODO] ZM77 send failed:", err instanceof Error ? err.message : err); }
}

type Metric = "odo_started" | "odo_completed" | "odo_failed" | "odo_blocked" | "odo_ai_spend_cents";

/** Adds to today's (Toronto) running total and tells ZM77 the new total. Never throws. */
export async function countForZm77(metric: Metric, by = 1): Promise<void> {
  try {
    if (!process.env.ZM77_BASE_URL || !process.env.ZM77_ORS4_KEY || by <= 0) return;
    const day = torontoDateKey();
    const total = await bumpDailyMetric(day, metric, by);
    await zm77("/v1/metrics", "POST", { day, metrics: { [metric]: total } });
  } catch (err) { console.error("[ODO] ZM77 metric failed:", err instanceof Error ? err.message : err); }
}
