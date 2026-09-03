export type IndustryDetail = {
  context: string;
  protect: string[];
  automate: string[];
  question: string;
  answer: string;
};

export const industryDetails: Record<string, IndustryDetail> = {
  "Professional Services": {
    context: "PIPEDA may require safeguards appropriate to the sensitivity of personal information, breach reporting where there is a real risk of significant harm, notification, and breach records. Provincial privacy and professional rules may also apply. Accounting, legal and advisory firms should confirm their exact obligations during scoping.",
    protect: ["Enforce MFA across email, cloud, accounting and privileged accounts.","Validate legitimate senders before moving SPF, DKIM and DMARC toward enforcement.","Independently verify payment instructions and banking-detail changes.","Review staff, contractor and vendor access at departures and on a defined schedule.","Protect client-document exchange, test backup restoration and document incident response."],
    automate: ["Lead-to-Close Automation for referrals, proposals and engagement follow-up.","Secure client intake with document-status tracking and approved onboarding steps.","Know Your Numbers for capacity, work in progress, billing and client-service visibility."],
    question: "What is the most common practical cyber risk for a professional-services firm?",
    answer: "Compromised email and identity are high-leverage risks because they can expose confidential information and enable convincing payment or account-change fraud."
  },
  Healthcare: {
    context: "In Ontario, PHIPA governs health information custodians and their agents. Custodians remain responsible when third-party providers are used, and breach notification and annual statistical reporting duties can apply. Other provinces have their own health-privacy regimes.",
    protect: ["Enforce MFA for clinical, billing, remote and privileged accounts.","Use role-based access and review it after every staffing change.","Manage and patch every endpoint that touches patient information.","Test restoration of critical systems and maintain downtime procedures.","Review vendor safeguards, access, breach notice and data-disposition terms."],
    automate: ["Approved reminders, intake status and non-clinical follow-up with staff escalation.","Administrative intake that checks completeness without automating clinical decisions.","Outsourced IT Operations for endpoint health, tickets, device lifecycle and recurring access work."],
    question: "Does a cloud healthcare vendor take privacy responsibility away from an Ontario clinic?",
    answer: "No. Ontario guidance makes clear that a custodian remains responsible for personal health information in its custody or control, including when providers are involved."
  },
  "Financial Services": {
    context: "The applicable framework depends on the activity. OSFI B-13 and B-10 apply to federally regulated financial institutions, not every financial SMB. FINTRAC applies to defined reporting entities and covered activities. Provincial, contractual and professional rules may also apply.",
    protect: ["Use strong MFA for privileged, email, financial and remote accounts.","Separate and monitor administrative privilege.","Require independent verification for payment and account-detail changes.","Maintain vendor inventories, risk assessments, contract controls and exit plans.","Test incident response, continuity and recovery around critical workflows."],
    automate: ["Compliance workflow support for evidence, review, exceptions and approvals.","Controlled client onboarding with required human review.","Know Your Numbers for authorized pipeline, service, exception and risk views."],
    question: "Does OSFI Guideline B-13 apply to every Canadian financial business?",
    answer: "No. B-13 applies to federally regulated financial institutions. Other financial businesses may face different federal, provincial, contractual or professional obligations."
  },
  "Retail & E-commerce": {
    context: "Canadian privacy law may govern customer information. PCI DSS is a payment-card industry standard, not Canadian legislation. PCI DSS v4.0.1 includes e-commerce attention to payment-page scripts and change or tamper detection.",
    protect: ["Enforce MFA for store administration, email, payments and remote access.","Minimize storage and exposure of payment and personal information.","Control plug-ins, scripts, integrations and updates.","Monitor payment-page changes, public applications, APIs and availability.","Review third-party access and test restoration before peak periods."],
    automate: ["Always-On Customer Support for approved answers, routing and human escalation.","Grow & Retain for consent-aware post-purchase, loyalty and reactivation journeys.","Know Your Numbers for inventory, fulfilment, returns and campaign visibility."],
    question: "Is PCI DSS a Canadian privacy law?",
    answer: "No. PCI DSS is a payment-card industry security standard. Canadian privacy laws may separately govern the personal information a retailer handles."
  },
  Manufacturing: {
    context: "Canadian cyber guidance highlights supply-chain threats, ransomware and risk-based security for smaller organizations. Exact duties depend on products, customers, safety, export controls, critical-infrastructure role and the information handled.",
    protect: ["Inventory IT, OT, connected equipment, remote paths and critical dependencies.","Separate business and production environments where feasible.","Use approved, time-limited and monitored vendor access.","Prioritize vulnerabilities by exposure, exploitability, safety and production impact.","Test recovery for business systems and production-critical configurations."],
    automate: ["Outsourced IT Operations for endpoints, access, service requests and recurring evidence.","Know Your Numbers for authorized inventory, quality, downtime and supplier indicators.","Supplier workflows for approvals, evidence, expiry dates and exceptions."],
    question: "Why is vendor access a major manufacturing cyber risk?",
    answer: "Permanent, excessive or unmonitored supplier access can create a path into business or production environments when a vendor identity or system is compromised."
  },
  Technology: {
    context: "Privacy, customer contracts, insurer conditions and supply-chain requirements all matter. Canada's proposed Artificial Intelligence and Data Act should not be described as enacted law; current advice should focus on privacy, security, approved use, human oversight and accountability.",
    protect: ["Centralize identity, enforce MFA and control joiner, mover and leaver events.","Protect cloud administration, source code, CI/CD and secrets.","Establish secure development, dependency, vulnerability and release practices.","Inventory APIs, integrations, data flows and third-party components.","Define approved AI uses, prohibited data and human-review requirements."],
    automate: ["Lead-to-Close Automation for demand, qualification, proposals and handoff.","Always-On Customer Support for approved knowledge, routing and escalation.","Know Your Numbers for product, service, customer and revenue indicators."],
    question: "Is Canada's proposed Artificial Intelligence and Data Act currently law?",
    answer: "No. Technology companies should still establish practical AI governance around privacy, security, approved use, human oversight and accountability."
  },
  "Construction & Real Estate": {
    context: "Real-estate brokers, representatives and developers can have FINTRAC duties when performing covered activities. Obligations differ by entity and activity. Privacy and contract requirements may also apply.",
    protect: ["Enforce MFA across email, project, property, finance and remote systems.","Independently verify payment and banking-detail changes.","Manage mobile devices and protect business information.","Give contractors time-bound, least-privilege access.","Review access at project completion and retain required records."],
    automate: ["Lead-to-Close Automation for enquiries, appointments, proposals and long-cycle follow-up.","Project intake for approved documents, missing items, routing and status.","Outsourced IT Operations for distributed devices, accounts and recurring service work."],
    question: "Do all Canadian construction and real-estate businesses have the same FINTRAC obligations?",
    answer: "No. Obligations depend on the entity and activities performed; covered businesses must assess the current guidance specific to them."
  },
  Education: {
    context: "Privacy duties depend on province and whether the institution is public or private. Ontario regulator findings on PowerSchool emphasize vendor oversight, contractual safeguards and continued responsibility for information in an institution's custody or control.",
    protect: ["Enforce MFA for staff, administrators, remote and privileged accounts.","Review roles as students, staff and contractors enter or leave.","Protect endpoints, especially administrator and shared devices.","Assess education-technology vendors, contracts, access and data disposition.","Test restoration and maintain learning-continuity and incident plans."],
    automate: ["Approved routine information and support with escalation to staff.","Admissions administration for document status, reminders and authorized handoffs.","Outsourced IT Operations for devices, accounts, tickets and access work."],
    question: "Does an education organization transfer privacy responsibility to its software provider?",
    answer: "Not automatically. Applicable law and organization type matter, but recent Ontario findings emphasize active vendor oversight and continued responsibility."
  },
  "Other Canadian SMBs": {
    context: "PIPEDA can apply to personal information handled in commercial activity. Alberta, British Columbia and Quebec have substantially similar private-sector laws, while sector and provincial duties may also apply. Canadian baseline controls offer a practical risk-based starting point.",
    protect: ["Document critical assets, accounts, data and vendors.","Enforce MFA across email, cloud, finance and administration.","Manage endpoints, updates, backups and privileged access.","Protect email and train staff around phishing and payment fraud.","Test recovery and define incident decision ownership."],
    automate: ["Lead-to-Close Automation so enquiries and proposals do not go cold.","Always-On Customer Support for consistent routing, answers and escalation.","Know Your Numbers for governed, current reporting.","Outsourced IT Operations for routine devices, accounts, tickets and access."],
    question: "Where should a Canadian SMB begin with cybersecurity?",
    answer: "Begin with a risk baseline covering critical accounts, devices, data, vendors, backups and business processes, then prioritize MFA, email protection, managed updates and tested recovery."
  }
};
