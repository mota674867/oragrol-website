// The Services application form (managed cybersecurity: four packages and the 12 individual services). DRAFT for Mohammad's review,
// built in the same format as the BA and OR ONE applications (start page with the legal ticks, ranges and pick lists, one optional
// meeting note, signature page). Not registered and not published: status "draft" never opens for a client in production.
// Price is NOT asked or shown: the proposal carries fees, caps and extra charges (live Services page is the only price source).
// Specialist services (C10) are not offered here: they are held until after landing (Mohammad, 2026-11-09).
import type { Cond, Field, FormDefinition, PageSpec } from "../types";
import { APPROVAL_SPEED, DEVICES_TOTAL, INDUSTRIES, PROVINCES, START, STAFF, YEARS, band, pickMany, withOther } from "../choices.ts";

const PACKAGES = ["Foundation", "Advanced", "Comprehensive", "Elite", "Not sure, recommend for me"] as const;
const INDIVIDUAL = [
  "Virtual CISO", "Secure Software Development Lifecycle (SSDLC)", "Data Privacy Management", "AI Security Assessment", "AI Governance & Risk Management",
  "Privileged Access Management (PAM)", "Zero Trust Network Access (ZTNA)", "Cloud Network Security", "AI Model Security", "AI Data Security & Privacy",
  "AI Threat Detection & Protection", "Application Security Testing",
] as const;

const PLATFORM = ["Microsoft 365", "Google Workspace", "Both", "Neither", "Not sure"] as const;
const DEVICE_TYPES = ["Windows computers", "Mac computers", "Linux computers", "Phones and tablets (iPhone, Android)", "Servers in our own office or data centre"] as const;
const CLOUD = ["None", "1", "2", "3", "4 or more"] as const;
const SITES = ["None", "1", "2 to 3", "4 to 10", "More than 10"] as const;
const DEVELOPERS = ["None", "1 to 5", "6 to 10", "11 to 25", "More than 25"] as const;
const LOCATIONS = ["1", "2 to 3", "4 to 10", "More than 10"] as const;
const WORK_STYLE = ["Everyone works from our office", "A mix of office and home", "Mostly remote"] as const;
const MFA = ["Everyone uses it", "Some people use it", "Nobody uses it", "I am not sure"] as const;
const BACKUP = ["Yes, and we have tested a restore", "Yes, but never tested", "No backup", "I am not sure"] as const;
const PROVIDER = ["We have an in-house IT person", "We use an outside IT provider", "We have no IT contact or provider"] as const;
const INCIDENT = ["None", "One", "More than one"] as const;
const GOAL = ["Protect us from ransomware and email attacks", "Meet a customer, partner or insurer requirement", "Replace our current security provider",
  "We have no security help today", "Prepare for an audit or certification", "Reduce our risk before we grow"] as const;
const REQUIREMENT = ["Cyber insurance", "A customer or partner security questionnaire", "PCI-DSS (card payments)", "Health information rules", "SOC 2 requested by customers",
  "Privacy law (PIPEDA, Quebec Law 25)", "None of these"] as const;
const DATA = ["Customer personal information", "Employee personal information", "Payment card data", "Health information", "Source code or intellectual property", "None of these"] as const;
const TODAY_ENDPOINT = ["Microsoft Defender", "SentinelOne", "CrowdStrike", "Another product", "None", "Not sure"] as const;
const TODAY_EMAIL = ["Microsoft Defender for Office 365", "Google's built-in protection", "Proofpoint or Mimecast", "Another product", "None", "Not sure"] as const;
const TODAY_PROVIDER = ["No provider today", "An outside IT provider", "A managed security provider (MSSP)", "Our own team"] as const;
const CONTRACT_END = ["Within 3 months", "In 3 to 12 months", "More than 12 months", "There is no contract", "Not applicable"] as const;
const REPORT_RHYTHM = ["Monthly report is enough", "Monthly report and a quarterly review call"] as const;

const has = (pkg: string): Cond => ({ field: "individual", has: pkg });
const text = (id: string, label: string, o: Partial<Field> = {}): Field => ({ id, label, kind: "text", required: true, ...o });
const email = (id: string, label: string, o: Partial<Field> = {}): Field => ({ id, label, kind: "email", required: true, ...o });
const phone = (id: string, label: string, o: Partial<Field> = {}): Field => ({ id, label, kind: "phone", required: true, ...o });
const long = (id: string, label: string, o: Partial<Field> = {}): Field => ({ id, label, kind: "longtext", required: true, ...o });
const check = (id: string, label: string, textOf: string, o: Partial<Field> = {}): Field => ({ id, label, kind: "check", text: textOf, ...o });

/** Legal conditions for Services. DRAFT wording, not reviewed by counsel. Ticked on the start page. */
const LEGAL: readonly { title: string; text: string }[] = [
  { title: "The information is my company's responsibility.", text: "I confirm the information in this form is true and complete. ORAGROL relies on it to set the scope and the price. If it is wrong, incomplete or out of date, the result and any loss are not ORAGROL's fault, and the proposal and fees may change." },
  { title: "Read-only access, approved by my own administrator.", text: "ORAGROL needs read-only access to some of my systems (for example my Microsoft 365 or Google Workspace account and my security tools) to do the work. My own administrator approves that access in my account, after I sign. I do not send passwords, keys or card numbers in this form or by email." },
  { title: "Reports and approval.", text: "ORAGROL reviews and approves every report before it is sent to me. Any change to my systems, and any serious finding that needs action, needs my approval first. ORAGROL does not change my systems without it." },
  { title: "Urgent threats.", text: "If ORAGROL confirms a serious threat, it tells my named contact straight away. To contain a confirmed threat, ORAGROL or its security provider may isolate the affected device from the network and tell me immediately. I give my written authorisation for this in my Business Setup after I sign." },
  { title: "My responsibilities.", text: "I fix what ORAGROL reports unless I have contracted ORAGROL to do it. I keep my software updated, and I tell ORAGROL when people join or leave, when systems change, and about any suspected incident." },
  { title: "Third-party platforms and software.", text: "ORAGROL uses third-party security tools to deliver the services. Vendor price, features and data location change and are confirmed at order time. The proposal states who buys and pays for any platform licence. ORAGROL does not state that data is stored in Canada unless the vendor says so." },
  { title: "Authority and personal information.", text: "I may act for the company and may give ORAGROL access to the systems named here. This form contains personal information about my staff; they know, and I may give it to ORAGROL to prepare my proposal." },
  { title: "No guarantee and no certification.", text: "ORAGROL commits to the agreed work, not to a result. No service guarantees that an attack will not happen, and no ORAGROL report is a certification, an attestation or legal, tax or compliance advice." },
  { title: "No contract and no promise.", text: "This form is not a contract and no price is agreed. Nothing is connected or charged before I sign the contract. ORAGROL may decline an application or ask for more information." },
  { title: "Confidential and kept.", text: "The form is confidential and used only to assess my application and prepare my proposal. If no contract is signed, ORAGROL keeps it for 24 months and then deletes it. Governing law: Ontario and the federal laws of Canada." },
  { title: "The contract governs once signed.", text: "Once a contract is signed, the contract and the signed proposal govern and replace this form." },
];

const START_BODY = [
  "Thank you for applying for ORAGROL Services. This application is about 9 pages. Your answers are saved as you go, so you can leave and return with the same private link.",
  "We ask for this information so that we can understand your business and prepare your proposal. Nothing is connected or charged before you sign a contract.",
];
const AGREE = "to ORAGROL collecting and using the information in this form to assess my application and prepare my proposal, and I accept the terms and privacy notice above.";

const pages: PageSpec[] = [
  { kind: "fields", page: { id: "start", title: "Before you start", body: START_BODY, terms: LEGAL.map((l, i) => ({ title: `${i + 1}. ${l.title}`, text: l.text })), fields: [
    { id: "agree", label: "I agree", kind: "check", text: AGREE },
  ] } },
  { kind: "fields", page: { id: "company", title: "01 Your company", fields: [
    text("company_legal_name", "Company legal name", { prefill: "company" }),
    text("trade_name", "Trade name, if different", { required: false }),
    { id: "website", label: "Website", kind: "url", required: true, placeholder: "orgro.ca" },
    text("address", "Business address"),
    { id: "provinces", label: "Province(s) where you operate", kind: "multiselect", required: true, options: PROVINCES, choice: true },
    ...withOther(band("industry", "Which industry are you in?", INDUSTRIES)),
    band("staff", "How many people work for you in total, including contractors?", STAFF),
    band("years", "How many years has the company been in business?", YEARS),
    band("locations", "How many offices or locations do you have?", LOCATIONS),
  ] } },
  { kind: "fields", page: { id: "people", title: "02 People", fields: [
    text("dm_name", "Decision-maker: name and title", { prefill: "person", minWords: 3, help: "Name and title, for example Dan Lee, CEO." }),
    email("dm_email", "Decision-maker email", { prefill: "email" }),
    phone("dm_phone", "Decision-maker phone", { prefill: "phone" }),
    text("billing", "Billing contact: name and email"),
    band("tech_contact", "Your IT contact or current provider", PROVIDER),
    text("tech_name", "IT contact or provider: name, email and phone", { required: false, showIf: { not: { field: "tech_contact", is: "We have no IT contact or provider" } } }),
    text("change_approver", "Who approves changes to your systems? Name and role", { minWords: 3, help: "Name and role, for example Ali Karim, Operations Manager." }),
    text("urgent_name", "Who should we call first about an urgent threat? Name and phone", { minWords: 2 }),
    text("urgent_backup", "Backup person for urgent threats: name and phone", { minWords: 2 }),
  ] } },
  { kind: "fields", page: { id: "need", title: "03 What do you need", fields: [
    ...withOther(band("goal", "What is your main reason for applying?", GOAL)),
    band("package", "Which package are you interested in?", PACKAGES),
    pickMany("individual", "Which individual services do you want, on top of a package or on their own? Choose all that apply.", [...INDIVIDUAL, "None"]),
    band("incidents", "How many security incidents (for example a hacked account or ransomware) have you had in the last 12 months?", INCIDENT),
    band("start", "When do you want to start?", START),
  ] } },
  { kind: "fields", page: { id: "environment", title: "04 Your systems", fields: [
    band("platform", "Which email and office platform do you use?", PLATFORM),
    band("users", "How many people have an email account with you?", STAFF),
    band("devices", "How many computers and phones do your people use in total?", DEVICES_TOTAL),
    pickMany("device_types", "Which kinds of devices do you have? Choose all that apply.", DEVICE_TYPES),
    band("work_style", "How do your people work?", WORK_STYLE),
    band("cloud_accounts", "How many cloud accounts do you have (for example Azure, AWS, Google Cloud)?", CLOUD),
    band("sites", "How many websites or web applications do you run?", SITES),
    band("developers", "How many people write software for you?", DEVELOPERS, { showIf: { any: [has("Secure Software Development Lifecycle (SSDLC)"), has("Application Security Testing")] } }),
    band("mfa", "Do your people use a second step when they sign in (multi-factor authentication)?", MFA),
    band("backup", "Do you back up your important data?", BACKUP),
  ] } },
  { kind: "fields", page: { id: "today", title: "05 What you use today", intro: "Tell us what is in place so we do not duplicate it or clash with it. Pick the closest answer.", fields: [
    ...withOther(band("today_endpoint", "Protection on your computers today", TODAY_ENDPOINT)),
    ...withOther(band("today_email", "Email protection today", TODAY_EMAIL)),
    band("today_provider", "Who looks after your security today?", TODAY_PROVIDER),
    band("contract_end", "If you have a current provider, when does that contract end?", CONTRACT_END, { showIf: { not: { field: "today_provider", is: "No provider today" } } }),
  ] } },
  { kind: "fields", page: { id: "risk", title: "06 Your requirements", fields: [
    pickMany("requirements", "Which of these apply to you? Choose all that apply.", REQUIREMENT),
    pickMany("data", "What sensitive information do you hold? Choose all that apply.", DATA),
    ...withOther(band("report_rhythm", "How do you want to hear from us?", REPORT_RHYTHM)),
    text("report_to", "Who should receive the reports? Names and emails"),
    band("approval_speed", "How quickly can your approver decide when we ask? (we plan for about 2 working days)", APPROVAL_SPEED),
    check("isolation_notice", "Urgent threats: device isolation", "I understand that for a confirmed threat ORAGROL may isolate the affected device and tell me straight away, and that I give written authorisation for this after I sign."),
  ] } },
  { kind: "fields", page: { id: "meeting", title: "07 Request a meeting (optional)", intro: "You can pass this section without filling anything. If you would like a meeting, offer 2 or 3 date and time options, with your time zone. ORAGROL checks availability and tells you by email whether a slot is confirmed or which alternatives are free.", fields: [
    { id: "meet_want", label: "I would like a meeting", kind: "check", required: false, text: "I would like a meeting." },
    long("meet_options", "2 or 3 date and time options, with your time zone", { required: false, requiredIf: { field: "meet_want", is: true }, discuss: false }),
    { id: "meet_mode", label: "Phone or video", kind: "select", choice: true, options: ["Phone", "Video"], required: false, discuss: false, requiredIf: { field: "meet_want", is: true } },
    long("meet_attendees", "Who will attend (name and role)", { required: false, requiredIf: { field: "meet_want", is: true }, discuss: false }),
    long("meet_topics", "Anything you want to discuss in a meeting? Tell us here.", { required: false }),
  ] } },
  { kind: "fields", page: { id: "signature", title: "08 Name, details and signature", intro: "Every box is compulsory.", fields: [
    text("signer_name", "Name of the person signing", { group: "Signature", prefill: "person", discuss: false }),
    text("signer_title", "Title and authority (owner, director, officer)", { group: "Signature", discuss: false }),
    email("signer_email", "Email of the signer", { group: "Signature", prefill: "email", discuss: false }),
    phone("signer_phone", "Phone of the signer", { group: "Signature", prefill: "phone", discuss: false }),
    { id: "signer_company", label: "Company legal name", group: "Signature", kind: "copy", copyFrom: "company_legal_name" },
    { id: "completed_same", label: "Same person completed the form", group: "Signature", kind: "yesno", required: true, choice: true, discuss: false },
    text("completed_name", "Form completed by, if a different person: name", { group: "Signature", showIf: { field: "completed_same", is: "No" }, requiredIf: { field: "completed_same", is: "No" }, discuss: false }),
    text("completed_role", "Form completed by: role", { group: "Signature", showIf: { field: "completed_same", is: "No" }, requiredIf: { field: "completed_same", is: "No" }, discuss: false }),
    email("completed_email", "Form completed by: email", { group: "Signature", showIf: { field: "completed_same", is: "No" }, requiredIf: { field: "completed_same", is: "No" }, discuss: false }),
    { id: "signed_on", label: "Date (filled automatically)", group: "Signature", kind: "autodate" },
    { id: "signature", label: "Signature (type your full name)", group: "Signature", kind: "typed" },
    { id: "signer_authority", label: "I have authority to sign for the company", group: "Signature", kind: "check", text: "I have authority to sign for the company." },
    { id: "pdf_copy", label: "Send me a PDF copy of my answers by email", group: "After you submit", kind: "check", required: false, text: "Send me a PDF copy of my answers by email after I submit." },
  ] } },
];

export const servicesApplication: FormDefinition = {
  id: "services-application",
  name: "Services application form",
  formType: "application",
  product: "services",
  status: "draft",
  version: "0.1",
  pages,
  tiers: [],
  signature: { name: "signer_name", title: "signer_title", typed: "signature", agree: "signer_authority" },
  whatNext: [
    "We check that the platforms you use can connect, and confirm each vendor's price and data location with you.",
    "We send you a proposal: package, services, fees, staff included, limits and terms. If you asked for a meeting, we meet first.",
    "You approve the proposal and sign the contract. Nothing is connected before this.",
    "You complete your Business Setup: your administrator approves read-only access, and we confirm your contacts. Then your service starts.",
  ],
};
