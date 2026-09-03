import { Circle, Document, Image, Page, StyleSheet, Svg, Text, View } from "@react-pdf/renderer";
import type { CyberHealthReport } from "../lib/cyber-health-report";
import { categoryIdsForGroup, type Finding, type Severity } from "./report-data";

/**
 * The Cyber Health PDF report — server-side only (rendered via
 * `renderToBuffer` in app/api/cyber-health/route.ts), never imported into
 * a client bundle. Content comes entirely from the `CyberHealthReport`
 * the server already computed from the raw submission — no client-
 * supplied score/copy is trusted here (see cyber-health-report.ts).
 *
 * Visual reference: the Tally/n8n-era PDF report the client shared
 * (9 pages: cover, summary, executive dashboard, category dashboard,
 * top risks, quick wins + recommendations, 90-day roadmap + package,
 * why-Oragrol + booking CTA). Reproduced here with the site's actual
 * brand palette (#ef4d00 orange, not the old report's generic amber)
 * and the real Oragrol ring mark (public/brand/oragrol-ring.svg),
 * rather than a byte-for-byte clone.
 */

const NAVY = "#0d2b4e";
const ORANGE = "#ef4d00";
const INK = "#111315";
const MUTED = "#666a6f";
const BORDER = "#d9d6cd";
const PAPER = "#f6f4ee";
const GREEN = "#1a7f37";
const RED = "#c0392b";

const SEVERITY_COLOR: Record<Severity, string> = {
  Critical: RED,
  High: "#c26a1a",
  Medium: ORANGE,
  Low: GREEN,
};

const styles = StyleSheet.create({
  page: { padding: 0, fontFamily: "Helvetica", fontSize: 10, color: INK },
  body: { paddingHorizontal: 34, paddingBottom: 40 },
  chromeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 34,
    paddingTop: 20,
    paddingBottom: 10,
  },
  chromeHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  chromeHeaderText: { fontSize: 9, letterSpacing: 1, color: NAVY, fontFamily: "Helvetica-Bold" },
  chromeHeaderRight: { fontSize: 8, color: MUTED },
  footer: {
    position: "absolute",
    bottom: 18,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 8,
    color: MUTED,
  },
  h1: { fontSize: 22, fontFamily: "Helvetica-Bold", color: NAVY, marginBottom: 4 },
  h2: { fontSize: 15, fontFamily: "Helvetica-Bold", color: NAVY, marginBottom: 2 },
  muted: { fontSize: 9, color: MUTED },
  card: { borderWidth: 1, borderColor: BORDER, borderRadius: 6, padding: 14, backgroundColor: "#fff", marginBottom: 10 },
  paperCard: { borderWidth: 1, borderColor: BORDER, borderRadius: 6, padding: 14, backgroundColor: PAPER, marginBottom: 10 },
  badge: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: "#fff",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
    letterSpacing: 0.5,
  },
});

function ChromeHeader() {
  return (
    <View style={styles.chromeHeader} fixed>
      <View style={styles.chromeHeaderLeft}>
        <Svg width={12} height={12} viewBox="0 0 150 150">
          <Circle cx={75} cy={75} r={62} fill="none" stroke="#018ABE" strokeWidth={26} strokeDasharray="365 24" transform="rotate(35 75 75)" />
        </Svg>
        <Text style={styles.chromeHeaderText}>ORAGROL GLOBAL</Text>
      </View>
      <Text style={styles.chromeHeaderRight}>Cyber Health Assessment Report</Text>
    </View>
  );
}

// Content length varies with the submission (more failed questions means
// more Recommendation cards, which can overflow a single physical page)
// — a hardcoded "Page X of Y" would repeat the wrong number on any
// overflow page. react-pdf's `render` prop computes the real running
// page number and total across the whole document, overflow included.
function Footer() {
  return (
    <Text
      style={styles.footer}
      fixed
      render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
    />
  );
}

function ScoreGauge({ score, size = 130 }: { score: number; size?: number }) {
  const r = size / 2 - 10;
  const c = 2 * Math.PI * r;
  const filled = (Math.max(0, Math.min(100, score)) / 100) * c;
  const color = score >= 80 ? GREEN : score >= 60 ? ORANGE : score >= 40 ? "#c26a1a" : RED;
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e4e1d9" strokeWidth={12} />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={12}
          strokeDasharray={`${filled} ${c}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={{ position: "absolute", alignItems: "center" }}>
        <Text style={{ fontSize: 30, fontFamily: "Helvetica-Bold", color: NAVY }}>{score}</Text>
        <Text style={{ fontSize: 8, color: MUTED }}>out of 100</Text>
      </View>
    </View>
  );
}

function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <Text style={[styles.badge, { backgroundColor: SEVERITY_COLOR[severity] }]}>{severity.toUpperCase()}</Text>
  );
}

function StatusBadge({ status }: { status: "GOOD" | "CRITICAL" }) {
  return (
    <Text style={[styles.badge, { backgroundColor: status === "GOOD" ? GREEN : RED }]}>{status}</Text>
  );
}

function FindingCard({ f }: { f: Finding }) {
  return (
    <View style={styles.card} wrap={false}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <Text style={{ fontSize: 11, fontFamily: "Helvetica-Bold", color: INK, maxWidth: 380 }}>{f.title}</Text>
        <SeverityBadge severity={f.severity} />
      </View>
      <View style={{ gap: 3 }}>
        <Text style={styles.muted}>
          <Text style={{ fontFamily: "Helvetica-Bold" }}>BUSINESS IMPACT  </Text>
          {f.businessImpact}
        </Text>
        <Text style={styles.muted}>
          <Text style={{ fontFamily: "Helvetica-Bold" }}>LIKELIHOOD  </Text>
          {f.likelihood}
        </Text>
        <Text style={styles.muted}>
          <Text style={{ fontFamily: "Helvetica-Bold" }}>RECOMMENDED ACTION  </Text>
          {f.action}
        </Text>
        <Text style={styles.muted}>
          <Text style={{ fontFamily: "Helvetica-Bold" }}>ESTIMATED EFFORT  </Text>
          {f.effort}
        </Text>
      </View>
    </View>
  );
}

export function CyberHealthPdf({ report, qrDataUri, bookingUrl }: { report: CyberHealthReport; qrDataUri: string | null; bookingUrl: string }) {
  const dateStr = report.generatedAt.toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" });
  const nextDateStr = report.nextAssessmentAt.toLocaleDateString("en-CA", { year: "numeric", month: "long" });

  return (
    <Document
      title={`Cyber Health Assessment Report — ${report.profile.company}`}
      author="ORAGROL Global"
      subject="Cyber Health Assessment Report"
    >
      {/* Page 1 — Cover */}
      <Page size="A4" style={styles.page}>
        <ChromeHeader />
        <View style={[styles.body, { flexGrow: 1 }]}>
          <View style={{ height: 220, backgroundColor: NAVY, borderRadius: 4, marginBottom: 24 }} />
          <Svg width={64} height={64} viewBox="0 0 150 150" style={{ marginBottom: 18 }}>
            <Circle cx={75} cy={75} r={62} fill="none" stroke="#018ABE" strokeWidth={26} strokeDasharray="365 24" transform="rotate(35 75 75)" />
          </Svg>
          <Text style={{ fontSize: 26, fontFamily: "Helvetica-Bold", color: NAVY, marginBottom: 6 }}>Cyber Health Assessment</Text>
          <Text style={{ fontSize: 11, color: MUTED, letterSpacing: 1, marginBottom: 30 }}>EXECUTIVE CYBERSECURITY RISK ASSESSMENT</Text>
          <Text style={{ fontSize: 9, color: MUTED, letterSpacing: 1, marginBottom: 4 }}>PREPARED FOR</Text>
          <Text style={{ fontSize: 17, fontFamily: "Helvetica-Bold", color: ORANGE, marginBottom: 20 }}>{report.profile.company}</Text>
          <Text style={{ fontSize: 10, color: MUTED, marginBottom: 8 }}>{dateStr}</Text>
          <Text
            style={{
              fontSize: 8,
              color: NAVY,
              borderWidth: 1,
              borderColor: NAVY,
              borderRadius: 10,
              paddingVertical: 3,
              paddingHorizontal: 10,
              alignSelf: "flex-start",
              letterSpacing: 1,
            }}
          >
            CONFIDENTIAL
          </Text>
          <Text style={{ marginTop: "auto", fontSize: 8.5, color: MUTED }}>
            Oragrol Global Inc. · Canadian-Focused Managed Security Services
          </Text>
        </View>
        <Footer />
      </Page>

      {/* Page 2 — Summary */}
      <Page size="A4" style={styles.page}>
        <ChromeHeader />
        <View style={styles.body}>
          <View style={{ height: 200, backgroundColor: NAVY, borderTopLeftRadius: 4, borderTopRightRadius: 4 }} />
          <View style={{ flexDirection: "row", borderWidth: 1, borderColor: BORDER, borderTop: 0 }}>
            <View style={{ flex: 1.2, padding: 18 }}>
              <Text style={{ fontSize: 18, fontFamily: "Helvetica-Bold", color: NAVY, marginBottom: 4 }}>Cyber Health Assessment Report</Text>
              <Text style={{ fontSize: 9.5, color: MUTED, marginBottom: 10 }}>Executive Cybersecurity Risk Assessment</Text>
              <Text style={{ fontSize: 9.5, color: INK, marginBottom: 10, lineHeight: 1.4 }}>
                Understand Your Cyber Risk. Prioritize What Matters. Protect Your Business.
              </Text>
              <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", color: INK }}>Prepared exclusively for {report.profile.company}</Text>
            </View>
            <View style={{ flex: 1, padding: 18, alignItems: "center", borderLeftWidth: 1, borderLeftColor: BORDER }}>
              <ScoreGauge score={report.score} size={110} />
              <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", color: NAVY, marginTop: 6 }}>{report.maturity.toUpperCase()}</Text>
              <View style={{ marginTop: 10, width: "100%", gap: 4 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={styles.muted}>RISK TIER</Text>
                  <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold" }}>{report.tier}</Text>
                </View>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={styles.muted}>ASSESSMENT DATE</Text>
                  <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold" }}>{dateStr}</Text>
                </View>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={styles.muted}>CLIENT REFERENCE</Text>
                  <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold" }}>{report.clientReference}</Text>
                </View>
              </View>
            </View>
          </View>
          <Text style={{ fontSize: 8, color: MUTED, marginTop: 8 }}>
            {report.profile.company} · {report.profile.industry} · {report.profile.employees} employees · Report ID: {report.reportId} · v1.0
          </Text>
        </View>
        <Footer />
      </Page>

      {/* Page 3 — Executive Dashboard */}
      <Page size="A4" style={styles.page}>
        <ChromeHeader />
        <View style={styles.body}>
          <Text style={styles.h1}>Executive Dashboard</Text>
          <Text style={[styles.muted, { marginBottom: 14 }]}>A snapshot of {report.profile.company}&apos;s current cyber health position.</Text>

          <View style={{ flexDirection: "row", gap: 10, marginBottom: 18 }}>
            <View style={[styles.paperCard, { flex: 1, alignItems: "center", borderColor: SEVERITY_COLOR.Medium, marginBottom: 0 }]}>
              <ScoreGauge score={report.score} size={100} />
              <Text style={{ fontSize: 9, color: MUTED, marginTop: 6 }}>CYBER HEALTH SCORE</Text>
            </View>
            <View style={{ flex: 1, gap: 10 }}>
              <View style={[styles.paperCard, { marginBottom: 0 }]}>
                <Text style={styles.muted}>RISK TIER</Text>
                <Text style={{ fontSize: 14, fontFamily: "Helvetica-Bold", color: ORANGE }}>{report.tier}</Text>
              </View>
              <View style={[styles.card, { marginBottom: 0 }]}>
                <Text style={styles.muted}>INDUSTRY</Text>
                <Text style={{ fontSize: 12, fontFamily: "Helvetica-Bold", color: NAVY }}>{report.profile.industry}</Text>
              </View>
            </View>
            <View style={{ flex: 1, gap: 10 }}>
              <View style={[styles.paperCard, { marginBottom: 0 }]}>
                <Text style={styles.muted}>CYBER MATURITY</Text>
                <Text style={{ fontSize: 14, fontFamily: "Helvetica-Bold", color: ORANGE }}>{report.maturity}</Text>
              </View>
              <View style={[styles.card, { marginBottom: 0 }]}>
                <Text style={styles.muted}>COMPANY SIZE</Text>
                <Text style={{ fontSize: 12, fontFamily: "Helvetica-Bold", color: NAVY }}>{report.profile.employees}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.h2}>Client Profile & Reference</Text>
          <View style={[styles.card, { marginTop: 8 }]}>
            <Text style={{ fontSize: 8, color: MUTED, letterSpacing: 1, marginBottom: 2 }}>ORAGROL CLIENT REFERENCE</Text>
            <Text style={{ fontSize: 14, fontFamily: "Helvetica-Bold", color: NAVY, marginBottom: 10 }}>{report.clientReference}</Text>
            {[
              ["COMPANY NAME", report.profile.company],
              ["PRIMARY CONTACT", report.profile.name],
              ["BUSINESS EMAIL", report.profile.email],
              ["PHONE", report.profile.phone],
              ["INDUSTRY", report.profile.industry],
              ["COMPANY SIZE", report.profile.employees],
              ["ASSESSMENT DATE", dateStr],
              ["REPORT VERSION", "v1.0"],
            ].map(([k, v]) => (
              <View key={k} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 5, borderTopWidth: 1, borderTopColor: BORDER }}>
                <Text style={{ fontSize: 8.5, color: MUTED }}>{k}</Text>
                <Text style={{ fontSize: 9.5, color: INK }}>{v}</Text>
              </View>
            ))}
          </View>

          <Text style={[styles.h2, { marginTop: 14 }]}>Business Risk Snapshot</Text>
          <Text style={[styles.muted, { marginBottom: 8 }]}>At-a-glance status across the areas that matter most day-to-day.</Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {report.snapshot.map((s) => (
              <View key={s.label} style={[styles.card, { flex: 1, alignItems: "center", marginBottom: 0 }]}>
                <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", marginBottom: 6 }}>{s.label}</Text>
                <StatusBadge status={s.status} />
              </View>
            ))}
          </View>
        </View>
        <Footer />
      </Page>

      {/* Page 4 — Category Dashboard */}
      <Page size="A4" style={styles.page}>
        <ChromeHeader />
        <View style={styles.body}>
          <Text style={styles.h1}>Category Dashboard</Text>
          <Text style={[styles.muted, { marginBottom: 14 }]}>All 20 assessed categories, grouped by business function.</Text>
          {report.groups.map((g) => {
            const memberIds = categoryIdsForGroup(g.name);
            return (
              <View key={g.name} style={styles.card} wrap={false}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <Text style={{ fontSize: 12, fontFamily: "Helvetica-Bold", color: NAVY }}>{g.name}</Text>
                  <Text
                    style={[
                      styles.badge,
                      { backgroundColor: g.score >= 90 ? GREEN : g.score >= 60 ? ORANGE : g.score >= 40 ? "#c26a1a" : RED },
                    ]}
                  >
                    {g.score}%
                  </Text>
                </View>
                <Text style={[styles.muted, { marginBottom: 8 }]}>{g.description}</Text>
                {report.categoryScores
                  .filter((c) => memberIds.includes(c.id))
                  .map((c) => (
                    <View key={c.id} style={{ flexDirection: "row", alignItems: "center", marginBottom: 5, gap: 8 }}>
                      <Text style={{ fontSize: 8.5, width: 170 }}>{c.name}</Text>
                      <View style={{ flex: 1, height: 5, backgroundColor: "#e4e1d9", borderRadius: 3 }}>
                        <View
                          style={{
                            width: `${Math.round(c.score)}%`,
                            height: 5,
                            backgroundColor: c.score >= 60 ? GREEN : RED,
                            borderRadius: 3,
                          }}
                        />
                      </View>
                      <Text style={{ fontSize: 8, width: 30, textAlign: "right", color: c.score >= 60 ? GREEN : RED }}>
                        {Math.round(c.score)}%
                      </Text>
                    </View>
                  ))}
              </View>
            );
          })}
        </View>
        <Footer />
      </Page>

      {/* Page 5 — Top Business Risks */}
      <Page size="A4" style={styles.page}>
        <ChromeHeader />
        <View style={styles.body}>
          <Text style={styles.h1}>Top Business Risks</Text>
          {report.topRisks.length === 0 ? (
            <Text style={[styles.muted, { marginTop: 8 }]}>No material risks were identified in this assessment — every assessed area scored at or above the healthy threshold.</Text>
          ) : (
            report.topRisks.map((f) => <FindingCard key={f.id} f={f} />)
          )}
        </View>
        <Footer />
      </Page>

      {/* Page 6 — Quick Wins + Recommendations (part 1) */}
      <Page size="A4" style={styles.page}>
        <ChromeHeader />
        <View style={styles.body}>
          <Text style={styles.h2}>Quick Wins</Text>
          <Text style={[styles.muted, { marginBottom: 8 }]}>Low-effort changes with immediate risk reduction.</Text>
          {report.quickWins.length === 0 ? (
            <Text style={[styles.muted, { marginBottom: 14 }]}>No low-effort items outstanding right now.</Text>
          ) : (
            report.quickWins.map((f) => (
              <View key={f.id} style={{ borderWidth: 1, borderColor: GREEN, borderRadius: 6, backgroundColor: "#eef7ee", padding: 10, marginBottom: 8 }} wrap={false}>
                <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold", color: INK, marginBottom: 2 }}>{f.title}</Text>
                <Text style={{ fontSize: 8, color: MUTED }}>
                  Business Benefit: Reduces risk with minimal disruption · Time Required: {f.timeRequired} · Priority: {f.severity === "Critical" || f.severity === "High" ? "High" : "Medium"}
                </Text>
              </View>
            ))
          )}

          <Text style={[styles.h2, { marginTop: 10 }]}>Recommendations</Text>
          {report.allFindings.map((f) => (
            <View key={f.id} style={styles.card} wrap={false}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                <Text style={{ fontSize: 9.5, color: INK, maxWidth: 400 }}>{f.action}</Text>
                <SeverityBadge severity={f.severity} />
              </View>
              <View style={{ flexDirection: "row", gap: 16, marginTop: 6 }}>
                <Text style={styles.muted}>LIKELIHOOD {f.likelihood}</Text>
                <Text style={styles.muted}>EFFORT {f.effort}</Text>
              </View>
            </View>
          ))}
        </View>
        <Footer />
      </Page>

      {/* Page 7 — 90-Day Roadmap + Next Assessment + Package */}
      <Page size="A4" style={styles.page}>
        <ChromeHeader />
        <View style={styles.body}>
          <Text style={styles.h1}>90-Day Cyber Roadmap</Text>
          <Text style={[styles.muted, { marginBottom: 10 }]}>A phased path from assessment to measurable improvement.</Text>
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
            {report.roadmap.map((phase, i) => (
              <View
                key={phase.label}
                style={{
                  flex: 1,
                  borderWidth: 1,
                  borderColor: i === 0 ? RED : i === 1 ? ORANGE : GREEN,
                  borderRadius: 6,
                  padding: 10,
                }}
              >
                <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", color: i === 0 ? RED : i === 1 ? ORANGE : GREEN, marginBottom: 6 }}>
                  {phase.label}
                </Text>
                {phase.items.length === 0 ? (
                  <Text style={{ fontSize: 7.5, color: MUTED }}>Nothing outstanding for this window.</Text>
                ) : (
                  phase.items.map((f) => (
                    <Text key={f.id} style={{ fontSize: 7.5, color: INK, marginBottom: 4 }}>
                      {f.action}
                    </Text>
                  ))
                )}
              </View>
            ))}
          </View>

          <Text style={styles.h2}>Next Assessment Recommendation</Text>
          <View style={[styles.card, { marginTop: 8 }]}>
            <Text style={{ fontSize: 8, color: MUTED, letterSpacing: 1 }}>RECOMMENDED REASSESSMENT</Text>
            <Text style={{ fontSize: 16, fontFamily: "Helvetica-Bold", color: NAVY, marginVertical: 4 }}>{nextDateStr}</Text>
            <Text style={styles.muted}>Cybersecurity is an ongoing process. We recommend reassessing every six months, or sooner after major technology or business changes.</Text>
          </View>

          <Text style={[styles.h2, { marginTop: 10 }]}>Recommended Package</Text>
          <View style={[styles.card, { borderColor: NAVY, marginTop: 8 }]}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <Text style={{ fontSize: 16, fontFamily: "Helvetica-Bold", color: NAVY }}>{report.recommendedPackage}</Text>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={{ fontSize: 7.5, color: MUTED }}>ESTIMATED TIMELINE</Text>
                <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold" }}>{report.packageContent.timeline}</Text>
              </View>
            </View>
            <Text style={{ fontSize: 7.5, color: MUTED, marginBottom: 2 }}>WHY THIS PACKAGE</Text>
            <Text style={{ fontSize: 9, marginBottom: 8 }}>{report.packageContent.why}</Text>
            <Text style={{ fontSize: 7.5, color: MUTED, marginBottom: 2 }}>WHAT&apos;S INCLUDED</Text>
            {report.packageContent.included.map((item) => (
              <Text key={item} style={{ fontSize: 9, marginBottom: 2 }}>• {item}</Text>
            ))}
            <Text style={{ fontSize: 7.5, color: MUTED, marginTop: 6, marginBottom: 2 }}>EXPECTED OUTCOME</Text>
            <Text style={{ fontSize: 9 }}>{report.packageContent.outcome}</Text>
          </View>
        </View>
        <Footer />
      </Page>

      {/* Page 8 — Why Oragrol + CTA */}
      <Page size="A4" style={styles.page}>
        <ChromeHeader />
        <View style={styles.body}>
          <Text style={styles.h1}>Why Oragrol</Text>
          <View style={[styles.card, { marginTop: 8 }]}>
            {[
              ["Business-first approach", "We translate technical risk into plain-language business decisions."],
              ["Canadian-focused", "Built around the realities of Canadian small and mid-sized businesses."],
              ["Adaptive assessment", "The assessment adapts in real time to your actual answers — faster, consistent analysis."],
              ["SMB specialists", "We work exclusively with businesses your size, not enterprise IT departments."],
              ["Long-term partnership", "This report is a starting point, not a one-time transaction."],
            ].map(([k, v]) => (
              <View key={k} style={{ flexDirection: "row", paddingVertical: 6, borderTopWidth: 1, borderTopColor: BORDER }}>
                <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", width: 150 }}>{k}</Text>
                <Text style={{ fontSize: 9, flex: 1, color: MUTED }}>{v}</Text>
              </View>
            ))}
          </View>

          <Text style={[styles.h1, { marginTop: 16 }]}>Ready to Strengthen Your Cyber Health?</Text>
          <View style={[styles.card, { borderColor: NAVY, marginTop: 8 }]}>
            <View
              style={{
                borderWidth: 1,
                borderColor: NAVY,
                borderRadius: 6,
                paddingVertical: 10,
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <Text style={{ fontSize: 12, fontFamily: "Helvetica-Bold", color: NAVY }}>Start a Conversation {"->"}</Text>
            </View>
            <Text style={[styles.muted, { textAlign: "center", marginBottom: 10 }]}>
              A short, no-obligation conversation with the Oragrol team.
            </Text>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View style={{ gap: 4, maxWidth: 320 }}>
                <Text style={{ fontSize: 9, marginBottom: 4 }}>
                  Your assessment highlights clear opportunities to reduce risk. The Oragrol team can walk you through these findings and help you build a practical plan tailored to {report.profile.company}.
                </Text>
                <Text style={{ fontSize: 8.5 }}>{bookingUrl}</Text>
              </View>
              {qrDataUri ? (
                <View style={{ alignItems: "center" }}>
                  {/* eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer's Image is a PDF-embed primitive, not an HTML <img>; it has no alt prop */}
                  <Image src={qrDataUri} style={{ width: 70, height: 70 }} />
                  <Text style={{ fontSize: 7, color: MUTED, marginTop: 3 }}>Scan to start a conversation</Text>
                </View>
              ) : null}
            </View>
          </View>

          <View style={[styles.card, { marginTop: 10, backgroundColor: PAPER }]}>
            <Text style={{ fontSize: 8, color: MUTED, lineHeight: 1.5 }}>
              This Cyber Health Assessment Report is a high-level business assessment generated from questionnaire responses. It provides general cybersecurity guidance and should not be interpreted as a technical security audit, penetration test, compliance certification, or guarantee of security.
            </Text>
          </View>
          <Text style={{ fontSize: 7.5, color: MUTED, textAlign: "center", marginTop: 8 }}>
            Oragrol Global Inc. · CONFIDENTIAL · Report ID: {report.reportId} · {dateStr}
          </Text>
        </View>
        <Footer />
      </Page>
    </Document>
  );
}
