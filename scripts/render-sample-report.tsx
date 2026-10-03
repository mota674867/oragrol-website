// Renders a synthetic sample ODO report PDF for visual checks (no API keys needed).
// @react-pdf only runs bundled, so: esbuild scripts/render-sample-report.tsx --bundle --platform=node --format=cjs
//   --jsx=automatic --external:@react-pdf/renderer --external:react --outfile=/tmp/r.cjs && node /tmp/r.cjs out.pdf
import { renderToBuffer } from "@react-pdf/renderer";
import { writeFileSync } from "fs";
import { OdoReportPdf } from "../app/lib/odo-report-pdf";
import { PROTECTION_LINE, type OdoReport } from "../app/lib/odo-report";

const now = new Date().toISOString();
const f = (id: string, fact: string, extra: Partial<OdoReport["findings"][number]["gaps"][number]> = {}) => ({ id, fact, raw: undefined, source: "Public DNS", tier: "observed" as const, severity: "high" as const, polarity: "gap" as const, framework: "CIS 9", collectedAt: now, ...extra });
const report = {
  version: 1, reference: "ODO-20261003-SAMPLE", status: "draft_pending_review", generatedAt: now, condition: "complete", outcome: "gaps_found",
  client: { company: "Sample Dental Clinic", website: "https://sampledental.ca", industry: "Dental clinic", businessSize: "small" },
  summary: "ODO reviewed the public footprint and your answers and found 2 confirmed gaps.",
  headline: { confirmedGaps: 2, highSeverity: 1, recommended: 1, worthExploring: 0, strengths: 2, endScreen: { criticalSecurity: 1, salesMarketingGaps: 0, automationOpportunities: 0 } },
  findings: [{ area: "email", label: "Email security", gaps: [f("E1", "DMARC is set to monitor only, so anyone can send email pretending to be you.", { raw: "v=DMARC1; p=none; rua=mailto:dmarc@sampledental.ca" }), f("E2", "Staff share one front-desk login for the booking system.", { source: "Visitor answer", raw: 'Q: t3 → "we all use the same login at reception"', severity: "medium" })], strengths: [f("S1", "SPF record published and ends -all.", { polarity: "strength", severity: "info" }), f("S2", "Website uses HTTPS everywhere.", { polarity: "strength", severity: "info" })] }],
  profile: [], swot: { summary: "", strengths: [{ text: "Strong SPF", evidence: ["S1"] }], weaknesses: [{ text: "DMARC monitor only", evidence: ["E1"] }, { text: "Shared logins", evidence: ["E2"] }, { text: "x", evidence: ["E2"] }, { text: "4th cut", evidence: ["E2"] }], opportunities: [], threats: [{ text: "Impersonation", evidence: ["E1"] }], generatedBy: "claude", droppedPoints: 0 },
  priorities: { recommended: [], worthExploring: [] },
  securityLane: { recommendation: { kind: "none" }, individualOffers: [] },
  automationLane: { recommendation: { kind: "none" } },
  outcomeNarrative: { situationNow: "Two fixable gaps.", securityOutlook: "Close them.", automationOpportunity: null, automationBenefits: [] },
  websitePointers: [], coverage: { checksAnswered: 20, notDetermined: [], note: "All automated checks completed." }, attributions: [],
  benchmark: { metric: "dmarc_enforced", compared: 3, competitorsWith: 2, self: false, line: "2 of 3 similar businesses near you enforce email anti-impersonation protection (DMARC); sampledental.ca does not yet.", checkedAt: now },
  quickWin: "Change your DMARC record from p=none to p=quarantine once your reports show only your own mail servers sending — it stops look-alike invoices from reaching inboxes.",
  recheckFrom: new Date(Date.now() + 90 * 86400000).toISOString(), protectionLine: PROTECTION_LINE,
  internal: {},
} as unknown as OdoReport;

renderToBuffer(<OdoReportPdf report={report} />).then((b) => { writeFileSync(process.argv[2], b); console.log("bytes", b.length); });
