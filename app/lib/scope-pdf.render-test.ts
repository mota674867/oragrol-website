/**
 * Real-data render test for the My Scope PDF — not a wired unit test
 * (see or-one-capability-registry.verify.ts for why: no test runner
 * configured in this repo at all). Run with:
 *   npx tsx app/lib/scope-pdf.render-test.ts
 *
 * Renders three real scenarios to actual PDF files in /tmp so page
 * count and layout can be inspected for real, not assumed:
 *   1. minimal  — 2 items, one area
 *   2. medium   — 8 items, all three areas (roughly matches the
 *                 approved 1-page sample's shape)
 *   3. maximum  — the real maximum achievable selection: 1 package +
 *                 all 12 individual services + all 6 Business
 *                 Automation jobs + the real 62-item OR ONE selection
 *                 that hits the builder\'s actual 400-point cap
 *                 (393 points — computed for real, not estimated).
 *                 All 81 names below are the genuine catalog/registry
 *                 content, not placeholder text.
 */
import { renderToFile } from "@react-pdf/renderer";
import * as fs from "fs";
import ScopePdf, { type ScopePdfData, type ScopePdfGroup } from "./scope-pdf";
import { BUSINESS_AUTOMATION_JOB_REGISTRY } from "./business-automation-job-registry";

const baseClient = {
  company: "Example Company Ltd.",
  name: "Alex Morgan",
  phone: "+1 416 555 0100",
  email: "alex@example.com",
  date: "09 Sep 2026",
};

// The real 62-item selection that hits the OR ONE builder\'s 400-point
// cap (393 points), picking cheapest-first — computed from the actual
// registry, not hand-picked.
const OR_ONE_MAX_SELECTION: { code: string; name: string }[] = [
  { code: "OR04-07", name: "PTO/time-off tracking" },
  { code: "OR05-06", name: "Satisfaction surveys" },
  { code: "OR01-06", name: "Follow-up with existing clients" },
  { code: "OR01-09", name: "Referral management" },
  { code: "OR04-01", name: "Recruiting/job posting" },
  { code: "OR04-04", name: "Employee records" },
  { code: "OR04-09", name: "Offboarding" },
  { code: "OR05-05", name: "FAQ/knowledge base upkeep" },
  { code: "OR05-08", name: "After-sales follow-up" },
  { code: "OR06-01", name: "Scheduling/calendar management" },
  { code: "OR06-02", name: "Document filing" },
  { code: "OR06-04", name: "Internal communications" },
  { code: "OR07-02", name: "Software license management" },
  { code: "OR08-02", name: "Purchase orders" },
  { code: "OR01-05", name: "CRM data entry & pipeline tracking" },
  { code: "OR02-04", name: "Social media posting" },
  { code: "OR02-05", name: "Email marketing" },
  { code: "OR02-09", name: "Marketing analytics/reporting" },
  { code: "OR03-08", name: "Expense tracking/reimbursement" },
  { code: "OR03-10", name: "Financial reporting to ownership" },
  { code: "OR04-03", name: "Onboarding" },
  { code: "OR04-08", name: "Workplace policy management" },
  { code: "OR05-04", name: "Returns/refunds" },
  { code: "OR05-07", name: "Support ticket tracking" },
  { code: "OR06-06", name: "SOP documentation" },
  { code: "OR06-07", name: "Project/task tracking" },
  { code: "OR06-09", name: "Shipping coordination" },
  { code: "OR07-04", name: "Data backup" },
  { code: "OR07-06", name: "Website/hosting upkeep" },
  { code: "OR08-04", name: "Vendor performance tracking" },
  { code: "OR09-03", name: "Insurance management" },
  { code: "OR09-04", name: "Corporate record-keeping" },
  { code: "OR01-04", name: "Quote/proposal drafting" },
  { code: "OR01-08", name: "Sales forecasting & reporting" },
  { code: "OR02-03", name: "Content writing" },
  { code: "OR02-08", name: "Market & competitor research" },
  { code: "OR03-05", name: "Bank reconciliation" },
  { code: "OR03-09", name: "Cash flow management" },
  { code: "OR04-02", name: "Resume screening" },
  { code: "OR04-05", name: "Benefits administration" },
  { code: "OR04-06", name: "Training & development" },
  { code: "OR05-02", name: "Complaint triage/handling" },
  { code: "OR05-03", name: "Order/service issue resolution" },
  { code: "OR06-03", name: "Data entry across systems" },
  { code: "OR06-05", name: "Meeting coordination & notetaking" },
  { code: "OR06-08", name: "Inventory tracking/reorder alerts" },
  { code: "OR07-01", name: "Software maintenance/patching" },
  { code: "OR07-03", name: "IT helpdesk" },
  { code: "OR07-05", name: "Basic cyber hygiene monitoring" },
  { code: "OR08-01", name: "Supplier sourcing/shortlisting" },
  { code: "OR08-03", name: "Reorder/inventory management" },
  { code: "OR09-01", name: "License/permit renewal tracking & filing" },
  { code: "OR10-01", name: "KPI/performance dashboards" },
  { code: "OR10-02", name: "Investor/board reporting" },
  { code: "OR10-04", name: "Risk monitoring/flagging" },
  { code: "OR01-02", name: "Cold email outreach" },
  { code: "OR01-03", name: "Lead qualification" },
  { code: "OR01-07", name: "Upsell/cross-sell offer generation" },
  { code: "OR02-01", name: "Website management" },
  { code: "OR02-07", name: "Graphic design (routine)" },
  { code: "OR03-02", name: "Accounts payable" },
  { code: "OR03-03", name: "Accounts receivable/invoicing" },
];

const ALL_12_INDIVIDUAL_SERVICES: { code: string; name: string }[] = [
  { code: "C01-S04", name: "Virtual CISO" },
  { code: "C07-S04", name: "Secure Software Development" },
  { code: "C08-S03", name: "Data Privacy Management" },
  { code: "C09-S01", name: "AI Security Assessment" },
  { code: "C09-S02", name: "AI Governance & Risk Mgmt" },
  { code: "C05-S03", name: "Privileged Access Mgmt" },
  { code: "C05-S05", name: "Zero Trust Access Security" },
  { code: "C06-S04", name: "Cloud Network Security" },
  { code: "C09-S03", name: "AI Model Security" },
  { code: "C09-S04", name: "AI Data Security & Privacy" },
  { code: "C09-S05", name: "AI Threat Detection & Protection" },
  { code: "C07-S05", name: "Application Security Testing" },
];

const ALL_6_BA_JOBS: { code: string; name: string }[] = BUSINESS_AUTOMATION_JOB_REGISTRY.map((j) => ({
  code: j.code,
  name: j.name,
}));

async function renderScenario(label: string, data: ScopePdfData, sample: boolean) {
  const path = `/tmp/scope-pdf-${label}.pdf`;
  await renderToFile(ScopePdf({ data, contactQrSrc: FAKE_QR, sample }), path);
  const stat = fs.statSync(path);
  console.log(`${label}: wrote ${path} (${stat.size} bytes)`);
  return path;
}

// A real, tiny valid PNG data URI (1x1 transparent pixel) — good enough
// to prove Image rendering works; the actual production QR comes from
// the `qrcode` package (same as Cyber Health) inside the real API route,
// not from this layout test.
const FAKE_QR =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";

async function main() {
  const minimalGroups: ScopePdfGroup[] = [
    { area: "Cybersecurity", items: [ALL_12_INDIVIDUAL_SERVICES[0], ALL_12_INDIVIDUAL_SERVICES[3]] },
  ];
  await renderScenario("minimal", { ...baseClient, reference: "TEST-MIN-001", groups: minimalGroups }, true);

  const mediumGroups: ScopePdfGroup[] = [
    { area: "Cybersecurity", items: [ALL_12_INDIVIDUAL_SERVICES[0], ALL_12_INDIVIDUAL_SERVICES[3]] },
    { area: "Automation", items: [ALL_6_BA_JOBS[0]] },
    {
      area: "OR ONE",
      items: [OR_ONE_MAX_SELECTION[0], OR_ONE_MAX_SELECTION[1], OR_ONE_MAX_SELECTION[2], OR_ONE_MAX_SELECTION[3], OR_ONE_MAX_SELECTION[4]],
    },
  ];
  await renderScenario("medium", { ...baseClient, reference: "TEST-MED-001", groups: mediumGroups }, true);

  const maxGroups: ScopePdfGroup[] = [
    {
      area: "Cybersecurity",
      items: [{ code: "ELITE", name: "Elite Package" }, ...ALL_12_INDIVIDUAL_SERVICES],
    },
    { area: "Automation", items: ALL_6_BA_JOBS },
    { area: "OR ONE", items: OR_ONE_MAX_SELECTION },
  ];
  const totalMax = maxGroups.reduce((n, g) => n + g.items.length, 0);
  console.log(`maximum scenario: ${totalMax} total items (expect 81)`);
  await renderScenario(
    "maximum",
    { ...baseClient, company: "A Longer Example Company Name International Holdings Ltd.", reference: "TEST-MAX-001", groups: maxGroups },
    true,
  );
}

main().catch((err) => {
  console.error("Render test failed:", err);
  process.exit(1);
});
