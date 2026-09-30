import React from "react";
import { Document, Page, Text, View, StyleSheet, Image, Link } from "@react-pdf/renderer";
import type { OdoReport, ReportFinding, ReportPriority } from "./odo-report";

/**
 * ODO discovery report — client-facing PDF.
 *
 * Renders ONLY report.client/summary/findings/swot/priorities/securityLane/
 * automationLane/outcomeNarrative/websitePointers/coverage. report.internal
 * is never touched here: incumbent-IT signals, Jev scores, the
 * custom-service flag and raw answers go to ZM77/Mohammad, not to the
 * prospect.
 *
 * Section order is fixed (§7, extended 2026-09-30 per Mohammad, twice):
 * overview → findings → SWOT → recommendation → what this means for you →
 * signature. Length is driven purely by what was found — a thin business
 * gets a short report, and that is correct, not a failure. A 7-page report
 * was never the target; the recommendation rebuild below (two compact
 * primary-pick cards instead of one stacked card per matched code) is what
 * actually shortens it.
 *
 * §34 trust counters are structural here, not optional copy: every finding
 * prints its own source and collection date, "Unconfirmed" is printed on
 * inferred items, informational items are labelled Info rather than dressed
 * as risk, and the coverage box states plainly what ODO could not check.
 *
 * RECOMMENDATION MODEL (Mohammad, 2026-09-30, round 2 — supersedes the
 * first pass): the report never dumps a wall of individual codes. Two
 * lanes, each with ONE clear primary pick:
 *   - Security: a package (or the Foundation default for small/scattered
 *     gaps), plus — always shown separately, since these are never sold
 *     inside any package — the exact à la carte-only or C10 items flagged,
 *     in a compact reference table.
 *   - Automation: OR ONE (broad/coordinated need), a named Business
 *     Automation bundle (Sales/Customer Service/Finance/IT/Marketing), or
 *     Tailored Automation (renamed from "Custom Job") when nothing
 *     bundle-sized fits. Automation has no à la carte fallback — ORAGROL
 *     doesn't sell it that way.
 * Codes still print (small, secondary, monospace) next to every item —
 * Mohammad's point: they're for ORAGROL's own/AI's internal clarity, not
 * something the client is meant to interpret. The thing the client actually
 * reads and can act on is always the real, findable product name. This
 * report intentionally never prints a static price, which could go stale or
 * leak internal margin data — the client finds current fees on orgro.ca.
 *
 * The QR code and legal-disclaimer text are supplied by the caller
 * (app/api/odo/scan/report/route.ts) — the QR image is generated there with
 * the `qrcode` package (same pattern as scope-worker.ts/scope-pdf.tsx: data
 * URI built outside the component, passed in as a prop) since generating an
 * image is not this component's job.
 *
 * Styling follows scope-pdf.tsx (same brand palette, A4, Helvetica). Two
 * hard-won rules from that file are respected: no `lineHeight` on `page`
 * itself, and no `lineHeight` on the fixed footer's own leaf Text styles —
 * both made the footer vanish from the rendered PDF.
 */

const BG = "#D2D2CA";
const INK = "#151719";
const SECONDARY = "#50565A";
const RULE = "#A0A39D";
const ORANGE = "#EF4D00";
const HIGH = "#B3300B";

const s = StyleSheet.create({
  page: { backgroundColor: BG, color: INK, fontFamily: "Helvetica", padding: 36, paddingBottom: 64, fontSize: 10 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 },
  wordmark: { fontSize: 21, lineHeight: 1, fontFamily: "Helvetica-Bold" },
  wordmarkSub: { fontSize: 8, letterSpacing: 2, color: SECONDARY, lineHeight: 1.4, marginTop: 2 },
  headerTag: { fontSize: 9, color: SECONDARY, letterSpacing: 0.5, lineHeight: 1.4, textAlign: "right" },
  heading: { fontSize: 34, lineHeight: 1.05, marginBottom: 6, fontFamily: "Helvetica-Bold" },
  subheading: { fontSize: 12, color: SECONDARY, lineHeight: 1.4, marginBottom: 14 },
  topRule: { borderTop: `0.75 solid ${RULE}`, marginBottom: 14 },

  metaRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 12 },
  metaCol: { width: "33%", marginBottom: 8 },
  fieldLabel: { fontSize: 7.5, letterSpacing: 1, color: SECONDARY, lineHeight: 1.4, marginBottom: 2 },
  fieldValue: { fontSize: 11, lineHeight: 1.3 },

  summaryBox: { borderLeft: `2 solid ${ORANGE}`, paddingLeft: 10, marginBottom: 16 },
  summaryText: { fontSize: 11, lineHeight: 1.5 },

  statRow: { flexDirection: "row", marginBottom: 18 },
  stat: { width: "25%" },
  statNum: { fontSize: 24, lineHeight: 1.1, fontFamily: "Helvetica-Bold" },
  statLabel: { fontSize: 7.5, letterSpacing: 0.8, color: SECONDARY, lineHeight: 1.35, marginTop: 2 },

  sectionBar: { backgroundColor: INK, flexDirection: "row", alignItems: "center", paddingVertical: 7, paddingHorizontal: 10, marginTop: 14, marginBottom: 8 },
  sectionNum: { color: ORANGE, fontSize: 10, lineHeight: 1.3, marginRight: 12, width: 16 },
  sectionTitle: { color: "#F4F2ED", fontSize: 12, lineHeight: 1.3, fontFamily: "Helvetica-Bold" },

  areaTitle: { fontSize: 11, lineHeight: 1.3, fontFamily: "Helvetica-Bold", marginTop: 10, marginBottom: 4 },
  finding: { paddingVertical: 6, borderBottom: `0.5 solid ${RULE}` },
  findingHead: { flexDirection: "row", marginBottom: 2 },
  badge: { fontSize: 7, letterSpacing: 0.6, lineHeight: 1.4, marginRight: 6, paddingHorizontal: 4, paddingVertical: 1, borderRadius: 2 },
  findingText: { fontSize: 10, lineHeight: 1.4 },
  findingMeta: { fontSize: 7.5, color: SECONDARY, lineHeight: 1.4, marginTop: 3 },
  raw: { fontSize: 7.5, color: SECONDARY, lineHeight: 1.35, marginTop: 2, fontFamily: "Courier" },

  swotIntro: { fontSize: 9.5, color: SECONDARY, lineHeight: 1.45, marginBottom: 10 },
  swotGrid: { flexDirection: "row", flexWrap: "wrap", marginTop: 4, border: `0.75 solid ${RULE}` },
  swotCell: { width: "50%", padding: 10, borderRight: `0.75 solid ${RULE}`, borderBottom: `0.75 solid ${RULE}` },
  swotCellNoRight: { borderRightWidth: 0 },
  swotCellNoBottom: { borderBottomWidth: 0 },
  swotHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  swotTitle: { fontSize: 9, letterSpacing: 1, lineHeight: 1.4, fontFamily: "Helvetica-Bold" },
  swotCount: { fontSize: 8, lineHeight: 1.3, color: "#FFFFFF", paddingHorizontal: 5, paddingVertical: 1, borderRadius: 2 },
  swotPoint: { fontSize: 9, lineHeight: 1.4, marginBottom: 4 },
  swotEvidence: { fontSize: 6.5, color: SECONDARY },

  laneLabel: { fontSize: 8, letterSpacing: 1.5, color: SECONDARY, lineHeight: 1.4, marginBottom: 5, marginTop: 4, fontFamily: "Helvetica-Bold" },

  pickCard: { backgroundColor: INK, padding: 14, marginBottom: 8 },
  pickEyebrow: { fontSize: 7.5, letterSpacing: 1.2, color: ORANGE, lineHeight: 1.4, marginBottom: 4, fontFamily: "Helvetica-Bold" },
  pickName: { fontSize: 18, lineHeight: 1.15, color: "#F4F2ED", fontFamily: "Helvetica-Bold" },
  pickTagline: { fontSize: 9, color: "#C3C3B8", lineHeight: 1.4, marginTop: 2, marginBottom: 8 },
  pickReason: { fontSize: 9.5, color: "#E4E2DC", lineHeight: 1.48 },
  pickChips: { fontSize: 7, fontFamily: "Courier", color: "#9A9D96", lineHeight: 1.5, marginTop: 8 },
  pickLink: { fontSize: 8.5, color: ORANGE, lineHeight: 1.4, marginTop: 8, textDecoration: "none" },

  noPick: { fontSize: 9, color: SECONDARY, lineHeight: 1.45, marginBottom: 10, fontStyle: "italic" },

  chartWrap: { marginTop: 4, marginBottom: 6 },
  chartHeadRow: { flexDirection: "row", borderBottom: `1 solid ${INK}`, paddingBottom: 4, marginBottom: 2 },
  chartRow: { flexDirection: "row", alignItems: "center", paddingVertical: 5, borderBottom: `0.5 solid ${RULE}` },
  chartColCode: { width: "16%" },
  chartColName: { width: "34%" },
  chartColCat: { width: "30%" },
  chartColBilling: { width: "20%" },
  chartHeadText: { fontSize: 6.5, letterSpacing: 0.8, color: SECONDARY, fontFamily: "Helvetica-Bold" },
  chartCode: { fontSize: 8, fontFamily: "Courier-Bold", color: ORANGE },
  chartName: { fontSize: 9, lineHeight: 1.3, fontFamily: "Helvetica-Bold" },
  chartCat: { fontSize: 7.5, color: SECONDARY, lineHeight: 1.3 },
  chartBilling: { fontSize: 7.5, color: SECONDARY, lineHeight: 1.3 },
  tierDot: { width: 5, height: 5, borderRadius: 2.5, marginRight: 5 },

  pointerRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 8, marginBottom: 4 },
  pointerLink: { fontSize: 8.5, color: ORANGE, lineHeight: 1.4, marginRight: 14, textDecoration: "none" },

  outcomeBlock: { marginBottom: 12 },
  outcomeLabel: { fontSize: 8, letterSpacing: 1, color: SECONDARY, lineHeight: 1.4, marginBottom: 3, fontFamily: "Helvetica-Bold" },
  outcomeText: { fontSize: 10, lineHeight: 1.5 },
  benefitRow: { flexDirection: "row", marginBottom: 3, paddingLeft: 2 },
  benefitBullet: { fontSize: 9.5, color: ORANGE, marginRight: 6 },
  benefitText: { fontSize: 9.5, lineHeight: 1.4, flex: 1 },
  estimateBox: { border: `0.75 solid ${RULE}`, padding: 10, marginTop: 6 },
  estimateHeadline: { fontSize: 16, fontFamily: "Helvetica-Bold", lineHeight: 1.2 },
  estimateSub: { fontSize: 8.5, color: SECONDARY, lineHeight: 1.4, marginTop: 2, marginBottom: 5 },
  estimateNote: { fontSize: 7.5, color: SECONDARY, lineHeight: 1.4, fontStyle: "italic" },

  note: { fontSize: 8.5, color: SECONDARY, lineHeight: 1.45, marginTop: 8 },
  closing: { marginTop: 18, borderTop: `0.75 solid ${RULE}`, paddingTop: 12 },
  closingTitle: { fontSize: 12, lineHeight: 1.3, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  closingText: { fontSize: 10, lineHeight: 1.45, color: SECONDARY },

  disclaimer: { marginTop: 16, borderTop: `0.75 solid ${RULE}`, paddingTop: 10 },
  disclaimerTitle: { fontSize: 8, letterSpacing: 1, color: SECONDARY, lineHeight: 1.4, marginBottom: 4, fontFamily: "Helvetica-Bold" },
  disclaimerText: { fontSize: 7.5, color: SECONDARY, lineHeight: 1.5 },

  signatureRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginTop: 18, paddingTop: 14, borderTop: `0.75 solid ${RULE}` },
  signatureBlock: { width: "62%" },
  signatureName: { fontSize: 12, fontFamily: "Helvetica-Bold", lineHeight: 1.3 },
  signatureTitle: { fontSize: 9, color: SECONDARY, lineHeight: 1.4, marginTop: 1 },
  signatureDate: { fontSize: 8.5, color: SECONDARY, lineHeight: 1.4, marginTop: 6 },
  qrWrap: { alignItems: "center" },
  qr: { width: 64, height: 64 },
  qrLink: { fontSize: 7, color: SECONDARY, lineHeight: 1.4, marginTop: 3, textDecoration: "none" },

  footer: { position: "absolute", bottom: 28, left: 36, right: 36, flexDirection: "row", justifyContent: "space-between" },
  footerLeft: { fontSize: 8, color: SECONDARY, letterSpacing: 0.5 },
  footerRight: { fontSize: 8, color: SECONDARY },
});

const CONTACT_URL = "https://orgro.ca/contact";
const SITE_BASE = "https://orgro.ca";

const SEV_LABEL: Record<ReportFinding["severity"], { text: string; color: string; bg: string }> = {
  high: { text: "PRIORITY", color: "#FFFFFF", bg: HIGH },
  medium: { text: "MODERATE", color: "#FFFFFF", bg: "#8A5A1E" },
  low: { text: "MINOR", color: INK, bg: "#C3C3B8" },
  info: { text: "INFO", color: INK, bg: "#C3C3B8" },
};

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getUTCDate()).padStart(2, "0")} ${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

const SIZE_LABEL: Record<string, string> = { micro: "1–10 people", small: "11–50 people", medium: "51–200 people", large: "200+ people" };

const SWOT_EXPLAINER =
  "A SWOT is a simple way to look at a business from four angles at once: Strengths and Weaknesses are about the " +
  "business today — what's already working, and what isn't. Opportunities and Threats are about what's ahead — what " +
  "could be gained, and what could go wrong if nothing changes. Every point below is drawn from the findings in this " +
  "report, not a generic template.";

const QUAD_META = {
  STRENGTHS: { color: "#2E5E37" },
  WEAKNESSES: { color: HIGH },
  OPPORTUNITIES: { color: ORANGE },
  THREATS: { color: "#6B1F08" },
} as const;

const BILLING_LABEL: Record<ReportPriority["billing"], string> = { recurring: "Subscription", project: "By engagement" };
const TIER_DOT_COLOR: Record<"recommended" | "worth_exploring", string> = { recommended: ORANGE, worth_exploring: RULE };

function Finding({ f }: { f: ReportFinding }) {
  const sev = SEV_LABEL[f.severity];
  return (
    <View style={s.finding} wrap={false}>
      <View style={s.findingHead}>
        <Text style={[s.badge, { backgroundColor: sev.bg, color: sev.color }]}>{sev.text}</Text>
        {f.tier === "inferred" ? <Text style={[s.badge, { backgroundColor: "#C3C3B8", color: INK }]}>UNCONFIRMED</Text> : null}
      </View>
      <Text style={s.findingText}>{f.fact}</Text>
      {f.raw ? <Text style={s.raw}>{f.raw.slice(0, 220)}</Text> : null}
      <Text style={s.findingMeta}>
        Source: {f.source} · Checked {fmtDate(f.collectedAt)}{f.framework ? ` · ${f.framework}` : ""} · Ref {f.id}
      </Text>
    </View>
  );
}

function SectionBar({ num, title }: { num: number; title: string }) {
  return (
    <View style={s.sectionBar} wrap={false}>
      <Text style={s.sectionNum}>{String(num).padStart(2, "0")}</Text>
      <Text style={s.sectionTitle}>{title}</Text>
    </View>
  );
}

export type SignatureInfo = { name: string; title: string; date?: string };

/** Placeholder pending Mohammad's confirmation of the exact name/title he wants printed on client-facing reports. */
const DEFAULT_SIGNATURE: Omit<SignatureInfo, "date"> = { name: "Mohammad", title: "Founder & CEO, ORAGROL Global" };

export function OdoReportPdf({ report, qrDataUri, signature }: { report: OdoReport; qrDataUri?: string; signature?: SignatureInfo }) {
  const { client, headline, swot, priorities, securityLane, automationLane, outcomeNarrative, websitePointers, coverage } = report;
  const sig = { ...DEFAULT_SIGNATURE, date: fmtDate(report.generatedAt), ...signature };
  const hasFindings = report.findings.some((f) => f.gaps.length > 0);
  const strengthsAll = report.findings.flatMap((f) => f.strengths);

  const footer = () => (
    <View style={s.footer} fixed>
      <Text style={s.footerLeft}>CONFIDENTIAL · {report.reference}</Text>
      <Text style={s.footerRight} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
    </View>
  );

  let sectionNo = 0;

  return (
    <Document title={`ORAGROL Discovery Report — ${client.company}`} author="ORAGROL Global">
      <Page size="A4" style={s.page}>
        {footer()}

        <View style={s.header}>
          <View>
            <Text style={s.wordmark}>ORAGROL</Text>
            <Text style={s.wordmarkSub}>GLOBAL</Text>
          </View>
          <Text style={s.headerTag}>DISCOVERY REPORT{"\n"}{report.reference}</Text>
        </View>

        <Text style={s.heading}>{client.company}</Text>
        <Text style={s.subheading}>Security and operations discovery — what we found, and what it means.</Text>
        <View style={s.topRule} />

        <View style={s.metaRow}>
          <View style={s.metaCol}>
            <Text style={s.fieldLabel}>PREPARED</Text>
            <Text style={s.fieldValue}>{fmtDate(report.generatedAt)}</Text>
          </View>
          {client.website ? (
            <View style={s.metaCol}>
              <Text style={s.fieldLabel}>WEBSITE</Text>
              <Text style={s.fieldValue}>{client.website.replace(/^https?:\/\//, "")}</Text>
            </View>
          ) : null}
          {client.industry ? (
            <View style={s.metaCol}>
              <Text style={s.fieldLabel}>INDUSTRY</Text>
              <Text style={s.fieldValue}>{client.industry}</Text>
            </View>
          ) : null}
          {client.businessSize ? (
            <View style={s.metaCol}>
              <Text style={s.fieldLabel}>TEAM SIZE</Text>
              <Text style={s.fieldValue}>{SIZE_LABEL[client.businessSize] ?? client.businessSize}</Text>
            </View>
          ) : null}
        </View>

        <View style={s.summaryBox}>
          <Text style={s.summaryText}>{report.summary}</Text>
        </View>

        <View style={s.statRow}>
          <View style={s.stat}>
            <Text style={[s.statNum, headline.highSeverity > 0 ? { color: HIGH } : {}]}>{headline.confirmedGaps}</Text>
            <Text style={s.statLabel}>CONFIRMED GAPS</Text>
          </View>
          <View style={s.stat}>
            <Text style={[s.statNum, headline.highSeverity > 0 ? { color: HIGH } : {}]}>{headline.highSeverity}</Text>
            <Text style={s.statLabel}>NEED PRIORITY ATTENTION</Text>
          </View>
          <View style={s.stat}>
            <Text style={s.statNum}>{headline.strengths}</Text>
            <Text style={s.statLabel}>THINGS DONE WELL</Text>
          </View>
          <View style={s.stat}>
            <Text style={s.statNum}>{headline.recommended + headline.worthExploring}</Text>
            <Text style={s.statLabel}>AREAS TO ACT ON</Text>
          </View>
        </View>

        {/* ---- Findings ---- */}
        <SectionBar num={++sectionNo} title="What we found" />
        {hasFindings ? (
          report.findings
            .filter((sec) => sec.gaps.length > 0)
            .map((sec) => (
              <View key={sec.area}>
                <Text style={s.areaTitle}>{sec.label}</Text>
                {sec.gaps.map((f) => <Finding key={f.id} f={f} />)}
              </View>
            ))
        ) : (
          <Text style={s.note}>
            ODO did not confirm any security or operational gaps from public information and your answers. That is a good
            result — it means nothing we could check from the outside is currently exposed.
          </Text>
        )}

        {strengthsAll.length > 0 ? (
          <View>
            <Text style={s.areaTitle}>Already in good shape</Text>
            {strengthsAll.slice(0, 8).map((f) => (
              <View key={f.id} style={s.finding} wrap={false}>
                <Text style={s.findingText}>{f.fact}</Text>
                <Text style={s.findingMeta}>Source: {f.source} · Checked {fmtDate(f.collectedAt)} · Ref {f.id}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* ---- SWOT ---- */}
        <SectionBar num={++sectionNo} title="SWOT — where the business stands" />
        <Text style={s.swotIntro}>{SWOT_EXPLAINER}</Text>
        <View style={s.swotGrid} wrap={false}>
          {([["STRENGTHS", swot.strengths], ["WEAKNESSES", swot.weaknesses], ["OPPORTUNITIES", swot.opportunities], ["THREATS", swot.threats]] as const).map(([title, points], i) => (
            <View key={title} style={[s.swotCell, i % 2 === 1 ? s.swotCellNoRight : {}, i >= 2 ? s.swotCellNoBottom : {}]}>
              <View style={s.swotHead}>
                <Text style={[s.swotTitle, { color: QUAD_META[title].color }]}>{title}</Text>
                <Text style={[s.swotCount, { backgroundColor: QUAD_META[title].color }]}>{points.length}</Text>
              </View>
              {points.length ? points.map((p, j) => (
                <Text key={j} style={s.swotPoint}>• {p.text} <Text style={s.swotEvidence}>[{p.evidence.join(", ")}]</Text></Text>
              )) : <Text style={[s.swotPoint, { color: SECONDARY }]}>Nothing significant identified.</Text>}
            </View>
          ))}
        </View>

        {/* ---- Recommendation ---- */}
        <SectionBar num={++sectionNo} title="What we recommend" />
        {priorities.recommended.length === 0 && priorities.worthExploring.length === 0 ? (
          <Text style={s.note}>
            Nothing reached the level where we would recommend a specific service. We would rather tell you that than
            invent work. If something changes — new systems, new staff, a client asking security questions — a fresh scan
            is worth running.
          </Text>
        ) : (
          <>
            {securityLane.recommendation.kind !== "none" ? (
              <View wrap={false}>
                <Text style={s.laneLabel}>SECURITY</Text>
                {securityLane.recommendation.kind === "package" || securityLane.recommendation.kind === "foundation_default" ? (
                  <View style={s.pickCard}>
                    <Text style={s.pickEyebrow}>{securityLane.recommendation.kind === "foundation_default" ? "RECOMMENDED STARTING POINT" : "RECOMMENDED PACKAGE"}</Text>
                    <Text style={s.pickName}>{securityLane.recommendation.pkg.name}</Text>
                    <Text style={s.pickTagline}>{securityLane.recommendation.pkg.itemCount} cybersecurity services included</Text>
                    <Text style={s.pickReason}>{securityLane.recommendation.reason}</Text>
                    <Text style={s.pickChips}>Addresses: {securityLane.recommendation.matchedCodes.join(" · ")}</Text>
                    <Link src={`${SITE_BASE}/services`} style={s.pickLink}>See what&apos;s included → orgro.ca/services</Link>
                  </View>
                ) : null}
              </View>
            ) : null}

            {securityLane.individualOffers.length > 0 ? (
              <View style={s.chartWrap} wrap={false}>
                <View style={s.chartHeadRow}>
                  <Text style={[s.chartHeadText, s.chartColCode]}>CODE</Text>
                  <Text style={[s.chartHeadText, s.chartColName]}>ITEM</Text>
                  <Text style={[s.chartHeadText, s.chartColCat]}>CATEGORY</Text>
                  <Text style={[s.chartHeadText, s.chartColBilling]}>BILLING</Text>
                </View>
                {securityLane.individualOffers.map((o) => (
                  <View key={o.code} style={s.chartRow} wrap={false}>
                    <View style={[s.chartColCode, { flexDirection: "row", alignItems: "center" }]}>
                      <View style={[s.tierDot, { backgroundColor: TIER_DOT_COLOR[o.tier] }]} />
                      <Text style={s.chartCode}>{o.code}</Text>
                    </View>
                    <Text style={[s.chartColName, s.chartName]}>{o.simpleName}</Text>
                    <Text style={[s.chartColCat, s.chartCat]}>{o.category}</Text>
                    <Text style={[s.chartColBilling, s.chartBilling]}>{BILLING_LABEL[o.billing]}</Text>
                  </View>
                ))}
                <Text style={s.note}>Sold individually, never inside a package — search the code or name on orgro.ca/services for what it includes and its fee. Orange dot = recommended, grey = worth exploring.</Text>
              </View>
            ) : null}

            {automationLane.recommendation.kind !== "none" ? (
              <View wrap={false}>
                <Text style={s.laneLabel}>AUTOMATION</Text>
                <View style={s.pickCard}>
                  {automationLane.recommendation.kind === "or_one" ? (
                    <>
                      <Text style={s.pickEyebrow}>RECOMMENDED</Text>
                      <Text style={s.pickName}>OR ONE</Text>
                      <Text style={s.pickTagline}>Custom-built automation, scoped and priced to your business</Text>
                      <Text style={s.pickReason}>{automationLane.recommendation.reason}</Text>
                      <Link src={`${SITE_BASE}/or-one`} style={s.pickLink}>Learn more → orgro.ca/or-one</Link>
                    </>
                  ) : automationLane.recommendation.kind === "bundle" ? (
                    <>
                      <Text style={s.pickEyebrow}>RECOMMENDED BUNDLE</Text>
                      <Text style={s.pickName}>{automationLane.recommendation.bundle.name}</Text>
                      <Text style={s.pickTagline}>{automationLane.recommendation.bundle.tagline}</Text>
                      <Text style={s.pickReason}>{automationLane.recommendation.reason}</Text>
                      <Text style={s.pickChips}>Addresses: {automationLane.recommendation.matchedCodes.join(" · ")}</Text>
                      <Link src={`${SITE_BASE}/business-automation`} style={s.pickLink}>See what&apos;s included → orgro.ca/business-automation</Link>
                    </>
                  ) : (
                    <>
                      <Text style={s.pickEyebrow}>WORTH A CONVERSATION</Text>
                      <Text style={s.pickName}>Tailored Automation</Text>
                      <Text style={s.pickTagline}>Scoped to your exact requirement — priced after a short scoping conversation</Text>
                      <Text style={s.pickReason}>{automationLane.recommendation.reason}</Text>
                      <Link src={`${SITE_BASE}/contact`} style={s.pickLink}>Start a scoping conversation → orgro.ca/contact</Link>
                    </>
                  )}
                </View>
              </View>
            ) : null}

            <View style={s.pointerRow}>
              {websitePointers.map((wp) => (
                <Link key={wp.path} src={`${SITE_BASE}${wp.path}`} style={s.pointerLink}>orgro.ca{wp.path} — {wp.label}</Link>
              ))}
            </View>
          </>
        )}

        {/* ---- What this means for you ---- */}
        <SectionBar num={++sectionNo} title="What this means for you" />
        <View style={s.outcomeBlock}>
          <Text style={s.outcomeLabel}>YOUR SITUATION TODAY</Text>
          <Text style={s.outcomeText}>{outcomeNarrative.situationNow}</Text>
        </View>
        <View style={s.outcomeBlock}>
          <Text style={s.outcomeLabel}>WHAT YOU CAN ACHIEVE ON SECURITY</Text>
          <Text style={s.outcomeText}>{outcomeNarrative.securityOutlook}</Text>
        </View>
        {outcomeNarrative.automationOpportunity ? (
          <View style={s.outcomeBlock} wrap={false}>
            <Text style={s.outcomeLabel}>WHAT COULD BE AUTOMATED</Text>
            <Text style={s.outcomeText}>{outcomeNarrative.automationOpportunity}</Text>
            {outcomeNarrative.automationBenefits.length ? (
              <View style={{ marginTop: 8 }}>
                {outcomeNarrative.automationBenefits.map((b, i) => (
                  <View key={i} style={s.benefitRow}>
                    <Text style={s.benefitBullet}>—</Text>
                    <Text style={s.benefitText}>{b}</Text>
                  </View>
                ))}
              </View>
            ) : null}
            {outcomeNarrative.automationEstimate ? (
              <View style={s.estimateBox}>
                <Text style={s.estimateHeadline}>
                  ${outcomeNarrative.automationEstimate.monthlySavingsLow.toLocaleString()}–${outcomeNarrative.automationEstimate.monthlySavingsHigh.toLocaleString()}/mo
                </Text>
                <Text style={s.estimateSub}>Illustrative potential savings — equivalent to {outcomeNarrative.automationEstimate.fteRangeLabel} of manual work absorbed by automation.</Text>
                <Text style={s.estimateNote}>{outcomeNarrative.automationEstimate.assumptionNote}</Text>
              </View>
            ) : null}
          </View>
        ) : null}

        {/* ---- How to read this ---- */}
        <SectionBar num={++sectionNo} title="How to read this report" />
        <Text style={s.note}>
          Everything here comes from information that is already public, plus the answers you gave us. Findings marked
          UNCONFIRMED are reasonable conclusions, not verified facts — worth checking, not acting on blindly. Nothing was
          tested by trying to break in: ODO looks, it does not touch. {coverage.note}
          {coverage.notDetermined.length ? ` Checks we could not complete: ${coverage.notDetermined.join(", ")}.` : ""}
        </Text>
        {report.attributions.length ? <Text style={s.note}>{report.attributions.join(" ")}</Text> : null}

        <View style={s.closing}>
          <Text style={s.closingTitle}>Questions about any of this?</Text>
          <Text style={s.closingText}>
            Every report is reviewed by an ORAGROL specialist before it reaches you — if something here does not match
            what you know about your business, tell us and we will correct it. Reply to the email this came with, or
            contact us at info@orgro.ca.
          </Text>
        </View>

        <View style={s.disclaimer} wrap={false}>
          <Text style={s.disclaimerTitle}>ABOUT THIS REPORT</Text>
          <Text style={s.disclaimerText}>
            The research and findings in this report were collected and drafted by ORAGROL&apos;s automated discovery
            system (ODO), using information that is publicly available plus the answers you provided, and this report
            was reviewed by an ORAGROL team member before being released to you. It is provided as an informational
            courtesy to support your organization&apos;s security and operational planning, and does not constitute a
            security audit, penetration test, compliance certification, legal opinion, or professional advice of any
            kind, and no client relationship or warranty is created by receiving it. ORAGROL Global makes no
            representation that this report is complete or free of error, and accepts no liability for actions taken or
            not taken on the basis of its contents. If you would like a specific finding verified, scoped, or acted on,
            please contact us and we will be glad to help.
          </Text>
        </View>

        <View style={s.signatureRow} wrap={false}>
          <View style={s.signatureBlock}>
            <Text style={s.signatureName}>{sig.name}</Text>
            <Text style={s.signatureTitle}>{sig.title}</Text>
            <Text style={s.signatureDate}>Reviewed {sig.date}</Text>
          </View>
          {qrDataUri ? (
            <View style={s.qrWrap}>
              <Image src={qrDataUri} style={s.qr} />
              <Link src={CONTACT_URL} style={s.qrLink}>orgro.ca/contact</Link>
            </View>
          ) : null}
        </View>
      </Page>
    </Document>
  );
}
