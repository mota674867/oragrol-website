// The Business Setup forms (OR ONE and BA), as the approved PDF samples: five pages each, sections grouped as in the PDF
// (01 / 02+03 / 04+05 / 06+07 / 08). Decisions of 2026-11-03 applied.
// Setup opens after the contract is signed and is pre-filled from the client's application: every row is built from the
// application's answers (passed in as `app`), so setup always matches what the client applied for. Nothing here asks for a
// password, key or card number: tools connect through the vendor's own sign-in or the secure vault.
//
// Wired (2026-11-03): OCS hands over the application's answers when a setup link is opened (a setup invitation names its application), and
// the website builds the form with these builders for each link (registry.ts buildSetup, handler.ts resolveForm). Like the application forms,
// a setup stays "draft" until it is cleared to open, and a draft opens only where APPLY_ALLOW_DRAFT_FORMS=1.
import type { Answers, Catalogue, Cond, Field, FormDefinition, PageSpec } from "../types";
import { pickedItems } from "../engine.ts";

const CONFIRM = ["Correct", "Change needed"] as const;
const RUN = ["Runs automatically", "Needs my approval"] as const;
const SAMPLE_OPTIONS = ["I will upload it", "Not applicable"] as const;
/** A condition that is never true: the field stays hidden (a section that does not apply to this client). */
const HIDDEN: Cond = { field: "not_applicable_here", is: true };
const when = (on: boolean): Cond | undefined => (on ? undefined : HIDDEN);

const text = (id: string, label: string, o: Partial<Field> = {}): Field => ({ id, label, kind: "text", required: true, ...o });
const email = (id: string, label: string, o: Partial<Field> = {}): Field => ({ id, label, kind: "email", required: true, ...o });
const phone = (id: string, label: string, o: Partial<Field> = {}): Field => ({ id, label, kind: "phone", required: true, ...o });
const num = (id: string, label: string, o: Partial<Field> = {}): Field => ({ id, label, kind: "number", required: true, ...o });
const long = (id: string, label: string, o: Partial<Field> = {}): Field => ({ id, label, kind: "longtext", required: true, ...o });
const check = (id: string, label: string, textOf: string, o: Partial<Field> = {}): Field => ({ id, label, kind: "check", text: textOf, ...o });
const choose = (id: string, label: string, options: readonly string[], o: Partial<Field> = {}): Field =>
  ({ id, label, kind: "select", choice: true, required: true, options: [...options], ...o });

/** A line the client confirms or corrects. The application's answer is shown as help text and is never changed here. */
function confirmRow(id: string, label: string, asOnApplication: string, group?: string): Field[] {
  return [
    { id: `c.${id}`, label, group, kind: "select", choice: true, required: true, options: [...CONFIRM], help: `As on your application: ${asOnApplication || "—"}` },
    { id: `c.${id}.change`, label: `${label}: what should change`, group, kind: "longtext", required: false, discuss: false,
      showIf: { field: `c.${id}`, is: "Change needed" }, requiredIf: { field: `c.${id}`, is: "Change needed" } },
  ];
}

/** One row per tool the application chose. `tools` pairs the application's answer key with the label shown to the client. */
function toolRows(app: Answers, tools: readonly { key: string; label: string }[]): Field[] {
  return tools.filter(({ key }) => typeof app[key] === "string").flatMap(({ key, label }): Field[] => {
    const vendor = String(app[key]);
    const id = key.replace(/[^a-z0-9]/gi, "-");
    return [
      { id: `t.${id}.vendor`, label: `${label}: vendor you chose`, group: "Connect your tools", kind: "text", required: false, discuss: false,
        help: `Chosen on your application: ${vendor}. Change it here only if your choice has changed.` },
      choose(`t.${id}.how`, `${label}: how it connects`, ["The vendor's own secure sign-in", "A key placed in ORAGROL's secure vault"], { group: "Connect your tools" }),
      text(`t.${id}.owner`, `${label}: account owner`, { group: "Connect your tools", discuss: false }),
    ];
  });
}

/** The company and contract check (PDF section 01). */
function companyFields(app: Answers, extra: Field[]): Field[] {
  return [
    ...confirmRow("company", "Company legal name and trade name", `${String(app.company_legal_name ?? "")}${app.trade_name ? ` / ${String(app.trade_name)}` : ""}`),
    ...confirmRow("address", "Business address and provinces", `${String(app.address ?? "")}; ${Array.isArray(app.provinces) ? app.provinces.join(", ") : ""}`),
    ...confirmRow("decider", "Decision-maker: name, title, email, phone", `${String(app.dm_name ?? "")}, ${String(app.dm_email ?? "")}, ${String(app.dm_phone ?? "")}`),
    ...confirmRow("billing", "Billing contact", String(app.billing ?? "")),
    ...confirmRow("tech", "Technical contact or IT provider", String(app.tech_contact ?? "")),
    ...confirmRow("requesters", "People allowed to send requests (up to 5)",
      Array.isArray(app.requesters) ? app.requesters.map((r) => String((r as Record<string, unknown>).email ?? "")).join(", ") : ""),
    ...extra,
  ];
}

const STEPS_INTRO = "Your setup after you sign. Pre-filled from your application. Confirm it, connect your tools and approve it before go-live. Business setup opens after the contract is signed. Nothing is built or connected before that. Never send a password, key or card number by email or chat: you connect each tool through the vendor's own secure sign-in screen, or by placing a key in ORAGROL's secure vault yourself. Go-live happens only when every step is done and every rule test passes.";
const TEST_NOTE = "Before go-live ORAGROL tests every rule you set. All tests must pass with zero failures. You can open each result and tick it as reviewed. If a test fails, ORAGROL fixes it and runs it again. Go-live waits.";
const FINAL_STATEMENTS: Field[] = [
  check("final.rules", "My rules are correct, and I understand ORAGROL Automation follows them exactly.", "My rules are correct, and I understand ORAGROL Automation follows them exactly."),
  check("final.approvers", "My named approvers have accepted their roles.", "My named approvers have accepted their roles."),
  check("final.tools", "My tools are connected through my own accounts.", "My tools are connected through my own accounts."),
  check("final.tests", "I reviewed the rule test results.", "I reviewed the rule test results."),
  check("final.golive", "I approve go-live on the date shown in my proposal.", "I approve go-live on the date shown in my proposal."),
];
const SIGNATURE_FIELDS: Field[] = [
  text("signer_name", "Name of the decision-maker", { group: "Signature" }),
  text("signer_title", "Title", { group: "Signature" }),
  { id: "signed_on", label: "Date (filled automatically)", group: "Signature", kind: "autodate" },
  { id: "signature", label: "Signature (type your full name)", group: "Signature", kind: "typed" },
];

// ------------------------------------------------------------------ OR ONE

export function orOneSetup(app: Answers, catalogue: Catalogue): FormDefinition {
  const items = pickedItems(app, catalogue);
  const sales = items.some(({ category }) => category.id === "sales");
  const marketing = items.some(({ category }) => category.id === "marketing");
  const support = items.some(({ category }) => category.id === "support");
  const finance = items.some(({ category }) => category.id === "finance");
  const has = (id: string): boolean => items.some(({ category }) => category.id === id);
  const tools = catalogue.categories.flatMap((c) => c.tools.map((r) => ({ key: `tool.${c.id}.${r.id}`, label: r.label })));

  const itemRows = items.flatMap(({ item }) => confirmRow(`item.${item.id}`, item.name,
    `${String(app[`rule.${item.id}.choice`] ?? "no rule chosen")}${app[`rule.${item.id}.limit`] ? `; ${String(app[`rule.${item.id}.limit`])}` : ""}`,
    "02 Your items and rules"));
  const approverRow = (key: string, area: string): Field[] => typeof app[key] === "string" && app[key]
    ? confirmRow(`approver.${key}`, `${area}: ${String(app[key])}`, String(app[key]), "03 Your named approvers accept their roles") : [];

  const pages: PageSpec[] = [
    { kind: "fields", page: { id: "company", title: "01 Confirm your company and contract details", intro: STEPS_INTRO, fields: companyFields(app, [
      { id: "c.size", label: "Your OR ONE size, items and points (from your contract)", kind: "check", required: false, group: "Contract",
        text: `${items.length} items and ${items.reduce((n, p) => n + p.item.points, 0)} points on your application.` },
      ...confirmRow("staff", "Staff size and number of companies covered", `${String(app.employees ?? "")} employees on payroll; ${String(app.entities ?? "")} companies`, "Contract"),
      ...confirmRow("term", "Contract term and monthly fee date", "as in your contract", "Contract"),
    ]) } },
    { kind: "fields", page: { id: "items", title: "02 Confirm your items and rules · 03 Your named approvers accept their roles",
      intro: "One row for each item you chose. It shows the rule you set on your application. You confirm it or change it. A blank or unclear rule stays on \"Needs my approval\". Items in money, people and law can never run automatically. Each person named on your application receives an email asking them to accept the role; until a person accepts, anything that needs that person stays on \"red flag\".",
      fields: [
        ...itemRows,
        ...approverRow("ap_money_name", "Money"), ...approverRow("ap_people_name", "People and hiring"), ...approverRow("ap_legal_name", "Legal and government"),
        ...approverRow("ap_it_name", "IT access"), ...approverRow("ap_publish_name", "Publishing and advertising"),
        email("usage_email", "Who gets usage notices (email)", { group: "03 Your named approvers accept their roles", help: `As on your application: ${String(app.usage_email ?? "")}` }),
        text("escalation", "Escalation: who to call if the system cannot continue", { group: "03 Your named approvers accept their roles" }),
      ] } },
    { kind: "fields", page: { id: "tools", title: "04 Connect your tools · 05 Share your material",
      intro: "One row for each tool you chose on your application. You buy and pay for each tool directly from the vendor, in your own account. ORAGROL confirms the current price, the connection and where the vendor stores data before you order. Upload what ORAGROL needs for the items you chose; nothing is used until you approve it.",
      fields: [
        ...toolRows(app, tools),
        text("admin_name", "Your admin for the connections: name", { group: "Connect your tools" }),
        email("admin_email", "Admin email", { group: "Connect your tools" }),
        phone("admin_phone", "Admin phone", { group: "Connect your tools" }),
        choose("m.brand", "Logo, brand guide and photos", SAMPLE_OPTIONS, { group: "05 Share your material", showIf: when(marketing) }),
        choose("m.price", "Price list and product or service list", SAMPLE_OPTIONS, { group: "05 Share your material", showIf: when(sales || finance) }),
        choose("m.claims", "Approved claims library: the facts ORAGROL Automation may state about you (services, prices, results)", SAMPLE_OPTIONS, { group: "05 Share your material", showIf: when(sales || marketing) }),
        choose("m.dnc", "Your do-not-contact list", SAMPLE_OPTIONS, { group: "05 Share your material", showIf: when(sales || marketing || support) }),
        choose("m.templates", "Templates (quotes, emails, letters, contracts)", SAMPLE_OPTIONS, { group: "05 Share your material", showIf: when(sales || has("hr") || has("legal")) }),
        choose("m.policies", "Policies and procedures (returns, HR, privacy, security)", SAMPLE_OPTIONS, { group: "05 Share your material", showIf: when(support || has("hr") || has("legal") || has("it")) }),
        choose("m.faq", "Frequently asked questions and answers", SAMPLE_OPTIONS, { group: "05 Share your material", showIf: when(support) }),
        choose("m.suppliers", "Supplier list and purchase approval rules", SAMPLE_OPTIONS, { group: "05 Share your material", showIf: when(has("procurement")) }),
        choose("m.licences", "Licenses, permits, insurance and minute book", SAMPLE_OPTIONS, { group: "05 Share your material", showIf: when(has("legal")) }),
        choose("m.kpi", "KPI list and report recipients", SAMPLE_OPTIONS, { group: "05 Share your material", showIf: when(has("leadership")) }),
      ] } },
    { kind: "fields", page: { id: "phone_ads", title: "06 Email, phone and ad accounts · 07 Review the rule test results",
      intro: "Only the parts that match your items appear. The costs below are yours, not ORAGROL's, and are shown on your sign-off sheet.",
      fields: [
        choose("e.separate_domain", "Separate sending domain for outreach (cold email)", ["Yes", "No"], { group: "Cold email (Sales)", showIf: when(sales) }),
        text("e.dns", "Who edits your domain records (DNS)", { group: "Cold email (Sales)", showIf: when(sales) }),
        num("e.mailboxes", "Sending mailboxes you will add (number)", { group: "Cold email (Sales)", showIf: when(sales) }),
        text("p.number", "Phone number to use, or a new Canadian number", { group: "AI-answered calls (Customer Service)", showIf: when(support) }),
        text("p.person", "Who takes a call that needs a person", { group: "AI-answered calls (Customer Service)", showIf: when(support) }),
        long("p.notice", "Notice that calls are recorded and answered by AI (your wording)", { group: "AI-answered calls (Customer Service)", showIf: when(support) }),
        text("a.account", "Ad platform and account ID (your own account)", { group: "Paid ads (Marketing)", showIf: when(marketing) }),
        num("a.cap", "Monthly ad budget cap", { group: "Paid ads (Marketing)", showIf: when(marketing) }),
        text("a.approver", "Who approves campaigns", { group: "Paid ads (Marketing)", showIf: when(marketing) }),
        check("review.note", "Rule test results", TEST_NOTE, { group: "07 Review the rule test results", required: false }),
      ] } },
    { kind: "fields", page: { id: "final", title: "08 Final approval and go-live", intro: "Your decision-maker confirms each statement, then signs. After that, ORAGROL switches your system from testing to live. You are watched closely in the first week.", fields: [
      ...FINAL_STATEMENTS, ...SIGNATURE_FIELDS,
    ] } },
  ];
  return setupDefinition("or-one-setup", "OR ONE Business Setup", "or_one", pages);
}

// ------------------------------------------------------------------ BA

export function baSetup(app: Answers): FormDefinition {
  const packages = Array.isArray(app.packages) ? (app.packages as string[]) : [];
  const has = (p: string): boolean => packages.includes(p);
  const sales = has("Sales");
  const cs = has("Customer Service");
  const ads = has("Marketing");
  const finance = has("Finance");
  const it = has("IT");
  const signOffLines: { key: string; label: string; on: boolean }[] = [
    { key: "replies", label: "Replies to routine customer questions", on: cs },
    { key: "followups", label: "Follow-up emails to leads and clients", on: sales || ads },
    { key: "quotes", label: "Quotes, proposals and new offers", on: sales },
    { key: "social", label: "Social posts and newsletters", on: ads },
    { key: "ads", label: "Changes to ad spending", on: ads },
    { key: "invoices", label: "Invoices and payment reminders", on: finance },
    { key: "money", label: "Sending money (payments, payroll)", on: finance },
    { key: "accounts", label: "Account, password and device actions", on: it },
  ];
  const signOff: Field[] = signOffLines.filter((l) => l.on).map((l) => choose(`so.${l.key}`, l.label, RUN, { group: "02 Confirm your sign-off sheet and rules",
    help: `As on your application: ${String(app[`so_${l.key}`] ?? "not set")}. A blank or unclear line stays on "Needs my approval".` }));
  const approverRow = (key: string, label: string, asOn: unknown): Field[] => typeof asOn === "string" && asOn
    ? confirmRow(`approver.${key}`, label, asOn, "03 Your named approvers accept their roles") : [];

  const pages: PageSpec[] = [
    { kind: "fields", page: { id: "company", title: "01 Confirm your company and contract details", intro: STEPS_INTRO, fields: companyFields(app, [
      ...confirmRow("packages", "Your packages and starting plan size (from your contract)", packages.join(", ") || "none", "Contract"),
      ...confirmRow("staff", "Number of staff and users covered", String(app.staff ?? ""), "Contract"),
      ...confirmRow("term", "Contract term and monthly fee date", "as in your contract", "Contract"),
    ]) } },
    { kind: "fields", page: { id: "signoff", title: "02 Confirm your sign-off sheet and rules · 03 Your named approvers accept their roles",
      intro: "You decide. ORAGROL takes no decision on your behalf unless you ask us in writing. Where a line needs your approval, your named decider approves first and ORAGROL then carries out exactly what was approved. Your own rules are applied; we do not invent them. This is the sign-off sheet from your application. For each line, confirm whether it runs automatically or needs your approval. A blank or unclear line stays on \"Needs my approval\". Each person named on your application receives an email asking them to accept the role; until a person accepts, anything that needs that person cannot go live.",
      fields: [
        ...signOff,
        long("rules_always", "Rules we must always follow, or \"None\"", { allowNone: true, group: "02 Confirm your sign-off sheet and rules", help: `As on your application: ${String(app.so_always ?? "")}` }),
        long("rules_never", "Things we must never do, or \"None\"", { allowNone: true, group: "02 Confirm your sign-off sheet and rules", help: `As on your application: ${String(app.so_never ?? "")}` }),
        ...approverRow("decider", "Named decider", app.so_decider),
        ...approverRow("backup", "Backup decider", app.so_backup),
        ...(finance ? approverRow("money", "Money actions", app.money_approver) : []),
        ...(it ? approverRow("accounts", "Account, password and device actions", app.it_account_approver) : []),
        ...(ads ? approverRow("publishing", "Publishing and ads", app.m_approver) : []),
        email("usage_email", "Who gets usage notices (email)", { group: "03 Your named approvers accept their roles", help: `As on your application: ${String(app.so_notices ?? "")}` }),
        text("escalation", "Escalation: who to call if the system cannot continue", { group: "03 Your named approvers accept their roles" }),
      ] } },
    { kind: "fields", page: { id: "tools", title: "04 Connect your tools · 05 Share your material",
      intro: "One row for each tool you chose on your application. You buy and pay for each tool directly from the vendor, in your own account. ORAGROL confirms the current price, the connection and where the vendor stores data before you order. Upload what ORAGROL needs for the items you chose; nothing is used until you approve it.",
      fields: [
        ...toolRows(app, [
          ["crm", "Customer database (CRM)"], ["esign", "Electronic signing"], ["sales_email", "Email marketing"], ["sales_payments", "Payment collection"],
          ["desk", "Customer support desk"], ["chat", "Website chat"], ["voice", "AI-answered calls"], ["social", "Social scheduling"], ["seo", "SEO tool"],
          ["design", "Design"], ["landing", "Landing page"], ["mkt_email", "Email marketing"], ["ads", "Ad platform"], ["accounting", "Accounting software"],
          ["payroll", "Payroll"], ["expense", "Expense capture"], ["fin_payments", "Payment collection"], ["device", "Device management"], ["backup", "Backup"],
          ["itsupport", "IT support requests"], ["password", "Password manager"], ["email_sec", "Email security"], ["endpoint", "Endpoint protection"],
        ].map(([key, label]) => ({ key: `tool.${key}`, label }))),
        text("admin_name", "Your admin for the connections: name", { group: "Connect your tools" }),
        email("admin_email", "Admin email", { group: "Connect your tools" }),
        phone("admin_phone", "Admin phone", { group: "Connect your tools" }),
        choose("m.brand", "Logo, brand guide and photos", SAMPLE_OPTIONS, { group: "05 Share your material", showIf: when(sales || ads) }),
        choose("m.price", "Price list and list of products or services", SAMPLE_OPTIONS, { group: "05 Share your material", showIf: when(sales) }),
        choose("m.crm", "Your CRM stages or pipeline names", SAMPLE_OPTIONS, { group: "05 Share your material", showIf: when(sales) }),
        choose("m.faq", "Frequently asked questions and answers (knowledge base)", SAMPLE_OPTIONS, { group: "05 Share your material", showIf: when(cs) }),
        choose("m.refund", "Refund, return and complaint policy", SAMPLE_OPTIONS, { group: "05 Share your material", showIf: when(cs) }),
        choose("m.tax", "Sales tax set-up confirmed by you or your accountant", SAMPLE_OPTIONS, { group: "05 Share your material", showIf: when(finance) }),
        choose("m.web", "Website admin access, given through the secure vault", ["I will place it in the vault", "Not applicable"], { group: "05 Share your material", showIf: when(it) }),
        long("m.other", "Other material you want us to follow", { required: false, group: "05 Share your material" }),
      ] } },
    { kind: "fields", page: { id: "phone_ads", title: "06 Phone and ad accounts · 07 Review the rule test results",
      intro: "Only the parts that match your packages appear. The costs are yours and are shown in your proposal.",
      fields: [
        text("p.number", "Phone number to use, or a new Canadian number", { group: "AI-answered calls (Customer Service add-on)", showIf: when(cs) }),
        text("p.person", "Who takes a call that needs a person", { group: "AI-answered calls (Customer Service add-on)", showIf: when(cs) }),
        long("p.notice", "Notice that calls are recorded and answered by AI (your wording)", { group: "AI-answered calls (Customer Service add-on)", showIf: when(cs) }),
        text("a.account", "Ad platform and account ID (your own account)", { group: "Paid ads (Marketing)", showIf: when(ads) }),
        num("a.cap", "Monthly ad budget cap", { group: "Paid ads (Marketing)", showIf: when(ads) }),
        text("a.approver", "Who approves campaigns", { group: "Paid ads (Marketing)", showIf: when(ads) }),
        check("plan.notice", "Your plan size: notices", "I understand and agree to receive notices about my plan size (85%, 97% and 100%) at the contacts above.", { group: "Your plan size", help: "Your plan has a monthly size limit. We tell you at 85% and again at 97%. At 100% you have 3 days to continue or upgrade. We never stop service because you reached the limit without warning you first." }),
        check("review.note", "Rule test results", TEST_NOTE, { group: "07 Review the rule test results", required: false }),
      ] } },
    { kind: "fields", page: { id: "final", title: "08 Final approval and go-live", intro: "Your decision-maker confirms each statement, then signs. After that, ORAGROL switches your system from testing to live. You are watched closely in the first week.", fields: [
      ...FINAL_STATEMENTS, ...SIGNATURE_FIELDS,
    ] } },
  ];
  return setupDefinition("ba-setup", "Business Automation Business Setup", "ba", pages);
}

/** A setup is "confirm or correct", not "discuss": the meeting box that the application forms offer is switched off on every setup field. */
const withoutMeetingBoxes = (pages: PageSpec[]): PageSpec[] =>
  pages.map((p) => (p.kind === "fields" ? { ...p, page: { ...p.page, fields: p.page.fields.map((f) => ({ ...f, discuss: false })) } } : p));

function setupDefinition(id: string, name: string, product: "or_one" | "ba", rawPages: PageSpec[]): FormDefinition {
  const pages = withoutMeetingBoxes(rawPages);
  return {
    id, name, formType: "setup", product, status: "published", version: "1.0", pages, tiers: [],
    signature: { name: "signer_name", title: "signer_title", typed: "signature", agree: "final.golive" },
    whatNext: ["ORAGROL checks each line you confirmed or changed.", "Your named approvers accept their roles.", "We run the rule tests and you review the results.", "You approve go-live, and we switch your system live."],
  };
}
