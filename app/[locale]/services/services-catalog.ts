/**
 * Services catalog data — four packages, twelve individual services, four
 * specialist engagements. Deliberately NOT a "use client" module: it's
 * imported both by services-body.tsx (client, for rendering) and
 * page.tsx (server, for the Service/OfferCatalog JSON-LD). Importing plain
 * data from a "use client" file into a Server Component doesn't work under
 * React Server Components — the export becomes an opaque client reference,
 * not the real array — confirmed the hard way via a dev-server 500
 * ("SERVICE_PACKAGES.map is not a function") before splitting this out.
 */

export type ServicesSelection = {
  kind: "package" | "service";
  id: string;
  name: string;
  priceCAD: number;
  billing: "monthly" | "one-time" | "per-application";
  includedServices?: readonly string[];
};

const base = ["Security Rules Setup", "Security Weakness Check", "Device Guard", "Mail Shield", "Staff Security", "Login Shield"];
const advanced = [...base, "Compliance Check", "Vendor Watch", "AI Security Monitoring", "Threat Watch", "Access Manager", "Access Governance"];
const comprehensive = [...advanced, "Cloud Guard", "Workload Shield", "Infra Guard", "Cloud Compliance", "App Shield", "Web Shield", "API Guard", "Data Shield", "Data Guard", "Data Classifier"];

export const SERVICE_PACKAGES = [
  { id: "foundation", name: "Foundation", price: 2756, initialPrice: 3307, value: "Establish your core protection.", fit: "Businesses putting essential security controls around their people, devices and everyday work.", services: base },
  { id: "advanced", name: "Advanced", price: 6038, initialPrice: 7246, value: "Extend visibility and strengthen access.", fit: "Businesses that need broader monitoring, access governance and oversight of vendors and compliance needs.", services: advanced },
  { id: "comprehensive", name: "Comprehensive", price: 11706, initialPrice: 14047, value: "Connect protection across your environment.", fit: "Businesses with cloud workloads, applications and data that require a wider, coordinated scope of protection.", services: comprehensive },
  { id: "elite", name: "Elite", price: 13133, initialPrice: 15760, value: "Bring protection and response together.", fit: "Businesses seeking the broadest package scope, including managed threat response, security response and data monitoring.", services: [...comprehensive, "Managed Threat Response", "Security Response", "Data Watch"] },
] as const;

export const INDIVIDUAL_SERVICES = [
  { code: "C01-S04", name: "Virtual CISO", price: 3500, billing: "monthly", line: "Security leadership to guide priorities, decisions and oversight." },
  { code: "C07-S04", name: "Secure Software Development", price: 600, billing: "monthly", line: "Bring security practices into your software delivery process." },
  { code: "C08-S03", name: "Data Privacy Management", price: 700, billing: "monthly", line: "Coordinate how personal information is handled and protected." },
  { code: "C09-S01", name: "AI Security Assessment", price: 4500, billing: "one-time", line: "Assess security risks in your AI use and identify practical next steps." },
  { code: "C09-S02", name: "AI Governance & Risk Mgmt", price: 900, billing: "monthly", line: "Define responsibilities and manage risks around business use of AI." },
  { code: "C05-S03", name: "Privileged Access Mgmt", price: 400, billing: "monthly", line: "Strengthen oversight of accounts with elevated permissions." },
  { code: "C05-S05", name: "Zero Trust Access Security", price: 1000, billing: "monthly", line: "Apply identity and context checks to access decisions." },
  { code: "C06-S04", name: "Cloud Network Security", price: 700, billing: "monthly", line: "Strengthen network controls across your cloud environment." },
  { code: "C09-S03", name: "AI Model Security", price: 700, billing: "monthly", line: "Address security risks affecting AI models and their use." },
  { code: "C09-S04", name: "AI Data Security & Privacy", price: 500, billing: "monthly", line: "Protect sensitive information used by AI systems and workflows." },
  { code: "C09-S05", name: "AI Threat Detection & Protection", price: 800, billing: "monthly", line: "Identify and address threats involving your AI environment." },
  { code: "C07-S05", name: "Application Security Testing", price: 3500, billing: "per-application", line: "Test an application's security and prioritize the findings." },
] as const;

// Specialist engagement pricing (updated 2026-09-08 per Mohammad's review):
// display as "From $X" starting fees, not ranges — these are ORAGROL's
// starting fees for a defined scope, not claimed market minimums. `prices`
// is kept (label + minPrice, open-ended — no maxPrice) for the
// Service/OfferCatalog JSON-LD in page.tsx; `priceLine`/`secondaryPriceLine`
// are the display strings shown on the card.
export const SPECIALIST_ENGAGEMENTS = [
  {
    code: "C10-S01",
    name: "Penetration Testing",
    line: "A scoped engagement to test for exploitable weaknesses and prioritize remediation.",
    priceLine: "From $7,500 per engagement",
    secondaryPriceLine: undefined as string | undefined,
    prices: [{ label: "Per engagement", minPrice: 7500 }],
  },
  {
    code: "C10-S02",
    name: "SOC 2 Type II Attestation",
    line: "An engagement with a qualified CPA audit partner, scoped to your organization and reporting needs.",
    // Both fees apply — the "+" is deliberately visible so it reads as
    // setup ($8,000) plus annual ($12,000), starting at $20,000 in year one,
    // not a choice between the two.
    priceLine: "Setup from $8,000 + annual engagement from $12,000",
    secondaryPriceLine: undefined as string | undefined,
    prices: [
      { label: "One-time setup", minPrice: 8000 },
      { label: "Annual engagement", minPrice: 12000 },
    ],
  },
  {
    code: "C10-S03",
    name: "PCI-DSS QSA Assessment",
    line: "A scoped assessment with a qualified QSA for your payment environment.",
    priceLine: "From $10,000 per annual engagement",
    secondaryPriceLine: undefined as string | undefined,
    prices: [{ label: "Annual engagement", minPrice: 10000 }],
  },
  {
    code: "C10-S04",
    name: "Certified Forensic IR",
    line: "Specialist forensic investigation and incident response, with scope agreed for the incident.",
    priceLine: "From $12,000 per incident",
    secondaryPriceLine: "Optional retainer from $500/month · separately scoped." as string | undefined,
    prices: [
      { label: "Per incident", minPrice: 12000 },
      { label: "Optional retainer · separately scoped", minPrice: 500 },
    ],
  },
] as const;
