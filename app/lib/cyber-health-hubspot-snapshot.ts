/**
 * Converts the SAME authoritative server report used for the PDF/emails
 * (buildCyberHealthReport's output) into the AssessmentSnapshot shape
 * consumed by formatAssessmentNotes/latestAssessmentProperties in
 * cyber-health-hubspot-note.ts. Pure, synchronous, no network calls.
 *
 * Per Cyber_Health_HubSpot_Claude_Handoff.md: every field here is copied
 * from real server data — nothing is guessed, re-derived, or invented.
 * assessmentId is NOT generated here; it's the caller's durable job
 * identifier, created once when the assessment is first accepted, so a
 * retry of the same submission reuses it rather than minting a new one.
 */
import type { CyberHealthReport, CyberHealthSubmission } from "./cyber-health-report";
import { visibleQuestions, SCORING_VERSION } from "./cyber-health-report";
import { qualification as qualificationQuestions } from "../cyber-health/assessment-data";
import type { AssessmentSnapshot } from "./cyber-health-hubspot-note";

export function buildAssessmentSnapshot(
  assessmentId: string,
  report: CyberHealthReport,
  submission: CyberHealthSubmission,
  sourcePath: string,
): AssessmentSnapshot {
  const { profile, qualification, answers } = submission;

  // Only questions actually shown for this platform (matches exactly
  // what buildCyberHealthReport scored) — never invent an answer for a
  // question the person was never asked.
  const visible = visibleQuestions(profile.platform);

  return {
    assessmentId,
    reportId: report.reportId,
    clientReference: report.clientReference,
    completedAt: report.generatedAt.toISOString(),
    scoringVersion: SCORING_VERSION,
    sourcePath,
    profile: {
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      company: profile.company,
      industry: profile.industry,
      province: profile.province,
      employees: profile.employees,
      platform: profile.platform,
    },
    score: report.score,
    tier: report.tier,
    maturity: report.maturity,
    categories: report.categoryScores.map((c) => ({
      id: c.id,
      name: c.name,
      score: c.score,
    })),
    groups: report.groups.map((g) => ({
      name: g.name,
      score: g.score,
      description: g.description,
    })),
    snapshot: report.snapshot.map((s) => ({
      label: s.label,
      score: s.score,
      status: s.status,
    })),
    findings: report.allFindings.map((f) => ({
      id: f.id,
      severity: f.severity,
      title: f.title,
      details: {
        businessImpact: f.businessImpact,
        likelihood: f.likelihood,
        action: f.action,
        effort: f.effort,
        timeRequired: f.timeRequired,
      },
    })),
    qualification: qualificationQuestions
      .filter((q) => qualification[q.id] !== undefined)
      .map((q) => ({ id: q.id, label: q.label, answer: qualification[q.id] })),
    answers: visible
      .filter((q) => answers[q.id] !== undefined)
      .map((q) => ({ id: q.id, label: q.text, answer: answers[q.id] })),
    quickWinIds: report.quickWins.map((f) => f.id),
    roadmap: report.roadmap.map((r) => ({
      label: r.label,
      findingIds: r.items.map((f) => f.id),
    })),
    nextStep: {
      label: report.nextStep.label,
      details: {
        timeline: report.nextStep.timeline,
        why: report.nextStep.why,
        included: report.nextStep.included,
        outcome: report.nextStep.outcome,
      },
    },
  };
}
