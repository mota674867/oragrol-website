// The OR ONE application form: structure plan v1 (Mohammad, 2026-11-02), page by page. DRAFT.
// Nothing here is final: the item list, tools and vendors come from the handling tables and the vendor verification round (see catalogue.ts),
// and the legal wording on the last page is a draft for counsel (retention period and governing law still to confirm).
// Status stays "draft" until Mohammad approves the form; a draft form never opens for a client in production.
import type { Cond, Field, FormDefinition, PageSpec } from "../types";
import { CATEGORY_NAMES } from "../catalogue.ts";

const PROVINCES = ["Alberta", "British Columbia", "Manitoba", "New Brunswick", "Newfoundland and Labrador", "Northwest Territories", "Nova Scotia",
  "Nunavut", "Ontario", "Prince Edward Island", "Quebec", "Saskatchewan", "Yukon", "Outside Canada"];

const anyCategory = (...names: string[]): Cond => ({ any: names.map((category) => ({ category })) });
const notNone = (field: string): Cond => ({ not: { field, is: "None / not applicable" } });

const text = (id: string, label: string, o: Partial<Field> = {}): Field => ({ id, label, kind: "text", required: true, ...o });
const email = (id: string, label: string, o: Partial<Field> = {}): Field => ({ id, label, kind: "email", required: true, ...o });
const phone = (id: string, label: string, o: Partial<Field> = {}): Field => ({ id, label, kind: "phone", required: true, ...o });
const num = (id: string, label: string, o: Partial<Field> = {}): Field => ({ id, label, kind: "number", required: true, ...o });
const long = (id: string, label: string, o: Partial<Field> = {}): Field => ({ id, label, kind: "longtext", required: true, ...o });

/** One approver block: name, role, email, phone, backup. Shown only when one of the mapped categories is picked. (DRAFT mapping of areas to categories: to confirm.) */
function approver(key: string, area: string, showIf: Cond): Field[] {
  return [
    text(`${key}_name`, "Approver name", { group: area, showIf }),
    text(`${key}_role`, "Role", { group: area, showIf }),
    email(`${key}_email`, "Email", { group: area, showIf }),
    phone(`${key}_phone`, "Phone", { group: area, showIf }),
    text(`${key}_backup`, "Backup person (name and email)", { group: area, showIf }),
  ];
}

const LEGAL: readonly { title: string; text: string }[] = [
  { title: "The information is my company's responsibility.", text: "I confirm the information is true and complete. ORAGROL relies on it to set the scope, the rules and the price. If it is wrong, incomplete or out of date, the result and any loss are not ORAGROL's fault, and the proposal and fees may change." },
  { title: "My company decides; ORAGROL follows.", text: "Every rule above (automatic, needs approval, red flag, limits, \"never do\") is my company's decision. ORAGROL builds the system to follow those rules exactly and is responsible for following them. What happens inside the rules is my company's responsibility." },
  { title: "The named decider and approvers.", text: "The people named are authorized to decide and approve for my company. ORAGROL may rely on an approval given by a named person through the dashboard. I will tell ORAGROL immediately if a named person changes." },
  { title: "Money, law and government.", text: "Nothing in these areas happens without my named approver's approval first. After approval, ORAGROL carries out exactly what was approved. ORAGROL does not accept responsibility for my company's decisions, and does not give legal, tax, financial or professional advice. My own licensed professionals review anything with legal, tax or regulatory weight." },
  { title: "Lawful use.", text: "My company is responsible for using the system lawfully: for example consent for recording calls and meetings, notices that AI is used, privacy, anti-spam, advertising and employment law, and the content of messages sent to my customers, suppliers and staff." },
  { title: "Authority and access.", text: "I may act for the company and may give ORAGROL access to the systems, accounts and data named here. I am responsible for permissions from my own vendors and other third parties. The people named here know their details are given to ORAGROL." },
  { title: "Third-party software.", text: "I buy my software directly from vendors and pay them. ORAGROL is not the seller. Vendor price, features and data location change and are confirmed at order time; ORAGROL does not state that data is stored in Canada unless the vendor says so." },
  { title: "No contract and no promise.", text: "This form is not a contract and no price is agreed. Nothing is built or connected before I sign the contract. ORAGROL commits to the agreed work, not to a result." },
  { title: "Confidential and kept.", text: "The form is confidential. If no contract is signed, ORAGROL keeps it for [retention period, to confirm] and then deletes it. Governing law: Ontario and the federal laws of Canada [to confirm with counsel]." },
  { title: "The contract governs.", text: "Once a contract is signed, the contract governs." },
];

const pages: PageSpec[] = [
  { kind: "fields", page: { id: "company", title: "Your company", fields: [
    text("company_legal_name", "Company legal name", { prefill: "company" }),
    text("trade_name", "Trade name, if different", { required: false }),
    { id: "website", label: "Website", kind: "url", required: true, placeholder: "orgro.ca" },
    text("address", "Business address"),
    { id: "provinces", label: "Province(s) where you operate", kind: "multiselect", required: true, options: PROVINCES, choice: true },
    text("industry", "Industry"),
    num("years", "Years in business", { max: 500 }),
    text("lang_customers", "Main language of your customers"),
    text("lang_staff", "Main language of your staff"),
    num("employees", "Employees on payroll"),
    num("staff_all", "All staff including contractors", { help: "The standard staff size per tier is shown in the proposal; above it, an extra charge is set there." }),
    num("entities", "Number of companies (legal entities) to cover", { min: 1, help: "One is included. Extra companies count their own points." }),
    text("currencies", "Currencies you work in"),
    { id: "year_end", label: "Financial year-end date", kind: "date", requiredIf: anyCategory(CATEGORY_NAMES.finance) },
  ] } },
  { kind: "fields", page: { id: "people", title: "People", fields: [
    text("dm_name", "Decision-maker: name", { prefill: "person", help: "The person who signs and decides." }),
    text("dm_title", "Decision-maker: title"),
    email("dm_email", "Decision-maker: email", { prefill: "email" }),
    phone("dm_phone", "Decision-maker: phone", { prefill: "phone" }),
    text("billing_name", "Billing contact: name"),
    email("billing_email", "Billing contact: email"),
    text("tech_name", "Technical contact or IT provider: name", { allowNone: true }),
    email("tech_email", "Technical contact or IT provider: email", { requiredIf: notNone("tech_name"), showIf: notNone("tech_name") }),
    text("acct_name", "Accountant: name", { required: false, requiredIf: anyCategory(CATEGORY_NAMES.finance, CATEGORY_NAMES.legal, CATEGORY_NAMES.leadership) }),
    text("acct_firm", "Accountant: firm", { required: false, requiredIf: anyCategory(CATEGORY_NAMES.finance, CATEGORY_NAMES.legal, CATEGORY_NAMES.leadership) }),
    email("acct_email", "Accountant: email", { required: false, requiredIf: anyCategory(CATEGORY_NAMES.finance, CATEGORY_NAMES.legal, CATEGORY_NAMES.leadership) }),
    text("lawyer_name", "Lawyer: name", { required: false, requiredIf: anyCategory(CATEGORY_NAMES.hr, CATEGORY_NAMES.legal, CATEGORY_NAMES.leadership) }),
    text("lawyer_firm", "Lawyer: firm", { required: false, requiredIf: anyCategory(CATEGORY_NAMES.hr, CATEGORY_NAMES.legal, CATEGORY_NAMES.leadership) }),
    text("privacy_name", "Privacy contact: name", { required: false, requiredIf: anyCategory(CATEGORY_NAMES.legal) }),
    email("privacy_email", "Privacy contact: email", { required: false, requiredIf: anyCategory(CATEGORY_NAMES.legal) }),
    { id: "requesters", label: "People allowed to send requests (up to 5)", kind: "people", required: true, min: 1, max: 5,
      columns: [{ id: "name", label: "Name", kind: "text" }, { id: "role", label: "Role", kind: "text" }, { id: "email", label: "Email", kind: "email" }] },
  ] } },
  { kind: "fields", page: { id: "need", title: "What you need", fields: [
    long("goal", "Main goal, in your own words"),
    long("time_sink", "What takes most of your team's time today"),
    num("hours", "Hours a week spent on these tasks (estimate)", { max: 100_000 }),
    { id: "items", label: "Items you need", kind: "items", required: true, discuss: false, help: "Choose from the 10 categories. The points counter shows your estimated plan size." },
    { id: "start", label: "Wanted start date", kind: "date", required: true },
    long("urgent", "Anything urgent or time-limited", { required: false }),
  ] } },
  { kind: "tools", id: "software", title: "Your software", intro: "One tool serves every item that needs it. You buy software directly from vendors and pay them; ORAGROL confirms price, connection and data location at order time.",
    extra: [{ id: "platform", label: "Platform", kind: "select", required: true, choice: true, options: ["Microsoft 365", "Google Workspace"] }] },
  { kind: "situation", id: "situation", title: "Size and situation", intro: "A few numbers per category. Best estimates are fine." },
  { kind: "itemRules", id: "rules", title: "Your rules, item by item", intro: "For each item, choose how it should run. Nothing is pre-selected: the choice is yours." },
  { kind: "fields", page: { id: "approvers", title: "Approvers and escalation", fields: [
    ...approver("ap_money", "Money", anyCategory(CATEGORY_NAMES.finance, CATEGORY_NAMES.procurement)),
    ...approver("ap_people", "People and hiring", anyCategory(CATEGORY_NAMES.hr)),
    ...approver("ap_legal", "Legal and government", anyCategory(CATEGORY_NAMES.legal)),
    ...approver("ap_it", "IT access", anyCategory(CATEGORY_NAMES.it)),
    ...approver("ap_publish", "Publishing and advertising", anyCategory(CATEGORY_NAMES.marketing)),
    email("usage_email", "Who gets usage notices (email)"),
    text("reach_time", "Best time to reach the decider"),
    text("urgent_contact", "Urgent contact (name and phone)"),
    text("escalation", "Who to call if the system cannot continue"),
    { id: "ap_authorized", label: "The people named here are authorized to approve on behalf of the company.", kind: "check", text: "The people named here are authorized to approve on behalf of the company." },
  ] } },
  { kind: "fields", page: { id: "rules_general", title: "Your rules in general", fields: [
    long("always", "Rules ZM77 must always follow (policy, discounts, tone, wording)", { allowNone: true }),
    long("never", "Things ZM77 must never do", { allowNone: true }),
    text("tone", "Tone of voice for customer and supplier messages"),
    text("languages", "Languages for messages"),
    long("material", "Existing material to share later (brand guide, price list, policies, templates)", { required: false, help: "You upload it after signing, in Business setup." }),
  ] } },
  { kind: "fields", page: { id: "meeting", title: "Request a meeting", intro: "Optional, unless you ticked \"I need to discuss this in a meeting\" next to any item. Your proposal waits on those items until we have talked.", fields: [
    { id: "meet_want", label: "I would like a meeting", kind: "check", required: false, text: "I would like a meeting." },
    long("meet_options", "2 or 3 date and time options, with your time zone", { required: false, requiredIf: { any: [{ field: "meet_want", is: true }, { flagged: true }] }, discuss: false }),
    { id: "meet_mode", label: "Phone or video", kind: "select", choice: true, options: ["Phone", "Video"], requiredIf: { any: [{ field: "meet_want", is: true }, { flagged: true }] }, discuss: false },
    long("meet_attendees", "Who will attend (name, role)", { required: false, requiredIf: { any: [{ field: "meet_want", is: true }, { flagged: true }] }, discuss: false }),
    long("meet_topics", "Anything else to discuss", { required: false }),
  ] } },
  { kind: "fields", page: { id: "confirm", title: "Confirm and legal", intro: "Every box is compulsory. This wording is a draft.", fields: [
    ...LEGAL.map((l, i): Field => ({ id: `legal_${i + 1}`, label: `${i + 1}. ${l.title}`, kind: "check", text: l.text })),
    text("signer_name", "Name of the person signing", { group: "Signature", prefill: "person", discuss: false }),
    text("signer_title", "Title and authority (owner, director, officer)", { group: "Signature", discuss: false }),
    email("signer_email", "Email of the signer", { group: "Signature", prefill: "email", discuss: false }),
    phone("signer_phone", "Phone of the signer", { group: "Signature", prefill: "phone", discuss: false }),
    { id: "signer_company", label: "Company legal name", group: "Signature", kind: "copy", copyFrom: "company_legal_name" },
    { id: "completed_same", label: "I completed this form myself", group: "Signature", kind: "yesno", required: true, choice: true, discuss: false },
    text("completed_name", "Form completed by: name", { group: "Signature", showIf: { field: "completed_same", is: "No" }, requiredIf: { field: "completed_same", is: "No" }, discuss: false }),
    text("completed_role", "Form completed by: role", { group: "Signature", showIf: { field: "completed_same", is: "No" }, requiredIf: { field: "completed_same", is: "No" }, discuss: false }),
    email("completed_email", "Form completed by: email", { group: "Signature", showIf: { field: "completed_same", is: "No" }, requiredIf: { field: "completed_same", is: "No" }, discuss: false }),
    { id: "signed_on", label: "Date", group: "Signature", kind: "autodate" },
    { id: "signature", label: "Type your full name as your signature", group: "Signature", kind: "typed" },
    { id: "signer_authority", label: "I have authority to sign for the company", group: "Signature", kind: "check", text: "I have authority to sign for the company." },
  ] } },
];

export const orOneApplication: FormDefinition = {
  id: "or-one-application",
  name: "OR ONE application form",
  formType: "application",
  product: "or_one",
  status: "draft",
  version: "draft-1",
  pages,
  tiers: [
    { name: "STARTER", maxPoints: 30, oneCategoryOnly: true },
    { name: "100", maxPoints: 100 },
    { name: "200", maxPoints: 200 },
    { name: "400", maxPoints: 400 },
  ],
  signature: { name: "signer_name", title: "signer_title", typed: "signature", agree: "signer_authority" },
  whatNext: [
    "ORAGROL checks your answers and the tools you named.",
    "We prepare your proposal and, if you asked for one, arrange the meeting.",
    "You review the proposal and sign the contract.",
    "Only then do we build, set up and go live with you.",
  ],
};
