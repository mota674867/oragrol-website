import { Document, Packer, Paragraph, TextRun, HeadingLevel, BorderStyle } from "docx";
import type { Dossier, DossierCompetitor, DossierFinding } from "./odo-outbound";

// Outbound dossier as an editable Word file — internal, for ORAGROL only.
// Built in-process (no vendor cost) and attached to the same email as the
// PDF; also downloadable from the private outbound tool page.

const ORANGE = "DB5227";
const GREY = "666666";

const h = (text: string) =>
  new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 100 }, border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: ORANGE, space: 2 } }, children: [new TextRun({ text, bold: true, color: ORANGE, size: 24 })] });
const p = (text: string, o: { bold?: boolean; color?: string; size?: number } = {}) =>
  new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text, bold: o.bold, color: o.color, size: o.size })] });
const label = (c: DossierCompetitor["confidence"]) => (c === "verified" ? "VERIFIED" : c === "likely" ? "LIKELY - not fully confirmed" : "UNVERIFIED - named in public search results, check before use");
const strip = (t: string) => t.replace(/^[✓✗]\s*/, "");

function finding(f: DossierFinding): Paragraph[] {
  return [
    p(`[${f.severity.toUpperCase()} - confidence ${f.confidence}] ${strip(f.fact)}`, { bold: true }),
    ...(f.proof ? [p(`Proof: ${strip(f.proof).slice(0, 400)}`, { color: GREY, size: 18 })] : []),
    p(`Source: ${f.source} - checked ${f.checkedAt.slice(0, 10)}`, { color: GREY, size: 18 }),
  ];
}

export function buildOutboundDocument(d: Dossier): Document {
  const body: Paragraph[] = [
    p("ORAGROL - ODO OUTBOUND DOSSIER (INTERNAL)", { bold: true, color: ORANGE, size: 18 }),
    new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun({ text: d.company, bold: true })] }),
    p(`${d.website} - Industry: ${d.industry ?? "unknown"} - Size: ${d.businessSize ?? "unknown"}`, { color: GREY }),
    p(`Run ${d.runAt.slice(0, 10)} - AI cost $${d.aiCostUsd.toFixed(4)}`, { color: GREY }),
    p(d.notice, { color: GREY, size: 18 }),

    h("Company snapshot"),
    p(d.snapshot?.description ?? "Not enough site text to build a snapshot."),
    ...(d.snapshot ? [p(`Primary focus: ${d.snapshot.focus}`, { bold: true })] : []),

    h(`Competitors (${d.competitors.length})`),
    ...(d.competitors.length
      ? d.competitors.flatMap((c) => [
          p(`${c.name}  [${label(c.confidence)}]`, { bold: true }),
          p(`What they do: ${c.jobDescription}`),
          p(`Website: ${c.website ?? "-"}   Phone: ${c.phone ?? "-"}   Email: ${c.email ?? "not found publicly"}`, { color: GREY, size: 18 }),
        ])
      : [p("None found near this business.")]),

    h("Best-matching ORAGROL security services"),
    ...(d.recommendations.length
      ? d.recommendations.flatMap((r, i) => [
          p(`${i + 1}. ${r.name}  [${r.group === "security" ? "Security" : "Automation"} - ${r.tier === "recommended" ? "RECOMMENDED" : "worth exploring"}]`, { bold: true }),
          p(`Why: ${r.reason}`),
        ])
      : [p("No strong match from public evidence alone - a discovery conversation would be needed.")]),

    h("Best-matching package (Business Automation / OR ONE)"),
    ...(d.automationLane
      ? [p(`${d.automationLane.name}${d.automationLane.tagline ? ` - ${d.automationLane.tagline}` : ""}`, { bold: true }), p(`Why: ${d.automationLane.reason}`)]
      : [p("No clear automation package from public evidence alone - a discovery conversation would be needed.")]),

    h("Posture and automation at a glance"),
    p(`Cybersecurity posture: ${d.posture.summary}`, { bold: true }),
    ...d.posture.highlights.map((x) => p(`${x.startsWith("✗") ? "Gap" : "Strength"}: ${strip(x)}`)),
    p(`AI / automation: ${d.automation.detected.length ? d.automation.detected.join(", ") : "none found"}`, { bold: true }),
    p(d.automation.note, { color: GREY, size: 18 }),
  ];

  if (d.changes) {
    const list = (title: string, xs: string[]) => [p(`${title}: ${xs.length ? "" : "none"}`, { bold: true }), ...xs.map((x) => p(`- ${x}`))];
    body.push(h(`Changes since ${d.changes.previousRunAt.slice(0, 10)}`), ...list("New gaps", d.changes.newGaps), ...list("Resolved gaps", d.changes.resolvedGaps), ...list("New strengths", d.changes.newStrengths), ...list("Strengths no longer seen", d.changes.lostStrengths));
  }

  body.push(
    h(`Gaps (${d.gaps.length})`), ...(d.gaps.length ? d.gaps.flatMap(finding) : [p("None found in public evidence.")]),
    h(`Strengths (${d.strengths.length})`), ...(d.strengths.length ? d.strengths.flatMap(finding) : [p("None recorded.")]),
  );
  if (d.context.length) body.push(h("Context"), ...d.context.flatMap(finding));
  if (d.notDetermined.length) body.push(h("Could not be determined"), ...d.notDetermined.map((x) => p(`- ${x}`)));

  return new Document({
    creator: "ORAGROL",
    title: `ODO outbound dossier - ${d.company}`,
    styles: { default: { document: { run: { font: "Calibri", size: 21 } } } },
    sections: [{ children: body }],
  });
}

export async function renderOutboundDocx(d: Dossier): Promise<Buffer> {
  return Packer.toBuffer(buildOutboundDocument(d));
}
