// ORAGROL ODO — Service catalog for matching (67 sellable services)
//
// Source: ORAGROL_ODO_Service_Trigger_Data_2026-09-21.md v2 (validated) /
// Master Reference v6 §18, for C01–C09/C11–C15 (63 services). C10 (Certified
// Specialist Services — added 2026-09-30, per Mohammad's explicit decision)
// sources its names from `ORAGROL_C10_Certified_Specialist_Services_for_Web.md`
// — the live site already presents all four as "Available by Engagement,"
// so ODO citing the same code/name is consistent with what's already public,
// not a new claim. Codes, official names, Simple Names and trigger wording
// are permanent identifiers — do not edit without changing the source doc.
//
// `billing`: "recurring" (subscription, the default) or "project"
// (one-time/per-engagement — C07-S05, C09-S01, and all of C10). The report
// badges "project" services as "By engagement" rather than implying a
// monthly price, matching how these are already framed on the live site.

export type ServiceGroup = "security" | "automation";
export type Billing = "recurring" | "project";

export type CatalogService = {
  code: string;
  simpleName: string;
  officialName: string;
  category: string;
  group: ServiceGroup;
  triggers: string;
  billing: Billing;
};

const C = (code: string, simpleName: string, officialName: string, category: string, group: ServiceGroup, triggers: string, billing: Billing = "recurring"): CatalogService =>
  ({ code, simpleName, officialName, category, group, triggers, billing });

const S: ServiceGroup = "security";
const A: ServiceGroup = "automation";

export const SERVICE_CATALOG: CatalogService[] = [
  // C01 — Cyber Risk & Governance
  C("C01-S01", "Cyber Health Check", "Cyber Risk Assessment", "Cyber Risk & Governance", S, "no documented risk assessment process; no named security owner; recent growth/new systems with no risk review"),
  C("C01-S02", "Compliance Check", "Cyber Compliance Readiness", "Cyber Risk & Governance", S, "client mentions a compliance requirement (SOC 2, PCI, HIPAA, PIPEDA); handles regulated data with no compliance program described"),
  C("C01-S03", "Security Rules Setup", "Security Governance & Policies", "Cyber Risk & Governance", S, "no written security policies mentioned; no documented IR plan"),
  C("C01-S04", "Virtual CISO", "Virtual CISO", "Cyber Risk & Governance", S, "no named security leadership; ad hoc security decisions; company size suggests need for strategic oversight without a full-time hire"),
  // C02 — Vulnerability & Exposure Management
  C("C02-S01", "Vuln Watch", "Vulnerability Assessment & Management", "Vulnerability & Exposure Management", S, "no patching cadence or scanning mentioned; no vulnerability tracking/remediation process described"),
  C("C02-S02", "Vendor Watch", "Third-Party & Vendor Risk Management", "Vulnerability & Exposure Management", S, "client depends on outside vendors (cloud providers, payroll, outsourced IT, SaaS tools) with no vendor risk assessment or monitoring process described"),
  // C03 — Threat Detection & Response
  C("C03-S01", "AI Security Monitoring", "Security Monitoring / AI-SOC", "Threat Detection & Response", S, "no continuous/24-7 security monitoring capability described; multiple disconnected security tools with no one reviewing them; limited internal team unable to keep up with alert volume"),
  C("C03-S02", "Managed Threat Response", "Managed Detection & Response (MDR)", "Threat Detection & Response", S, "no SOC/monitoring service mentioned; no dedicated investigation/response capability"),
  C("C03-S03", "Threat Watch", "Threat Intelligence", "Threat Detection & Response", S, "industry with elevated targeted-attack profile (finance, healthcare, legal); no threat-intel feed mentioned"),
  C("C03-S04", "Security Response", "Incident Response & Automated Response", "Threat Detection & Response", S, "no documented IR plan; no described incident playbook — response-execution focused"),
  // C04 — Endpoint, Email & Human Security
  C("C04-S01", "Device Guard", "Endpoint Security", "Endpoint, Email & Human Security", S, "no endpoint/EDR mentioned; BYOD or remote workforce with no described device management"),
  C("C04-S02", "Mail Shield", "Email Security", "Endpoint, Email & Human Security", S, "no SPF/DKIM/DMARC or email filtering; DMARC not enforcing"),
  C("C04-S03", "Staff Security", "Security Awareness & Human Risk", "Endpoint, Email & Human Security", S, "no staff security training program mentioned; recent phishing/social-engineering incident mentioned"),
  // C05 — Identity & Access Security
  C("C05-S01", "Access Manager", "Identity & Access Management", "Identity & Access Security", S, "no described identity/account lifecycle process; ad hoc account creation/removal"),
  C("C05-S02", "Login Shield", "Multi-Factor Authentication", "Identity & Access Security", S, "no MFA on admin/remote access"),
  C("C05-S03", "Admin Shield", "Privileged Access Management", "Identity & Access Security", S, "shared admin logins; no privileged-access controls described"),
  C("C05-S04", "Access Governance", "Identity Governance & Administration", "Identity & Access Security", S, "no access review/approval process; unclear who approved existing access"),
  C("C05-S05", "Trust Guard", "Zero Trust Access Security", "Identity & Access Security", S, "remote/hybrid workforce with network-perimeter-only security model implied"),
  // C06 — Cloud & Infrastructure Security
  C("C06-S01", "Cloud Guard", "Cloud Security Posture Management (CSPM)", "Cloud & Infrastructure Security", S, "cloud infrastructure (AWS/Azure/GCP) in use with no cloud posture assessment or misconfiguration-detection process described"),
  C("C06-S02", "Workload Shield", "Cloud Workload Protection (CWPP)", "Cloud & Infrastructure Security", S, "VMs/containers in production with no workload protection described"),
  C("C06-S03", "Infra Guard", "Infrastructure Security", "Cloud & Infrastructure Security", S, "on-prem or hybrid servers/infrastructure with no hardening or configuration-baseline process described"),
  C("C06-S04", "Network Shield", "Cloud Network Security", "Cloud & Infrastructure Security", S, "flat/unsegmented network implied; no internet-exposure review, network segmentation, or secure remote connectivity described"),
  C("C06-S05", "Cloud Compliance", "Cloud Configuration & Compliance", "Cloud & Infrastructure Security", S, "cloud footprint with no configuration-compliance checks against benchmarks/standards described"),
  // C07 — Application, API & Web Security
  C("C07-S01", "App Shield", "Application Security (AppSec)", "Application, API & Web Security", S, "custom application in production with no application security baseline or controls review described"),
  C("C07-S02", "Web Shield", "Web Application Security", "Application, API & Web Security", S, "public-facing website/web app with no described web security controls"),
  C("C07-S03", "API Guard", "API Security", "Application, API & Web Security", S, "API exposed (client-facing or partner-facing) with no API discovery, authentication, or authorization review described"),
  C("C07-S04", "Code Shield", "Secure Software Development", "Application, API & Web Security", S, "in-house development team with no secure-SDLC practices mentioned"),
  C("C07-S05", "App Test", "Application Security Testing", "Application, API & Web Security", S, "custom app in production with no security testing (SAST/DAST/authorized pentest) history described", "project"),
  // C08 — Data Security & Privacy
  C("C08-S01", "Data Shield", "Data Security & Protection", "Data Security & Privacy", S, "handles sensitive/business-critical data with no data-protection baseline (encryption, backup protection, exposure reduction) described"),
  C("C08-S02", "Data Guard", "Data Loss Prevention (DLP)", "Data Security & Privacy", S, "sensitive data moves through email/file-sharing/cloud apps with no DLP policy described"),
  C("C08-S03", "Privacy Guard", "Data Privacy Management", "Data Security & Privacy", S, "collects personal/customer data — PIPEDA; privacy notice or consent gaps"),
  C("C08-S04", "Data Classifier", "Data Classification & Governance", "Data Security & Privacy", S, "no data classification/labeling scheme described; unclear where sensitive data lives or who owns it"),
  C("C08-S05", "Data Watch", "Data Security Monitoring", "Data Security & Privacy", S, "sensitive data stores with no monitoring/DLP-alerting described"),
  // C09 — AI Security & Governance
  C("C09-S01", "AI Check", "AI Security Assessment", "AI Security & Governance", S, "client uses AI tools/chatbots with customer or business data; no AI-specific security review described", "project"),
  C("C09-S02", "AI Governance", "AI Governance & Risk Management", "AI Security & Governance", S, "AI in use with no governance framework, AI use-case inventory, or approval process described"),
  C("C09-S03", "Model Shield", "AI Model Security", "AI Security & Governance", S, "client builds/fine-tunes their own AI models"),
  C("C09-S04", "AI Data Guard", "AI Data Security & Privacy", "AI Security & Governance", S, "AI tools process customer/sensitive data with no described data controls"),
  C("C09-S05", "AI Threat Guard", "AI Threat Detection & Protection", "AI Security & Governance", S, "AI-driven customer-facing systems (chatbot, automated decisions) with no prompt-injection/abuse/threat monitoring described"),
  // C11 — AI Business Discovery & Transformation
  C("C11-S01", "AI Ready", "AI Readiness Assessment", "AI Business Discovery & Transformation", A, "business expresses interest in AI/automation but unsure where to start"),
  C("C11-S02", "Process Finder", "AI Business Process Discovery", "AI Business Discovery & Transformation", A, "manual/repetitive processes described with no automation in place"),
  C("C11-S03", "AI Opportunities", "AI Opportunity & Use-Case Strategy", "AI Business Discovery & Transformation", A, "business asks what to automate without a clear answer; no prioritized use-case list"),
  C("C11-S04", "AI Roadmap", "AI Transformation Roadmap", "AI Business Discovery & Transformation", A, "multiple automation opportunities found — need for a sequenced plan"),
  C("C11-S05", "AI Optimizer", "AI Adoption & Optimization", "AI Business Discovery & Transformation", A, "already has some automation but it is underused, stalled, or failing to deliver value"),
  // C12 — AI Automation & Integration
  C("C12-S01", "Flow Automator", "AI Workflow Automation", "AI Automation & Integration", A, "manual multi-step workflows (manual data entry between systems, manual approvals/routing)"),
  C("C12-S02", "Agent Connect", "AI Agent Integration", "AI Automation & Integration", A, "interest in AI agents but no integration with the client's own tools/data sources"),
  C("C12-S03", "System Bridge", "Business System Integration", "AI Automation & Integration", A, "multiple disconnected tools/systems (CRM, accounting, ops not talking to each other)"),
  C("C12-S04", "AI Orchestrator", "Intelligent Process Orchestration", "AI Automation & Integration", A, "complex multi-step, multi-system, or multi-department workflows with no coordination layer"),
  C("C12-S05", "Automation Optimizer", "AI Automation Optimization", "AI Automation & Integration", A, "existing automation described as inefficient, unreliable, or needing tuning"),
  // C13 — AI Knowledge, Data & Intelligence
  C("C13-S01", "Knowledge Hub", "AI Knowledge Management", "AI Knowledge, Data & Intelligence", A, "scattered/undocumented institutional knowledge (emails, drives, people's heads)"),
  C("C13-S02", "Data Insight", "AI Data Intelligence", "AI Knowledge, Data & Intelligence", A, "business data collected but not structured or analyzed for decisions"),
  C("C13-S03", "Knowledge Finder", "AI Knowledge Discovery", "AI Knowledge, Data & Intelligence", A, "large unstructured document volume with no search/discovery tooling"),
  C("C13-S04", "Insight Engine", "AI Analytics & Insights", "AI Knowledge, Data & Intelligence", A, "recurring business decisions made without analytics/reporting support"),
  C("C13-S05", "Decision Engine", "AI Decision Intelligence", "AI Knowledge, Data & Intelligence", A, "recurring business decisions made ad hoc, no structured decision support"),
  // C14 — IT & Technology Operations
  C("C14-S01", "IT Manager", "IT Service Management", "IT & Technology Operations", A, "no structured IT request/incident/change process"),
  C("C14-S02", "Infrastructure Ops", "IT Infrastructure Operations", "IT & Technology Operations", A, "IT infrastructure managed ad hoc with no operations/maintenance process"),
  C("C14-S03", "Asset Control", "IT Asset & Configuration Management", "IT & Technology Operations", A, "no asset inventory; domains/certificates/assets not tracked"),
  C("C14-S04", "IT Helpdesk", "IT Support & Service Desk", "IT & Technology Operations", A, "no help-desk/support process for staff IT issues"),
  C("C14-S05", "IT Watch", "IT Operations Monitoring & Optimization", "IT & Technology Operations", A, "no IT performance/capacity monitoring"),
  // C15 — Customer & Revenue Automation
  C("C15-S01", "Customer Care", "Customer Experience Automation", "Customer & Revenue Automation", A, "manual customer support/service-request process with no automation"),
  C("C15-S02", "Sales Flow", "Lead & Sales Automation", "Customer & Revenue Automation", A, "manual lead capture/qualification/follow-up process"),
  C("C15-S03", "Onboard", "Customer Onboarding Automation", "Customer & Revenue Automation", A, "manual client onboarding process"),
  C("C15-S04", "Customer Pulse", "Customer Retention & Engagement", "Customer & Revenue Automation", A, "no retention/re-engagement process; churn or disengaged customers"),
  C("C15-S05", "Revenue Insight", "Revenue Intelligence & Optimization", "Customer & Revenue Automation", A, "revenue, pricing, or conversion decisions made without data analysis"),
  // C10 — Certified Specialist Services (human-delivered, project/annual — not subscriptions)
  C("C10-S01", "Real-World Test", "Penetration Testing", "Certified Specialist Services", S, "higher-maturity SMB handling sensitive data, facing enterprise/partner due-diligence review, or renewing cyber insurance with a pentest requirement; client has completed foundational security services and is ready for proof-based validation of real-world exposure", "project"),
  C("C10-S02", "Audit-Ready", "SOC 2 Type II Attestation", "Certified Specialist Services", S, "client mentions a customer, partner, or investor requiring formal SOC 2 attestation — not just an internal policy or governance review", "project"),
  C("C10-S03", "Payment-Ready", "PCI-DSS QSA Assessment", "Certified Specialist Services", S, "client processes, stores, or transmits payment card data; mentions a PCI-DSS requirement from a payment processor, acquirer, or bank", "project"),
  C("C10-S04", "Proof After Breach", "Certified Forensic Incident Response", "Certified Specialist Services", S, "client describes an active or recent security incident/breach needing a legally and insurance-admissible investigation, or their cyber insurer requires certified forensic findings", "project"),
];

// FOUND 2026-10-02 — Mohammad, reviewing a live report: "from a services page
// we only can offer whatever is avaiable on website, not some extra item are
// avaiable on our backend." Audited every one of this catalog's 67 codes
// against the real orgro.ca/services page (both its 16 individually-listed
// items AND the 4 packages' included-service lists) to check:
//   1. Is anything ODO could name here actually absent from the live page?
//      No — every security code is covered either as one of the 16
//      standalone items below, inside a package's included-service list (own
//      short-label naming, e.g. "Security Weakness Check" for C02-S01 — see
//      this file's header comment), or is C01-S01, the free lead-magnet tool
//      excluded from paid recommendations entirely (odo-packages.ts's
//      FREE_CODES). Nothing is backend-only.
//   2. Does every officialName here match the live page's wording exactly?
//      No — found 3 drifted (e.g. this file said "Privileged Access
//      Management", the live page actually says "Privileged Access Mgmt").
//      A client told to search the exact wording in their report could fail
//      to recognize the shortened live version as the same item.
// Fix: the 16 codes individually listed on the live page (12 à la carte-only
// + 4 Certified Specialist) are never hand-duplicated here again — their
// name comes straight from services-catalog.ts, so this file and the live
// page can't drift apart a second time. Every other code (package-bundled or
// automation) keeps its own officialName here, since those are never pointed
// at as a "go search this exact name" standalone item.
import { INDIVIDUAL_SERVICES, SPECIALIST_ENGAGEMENTS } from "@/app/[locale]/services/services-catalog";

const PUBLIC_NAME_BY_CODE: Record<string, string> = Object.fromEntries([
  ...INDIVIDUAL_SERVICES.map((s) => [s.code, s.name]),
  ...SPECIALIST_ENGAGEMENTS.map((s) => [s.code, s.name]),
]);

for (const service of SERVICE_CATALOG) {
  const publicName = PUBLIC_NAME_BY_CODE[service.code];
  if (publicName) service.officialName = publicName;
}

export const SERVICE_BY_CODE: Record<string, CatalogService> = Object.fromEntries(SERVICE_CATALOG.map((s) => [s.code, s]));

/** Project/engagement-billed codes (badged "By engagement" in the report, not a monthly price). */
export const PROJECT_BILLED_CODES: string[] = SERVICE_CATALOG.filter((s) => s.billing === "project").map((s) => s.code);
