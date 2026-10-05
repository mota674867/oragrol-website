import React from "react";
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import type { Dossier } from "./odo-outbound";
import { clean, coldEmailObservations, coldEmailRecommendation } from "./odo-outbound-coldemail";

// One-page, prospect-safe PDF for cold-email use. Unlike the internal dossier
// it carries NO competitor details, costs, unverified leads or internal notes:
// only a few plain-language observations from PUBLIC information, one
// recommended ORAGROL package, and a single call to action. Only observed
// (public-evidence) gaps are used, and never worded as an alarm.

const ORANGE = "#db5227";
const s = StyleSheet.create({
  page: { padding: 48, fontSize: 10.5, fontFamily: "Helvetica", color: "#1a1a1a", lineHeight: 1.45 },
  brand: { fontSize: 9, color: ORANGE, letterSpacing: 2, marginBottom: 14 },
  title: { fontSize: 22, fontFamily: "Helvetica-Bold", lineHeight: 1.2, marginBottom: 6 },
  sub: { color: "#555", marginBottom: 18 },
  h2: { marginTop: 16, marginBottom: 7, paddingBottom: 3, borderBottomWidth: 1, borderBottomColor: ORANGE, fontSize: 12, fontFamily: "Helvetica-Bold", color: ORANGE },
  item: { marginBottom: 8 },
  bold: { fontFamily: "Helvetica-Bold" },
  muted: { color: "#666", fontSize: 8.5 },
  box: { marginTop: 4, padding: 12, backgroundColor: "#f3f0ea" },
  cta: { marginTop: 18, padding: 14, backgroundColor: ORANGE, color: "#fff" },
});

export function ColdEmailPdf({ d }: { d: Dossier }) {
  const obs = coldEmailObservations(d);
  const rec = coldEmailRecommendation(d);
  return (
    <Document title={`A few observations for ${d.company}`} author="ORAGROL Global">
      <Page size="A4" style={s.page}>
        <Text style={s.brand}>ORAGROL GLOBAL - TORONTO</Text>
        <Text style={s.title}>A few observations for {clean(d.company)}</Text>
        <Text style={s.sub}>Based only on public information about {d.website}. Nothing was accessed, tested or changed on your systems.</Text>

        {d.snapshot ? (
          <View>
            <Text style={s.h2}>What we understand about you</Text>
            <Text>{clean(d.snapshot.description.split(/(?<=[.!?])\s+/).slice(0, 2).join(" "))}</Text>
          </View>
        ) : null}

        <Text style={s.h2}>What we noticed</Text>
        {obs.length ? obs.map((o, i) => (
          <View key={i} style={s.item} wrap={false}><Text><Text style={s.bold}>{i + 1}.  </Text>{o}</Text></View>
        )) : <Text>Your public setup looks reasonably tidy from the outside. A short conversation would show where a business like yours usually gains the most.</Text>}
        {obs.length ? <Text style={s.muted}>These are visible from the outside and are common in growing businesses. They are worth a look, not a cause for alarm.</Text> : null}

        {rec ? (
          <View>
            <Text style={s.h2}>Where we would start</Text>
            <View style={s.box}>
              <Text style={s.bold}>{clean(rec.name)}</Text>
              <Text style={{ marginTop: 3 }}>{clean(rec.why)}</Text>
            </View>
          </View>
        ) : null}

        <View style={s.cta}>
          <Text style={{ fontSize: 13, fontFamily: "Helvetica-Bold", marginBottom: 3 }}>Free 15-minute call</Text>
          <Text>We walk through these points and what they mean for your business. No obligation. Reply to the email or write to info@orgro.ca. You can also run a free, private business scan at orgro.ca/scan.</Text>
        </View>

        <Text style={[s.muted, { marginTop: 14 }]}>ORAGROL Global - managed cybersecurity and AI business automation, Toronto, Canada - orgro.ca</Text>
      </Page>
    </Document>
  );
}

export async function renderColdEmailPdf(d: Dossier): Promise<Buffer> {
  return renderToBuffer(<ColdEmailPdf d={d} />);
}
