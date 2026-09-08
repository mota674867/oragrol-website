/**
 * Adapts the server's authoritative `CyberHealthReport` (built in
 * app/lib/cyber-health-report.ts, never client-trusted) into the shape
 * the six-page PDF renderer (pdf-report.tsx) expects.
 *
 * Every field here is derived from real report data — nothing is
 * invented per client, and nothing is truncated: individual finding
 * titles/impacts/actions render in full on the page (the renderer lists
 * every finding — see COMPACT_THRESHOLD there for the full-card vs
 * compact-row split), and roadmap/quick-win text is composed from real
 * finding titles rather than character-sliced blobs. The prose fields
 * the renderer needs that the scoring engine doesn't already produce as
 * a sentence (scoreInterpretation, specialistSupport, reassessment) are
 * built from small, deterministic templates driven by the report's real
 * numbers — the same pattern report-data.ts uses for FINDINGS — never a
 * live per-client AI write-up and never a generic claim unrelated to
 * this client's actual answers.
 */
import type { CyberHealthReport } from "../lib/cyber-health-report";
import type { Finding as ReportFinding } from "./report-data";
import { CATEGORY_GROUPS } from "./report-data";
import type { CyberHealthReportData as PdfReportData, QuickWin, RoadmapPhase } from "./pdf-report";

function categoryIdFromFindingId(findingId: string): string[] {
  const match = findingId.match(/^Q(\d+)-/);
  return match ? [match[1]] : [];
}

function formatDate(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "long", day: "numeric" }).format(d);
}

/**
 * A concrete-sounding but honestly generic role suggestion — never a
 * named or invented employee. Critical/High findings always point at a
 * security-capable owner; lower-severity items route to whichever role
 * (IT vs. the business side) actually owns that kind of control.
 */
function deriveOwner(f: ReportFinding): string {
  if (f.severity === "Critical" || f.severity === "High") return "IT/security lead (or specialist support if unavailable)";
  const t = `${f.title} ${f.action}`.toLowerCase();
  if (/polic|training|awareness|insurance|vendor|governance|regulator/.test(t)) return "Business owner or office manager";
  return "IT/operations lead";
}

/**
 * A concrete, checkable way to confirm an item is actually done —
 * phrased as something to go verify, never as a claim that it already
 * happened. Falls back to a generic-but-honest check when no keyword
 * matches, rather than inventing a specific artifact we have no
 * evidence exists.
 */
function deriveCheck(f: ReportFinding): string {
  const t = `${f.title} ${f.action}`.toLowerCase();
  if (/mfa|multi-factor|authentication/.test(t)) return "Admin console shows MFA enforced on the accounts named above.";
  if (/backup/.test(t)) return "Backup job history and a completed restore test are on file.";
  if (/password/.test(t)) return "Password manager rollout confirmed; no shared or default passwords remain.";
  if (/training|awareness/.test(t)) return "Training completion record or attendance log is on file.";
  if (/polic/.test(t)) return "A signed, dated policy document is published and accessible to staff.";
  if (/access|permission|offboard|leaver/.test(t)) return "Access review export or offboarding checklist confirms the change.";
  if (/wi-fi|firewall|network/.test(t)) return "Network/firewall configuration export confirms the change is in place.";
  if (/encrypt/.test(t)) return "Configuration screenshot confirms encryption is enabled.";
  if (/vendor/.test(t)) return "Vendor list or security questionnaire responses are on file.";
  return "Confirmation the change is applied and documented (e.g. a screenshot or admin console setting).";
}

function buildRoadmapPhase(period: string, items: readonly ReportFinding[], owner: string): RoadmapPhase {
  return {
    period,
    action: items.map((f) => `• ${f.title}`).join("\n"),
    evidence: "Evidence to collect: e.g. admin console confirmation, updated policy documents, or configuration exports showing each item above is in place.",
    owner,
  };
}

/**
 * Builds 1-3 real roadmap phases. Sequencing follows urgency and effort
 * (severity always wins for Critical/High; Medium/Low findings are
 * ordered by how much effort they take, not automatically deferred to a
 * later window just because they're Low severity). A phase with no
 * items is omitted rather than rendered as an empty placeholder; if
 * fewer than 3 real phases result, a genuine ongoing-review phase fills
 * the gap instead of a blank card — never invented remediation for
 * issues that don't exist.
 */
function buildRoadmap(allFindings: readonly ReportFinding[]): RoadmapPhase[] {
  const urgent = allFindings.filter((f) => f.severity === "Critical" || f.severity === "High");
  const lowerPriority = allFindings.filter((f) => f.severity === "Medium" || f.severity === "Low");
  const quick = lowerPriority.filter((f) => f.effort === "Low");
  const moderate = lowerPriority.filter((f) => f.effort === "Medium");
  const involved = lowerPriority.filter((f) => f.effort === "High");

  const phases: RoadmapPhase[] = [];
  const immediate = [...urgent, ...quick];
  if (immediate.length) phases.push(buildRoadmapPhase("Immediate — urgent and quick items", immediate, "IT/security lead (or specialist support if unavailable)"));
  if (moderate.length) phases.push(buildRoadmapPhase("Next — moderate-effort items", moderate, "IT/operations lead or business owner"));
  if (involved.length) phases.push(buildRoadmapPhase("Later — higher-effort items", involved, "IT/operations lead (specialist support where needed)"));

  if (phases.length < 3 && allFindings.length) {
    phases.push({
      period: "Ongoing",
      action: "Maintain current controls and monitor for new gaps as the business, staff and tools change.",
      evidence: "Evidence to collect: date of the most recent policy/control review, recorded in your security register.",
      owner: "Business owner or IT lead (periodic review)",
    });
  }
  // Construction guarantees at most 4 entries (3 real + 1 ongoing); cap
  // defensively at the renderer's 3-phase limit.
  return phases.slice(0, 3);
}

export function buildPdfReportData(report: CyberHealthReport): PdfReportData {
  const { profile } = report;
  const categoryScoreById = new Map(report.categoryScores.map((c) => [c.id, c]));
  const groupScoreByName = new Map(report.groups.map((g) => [g.name, g.score]));

  const groups = CATEGORY_GROUPS.map((g) => ({
    name: g.name,
    score: groupScoreByName.get(g.name) ?? 0,
    categories: g.categoryIds
      .map((id) => categoryScoreById.get(id))
      .filter((c): c is NonNullable<typeof c> => !!c)
      .map((c) => ({ id: c.id, name: c.name, score: Math.round(c.score) })),
  }));

  // Full, untruncated finding list — every field here is the real
  // authored content from report-data.ts, already well within a normal
  // paragraph's length. The renderer lists each one in full.
  const findings = report.allFindings.map((f) => ({
    title: f.title,
    severity: f.severity,
    reportedGap: `${f.title} (likelihood: ${f.likelihood}).`,
    impact: f.businessImpact,
    action: f.action,
    categoryIds: categoryIdFromFindingId(f.id),
  }));

  const quickWins: QuickWin[] = report.quickWins.slice(0, 3).map((f) => ({
    title: f.title,
    action: f.action,
    owner: deriveOwner(f),
    check: deriveCheck(f),
  }));

  const roadmap = buildRoadmap(report.allFindings);

  const criticalCount = report.allFindings.filter((f) => f.severity === "Critical").length;
  const scoreInterpretation = criticalCount
    ? `${report.maturity} overall, with ${criticalCount} critical finding${criticalCount === 1 ? "" : "s"} that should be addressed first.`
    : `${report.maturity} overall, with no critical findings in this assessment.`;

  const higherEffortCount = report.allFindings.filter((f) => f.effort !== "Low").length;
  const specialistSupport = higherEffortCount
    ? `${higherEffortCount} of the findings in this assessment involve higher-effort or specialist work (e.g. infrastructure or identity configuration) that typically benefits from hands-on support rather than a self-serve fix.`
    : "Most items in this assessment are low-effort and can typically be handled by your existing IT team or provider.";

  const reassessment = `Recommended reassessment: ${formatDate(report.nextAssessmentAt)}. Cybersecurity is an ongoing process — we recommend reassessing every six months, or sooner after major technology or business changes.`;

  return {
    companyName: profile.company,
    businessSector: profile.industry,
    employeeCount: profile.employees,
    assessmentDate: formatDate(report.generatedAt),
    contactName: profile.name,
    phoneNumber: profile.phone,
    clientReference: report.clientReference,
    // The score box, page-2 subtitle and per-category percentages all
    // read directly from the server's true weighted score/categoryScores
    // (app/lib/cyber-health-report.ts) — never a visual average of the
    // five displayed group percentages, which are unweighted and would
    // not reconcile with the authoritative figure.
    score: report.score,
    scoreInterpretation,
    riskTier: report.tier,
    groups,
    findings,
    quickWins,
    specialistSupport,
    roadmap,
    reassessment,
  };
}
