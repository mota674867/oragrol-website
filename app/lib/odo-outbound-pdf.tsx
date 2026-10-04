import React from "react";
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import type { Dossier, DossierCompetitor, DossierFinding } from "./odo-outbound";

// Outbound dossier as a PDF — internal, for ORAGROL only (never a client
// document). Rendered in-process with @react-pdf/renderer, so it costs
// nothing beyond compute; it is attached to the same email as the text
// version. Built-in Helvetica only: no symbols outside basic Latin-1.

const ORANGE = "#db5227";
const s = StyleSheet.create({
  page: { padding: 40, fontSize: 9.5, fontFamily: "Helvetica", color: "#1a1a1a", lineHeight: 1.4 },
  kicker: { fontSize: 8, color: ORANGE, letterSpacing: 1.5, marginBottom: 4 },
  title: { fontSize: 20, fontFamily: "Helvetica-Bold", lineHeight: 1.2, marginBottom: 8 },
  meta: { color: "#555", marginBottom: 2 },
  notice: { marginTop: 8, padding: 8, backgroundColor: "#f3f0ea", fontSize: 8, color: "#444" },
  h2: { marginTop: 16, marginBottom: 6, paddingBottom: 3, borderBottomWidth: 1, borderBottomColor: ORANGE, fontSize: 11, fontFamily: "Helvetica-Bold", color: ORANGE },
  card: { marginBottom: 7, paddingBottom: 6, borderBottomWidth: 0.5, borderBottomColor: "#ddd" },
  bold: { fontFamily: "Helvetica-Bold" },
  muted: { color: "#666", fontSize: 8.5 },
  tag: { fontSize: 7.5, color: "#fff", backgroundColor: "#444", paddingHorizontal: 4, paddingVertical: 1, marginRight: 4 },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 2 },
});

const clean = (t: string) => t.replace(/^[✓✗]\s*/, "").replace(/[^\x20-\x7E -ÿ–—•‘’“”]/g, "");
const label = (c: DossierCompetitor["confidence"]) => (c === "verified" ? "VERIFIED" : c === "likely" ? "LIKELY" : "UNVERIFIED");

function Finding({ f }: { f: DossierFinding }) {
  return (
    <View style={s.card} wrap={false}>
      <View style={s.row}><Text style={s.tag}>{f.severity.toUpperCase()}</Text><Text style={s.muted}>confidence {f.confidence}</Text></View>
      <Text>{clean(f.fact)}</Text>
      {f.proof ? <Text style={s.muted}>Proof: {clean(f.proof).slice(0, 300)}</Text> : null}
      <Text style={s.muted}>Source: {f.source} - checked {f.checkedAt.slice(0, 10)}</Text>
    </View>
  );
}

export function OutboundDossierPdf({ d }: { d: Dossier }) {
  return (
    <Document title={`ODO outbound dossier - ${d.company}`} author="ORAGROL">
      <Page size="A4" style={s.page}>
        <Text style={s.kicker}>ORAGROL - ODO OUTBOUND DOSSIER (INTERNAL)</Text>
        <Text style={s.title}>{clean(d.company)}</Text>
        <Text style={s.meta}>{d.website} - Industry: {clean(d.industry ?? "unknown")} - Size: {d.businessSize ?? "unknown"}</Text>
        <Text style={s.meta}>Run {d.runAt.slice(0, 10)} - AI cost ${d.aiCostUsd.toFixed(4)}</Text>
        <Text style={s.notice}>{d.notice}</Text>

        <Text style={s.h2}>Company snapshot</Text>
        <Text>{clean(d.snapshot?.description ?? "Not enough site text to build a snapshot.")}</Text>
        {d.snapshot ? <Text style={[s.bold, { marginTop: 5 }]}>Primary focus: {clean(d.snapshot.focus)}</Text> : null}

        <Text style={s.h2}>Best-matching ORAGROL services</Text>
        {d.recommendations.length ? d.recommendations.map((r, i) => (
          <View key={r.name} style={s.card} wrap={false}>
            <Text style={s.bold}>{i + 1}. {r.name}</Text>
            <Text style={s.muted}>{r.group === "security" ? "Security" : "Automation"} - {r.tier === "recommended" ? "RECOMMENDED" : "worth exploring"}</Text>
            <Text>{clean(r.reason)}</Text>
          </View>
        )) : <Text>No strong match from public evidence alone - a discovery conversation would be needed.</Text>}

        <Text style={s.h2}>Posture and automation at a glance</Text>
        <Text style={s.bold}>Cybersecurity posture: {d.posture.summary}</Text>
        {d.posture.highlights.map((h) => <Text key={h}>{h.startsWith("✗") ? "Gap: " : "Strength: "}{clean(h)}</Text>)}
        <Text style={[s.bold, { marginTop: 6 }]}>AI / automation: {d.automation.detected.length ? d.automation.detected.join(", ") : "none found"}</Text>
        <Text style={s.muted}>{d.automation.note}</Text>
      </Page>

      <Page size="A4" style={s.page}>
        <Text style={s.h2}>Competitors ({d.competitors.length})</Text>
        {d.competitors.length ? d.competitors.map((c) => (
          <View key={c.name} style={s.card} wrap={false}>
            <View style={s.row}><Text style={s.bold}>{clean(c.name)}</Text><Text style={[s.muted, { marginLeft: 6 }]}>{label(c.confidence)}</Text></View>
            <Text>What they do: {clean(c.jobDescription)}</Text>
            <Text style={s.muted}>Website: {c.website ?? "-"}   Phone: {c.phone ?? "-"}   Email: {c.email ?? "not found publicly"}</Text>
            {c.confidence === "unverified" ? <Text style={s.muted}>Named in public search results only - check before using.</Text> : null}
          </View>
        )) : <Text>None found near this business.</Text>}

        {d.changes ? (
          <View>
            <Text style={s.h2}>Changes since {d.changes.previousRunAt.slice(0, 10)}</Text>
            <Text>New gaps: {d.changes.newGaps.join("; ") || "none"}</Text>
            <Text>Resolved gaps: {d.changes.resolvedGaps.join("; ") || "none"}</Text>
            <Text>New strengths: {d.changes.newStrengths.join("; ") || "none"}</Text>
            <Text>Strengths no longer seen: {d.changes.lostStrengths.join("; ") || "none"}</Text>
          </View>
        ) : <Text style={[s.muted, { marginTop: 8 }]}>First run for this company - no earlier dossier to compare.</Text>}

        <Text style={s.h2}>Gaps ({d.gaps.length})</Text>
        {d.gaps.length ? d.gaps.map((f) => <Finding key={f.key} f={f} />) : <Text>None found in public evidence.</Text>}

        <Text style={s.h2}>Strengths ({d.strengths.length})</Text>
        {d.strengths.length ? d.strengths.map((f) => <Finding key={f.key} f={f} />) : <Text>None recorded.</Text>}

        <Text style={s.h2}>Could not be determined ({d.notDetermined.length})</Text>
        {d.notDetermined.length ? d.notDetermined.map((n) => <Text key={n}>- {clean(n)}</Text>) : <Text>Everything checked returned an answer.</Text>}
      </Page>
    </Document>
  );
}

export async function renderOutboundPdf(d: Dossier): Promise<Buffer> {
  return renderToBuffer(<OutboundDossierPdf d={d} />);
}
