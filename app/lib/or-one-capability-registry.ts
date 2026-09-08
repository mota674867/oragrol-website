/**
 * Permanent OR ONE capability registry — 77 entries, one per capability
 * across all 10 categories in app/or-one/or-one-client.tsx's `groups` array.
 *
 * Per My_Scope_Final_Ready_For_Claude.md Section F: these codes are NEWLY
 * assigned under this implementation (2026-09-09), not previously existing
 * catalog codes. Assigned once from the live catalog's category/item order
 * at assignment time as a ONE-TIME reference — never recomputed at runtime
 * from array position, category order, or display label. Renaming, reordering,
 * or moving an item in `groups` must NEVER change its id or code here.
 *
 * `id` is the true permanent anchor (a stable slug, never reused even if a
 * capability is later removed). `code` (OR0X-0X) is the human-readable label
 * carried through the PDF, emails, and HubSpot note. New capabilities get
 * unused codes appended at the end of their category's range, or a new
 * category range — never insert into or renumber an existing range.
 *
 * `name` here is a frozen snapshot at assignment time — matched against the
 * live `groups` array by a visitor's selection (currently by name, since that
 * array has no id field of its own) to resolve which registry entry was
 * picked. If `groups` ever adds a stable id, prefer matching on that instead
 * of name, and keep this file's own name field as historical record either way.
 */

export type OrOneRisk = "Standard" | "Controlled" | "Critical";

export type OrOneCapability = {
  /** Permanent, immutable, never reused even if the capability is removed. */
  id: string;
  /** Permanent, human-readable — OR{category}-{item}, e.g. "OR01-01". */
  code: string;
  category: string;
  categoryCode: string;
  /** Frozen at assignment time (2026-09-09) — see file header. */
  name: string;
  points: number;
  risk: OrOneRisk;
};

export const OR_ONE_CAPABILITY_REGISTRY: readonly OrOneCapability[] = [
  { id: "orone-sales-lead-generation-prospecting", code: "OR01-01", category: "Sales", categoryCode: "OR01", name: "Lead generation/prospecting", points: 10, risk: "Standard" },
  { id: "orone-sales-cold-email-outreach", code: "OR01-02", category: "Sales", categoryCode: "OR01", name: "Cold email outreach", points: 8, risk: "Standard" },
  { id: "orone-sales-lead-qualification", code: "OR01-03", category: "Sales", categoryCode: "OR01", name: "Lead qualification", points: 8, risk: "Standard" },
  { id: "orone-sales-quote-proposal-drafting", code: "OR01-04", category: "Sales", categoryCode: "OR01", name: "Quote/proposal drafting", points: 7, risk: "Controlled" },
  { id: "orone-sales-crm-data-entry-pipeline-tracking", code: "OR01-05", category: "Sales", categoryCode: "OR01", name: "CRM data entry & pipeline tracking", points: 6, risk: "Controlled" },
  { id: "orone-sales-follow-up-with-existing-clients", code: "OR01-06", category: "Sales", categoryCode: "OR01", name: "Follow-up with existing clients", points: 5, risk: "Controlled" },
  { id: "orone-sales-upsell-cross-sell-offer-generation", code: "OR01-07", category: "Sales", categoryCode: "OR01", name: "Upsell/cross-sell offer generation", points: 8, risk: "Controlled" },
  { id: "orone-sales-sales-forecasting-reporting", code: "OR01-08", category: "Sales", categoryCode: "OR01", name: "Sales forecasting & reporting", points: 7, risk: "Standard" },
  { id: "orone-sales-referral-management", code: "OR01-09", category: "Sales", categoryCode: "OR01", name: "Referral management", points: 5, risk: "Standard" },
  { id: "orone-marketing-branding-website-management", code: "OR02-01", category: "Marketing & Branding", categoryCode: "OR02", name: "Website management", points: 8, risk: "Standard" },
  { id: "orone-marketing-branding-seo", code: "OR02-02", category: "Marketing & Branding", categoryCode: "OR02", name: "SEO", points: 10, risk: "Standard" },
  { id: "orone-marketing-branding-content-writing", code: "OR02-03", category: "Marketing & Branding", categoryCode: "OR02", name: "Content writing", points: 7, risk: "Standard" },
  { id: "orone-marketing-branding-social-media-posting", code: "OR02-04", category: "Marketing & Branding", categoryCode: "OR02", name: "Social media posting", points: 6, risk: "Controlled" },
  { id: "orone-marketing-branding-email-marketing", code: "OR02-05", category: "Marketing & Branding", categoryCode: "OR02", name: "Email marketing", points: 6, risk: "Controlled" },
  { id: "orone-marketing-branding-paid-ad-campaign-management", code: "OR02-06", category: "Marketing & Branding", categoryCode: "OR02", name: "Paid ad campaign management", points: 12, risk: "Controlled" },
  { id: "orone-marketing-branding-graphic-design-routine", code: "OR02-07", category: "Marketing & Branding", categoryCode: "OR02", name: "Graphic design (routine)", points: 8, risk: "Standard" },
  { id: "orone-marketing-branding-market-competitor-research", code: "OR02-08", category: "Marketing & Branding", categoryCode: "OR02", name: "Market & competitor research", points: 7, risk: "Standard" },
  { id: "orone-marketing-branding-marketing-analytics-reporting", code: "OR02-09", category: "Marketing & Branding", categoryCode: "OR02", name: "Marketing analytics/reporting", points: 6, risk: "Standard" },
  { id: "orone-marketing-branding-lead-gen-campaigns", code: "OR02-10", category: "Marketing & Branding", categoryCode: "OR02", name: "Lead-gen campaigns", points: 9, risk: "Controlled" },
  { id: "orone-finance-accounting-bookkeeping", code: "OR03-01", category: "Finance & Accounting", categoryCode: "OR03", name: "Bookkeeping", points: 9, risk: "Controlled" },
  { id: "orone-finance-accounting-accounts-payable", code: "OR03-02", category: "Finance & Accounting", categoryCode: "OR03", name: "Accounts payable", points: 8, risk: "Critical" },
  { id: "orone-finance-accounting-accounts-receivable-invoicing", code: "OR03-03", category: "Finance & Accounting", categoryCode: "OR03", name: "Accounts receivable/invoicing", points: 8, risk: "Controlled" },
  { id: "orone-finance-accounting-payroll-processing", code: "OR03-04", category: "Finance & Accounting", categoryCode: "OR03", name: "Payroll processing", points: 10, risk: "Critical" },
  { id: "orone-finance-accounting-bank-reconciliation", code: "OR03-05", category: "Finance & Accounting", categoryCode: "OR03", name: "Bank reconciliation", points: 7, risk: "Controlled" },
  { id: "orone-finance-accounting-financial-statements", code: "OR03-06", category: "Finance & Accounting", categoryCode: "OR03", name: "Financial statements", points: 9, risk: "Controlled" },
  { id: "orone-finance-accounting-budgeting-forecasting", code: "OR03-07", category: "Finance & Accounting", categoryCode: "OR03", name: "Budgeting & forecasting", points: 8, risk: "Standard" },
  { id: "orone-finance-accounting-expense-tracking-reimbursement", code: "OR03-08", category: "Finance & Accounting", categoryCode: "OR03", name: "Expense tracking/reimbursement", points: 6, risk: "Critical" },
  { id: "orone-finance-accounting-cash-flow-management", code: "OR03-09", category: "Finance & Accounting", categoryCode: "OR03", name: "Cash flow management", points: 7, risk: "Controlled" },
  { id: "orone-finance-accounting-financial-reporting-to-ownership", code: "OR03-10", category: "Finance & Accounting", categoryCode: "OR03", name: "Financial reporting to ownership", points: 6, risk: "Standard" },
  { id: "orone-finance-accounting-tax-preparation-client-validated-filing", code: "OR03-11", category: "Finance & Accounting", categoryCode: "OR03", name: "Tax preparation (client-validated filing)", points: 12, risk: "Critical" },
  { id: "orone-hr-people-recruiting-job-posting", code: "OR04-01", category: "HR & People", categoryCode: "OR04", name: "Recruiting/job posting", points: 5, risk: "Standard" },
  { id: "orone-hr-people-resume-screening", code: "OR04-02", category: "HR & People", categoryCode: "OR04", name: "Resume screening", points: 7, risk: "Critical" },
  { id: "orone-hr-people-onboarding", code: "OR04-03", category: "HR & People", categoryCode: "OR04", name: "Onboarding", points: 6, risk: "Controlled" },
  { id: "orone-hr-people-employee-records", code: "OR04-04", category: "HR & People", categoryCode: "OR04", name: "Employee records", points: 5, risk: "Controlled" },
  { id: "orone-hr-people-benefits-administration", code: "OR04-05", category: "HR & People", categoryCode: "OR04", name: "Benefits administration", points: 7, risk: "Controlled" },
  { id: "orone-hr-people-training-development", code: "OR04-06", category: "HR & People", categoryCode: "OR04", name: "Training & development", points: 7, risk: "Standard" },
  { id: "orone-hr-people-pto-time-off-tracking", code: "OR04-07", category: "HR & People", categoryCode: "OR04", name: "PTO/time-off tracking", points: 4, risk: "Standard" },
  { id: "orone-hr-people-workplace-policy-management", code: "OR04-08", category: "HR & People", categoryCode: "OR04", name: "Workplace policy management", points: 6, risk: "Controlled" },
  { id: "orone-hr-people-offboarding", code: "OR04-09", category: "HR & People", categoryCode: "OR04", name: "Offboarding", points: 5, risk: "Critical" },
  { id: "orone-hr-people-employment-law-compliance-tracking", code: "OR04-10", category: "HR & People", categoryCode: "OR04", name: "Employment-law compliance tracking", points: 8, risk: "Controlled" },
  { id: "orone-customer-service-answering-inquiries", code: "OR05-01", category: "Customer Service", categoryCode: "OR05", name: "Answering inquiries", points: 8, risk: "Controlled" },
  { id: "orone-customer-service-complaint-triage-handling", code: "OR05-02", category: "Customer Service", categoryCode: "OR05", name: "Complaint triage/handling", points: 7, risk: "Controlled" },
  { id: "orone-customer-service-order-service-issue-resolution", code: "OR05-03", category: "Customer Service", categoryCode: "OR05", name: "Order/service issue resolution", points: 7, risk: "Controlled" },
  { id: "orone-customer-service-returns-refunds", code: "OR05-04", category: "Customer Service", categoryCode: "OR05", name: "Returns/refunds", points: 6, risk: "Critical" },
  { id: "orone-customer-service-faq-knowledge-base-upkeep", code: "OR05-05", category: "Customer Service", categoryCode: "OR05", name: "FAQ/knowledge base upkeep", points: 5, risk: "Standard" },
  { id: "orone-customer-service-satisfaction-surveys", code: "OR05-06", category: "Customer Service", categoryCode: "OR05", name: "Satisfaction surveys", points: 4, risk: "Standard" },
  { id: "orone-customer-service-support-ticket-tracking", code: "OR05-07", category: "Customer Service", categoryCode: "OR05", name: "Support ticket tracking", points: 6, risk: "Standard" },
  { id: "orone-customer-service-after-sales-follow-up", code: "OR05-08", category: "Customer Service", categoryCode: "OR05", name: "After-sales follow-up", points: 5, risk: "Controlled" },
  { id: "orone-operations-admin-scheduling-calendar-management", code: "OR06-01", category: "Operations & Admin", categoryCode: "OR06", name: "Scheduling/calendar management", points: 5, risk: "Standard" },
  { id: "orone-operations-admin-document-filing", code: "OR06-02", category: "Operations & Admin", categoryCode: "OR06", name: "Document filing", points: 5, risk: "Standard" },
  { id: "orone-operations-admin-data-entry-across-systems", code: "OR06-03", category: "Operations & Admin", categoryCode: "OR06", name: "Data entry across systems", points: 7, risk: "Controlled" },
  { id: "orone-operations-admin-internal-communications", code: "OR06-04", category: "Operations & Admin", categoryCode: "OR06", name: "Internal communications", points: 5, risk: "Standard" },
  { id: "orone-operations-admin-meeting-coordination-notetaking", code: "OR06-05", category: "Operations & Admin", categoryCode: "OR06", name: "Meeting coordination & notetaking", points: 7, risk: "Standard" },
  { id: "orone-operations-admin-sop-documentation", code: "OR06-06", category: "Operations & Admin", categoryCode: "OR06", name: "SOP documentation", points: 6, risk: "Standard" },
  { id: "orone-operations-admin-project-task-tracking", code: "OR06-07", category: "Operations & Admin", categoryCode: "OR06", name: "Project/task tracking", points: 6, risk: "Standard" },
  { id: "orone-operations-admin-inventory-tracking-reorder-alerts", code: "OR06-08", category: "Operations & Admin", categoryCode: "OR06", name: "Inventory tracking/reorder alerts", points: 7, risk: "Controlled" },
  { id: "orone-operations-admin-shipping-coordination", code: "OR06-09", category: "Operations & Admin", categoryCode: "OR06", name: "Shipping coordination", points: 6, risk: "Controlled" },
  { id: "orone-it-technology-software-maintenance-patching", code: "OR07-01", category: "IT & Technology", categoryCode: "OR07", name: "Software maintenance/patching", points: 7, risk: "Critical" },
  { id: "orone-it-technology-software-license-management", code: "OR07-02", category: "IT & Technology", categoryCode: "OR07", name: "Software license management", points: 5, risk: "Standard" },
  { id: "orone-it-technology-it-helpdesk", code: "OR07-03", category: "IT & Technology", categoryCode: "OR07", name: "IT helpdesk", points: 7, risk: "Critical" },
  { id: "orone-it-technology-data-backup", code: "OR07-04", category: "IT & Technology", categoryCode: "OR07", name: "Data backup", points: 6, risk: "Controlled" },
  { id: "orone-it-technology-basic-cyber-hygiene-monitoring", code: "OR07-05", category: "IT & Technology", categoryCode: "OR07", name: "Basic cyber hygiene monitoring", points: 7, risk: "Controlled" },
  { id: "orone-it-technology-website-hosting-upkeep", code: "OR07-06", category: "IT & Technology", categoryCode: "OR07", name: "Website/hosting upkeep", points: 6, risk: "Controlled" },
  { id: "orone-it-technology-connecting-software-tools-together", code: "OR07-07", category: "IT & Technology", categoryCode: "OR07", name: "Connecting software tools together", points: 10, risk: "Controlled" },
  { id: "orone-procurement-vendor-supplier-sourcing-shortlisting", code: "OR08-01", category: "Procurement & Vendor", categoryCode: "OR08", name: "Supplier sourcing/shortlisting", points: 7, risk: "Standard" },
  { id: "orone-procurement-vendor-purchase-orders", code: "OR08-02", category: "Procurement & Vendor", categoryCode: "OR08", name: "Purchase orders", points: 5, risk: "Controlled" },
  { id: "orone-procurement-vendor-reorder-inventory-management", code: "OR08-03", category: "Procurement & Vendor", categoryCode: "OR08", name: "Reorder/inventory management", points: 7, risk: "Controlled" },
  { id: "orone-procurement-vendor-vendor-performance-tracking", code: "OR08-04", category: "Procurement & Vendor", categoryCode: "OR08", name: "Vendor performance tracking", points: 6, risk: "Standard" },
  { id: "orone-legal-compliance-license-permit-renewal-tracking-filing", code: "OR09-01", category: "Legal & Compliance", categoryCode: "OR09", name: "License/permit renewal tracking & filing", points: 7, risk: "Critical" },
  { id: "orone-legal-compliance-regulatory-compliance-tracking", code: "OR09-02", category: "Legal & Compliance", categoryCode: "OR09", name: "Regulatory compliance tracking", points: 8, risk: "Controlled" },
  { id: "orone-legal-compliance-insurance-management", code: "OR09-03", category: "Legal & Compliance", categoryCode: "OR09", name: "Insurance management", points: 6, risk: "Controlled" },
  { id: "orone-legal-compliance-corporate-record-keeping", code: "OR09-04", category: "Legal & Compliance", categoryCode: "OR09", name: "Corporate record-keeping", points: 6, risk: "Controlled" },
  { id: "orone-legal-compliance-privacy-data-compliance-tracking", code: "OR09-05", category: "Legal & Compliance", categoryCode: "OR09", name: "Privacy/data compliance tracking", points: 8, risk: "Controlled" },
  { id: "orone-leadership-strategy-kpi-performance-dashboards", code: "OR10-01", category: "Leadership & Strategy", categoryCode: "OR10", name: "KPI/performance dashboards", points: 7, risk: "Standard" },
  { id: "orone-leadership-strategy-investor-board-reporting", code: "OR10-02", category: "Leadership & Strategy", categoryCode: "OR10", name: "Investor/board reporting", points: 7, risk: "Controlled" },
  { id: "orone-leadership-strategy-company-wide-analytics", code: "OR10-03", category: "Leadership & Strategy", categoryCode: "OR10", name: "Company-wide analytics", points: 9, risk: "Standard" },
  { id: "orone-leadership-strategy-risk-monitoring-flagging", code: "OR10-04", category: "Leadership & Strategy", categoryCode: "OR10", name: "Risk monitoring/flagging", points: 7, risk: "Standard" },
];

/** O(1) lookup by the live groups array's item name. */
export const OR_ONE_CAPABILITY_BY_NAME: ReadonlyMap<string, OrOneCapability> =
  new Map(OR_ONE_CAPABILITY_REGISTRY.map((c) => [c.name, c]));

/** O(1) lookup by permanent code, e.g. for resolving a stored past selection. */
export const OR_ONE_CAPABILITY_BY_CODE: ReadonlyMap<string, OrOneCapability> =
  new Map(OR_ONE_CAPABILITY_REGISTRY.map((c) => [c.code, c]));

