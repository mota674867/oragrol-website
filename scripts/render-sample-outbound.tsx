// Renders a sample outbound dossier PDF for visual checks (no API keys needed). @react-pdf only runs bundled:
// npx esbuild scripts/render-sample-outbound.tsx --bundle --platform=node --format=cjs --jsx=automatic \
//   --external:@react-pdf/renderer --external:react --external:@upstash/redis --outfile=/tmp/o.cjs && node /tmp/o.cjs out.pdf
import { writeFileSync } from "fs";
import { renderOutboundPdf } from "../app/lib/odo-outbound-pdf";
import type { Dossier, DossierFinding } from "../app/lib/odo-outbound";

const now = new Date().toISOString();
const f = (fact: string, kind: "gap" | "strength", severity: DossierFinding["severity"], proof: string | null): DossierFinding => ({ fact, proof, source: "Public DNS", checkedAt: now, kind, severity, area: "email", confidence: "high", key: fact });
const d: Dossier = {
  kind: "odo_outbound_dossier", version: 3, runAt: now, company: "Maple Ridge Bookkeeping & Tax", website: "mapleridgebooks.ca", domain: "mapleridgebooks.ca",
  notice: "Outbound dossier - built from PUBLIC evidence only (no interview), so it is thinner than a full ODO scan. Passive research only. Nothing was sent to or tested against the company.",
  industry: "Accounting & bookkeeping", businessSize: "small",
  snapshot: { description: "Maple Ridge is a boutique bookkeeping and tax-prep firm serving small businesses across the Greater Toronto Area.\n\nThey sell: bookkeeping, payroll and tax preparation. Audience: owner-managed businesses with 1-20 staff. Model: B2B. Price positioning: mid-market. Estimated size: small. Locations: Mississauga, ON.", focus: "Accounting & bookkeeping", businessModel: "B2B", priceLevel: "mid-market", locations: ["Mississauga, ON"] },
  competitors: [
    { name: "Riverside Tax & Accounting", website: "https://riversidetax.ca", phone: "(416) 555-0100", email: "info@riversidetax.ca", jobDescription: "Accounting, Tax Preparation Service", confidence: "verified" },
    { name: "GTA Numbers Group", website: "https://gtanumbers.ca", phone: null, email: null, jobDescription: "Accounting", confidence: "likely" },
    { name: "Brightline Bookkeeping", website: null, phone: null, email: null, jobDescription: "Bookkeeping for small business", confidence: "unverified" },
  ],
  recommendations: [
    { name: "Email anti-impersonation setup", group: "security", tier: "recommended", reason: "No DMARC enforcement was found, so anyone can send email pretending to be the firm [E1]." },
    { name: "Automated client intake", group: "automation", tier: "worth_exploring", reason: "No booking or CRM tooling is visible on the public site [E4]." },
  ],
  posture: { verdict: "weak", summary: "WEAK - 2 gaps found (1 high, 1 low), 1 strength.", highlights: ["✗ No DMARC enforcement - email spoofing risk", "✗ Staff emails shown in plain text on the site", "✓ Valid SSL/TLS on all pages"] },
  automation: { detected: [], note: "No AI or automation tooling visible on public surfaces - reads as a business still running mostly manual client intake. (Publicly visible signal only.)" },
  gaps: [f("No DMARC record is published, so the domain can be spoofed.", "gap", "high", "_dmarc.mapleridgebooks.ca: no TXT record"), f("Staff email addresses are shown in plain text on the website.", "gap", "low", null)],
  strengths: [f("Valid SSL/TLS certificate on all pages.", "strength", "info", "TLS 1.3, expires 2027-01-04")],
  context: [], notDetermined: ["page.homepage - blocked by origin (HTTP 403)"], changes: null, aiCostUsd: 0.31,
};
renderOutboundPdf(d).then((b) => { writeFileSync(process.argv[2], b); console.log("bytes", b.length, b.subarray(0, 4).toString()); });
