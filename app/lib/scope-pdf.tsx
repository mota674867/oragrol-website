import React from "react";
import { Document, Page, Text, View, StyleSheet, Link, Image } from "@react-pdf/renderer";

/**
 * My Scope PDF — per My_Scope_Final_Ready_For_Claude.md Section 3.
 * Fee-free: no prices, totals, Points, risk ratings anywhere in this
 * file. Content only — client block, selected items grouped by area,
 * closing note + QR. Context/timeframe/priority/intent belong in the
 * internal email and HubSpot note, never here (Section 1).
 *
 * Same page-style discipline as app/cyber-health/pdf-report.tsx: no
 * lineHeight on `page` itself — that combination broke that PDF's
 * fixed footer (present in the text layer, invisible when rasterized,
 * confirmed and fixed earlier this project). Every text style below
 * declares lineHeight on itself instead — EXCEPT the footer's own two
 * leaf styles (footerLeft/footerRight), which found a stricter variant
 * of the same bug: lineHeight directly on a fixed footer's own Text
 * elements made the footer disappear from the text layer entirely,
 * not just invisible-when-rasterized. See the comment at `const
 * footer` below for how this was isolated.
 */

export type ScopeArea = "Cybersecurity" | "Automation" | "OR ONE";

export type ScopePdfItem = { code: string; name: string };
export type ScopePdfGroup = { area: ScopeArea; items: ScopePdfItem[] };

export type ScopePdfData = {
  company: string;
  name: string;
  phone: string;
  email: string;
  /** Server-generated, already formatted, e.g. "09 Sep 2026". */
  date: string;
  reference: string;
  groups: ScopePdfGroup[]; // empty-item groups are omitted by the caller, not rendered as empty sections
};

export type ScopePdfProps = {
  data: ScopePdfData;
  /** PNG/data URL generated from https://orgro.ca/contact — never an AI-drawn QR. */
  contactQrSrc: string;
  /**
   * Sample mode adds "SAMPLE" to the header tag and "FICTIONAL DESIGN
   * SAMPLE" to the footer, matching the approved preview exactly.
   * Production callers must leave this false — there is no default
   * here specifically so a caller can't forget to set it.
   */
  sample: boolean;
};

/**
 * Exported separately so a caller (the /api/scope route) can check this
 * BEFORE generating a PDF and handle a genuine two-page overflow as a
 * real decision — flag it, alert, fall back to a longer document with
 * explicit sign-off — rather than the PDF component silently rendering
 * something cut off. See layoutCompactPages below for how this is
 * determined; not a guess, an actual accumulation against calibrated,
 * measured row heights.
 */
export function scopePdfWouldOverflowTwoPages(groups: ScopePdfGroup[]): boolean {
  const nonEmpty = AREA_ORDER.map((area) => groups.find((g) => g.area === area)).filter(
    (g): g is ScopePdfGroup => !!g && g.items.length > 0,
  );
  if (totalItemCount(nonEmpty) <= COMPACT_THRESHOLD) return false;
  return layoutCompactPages(nonEmpty).overflow;
}

const AREA_LABEL: Record<ScopeArea, string> = {
  Cybersecurity: "Cybersecurity",
  Automation: "Business Automation",
  "OR ONE": "OR ONE",
};
const AREA_ORDER: ScopeArea[] = ["Cybersecurity", "Automation", "OR ONE"];

const BG = "#D2D2CA";
const INK = "#151719";
const SECONDARY = "#50565A";
const RULE = "#A0A39D";
const ORANGE = "#EF4D00";
const CONTACT_URL = "https://orgro.ca/contact";
const CONTACT_DISPLAY = "orgro.ca/contact";

// Above this many total selected items, switch from the spacious
// single-column layout (matches the approved 1-page sample exactly)
// to the compact two-column layout. Chosen empirically by rendering
// both a small and the real maximum-selection case (see
// scope-pdf.render-test.ts) and checking actual page counts, not
// picked from a formula. See that script's output for what was tested.
const COMPACT_THRESHOLD = 14;

const spacious = StyleSheet.create({
  page: { backgroundColor: BG, color: INK, fontFamily: "Helvetica", padding: 36, paddingBottom: 64, fontSize: 10 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 },
  wordmark: { fontSize: 21, lineHeight: 1, fontFamily: "Helvetica" },
  wordmarkSub: { fontSize: 8, letterSpacing: 2, color: SECONDARY, lineHeight: 1.4, marginTop: 2 },
  headerTag: { fontSize: 9, color: SECONDARY, letterSpacing: 0.5, lineHeight: 1.4 },
  heading: { fontSize: 46, lineHeight: 1, marginBottom: 6, fontFamily: "Helvetica" },
  intro: { fontSize: 12, color: SECONDARY, lineHeight: 1.4, marginBottom: 14 },
  topRule: { borderTop: `0.75 solid ${RULE}`, marginBottom: 18 },
  clientRow: { flexDirection: "row", marginBottom: 12 },
  clientCol: { width: "50%" },
  fieldLabel: { fontSize: 8, letterSpacing: 1, color: SECONDARY, lineHeight: 1.4, marginBottom: 3 },
  fieldValueLg: { fontSize: 18, lineHeight: 1.2 },
  fieldValue: { fontSize: 11, lineHeight: 1.3 },
  clientBlockRule: { borderTop: `0.75 solid ${RULE}`, marginTop: 6, marginBottom: 18 },
  categoryBar: { backgroundColor: INK, flexDirection: "row", alignItems: "center", paddingVertical: 8, paddingHorizontal: 10, marginTop: 14, marginBottom: 8 },
  categoryNum: { color: ORANGE, fontSize: 11, lineHeight: 1.3, marginRight: 12, width: 18 },
  categoryTitle: { color: "#F4F2ED", fontSize: 13, lineHeight: 1.3 },
  colHeadRow: { flexDirection: "row", marginBottom: 4 },
  colHeadCode: { width: "28%", fontSize: 8, letterSpacing: 1, color: SECONDARY, lineHeight: 1.4 },
  colHeadName: { width: "72%", fontSize: 8, letterSpacing: 1, color: SECONDARY, lineHeight: 1.4 },
  itemRow: { flexDirection: "row", paddingVertical: 8, borderBottom: `0.5 solid ${RULE}` },
  itemCode: { width: "28%", fontSize: 10, color: SECONDARY, lineHeight: 1.3 },
  itemName: { width: "72%", fontSize: 12, lineHeight: 1.3 },
  closingWrap: { marginTop: 22, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  closingLeft: { width: "68%" },
  closingLabel: { fontSize: 9, letterSpacing: 1, color: SECONDARY, lineHeight: 1.4, marginBottom: 8 },
  closingNote: { fontSize: 9, color: SECONDARY, lineHeight: 1.45 },
  qr: { width: 74, height: 74 },
  qrLink: { fontSize: 8, color: SECONDARY, textAlign: "center", marginTop: 6, textDecoration: "none", lineHeight: 1.4 },
  footerRule: { borderTop: `0.5 solid ${RULE}`, marginTop: 16, marginBottom: 8 },
  footer: { position: "absolute", bottom: 28, left: 36, right: 36, flexDirection: "row", justifyContent: "space-between" },
  footerLeft: { fontSize: 8, color: SECONDARY, letterSpacing: 0.5 },
  footerRight: { fontSize: 8, color: SECONDARY },
});

// Compact variant: same tokens, denser spacing, two-column item grid.
// Reuses everything from `spacious` except the pieces that actually
// need to change for density — no separate color/type-scale decisions.
const compact = StyleSheet.create({
  ...spacious,
  page: { ...spacious.page, padding: 32, paddingBottom: 56 },
  heading: { ...spacious.heading, fontSize: 34, marginBottom: 4 },
  intro: { ...spacious.intro, fontSize: 10, marginBottom: 10 },
  clientRow: { ...spacious.clientRow, marginBottom: 8 },
  fieldValueLg: { ...spacious.fieldValueLg, fontSize: 13 },
  clientBlockRule: { ...spacious.clientBlockRule, marginBottom: 12 },
  categoryBar: { ...spacious.categoryBar, paddingVertical: 5, marginTop: 8, marginBottom: 5 },
  categoryTitle: { ...spacious.categoryTitle, fontSize: 11 },
  itemGrid: { flexDirection: "row", flexWrap: "wrap" },
  itemCell: { width: "50%", flexDirection: "row", paddingVertical: 3, paddingRight: 10, borderBottom: `0.5 solid ${RULE}` },
  itemCellCode: { width: "34%", fontSize: 9, color: SECONDARY, lineHeight: 1.3 },
  itemCellName: { width: "66%", fontSize: 9.5, lineHeight: 1.3 },
});

function ClientBlock({ d, s, compactRef }: { d: ScopePdfData; s: typeof spacious; compactRef?: boolean }) {
  return (
    <View wrap={false}>
      <View style={{ marginBottom: 8 }}>
        <Text style={s.fieldLabel}>COMPANY</Text>
        <Text style={s.fieldValueLg}>{d.company}</Text>
      </View>
      {!compactRef ? (
        <>
          <View style={s.clientRow}>
            <View style={s.clientCol}>
              <Text style={s.fieldLabel}>FULL NAME</Text>
              <Text style={s.fieldValue}>{d.name}</Text>
            </View>
            <View style={s.clientCol}>
              <Text style={s.fieldLabel}>PHONE NUMBER</Text>
              <Text style={s.fieldValue}>{d.phone}</Text>
            </View>
          </View>
          <View style={s.clientRow}>
            <View style={s.clientCol}>
              <Text style={s.fieldLabel}>EMAIL ADDRESS</Text>
              <Text style={s.fieldValue}>{d.email}</Text>
            </View>
            <View style={s.clientCol}>
              <Text style={s.fieldLabel}>DATE / REFERENCE</Text>
              <Text style={s.fieldValue}>{d.date} / {d.reference}</Text>
            </View>
          </View>
        </>
      ) : (
        // Page-2+ continuation: small reference only, per Section 3 —
        // "on page two use a small scope reference rather than
        // repeating the full block."
        <Text style={s.fieldValue}>{d.date} / {d.reference}</Text>
      )}
      <View style={s.clientBlockRule} />
    </View>
  );
}

function totalItemCount(groups: ScopePdfGroup[]): number {
  return groups.reduce((n, g) => n + g.items.length, 0);
}

// --- Manual pagination for compact mode ---------------------------------
// react-pdf's automatic multi-page flow (used for the spacious/small-
// selection case below) has no hook for "repeat this heading at the top
// of whatever page this section continues onto" — there's no HTML
// <thead>-style repeat-on-break primitive. For the compact case, where a
// single category (OR ONE, up to 62 items) can itself be larger than a
// full page, that repeat is an explicit requirement, so compact mode
// builds two explicit <Page> elements from a manually computed split
// instead of relying on auto-flow.
//
// The height constants below are computed from this file's own compact
// styles (padding + font size + line-height + border, added up by hand
// against the actual StyleSheet values above — not guessed), then
// checked against real renders (app/lib/scope-pdf.render-test.ts,
// "maximum" scenario) via pdfinfo/pdftotext/pdftoppm. First attempt
// used rounder, more generous numbers and it showed two real failure
// modes worth remembering: (1) a several-point underestimate of the
// closing block let a stray line spill onto a near-empty 3rd page —
// found by inspecting that page directly, it wasn't just "3 pages
// instead of 2", the 3rd page was almost entirely blank; (2) overcorrecting
// by increasing every constant at once (including per-row height, which
// multiplies across 40+ rows) swung too far the other way and silently
// dropped real items — caught by an explicit overflow check that throws
// rather than ships a truncated PDF, not by eyeballing the output.
// Also reduced itemCell's paddingVertical from 5 to 4 (compact styles
// above) specifically to buy a reliable per-row margin without touching
// font size, which the 9-10pt requirement doesn't leave room to shrink.
const COMPACT_PAGE_HEIGHT = 841.89; // A4, points
const COMPACT_PADDING_TOP = 32;
const COMPACT_PADDING_BOTTOM = 56;
const COMPACT_HEADER_AND_CLIENT_BLOCK = 310; // wordmark through the full client block + rule
const COMPACT_PAGE2_REFERENCE_BLOCK = 44; // "(continued)" mini header + small scope reference
const COMPACT_CATEGORY_BAR = 38;
const COMPACT_ITEM_ROW = 19; // one grid row = 2 items side by side (paddingVertical 3+3=6, ~9.5pt text at 1.3 line-height≈12.35, 0.5pt border ≈ 18.85, rounded up)
const COMPACT_CLOSING_BLOCK = 150; // closing note + QR + footer rule

const COMPACT_PAGE1_BUDGET =
  COMPACT_PAGE_HEIGHT - COMPACT_PADDING_TOP - COMPACT_PADDING_BOTTOM - COMPACT_HEADER_AND_CLIENT_BLOCK;
const COMPACT_PAGE2_BUDGET =
  COMPACT_PAGE_HEIGHT -
  COMPACT_PADDING_TOP -
  COMPACT_PADDING_BOTTOM -
  COMPACT_PAGE2_REFERENCE_BLOCK -
  COMPACT_CLOSING_BLOCK;

type CompactSection = {
  area: ScopeArea;
  num: number;
  continued: boolean;
  itemRows: ScopePdfItem[][]; // each entry is one grid row (1-2 items)
};

function toItemRows(items: ScopePdfItem[]): ScopePdfItem[][] {
  const rows: ScopePdfItem[][] = [];
  for (let i = 0; i < items.length; i += 2) {
    rows.push(items.slice(i, i + 2));
  }
  return rows;
}

/**
 * Splits groups into page 1 / page 2 compact sections. Never splits a
 * grid row (2 items) across pages — only splits between rows, so a
 * "row" is the atomic unit. If a category's rows split across the
 * page boundary, the page-2 continuation repeats that category's bar
 * with "(continued)". Returns `overflow: true` if even two pages
 * genuinely can't hold everything at this density — the caller must
 * not silently render a broken/truncated document in that case.
 */
function layoutCompactPages(groups: ScopePdfGroup[]): {
  page1: CompactSection[];
  page2: CompactSection[];
  overflow: boolean;
} {
  const page1: CompactSection[] = [];
  const page2: CompactSection[] = [];
  let budget = COMPACT_PAGE1_BUDGET;
  let onPage2 = false;
  let overflow = false;

  groups.forEach((group, gi) => {
    const allRows = toItemRows(group.items);
    let rowIdx = 0;
    let continued = false;

    while (rowIdx < allRows.length || (rowIdx === 0 && allRows.length === 0)) {
      const needed = COMPACT_CATEGORY_BAR; // must fit the bar itself before any rows
      if (!onPage2 && budget < needed) {
        onPage2 = true;
        budget = COMPACT_PAGE2_BUDGET;
      }
      const section: CompactSection = { area: group.area, num: gi + 1, continued, itemRows: [] };
      budget -= COMPACT_CATEGORY_BAR;

      while (rowIdx < allRows.length && budget >= COMPACT_ITEM_ROW) {
        section.itemRows.push(allRows[rowIdx]);
        budget -= COMPACT_ITEM_ROW;
        rowIdx++;
      }

      (onPage2 ? page2 : page1).push(section);

      if (rowIdx < allRows.length) {
        // Ran out of room mid-category — continue on page 2.
        if (!onPage2) {
          onPage2 = true;
          budget = COMPACT_PAGE2_BUDGET;
        } else {
          // Already on page 2 and still don't fit — two pages isn't
          // enough at this density for this selection.
          overflow = true;
          break;
        }
        continued = true;
      } else {
        break;
      }
    }
    if (overflow) return;
  });

  return { page1, page2, overflow };
}


function ScopePdf({ data, contactQrSrc, sample }: ScopePdfProps) {
  const nonEmptyGroups = AREA_ORDER.map((area) => data.groups.find((g) => g.area === area)).filter(
    (g): g is ScopePdfGroup => !!g && g.items.length > 0,
  );
  const isCompact = totalItemCount(nonEmptyGroups) > COMPACT_THRESHOLD;
  const s = isCompact ? compact : spacious;

  // Matches app/cyber-health/pdf-report.tsx's exact working pattern for
  // a `fixed` footer with a real page-number `render` callback — that
  // file's own history found this needs to be a locally-scoped arrow
  // function invoked inline (`{footer()}`), not a separate component
  // invoked as JSX (`<Footer/>`). Switching to that alone did NOT fix
  // it here, though — the footer was still completely absent from the
  // rendered PDF (confirmed via pdftotext, not just eyeballing a
  // screenshot). The actual cause, isolated by testing one change at a
  // time: `lineHeight` directly on the footer's own leaf Text elements
  // (footerLeft/footerRight below) — not just on an ancestor, which is
  // what Cyber Health's comment warns about. Removing lineHeight from
  // those two leaf styles specifically (they're single-line labels,
  // don't need it) made the footer render correctly, verified via
  // pdftotext showing the real text and pdfinfo/pdftoppm showing it on
  // every page. A stricter version of the same underlying
  // @react-pdf/renderer issue, not a new unrelated bug.
  const footer = () => (
    <View style={s.footer} fixed>
      <Text style={s.footerLeft}>CONFIDENTIAL{sample ? " / FICTIONAL DESIGN SAMPLE" : ""}</Text>
      <Text style={s.footerRight} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
    </View>
  );

  const header = () => (
    <View style={s.header}>
      <View>
        <Text style={s.wordmark}>ORAGROL</Text>
        <Text style={s.wordmarkSub}>GLOBAL</Text>
      </View>
      <Text style={s.headerTag}>MY SCOPE{sample ? " / SAMPLE" : ""}</Text>
    </View>
  );

  const closing = () => (
    <View style={s.closingWrap} wrap={false}>
      <View style={s.closingLeft}>
        <Text style={s.closingLabel}>KEEP YOUR SCOPE. CONNECT WHEN READY.</Text>
        <Text style={s.closingNote}>
          Automatically generated from your selections. This document records your expressed
          interests only; it is not a quotation, service agreement or confirmation of services.
          Final scope requires separate review and agreement. No signature is required.
        </Text>
      </View>
      <View>
        <Image src={contactQrSrc} style={s.qr} />
        <Link src={CONTACT_URL} style={s.qrLink}>
          {CONTACT_DISPLAY}
        </Link>
      </View>
    </View>
  );

  const categoryBar = (num: number, area: ScopeArea, continued: boolean) => (
    <View style={s.categoryBar} wrap={false}>
      <Text style={s.categoryNum}>{String(num).padStart(2, "0")}</Text>
      <Text style={s.categoryTitle}>
        {AREA_LABEL[area]}
        {continued ? " (continued)" : ""}
      </Text>
    </View>
  );

  if (!isCompact) {
    // Small selection: single Page, react-pdf's own auto-flow. Matches
    // the approved 1-page sample exactly when content is this short;
    // if it does spill to a second page (a borderline-sized selection,
    // just over the spacious layout's natural capacity but under
    // COMPACT_THRESHOLD), the continuation has no repeated heading —
    // that requirement was specified for the compact/dense case
    // specifically. Genuinely borderline-sized selections are a real
    // remaining edge case, not covered by either the spacious or
    // compact path precisely; flagged rather than silently assumed
    // fine.
    return (
      <Document>
        <Page size="A4" style={s.page} wrap>
          {header()}
          <Text style={s.heading}>My scope.</Text>
          <Text style={s.intro}>Your selected items. In one place.</Text>
          <View style={s.topRule} />
          <ClientBlock d={data} s={s} />
          {nonEmptyGroups.map((group, gi) => (
            <View key={group.area}>
              {categoryBar(gi + 1, group.area, false)}
              <View style={s.colHeadRow} wrap={false}>
                <Text style={s.colHeadCode}>ITEM CODE</Text>
                <Text style={s.colHeadName}>SELECTED ITEM</Text>
              </View>
              {group.items.map((item) => (
                <View style={spacious.itemRow} key={item.code} wrap={false}>
                  <Text style={spacious.itemCode}>{item.code}</Text>
                  <Text style={spacious.itemName}>{item.name}</Text>
                </View>
              ))}
            </View>
          ))}
          {closing()}
          <View style={s.footerRule} />
          {footer()}
        </Page>
      </Document>
    );
  }

  // Compact/dense selection: explicit two-page manual layout so a
  // category that spans the page boundary gets its heading repeated on
  // page 2 — see layoutCompactPages's own comment for why this can't
  // just be react-pdf auto-flow.
  const { page1, page2, overflow } = layoutCompactPages(nonEmptyGroups);
  if (overflow) {
    // Never silently drop items to make two pages "work" — that's
    // exactly what the spec forbids ("do not silently cap selections
    // or hide overflow"). scopePdfWouldOverflowTwoPages should be
    // checked by the caller BEFORE calling ScopePdf so this is never
    // reached in production; throwing here is a hard backstop, not
    // the intended handling path.
    throw new Error(
      `ScopePdf: ${totalItemCount(nonEmptyGroups)} items do not fit in two pages at compact density. ` +
        `Call scopePdfWouldOverflowTwoPages() before rendering and handle this as a real decision, not a render-time surprise.`,
    );
  }

  const renderSections = (sections: CompactSection[]) =>
    sections.map((section, i) => (
      <View key={`${section.area}-${i}`}>
        {categoryBar(section.num, section.area, section.continued)}
        <View style={compact.itemGrid}>
          {section.itemRows.map((row, ri) => (
            <React.Fragment key={ri}>
              {row.map((item) => (
                <View style={compact.itemCell} key={item.code} wrap={false}>
                  <Text style={compact.itemCellCode}>{item.code}</Text>
                  <Text style={compact.itemCellName}>{item.name}</Text>
                </View>
              ))}
            </React.Fragment>
          ))}
        </View>
      </View>
    ));

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {header()}
        <Text style={s.heading}>My scope.</Text>
        <Text style={s.intro}>Your selected items. In one place.</Text>
        <View style={s.topRule} />
        <ClientBlock d={data} s={s} />
        {renderSections(page1)}
        {page2.length === 0 && closing()}
        <View style={s.footerRule} />
        {footer()}
      </Page>
      {page2.length > 0 && (
        <Page size="A4" style={s.page}>
          {header()}
          <Text style={s.fieldValue}>
            {data.date} / {data.reference}
          </Text>
          <View style={s.clientBlockRule} />
          {renderSections(page2)}
          {closing()}
          <View style={s.footerRule} />
          {footer()}
        </Page>
      )}
    </Document>
  );
}

export default ScopePdf;
