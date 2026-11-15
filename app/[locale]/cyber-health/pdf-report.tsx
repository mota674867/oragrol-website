import React from "react";
import { Document, Page, Text, View, StyleSheet, Link, Image } from "@react-pdf/renderer";
import { PdfIconMark, PdfIconWatermark } from "../../lib/pdf-brand";
import { registerPdfFonts } from "../../lib/pdf-fonts";

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
const WATERMARK_DOT = "#FEF6F3";

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
const CONTACT_TEXT = "orgro.ca/contact";

registerPdfFonts();
const SEMI = { fontFamily: "Inter", fontWeight: 600 } as const;
const BOLD = { fontFamily: "Inter", fontWeight: 700 } as const;


const s = StyleSheet.create({
  // Letter page. Header and footer are absolute, so the body reserves space for them with paddingTop/paddingBottom.
  // No lineHeight on `page` or on the footer's ancestors (a page-level lineHeight made the fixed footer vanish, react-pdf 4.x).
  page: { fontFamily: "Inter", fontSize: 8.6, color: INK, backgroundColor: "#FFFFFF", paddingTop: 88, paddingBottom: 84, paddingHorizontal: 42 },
  header: { position: "absolute", top: 24, left: 42, right: 42, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", borderBottomWidth: 1, borderBottomColor: INK, height: 66 },
  meta: { textAlign: "right", fontSize: 7.3, color: GREY, letterSpacing: 0.55, lineHeight: 1.85, paddingTop: 5 },
  metaStrong: { color: INK, ...SEMI, fontSize: 7.4, letterSpacing: 0.5 },
  footer: { position: "absolute", bottom: 24, left: 42, right: 42, borderTopWidth: 1, borderTopColor: INK, paddingTop: 7, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  footerText: { width: "93%", fontSize: 6.0, color: GREY, lineHeight: 1.5 },
  footerStrong: { color: INK, ...BOLD },
  footerPage: { fontSize: 7.2, color: INK },
  h1: { fontSize: 18, ...BOLD, letterSpacing: -0.3, marginTop: 13, marginBottom: 5 },
  sub: { fontSize: 9.75, color: GREY, marginBottom: 10 },
  h2: { flexDirection: "row", alignItems: "baseline", marginTop: 12, marginBottom: 5 },
  h2Num: { fontSize: 8.25, color: TEAL, ...BOLD, marginRight: 8 },
  h2Title: { fontSize: 10, ...BOLD },
  p: { fontSize: 8.2, color: BODY, marginBottom: 6, lineHeight: 1.4 },
  lead: { fontSize: 9, color: INK, marginTop: 5, marginBottom: 6, lineHeight: 1.4 },
  riskLine: { fontSize: 8.2, color: INK, marginBottom: 4, lineHeight: 1.4 },
  small: { fontSize: 6.8, color: GREY, marginBottom: 4, lineHeight: 1.4 },
  smallStrong: { ...SEMI, color: GREY },
  label: { fontSize: 6.5, letterSpacing: 1, color: GREY, marginBottom: 2 },
  cl4: { flexDirection: "row", borderWidth: 1, borderColor: RULE, borderRadius: 3, marginBottom: 8 },
  cl4Cell: { flex: 1, paddingVertical: 7, paddingHorizontal: 9, borderRightWidth: 1, borderRightColor: RULE },
  cl4Value: { fontSize: 9, ...SEMI },
  kRow: { flexDirection: "row", borderTopWidth: 1, borderTopColor: INK, borderBottomWidth: 1, borderBottomColor: RULE, marginTop: 4, marginBottom: 8 },
  kCell: { flex: 1, paddingVertical: 6, paddingRight: 4 },
  kNum: { fontSize: 15.7, color: TEAL, ...BOLD, marginTop: 0, marginBottom: 5 },
  kSmall: { fontSize: 7.5, color: GREY },
  toc: { flexDirection: "row", flexWrap: "wrap", marginTop: 3 },
  tocItem: { width: "50%", borderBottomWidth: 1, borderBottomColor: TRACK, paddingVertical: 3.5, paddingRight: 12, flexDirection: "row", fontSize: 7.9 },
  tocNum: { color: TEAL, ...BOLD, width: 19 },
  // Score and control coverage (section 03)
  barRow: { flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: TRACK, height: 17, paddingRight: 7 },
  barName: { width: 116, fontSize: 7.7, color: INK },
  barTrack: { flex: 1, height: 4, backgroundColor: TRACK, marginRight: 22 },
  barFill: { height: 4, backgroundColor: TEAL },
  barPct: { width: 30, textAlign: "right", fontSize: 7.8, color: BODY },
  bigRow: { flexDirection: "row", borderTopWidth: 1, borderTopColor: INK, borderBottomWidth: 1, borderBottomColor: RULE, marginTop: 8 },
  bigCell: { flex: 1, paddingVertical: 6, paddingLeft: 0, borderRightWidth: 1, borderRightColor: RULE },
  bigNum: { fontSize: 13.5, color: TEAL, ...BOLD, marginTop: 1 },
  tHead: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: INK, paddingBottom: 6, paddingTop: 10 },
  tRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: TRACK, height: 17, alignItems: "center" },
  tCat: { width: 175, fontSize: 7.7, color: INK },
  tCtl: { width: 177, fontSize: 7.7, color: INK },
  tCov: { flex: 1, fontSize: 7.7, color: INK, textAlign: "right" },
  tHeadText: { fontSize: 6.3, letterSpacing: 1.1, color: GREY, ...SEMI },
  critTag: { fontSize: 5.8, letterSpacing: 0.7, ...BOLD, paddingVertical: 1.5, paddingHorizontal: 4, marginLeft: 6, backgroundColor: SEV_TAG.Critical.bg, color: SEV_TAG.Critical.fg },
  note: { marginTop: 8, borderLeftWidth: 3, borderLeftColor: TEAL, backgroundColor: NOTE_BG, paddingVertical: 8, paddingHorizontal: 11, fontSize: 7.55, color: BODY, lineHeight: 1.45 },
  noteLabel: { ...BOLD, color: INK },
  // Priority findings (section 04)
  sevStrip: { flexDirection: "row", borderTopWidth: 1, borderTopColor: INK, borderBottomWidth: 1, borderBottomColor: RULE, marginTop: -1, marginBottom: 8 },
  sevCell: { flex: 1, paddingVertical: 6 },
  sevNum: { fontSize: 17, ...BOLD, color: TEAL, marginTop: 2 },
  finding: { borderWidth: 1, borderColor: RULE, borderRadius: 3, paddingVertical: 8, paddingHorizontal: 10, marginBottom: 6 },
  findingTitle: { ...BOLD, fontSize: 9, marginBottom: 5, lineHeight: 1.35 },
  findingLine: { fontSize: 7.9, color: BODY, marginBottom: 3, lineHeight: 1.4 },
  findingLabel: { ...SEMI, color: INK },
  sevTag: { fontSize: 6.3, letterSpacing: 0.8, ...BOLD, paddingVertical: 2, paddingHorizontal: 5, borderRadius: 2, alignSelf: "flex-start", marginBottom: 5 },
  compactRow: { flexDirection: "row", paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: TRACK },
  compactTitle: { width: "40%", fontSize: 8.2, ...SEMI, paddingRight: 8, lineHeight: 1.35 },
  compactAction: { flex: 1, fontSize: 8.2, color: BODY, lineHeight: 1.35 },
  guideHead: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: INK, paddingBottom: 6, paddingTop: 3 },
  guideRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: TRACK, height: 17, alignItems: "center" },
  guideLevel: { width: 95 },
  guideText: { flex: 1, fontSize: 7.9, color: BODY },
  guideTag: { fontSize: 6.3, letterSpacing: 0.8, ...BOLD, paddingVertical: 2, paddingHorizontal: 5, borderRadius: 2, alignSelf: "flex-start" },
  // Quick wins and roadmap (sections 05 and 06)
  itemRow: { flexDirection: "row", paddingTop: 6, paddingBottom: 9, borderBottomWidth: 1, borderBottomColor: TRACK },
  itemNum: { width: 28, fontSize: 11.5, color: TEAL, ...BOLD },
  itemBody: { flex: 1 },
  itemTitle: { fontSize: 8.8, ...BOLD, marginBottom: 3 },
  itemText: { fontSize: 8.2, color: BODY, marginBottom: 5, lineHeight: 1.4 },
  itemMeta: { fontSize: 6.8, color: GREY, lineHeight: 1.4 },
  // Continue (section 07)
  three: { flexDirection: "row", borderTopWidth: 1, borderTopColor: INK, marginTop: 0, marginBottom: 8 },
  threeCell: { flex: 1, paddingTop: 5, paddingBottom: 8, paddingRight: 12, paddingLeft: 10, borderLeftWidth: 1, borderLeftColor: RULE },
  threeTitle: { fontSize: 6.8, ...BOLD, letterSpacing: 1, color: TEAL, marginBottom: 5 },
  threeText: { fontSize: 7.9, color: INK, lineHeight: 1.5 },
  strip: { flexDirection: "row", borderWidth: 1, borderColor: RULE, borderRadius: 3, marginBottom: 12 },
  stripCell: { paddingVertical: 7, paddingHorizontal: 9, borderRightWidth: 1, borderRightColor: RULE },
  stripValue: { fontSize: 8.9, ...BOLD, lineHeight: 1.4, marginTop: 2 },
  limit: { fontSize: 7.1, color: GREY, lineHeight: 1.5, marginBottom: 6 },
  qrBox: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: RULE, borderRadius: 3, paddingVertical: 14, paddingHorizontal: 14, marginTop: 8 },
  qr: { width: 68, height: 68, marginRight: 18 },
  qrTitle: { fontSize: 9, ...BOLD, marginBottom: 5 },
  qrText: { fontSize: 7.9, color: GREY, lineHeight: 1.4 },
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
  const tag = SEV_TAG[f.severity];
  return (
    <View style={s.compactRow} wrap={false}>
      <View style={{ width: 52 }}><Text style={[s.guideTag, { backgroundColor: tag.bg, color: tag.fg }]}>{f.severity.toUpperCase()}</Text></View>
      <Text style={s.compactTitle}>{f.title}</Text>
      <Text style={s.compactAction}>{f.action}</Text>
    </View>
  );
}

function ReportPage({ d, children }: { d: CyberHealthReportData; children: React.ReactNode }) {
  return (
    <Page size="LETTER" style={s.page}>
      <View style={{ position: "absolute", left: 145, top: 258, width: 322, height: 322 }} fixed>
        <PdfIconWatermark size={322} color={WATERMARK} dotColor={WATERMARK_DOT} />
      </View>
      <View style={s.header} fixed>
        <View style={{ paddingTop: 0 }}><PdfIconMark size={37} /></View>
        <View style={s.meta}>
          <Text style={s.metaStrong}>PRIVATE &amp; CONFIDENTIAL</Text>
          <Text style={s.metaStrong}>CYBER HEALTH ASSESSMENT</Text>
          <Text>{d.assessmentDate.toUpperCase()}</Text>
          <Text>REF {d.clientReference.toUpperCase()}</Text>
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

function SectionHead({ num, title, top }: { num: string; title: string; top?: number }) {
  return (
    <View style={top === undefined ? s.h2 : [s.h2, { marginTop: top }]} minPresenceAhead={60}>
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

  // Every severity is shown in full detail EXCEPT when the combined Medium+Low volume is large: then Medium/Low switch
  // to a compact (still complete, non-truncated) row. Critical/High are always full cards.
  const mediumLowCount = d.findings.filter((f) => f.severity === "Medium" || f.severity === "Low").length;
  const useCompactMediumLow = mediumLowCount > COMPACT_THRESHOLD;
  const ordered = SEVERITY_ORDER.flatMap((sev) => d.findings.filter((f) => f.severity === sev));

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

        <SectionHead num="01" title="Assessment summary" top={6} />
        <View style={s.kRow}>
          <View style={s.kCell}><Text style={s.label}>CYBER HEALTH SCORE</Text><Text style={s.kNum}>{d.score} / 100</Text><Text style={s.kSmall}>Out of 100</Text></View>
          <View style={s.kCell}><Text style={s.label}>CRITICAL FINDINGS</Text><Text style={s.kNum}>{critical.length}</Text><Text style={s.kSmall}>Urgent</Text></View>
          <View style={s.kCell}><Text style={s.label}>HIGH FINDINGS</Text><Text style={s.kNum}>{d.findings.filter((f) => f.severity === "High").length}</Text><Text style={s.kSmall}>Prioritize promptly</Text></View>
          <View style={[s.kCell, { paddingRight: 0 }]}><Text style={s.label}>MEDIUM / LOW</Text><Text style={s.kNum}>{d.findings.filter((f) => f.severity === "Medium").length} / {d.findings.filter((f) => f.severity === "Low").length}</Text><Text style={s.kSmall}>Plan and review</Text></View>
        </View>
        <Text style={s.lead}>{d.scoreInterpretation}</Text>
        {d.riskTier ? <Text style={s.riskLine}>Reported risk tier: {d.riskTier}. Individual findings take priority over the average.</Text> : null}

        <SectionHead num="02" title="Inside this report" top={3} />
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
        <View>
          {d.groups.map((g) => (
            <View key={g.name} style={s.barRow}>
              <Text style={s.barName}>{g.name.toUpperCase()}</Text>
              <View style={s.barTrack}><View style={[s.barFill, { width: `${g.score}%` }]} /></View>
              <Text style={s.barPct}>{g.score}%</Text>
            </View>
          ))}
        </View>
        <View style={s.bigRow}>
          {d.groups.map((g, i) => (
            <View key={g.name} style={[s.bigCell, { flex: [135, 124, 124, 125, 126][i] ?? 125 }, i === 0 ? {} : { paddingLeft: 3 }, i === d.groups.length - 1 ? { borderRightWidth: 0 } : {}]}>
              <Text style={s.label}>{g.name.toUpperCase()}</Text>
              <Text style={s.bigNum}>{g.score}%</Text>
            </View>
          ))}
        </View>
        <View style={s.tHead}>
          <Text style={[s.tCat, s.tHeadText]}>CATEGORY</Text>
          <Text style={[s.tCtl, s.tHeadText]}>CONTROLS</Text>
          <Text style={[s.tHeadText, { flex: 1 }]}>COVERAGE</Text>
        </View>
        {d.groups.map((g) => (
          <View key={g.name} style={s.tRow}>
            <Text style={s.tCat}>
              {g.name}
              {g.categories.some((c) => criticalIds.has(c.id)) ? <Text style={s.critTag}>CRITICAL</Text> : null}
            </Text>
            <Text style={s.tCtl}>{g.categories.length}</Text>
            <Text style={s.tCov}>{g.score}%</Text>
          </View>
        ))}
        <View style={s.note}>
          <Text><Text style={s.noteLabel}>Reading this score.</Text> Reported coverage is not independent verification. Critical flags derive from the findings mapped to each category; a high average does not cancel an individual control gap.</Text>
        </View>
      </View>
      </ReportPage>

      <ReportPage d={d}>
      <View>
        <SectionHead num="04" title="Priority findings" />
        <Text style={s.p}>Reported findings require validation, in the order they should be worked.</Text>
        <View style={s.sevStrip}>
          {SEVERITY_ORDER.map((level) => {
            const count = d.findings.filter((f) => f.severity === level).length;
            return (
              <View key={level} style={s.sevCell}>
                <Text style={s.label}>{level.toUpperCase()}</Text>
                <Text style={s.sevNum}>{count}</Text>
              </View>
            );
          })}
        </View>

        {ordered.map((f, i) => {
          const compact = useCompactMediumLow && (f.severity === "Medium" || f.severity === "Low");
          return compact ? <CompactRow f={f} key={i} /> : <FindingCard f={f} key={i} />;
        })}

        <View style={[s.h2, { marginTop: 4 }]} minPresenceAhead={60}><Text style={s.h2Num}>A</Text><Text style={s.h2Title}>Risk level guide</Text></View>
        <View style={s.guideHead}>
          <Text style={[s.guideLevel, s.tHeadText]}>LEVEL</Text>
          <Text style={[s.tHeadText, { flex: 1 }]}>MEANING</Text>
        </View>
        {RISK_GUIDE.map(([level, explanation]) => (
          <View key={level} style={s.guideRow} wrap={false}>
            <View style={s.guideLevel}>
              <Text style={[s.guideTag, { backgroundColor: SEV_TAG[level].bg, color: SEV_TAG[level].fg }]}>{level.toUpperCase()}</Text>
            </View>
            <Text style={s.guideText}>{explanation}</Text>
          </View>
        ))}
        <Text style={[s.small, { marginTop: 4 }]}>Severity indicates priority, not a prediction that an incident will occur. Every finding above is listed in full — none are omitted or summarized away.</Text>
      </View>
      </ReportPage>

      <ReportPage d={d}>
      <View>
        <SectionHead num="05" title="Quick wins" />
        <Text style={s.p}>Actions your team can start now — not a promise every item can be fixed without specialist help.</Text>
        {d.quickWins.length > 0 ? (
          d.quickWins.map((q, i) => (
            <View style={s.itemRow} key={i} wrap={false}>
              <Text style={s.itemNum}>{String(i + 1).padStart(2, "0")}</Text>
              <View style={s.itemBody}>
                <Text style={s.itemTitle}>{q.title}</Text>
                <Text style={s.itemText}>{q.action}</Text>
                <Text style={s.itemMeta}><Text style={s.smallStrong}>Suggested owner:</Text> {q.owner} · <Text style={s.smallStrong}>Completion check:</Text> {q.check}</Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={s.p}>No low-effort quick wins were identified from this assessment — remaining items are addressed in the action roadmap.</Text>
        )}
        <Text style={[s.small, { marginTop: 6 }]} wrap={false}><Text style={s.smallStrong}>When specialist support helps:</Text> {d.specialistSupport}</Text>

        <SectionHead num="06" title="Action roadmap" top={4} />
        <Text style={s.p}>Sequenced by urgency and effort, not automatically by severity alone.</Text>
        {d.roadmap.map((r, i) => (
          <View key={i} style={s.itemRow} wrap={false}>
            <Text style={s.itemNum}>{i + 1}</Text>
            <View style={s.itemBody}>
              <Text style={s.itemTitle}>{r.period}</Text>
              <Text style={s.itemText}>{r.action}</Text>
              <Text style={s.itemMeta}><Text style={s.smallStrong}>Suggested owner:</Text> {r.owner} · <Text style={s.smallStrong}>Evidence to collect:</Text> {r.evidence}</Text>
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
          <View style={[s.threeCell, { borderLeftWidth: 0, paddingLeft: 0 }]}><Text style={s.threeTitle}>REVIEW</Text><Text style={s.threeText}>Validate findings and clarify current controls.</Text></View>
          <View style={s.threeCell}><Text style={s.threeTitle}>DEFINE</Text><Text style={s.threeText}>Agree priorities, proposed work and responsibilities.</Text></View>
          <View style={s.threeCell}><Text style={s.threeTitle}>DECIDE</Text><Text style={s.threeText}>Agree whether a Private Scope Review is the right next step.</Text></View>
        </View>

        <View style={s.strip} wrap={false}>
          <View style={[s.stripCell, { flex: 318 }]}>
            <Text style={s.label}>BOOK A CONVERSATION</Text>
            <Link src={CONTACT} style={[s.stripValue, { color: INK, textDecoration: "none" }]}>{CONTACT_TEXT}</Link>
          </View>
          <View style={[s.stripCell, { flex: 245 }]}><Text style={s.label}>REFERENCE</Text><Text style={s.stripValue}>{d.clientReference}</Text></View>
          <View style={[s.stripCell, { flex: 246 }]}><Text style={s.label}>REVIEW PROGRESS</Text><Text style={s.stripValue}>{d.reassessment}</Text></View>
          <View style={[s.stripCell, { flex: 247, borderRightWidth: 0 }]}><Text style={s.label}>SCHEDULING</Text><Text style={s.stripValue}>Confirmed after your enquiry</Text></View>
        </View>

        <SectionHead num="A" title={"Report use & limitations"} top={2} />
        <Text style={s.limit}>This questionnaire-based report is not a technical audit, compliance certification or guarantee of security. Reported findings require validation. Share only with authorized recipients.</Text>
        <Text style={s.limit}>This report is automatically generated; no signature is required. Use it as a reference when booking a Private Scope Review or continuing your enquiry with ORAGROL. It does not constitute a service agreement.</Text>

        <View style={s.qrBox} wrap={false}>
          <Image src={contactQrSrc} style={s.qr} />
          <View style={{ flex: 1 }}>
            <Text style={s.qrTitle}>Continue the conversation</Text>
            <Text style={s.qrText}>Scan to book a conversation at {CONTACT_TEXT}. Quote reference {d.clientReference}.</Text>
          </View>
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
