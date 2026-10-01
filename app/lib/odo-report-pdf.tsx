import React from "react";
import { Document, Page, Text, View, StyleSheet, Image, Link } from "@react-pdf/renderer";
import type { OdoReport, ReportFinding, ReportPriority } from "./odo-report";

/**
 * ODO discovery report — client-facing PDF.
 *
 * REBUILT 2026-10-01 to match the approved 7-page HTML design handoff
 * (ODO_Discovery_Report_FINAL.html) and Mohammad's locked punch list
 * (ORAGROL_ODO_Report_Redesign_GoAhead_for_GPT.md, project docs):
 *   - No $ / savings figures anywhere in a first-impression report — the
 *     automation-estimate dollar box is gone entirely, not just hidden.
 *   - No individual's name or title on the closing page — a single
 *     institutional "Reviewed by the ORAGROL team" line instead.
 *   - New hero headline ("Here's what's exposed. / Here's what to fix
 *     first.") on the cover, in brand orange on a dark panel.
 *   - Brand orange is `#db5227` (resolved from the live site's design
 *     token at the time the mockup was approved — see the go-ahead note
 *     for the drift history across earlier sessions). Section numbers, the
 *     recommended/worth-exploring dot distinction, the cover headline and
 *     SWOT card borders/headers all use it.
 *   - Findings render as a real three-column table (category & priority /
 *     finding & explanation / source & checking details) with zebra
 *     striping, matching the mockup — not a flat list.
 *   - A closing "decision track" (Verify / Prioritize / Measure) and a dark
 *     contact band with the QR code, matching page 6/7 of the mockup.
 *
 * Cover and closing photo panels: sized and positioned exactly to the
 * mockup's .cover-art (526.5x329pt, title panel overlapping bottom-left at
 * 81% width) and .closing-art (526.5x219pt, caption overlapping bottom-left
 * at 45% width) — see `coverImageUri`/`closingImageUri` below. All three
 * callers (report/route.ts, odo-email.ts, odo-hubspot-report.ts) pass the
 * same two approved monochrome photos already shipped for the Cyber Health
 * PDF (public/images/cyber-health/cover.png + closing.png, loaded via
 * cyber-health-photos.ts) — Mohammad, 2026-10-01: same two files, reused as-is.
 * The props stay optional and fall back to the plain dark panel at the
 * identical size/position only if a caller omits them.
 *
 * Renders ONLY report.client/summary/findings/swot/priorities/securityLane/
 * automationLane/outcomeNarrative/websitePointers/coverage. report.internal
 * is never touched here: incumbent-IT signals, Jev scores, the
 * custom-service flag and raw answers go to ZM77/Mohammad, not to the
 * prospect.
 *
 * Section order is fixed (§7): overview → findings → SWOT → recommendation
 * → what this means for you → how to read this → closing. Length is driven
 * purely by what was found — a thin business gets a short report, and that
 * is correct, not a failure. `break` is used on each major section so a
 * normal scan reads like the approved one-section-per-page sample; a
 * long findings list still overflows and continues onto further pages
 * automatically (react-pdf's own pagination), it just isn't forced to fit
 * in one page.
 *
 * The QR code is supplied by the caller (report/route.ts, odo-email.ts) —
 * generated with the `qrcode` package, same pattern as scope-pdf.tsx.
 *
 * Two hard-won rules from scope-pdf.tsx are respected: no `lineHeight` on
 * `page` itself, and no `lineHeight` on the fixed footer's own leaf Text
 * styles — both made the footer vanish from the rendered PDF.
 */

const PAPER = "#b9bbb7";
const INK = "#161b1d";
const LINE = "#919893";
const SECONDARY = "#3d484b";
const ORANGE = "#db5227";
const ORANGE_ON_LIGHT = "#a43e1d";
const RED = "#d54836";
const STRIP_RED = "#ff705e";
const CYAN = "#26d5e9";
const ACID = "#d7ed4b";
const DARK = "#0a0c12";
const CARD_BG = "#c8cbc5";
const CARD_BORDER = "#8e9792";
const TABLE_BG = "#c8cbc6";
const TABLE_BORDER = "#808985";
const STRIPE_LIGHT = "#d5d9d3";
const STRIPE_DARK = "#b7bdb8";
const POSITIVE_BG = "#acd4ca";
const POSITIVE_BADGE = "#20967f";
const CATEGORY_RULE = "#616e6b";

const s = StyleSheet.create({
  page: { backgroundColor: PAPER, color: INK, fontFamily: "Helvetica", padding: 36, paddingBottom: 60, fontSize: 10 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18, borderBottom: `0.75 solid #7e8581`, paddingBottom: 10 },
  wordmark: { fontSize: 15, letterSpacing: 1.5, fontFamily: "Helvetica-Bold" },
  wordmarkSub: { fontSize: 7, letterSpacing: 2, color: SECONDARY, lineHeight: 1.4 },
  headerTag: { fontSize: 8, color: SECONDARY, letterSpacing: 1, lineHeight: 1.6, textAlign: "right" },

  // ---- Cover ----
  // Sized from the approved mockup's .cover-art (702x438px @96dpi content
  // width) converted to this A4-at-72dpi page: 702*0.75=526.5pt wide (=
  // this page's content width), 438*0.75=328.5pt tall. The title panel
  // overlaps the photo's bottom-left at 81% width, exactly as .cover-title.
  coverArt: { position: "relative", height: 329, marginBottom: 16, overflow: "hidden", backgroundColor: DARK },
  coverArtImage: { width: "100%", height: "100%", objectFit: "cover" },
  coverPanel: { position: "absolute", left: 0, bottom: 0, width: "81%", backgroundColor: DARK, padding: 18 },
  coverEyebrow: { fontSize: 7.5, letterSpacing: 1.5, color: ORANGE, fontFamily: "Helvetica-Bold", marginBottom: 8 },
  coverHeadline: { fontSize: 25, lineHeight: 1.12, color: ORANGE, fontFamily: "Helvetica-Bold", marginBottom: 8 },
  coverCaption: { fontSize: 9, letterSpacing: 2, color: ORANGE },

  preparedFor: { fontSize: 7.5, letterSpacing: 1.3, color: SECONDARY, fontFamily: "Helvetica-Bold", marginBottom: 5 },
  companyName: { fontSize: 23, letterSpacing: -0.5, fontFamily: "Helvetica-Bold", marginBottom: 7 },
  coverIntro: { fontSize: 10.5, lineHeight: 1.5, color: INK, marginBottom: 14, maxWidth: "88%" },

  profileTable: { flexDirection: "row", flexWrap: "wrap", backgroundColor: CARD_BG, border: `0.75 solid ${CARD_BORDER}`, marginBottom: 14 },
  profileCell: { width: "25%", padding: 10, borderRight: `0.75 solid ${CARD_BORDER}`, borderBottom: `0.75 solid ${CARD_BORDER}` },
  profileLabel: { fontSize: 7, letterSpacing: 1, color: SECONDARY, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  profileValue: { fontSize: 10.5, fontFamily: "Helvetica-Bold" },

  statStrip: { flexDirection: "row", backgroundColor: DARK, marginBottom: 12 },
  statCell: { width: "25%", padding: 12, borderRight: "0.75 solid #485154" },
  statNum: { fontSize: 26, lineHeight: 1, color: "#FFFFFF", fontFamily: "Helvetica-Bold" },
  statLabel: { fontSize: 7, letterSpacing: 0.8, color: "#C3C3B8", lineHeight: 1.35, marginTop: 7 },

  coverNote: { flexDirection: "row", borderTop: `0.75 solid ${LINE}`, paddingTop: 10, fontSize: 9 },
  coverNoteLabel: { fontFamily: "Helvetica-Bold", marginRight: 10 },
  coverNoteText: { color: SECONDARY, flex: 1 },

  // ---- Section bar ----
  sectionBar: { flexDirection: "row", alignItems: "center", marginTop: 16, marginBottom: 10, paddingBottom: 8, borderBottom: `1 solid #384143` },
  sectionNum: { backgroundColor: ORANGE, color: DARK, fontSize: 9, fontFamily: "Helvetica-Bold", paddingHorizontal: 5, paddingVertical: 2, borderRadius: 2, marginRight: 10 },
  sectionTitle: { fontSize: 17, lineHeight: 1.2, fontFamily: "Helvetica-Bold" },
  sectionContinued: { fontSize: 8, letterSpacing: 1.2, color: SECONDARY, marginBottom: 4 },

  findingsIntro: { fontSize: 9.5, lineHeight: 1.45, color: SECONDARY, marginBottom: 8, maxWidth: "90%" },
  legendRow: { flexDirection: "row", marginBottom: 10 },
  legendChip: { fontSize: 7, fontFamily: "Helvetica-Bold", letterSpacing: 0.4, paddingHorizontal: 5, paddingVertical: 2, marginRight: 6, borderRadius: 2 },

  // ---- Findings table ----
  findingsTable: { backgroundColor: TABLE_BG, border: `0.75 solid ${TABLE_BORDER}`, marginBottom: 6 },
  tableHeadRow: { flexDirection: "row", backgroundColor: "#171d1f" },
  tableHeadCell: { fontSize: 7, letterSpacing: 0.5, color: "#f6f7f3", fontFamily: "Helvetica-Bold", padding: 7, borderRight: "0.5 solid #4f5b5e" },
  colArea: { width: "19%" },
  colDetail: { width: "48%" },
  colProof: { width: "33%" },
  row: { flexDirection: "row", borderBottom: `0.5 solid #959f9b` },
  rowCategoryStart: { borderTop: `1.25 solid ${CATEGORY_RULE}` },
  cell: { padding: 8, borderRight: "0.5 solid #959f9b" },
  rowNo: { fontSize: 8, color: "#115a67", fontFamily: "Helvetica-Bold", marginRight: 5 },
  rowNoPositive: { color: "#125a4a" },
  areaName: { fontSize: 9, lineHeight: 1.25, fontFamily: "Helvetica-Bold", color: "#132428", marginBottom: 5 },
  areaHead: { flexDirection: "row", alignItems: "flex-start", marginBottom: 5 },
  badge: { fontSize: 6.5, letterSpacing: 0.3, fontFamily: "Helvetica-Bold", paddingHorizontal: 4, paddingVertical: 2, borderRadius: 2, marginRight: 4, marginBottom: 3 },
  fullFinding: { fontSize: 9.5, lineHeight: 1.35, color: "#172224" },
  visitorAnswer: { fontSize: 8.5, lineHeight: 1.3, color: "#314144", marginTop: 4 },
  proofLine: { fontSize: 8, lineHeight: 1.35, color: "#314144" },
  proofBold: { fontFamily: "Helvetica-Bold", color: "#17282c" },

  positiveTitle: { fontSize: 11, color: "#154b48", fontFamily: "Helvetica-Bold", marginTop: 14, marginBottom: 6 },

  // ---- SWOT ----
  swotIntro: { fontSize: 9.5, color: SECONDARY, lineHeight: 1.45, marginBottom: 10, maxWidth: "92%" },
  swotGrid: { flexDirection: "row", flexWrap: "wrap" },
  swotCell: { width: "50%", padding: 2 },
  swotCard: { backgroundColor: "#FFFFFF", borderTop: `3 solid ${ORANGE}`, padding: 12, margin: 4 },
  swotHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  swotTitle: { fontSize: 9, letterSpacing: 1, lineHeight: 1.3, fontFamily: "Helvetica-Bold", color: ORANGE_ON_LIGHT },
  swotCount: { fontSize: 13, fontFamily: "Helvetica-Bold", color: ORANGE_ON_LIGHT },
  swotPoint: { fontSize: 9, lineHeight: 1.4, marginBottom: 5 },
  swotEvidence: { fontSize: 7, color: SECONDARY },
  interpret: { fontSize: 9, lineHeight: 1.5, color: SECONDARY, marginTop: 10, borderTop: `0.75 solid ${LINE}`, paddingTop: 10 },

  // ---- Recommendations ----
  recCard: { backgroundColor: CARD_BG, borderLeft: `3 solid ${CYAN}`, padding: 14, marginBottom: 10 },
  recCardAlt: { borderLeftColor: ACID },
  recLabel: { fontSize: 7.5, letterSpacing: 1, color: "#2d555a", fontFamily: "Helvetica-Bold", marginBottom: 6 },
  recName: { fontSize: 19, letterSpacing: -0.5, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  recSub: { fontSize: 9, color: "#5c6962", marginBottom: 6 },
  recReason: { fontSize: 9.5, lineHeight: 1.45, marginBottom: 6 },
  recLink: { fontSize: 8.5, color: "#145968", fontFamily: "Helvetica-Bold", textDecoration: "none" },

  smallTitle: { fontSize: 11, marginTop: 14, marginBottom: 8, fontFamily: "Helvetica-Bold" },
  noteCard: { flexDirection: "row", paddingVertical: 8, borderBottom: `0.75 solid ${LINE}` },
  noteCol1: { width: "34%" },
  noteCol2: { width: "66%" },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 5 },
  noteTitle: { fontSize: 9.5, fontFamily: "Helvetica-Bold" },
  noteCode: { fontSize: 7, color: SECONDARY, marginTop: 2 },
  noteBody: { fontSize: 8.5, color: "#4f5d57", lineHeight: 1.4 },
  noteTail: { fontSize: 8, color: "#68726b", lineHeight: 1.5, marginTop: 9 },
  statusKey: { flexDirection: "row", alignItems: "center", marginRight: 12 },
  keyDot: { width: 5, height: 5, borderRadius: 2.5, marginRight: 4 },

  siteLinks: { borderTop: `0.75 solid ${LINE}`, marginTop: 12, paddingTop: 10 },
  siteLinkRow: { fontSize: 8.5, color: "#314143", marginBottom: 4 },
  siteLinkBold: { fontFamily: "Helvetica-Bold", color: "#145968" },

  // ---- What this means for you ----
  outcomeBlock: { marginBottom: 10 },
  outcomeLabel: { fontSize: 8, letterSpacing: 1, color: SECONDARY, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  outcomeText: { fontSize: 9.5, lineHeight: 1.5 },
  benefitRow: { flexDirection: "row", marginBottom: 4, paddingLeft: 2 },
  benefitBullet: { fontSize: 9.5, color: ORANGE_ON_LIGHT, marginRight: 6 },
  benefitText: { fontSize: 9, lineHeight: 1.4, flex: 1 },

  decisionTrack: { marginTop: 14, borderTop: "0.75 solid #7d8782", paddingTop: 10 },
  decisionLabel: { fontSize: 8, fontFamily: "Helvetica-Bold", letterSpacing: 1.2, marginBottom: 8 },
  decisionGrid: { flexDirection: "row" },
  decisionCard: { width: "33.33%", backgroundColor: CARD_BG, padding: 10, marginRight: 6, borderTop: `3 solid ${CYAN}` },
  decisionCard2: { borderTopColor: RED },
  decisionCard3: { borderTopColor: ACID, marginRight: 0 },
  decisionTitle: { fontSize: 9.5, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  decisionText: { fontSize: 7.5, lineHeight: 1.4 },
  decisionNote: { fontSize: 7, color: "#3b494b", marginTop: 8 },

  note: { fontSize: 8.5, color: SECONDARY, lineHeight: 1.45, marginTop: 6 },
  closingTitle: { fontSize: 11, fontFamily: "Helvetica-Bold", marginTop: 14, marginBottom: 4 },
  closingText: { fontSize: 9.5, lineHeight: 1.45, color: SECONDARY },

  disclaimer: { marginTop: 14, borderTop: `0.75 solid ${LINE}`, paddingTop: 10 },
  disclaimerTitle: { fontSize: 8, letterSpacing: 1, color: SECONDARY, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  disclaimerText: { fontSize: 7.5, color: SECONDARY, lineHeight: 1.5 },

  // ---- Closing photo panel ----
  // Sized from the mockup's .closing-art (702x292px @96dpi) = 526.5pt wide
  // (page content width) x 219pt tall; caption box overlaps bottom-left at
  // 45% width, matching .closing-art div exactly.
  closingArt: { position: "relative", height: 219, marginBottom: 13, overflow: "hidden", backgroundColor: "#151b1d" },
  closingArtImage: { width: "100%", height: "100%", objectFit: "cover" },
  closingArtCaption: { position: "absolute", left: 0, bottom: 0, width: "45%", backgroundColor: "#151b1d", padding: 10 },
  closingArtCaptionText: { fontSize: 17, lineHeight: 1.15, color: "#FFFFFF", fontFamily: "Helvetica-Bold" },

  // ---- Contact band + review line ----
  contactBand: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: DARK, padding: 14, marginTop: 14 },
  contactCopy: { maxWidth: "75%" },
  contactEyebrow: { fontSize: 7.5, letterSpacing: 1.3, color: ORANGE, fontFamily: "Helvetica-Bold", marginBottom: 5 },
  contactHeadline: { fontSize: 13, lineHeight: 1.2, color: "#F5F6F1", fontFamily: "Helvetica-Bold", marginBottom: 5 },
  contactBody: { fontSize: 8.5, lineHeight: 1.4, color: "#d5dfdc", marginBottom: 5 },
  contactLink: { fontSize: 9, color: ORANGE, fontFamily: "Helvetica-Bold", textDecoration: "none" },
  qrChip: { backgroundColor: "#FFFFFF", padding: 4 },
  qr: { width: 56, height: 56 },

  reviewLine: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTop: `0.75 solid ${LINE}`, marginTop: 10, paddingTop: 8 },
  reviewText: { fontSize: 9, fontFamily: "Helvetica-Bold" },
  reviewDate: { fontSize: 8.5, color: SECONDARY },

  footer: { position: "absolute", bottom: 24, left: 36, right: 36, flexDirection: "row", justifyContent: "space-between", borderTop: `0.75 solid #7f8783`, paddingTop: 8 },
  footerLeft: { fontSize: 7.5, color: SECONDARY, letterSpacing: 0.5 },
  footerRight: { fontSize: 7.5, color: SECONDARY },
});

const CONTACT_URL = "https://orgro.ca/contact";
const SITE_BASE = "https://orgro.ca";

const SEV_STYLE: Record<ReportFinding["severity"], { text: string; color: string; bg: string }> = {
  high: { text: "PRIORITY", color: "#FFFFFF", bg: RED },
  medium: { text: "MODERATE", color: "#182426", bg: ACID },
  low: { text: "MINOR", color: "#10282d", bg: CYAN },
  info: { text: "MINOR", color: "#10282d", bg: CYAN },
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

const BILLING_LABEL: Record<ReportPriority["billing"], string> = { recurring: "Subscription", project: "By engagement" };
const TIER_DOT_COLOR: Record<"recommended" | "worth_exploring", string> = { recommended: ORANGE, worth_exploring: "#6b7470" };

/** Pulls the visitor's own words out of a "Q: id → "answer"" or free-text raw string — only ever called for source === "Visitor answer"(*) evidence (odo-ledger.ts). Returns null (never fabricates a quote) if the shape doesn't match. */
function visitorQuote(f: ReportFinding): string | null {
  if (!f.source.startsWith("Visitor answer") || !f.raw) return null;
  const m = /→\s*"([\s\S]*)"\s*$/.exec(f.raw);
  if (m) return m[1];
  return f.raw.length <= 300 ? f.raw : null;
}

function FindingRow({ f, rowNo, areaLabel, categoryStart, stripe }: { f: ReportFinding; rowNo: string; areaLabel: string; categoryStart: boolean; stripe: "light" | "dark" }) {
  const sev = SEV_STYLE[f.severity];
  const quote = visitorQuote(f);
  const stripeBg = stripe === "light" ? STRIPE_LIGHT : STRIPE_DARK;
  return (
    <View style={[s.row, { backgroundColor: stripeBg }, categoryStart ? s.rowCategoryStart : {}]} wrap={false}>
      <View style={[s.cell, s.colArea]}>
        <View style={s.areaHead}>
          <Text style={s.rowNo}>{rowNo}</Text>
          <Text style={s.areaName}>{areaLabel}</Text>
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          <Text style={[s.badge, { backgroundColor: sev.bg, color: sev.color }]}>{sev.text}</Text>
          {f.tier === "inferred" ? <Text style={[s.badge, { borderWidth: 0.75, borderColor: "#4d5c5e", color: "#213235" }]}>UNCONFIRMED</Text> : null}
        </View>
      </View>
      <View style={[s.cell, s.colDetail]}>
        <Text style={s.fullFinding}>{f.fact}</Text>
        {quote ? <Text style={s.visitorAnswer}><Text style={s.proofBold}>Your answer: </Text>&quot;{quote}&quot;</Text> : null}
      </View>
      <View style={[s.cell, s.colProof, { borderRightWidth: 0 }]}>
        <Text style={s.proofLine}><Text style={s.proofBold}>Source: </Text>{f.source}</Text>
        <Text style={s.proofLine}><Text style={s.proofBold}>Checked </Text>{fmtDate(f.collectedAt)}</Text>
        <Text style={s.proofLine}><Text style={s.proofBold}>Ref </Text>{f.id}{f.framework ? ` · ${f.framework}` : ""}</Text>
      </View>
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

export function OdoReportPdf({
  report,
  qrDataUri,
  coverImageUri,
  closingImageUri,
}: {
  report: OdoReport;
  qrDataUri?: string;
  // Optional photo panels matching the mockup's cover-art / closing-art
  // sections (ODO_Discovery_Report_FINAL.html: .cover-art is 702x438px,
  // .closing-art is 702x292px at the mockup's 96dpi page — i.e. full
  // content-width, ~329pt and ~219pt tall at this PDF's 72dpi A4 page).
  // Pass a data URI or a public https URL for each; until a real photo is
  // sourced, both fall back to the plain dark panel sized identically so
  // dropping a photo in later is a one-line change, not a relayout.
  coverImageUri?: string;
  closingImageUri?: string;
}) {
  const { client, headline, swot, priorities, securityLane, automationLane, outcomeNarrative, websitePointers, coverage } = report;
  const reviewDate = fmtDate(report.generatedAt);
  const allGapFindings = report.findings.flatMap((sec) => sec.gaps.map((f) => ({ ...f, areaLabel: sec.label })));
  const strengthsAll = report.findings.flatMap((f) => f.strengths);
  const hasFindings = allGapFindings.length > 0;

  // FIXED 2026-10-01 — derived with plain index math, no mutable loop
  // variable. The first attempt tracked a running counter/last-seen-area
  // via `let` reassigned inside the .map() callback; eslint's
  // react-hooks/immutability rule flags any reassignment inside the
  // component body as mutating state during render (real risk under
  // React's concurrent rendering — even though react-pdf only ever calls
  // this once, non-interactively, the rule has no way to know that), so
  // this avoids the pattern entirely rather than suppressing the rule.
  // Row numbers are just position+1; a "new category" is just "the
  // previous row's area differs from this one's."
  const findingRows: Array<{ f: (typeof allGapFindings)[number]; rowNo: string; categoryStart: boolean; stripe: "light" | "dark" }> = allGapFindings.map((f, i) => ({
    f,
    rowNo: String(i + 1).padStart(2, "0"),
    categoryStart: i === 0 || allGapFindings[i - 1].areaLabel !== f.areaLabel,
    stripe: i % 2 === 0 ? "light" : "dark",
  }));

  const footer = () => (
    <View style={s.footer} fixed>
      <Text style={s.footerLeft}>CONFIDENTIAL · {report.reference}</Text>
      <Text style={s.footerRight} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
    </View>
  );

  const runningHeader = () => (
    <View style={s.header} fixed>
      <View>
        <Text style={s.wordmark}>ORAGROL <Text style={s.wordmarkSub}>  GLOBAL</Text></Text>
      </View>
      <Text style={s.headerTag}>DISCOVERY REPORT{"\n"}{report.reference}</Text>
    </View>
  );

  let sectionNo = 0;

  return (
    <Document title={`ORAGROL Discovery Report — ${client.company}`} author="ORAGROL Global">
      <Page size="A4" style={s.page}>
        {footer()}
        {runningHeader()}

        {/* ---- Cover ---- */}
        <View style={s.coverArt}>
          {coverImageUri ? <Image src={coverImageUri} style={s.coverArtImage} /> : null}
          <View style={s.coverPanel}>
            <Text style={s.coverEyebrow}>ORAGROL GLOBAL · ODO</Text>
            <Text style={s.coverHeadline}>Here&apos;s what&apos;s exposed.{"\n"}Here&apos;s what to fix first.</Text>
            <Text style={s.coverCaption}>YOUR DISCOVERY REPORT</Text>
          </View>
        </View>

        <Text style={s.preparedFor}>PREPARED FOR</Text>
        <Text style={s.companyName}>{client.company}</Text>
        <Text style={s.coverIntro}>{report.summary}</Text>

        <View style={s.profileTable}>
          <View style={s.profileCell}>
            <Text style={s.profileLabel}>PREPARED</Text>
            <Text style={s.profileValue}>{reviewDate}</Text>
          </View>
          <View style={s.profileCell}>
            <Text style={s.profileLabel}>WEBSITE</Text>
            <Text style={s.profileValue}>{client.website ? client.website.replace(/^https?:\/\//, "") : "—"}</Text>
          </View>
          <View style={s.profileCell}>
            <Text style={s.profileLabel}>INDUSTRY</Text>
            <Text style={s.profileValue}>{client.industry ?? "—"}</Text>
          </View>
          <View style={[s.profileCell, { borderRightWidth: 0 }]}>
            <Text style={s.profileLabel}>TEAM SIZE</Text>
            <Text style={s.profileValue}>{client.businessSize ? (SIZE_LABEL[client.businessSize] ?? client.businessSize) : "—"}</Text>
          </View>
        </View>

        <View style={s.statStrip}>
          <View style={s.statCell}>
            <Text style={[s.statNum, { color: ACID }]}>{headline.confirmedGaps}</Text>
            <Text style={s.statLabel}>CONFIRMED GAPS</Text>
          </View>
          <View style={s.statCell}>
            <Text style={[s.statNum, { color: STRIP_RED }]}>{headline.highSeverity}</Text>
            <Text style={s.statLabel}>NEED PRIORITY ATTENTION</Text>
          </View>
          <View style={s.statCell}>
            <Text style={[s.statNum, { color: CYAN }]}>{headline.strengths}</Text>
            <Text style={s.statLabel}>THINGS DONE WELL</Text>
          </View>
          <View style={[s.statCell, { borderRightWidth: 0 }]}>
            <Text style={s.statNum}>{headline.recommended + headline.worthExploring}</Text>
            <Text style={s.statLabel}>AREAS TO ACT ON</Text>
          </View>
        </View>

        <View style={s.coverNote}>
          <Text style={s.coverNoteLabel}>Inside this report</Text>
          <Text style={s.coverNoteText}>Evidence-led findings · Business context · Recommendations · How to read your results</Text>
        </View>

        {/* ---- Findings ---- */}
        <View break>
          <SectionBar num={++sectionNo} title="What we found" />
          <Text style={s.findingsIntro}>Each line pairs the observation with the answer or public source behind it. Priority color shows what deserves attention first; unconfirmed means the observation needs validation.</Text>
          <View style={s.legendRow}>
            <Text style={[s.legendChip, { backgroundColor: RED, color: "#fff" }]}>PRIORITY</Text>
            <Text style={[s.legendChip, { backgroundColor: ACID, color: "#182426" }]}>MODERATE</Text>
            <Text style={[s.legendChip, { backgroundColor: CYAN, color: "#10282d" }]}>MINOR</Text>
            <Text style={[s.legendChip, { borderWidth: 0.75, borderColor: "#4a595b", color: "#213235" }]}>UNCONFIRMED</Text>
          </View>

          {hasFindings ? (
            <View style={s.findingsTable}>
              <View style={s.tableHeadRow}>
                <Text style={[s.tableHeadCell, s.colArea]}>CATEGORY &amp; PRIORITY</Text>
                <Text style={[s.tableHeadCell, s.colDetail]}>FINDING &amp; EXPLANATION</Text>
                <Text style={[s.tableHeadCell, s.colProof, { borderRightWidth: 0 }]}>SOURCE &amp; CHECKING DETAILS</Text>
              </View>
              {findingRows.map(({ f, rowNo, categoryStart, stripe }) => (
                <FindingRow key={f.id} f={f} rowNo={rowNo} areaLabel={f.areaLabel} categoryStart={categoryStart} stripe={stripe} />
              ))}
            </View>
          ) : (
            <Text style={s.note}>
              ODO did not confirm any security or operational gaps from public information and your answers. That is a good
              result — it means nothing we could check from the outside is currently exposed.
            </Text>
          )}

          {strengthsAll.length > 0 ? (
            <View>
              <Text style={s.positiveTitle}>Already in good shape</Text>
              <View style={s.findingsTable}>
                {strengthsAll.slice(0, 8).map((f, i) => (
                  <View key={f.id} style={[s.row, { backgroundColor: POSITIVE_BG }]} wrap={false}>
                    <View style={[s.cell, s.colArea]}>
                      <Text style={[s.rowNo, s.rowNoPositive]}>+{String(i + 1).padStart(2, "0")}</Text>
                      <Text style={[s.badge, { backgroundColor: POSITIVE_BADGE, color: "#fff", marginTop: 4 }]}>POSITIVE</Text>
                    </View>
                    <View style={[s.cell, s.colDetail, { width: "81%", borderRightWidth: 0 }]}>
                      <Text style={s.fullFinding}>{f.fact}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ) : null}
        </View>

        {/* ---- SWOT ---- */}
        <View break>
          <SectionBar num={++sectionNo} title="SWOT — where the business stands" />
          <Text style={s.swotIntro}>{SWOT_EXPLAINER}</Text>
          <View style={s.swotGrid}>
            {([["STRENGTHS", swot.strengths], ["WEAKNESSES", swot.weaknesses], ["OPPORTUNITIES", swot.opportunities], ["THREATS", swot.threats]] as const).map(([title, points]) => (
              <View key={title} style={s.swotCell}>
                <View style={s.swotCard} wrap={false}>
                  <View style={s.swotHead}>
                    <Text style={s.swotTitle}>{title}</Text>
                    <Text style={s.swotCount}>{points.length}</Text>
                  </View>
                  {points.length ? points.map((p, j) => (
                    <Text key={j} style={s.swotPoint}>• {p.text} <Text style={s.swotEvidence}>[{p.evidence.join(", ")}]</Text></Text>
                  )) : <Text style={[s.swotPoint, { color: SECONDARY }]}>Nothing significant identified.</Text>}
                </View>
              </View>
            ))}
          </View>
          <Text style={s.interpret}>Read the evidence alongside the summary. Each reference points back to a finding, its source and its checking date. An unconfirmed observation remains something to verify before deciding on an action.</Text>
        </View>

        {/* ---- Recommendation ---- */}
        <View break>
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
                  {securityLane.recommendation.kind === "package" || securityLane.recommendation.kind === "foundation_default" ? (
                    <View style={s.recCard}>
                      <Text style={s.recLabel}>SECURITY / {securityLane.recommendation.kind === "foundation_default" ? "RECOMMENDED STARTING POINT" : "RECOMMENDED PACKAGE"}</Text>
                      <Text style={s.recName}>{securityLane.recommendation.pkg.name}</Text>
                      <Text style={s.recSub}>{securityLane.recommendation.pkg.itemCount} cybersecurity services included</Text>
                      <Text style={s.recReason}>{securityLane.recommendation.reason}</Text>
                      <Text style={[s.recSub, { fontFamily: "Courier" }]}>Addresses: {securityLane.recommendation.matchedCodes.join(" · ")}</Text>
                      <Link src={`${SITE_BASE}/services`} style={s.recLink}>See what&apos;s included → orgro.ca/services</Link>
                    </View>
                  ) : null}
                </View>
              ) : null}

              {securityLane.individualOffers.length > 0 ? (
                <View wrap={false}>
                  <Text style={s.smallTitle}>Additional items to consider</Text>
                  {securityLane.individualOffers.map((o) => (
                    <View key={o.code} style={s.noteCard}>
                      <View style={s.noteCol1}>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                          <View style={[s.statusDot, { backgroundColor: TIER_DOT_COLOR[o.tier] }]} />
                          <Text style={s.noteTitle}>{o.simpleName}</Text>
                        </View>
                        <Text style={s.noteCode}>{o.code} · {o.tier === "recommended" ? "RECOMMENDED" : "WORTH EXPLORING"}</Text>
                      </View>
                      <View style={s.noteCol2}>
                        <Text style={s.noteBody}>{o.category} · {BILLING_LABEL[o.billing]}</Text>
                      </View>
                    </View>
                  ))}
                  <View style={{ flexDirection: "row", marginTop: 9 }}>
                    <View style={s.statusKey}><View style={[s.keyDot, { backgroundColor: ORANGE }]} /><Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold", color: "#34403b" }}>Recommended</Text></View>
                    <View style={s.statusKey}><View style={[s.keyDot, { backgroundColor: "#6b7470" }]} /><Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold", color: "#34403b" }}>Worth exploring</Text></View>
                  </View>
                  <Text style={s.noteTail}>
                    These are additional services outside the package. Search by item name or code on orgro.ca/services to review what each service covers.
                  </Text>
                </View>
              ) : null}

              {automationLane.recommendation.kind !== "none" ? (
                <View wrap={false}>
                  <View style={[s.recCard, s.recCardAlt]}>
                    {automationLane.recommendation.kind === "or_one" ? (
                      <>
                        <Text style={s.recLabel}>AUTOMATION / RECOMMENDED</Text>
                        <Text style={s.recName}>OR ONE</Text>
                        <Text style={s.recSub}>Custom-built automation, scoped and priced to your business</Text>
                        <Text style={s.recReason}>{automationLane.recommendation.reason}</Text>
                        <Link src={`${SITE_BASE}/or-one`} style={s.recLink}>Learn more → orgro.ca/or-one</Link>
                      </>
                    ) : automationLane.recommendation.kind === "bundle" ? (
                      <>
                        <Text style={s.recLabel}>AUTOMATION / RECOMMENDED BUNDLE</Text>
                        <Text style={s.recName}>{automationLane.recommendation.bundle.name} — {automationLane.recommendation.bundle.tagline}</Text>
                        <Text style={s.recReason}>{automationLane.recommendation.reason}</Text>
                        <Text style={[s.recSub, { fontFamily: "Courier" }]}>Addresses: {automationLane.recommendation.matchedCodes.join(" · ")}</Text>
                        <Link src={`${SITE_BASE}/business-automation`} style={s.recLink}>See what&apos;s included → orgro.ca/business-automation</Link>
                      </>
                    ) : (
                      <>
                        <Text style={s.recLabel}>AUTOMATION / WORTH A CONVERSATION</Text>
                        <Text style={s.recName}>Tailored Automation</Text>
                        <Text style={s.recSub}>Scoped to your exact requirement — priced after a short scoping conversation</Text>
                        <Text style={s.recReason}>{automationLane.recommendation.reason}</Text>
                        <Link src={`${SITE_BASE}/contact`} style={s.recLink}>Start a scoping conversation → orgro.ca/contact</Link>
                      </>
                    )}
                  </View>
                </View>
              ) : null}

              <View style={s.siteLinks}>
                {websitePointers.map((wp) => (
                  <Text key={wp.path} style={s.siteLinkRow}><Text style={s.siteLinkBold}>orgro.ca{wp.path}</Text> — {wp.label}</Text>
                ))}
              </View>
            </>
          )}
        </View>

        {/* ---- What this means for you ---- */}
        <View break>
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
              {/* No $ / savings figure here by design — first-impression reports never carry a price,
                  fee, or savings estimate (go-ahead note, item 1). The benefits list below stands on
                  its own; a number only enters the conversation later, in the actual sales call. */}
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
            </View>
          ) : null}

          <View style={s.decisionTrack}>
            <Text style={s.decisionLabel}>NEXT DECISIONS</Text>
            <View style={s.decisionGrid}>
              <View style={s.decisionCard}>
                <Text style={s.decisionTitle}>01 · Verify</Text>
                <Text style={s.decisionText}>Confirm the unverified observations before assigning work.</Text>
              </View>
              <View style={[s.decisionCard, s.decisionCard2]}>
                <Text style={s.decisionTitle}>02 · Prioritize</Text>
                <Text style={s.decisionText}>Start with the findings marked Priority and assign an owner.</Text>
              </View>
              <View style={[s.decisionCard, s.decisionCard3]}>
                <Text style={s.decisionTitle}>03 · Measure</Text>
                <Text style={s.decisionText}>Record what changes, then reassess the same controls.</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ---- How to read this ---- */}
        <View break>
          <View style={s.closingArt}>
            {closingImageUri ? <Image src={closingImageUri} style={s.closingArtImage} /> : null}
            <View style={s.closingArtCaption}>
              <Text style={s.closingArtCaptionText}>Evidence first.{"\n"}Decisions with clarity.</Text>
            </View>
          </View>
          <SectionBar num={++sectionNo} title="How to read this report" />
          <Text style={s.note}>
            Everything here comes from information that is already public, plus the answers you gave us. Findings marked
            UNCONFIRMED are reasonable conclusions, not verified facts — worth checking, not acting on blindly. Nothing was
            tested by trying to break in: ODO looks, it does not touch. {coverage.note}
            {coverage.notDetermined.length ? ` Checks we could not complete: ${coverage.notDetermined.join(", ")}.` : ""}
          </Text>
          {report.attributions.length ? <Text style={s.note}>{report.attributions.join(" ")}</Text> : null}

          <Text style={s.closingTitle}>Questions about any of this?</Text>
          <Text style={s.closingText}>
            Every report is reviewed by an ORAGROL specialist before it reaches you — if something here does not match
            what you know about your business, tell us and we will correct it. Reply to the email this came with, or
            contact us at info@orgro.ca.
          </Text>

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

          <View style={s.contactBand} wrap={false}>
            <View style={s.contactCopy}>
              <Text style={s.contactEyebrow}>CONTINUE THE CONVERSATION</Text>
              <Text style={s.contactHeadline}>Your discovery starts a clearer conversation.</Text>
              <Text style={s.contactBody}>Tell us which finding you would like to clarify. We can review the evidence together and agree what should be verified next.</Text>
              <Link src={CONTACT_URL} style={s.contactLink}>orgro.ca/contact →</Link>
            </View>
            {qrDataUri ? (
              <View style={s.qrChip}>
                <Image src={qrDataUri} style={s.qr} />
              </View>
            ) : null}
          </View>

          {/* FIXED 2026-10-01 — no individual's name or title on a client-facing
              report (go-ahead note, item 2: "Drop 'Mohammad, Founder & CEO' ...
              Replace the attribution with an institutional line instead"). The
              identity rule locked for live chat applies here too: ORAGROL
              always speaks institutionally, never as one named person. */}
          <View style={s.reviewLine} wrap={false}>
            <Text style={s.reviewText}>Reviewed by the ORAGROL team</Text>
            <Text style={s.reviewDate}>{reviewDate}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
