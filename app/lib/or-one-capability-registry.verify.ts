/**
 * Verification script for OR_ONE_CAPABILITY_REGISTRY — run with:
 *   npx tsx app/lib/or-one-capability-registry.verify.ts
 *
 * This is a standalone script, not a wired-in unit test — this repo has
 * no unit test runner configured at all (only @playwright/test for e2e,
 * zero *.test.* files anywhere). Adding a framework (vitest is the
 * obvious fit for Next.js) is a small but real infrastructure choice of
 * its own, not something to decide silently while building an unrelated
 * feature. Flagging it rather than picking one. This script gives the
 * substance of Section F's "unit-test uniqueness, complete coverage and
 * stability" requirement in the meantime, and can be dropped into a real
 * test file directly (it's already structured as isolated assertions)
 * once that decision is made.
 */
import {
  OR_ONE_CAPABILITY_REGISTRY,
  OR_ONE_CAPABILITY_BY_NAME,
} from "./or-one-capability-registry";

// Mirrors app/or-one/or-one-client.tsx's `groups` array exactly, as of
// 2026-09-09 (the registry's assignment date). This is a deliberate,
// separate transcription — not an import from or-one-client.tsx — so
// this check actually catches drift if that file changes without the
// registry being updated, rather than trivially agreeing with itself.
const LIVE_GROUPS: { name: string; items: string[] }[] = [
  {
    name: "Sales",
    items: [
      "Lead generation/prospecting",
      "Cold email outreach",
      "Lead qualification",
      "Quote/proposal drafting",
      "CRM data entry & pipeline tracking",
      "Follow-up with existing clients",
      "Upsell/cross-sell offer generation",
      "Sales forecasting & reporting",
      "Referral management",
    ],
  },
  {
    name: "Marketing & Branding",
    items: [
      "Website management",
      "SEO",
      "Content writing",
      "Social media posting",
      "Email marketing",
      "Paid ad campaign management",
      "Graphic design (routine)",
      "Market & competitor research",
      "Marketing analytics/reporting",
      "Lead-gen campaigns",
    ],
  },
  {
    name: "Finance & Accounting",
    items: [
      "Bookkeeping",
      "Accounts payable",
      "Accounts receivable/invoicing",
      "Payroll processing",
      "Bank reconciliation",
      "Financial statements",
      "Budgeting & forecasting",
      "Expense tracking/reimbursement",
      "Cash flow management",
      "Financial reporting to ownership",
      "Tax preparation (client-validated filing)",
    ],
  },
  {
    name: "HR & People",
    items: [
      "Recruiting/job posting",
      "Resume screening",
      "Onboarding",
      "Employee records",
      "Benefits administration",
      "Training & development",
      "PTO/time-off tracking",
      "Workplace policy management",
      "Offboarding",
      "Employment-law compliance tracking",
    ],
  },
  {
    name: "Customer Service",
    items: [
      "Answering inquiries",
      "Complaint triage/handling",
      "Order/service issue resolution",
      "Returns/refunds",
      "FAQ/knowledge base upkeep",
      "Satisfaction surveys",
      "Support ticket tracking",
      "After-sales follow-up",
    ],
  },
  {
    name: "Operations & Admin",
    items: [
      "Scheduling/calendar management",
      "Document filing",
      "Data entry across systems",
      "Internal communications",
      "Meeting coordination & notetaking",
      "SOP documentation",
      "Project/task tracking",
      "Inventory tracking/reorder alerts",
      "Shipping coordination",
    ],
  },
  {
    name: "IT & Technology",
    items: [
      "Software maintenance/patching",
      "Software license management",
      "IT helpdesk",
      "Data backup",
      "Basic cyber hygiene monitoring",
      "Website/hosting upkeep",
      "Connecting software tools together",
    ],
  },
  {
    name: "Procurement & Vendor",
    items: [
      "Supplier sourcing/shortlisting",
      "Purchase orders",
      "Reorder/inventory management",
      "Vendor performance tracking",
    ],
  },
  {
    name: "Legal & Compliance",
    items: [
      "License/permit renewal tracking & filing",
      "Regulatory compliance tracking",
      "Insurance management",
      "Corporate record-keeping",
      "Privacy/data compliance tracking",
    ],
  },
  {
    name: "Leadership & Strategy",
    items: [
      "KPI/performance dashboards",
      "Investor/board reporting",
      "Company-wide analytics",
      "Risk monitoring/flagging",
    ],
  },
];

let failures = 0;
function check(label: string, pass: boolean, detail?: string) {
  if (pass) {
    console.log(`  OK   ${label}`);
  } else {
    failures++;
    console.log(`  FAIL ${label}${detail ? ` — ${detail}` : ""}`);
  }
}

console.log("OR ONE capability registry verification\n");

check(
  "Registry has exactly 77 entries",
  OR_ONE_CAPABILITY_REGISTRY.length === 77,
  `got ${OR_ONE_CAPABILITY_REGISTRY.length}`,
);

const ids = OR_ONE_CAPABILITY_REGISTRY.map((c) => c.id);
check(
  "All 77 ids are unique",
  new Set(ids).size === ids.length,
  `${ids.length - new Set(ids).size} duplicate(s)`,
);

const codes = OR_ONE_CAPABILITY_REGISTRY.map((c) => c.code);
check(
  "All 77 codes are unique",
  new Set(codes).size === codes.length,
  `${codes.length - new Set(codes).size} duplicate(s)`,
);

check(
  "Every code matches OR\\d{2}-\\d{2}",
  codes.every((c) => /^OR\d{2}-\d{2}$/.test(c)),
);

const liveTotal = LIVE_GROUPS.reduce((n, g) => n + g.items.length, 0);
check(
  "Live groups transcription totals 77 (sanity check on this script itself)",
  liveTotal === 77,
  `got ${liveTotal}`,
);

// Completeness: every live item resolves to a registry entry.
const missing: string[] = [];
for (const group of LIVE_GROUPS) {
  for (const itemName of group.items) {
    const entry = OR_ONE_CAPABILITY_BY_NAME.get(itemName);
    if (!entry) {
      missing.push(`${group.name} / ${itemName}`);
    } else if (entry.category !== group.name) {
      missing.push(
        `${group.name} / ${itemName} (registry has category "${entry.category}")`,
      );
    }
  }
}
check(
  "Every live capability resolves to a registry entry in the right category",
  missing.length === 0,
  missing.join("; "),
);

// No orphans: every registry entry should currently exist live too (not
// required to hold forever — removed capabilities keep their registry
// row per the "never recycle" rule — but should hold today, since the
// registry was just assigned from this exact live catalog).
const liveNames = new Set(LIVE_GROUPS.flatMap((g) => g.items));
const orphans = OR_ONE_CAPABILITY_REGISTRY.filter((c) => !liveNames.has(c.name));
check(
  "No registry entries are orphaned relative to today's live catalog",
  orphans.length === 0,
  orphans.map((c) => c.code).join(", "),
);

console.log(
  `\n${failures === 0 ? "All checks passed." : `${failures} check(s) FAILED.`}`,
);
process.exit(failures === 0 ? 0 : 1);
