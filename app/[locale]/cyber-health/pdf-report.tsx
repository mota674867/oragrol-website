import React from "react";
import { Document, Page, Text, View, StyleSheet, Link, Image } from "@react-pdf/renderer";
import { PdfLogo, PdfIconWatermark } from "../../lib/pdf-brand";

export type Severity = "Critical" | "High" | "Medium" | "Low";
export type Finding = { title: string; severity: Severity; reportedGap: string; impact: string; action: string; categoryIds: string[] };
export type Category = { id: string; name: string; score: number };
export type CategoryGroup = { name: string; score: number; categories: Category[] };
export type QuickWin = { title: string; action: string; owner: string; check: string };
export type RoadmapPhase = { period: string; action: string; evidence: string; owner: string };
export type CyberHealthReportData = {
  companyName: string;
  businessSector: string;
  employeeCount: string;
  assessmentDate: string;
  contactName: string;
  phoneNumber: string;
  clientReference: string;
  score: number;
  scoreInterpretation: string;
  /** Existing engine classification, not a commercial tier. */
  riskTier?: string;
  groups: CategoryGroup[];
  /** Complete, authoritative finding list. Rendered in full — never truncated or silently dropped. */
  findings: Finding[];
  quickWins: QuickWin[];
  specialistSupport: string;
  /** 1-3 real phases only. Empty phases are omitted rather than rendered as placeholders. */
  roadmap: RoadmapPhase[];
  reassessment: string;
};
export type PdfReportProps = {
  data: CyberHealthReportData;
  /** Accepted for caller compatibility; the approved layout uses the vector brand mark. */
  logoSrc?: string;
  /** PNG/data URL generated from https://orgro.ca/contact, never an AI-drawn QR. */
  contactQrSrc: string;
  /** Accepted for caller compatibility; the approved layout uses no photos. */
  coverPhotoSrc?: string;
  /** Accepted for caller compatibility; the approved layout uses no photos. */
  closingPhotoSrc?: string;
};

// Palette from the dashboard PDF mockup (pdf.css), shared with the ODO report.
const INK = "#141719";
const GREY = "#5B6770";
const RULE = "#D5D8DA";
const TEAL = "#00758F";
const NOTE_BG = "#F4F2ED";
const BODY = "#2a3236";
const TRACK = "#E3E6E8";
const WATERMARK = "#F1F2F2";

const SEV_TAG: Record<Severity, { bg: string; fg: string }> = {
  Critical: { bg: "#FBD9D9", fg: "#8A1C1C" },
  High: { bg: "#FBE3D6", fg: "#9A3412" },
  Medium: { bg: "#FDF1D3", fg: "#7A5300" },
  Low: { bg: "#E6EEF0", fg: "#2F4A50" },
};

const RISK_GUIDE = [
  ["Critical", "Urgent attention; a major protection or recovery gap."],
  ["High", "Prioritize promptly; a significant weakness."],
  ["Medium", "Plan corrective action; a meaningful control gap."],
  ["Low", "Lower-priority improvement; address through routine review."],
] as const;
const SEVERITY_ORDER: Severity[] = ["Critical", "High", "Medium", "Low"];
// Below this many combined Medium/Low findings, every finding gets a full
// individual card (title + gap + impact + action) — there's room, and a
// two-finding "Low" report shouldn't read as thinner-detail than a
// forty-finding one. Above it, Medium/Low findings switch to a compact,
// still-complete (no truncation) row so a bad-score report stays legible
// instead of running to dozens of full cards. Critical/High always get
// full cards regardless of count — they're always few.
const COMPACT_THRESHOLD = 6;
const CONTACT = "https://orgro.ca/contact";

const s = StyleSheet.create({
  // Letter page. Header and footer are absolute, so the body reserves space
  // for them with paddingTop/paddingBottom. No lineHeight on `page` or on the
  // footer's ancestors: a page-level lineHeight made the fixed footer vanish
  // from the rendered PDF (verified with @react-pdf/renderer 4.x).
  page: { fontFamily: "Helvetica", fontSize: 8.6, color: INK, backgroundColor: "#FFFFFF", paddingTop: 124, paddingBottom: 84, paddingHorizontal: 42 },
  header: { position: "absolute", top: 30, left: 42, right: 42, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", borderBottomWidth: 1.5, borderBottomColor: INK, paddingBottom: 9 },
  meta: { textAlign: "right", fontSize: 7.5, color: GREY },
  metaStrong: { color: INK, fontFamily: "Helvetica-Bold" },
  footer: { position: "absolute", bottom: 26, left: 42, right: 42, borderTopWidth: 1, borderTopColor: INK, paddingTop: 7, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  footerText: { width: "86%", fontSize: 6.3, color: GREY },
  footerStrong: { color: INK, fontFamily: "Helvetica-Bold" },
  footerPage: { fontSize: 7, color: INK, fontFamily: "Helvetica-Bold" },
  h1: { fontSize: 21, fontFamily: "Helvetica-Bold", letterSpacing: -0.3, marginTop: 6, marginBottom: 2 },
  sub: { fontSize: 9.75, color: GREY, marginBottom: 12 },
  title: { fontSize: 15, fontFamily: "Helvetica-Bold", marginTop: 6, marginBottom: 3 },
  titleSub: { fontSize: 9.5, color: GREY, marginBottom: 10, lineHeight: 1.4 },
  h2: { flexDirection: "row", alignItems: "baseline", marginTop: 12, marginBottom: 5 },
  h2Num: { fontSize: 8.25, color: TEAL, fontFamily: "Helvetica-Bold", marginRight: 8 },
  h2Title: { fontSize: 9.75, fontFamily: "Helvetica-Bold" },
  h3: { fontSize: 8, fontFamily: "Helvetica-Bold", marginTop: 10, marginBottom: 4 },
  p: { fontSize: 8.6, color: BODY, marginBottom: 6, lineHeight: 1.4 },
  lead: { fontSize: 9, color: INK, marginBottom: 6, lineHeight: 1.4 },
  small: { fontSize: 7.5, color: GREY, marginBottom: 4, lineHeight: 1.4 },
  label: { fontSize: 6.8, letterSpacing: 0.9, color: GREY, marginBottom: 2 },
  cl4: { flexDirection: "row", borderWidth: 1, borderColor: RULE, borderRadius: 3, marginBottom: 8 },
  cl4Cell: { flex: 1, paddingVertical: 6, paddingHorizontal: 9, borderRightWidth: 1, borderRightColor: RULE },
  cl4Value: { fontSize: 9, fontFamily: "Helvetica-Bold" },
  kRow: { flexDirection: "row", borderTopWidth: 1.5, borderTopColor: INK, borderBottomWidth: 1, borderBottomColor: RULE, marginVertical: 8 },
  kCell: { flex: 1, paddingVertical: 6, paddingRight: 4 },
  kNum: { fontSize: 20, color: TEAL, fontFamily: "Helvetica-Bold", marginVertical: 1 },
  kSmall: { fontSize: 7.5, color: GREY },
  note: { marginTop: 9, borderLeftWidth: 3, borderLeftColor: TEAL, backgroundColor: NOTE_BG, paddingVertical: 8, paddingHorizontal: 12, fontSize: 8.6, color: BODY, lineHeight: 1.4 },
  noteLabel: { fontFamily: "Helvetica-Bold", color: INK },
  toc: { flexDirection: "row", flexWrap: "wrap", marginTop: 3 },
  tocItem: { width: "50%", borderBottomWidth: 1, borderBottomColor: TRACK, paddingVertical: 3, paddingRight: 12, flexDirection: "row", fontSize: 8.6 },
  tocNum: { color: TEAL, fontFamily: "Helvetica-Bold", width: 22 },
  // Score coverage
  groupBlock: { marginBottom: 7 },
  groupHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", borderBottomWidth: 1.5, borderBottomColor: INK, paddingBottom: 4, marginBottom: 2 },
  groupName: { fontFamily: "Helvetica-Bold", fontSize: 8.6, letterSpacing: 0.6 },
  groupScore: { fontFamily: "Helvetica-Bold", fontSize: 9.5, color: TEAL },
  category: { flexDirection: "row", alignItems: "center", paddingVertical: 3, borderBottomWidth: 1, borderBottomColor: TRACK },
  categoryName: { width: "46%", fontSize: 8.2, color: BODY },
  track: { width: "40%", height: 5, backgroundColor: TRACK, marginRight: 8 },
  bar: { height: 5, backgroundColor: TEAL },
  percent: { width: "10%", textAlign: "right", fontSize: 8.2, fontFamily: "Helvetica-Bold" },
  critTag: { fontSize: 6.3, letterSpacing: 0.7, fontFamily: "Helvetica-Bold", paddingVertical: 1.5, paddingHorizontal: 4, marginLeft: 6, backgroundColor: SEV_TAG.Critical.bg, color: SEV_TAG.Critical.fg },
  // Priority findings
  sevStrip: { flexDirection: "row", marginBottom: 6 },
  sevCell: { flex: 1, paddingVertical: 6, paddingHorizontal: 8, backgroundColor: "#ECEDEA", marginRight: 6 },
  sevNum: { fontSize: 16, fontFamily: "Helvetica-Bold", marginTop: 1 },
  finding: { borderWidth: 1, borderColor: RULE, padding: 9, marginBottom: 6 },
  findingTitle: { fontFamily: "Helvetica-Bold", fontSize: 9.5, marginBottom: 4, lineHeight: 1.35 },
  findingLine: { fontSize: 8.2, color: BODY, marginBottom: 2, lineHeight: 1.4 },
  findingLabel: { fontFamily: "Helvetica-Bold", color: INK },
  sevTag: { fontSize: 6.3, letterSpacing: 0.7, fontFamily: "Helvetica-Bold", paddingVertical: 1.5, paddingHorizontal: 4, alignSelf: "flex-start", marginBottom: 4 },
  compactRow: { flexDirection: "row", paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: TRACK },
  compactTitle: { width: "44%", fontSize: 8.2, fontFamily: "Helvetica-Bold", paddingRight: 8, lineHeight: 1.35 },
  compactAction: { flex: 1, fontSize: 8.2, color: BODY, lineHeight: 1.35 },
  guideRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: TRACK, paddingVertical: 4 },
  guideLevel: { width: "16%", fontSize: 8, fontFamily: "Helvetica-Bold" },
  guideText: { flex: 1, fontSize: 8, color: BODY, lineHeight: 1.4 },
  // Quick wins and roadmap
  quickRow: { flexDirection: "row", marginTop: 4 },
  quickCol: { flex: 1, borderWidth: 1, borderColor: RULE, padding: 10, marginRight: 8 },
  quickNum: { fontSize: 20, color: TEAL, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  quickTitle: { fontSize: 9.5, fontFamily: "Helvetica-Bold", marginBottom: 4, lineHeight: 1.35 },
  quickText: { fontSize: 8.2, color: BODY, marginBottom: 6, lineHeight: 1.4 },
  quickLabel: { fontSize: 6.8, letterSpacing: 0.9, color: GREY, marginBottom: 1 },
  quickValue: { fontSize: 8, color: BODY, marginBottom: 6, lineHeight: 1.35 },
  specialist: { backgroundColor: INK, padding: 12, marginTop: 10 },
  specialistLabel: { fontSize: 7, letterSpacing: 0.9, color: "#9AA3A8", marginBottom: 4 },
  specialistText: { fontSize: 9, color: "#FFFFFF", lineHeight: 1.4 },
  phase: { borderTopWidth: 1.5, borderTopColor: INK, paddingVertical: 8, flexDirection: "row" },
  phaseLeft: { width: "28%", paddingRight: 10 },
  phaseRight: { flex: 1 },
  phasePeriod: { fontSize: 9.5, fontFamily: "Helvetica-Bold", color: TEAL, marginBottom: 3 },
  phaseAction: { fontSize: 8.4, color: BODY, lineHeight: 1.4 },
  // Continue
  three: { flexDirection: "row", marginTop: 6, marginBottom: 6 },
  threeCell: { flex: 1, paddingRight: 12 },
  threeTitle: { fontSize: 8.6, fontFamily: "Helvetica-Bold", marginBottom: 2 },
  threeText: { fontSize: 8.1, color: BODY, lineHeight: 1.4 },
  qrBox: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: RULE, borderRadius: 3, padding: 12, marginTop: 10 },
  qr: { width: 72, height: 72, marginRight: 14 },
  qrTitle: { fontSize: 9, fontFamily: "Helvetica-Bold", marginBottom: 3 },
  qrText: { fontSize: 7.8, color: GREY, lineHeight: 1.4 },
  reviewRow: { flexDirection: "row", borderTopWidth: 1.5, borderTopColor: INK, marginTop: 12, paddingTop: 6 },
  reviewCell: { flex: 1, fontSize: 8, color: BODY },
});

function FindingCard({ f }: { f: Finding }) {
  const tag = SEV_TAG[f.severity];
  return (
    <View style={s.finding} wrap={false}>
      <Text style={[s.sevTag, { backgroundColor: tag.bg, color: tag.fg }]}>{f.severity.toUpperCase()}</Text>
      <Text style={s.findingTitle}>{f.title}</Text>
      <Text style={s.findingLine}><Text style={s.findingLabel}>Reported gap: </Text>{f.reportedGap}</Text>
      <Text style={s.findingLine}><Text style={s.findingLabel}>Business impact: </Text>{f.impact}</Text>
      <Text style={s.findingLine}><Text style={s.findingLabel}>Next action: </Text>{f.action}</Text>
    </View>
  );
}

function CompactRow({ f }: { f: Finding }) {
  return (
    <View style={s.compactRow} wrap={false}>
      <Text style={s.compactTitle}>{f.title}</Text>
      <Text style={s.compactAction}>{f.action}</Text>
    </View>
  );
}

function ReportPage({ d, children }: { d: CyberHealthReportData; children: React.ReactNode }) {
  return (
    <Page size="LETTER" style={s.page}>
      <View style={{ position: "absolute", left: 145, top: 258, width: 322, height: 322 }} fixed>
        <PdfIconWatermark size={322} color={WATERMARK} />
      </View>
      <View style={s.header} fixed>
        <PdfLogo width={37.5} />
        <View style={s.meta}>
          <Text style={s.metaStrong}>Private &amp; confidential</Text>
          <Text style={s.metaStrong}>Cyber Health Assessment</Text>
          <Text>{d.assessmentDate}</Text>
          <Text>Ref {d.clientReference}</Text>
        </View>
      </View>
      {children}
      <View style={s.footer} fixed>
        <Text style={s.footerText}>
          <Text style={s.footerStrong}>Private &amp; confidential.</Text> This questionnaire-based report is not a technical audit, compliance certification or guarantee of security. Reported findings require validation.{"\n"}
          Reference {d.clientReference} · {d.assessmentDate} · <Text style={s.footerStrong}>ORAGROL GLOBAL · PROTECT / AUTOMATE / UNIFY</Text>
        </Text>
        <Text style={s.footerPage} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
      </View>
    </Page>
  );
}

function SectionHead({ num, title }: { num: string; title: string }) {
  return (
    <View style={s.h2} minPresenceAhead={60}>
      <Text style={s.h2Num}>{num}</Text>
      <Text style={s.h2Title}>{title}</Text>
    </View>
  );
}

/** Pure PDF document. Keep scoring, delivery, QR generation and CRM logic outside. */
export default function CyberHealthPdfReport({ data: d, contactQrSrc }: PdfReportProps) {
  validate(d);
  if (!contactQrSrc) throw new Error("Provide the verified contact QR before rendering");
  const critical = d.findings.filter((f) => f.severity === "Critical");
  const criticalIds = new Set(critical.flatMap((f) => f.categoryIds));

  // Every severity is always shown in full detail EXCEPT when the
  // combined Medium+Low volume is large — then Medium/Low switch to a
  // compact (still complete, non-truncated) row. Critical/High are
  // always full cards.
  const mediumLowCount = d.findings.filter((f) => f.severity === "Medium" || f.severity === "Low").length;
  const useCompactMediumLow = mediumLowCount > COMPACT_THRESHOLD;

  return (
    <Document title="ORAGROL Cyber Health Assessment Report" author="ORAGROL Global" subject="Questionnaire-based Cyber Health Assessment">
      <ReportPage d={d}>
      <>
        <Text style={s.h1}>Cyber Health Assessment Report</Text>
        <Text style={s.sub}>Cybersecurity, intelligent automation and coordinated operations for Canadian businesses.</Text>

        <View style={s.cl4}>
          <View style={s.cl4Cell}><Text style={s.label}>PREPARED FOR</Text><Text style={s.cl4Value}>{d.companyName}</Text></View>
          <View style={s.cl4Cell}><Text style={s.label}>BUSINESS SECTOR</Text><Text style={s.cl4Value}>{d.businessSector}</Text></View>
          <View style={s.cl4Cell}><Text style={s.label}>EMPLOYEES</Text><Text style={s.cl4Value}>{d.employeeCount}</Text></View>
          <View style={[s.cl4Cell, { borderRightWidth: 0 }]}><Text style={s.label}>ASSESSMENT DATE</Text><Text style={s.cl4Value}>{d.assessmentDate}</Text></View>
        </View>
        <View style={s.cl4}>
          <View style={s.cl4Cell}><Text style={s.label}>CONTACT NAME</Text><Text style={s.cl4Value}>{d.contactName}</Text></View>
          <View style={s.cl4Cell}><Text style={s.label}>PHONE</Text><Text style={s.cl4Value}>{d.phoneNumber}</Text></View>
          <View style={s.cl4Cell}><Text style={s.label}>CLIENT REFERENCE</Text><Text style={s.cl4Value}>{d.clientReference}</Text></View>
          <View style={[s.cl4Cell, { borderRightWidth: 0 }]}><Text style={s.label}>REPORTED RISK TIER</Text><Text style={s.cl4Value}>{d.riskTier ?? "—"}</Text></View>
        </View>

        <SectionHead num="01" title="Assessment summary" />
        <View style={s.kRow}>
          <View style={s.kCell}><Text style={s.label}>CYBER HEALTH SCORE</Text><Text style={s.kNum}>{d.score}<Text style={{ fontSize: 10 }}> / 100</Text></Text><Text style={s.kSmall}>Out of 100</Text></View>
          <View style={s.kCell}><Text style={s.label}>CRITICAL FINDINGS</Text><Text style={s.kNum}>{critical.length}</Text><Text style={s.kSmall}>Urgent</Text></View>
          <View style={s.kCell}><Text style={s.label}>HIGH FINDINGS</Text><Text style={s.kNum}>{d.findings.filter((f) => f.severity === "High").length}</Text><Text style={s.kSmall}>Prioritize promptly</Text></View>
          <View style={[s.kCell, { paddingRight: 0 }]}><Text style={s.label}>MEDIUM / LOW</Text><Text style={s.kNum}>{d.findings.filter((f) => f.severity === "Medium").length} / {d.findings.filter((f) => f.severity === "Low").length}</Text><Text style={s.kSmall}>Plan and review</Text></View>
        </View>
        <Text style={s.lead}>{d.scoreInterpretation}</Text>
        {d.riskTier ? <Text style={s.small}>Reported risk tier: {d.riskTier}. Individual findings take priority over the average.</Text> : null}

        <SectionHead num="02" title="Inside this report" />
        <View style={s.toc}>
          {[
            ["03", "Score & control coverage"],
            ["04", "Priority findings"],
            ["05", "Quick wins"],
            ["06", "Action roadmap"],
            ["07", "Continue with ORAGROL"],
            ["A", "Report use & limitations"],
          ].map(([n, t]) => (
            <Text key={n} style={s.tocItem}><Text style={s.tocNum}>{n}  </Text>{t}</Text>
          ))}
        </View>
        <Text style={[s.small, { marginTop: 8 }]}>Control coverage, priority findings, quick wins and a practical action roadmap. Based on assessment responses; controls have not been independently verified.</Text>
      </>
      </ReportPage>

      <ReportPage d={d}>
      <View>
        <SectionHead num="03" title="Score & control coverage" />
        <Text style={s.p}>Overall score: {d.score}/100. A Critical finding overrides its category status, regardless of the average.</Text>
        {d.groups.map((g) => (
          <View key={g.name} style={s.groupBlock} wrap={false}>
            <View style={s.groupHeader}>
              <Text style={s.groupName}>{g.name.toUpperCase()}</Text>
              <Text style={s.groupScore}>{g.score}%</Text>
            </View>
            {g.categories.map((c) => (
              <View key={c.id} style={s.category}>
                <Text style={s.categoryName}>
                  {c.name}
                  {criticalIds.has(c.id) ? <Text style={s.critTag}>CRITICAL</Text> : null}
                </Text>
                <View style={s.track}><View style={[s.bar, { width: `${c.score}%` }]} /></View>
                <Text style={s.percent}>{c.score}%</Text>
              </View>
            ))}
          </View>
        ))}
        <View style={s.note}>
          <Text style={s.noteLabel}>Reading this score.</Text>
          <Text>Reported coverage is not independent verification. Critical flags derive from the findings mapped to each category; a high average does not cancel an individual control gap.</Text>
        </View>
      </View>
      </ReportPage>

      <ReportPage d={d}>
      <View>
        <SectionHead num="04" title="The gaps that need attention first" />
        <Text style={s.p}>Reported findings require validation, in the order they should be worked.</Text>
        <View style={s.sevStrip}>
          {SEVERITY_ORDER.map((level) => {
            const count = d.findings.filter((f) => f.severity === level).length;
            return (
              <View key={level} style={[s.sevCell, { borderLeftWidth: level === "Critical" && count > 0 ? 3 : 0, borderLeftColor: "#8A1C1C" }]}>
                <Text style={s.label}>{level.toUpperCase()}</Text>
                <Text style={s.sevNum}>{count}</Text>
              </View>
            );
          })}
        </View>

        {SEVERITY_ORDER.map((severity) => {
          const items = d.findings.filter((f) => f.severity === severity);
          if (!items.length) return null;
          const compact = useCompactMediumLow && (severity === "Medium" || severity === "Low");
          return (
            <View key={severity}>
              <Text style={s.h3}>{severity} ({items.length})</Text>
              {compact
                ? items.map((f, i) => <CompactRow f={f} key={i} />)
                : items.map((f, i) => <FindingCard f={f} key={i} />)}
            </View>
          );
        })}

        <View style={s.h2} minPresenceAhead={60}><Text style={s.h2Num}>A</Text><Text style={s.h2Title}>Risk level guide</Text></View>
        {RISK_GUIDE.map(([level, explanation]) => (
          <View key={level} style={s.guideRow} wrap={false}>
            <Text style={s.guideLevel}>{level}</Text>
            <Text style={s.guideText}>{explanation}</Text>
          </View>
        ))}
        <Text style={[s.small, { marginTop: 6 }]}>Severity indicates priority, not a prediction that an incident will occur. Every finding above is listed in full — none are omitted or summarized away.</Text>
      </View>
      </ReportPage>

      <ReportPage d={d}>
      <View>
        <SectionHead num="05" title="Quick wins" />
        <Text style={s.p}>Actions your team can start now — not a promise every item can be fixed without specialist help.</Text>
        {d.quickWins.length > 0 ? (
          <View style={s.quickRow}>
            {d.quickWins.map((q, i) => (
              <View style={s.quickCol} key={i} wrap={false}>
                <Text style={s.quickNum}>{String(i + 1).padStart(2, "0")}</Text>
                <Text style={s.quickTitle}>{q.title}</Text>
                <Text style={s.quickText}>{q.action}</Text>
                <Text style={s.quickLabel}>SUGGESTED OWNER</Text>
                <Text style={s.quickValue}>{q.owner}</Text>
                <Text style={s.quickLabel}>COMPLETION CHECK</Text>
                <Text style={s.quickValue}>{q.check}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={s.p}>No low-effort quick wins were identified from this assessment — remaining items are addressed in the action roadmap.</Text>
        )}
        <View style={s.specialist} wrap={false}>
          <Text style={s.specialistLabel}>WHEN SPECIALIST SUPPORT HELPS</Text>
          <Text style={s.specialistText}>{d.specialistSupport}</Text>
        </View>

        <SectionHead num="06" title="Action roadmap" />
        <Text style={s.p}>Sequenced by urgency and effort, not automatically by severity alone.</Text>
        {d.roadmap.map((r, i) => (
          <View key={i} style={s.phase} wrap={false}>
            <View style={s.phaseLeft}>
              <Text style={s.phasePeriod}>{r.period}</Text>
              <Text style={s.quickLabel}>SUGGESTED OWNER</Text>
              <Text style={s.quickValue}>{r.owner}</Text>
              <Text style={s.quickLabel}>EVIDENCE TO COLLECT</Text>
              <Text style={s.quickValue}>{r.evidence}</Text>
            </View>
            <View style={s.phaseRight}>
              <Text style={s.phaseAction}>{r.action}</Text>
            </View>
          </View>
        ))}
        <Text style={[s.small, { marginTop: 6 }]}>Timing is indicative, not a delivery commitment. Critical and high-severity issues are never deferred to a later phase. Validate the need and use existing tools where suitable before purchasing additional services.</Text>
      </View>
      </ReportPage>

      <ReportPage d={d}>
      <View>
        <SectionHead num="07" title="Continue with ORAGROL" />
        <Text style={s.p}>Bring this report to a focused conversation about what needs attention, what your team can handle and where external support would add value.</Text>
        <View style={s.three}>
          <View style={s.threeCell}><Text style={s.threeTitle}>Review</Text><Text style={s.threeText}>Validate findings and clarify current controls.</Text></View>
          <View style={s.threeCell}><Text style={s.threeTitle}>Define</Text><Text style={s.threeText}>Agree priorities, proposed work and responsibilities.</Text></View>
          <View style={[s.threeCell, { paddingRight: 0 }]}><Text style={s.threeTitle}>Decide</Text><Text style={s.threeText}>Agree whether a Private Scope Review is the right next step.</Text></View>
        </View>

        <View style={s.qrBox} wrap={false}>
          <Image src={contactQrSrc} style={s.qr} />
          <View style={{ flex: 1 }}>
            <Text style={s.qrTitle}>Book a conversation</Text>
            <Link src={CONTACT} style={{ fontSize: 9, color: TEAL, fontFamily: "Helvetica-Bold", marginBottom: 3 }}>orgro.ca/contact</Link>
            <Text style={s.qrText}>Reference: {d.clientReference}. Scheduling is confirmed after your enquiry.</Text>
          </View>
        </View>

        <Text style={s.h3}>Review progress</Text>
        <Text style={s.p}>{d.reassessment}</Text>

        <View style={s.h2}><Text style={s.h2Num}>A</Text><Text style={s.h2Title}>Report use &amp; limitations</Text></View>
        <Text style={s.p}>This questionnaire-based report is not a technical audit, compliance certification or guarantee of security. Reported findings require validation. Share only with authorized recipients.</Text>
        <Text style={s.p}>This report is automatically generated; no signature is required. Use it as a reference when booking a Private Scope Review or continuing your enquiry with ORAGROL. It does not constitute a service agreement.</Text>

        <View style={s.reviewRow} wrap={false}>
          <Text style={[s.reviewCell, { fontFamily: "Helvetica-Bold" }]}>ORAGROL GLOBAL</Text>
          <Text style={[s.reviewCell, { fontFamily: "Helvetica-Bold" }]}>PROTECT / AUTOMATE / UNIFY</Text>
        </View>
      </View>
      </ReportPage>
    </Document>
  );
}

function validate(d: CyberHealthReportData) {
  // Sanity ceilings only — a guard against a truly malformed field, not a
  // routine truncation trigger. Real finding/roadmap/quick-win text is
  // rendered in full and wraps naturally; nothing here should fire for
  // legitimate content.
  const bounded = (value: string, max: number, label: string) => { if (typeof value !== "string" || value.length > max) throw new Error(`${label} is unexpectedly long (${value?.length ?? 0} chars) — check the source data before rendering`); };
  bounded(d.scoreInterpretation, 220, "score interpretation");
  if (d.groups.length !== 5 || d.groups.reduce((n, g) => n + g.categories.length, 0) !== 20) throw new Error("Expected five groups and 20 categories");
  if (d.quickWins.length > 3) throw new Error("Prepare at most three quick wins");
  for (const q of d.quickWins) { bounded(q.title, 120, "quick-win title"); bounded(q.action, 300, "quick-win action"); bounded(q.owner, 80, "quick-win owner"); bounded(q.check, 220, "quick-win check"); }
  if (d.roadmap.length < 1 || d.roadmap.length > 3) throw new Error("Prepare one to three roadmap phases — omit empty ones rather than padding to three");
  for (const r of d.roadmap) { bounded(r.period, 60, "phase label"); bounded(r.action, 2000, "phase summary"); bounded(r.evidence, 400, "phase evidence"); bounded(r.owner, 80, "owner"); }
  bounded(d.specialistSupport, 400, "specialist support"); bounded(d.reassessment, 260, "reassessment");
  for (const key of ["companyName", "businessSector", "employeeCount", "assessmentDate", "contactName", "phoneNumber", "clientReference"] as const) {
    if (!d[key]?.trim()) throw new Error(`Missing report field: ${key}`);
  }
  const percent = (v: number) => Number.isFinite(v) && v >= 0 && v <= 100;
  if (!percent(d.score)) throw new Error("Invalid overall score");
  const ids = new Set<string>();
  for (const g of d.groups) {
    if (!percent(g.score)) throw new Error("Invalid group score");
    for (const c of g.categories) {
      if (!percent(c.score) || ids.has(c.id)) throw new Error("Invalid or duplicate category");
      ids.add(c.id);
    }
  }
  for (const f of d.findings) {
    if (!f.categoryIds.length || f.categoryIds.some((id) => !ids.has(id))) throw new Error(`Unmapped finding: ${f.title}`);
    bounded(f.title, 200, "finding title"); bounded(f.reportedGap, 400, "finding reported gap"); bounded(f.impact, 400, "finding impact"); bounded(f.action, 400, "finding action");
  }
}
