import React from "react";
import { Document, Page, Text, View, StyleSheet, Link, Image } from "@react-pdf/renderer";

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
  /** Approved logo only. Omit to use a plain typographic brand treatment. */
  logoSrc?: string;
  /** PNG/data URL generated from https://orgro.ca/contact, never an AI-drawn QR. */
  contactQrSrc: string;
  /** Approved high-resolution photo assets, not screenshots of the preview. */
  coverPhotoSrc: string;
  closingPhotoSrc: string;
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
  // NOTE: no lineHeight on `page` (deliberately). A page-level lineHeight,
  // inherited by the fixed absolute-positioned footer (which has a
  // sibling <Text render={...}> for the page number), triggers a real
  // @react-pdf/renderer bug: that footer stays present in the PDF's text
  // layer (pypdf finds it) but is completely invisible when rasterized —
  // reproduced and isolated across a dozen minimal test cases, and true
  // regardless of the footer's own internal layout (flex row, two
  // separately-positioned elements, even a bare Page-level sibling) —
  // the only thing that reliably avoids it is keeping lineHeight off the
  // footer's *entire* inherited ancestor chain, all the way up to Page.
  // Wrapping page content in one extra lineHeight-bearing View instead
  // was tried and also fixed the footer, but silently changed body text's
  // effective line height enough to overflow every page by a line or two
  // (visually confirmed) — so instead, every text style/element below
  // that needs the readable 1.4 rhythm declares it directly on itself
  // (identical resolved value, no extra ancestor, no pagination drift).
  page: { backgroundColor: "#B8B7B2", color: "#111315", fontFamily: "Helvetica", padding: 40, paddingBottom: 60, fontSize: 10 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottom: "0.5 solid #96958F", paddingBottom: 12, marginBottom: 22 },
  logo: { width: 108, height: 30, objectFit: "contain", objectPosition: "left" },
  small: { fontSize: 8, color: "#4B4B47", lineHeight: 1.4 },
  brand: { fontSize: 12, letterSpacing: 2.2, fontFamily: "Helvetica-Bold", lineHeight: 1.4 },
  title: { fontSize: 23, lineHeight: 1.15, marginBottom: 10, fontFamily: "Helvetica-Bold" },
  subtitle: { fontSize: 10, color: "#4B4B47", marginBottom: 13, lineHeight: 1.4 },
  rule: { borderTop: "0.5 solid #96958F", marginVertical: 10 },
  h2: { fontFamily: "Helvetica-Bold", fontSize: 12, marginBottom: 6, lineHeight: 1.4 },
  paragraph: { marginBottom: 7, lineHeight: 1.4 },
  scoreBox: { backgroundColor: "#111315", color: "#F2F2EE", padding: 12, flexDirection: "row", gap: 24, marginVertical: 10 },
  score: { fontSize: 32, lineHeight: 1.1 },
  orange: { color: "#EF4D00", fontSize: 8, marginBottom: 7, lineHeight: 1.4 },
  prepared: { marginTop: 10 },
  detail: { flexDirection: "row", borderBottom: "0.5 solid #96958F", paddingVertical: 4 },
  label: { width: "40%", fontSize: 9, color: "#4B4B47", lineHeight: 1.4 },
  value: { width: "60%", fontSize: 10, lineHeight: 1.4 },
  // Page 2: dividers, not white panels. Groups sit directly on the page
  // grey with a rule under the header and hairline dividers between rows.
  groupBlock: { marginBottom: 12 },
  groupHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", borderBottom: "0.75 solid #111315", paddingBottom: 4, marginBottom: 5 },
  groupHeaderName: { fontFamily: "Helvetica-Bold", fontSize: 10.5, textTransform: "uppercase", letterSpacing: 0.4, lineHeight: 1.4 },
  groupHeaderScore: { fontFamily: "Helvetica-Bold", fontSize: 10.5, lineHeight: 1.4 },
  category: { flexDirection: "row", alignItems: "center", paddingVertical: 3, borderBottom: "0.5 solid #A8A7A1" },
  categoryName: { width: "58%", fontSize: 8.5, lineHeight: 1.4 },
  track: { width: "27%", height: 4, backgroundColor: "#A8A7A1" },
  bar: { height: 4, backgroundColor: "#111315" },
  percent: { width: "9%", textAlign: "right", fontSize: 8.5, lineHeight: 1.4 },
  // Page 3: full cards for Critical/High and small-finding-count reports.
  finding: { border: "0.5 solid #96958F", padding: 8, marginBottom: 6 },
  findingTitle: { fontFamily: "Helvetica-Bold", fontSize: 11, marginBottom: 4, lineHeight: 1.4 },
  findingLine: { fontSize: 8.75, marginBottom: 2, lineHeight: 1.4 },
  compactRow: { flexDirection: "row", paddingVertical: 4, borderBottom: "0.5 solid #A8A7A1" },
  compactTitle: { width: "44%", fontSize: 8.5, fontFamily: "Helvetica-Bold", paddingRight: 8, lineHeight: 1.4 },
  compactAction: { flex: 1, fontSize: 8.5, lineHeight: 1.4 },
  quickCol: { flex: 1, borderLeft: "0.5 solid #4B4B47", paddingLeft: 12 },
  action: { marginBottom: 8, lineHeight: 1.4 },
  contact: { backgroundColor: "#111315", padding: 16, marginVertical: 14, flexDirection: "row", justifyContent: "space-between", color: "#F2F2EE" },
  contactLink: { color: "#F2F2EE", fontSize: 13, marginTop: 8, lineHeight: 1.4 },
  qr: { width: 85, height: 85, backgroundColor: "#FFFFFF", padding: 4 },
  footer: { position: "absolute", bottom: 22, left: 40, right: 40, borderTop: "0.5 solid #96958F", paddingTop: 8, fontSize: 7.5, color: "#111315", flexDirection: "row", justifyContent: "space-between" },
});

function FindingCard({ f }: { f: Finding }) {
  return (
    <View style={s.finding} wrap={false}>
      <Text style={s.orange}>{f.severity.toUpperCase()}</Text>
      <Text style={s.findingTitle}>{f.title}</Text>
      <Text style={s.findingLine}><Text style={{ fontFamily: "Helvetica-Bold" }}>Reported gap: </Text>{f.reportedGap}</Text>
      <Text style={s.findingLine}><Text style={{ fontFamily: "Helvetica-Bold" }}>Business impact: </Text>{f.impact}</Text>
      <Text style={s.findingLine}><Text style={{ fontFamily: "Helvetica-Bold" }}>Next action: </Text>{f.action}</Text>
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

/** Pure PDF document. Keep scoring, delivery, QR generation and CRM logic outside. */
export default function CyberHealthPdfReport({ data: d, logoSrc, contactQrSrc, coverPhotoSrc, closingPhotoSrc }: PdfReportProps) {
  validate(d);
  if (!coverPhotoSrc || !closingPhotoSrc || !contactQrSrc) throw new Error("Provide both approved photo assets and the verified contact QR before rendering");
  const critical = d.findings.filter((f) => f.severity === "Critical");
  const criticalIds = new Set(critical.flatMap((f) => f.categoryIds));

  // Every severity is always shown in full detail EXCEPT when the
  // combined Medium+Low volume is large — then Medium/Low switch to a
  // compact (still complete, non-truncated) row. Critical/High are
  // always full cards.
  const mediumLowCount = d.findings.filter((f) => f.severity === "Medium" || f.severity === "Low").length;
  const useCompactMediumLow = mediumLowCount > COMPACT_THRESHOLD;

  const header = (section: string) => <View style={s.header}><View>{logoSrc ? <Image src={logoSrc} style={s.logo} /> : <Text style={s.brand}>ORAGROL GLOBAL</Text>}</View><Text style={s.small}>{section.toUpperCase()}</Text></View>;
  // A fresh element per call — react-pdf's layout engine walks the tree
  // per Page, and reusing one JSX element instance as a child of six
  // different <Page>s (the previous bug) left the footer absent on every
  // page: no reference count of pageNumber/totalPages of the previously
  // rendered content, silently dropped rather than duplicated.
  const footer = () => <View style={s.footer} fixed><Text>{d.clientReference} · PRIVATE & CONFIDENTIAL</Text><Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} /></View>;
  const page = (section: string, children: React.ReactNode) => <Page size="A4" style={s.page}>{header(section)}{children}{footer()}</Page>;

  return <Document title="ORAGROL Cyber Health Assessment Report" author="ORAGROL Global" subject="Questionnaire-based Cyber Health Assessment">
    {page("Executive brief", <>
      <View wrap={false} style={{ height: 210, marginBottom: 12, position: "relative" }}>
        <Image src={coverPhotoSrc} style={{ width: "100%", height: 210, objectFit: "cover" }} />
        <View style={{ position: "absolute", bottom: 0, left: 0, width: "72%", backgroundColor: "#111315", padding: 13 }}><Text style={{ fontFamily: "Helvetica-Bold", fontSize: 24, lineHeight: 1.08, color: "#FFFFFF" }}>CYBER HEALTH{"\n"}ASSESSMENT{"\n"}REPORT</Text></View>
      </View>
      <Text style={[s.h2, { fontSize: 13 }]}>PROTECT / AUTOMATE / UNIFY</Text>
      <Text style={{ lineHeight: 1.4 }}>Cybersecurity, intelligent automation and coordinated operations{"\n"}for Canadian businesses.</Text>
      <View style={s.scoreBox} wrap={false}><View style={{ width: "35%" }}><Text style={s.score}>{d.score}<Text style={{ fontSize: 15 }}> / 100</Text></Text><Text style={{ fontSize: 7, marginTop: 5 }}>CYBER HEALTH SCORE</Text></View><View style={{ flex: 1 }}><Text style={s.orange}>{critical.length ? `${critical.length} CRITICAL FINDING${critical.length === 1 ? "" : "S"}` : "ASSESSMENT SUMMARY"}</Text><Text style={{ lineHeight: 1.4 }}>{d.scoreInterpretation}</Text>{d.riskTier && <Text style={{ fontSize: 8, marginTop: 8, lineHeight: 1.4 }}>Reported risk tier: {d.riskTier}. Individual findings take priority over the average.</Text>}</View></View>

      <View style={s.prepared}><Text style={s.h2}>PREPARED FOR:</Text>{[
        ["Company name", d.companyName], ["Business sector", d.businessSector], ["Number of employees", d.employeeCount], ["Assessment date", d.assessmentDate], ["Contact name", d.contactName], ["Phone number", d.phoneNumber], ["Client reference code", d.clientReference],
      ].map(([label, value]) => <View style={s.detail} key={label} wrap={false}><Text style={s.label}>{label}</Text><Text style={s.value}>{value}</Text></View>)}</View>
      <Text style={[s.h2, { marginTop: 10 }]}>Inside this report</Text><Text style={s.small}>Control coverage, priority findings, quick wins and a practical action roadmap. Based on assessment responses; controls have not been independently verified.</Text>
    </>)}
    {page("Score & control coverage", <>
      <Text style={s.title}>Your score & control coverage</Text><Text style={s.subtitle}>Overall score: {d.score}/100. A Critical finding overrides its category status, regardless of the average.</Text>
      {d.groups.map((g) => <View key={g.name} style={s.groupBlock} wrap={false}>
        <View style={s.groupHeader}><Text style={s.groupHeaderName}>{g.name}</Text><Text style={s.groupHeaderScore}>{g.score}%{g.categories.some((c) => criticalIds.has(c.id)) && <Text style={{ color: "#EF4D00" }}> · CRITICAL</Text>}</Text></View>
        {g.categories.map((c) => <View key={c.id} style={s.category}>
          <Text style={s.categoryName}>{c.name}{criticalIds.has(c.id) && <Text style={{ color: "#EF4D00", fontFamily: "Helvetica-Bold" }}> · CRITICAL</Text>}</Text>
          <View style={s.track}><View style={[s.bar, { width: `${c.score}%` }]} /></View>
          <Text style={s.percent}>{c.score}%</Text>
        </View>)}
      </View>)}
      <Text style={s.small}>Reported coverage is not independent verification. Critical flags derive from the findings mapped to each category; a high average does not cancel an individual control gap.</Text>
    </>)}
    {page("Priority findings", <>
      <Text style={s.title}>The gaps that need attention first</Text><Text style={s.subtitle}>Reported findings require validation, in the order they should be worked.</Text>
      <View style={{ flexDirection: "row", marginBottom: 9 }}>{SEVERITY_ORDER.map((level) => {
        const count = d.findings.filter((f) => f.severity === level).length;
        return <View key={level} style={{ width: "25%", padding: 6, backgroundColor: "#C7C6C1", borderLeft: level === "Critical" && count > 0 ? "3 solid #EF4D00" : undefined }}>
          <Text style={s.small}>{level.toUpperCase()}</Text><Text style={{ fontSize: 18 }}>{count}</Text>
        </View>;
      })}</View>

      {SEVERITY_ORDER.map((severity) => {
        const items = d.findings.filter((f) => f.severity === severity);
        if (!items.length) return null;
        const compact = useCompactMediumLow && (severity === "Medium" || severity === "Low");
        return <View key={severity}>
          <Text style={[s.h2, { marginTop: 4, marginBottom: compact ? 3 : 6 }]}>{severity} ({items.length})</Text>
          {compact
            ? items.map((f, i) => <CompactRow f={f} key={i} />)
            : items.map((f, i) => <FindingCard f={f} key={i} />)}
        </View>;
      })}

      <Text style={[s.h2, { marginTop: 8 }]}>Risk level guide</Text>
      {RISK_GUIDE.map(([level, explanation]) => <View key={level} style={{ flexDirection: "row", marginBottom: 3 }}><Text style={{ width: 65, fontSize: 8, fontFamily: "Helvetica-Bold" }}>{level}</Text><Text style={{ flex: 1, fontSize: 8, lineHeight: 1.4 }}>{explanation}</Text></View>)}
      <Text style={[s.small, { marginTop: 4 }]}>Severity indicates priority, not a prediction that an incident will occur. Every finding above is listed in full — none are omitted or summarized away.</Text>
    </>)}
    {page("Quick wins", <>
      <Text style={s.title}>QUICK WINS</Text>
      <Text style={s.subtitle}>Actions your team can start now — not a promise every item can be fixed without specialist help.</Text>
      {d.quickWins.length > 0 ? (
        <View style={{ flexDirection: "row", gap: 16, marginVertical: 14 }}>{d.quickWins.map((q, i) => <View style={s.quickCol} key={i}>
          <Text style={{ fontSize: 26, marginBottom: 8 }}>{String(i + 1).padStart(2, "0")}</Text>
          <Text style={s.h2}>{q.title}</Text>
          <Text style={{ marginBottom: 8, lineHeight: 1.4 }}>{q.action}</Text>
          <Text style={[s.small, { marginBottom: 2 }]}>Suggested owner</Text>
          <Text style={{ fontSize: 9, marginBottom: 8, lineHeight: 1.4 }}>{q.owner}</Text>
          <Text style={[s.small, { marginBottom: 2 }]}>Completion check</Text>
          <Text style={{ fontSize: 9, lineHeight: 1.4 }}>{q.check}</Text>
        </View>)}</View>
      ) : (
        <Text style={s.paragraph}>No low-effort quick wins were identified from this assessment — remaining items are addressed in the action roadmap.</Text>
      )}
      <View style={{ backgroundColor: "#111315", padding: 18, marginTop: 16 }}><Text style={{ fontSize: 16, color: "#FFFFFF", marginBottom: 10 }}>WHEN SPECIALIST SUPPORT HELPS</Text><Text style={{ color: "#FFFFFF", lineHeight: 1.4 }}>{d.specialistSupport}</Text></View>
    </>)}
    {page("Action roadmap", <>
      <Text style={s.title}>ACTION ROADMAP</Text>
      <Text style={s.subtitle}>Sequenced by urgency and effort, not automatically by severity alone.</Text>
      <View style={{ gap: 14, marginVertical: 16 }}>{d.roadmap.map((r, i) => <View key={i} style={{ backgroundColor: "#C7C6C1", padding: 16 }} wrap={false}>
        <Text style={s.orange}>{r.period}</Text>
        <Text style={{ fontSize: 10, lineHeight: 1.4 }}>{r.action}</Text>
        <Text style={[s.small, { marginTop: 10 }]}>Suggested owner</Text>
        <Text style={{ fontSize: 9, lineHeight: 1.4 }}>{r.owner}</Text>
        <Text style={[s.small, { marginTop: 10 }]}>Evidence to collect</Text>
        <Text style={{ fontSize: 9, lineHeight: 1.4 }}>{r.evidence}</Text>
      </View>)}</View>
      <Text style={s.small}>Timing is indicative, not a delivery commitment. Critical and high-severity issues are never deferred to a later phase. Validate the need and use existing tools where suitable before purchasing additional services.</Text>
    </>)}
    {page("Continue with ORAGROL", <>
      <View wrap={false} style={{ height: 140, marginBottom: 14, position: "relative" }}><Image src={closingPhotoSrc} style={{ width: "100%", height: 140, objectFit: "cover" }} /><View style={{ position: "absolute", bottom: 0, left: 0, padding: 12, backgroundColor: "#111315" }}><Text style={{ fontSize: 23, color: "#FFFFFF", lineHeight: 1.1 }}>PRIVATE{"\n"}SCOPE REVIEW</Text></View></View>
      <Text style={s.paragraph}>Bring this report to a focused conversation about what needs attention, what your team can handle and where external support would add value.</Text>
      <View style={{ flexDirection: "row", gap: 16, marginBottom: 10 }}>{[
        ["Review", "Validate findings and clarify current controls."],
        ["Define", "Agree priorities, proposed work and responsibilities."],
        ["Decide", "Agree whether a Private Scope Review is the right next step."],
      ].map(([title, body]) => <View style={{ flex: 1 }} key={title}><Text style={s.h2}>{title}</Text><Text style={{ fontSize: 9, lineHeight: 1.4 }}>{body}</Text></View>)}</View>
      <View style={s.contact} wrap={false}><View style={{ width: "73%" }}><Text style={{ fontSize: 19 }}>Book a conversation</Text><Link src={CONTACT} style={s.contactLink}>orgro.ca/contact</Link><Text style={{ fontSize: 8, marginTop: 9, lineHeight: 1.4 }}>Reference: {d.clientReference}{"\n"}Scheduling is confirmed after your enquiry.</Text></View>{contactQrSrc && <Image src={contactQrSrc} style={s.qr} />}</View>
      <Text style={s.h2}>Review progress</Text><Text style={s.paragraph}>{d.reassessment}</Text>
      <Text style={s.h2}>Report use & limitations</Text><Text style={s.paragraph}>This questionnaire-based report is not a technical audit, compliance certification or guarantee of security. Reported findings require validation. Share only with authorized recipients.</Text>
      <Text style={s.paragraph}>This report is automatically generated; no signature is required. Use it as a reference when booking a Private Scope Review or continuing your enquiry with ORAGROL. It does not constitute a service agreement.</Text>
      <View style={s.rule} /><Text style={s.small}>ORAGROL GLOBAL · PROTECT / AUTOMATE / UNIFY</Text>
    </>)}
  </Document>;
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
