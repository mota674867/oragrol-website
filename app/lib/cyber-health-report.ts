/**
 * Server-side authoritative scoring/report builder for the Cyber Health
 * assessment. Mirrors the scoring formula in
 * app/cyber-health/cyber-health-client.tsx (kept in sync deliberately —
 * see the comment there) but is never trusted from the client: the API
 * route recomputes everything here from the raw profile/answers payload,
 * the same principle applied to the Contact form (never trust/fake a
 * result the server didn't independently produce).
 */
import { categories, questions, sections } from "../cyber-health/assessment-data";
import {
  CATEGORY_GROUPS,
  FINDINGS,
  PACKAGE_CONTENT,
  SNAPSHOT_CATEGORIES,
  generateClientReference,
  generateReportId,
  groupDescription,
  maturityLabel,
  recommendedPackage,
  riskTier,
  type Finding,
  type PackageTier,
  type Severity,
} from "../cyber-health/report-data";

export type Answer = "Yes" | "No" | "Not Sure";

export interface Profile {
  company: string;
  industry: string;
  province: string;
  employees: string;
  platform: string;
  name: string;
  email: string;
  phone: string;
}

export interface CyberHealthSubmission {
  profile: Profile;
  qualification: Record<string, string>;
  answers: Record<string, Answer>;
}

export interface CategoryScore {
  id: string;
  name: string;
  weight: number;
  score: number; // 0-100
}

export interface GroupScore {
  name: string;
  score: number; // 0-100, average of member categories
  description: string;
}

export interface SnapshotItem {
  label: string;
  score: number;
  status: "GOOD" | "CRITICAL";
}

export interface CyberHealthReport {
  reportId: string;
  clientReference: string;
  generatedAt: Date;
  nextAssessmentAt: Date;
  profile: Profile;
  score: number;
  tier: "Low" | "Medium" | "High" | "Critical";
  maturity: string;
  categoryScores: CategoryScore[];
  groups: GroupScore[];
  snapshot: SnapshotItem[];
  allFindings: Finding[];
  topRisks: Finding[];
  quickWins: Finding[];
  roadmap: { label: string; items: Finding[] }[];
  recommendedPackage: PackageTier;
  packageContent: (typeof PACKAGE_CONTENT)[PackageTier];
}

const SEVERITY_RANK: Record<Severity, number> = { Critical: 4, High: 3, Medium: 2, Low: 1 };

function visibleQuestions(platform: string) {
  return questions.filter((q) =>
    platform === "Google Workspace" ? !/^Q08-[12]$/.test(q.id) : !q.id.includes("-GWS"),
  );
}

export function buildCyberHealthReport(submission: CyberHealthSubmission): CyberHealthReport {
  const { profile, answers } = submission;
  const visible = visibleQuestions(profile.platform);

  const categoryScores: CategoryScore[] = categories.map((c) => {
    const qs = visible.filter((q) => q.id.startsWith(`Q${c.id}-`));
    const earned = qs.reduce((n, q) => {
      const a = answers[q.id];
      return n + (a === "Yes" ? 2 : a === "Not Sure" ? 1 : 0);
    }, 0);
    return { id: c.id, name: c.name, weight: c.weight, score: qs.length ? (earned / (2 * qs.length)) * 100 : 0 };
  });

  const score = Math.round(
    categoryScores.reduce((n, c) => n + c.score * c.weight, 0) / 38,
  );

  const byId = new Map(categoryScores.map((c) => [c.id, c]));

  const groups: GroupScore[] = CATEGORY_GROUPS.map((g) => {
    const members = g.categoryIds.map((id) => byId.get(id)).filter((c): c is CategoryScore => !!c);
    const avg = members.length ? members.reduce((n, c) => n + c.score, 0) / members.length : 0;
    return { name: g.name, score: Math.round(avg), description: `${g.name} is ${groupDescription(avg)}` };
  });

  const snapshot: SnapshotItem[] = SNAPSHOT_CATEGORIES.map((s) => {
    const members = s.categoryIds.map((id) => byId.get(id)).filter((c): c is CategoryScore => !!c);
    const avg = members.length ? members.reduce((n, c) => n + c.score, 0) / members.length : 0;
    return { label: s.label, score: Math.round(avg), status: avg >= 60 ? "GOOD" : "CRITICAL" };
  });

  const allFindings: Finding[] = visible
    .filter((q) => answers[q.id] && answers[q.id] !== "Yes")
    .map((q) => {
      const entry = FINDINGS[q.id];
      // Every question has an entry (checked at module load in dev); a
      // missing one here would be a real content gap, not a user error,
      // so fail loudly server-side rather than silently drop the finding.
      if (!entry) throw new Error(`No report-data.FINDINGS entry for question ${q.id}`);
      return { id: q.id, ...entry };
    })
    .sort((a, b) => SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity]);

  const topRisks = allFindings.slice(0, 5);
  const quickWins = allFindings.filter((f) => f.effort === "Low").slice(0, 4);

  const roadmap = [
    { label: "Immediate: Days 1-30", items: allFindings.filter((f) => f.severity === "Critical" || f.severity === "High") },
    { label: "Days 31-60", items: allFindings.filter((f) => f.severity === "Medium") },
    { label: "Days 61-90", items: allFindings.filter((f) => f.severity === "Low") },
  ];

  const pkg = recommendedPackage(score);
  const generatedAt = new Date();
  const nextAssessmentAt = new Date(generatedAt);
  nextAssessmentAt.setMonth(nextAssessmentAt.getMonth() + 6);

  return {
    reportId: generateReportId(),
    clientReference: generateClientReference(),
    generatedAt,
    nextAssessmentAt,
    profile,
    score,
    tier: riskTier(score),
    maturity: maturityLabel(score),
    categoryScores,
    groups,
    snapshot,
    allFindings,
    topRisks,
    quickWins,
    roadmap,
    recommendedPackage: pkg,
    packageContent: PACKAGE_CONTENT[pkg],
  };
}

export { sections };
