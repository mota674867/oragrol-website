// The OR ONE application form, as the approved PDF sample (OR ONE Application Form), with the decisions of 2026-11-03 applied:
//   - the start page explains the form, why we collect the information, the page count and rules, and holds the legal ticks
//     (every page is locked until those are ticked);
//   - items are picked in section 03 (What do you need?), so the software and size pages show only the chosen categories;
//   - investor/board reporting is locked (approval or red flag only);
//   - payments is asked once, in Finance;
//   - the last page is name, details and signature, then the optional tick to receive a PDF copy by email.
// Status stays "draft" until Mohammad approves the form and the vendor round 2 is done. A draft form never opens for a client in production.
import type { Cond, Field, FormDefinition, PageSpec } from "../types";
import { CATEGORY_NAMES } from "../catalogue.ts";

const PROVINCES = ["Alberta", "British Columbia", "Manitoba", "New Brunswick", "Newfoundland and Labrador", "Northwest Territories", "Nova Scotia",
  "Nunavut", "Ontario", "Prince Edward Island", "Quebec", "Saskatchewan", "Yukon", "Outside Canada"];

const anyCategory = (...names: string[]): Cond => ({ any: names.map((category) => ({ category })) });

const text = (id: string, label: string, o: Partial<Field> = {}): Field => ({ id, label, kind: "text", required: true, ...o });
const email = (id: string, label: string, o: Partial<Field> = {}): Field => ({ id, label, kind: "email", required: true, ...o });
const phone = (id: string, label: string, o: Partial<Field> = {}): Field => ({ id, label, kind: "phone", required: true, ...o });
const num = (id: string, label: string, o: Partial<Field> = {}): Field => ({ id, label, kind: "number", required: true, ...o });
const long = (id: string, label: string, o: Partial<Field> = {}): Field => ({ id, label, kind: "longtext", required: true, ...o });

/** One approver block (PDF section 07): name and role, email, phone, backup. Shown only when its area was chosen. */
function approver(key: string, area: string, showIf: Cond): Field[] {
  return [
    text(`${key}_name`, "Name and role", { group: area, showIf }),
    email(`${key}_email`, "Email", { group: area, showIf }),
    phone(`${key}_phone`, "Phone", { group: area, showIf }),
    text(`${key}_backup`, "Backup person (name and email)", { group: area, showIf }),
  ];
}

/** The 10 clauses, word for word from the PDF (section 11). Ticked on the start page, before anything else opens. */
const LEGAL: readonly { title: string; text: string }[] = [
  { title: "The information is my company's responsibility.", text: "I confirm the information in this form is true and complete. ORAGROL relies on it to set the scope, the rules and the price. If it is wrong, incomplete or out of date, the result and any loss are not ORAGROL's fault, and the proposal and fees may change." },
  { title: "The client decides; ORAGROL follows.", text: "Every rule above (automatic, needs approval, red flag, limits, \"never do\") is my company's decision. ORAGROL builds the system to follow those rules exactly and is responsible for following them. What happens inside the rules is my company's responsibility. ORAGROL takes no decision on my behalf unless I ask it in this form or in writing. My company alone, not ORAGROL, is responsible to my own customers, suppliers, staff and other third parties for my decisions and for what is sent in my name." },
  { title: "Named decider and approvers.", text: "The people named are authorized to decide and approve for my company. ORAGROL may rely on an approval given by a named person through the dashboard. I will tell ORAGROL immediately if a named person changes." },
  { title: "Money, law and government.", text: "Nothing in these areas happens without my named approver's approval first. After approval, ORAGROL carries out exactly what was approved. ORAGROL does not accept responsibility for my company's decisions and does not give legal, tax, financial or professional advice. My own licensed professionals review anything with legal, tax or regulatory weight." },
  { title: "Lawful use.", text: "My company is responsible for using the system lawfully: for example consent for recording calls and meetings, notices that AI is used, privacy, anti-spam, advertising and employment law, and the content of messages sent to my customers, suppliers and staff." },
  { title: "Authority and access.", text: "I may act for the company and may give ORAGROL access to the systems, accounts and data named here. I am responsible for permissions from my own vendors and other third parties. The people named here know their details are given to ORAGROL." },
  { title: "Third-party software.", text: "I buy my software directly from vendors and pay them. ORAGROL is not the seller. Vendor price, features and data location change and are confirmed at order time; ORAGROL does not state that data is stored in Canada unless the vendor says so." },
  { title: "No contract and no promise.", text: "This form is not a contract and no price is agreed. Nothing is built or connected before I sign the contract. ORAGROL commits to the agreed work, not to a result." },
  { title: "Confidential and kept.", text: "The form is confidential. If no contract is signed, ORAGROL keeps it for [retention period, to confirm] and then deletes it. Governing law: Ontario and the federal laws of Canada [to confirm with counsel]." },
  { title: "The contract governs once signed.", text: "Once a contract is signed, the contract and the signed proposal govern, not this form." },
];

const START_BODY = [
  "What this form is: your application for OR ONE. ORAGROL uses your answers to prepare a proposal for you. It is not a contract, and no price is agreed by completing it.",
  "Why we ask: to understand your business, the items you need, the tools you already use, and who approves what. ZM77 follows the rules you set, so the rules must be complete and clear. Nothing is built before you sign a contract.",
  "What happens next: we check that your tools can connect, confirm each vendor's price and data location with you, send a proposal, and build and test only after you sign.",
  "How many pages: 11 to 20, depending on how many categories you choose (one rules page per category). Compulsory fields are marked with a star *. Your answers are saved as you go.",
  "Please read the ten conditions below and tick each one. The form opens only after you tick them all.",
];

const pages: PageSpec[] = [
  { kind: "fields", page: { id: "start", title: "Before you start", body: START_BODY, fields: [
    ...LEGAL.map((l, i): Field => ({ id: `legal_${i + 1}`, label: `${i + 1}. ${l.title}`, kind: "check", text: l.text })),
  ] } },
  { kind: "fields", page: { id: "company", title: "01 Your company", intro: "Standard staff size per tier: STARTER under 8, OR ONE 100 under 20, OR ONE 200 under 30, OR ONE 400 under 50. More staff is possible with an extra charge set in your proposal. One company is included; each extra company counts its own points. Financial year-end is compulsory if you choose Finance items.", fields: [
    text("company_legal_name", "Company legal name", { prefill: "company" }),
    text("trade_name", "Trade name, if different", { required: false }),
    { id: "website", label: "Website", kind: "url", required: true, placeholder: "orgro.ca" },
    text("address", "Business address"),
    { id: "provinces", label: "Province(s) where you operate", kind: "multiselect", required: true, options: PROVINCES, choice: true },
    text("industry", "Industry"),
    num("years", "Years in business", { max: 500 }),
    text("lang_customers", "Main language of your customers"),
    text("lang_staff", "Language of your staff"),
    num("employees", "Employees on payroll"),
    num("staff_all", "All staff including contractors"),
    num("entities", "Number of companies (legal entities) to cover", { min: 1 }),
    text("currencies", "Currencies you work in"),
    { id: "year_end", label: "Financial year-end date", kind: "date", requiredIf: anyCategory(CATEGORY_NAMES.finance) },
  ] } },
  { kind: "fields", page: { id: "people", title: "02 People", intro: "Accountant: compulsory if you choose Finance, Legal or Leadership items. Lawyer: if HR, Legal or Leadership. Privacy contact: if Legal. Otherwise optional.", fields: [
    text("dm_name", "Decision-maker: name and title", { prefill: "person" }),
    email("dm_email", "Decision-maker email", { prefill: "email" }),
    phone("dm_phone", "Decision-maker phone", { prefill: "phone" }),
    text("billing", "Billing contact: name and email"),
    text("tech_contact", "Technical contact or IT provider (or \"None\")", { allowNone: true }),
    text("acct", "Accountant: name, firm, email", { required: false, requiredIf: anyCategory(CATEGORY_NAMES.finance, CATEGORY_NAMES.legal, CATEGORY_NAMES.leadership) }),
    text("lawyer", "Lawyer: name and firm", { required: false, requiredIf: anyCategory(CATEGORY_NAMES.hr, CATEGORY_NAMES.legal, CATEGORY_NAMES.leadership) }),
    text("privacy_contact", "Privacy contact: name and email", { required: false, requiredIf: anyCategory(CATEGORY_NAMES.legal) }),
    text("reach_time", "Best time to reach the decision-maker"),
    { id: "requesters", label: "Up to 5 named people from your team can send us requests. Name at least one.", kind: "people", required: true, min: 1, max: 5,
      columns: [{ id: "name", label: "Name", kind: "text" }, { id: "role", label: "Role", kind: "text" }, { id: "email", label: "Email", kind: "email" }] },
  ] } },
  { kind: "fields", page: { id: "need", title: "03 What do you need?", intro: "Choose your items below. Every item has points. Your total decides your size: OR ONE STARTER is one category, up to 30 points; OR ONE 100, 200 and 400 are for larger selections; above 400 points is a Signature setup (contact us). Your proposal states your exact size and fees.", fields: [
    long("goal", "Your main goal, in your own words"),
    long("time_sink", "What takes most of your team's time today"),
    num("hours", "Hours a week spent on these tasks (estimate)", { required: false }),
    { id: "items", label: "Items you need", kind: "items", required: true, discuss: false },
    { id: "start", label: "Wanted start date", kind: "date", required: true },
    long("urgent", "Anything urgent or time-limited", { required: false }),
  ] } },
  { kind: "tools", id: "software", title: "04 Your software", intro: "For each tool type you need, choose one, name the tool you already use, or tick \"Not sure, recommend\". We check that a tool you already use can connect before you sign. You buy and pay for your software directly from the vendor. We confirm each vendor's current price and where it stores data when you order. Show only the categories you chose in section 03." },
  { kind: "situation", id: "situation", title: "05 Size and situation", intro: "Complete only the categories you chose in section 03." },
  { kind: "itemRules", id: "rules", title: "06 Your rules, item by item", intro: "The client decides; ZM77 follows. For each item you chose, choose how ZM77 works: Automatic (ZM77 acts alone, within the limits you write), Needs my approval (your named approver approves first), or Red flag (ZM77 hands the case to a person). A blank or unclear choice is treated as \"Needs my approval\". Items marked locked (money, people, law, and investor or board reporting) can never run automatically. ORAGROL's fixed limits are shown on each item. ORAGROL does not give legal, tax or financial advice." },
  { kind: "fields", page: { id: "approvers", title: "07 Approvers and escalation", intro: "Name who approves each area you chose. Each needs a name, role, email, phone and a backup person.", fields: [
    ...approver("ap_money", "Money", anyCategory(CATEGORY_NAMES.finance, CATEGORY_NAMES.procurement)),
    ...approver("ap_people", "People and hiring", anyCategory(CATEGORY_NAMES.hr)),
    ...approver("ap_legal", "Legal and government", anyCategory(CATEGORY_NAMES.legal)),
    ...approver("ap_it", "IT access", anyCategory(CATEGORY_NAMES.it)),
    ...approver("ap_publish", "Publishing and advertising", anyCategory(CATEGORY_NAMES.marketing)),
    email("usage_email", "Who gets usage notices (email)"),
    text("urgent_contact", "Urgent contact for the decision-maker (name and phone)"),
    text("escalation", "Escalation: who to call if the system cannot continue"),
    { id: "ap_authorized", label: "The people named above are authorized to approve on behalf of the company", kind: "check", text: "The people named above are authorized to approve on behalf of the company." },
  ] } },
  { kind: "fields", page: { id: "rules_general", title: "08 Your rules in general", fields: [
    long("always", "Rules ZM77 must always follow, or \"None\" (policy, discounts, tone, wording)", { allowNone: true }),
    long("never", "Things ZM77 must never do, or \"None\"", { allowNone: true }),
    text("tone", "Tone of voice for messages to customers and suppliers"),
    text("languages", "Languages for messages", { required: false }),
    long("material", "Existing material to share later (brand guide, price list, policies, templates)", { required: false, help: "You upload it after signing, in your Business setup. Nothing is uploaded with this form." }),
  ] } },
  { kind: "fields", page: { id: "meeting", title: "09 Request a meeting (optional)", intro: "You can pass this section without filling anything. If you ticked \"I need to discuss this in a meeting\" on any field, those fields become your meeting agenda. Offer 2 or 3 date and time options, with your time zone. ORAGROL checks availability and tells you by email whether a slot is confirmed or which alternatives are free. More than 5 ticked fields means your proposal will take longer.", fields: [
    { id: "meet_want", label: "I would like a meeting", kind: "check", required: false, text: "I would like a meeting." },
    long("meet_options", "2 or 3 date and time options, with your time zone", { required: false, requiredIf: { any: [{ field: "meet_want", is: true }, { flagged: true }] }, discuss: false }),
    { id: "meet_mode", label: "Phone or video", kind: "select", choice: true, options: ["Phone", "Video"], required: false, discuss: false,
      requiredIf: { any: [{ field: "meet_want", is: true }, { flagged: true }] } },
    long("meet_attendees", "Who will attend (name and role)", { required: false, requiredIf: { any: [{ field: "meet_want", is: true }, { flagged: true }] }, discuss: false }),
    long("meet_topics", "Extra topics to discuss", { required: false }),
  ] } },
  { kind: "fields", page: { id: "signature", title: "10 Name, details and signature", intro: "Every box is compulsory.", fields: [
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

export const orOneApplication: FormDefinition = {
  id: "or-one-application",
  name: "OR ONE application form",
  formType: "application",
  product: "or_one",
  status: "draft",
  version: "draft-2",
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
