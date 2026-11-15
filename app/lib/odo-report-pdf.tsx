import React from "react";
import { Document, Page, Text, View, StyleSheet, Image, Link } from "@react-pdf/renderer";
import { type OdoReport, type ReportFinding, type ReportPriority } from "./odo-report";
import { PdfLogo, PdfIconWatermark } from "./pdf-brand";
import { registerPdfFonts } from "./pdf-fonts";

/**
 * ODO discovery report — client-facing PDF.
 *
 * REBUILT 2026-10-19 to the approved ODO mockup (dashboard PDF style):
 *   - US Letter, white paper, graphite ink, teal section numbers.
 *   - Running header on every page: approved logo left, "Confidential" +
 *     report name, date and reference right.
 *   - Icon-only background watermark (approved mark, no wordmark).
 *   - Structure: 01 Summary · 02 How you compare locally · 03 Inside this
 *     report · 04 What we found · 05 SWOT · 06 What we recommend · 07 What
 *     this means for you · Appendix A–D (how to read, 90-day re-check,
 *     questions, about) with the QR contact block on the last page.
 *   - Every content field is kept. Nothing from report.internal is read.
 *   - No $ / savings figure anywhere in the report (go-ahead rule, kept).
 *   - Footer shows "Page X of Y" on every page.
 *
 * The optional coverImageUri / closingImageUri props are still accepted so
 * the three callers (report/route.ts, odo-email.ts, odo-hubspot-report.ts)
 * do not change, but the approved layout no longer uses photos.
 *
 * Inter is embedded (subset, see pdf-fonts.ts), as in the approved mockup.
 * Layout re-matched to Mohammad's saved ODO mockup on 2026-11-15.
 *
 * Two hard-won rules from scope-pdf.tsx are respected: no `lineHeight` on
 * `page` itself, and no `lineHeight` on the fixed footer's own leaf Text
 * styles — both made the footer vanish from the rendered PDF.
 */

const CONTACT_URL = "https://orgro.ca/contact";
const SITE_BASE = "https://orgro.ca";

// Palette from the dashboard PDF mockup (pdf.css).
const INK = "#141719";
const GREY = "#5B6770";
const RULE = "#D5D8DA";
const TEAL = "#00758F";
const NOTE_BG = "#F4F2ED";
const BODY = "#2a3236";
const ORANGE = "#EF4D00";
const WATERMARK = "#F1F2F2";
const WATERMARK_DOT = "#FEF6F3";

registerPdfFonts();
const SEMI = { fontFamily: "Inter", fontWeight: 600 } as const;
const BOLD = { fontFamily: "Inter", fontWeight: 700 } as const;

const TAG = {
  pri: { bg: "#FBE3D6", fg: "#9A3412" },
  mod: { bg: "#FDF1D3", fg: "#7A5300" },
  min: { bg: "#E6EEF0", fg: "#2F4A50" },
  pos: { bg: "#DCEFEA", fg: "#154b48" },
};

const s = StyleSheet.create({
  // Letter page; header and footer are absolute, so the body reserves space for them with paddingTop/paddingBottom.
  page: { fontFamily: "Inter", fontSize: 8.2, color: INK, backgroundColor: "#FFFFFF", paddingTop: 104, paddingBottom: 80, paddingHorizontal: 42 },
  header: { position: "absolute", top: 25.5, left: 42, right: 42, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", borderBottomWidth: 1, borderBottomColor: INK, paddingBottom: 8.5 },
  meta: { textAlign: "right", fontSize: 7.3, color: GREY, letterSpacing: 0.55, lineHeight: 1.85, paddingTop: 3 },
  metaStrong: { color: INK, ...SEMI, fontSize: 7.4, letterSpacing: 0.5 },
  footer: { position: "absolute", bottom: 26, left: 42, right: 42, borderTopWidth: 1, borderTopColor: INK, paddingTop: 7, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  footerText: { width: "93%", fontSize: 6.0, color: GREY, lineHeight: 1.5 },
  footerStrong: { color: INK, ...BOLD },
  footerPage: { fontSize: 7.2, color: INK },
  h1: { fontSize: 18, ...BOLD, letterSpacing: -0.3, marginTop: 13, marginBottom: 5 },
  sub: { fontSize: 9.75, color: GREY, marginBottom: 10 },
  h2: { flexDirection: "row", alignItems: "baseline", marginTop: 12, marginBottom: 5 },
  h2Num: { fontSize: 8.25, color: TEAL, ...BOLD, marginRight: 8 },
  h2Title: { fontSize: 10, ...BOLD },
  h3: { fontSize: 9.4, ...BOLD, marginTop: 4, marginBottom: 3 },
  p: { fontSize: 8.2, color: BODY, marginBottom: 6, lineHeight: 1.4 },
  lead: { fontSize: 9, color: INK, marginTop: 2, marginBottom: 6, lineHeight: 1.4 },
  small: { fontSize: 6.8, color: GREY, marginBottom: 4, lineHeight: 1.4 },
  label: { fontSize: 6.5, letterSpacing: 1, color: GREY, marginBottom: 2 },
  cl4: { flexDirection: "row", borderWidth: 1, borderColor: RULE, borderRadius: 3, marginBottom: 10 },
  cl4Cell: { flex: 1, paddingVertical: 7, paddingHorizontal: 9, borderRightWidth: 1, borderRightColor: RULE },
  cl4Value: { fontSize: 9, ...SEMI },
  kRow: { flexDirection: "row", borderTopWidth: 1, borderTopColor: INK, borderBottomWidth: 1, borderBottomColor: RULE, marginTop: 4, marginBottom: 8 },
  kCell: { flex: 1, paddingVertical: 6, paddingRight: 4 },
  kNum: { fontSize: 15.7, color: TEAL, ...BOLD, marginTop: 0, marginBottom: 5 },
  kSmall: { fontSize: 7.5, color: GREY },
  note: { marginTop: 1, borderLeftWidth: 3, borderLeftColor: TEAL, backgroundColor: NOTE_BG, paddingVertical: 8, paddingHorizontal: 11, fontSize: 7.9, color: BODY, lineHeight: 1.45 },
  noteLabel: { ...BOLD, color: INK },
  legendRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 4, marginTop: 2 },
  chip: { fontSize: 6.2, ...BOLD, paddingVertical: 2.5, paddingHorizontal: 5, borderRadius: 2, marginRight: 5, marginBottom: 3, letterSpacing: 0.8 },
  toc: { flexDirection: "row", flexWrap: "wrap", marginTop: 3 },
  tocItem: { width: "50%", borderBottomWidth: 1, borderBottomColor: "#E3E6E8", paddingVertical: 3.5, paddingRight: 12, flexDirection: "row", fontSize: 7.9 },
  tocNum: { color: TEAL, ...BOLD, width: 19 },
  // Tables
  table: { marginBottom: 6 },
  thRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: INK, paddingBottom: 6, paddingTop: 4 },
  th: { fontSize: 6.3, letterSpacing: 1.1, color: GREY, ...SEMI, paddingRight: 8 },
  tr: { flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#E3E6E8", paddingVertical: 3.2 },
  tdArea: { width: "24%", paddingRight: 8 },
  tdFinding: { width: "44%", paddingRight: 10 },
  tdProof: { width: "32%" },
  tdBody: { fontSize: 7.9, color: BODY, lineHeight: 1.4 },
  tdProofLine: { fontSize: 6.9, color: GREY, marginBottom: 1.5, lineHeight: 1.35 },
  tdRaw: { fontFamily: "Courier", fontSize: 6.0, color: GREY, marginTop: 2, lineHeight: 1.5 },
  tag: { fontSize: 6.2, letterSpacing: 0.8, ...BOLD, paddingVertical: 2, paddingHorizontal: 5, borderRadius: 2, marginRight: 3, marginTop: 3, alignSelf: "flex-start" },
  visitorAnswer: { fontSize: 7, color: GREY, marginTop: 3, lineHeight: 1.35 },
  // SWOT
  swotGrid: { flexDirection: "row", flexWrap: "wrap", borderTopWidth: 1, borderTopColor: INK, marginTop: 4 },
  swotCell: { width: "50%", borderBottomWidth: 1, borderBottomColor: RULE, paddingVertical: 8, paddingRight: 10 },
  swotCellRight: { width: "50%", borderBottomWidth: 1, borderBottomColor: RULE, borderLeftWidth: 1, borderLeftColor: RULE, paddingVertical: 8, paddingLeft: 10, paddingRight: 10 },
  swotHead: { flexDirection: "row", justifyContent: "space-between", marginBottom: 5 },
  swotTitle: { fontSize: 6.8, letterSpacing: 1.1, color: TEAL, ...BOLD },
  swotPoint: { fontSize: 8.2, color: INK, marginBottom: 0.5, lineHeight: 1.5, paddingLeft: 0 },
  // Recommendation cards
  recCard: { borderWidth: 1, borderColor: RULE, borderLeftWidth: 3, borderLeftColor: TEAL, backgroundColor: NOTE_BG, padding: 10, marginBottom: 8 },
  recCardAlt: { borderLeftColor: INK },
  recLabel: { fontSize: 6.3, letterSpacing: 0.9, color: TEAL, ...BOLD, marginBottom: 3 },
  recName: { fontSize: 10.2, ...BOLD, marginBottom: 3 },
  recSub: { fontSize: 7.3, color: GREY, marginBottom: 3, lineHeight: 1.35 },
  recReason: { fontSize: 7.8, color: BODY, marginBottom: 4, lineHeight: 1.4 },
  recLink: { fontSize: 7.5, color: TEAL, ...SEMI },
  offerRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#E3E6E8", paddingVertical: 5 },
  offerName: { width: "62%", fontSize: 8, ...SEMI },
  offerMeta: { width: "38%", fontSize: 6.9, color: GREY, lineHeight: 1.35 },
  dotRow: { flexDirection: "row", alignItems: "center", marginRight: 10 },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 4 },
  siteLink: { fontSize: 7.5, color: BODY, marginBottom: 3 },
  // What this means for you (topic / our view table) and decisions
  viewRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#E3E6E8", paddingVertical: 4.5, alignItems: "center" },
  viewTopic: { width: "34%", fontSize: 8.2, color: INK, paddingRight: 8 },
  viewTextPlain: { fontSize: 8.2, color: INK, lineHeight: 1.4 },
  viewText: { flex: 1, fontSize: 8.2, color: INK, lineHeight: 1.4 },
  benefit: { flexDirection: "row", marginTop: 3 },
  benefitDash: { width: 12, color: TEAL, ...BOLD },
  benefitText: { flex: 1, fontSize: 7.9, color: BODY, lineHeight: 1.4 },
  decisionRow: { flexDirection: "row", marginTop: 6, borderTopWidth: 1, borderTopColor: INK },
  decision: { flex: 1, paddingTop: 7, paddingBottom: 8, paddingRight: 10, paddingLeft: 10, borderLeftWidth: 1, borderLeftColor: RULE },
  decisionTitle: { fontSize: 6.5, letterSpacing: 1.1, color: TEAL, ...BOLD, marginBottom: 5 },
  decisionText: { fontSize: 8.2, color: INK, lineHeight: 1.5 },
  // Appendix and contact
  disclaimer: { fontSize: 6.9, color: GREY, lineHeight: 1.5, marginTop: 4 },
  qrBox: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: RULE, borderRadius: 3, paddingVertical: 14, paddingHorizontal: 14, marginTop: 14 },
  qr: { width: 66, height: 66, marginRight: 18 },
  qrTitle: { fontSize: 9, ...BOLD, marginBottom: 5 },
  qrText: { fontSize: 7.9, color: GREY, lineHeight: 1.4 },
  reviewHead: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: INK, marginTop: 10, paddingBottom: 6 },
  reviewRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#E3E6E8", paddingVertical: 6 },
  reviewCell: { fontSize: 8.2, color: INK },
});

const SIZE_LABEL: Record<string, string> = { micro: "1–10 people", small: "11–50 people", medium: "51–200 people", large: "200+ people" };
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getUTCDate()).padStart(2, "0")} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

// Shortened 2026-10-03 (§37 report redesign: "shorter overall") — one line,
// and at most 3 points per quadrant; every point still cites its [Ref].
const SWOT_SHORT =
  "Today (strengths, weaknesses) and what's ahead (opportunities, threats) — every point is drawn from a finding above, cited by its reference.";

const BILLING_LABEL: Record<ReportPriority["billing"], string> = { recurring: "Subscription", project: "By engagement" };
const TIER_DOT_COLOR: Record<"recommended" | "worth_exploring", string> = { recommended: ORANGE, worth_exploring: "#6b7470" };

/** Severity tag styling: high = Priority, medium = Moderate, low/info = Minor (unchanged mapping). */
const SEV_TAG: Record<ReportFinding["severity"], { text: string; bg: string; fg: string }> = {
  high: { text: "PRIORITY", bg: TAG.pri.bg, fg: TAG.pri.fg },
  medium: { text: "MODERATE", bg: TAG.mod.bg, fg: TAG.mod.fg },
  low: { text: "MINOR", bg: TAG.min.bg, fg: TAG.min.fg },
  info: { text: "MINOR", bg: TAG.min.bg, fg: TAG.min.fg },
};

/** Pulls the visitor's own words out of a "Q: id → "answer"" or free-text raw string — only ever called for source === "Visitor answer"(*) evidence (odo-ledger.ts). Returns null (never fabricates a quote) if the shape doesn't match. */
function visitorQuote(f: ReportFinding): string | null {
  if (!f.source.startsWith("Visitor answer") || !f.raw) return null;
  const m = /→\s*"([\s\S]*)"\s*$/.exec(f.raw);
  if (m) return m[1];
  return f.raw.length <= 300 ? f.raw : null;
}

function H2({ num, title, top }: { num: string; title: string; top?: number }) {
  return (
    <View style={top === undefined ? s.h2 : [s.h2, { marginTop: top }]} minPresenceAhead={60}>
      <Text style={s.h2Num}>{num}</Text>
      <Text style={s.h2Title}>{title}</Text>
    </View>
  );
}

function FindingRow({ f, areaLabel, index }: { f: ReportFinding; areaLabel: string; index: number }) {
  const sev = SEV_TAG[f.severity];
  const quote = visitorQuote(f);
  return (
    <View style={s.tr} wrap={false}>
      <View style={s.tdArea}>
        <Text style={[s.tdBody, { ...SEMI, color: INK }]}>{String(index + 1).padStart(2, "0")} {areaLabel}</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          <Text style={[s.tag, { backgroundColor: sev.bg, color: sev.fg }]}>{sev.text}</Text>
          {f.tier === "inferred" ? <Text style={[s.tag, { borderWidth: 0.75, borderColor: "#4d5c5e", color: "#213235" }]}>UNCONFIRMED</Text> : null}
        </View>
      </View>
      <View style={s.tdFinding}>
        <Text style={s.tdBody}>{f.fact}</Text>
        {quote ? <Text style={s.visitorAnswer}><Text style={{ ...SEMI }}>Your answer: </Text>&quot;{quote}&quot;</Text> : null}
      </View>
      <View style={s.tdProof}>
        <Text style={s.tdProofLine}><Text style={{ ...SEMI, color: INK }}>Source: </Text>{f.source}</Text>
        <Text style={s.tdProofLine}><Text style={{ ...SEMI, color: INK }}>Checked </Text>{fmtDate(f.collectedAt)}</Text>
        <Text style={s.tdProofLine}><Text style={{ ...SEMI, color: INK }}>Ref </Text>{f.id}{f.framework ? ` · ${f.framework}` : ""}</Text>
        {!quote && f.raw ? <Text style={s.tdRaw}>{f.raw.length > 160 ? `${f.raw.slice(0, 157)}…` : f.raw}</Text> : null}
      </View>
    </View>
  );
}

export function OdoReportPdf({
  report,
  qrDataUri,
}: {
  report: OdoReport;
  qrDataUri?: string;
  /** Accepted for caller compatibility; the approved layout uses no photos. */
  coverImageUri?: string;
  /** Accepted for caller compatibility; the approved layout uses no photos. */
  closingImageUri?: string;
}) {
  const { client, headline, swot, priorities, securityLane, automationLane, outcomeNarrative, websitePointers, coverage } = report;
  const reviewDate = fmtDate(report.generatedAt);
  const allGapFindings = report.findings.flatMap((sec) => sec.gaps.map((f) => ({ ...f, areaLabel: sec.label })));
  const strengthsAll = report.findings.flatMap((f) => f.strengths);
  const hasFindings = allGapFindings.length > 0;
  const hasRecommendations = priorities.recommended.length > 0 || priorities.worthExploring.length > 0;
  const recheckFrom = report.recheckFrom ?? new Date(Date.parse(report.generatedAt) + 90 * 86400000).toISOString();
  const websiteHost = client.website ? client.website.replace(/^https?:\/\//, "") : "—";

  // Section numbers follow the mockup: 01–07 in the body, A–D in the appendix.
  let num = 0;
  const nextNum = () => String(++num).padStart(2, "0");

  return (
    <Document title={`ORAGROL Discovery Report — ${client.company}`} author="ORAGROL Global">
      <Page size="LETTER" style={s.page}>
        {/* Background icon watermark (approved mark, icon only). */}
        <View fixed style={{ position: "absolute", left: 145, top: 258, width: 322, height: 322 }}>
          <PdfIconWatermark size={322} color={WATERMARK} dotColor={WATERMARK_DOT} />
        </View>

        <View style={s.header} fixed>
          <PdfLogo width={37.5} />
          <View style={s.meta}>
            <Text style={s.metaStrong}>CONFIDENTIAL</Text>
            <Text style={s.metaStrong}>ODO DISCOVERY REPORT</Text>
            <Text>{reviewDate.toUpperCase()}</Text>
            <Text>REF {report.reference.toUpperCase()}</Text>
          </View>
        </View>

        <View style={s.footer} fixed>
          <Text style={s.footerText}>
            <Text style={s.footerStrong}>Confidential to the intended recipient.</Text> A discovery review based on public information and the answers you gave — not a penetration test and not a compliance audit.{"\n"}
            Report ref {report.reference} · Prepared {reviewDate} · America/Toronto · <Text style={s.footerStrong}>Reviewed by the ORAGROL team</Text>{"\n"}
            Prepared for {client.company} · Questions: info@orgro.ca
          </Text>
          <Text style={s.footerPage} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>

        {/* ---- Title and summary ---- */}
        <Text style={s.h1}>ODO Discovery Report</Text>
        <Text style={s.sub}>Here&apos;s what&apos;s exposed. Here&apos;s what to fix first.</Text>

        <View style={s.cl4}>
          <View style={s.cl4Cell}><Text style={s.label}>PREPARED FOR</Text><Text style={s.cl4Value}>{client.company}</Text></View>
          <View style={s.cl4Cell}><Text style={s.label}>WEBSITE</Text><Text style={s.cl4Value}>{websiteHost}</Text></View>
          <View style={s.cl4Cell}><Text style={s.label}>INDUSTRY</Text><Text style={s.cl4Value}>{client.industry ?? "—"}</Text></View>
          <View style={[s.cl4Cell, { borderRightWidth: 0 }]}><Text style={s.label}>TEAM SIZE</Text><Text style={s.cl4Value}>{client.businessSize ? (SIZE_LABEL[client.businessSize] ?? client.businessSize) : "—"}</Text></View>
        </View>

        <H2 num={nextNum()} title="Summary" top={0} />
        <Text style={s.lead}>{report.summary}</Text>
        <View style={s.kRow}>
          <View style={s.kCell}><Text style={s.label}>CONFIRMED GAPS</Text><Text style={s.kNum}>{headline.confirmedGaps}</Text><Text style={s.kSmall}>Found and confirmed</Text></View>
          <View style={s.kCell}><Text style={s.label}>NEED PRIORITY ATTENTION</Text><Text style={s.kNum}>{headline.highSeverity}</Text><Text style={s.kSmall}>Fix first</Text></View>
          <View style={s.kCell}><Text style={s.label}>THINGS DONE WELL</Text><Text style={s.kNum}>{headline.strengths}</Text><Text style={s.kSmall}>Keep in place</Text></View>
          <View style={[s.kCell, { paddingRight: 0 }]}><Text style={s.label}>AREAS TO ACT ON</Text><Text style={s.kNum}>{headline.recommended + headline.worthExploring}</Text><Text style={s.kSmall}>Recommended and worth exploring</Text></View>
        </View>

        {report.quickWin ? (
          <View style={s.note} wrap={false}>
            <Text><Text style={s.noteLabel}>The quick win we shared during your scan.</Text> {report.quickWin}</Text>
          </View>
        ) : null}

        {report.benchmark ? (
          <>
            <H2 num={nextNum()} title="How you compare locally" top={8} />
            <Text style={s.p}>{report.benchmark.line}</Text>
            <Text style={s.small}>Source: public DNS records, checked {fmtDate(report.benchmark.checkedAt)}. Counts only — no business is named or ranked.</Text>
          </>
        ) : null}

        <H2 num={nextNum()} title="Inside this report" top={8} />
        <View style={s.toc}>
          {[
            ["04", "What we found, with the proof"],
            ["05", "SWOT — where the business stands"],
            ["06", "What we recommend"],
            ["07", "What this means for you"],
            ["A", "How to read this report"],
            ["B", "Free re-check in 90 days"],
            ["C", "Questions and corrections"],
            ["D", "About this report"],
          ].map(([n, t]) => (
            <Text key={n} style={s.tocItem}><Text style={s.tocNum}>{n}  </Text>{t}</Text>
          ))}
        </View>

        {/* ---- 04 What we found ---- */}
        <View break>
          <H2 num={nextNum()} title="What we found" />
          <Text style={s.p}>Each line pairs the observation with the answer or public source behind it. Priority color shows what deserves attention first; unconfirmed means the observation needs validation.</Text>
          <View style={s.legendRow}>
            <Text style={[s.chip, { backgroundColor: TAG.pri.bg, color: TAG.pri.fg }]}>PRIORITY</Text>
            <Text style={[s.chip, { backgroundColor: TAG.mod.bg, color: TAG.mod.fg }]}>MODERATE</Text>
            <Text style={[s.chip, { backgroundColor: TAG.min.bg, color: TAG.min.fg }]}>MINOR</Text>
            <Text style={[s.chip, { borderWidth: 0.75, borderColor: "#4d5c5e", color: "#213235" }]}>UNCONFIRMED</Text>
          </View>

          {strengthsAll.length > 0 ? (
            <>
              <Text style={s.h3}>Already in good shape</Text>
              <View style={s.table}>
                <View style={s.thRow}>
                  <Text style={[s.th, { width: "12%" }]}>REF</Text>
                  <Text style={[s.th, { width: "70%" }]}>FINDING</Text>
                  <Text style={[s.th, { width: "18%", paddingRight: 0 }]}>STATUS</Text>
                </View>
                {strengthsAll.slice(0, 6).map((f, i) => (
                  <View key={f.id} style={s.tr} wrap={false}>
                    <Text style={[s.tdBody, { width: "12%", color: INK }]}>+{String(i + 1).padStart(2, "0")}</Text>
                    <Text style={[s.tdBody, { width: "70%", color: INK }]}>{f.fact}</Text>
                    <View style={{ width: "18%" }}><Text style={[s.tag, { backgroundColor: TAG.pos.bg, color: TAG.pos.fg, marginTop: 0 }]}>POSITIVE</Text></View>
                  </View>
                ))}
              </View>
            </>
          ) : null}

          <Text style={s.h3}>What needs attention</Text>
          {hasFindings ? (
            <View style={s.table}>
              <View style={s.thRow}>
                <Text style={[s.th, { width: "24%" }]}>CATEGORY &amp; PRIORITY</Text>
                <Text style={[s.th, { width: "44%" }]}>FINDING &amp; EXPLANATION</Text>
                <Text style={[s.th, { width: "32%", paddingRight: 0 }]}>SOURCE &amp; CHECKING DETAILS</Text>
              </View>
              {allGapFindings.map((f, i) => (
                <FindingRow key={f.id} f={f} areaLabel={f.areaLabel} index={i} />
              ))}
            </View>
          ) : (
            <Text style={s.p}>
              ODO did not confirm any security or operational gaps from public information and your answers. That is a good
              result — it means nothing we could check from the outside is currently exposed.
            </Text>
          )}
        </View>

        {/* ---- 05 SWOT ---- */}
        <View>
          <H2 num={nextNum()} title="SWOT — where the business stands" top={6} />
          <Text style={s.p}>{SWOT_SHORT}</Text>
          <View style={s.swotGrid}>
            {([
              ["STRENGTHS", swot.strengths, false],
              ["WEAKNESSES", swot.weaknesses, true],
              ["OPPORTUNITIES", swot.opportunities, false],
              ["THREATS", swot.threats, true],
            ] as const).map(([title, points, right]) => (
              <View key={title} style={right ? s.swotCellRight : s.swotCell} wrap={false}>
                <View style={s.swotHead}><Text style={s.swotTitle}>{title}</Text><Text style={s.swotTitle}>{Math.min(points.length, 3)}</Text></View>
                {points.length ? points.slice(0, 3).map((p, j) => (
                  <Text key={j} style={s.swotPoint}>•  {p.text} [{p.evidence.join(", ")}]</Text>
                )) : <Text style={[s.swotPoint, { color: GREY }]}>Nothing significant identified.</Text>}
              </View>
            ))}
          </View>
        </View>

        {/* ---- 06 What we recommend ---- */}
        <View break>
          <H2 num={nextNum()} title="What we recommend" />
          {!hasRecommendations ? (
            <Text style={s.p}>
              Nothing reached the level where we would recommend a specific service. We would rather tell you that than
              invent work. If something changes — new systems, new staff, a client asking security questions — a fresh scan
              is worth running.
            </Text>
          ) : (
            <>
              {securityLane.recommendation.kind === "package" || securityLane.recommendation.kind === "foundation_default" ? (
                <View style={s.recCard} wrap={false}>
                  <Text style={s.recLabel}>SECURITY / {securityLane.recommendation.kind === "foundation_default" ? "RECOMMENDED STARTING POINT" : "RECOMMENDED PACKAGE"}</Text>
                  <Text style={s.recName}>{securityLane.recommendation.pkg.name}</Text>
                  <Text style={s.recSub}>{securityLane.recommendation.pkg.itemCount} cybersecurity services included</Text>
                  <Text style={s.recReason}>{securityLane.recommendation.reason}</Text>
                  <Text style={s.recSub}>Addresses: {securityLane.recommendation.matchedCodes.join(" · ")}</Text>
                  <Link src={`${SITE_BASE}/services`} style={s.recLink}>See what&apos;s included → orgro.ca/services</Link>
                </View>
              ) : null}

              {securityLane.individualOffers.length > 0 ? (
                <View wrap={false}>
                  <Text style={s.h3}>Additional items to consider</Text>
                  {securityLane.individualOffers.map((o) => (
                    <View key={o.code} style={s.offerRow}>
                      <View style={{ width: "62%" }}>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                          <View style={[s.dot, { backgroundColor: TIER_DOT_COLOR[o.tier] }]} />
                          {/* Must be the name that's actually searchable on
                              orgro.ca/services — the internal simpleName doesn't exist there. */}
                          <Text style={s.offerName}>{o.officialName}</Text>
                        </View>
                        <Text style={[s.small, { marginLeft: 10, marginBottom: 0 }]}>{o.code} · {o.tier === "recommended" ? "RECOMMENDED" : "WORTH EXPLORING"}</Text>
                      </View>
                      <Text style={[s.offerMeta, { width: "38%" }]}>{o.category} · {BILLING_LABEL[o.billing]}</Text>
                    </View>
                  ))}
                  <View style={{ flexDirection: "row", marginTop: 7 }}>
                    <View style={s.dotRow}><View style={[s.dot, { backgroundColor: ORANGE }]} /><Text style={s.small}>Recommended</Text></View>
                    <View style={s.dotRow}><View style={[s.dot, { backgroundColor: "#6b7470" }]} /><Text style={s.small}>Worth exploring</Text></View>
                  </View>
                  <Text style={s.small}>
                    These are additional services outside the package. Search by item name or code on orgro.ca/services to review what each service covers.
                  </Text>
                </View>
              ) : null}

              {automationLane.recommendation.kind !== "none" ? (
                <View style={[s.recCard, s.recCardAlt]} wrap={false}>
                  {automationLane.recommendation.kind === "or_one" ? (
                    <>
                      <Text style={s.recLabel}>AUTOMATION / RECOMMENDED</Text>
                      <Text style={s.recName}>OR ONE</Text>
                      {/* Live OR ONE plan names (or-one-client.tsx tierFor) — the plan
                          is set by the tasks the client selects in the builder, which
                          ODO can't know, so it names the real plans instead of guessing one. */}
                      <Text style={s.recSub}>Your plan — OR/ONE STARTER, 100, 200 or 400 — is set by the tasks you select in the OR ONE builder</Text>
                      <Text style={s.recReason}>{automationLane.recommendation.reason}</Text>
                      <Link src={`${SITE_BASE}/or-one`} style={s.recLink}>Learn more → orgro.ca/or-one</Link>
                    </>
                  ) : automationLane.recommendation.kind === "bundle" ? (
                    <>
                      <Text style={s.recLabel}>AUTOMATION / RECOMMENDED BUNDLE</Text>
                      <Text style={s.recName}>{automationLane.recommendation.bundle.name} — {automationLane.recommendation.bundle.tagline}</Text>
                      <Text style={s.recReason}>{automationLane.recommendation.reason}</Text>
                      <Text style={s.recSub}>Addresses: {automationLane.recommendation.matchedCodes.join(" · ")}</Text>
                      <Link src={`${SITE_BASE}/business-automation`} style={s.recLink}>See what&apos;s included → orgro.ca/business-automation</Link>
                    </>
                  ) : (
                    <>
                      <Text style={s.recLabel}>AUTOMATION / WORTH A CONVERSATION</Text>
                      <Text style={s.recName}>Tailored Automation</Text>
                      <Text style={s.recSub}>Scoped to your exact requirement — priced after a short scoping conversation</Text>
                      <Text style={s.recReason}>{automationLane.recommendation.reason}</Text>
                      <Link src={CONTACT_URL} style={s.recLink}>Start a scoping conversation → orgro.ca/contact</Link>
                    </>
                  )}
                </View>
              ) : null}

              <Text style={s.h3}>Where to look on the website</Text>
              {websitePointers.map((wp) => (
                <Text key={wp.path} style={s.siteLink}><Text style={{ ...SEMI }}>orgro.ca{wp.path}</Text> — {wp.label}</Text>
              ))}
            </>
          )}
        </View>

        {/* ---- 07 What this means for you ---- */}
        <View>
          <H2 num={nextNum()} title="What this means for you" top={4} />
          <View style={s.thRow}>
            <Text style={[s.th, { width: "34%" }]}>TOPIC</Text>
            <Text style={[s.th, { flex: 1, paddingRight: 0 }]}>OUR VIEW</Text>
          </View>
          <View style={s.viewRow} wrap={false}>
            <Text style={s.viewTopic}>Your situation today</Text>
            <Text style={s.viewText}>{outcomeNarrative.situationNow}</Text>
          </View>
          <View style={s.viewRow} wrap={false}>
            <Text style={s.viewTopic}>What you can achieve on security</Text>
            <Text style={s.viewText}>{outcomeNarrative.securityOutlook}</Text>
          </View>
          {outcomeNarrative.automationOpportunity ? (
            <View style={s.viewRow} wrap={false}>
              <Text style={s.viewTopic}>What could be automated</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.viewTextPlain}>{outcomeNarrative.automationOpportunity}</Text>
                {/* No $ / savings figure here by design: first-impression reports never carry a price, fee, or savings estimate. */}
                {outcomeNarrative.automationBenefits.map((b, i) => (
                  <View key={i} style={s.benefit}>
                    <Text style={s.benefitDash}>—</Text>
                    <Text style={s.benefitText}>{b}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          <Text style={s.h3}>Next decisions</Text>
          <View style={s.decisionRow} wrap={false}>
            <View style={[s.decision, { borderLeftWidth: 0, paddingLeft: 0 }]}>
              <Text style={s.decisionTitle}>01 · VERIFY</Text>
              <Text style={s.decisionText}>Confirm the unverified observations before assigning work.</Text>
            </View>
            <View style={s.decision}>
              <Text style={s.decisionTitle}>02 · PRIORITIZE</Text>
              <Text style={s.decisionText}>Start with the findings marked Priority and assign an owner.</Text>
            </View>
            <View style={s.decision}>
              <Text style={s.decisionTitle}>03 · MEASURE</Text>
              <Text style={s.decisionText}>Record what changes, then reassess the same controls.</Text>
            </View>
          </View>
          <View style={s.note} wrap={false}>
            <Text><Text style={s.noteLabel}>Evidence first. Decisions with clarity.</Text> Your discovery starts a clearer conversation. Tell us which finding you would like to clarify. We can review the evidence together and agree what should be verified next. orgro.ca/contact</Text>
          </View>
        </View>

        {/* ---- Appendix ---- */}
        <View break>
          <View style={s.h2}><Text style={s.h2Num}>A</Text><Text style={s.h2Title}>How to read this report</Text></View>
          <Text style={s.p}>
            Everything here comes from information that is already public, plus the answers you gave us. Findings marked
            UNCONFIRMED are reasonable conclusions, not verified facts — worth checking, not acting on blindly. Nothing was
            tested by trying to break in: ODO looks, it does not touch.
          </Text>
          <Text style={s.small}>Coverage: {coverage.note}{coverage.notDetermined.length ? ` Checks we could not complete: ${coverage.notDetermined.join(", ")}.` : ""}</Text>
          {report.attributions.length ? <Text style={s.small}>{report.attributions.join(" ")}</Text> : null}

          <View style={[s.h2, { marginTop: 7 }]}><Text style={s.h2Num}>B</Text><Text style={s.h2Title}>Free re-check in 90 days</Text></View>
          <Text style={s.p}>
            From {fmtDate(recheckFrom)}, ask us and ODO will re-run the same public checks at no cost and show you exactly
            what changed since this report.
          </Text>

          <View style={[s.h2, { marginTop: 7 }]}><Text style={s.h2Num}>C</Text><Text style={s.h2Title}>Questions about any of this?</Text></View>
          <Text style={s.p}>
            Every report is reviewed by an ORAGROL specialist before it reaches you — if something here does not match what
            you know about your business, tell us and we will correct it. Reply to the email this came with, or contact us
            at info@orgro.ca.
          </Text>

          <View style={[s.h2, { marginTop: 7 }]}><Text style={s.h2Num}>D</Text><Text style={s.h2Title}>About this report</Text></View>
          <Text style={s.disclaimer}>
            The research and findings in this report were collected and drafted by ORAGROL&apos;s automated discovery
            system (ODO), using information that is publicly available plus the answers you provided, and this report was
            reviewed by an ORAGROL team member before being released to you. It is provided as an informational courtesy to
            support your organization&apos;s security and operational planning, and does not constitute a security audit,
            penetration test, compliance certification, legal opinion, or professional advice of any kind, and no client
            relationship or warranty is created by receiving it. ORAGROL Global makes no representation that this report is
            complete or free of error, and accepts no liability for actions taken or not taken on the basis of its contents.
            If you would like a specific finding verified, scoped, or acted on, please contact us and we will be glad to help.
          </Text>

          <View style={s.reviewHead} wrap={false}>
            <Text style={[s.th, { width: "61%" }]}>REVIEWED BY</Text>
            <Text style={[s.th, { flex: 1, paddingRight: 0 }]}>DATE</Text>
          </View>
          <View style={s.reviewRow} wrap={false}>
            <Text style={[s.reviewCell, { width: "61%" }]}>The ORAGROL team</Text>
            <Text style={[s.reviewCell, { flex: 1 }]}>{reviewDate}</Text>
          </View>

          <View style={s.qrBox} wrap={false}>
            {qrDataUri ? <Image src={qrDataUri} style={s.qr} /> : null}
            <View style={{ flex: 1 }}>
              <Text style={s.qrTitle}>Continue the conversation</Text>
              <Text style={s.qrText}>
                Scan to reach ORAGROL, or visit orgro.ca/contact. Quote the report reference {report.reference} when you write.
              </Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
