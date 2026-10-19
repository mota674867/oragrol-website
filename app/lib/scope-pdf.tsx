import React from "react";
import { Document, Page, Text, View, StyleSheet, Link, Image } from "@react-pdf/renderer";
import { PdfLogo, PdfIconWatermark } from "./pdf-brand";

/**
 * My Scope PDF — per My_Scope_Final_Ready_For_Claude.md Section 3.
 * Fee-free: no prices, totals, Points, risk ratings anywhere in this
 * file. Content only — client block, selected items grouped by area,
 * closing note + QR. Context/timeframe/priority/intent belong in the
 * internal email and HubSpot note, never here (Section 1).
 *
 * REBUILT 2026-10-19 to the standard report style (same as the ODO and
 * Cyber Health PDFs): US Letter, white paper, approved logo header with
 * a Confidential block, icon-only watermark, "Page X of Y" footer. Content
 * is unchanged.
 *
 * Layout: one page for a small selection; up to three pages for a larger
 * one, with each continuation page repeating its date/reference line and
 * any category that continues. The three-page limit is a business rule
 * (scope-worker.ts checks scopePdfWouldOverflowMaxPages() before rendering).
 *
 * Two react-pdf rules from earlier work are respected: no `lineHeight` on
 * `page` itself, and no `lineHeight` on the fixed footer's own Text styles.
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
   * SAMPLE" to the footer. Production callers must leave this false — there
   * is no default so a caller can't forget to set it.
   */
  sample: boolean;
};

/** Maximum pages for a large selection. Beyond this, the worker flags the job for manual review. */
export const SCOPE_PDF_MAX_PAGES = 3;

/**
 * Exported so the scope worker can check this BEFORE generating a PDF and
 * handle an overflow as a real decision, rather than the PDF silently
 * dropping items. Measured against the actual layout below.
 */
export function scopePdfWouldOverflowMaxPages(groups: ScopePdfGroup[]): boolean {
  const nonEmpty = AREA_ORDER.map((area) => groups.find((g) => g.area === area)).filter(
    (g): g is ScopePdfGroup => !!g && g.items.length > 0,
  );
  if (totalItemCount(nonEmpty) <= COMPACT_THRESHOLD) return false;
  return layoutPages(nonEmpty).overflow;
}

const AREA_LABEL: Record<ScopeArea, string> = {
  Cybersecurity: "Cybersecurity",
  Automation: "Business Automation",
  "OR ONE": "OR ONE",
};
const AREA_ORDER: ScopeArea[] = ["Cybersecurity", "Automation", "OR ONE"];

// Palette from the standard PDF mockup (dashboard pdf.css), shared with ODO and Cyber Health.
const INK = "#141719";
const GREY = "#5B6770";
const RULE = "#D5D8DA";
const TRACK = "#E3E6E8";
const TEAL = "#00758F";
const BODY = "#2a3236";
const WATERMARK = "#F1F2F2";
const CONTACT_URL = "https://orgro.ca/contact";
const CONTACT_DISPLAY = "orgro.ca/contact";

// Above this many total selected items, switch from the one-page layout to
// the multi-page layout. Measured against real renders (scope-pdf.render-test.ts).
const COMPACT_THRESHOLD = 14;

// Letter page (612 x 792 pt). Header and footer are absolute; the body
// reserves space for them with paddingTop / paddingBottom.
const PAGE_H = 792;
const PAD_TOP = 124;
const PAD_BOTTOM = 84;
const BODY_H = PAGE_H - PAD_TOP - PAD_BOTTOM; // 584 pt usable per page

const base = StyleSheet.create({
  page: { fontFamily: "Helvetica", fontSize: 8.6, color: INK, backgroundColor: "#FFFFFF", paddingTop: PAD_TOP, paddingBottom: PAD_BOTTOM, paddingHorizontal: 42 },
  header: { position: "absolute", top: 30, left: 42, right: 42, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", borderBottomWidth: 1.5, borderBottomColor: INK, paddingBottom: 9 },
  meta: { textAlign: "right", fontSize: 7.5, color: GREY },
  metaStrong: { color: INK, fontFamily: "Helvetica-Bold" },
  footer: { position: "absolute", bottom: 26, left: 42, right: 42, borderTopWidth: 1, borderTopColor: INK, paddingTop: 7, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  footerText: { width: "86%", fontSize: 6.3, color: GREY },
  footerStrong: { color: INK, fontFamily: "Helvetica-Bold" },
  footerPage: { fontSize: 7, color: INK, fontFamily: "Helvetica-Bold" },
  h1: { fontSize: 21, fontFamily: "Helvetica-Bold", letterSpacing: -0.3, marginTop: 6, marginBottom: 2 },
  intro: { fontSize: 9.75, color: GREY, marginBottom: 12 },
  label: { fontSize: 6.8, letterSpacing: 0.9, color: GREY, marginBottom: 2 },
  clientGrid: { borderWidth: 1, borderColor: RULE, borderRadius: 3, marginBottom: 6 },
  clientRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: RULE },
  clientCell: { flex: 1, paddingVertical: 6, paddingHorizontal: 9, borderRightWidth: 1, borderRightColor: RULE },
  clientCellLast: { flex: 1, paddingVertical: 6, paddingHorizontal: 9 },
  clientValue: { fontSize: 9, fontFamily: "Helvetica-Bold" },
  clientValueLg: { fontSize: 11, fontFamily: "Helvetica-Bold" },
  // Category heading and item table
  cat: { flexDirection: "row", alignItems: "baseline", marginTop: 12, marginBottom: 5 },
  catNum: { fontSize: 8.25, color: TEAL, fontFamily: "Helvetica-Bold", marginRight: 8 },
  catTitle: { fontSize: 9.75, fontFamily: "Helvetica-Bold" },
  colHead: { flexDirection: "row", borderTopWidth: 1.5, borderTopColor: INK, borderBottomWidth: 1, borderBottomColor: RULE, paddingVertical: 4 },
  colHeadCode: { width: "28%", fontSize: 6.8, letterSpacing: 0.9, color: GREY },
  colHeadName: { width: "72%", fontSize: 6.8, letterSpacing: 0.9, color: GREY },
  row: { flexDirection: "row", paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: TRACK },
  rowCode: { width: "28%", fontSize: 8.4, color: GREY },
  rowName: { width: "72%", fontSize: 9.2, color: BODY },
  // Compact (two-column) item grid
  grid: { flexDirection: "row", flexWrap: "wrap" },
  gridCell: { width: "50%", flexDirection: "row", paddingVertical: 4, paddingRight: 10, borderBottomWidth: 1, borderBottomColor: TRACK },
  gridCode: { width: "34%", fontSize: 7.8, color: GREY },
  gridName: { width: "66%", fontSize: 8.4, color: BODY },
  // Closing
  closing: { marginTop: 14, flexDirection: "row", borderTopWidth: 1.5, borderTopColor: INK, paddingTop: 10 },
  closingText: { width: "66%", paddingRight: 14 },
  closingLabel: { fontSize: 8.4, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  closingNote: { fontSize: 7.8, color: GREY, lineHeight: 1.45 },
  qrBox: { width: "34%", alignItems: "center" },
  qr: { width: 72, height: 72 },
  qrLink: { fontSize: 7.5, color: TEAL, textAlign: "center", marginTop: 4, textDecoration: "none" },
  repeatRef: { fontSize: 8, color: GREY, marginBottom: 8 },
});

function Watermark() {
  return (
    <View fixed style={{ position: "absolute", left: 145, top: 258, width: 322, height: 322 }}>
      <PdfIconWatermark size={322} color={WATERMARK} />
    </View>
  );
}

function Header({ sample }: { sample: boolean }) {
  return (
    <View style={base.header} fixed>
      <PdfLogo width={37.5} />
      <View style={base.meta}>
        <Text style={base.metaStrong}>Confidential</Text>
        <Text style={base.metaStrong}>My Scope{sample ? " · Sample" : ""}</Text>
      </View>
    </View>
  );
}

function Footer({ sample, reference }: { sample: boolean; reference: string }) {
  return (
    <View style={base.footer} fixed>
      <Text style={base.footerText}>
        <Text style={base.footerStrong}>Confidential{sample ? " · Fictional design sample" : ""}.</Text> This document records your expressed interests only. It is not a quotation, service agreement or confirmation of services.{"\n"}
        Reference {reference}
      </Text>
      <Text style={base.footerPage} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
    </View>
  );
}

function ClientBlock({ d }: { d: ScopePdfData }) {
  return (
    <View style={base.clientGrid} wrap={false}>
      <View style={base.clientRow}>
        <View style={[base.clientCell, { flex: 1.4 }]}>
          <Text style={base.label}>COMPANY</Text>
          <Text style={base.clientValueLg}>{d.company}</Text>
        </View>
        <View style={base.clientCellLast}>
          <Text style={base.label}>DATE / REFERENCE</Text>
          <Text style={base.clientValue}>{d.date} / {d.reference}</Text>
        </View>
      </View>
      <View style={base.clientRow}>
        <View style={base.clientCell}>
          <Text style={base.label}>FULL NAME</Text>
          <Text style={base.clientValue}>{d.name}</Text>
        </View>
        <View style={base.clientCell}>
          <Text style={base.label}>PHONE NUMBER</Text>
          <Text style={base.clientValue}>{d.phone}</Text>
        </View>
        <View style={base.clientCellLast}>
          <Text style={base.label}>EMAIL ADDRESS</Text>
          <Text style={base.clientValue}>{d.email}</Text>
        </View>
      </View>
    </View>
  );
}

function Closing({ contactQrSrc }: { contactQrSrc: string }) {
  return (
    <View style={base.closing} wrap={false}>
      <View style={base.closingText}>
        <Text style={base.closingLabel}>Keep your scope. Connect when ready.</Text>
        <Text style={base.closingNote}>
          Automatically generated from your selections. This document records your expressed interests only; it is not a
          quotation, service agreement or confirmation of services. Final scope requires separate review and agreement. No
          signature is required.
        </Text>
      </View>
      <View style={base.qrBox}>
        <Image src={contactQrSrc} style={base.qr} />
        <Link src={CONTACT_URL} style={base.qrLink}>{CONTACT_DISPLAY}</Link>
      </View>
    </View>
  );
}

function CategoryHeading({ num, area, continued }: { num: number; area: ScopeArea; continued: boolean }) {
  return (
    <View style={base.cat} wrap={false} minPresenceAhead={60}>
      <Text style={base.catNum}>{String(num).padStart(2, "0")}</Text>
      <Text style={base.catTitle}>
        {AREA_LABEL[area]}
        {continued ? " (continued)" : ""}
      </Text>
    </View>
  );
}

function totalItemCount(groups: ScopePdfGroup[]): number {
  return groups.reduce((n, g) => n + g.items.length, 0);
}

// --- Manual pagination for large selections -------------------------------
// A category can continue onto the next page, and its heading is repeated
// there, so the split is computed by hand instead of relying on auto-flow.
// Heights are measured from the styles above (font size x line height +
// padding + border, in points) and checked against real renders.
const GRID_ROW_H = 19; // one two-item grid row (4 + 4 padding, ~8.4pt text, 1pt border)
const CAT_H = 30; // category heading incl. top margin
const COL_HEAD_H = 22; // column header row
const CLIENT_BLOCK_H = 150; // page-1 title, intro and client grid
const CONT_REF_H = 26; // repeated date/reference line on continuation pages
const CLOSING_H = 110; // closing block incl. QR

type CompactSection = { area: ScopeArea; num: number; continued: boolean; itemRows: ScopePdfItem[][] };
type ScopeLayout = { pages: CompactSection[][]; closingOnOwnPage: boolean; overflow: boolean };

function toItemRows(items: ScopePdfItem[]): ScopePdfItem[][] {
  const rows: ScopePdfItem[][] = [];
  for (let i = 0; i < items.length; i += 2) rows.push(items.slice(i, i + 2));
  return rows;
}

/**
 * Splits groups across up to SCOPE_PDF_MAX_PAGES pages. Never splits a
 * two-item grid row. The closing block goes on the last page when it fits,
 * otherwise on its own page if that is still within the maximum.
 */
function layoutPages(groups: ScopePdfGroup[]): ScopeLayout {
  const pages: CompactSection[][] = [[]];
  let budget = BODY_H - CLIENT_BLOCK_H;
  let overflow = false;

  const newPage = () => {
    pages.push([]);
    budget = BODY_H - CONT_REF_H;
  };

  groups.forEach((group, gi) => {
    const allRows = toItemRows(group.items);
    let rowIdx = 0;
    let continued = false;
    do {
      // Start a fresh page if the heading and at least one row cannot fit.
      if (budget < CAT_H + COL_HEAD_H + GRID_ROW_H) newPage();
      const section: CompactSection = { area: group.area, num: gi + 1, continued, itemRows: [] };
      budget -= CAT_H + COL_HEAD_H;
      while (rowIdx < allRows.length && budget >= GRID_ROW_H) {
        section.itemRows.push(allRows[rowIdx]);
        budget -= GRID_ROW_H;
        rowIdx++;
      }
      pages[pages.length - 1].push(section);
      if (rowIdx < allRows.length) {
        newPage();
        continued = true;
      }
    } while (rowIdx < allRows.length);
  });

  let closingOnOwnPage = false;
  if (budget < CLOSING_H) {
    if (pages.length < SCOPE_PDF_MAX_PAGES) {
      closingOnOwnPage = true;
      pages.push([]);
    } else {
      overflow = true;
    }
  }
  if (pages.length > SCOPE_PDF_MAX_PAGES) overflow = true;
  return { pages, closingOnOwnPage, overflow };
}

function ScopePdf({ data, contactQrSrc, sample }: ScopePdfProps) {
  const nonEmptyGroups = AREA_ORDER.map((area) => data.groups.find((g) => g.area === area)).filter(
    (g): g is ScopePdfGroup => !!g && g.items.length > 0,
  );
  const isCompact = totalItemCount(nonEmptyGroups) > COMPACT_THRESHOLD;

  if (!isCompact) {
    return (
      <Document title="ORAGROL My Scope" author="ORAGROL Global">
        <Page size="LETTER" style={base.page}>
          <Watermark />
          <Header sample={sample} />
          <Footer sample={sample} reference={data.reference} />
          <Text style={base.h1}>My scope.</Text>
          <Text style={base.intro}>Your selected items. In one place.</Text>
          <ClientBlock d={data} />
          {nonEmptyGroups.map((group, gi) => (
            <View key={group.area}>
              <CategoryHeading num={gi + 1} area={group.area} continued={false} />
              <View style={base.colHead} wrap={false}>
                <Text style={base.colHeadCode}>ITEM CODE</Text>
                <Text style={base.colHeadName}>SELECTED ITEM</Text>
              </View>
              {group.items.map((item) => (
                <View style={base.row} key={item.code} wrap={false}>
                  <Text style={base.rowCode}>{item.code}</Text>
                  <Text style={base.rowName}>{item.name}</Text>
                </View>
              ))}
            </View>
          ))}
          <Closing contactQrSrc={contactQrSrc} />
        </Page>
      </Document>
    );
  }

  const layout = layoutPages(nonEmptyGroups);
  if (layout.overflow) {
    // Never silently drop items to make the pages "work". scopePdfWouldOverflowMaxPages
    // is checked by the caller before rendering; this throw is a backstop only.
    throw new Error(
      `ScopePdf: ${totalItemCount(nonEmptyGroups)} items do not fit in ${SCOPE_PDF_MAX_PAGES} pages. Call scopePdfWouldOverflowMaxPages() before rendering and handle this as a real decision.`,
    );
  }

  const renderSections = (sections: CompactSection[]) =>
    sections.map((section, i) => (
      <View key={`${section.area}-${i}`}>
        <CategoryHeading num={section.num} area={section.area} continued={section.continued} />
        <View style={base.colHead} wrap={false}>
          <Text style={base.colHeadCode}>ITEM CODE</Text>
          <Text style={base.colHeadName}>SELECTED ITEM</Text>
        </View>
        <View style={base.grid}>
          {section.itemRows.map((row, ri) => (
            <React.Fragment key={ri}>
              {row.map((item) => (
                <View style={base.gridCell} key={item.code} wrap={false}>
                  <Text style={base.gridCode}>{item.code}</Text>
                  <Text style={base.gridName}>{item.name}</Text>
                </View>
              ))}
            </React.Fragment>
          ))}
        </View>
      </View>
    ));

  const pageCount = layout.pages.length;
  return (
    <Document title="ORAGROL My Scope" author="ORAGROL Global">
      {layout.pages.map((sections, pi) => (
        <Page key={pi} size="LETTER" style={base.page}>
          <Watermark />
          <Header sample={sample} />
          <Footer sample={sample} reference={data.reference} />
          {pi === 0 ? (
            <>
              <Text style={base.h1}>My scope.</Text>
              <Text style={base.intro}>Your selected items. In one place.</Text>
              <ClientBlock d={data} />
            </>
          ) : (
            <Text style={base.repeatRef}>{data.date} / {data.reference}</Text>
          )}
          {renderSections(sections)}
          {pi === pageCount - 1 && !layout.closingOnOwnPage ? <Closing contactQrSrc={contactQrSrc} /> : null}
        </Page>
      ))}
      {layout.closingOnOwnPage ? (
        <Page size="LETTER" style={base.page}>
          <Watermark />
          <Header sample={sample} />
          <Footer sample={sample} reference={data.reference} />
          <Text style={base.repeatRef}>{data.date} / {data.reference}</Text>
          <Closing contactQrSrc={contactQrSrc} />
        </Page>
      ) : null}
    </Document>
  );
}

export default ScopePdf;
