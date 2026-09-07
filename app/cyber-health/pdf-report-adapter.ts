/**
 * Adapts the server's authoritative `CyberHealthReport` (built in
 * app/lib/cyber-health-report.ts, never client-trusted) into the flatter
 * `CyberHealthReportData` shape the PDF renderer (pdf-report.tsx) expects.
 *
 * Every field here is derived from real report data — nothing is
 * invented per client. The handful of prose fields the renderer needs
 * that the scoring engine doesn't already produce as a sentence
 * (scoreInterpretation, specialistSupport, reassessment, roadmap
 * "evidence") are built from small, deterministic templates driven by
 * the report's real numbers (score/tier/maturity/finding counts), the
 * same pattern report-data.ts already uses for FINDINGS — never a live
 * per-client AI write-up and never a generic claim unrelated to this
 * client's actual answers.
 */
import type { CyberHealthReport } from "../lib/cyber-health-report";
import { CATEGORY_GROUPS } from "./report-data";
import type { CyberHealthReportData as PdfReportData } from "./pdf-report";

function categoryIdFromFindingId(findingId: string): string[] {
  const match = findingId.match(/^Q(\d+)-/);
  return match ? [match[1]] : [];
}

function formatDate(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "long", day: "numeric" }).format(d);
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

  const findings = report.allFindings.map((f) => ({
    title: f.title,
    severity: f.severity,
    reportedGap: `${f.title} (likelihood: ${f.likelihood}).`,
    impact: f.businessImpact,
    action: f.action,
    categoryIds: categoryIdFromFindingId(f.id),
  }));

  const quickWins = report.quickWins.map((f) => ({ title: f.title, action: f.action }));

  const roadmap = report.roadmap.flatMap((bucket) =>
    bucket.items.map((item) => ({
      period: bucket.label,
      action: item.action,
      evidence: "Confirmed complete once your IT/security contact verifies the change is in place.",
    })),
  );

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
