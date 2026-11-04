import React from "react";
import { Document, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";
import type { CopySection } from "./copy-sections.ts";
import type { FormDefinition } from "./types.ts";
import { PdfLogo } from "../pdf-brand.tsx";

// The client's own PDF copy of what they submitted: their answers in the order they saw them. Built-in Helvetica only.
const ORANGE = "#EF4D00";
const s = StyleSheet.create({
  page: { padding: 40, fontSize: 9.5, fontFamily: "Helvetica", color: "#141719", lineHeight: 1.4 },
  title: { fontSize: 18, fontFamily: "Helvetica-Bold", marginTop: 22, marginBottom: 4 },
  meta: { color: "#555", marginBottom: 10 },
  h2: { marginTop: 14, marginBottom: 6, paddingBottom: 3, borderBottomWidth: 1, borderBottomColor: ORANGE, fontSize: 11, fontFamily: "Helvetica-Bold" },
  q: { color: "#555", fontSize: 8.5, marginTop: 5 },
  foot: { position: "absolute", bottom: 20, left: 40, right: 40, fontSize: 7.5, color: "#777" },
});

const clean = (t: string) => t.replace(/[^\x20-\x7E -ÿ]/g, "");
export async function renderClientCopy(def: FormDefinition, sections: readonly CopySection[], reference: string): Promise<Buffer> {
  const doc = (
    <Document title={`${def.name} - ${reference}`}>
      <Page size="A4" style={s.page}>
        <PdfLogo width={52} />
        <Text style={s.title}>{clean(def.name)}</Text>
        <Text style={s.meta}>Your copy of what you submitted. Reference {clean(reference)}.</Text>
        {sections.map((sec) => (
          <View key={sec.title}>
            <Text style={s.h2}>{clean(sec.title)}</Text>
            {sec.rows.map((r, i) => (<View key={i} wrap={false}><Text style={s.q}>{clean(r.q)}</Text><Text>{clean(r.a)}</Text></View>))}
          </View>
        ))}
        <Text style={s.foot} fixed>ORAGROL Global. This copy is for your records; ORAGROL reviews your answers before anything is proposed.</Text>
      </Page>
    </Document>
  );
  return renderToBuffer(doc);
}
