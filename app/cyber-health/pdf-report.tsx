import React from "react";
import { Document, Page, Text, View, StyleSheet, Link, Image } from "@react-pdf/renderer";

export type Finding = { title: string; severity: "Critical" | "High" | "Medium" | "Low"; reportedGap: string; impact: string; action: string; categoryIds: string[] };
export type Category = { id: string; name: string; score: number };
export type CategoryGroup = { name: string; score: number; categories: Category[] };
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
  findings: Finding[];
  quickWins: { title: string; action: string }[];
  specialistSupport: string;
  roadmap: { period: string; action: string; evidence: string }[];
  reassessment: string;
};
export type PdfReportProps = {
  data: CyberHealthReportData;
  /** Approved logo only. Omit to use a plain typographic brand treatment. */
  logoSrc?: string;
  /** PNG/data URL generated from https://orgro.ca/contact, never an AI-drawn QR. */
  contactQrSrc?: string;
};
const CONTACT = "https://orgro.ca/contact";
const s = StyleSheet.create({
  page: { backgroundColor: "#F2F2EE", color: "#111315", fontFamily: "Helvetica", padding: 40, paddingBottom: 58, fontSize: 10, lineHeight: 1.45 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottom: "0.5 solid #D2D3CE", paddingBottom: 12, marginBottom: 22 },
  logo: { width: 108, height: 30, objectFit: "contain", objectPosition: "left" },
  small: { fontSize: 8, color: "#626560" },
  brand: { fontSize: 11, letterSpacing: 2 },
  title: { fontSize: 22, lineHeight: 1.15, marginBottom: 12 },
  subtitle: { fontSize: 10, color: "#626560", marginBottom: 18 },
  heroBrand: { fontSize: 48, fontFamily: "Helvetica-Bold", letterSpacing: -1, marginTop: 14 },
  global: { fontSize: 11, letterSpacing: 5, marginBottom: 22 },
  rule: { borderTop: "0.5 solid #D2D3CE", marginVertical: 16 },
  h2: { fontFamily: "Helvetica-Bold", fontSize: 12, marginBottom: 8 },
  paragraph: { marginBottom: 10 },
  scoreBox: { backgroundColor: "#111315", color: "#F2F2EE", padding: 18, flexDirection: "row", gap: 24, marginVertical: 18 },
  score: { fontSize: 47, lineHeight: 1.1 },
  orange: { color: "#EF4D00", fontSize: 8, marginBottom: 7 },
  prepared: { marginTop: 10 },
  detail: { flexDirection: "row", borderBottom: "0.5 solid #D2D3CE", paddingVertical: 6 },
  label: { width: "40%", fontSize: 9, color: "#626560" },
  value: { width: "60%", fontSize: 10 },
  group: { marginBottom: 13 },
  groupTitle: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  groupName: { fontFamily: "Helvetica-Bold", fontSize: 10 },
  category: { flexDirection: "row", alignItems: "center", marginBottom: 5 },
  categoryName: { width: "61%", fontSize: 8 },
  track: { width: "30%", height: 4, backgroundColor: "#D2D3CE" },
  bar: { height: 4, backgroundColor: "#111315" },
  percent: { width: "9%", textAlign: "right", fontSize: 8 },
  finding: { borderBottom: "0.5 solid #D2D3CE", paddingBottom: 13, marginBottom: 16 },
  findingTitle: { fontFamily: "Helvetica-Bold", fontSize: 12, marginBottom: 6 },
  quick: { backgroundColor: "#E5E5DF", padding: 15, marginBottom: 18 },
  action: { marginBottom: 10 },
  contact: { backgroundColor: "#111315", padding: 18, marginVertical: 18, flexDirection: "row", justifyContent: "space-between", color: "#F2F2EE" },
  contactLink: { color: "#F2F2EE", fontSize: 13, marginTop: 8 },
  qr: { width: 85, height: 85, backgroundColor: "#FFFFFF", padding: 4 },
  footer: { position: "absolute", bottom: 25, left: 40, right: 40, borderTop: "0.5 solid #D2D3CE", paddingTop: 9, fontSize: 7, color: "#626560", flexDirection: "row", justifyContent: "space-between" },
});

/** Pure PDF document. Keep scoring, delivery, QR generation and CRM logic outside. */
export default function CyberHealthPdfReport({ data: d, logoSrc, contactQrSrc }: PdfReportProps) {
  validate(d);
  const critical = d.findings.filter(f => f.severity === "Critical");
  const priority = d.findings.filter(f => ["Critical", "High"].includes(f.severity));
  const criticalIds = new Set(critical.flatMap(f => f.categoryIds));
  const header = (section: string) => <View style={s.header}><View>{logoSrc ? <Image src={logoSrc} style={s.logo} /> : <Text style={s.brand}>ORAGROL GLOBAL</Text>}</View><Text style={s.small}>{section.toUpperCase()}</Text></View>;
  const footer = <View style={s.footer} fixed><Text>{d.clientReference} · PRIVATE & CONFIDENTIAL</Text><Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} /></View>;
  const page = (section: string, children: React.ReactNode) => <Page size="A4" style={s.page}>{header(section)}{children}{footer}</Page>;
  return <Document title={`Cyber Health Assessment Report | ${d.companyName}`} author="ORAGROL Global" subject="Questionnaire-based Cyber Health Assessment">
    {page("Executive brief", <>
      <Text style={s.heroBrand}>ORAGROL</Text><Text style={s.global}>GLOBAL</Text>
      <Text style={s.h2}>PROTECT / AUTOMATE / UNIFY</Text>
      <Text>Cybersecurity, intelligent automation and coordinated operations{"\n"}for Canadian businesses.</Text>
      <View style={s.scoreBox} wrap={false}><View style={{ width: "35%" }}><Text style={s.score}>{d.score}<Text style={{ fontSize: 15 }}> / 100</Text></Text><Text style={{ fontSize: 7, marginTop: 5 }}>CYBER HEALTH SCORE</Text></View><View style={{ flex: 1 }}><Text style={s.orange}>{critical.length ? `${critical.length} CRITICAL FINDING${critical.length === 1 ? "" : "S"}` : "ASSESSMENT SUMMARY"}</Text><Text>{d.scoreInterpretation}</Text>{d.riskTier && <Text style={{ fontSize: 8, marginTop: 8 }}>Reported risk tier: {d.riskTier}. Individual findings take priority over the average.</Text>}</View></View>
      <Text style={s.h2}>CYBER HEALTH ASSESSMENT REPORT</Text>
      <View style={s.prepared}><Text style={s.h2}>PREPARED FOR:</Text>{[
        ["Company name", d.companyName], ["Business sector", d.businessSector], ["Number of employees", d.employeeCount], ["Assessment date", d.assessmentDate], ["Contact name", d.contactName], ["Phone number", d.phoneNumber], ["Client reference code", d.clientReference],
      ].map(([label, value]) => <View style={s.detail} key={label} wrap={false}><Text style={s.label}>{label}</Text><Text style={s.value}>{value}</Text></View>)}</View>
      <Text style={[s.h2, { marginTop: 17 }]}>Inside this report</Text><Text style={s.small}>Your score and control coverage, critical findings, quick wins and a practical action plan to guide your next conversation. Based on assessment responses; controls have not been independently verified.</Text>
    </>)}
    {page("Score & control coverage", <>
      <Text style={s.title}>Your score & control coverage</Text><Text style={s.subtitle}>Overall score: {d.score}/100. A Critical finding overrides its category status, regardless of the average.</Text>
      {d.groups.map(g => <View key={g.name} style={s.group} wrap={false}><View style={s.groupTitle}><Text style={s.groupName}>{g.name}</Text><Text style={s.groupName}>{g.score}%{g.categories.some(c => criticalIds.has(c.id)) ? " · CRITICAL" : ""}</Text></View>{g.categories.map(c => <View key={c.id} style={s.category}><Text style={s.categoryName}>{c.name}{criticalIds.has(c.id) ? " · CRITICAL" : ""}</Text><View style={s.track}><View style={[s.bar, { width: `${c.score}%` }]} /></View><Text style={s.percent}>{c.score}%</Text></View>)}</View>)}
      <Text style={s.small}>Percentages describe reported control coverage, not independent verification of effectiveness. Critical flags derive from the findings mapped to each category. A high average does not cancel an individual control gap.</Text>
    </>)}
    {page("Priority findings", <>
      <Text style={s.title}>The gaps that need attention first</Text><Text style={s.subtitle}>Reported findings require validation. Related findings should be coordinated to avoid duplicated work.</Text>
      {(priority.length ? priority : d.findings).map((f,i) => <View style={s.finding} key={`${f.title}-${i}`} wrap={false}><Text style={s.orange}>{f.severity.toUpperCase()}</Text><Text style={s.findingTitle}>{f.title}</Text><Text><Text style={{ fontFamily: "Helvetica-Bold" }}>Reported gap: </Text>{f.reportedGap}</Text><Text><Text style={{ fontFamily: "Helvetica-Bold" }}>Business impact: </Text>{f.impact}</Text><Text><Text style={{ fontFamily: "Helvetica-Bold" }}>Next action: </Text>{f.action}</Text></View>)}
      {!d.findings.length && <Text>No findings were supplied for this assessment. This does not establish that no weaknesses exist.</Text>}
    </>)}
    {page("Prioritized action plan", <>
      <Text style={s.title}>A practical sequence for improvement</Text>
      <View style={s.quick}><Text style={s.h2}>QUICK WINS / YOUR TEAM CAN START</Text>{d.quickWins.map((q,i) => <View style={s.action} key={i}><Text style={{ fontFamily: "Helvetica-Bold" }}>{q.title}</Text><Text>{q.action}</Text></View>)}</View>
      <Text style={s.h2}>Work that may need specialist support</Text><Text style={s.paragraph}>{d.specialistSupport}</Text>
      {d.roadmap.map((r,i) => <View key={i} style={s.action} wrap={false}><Text style={s.orange}>{r.period}</Text><Text>{r.action}</Text><Text style={[s.small, { marginTop: 4 }]}>Completion evidence: {r.evidence}</Text></View>)}
      <Text style={s.small}>Timing is indicative, not a delivery commitment. Critical issues should not wait for a later phase. Validate the need and use existing tools where suitable before purchasing additional services.</Text>
    </>)}
    {page("Continue with ORAGROL", <>
      <Text style={s.title}>Your next step: Private Scope Review</Text><Text style={s.paragraph}>Bring this report to a focused conversation about what needs attention, what your team can handle and where external support would add value.</Text>
      {[["Review", "Validate reported gaps and clarify controls, priorities and dependencies."], ["Define", "Agree proposed work, responsibilities and evidence needed to confirm improvement."], ["Decide", "Where support is appropriate, consider a tailored proposal defining deliverables, timing and pricing. No commercial package is assigned by this report."]].map(([title, body]) => <View style={s.action} key={title}><Text style={s.h2}>{title}</Text><Text>{body}</Text></View>)}
      <View style={s.contact} wrap={false}><View style={{ width: "73%" }}><Text style={{ fontSize: 19 }}>Book a conversation</Text><Link src={CONTACT} style={s.contactLink}>orgro.ca/contact</Link><Text style={{ fontSize: 8, marginTop: 9 }}>Reference: {d.clientReference}{"\n"}Scheduling is confirmed after your enquiry.</Text></View>{contactQrSrc && <Image src={contactQrSrc} style={s.qr} />}</View>
      <Text style={s.h2}>Review progress</Text><Text style={s.paragraph}>{d.reassessment}</Text>
      <Text style={s.h2}>Report use & limitations</Text><Text style={s.paragraph}>This questionnaire-based report is not a technical audit, compliance certification or guarantee of security. Reported findings require validation. Share only with authorized recipients.</Text>
      <Text style={s.paragraph}>This report is automatically generated; no signature is required. Use it as a reference when booking a Private Scope Review or continuing your enquiry with ORAGROL. It does not constitute a service agreement.</Text>
      <View style={s.rule} /><Text style={s.small}>ORAGROL GLOBAL · PROTECT / AUTOMATE / UNIFY</Text>
    </>)}
  </Document>;
}

function validate(d: CyberHealthReportData) {
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
  for (const f of d.findings) if (!f.categoryIds.length || f.categoryIds.some(id => !ids.has(id))) throw new Error(`Unmapped finding: ${f.title}`);
}
