// The Business Automation (BA) application form, as the approved PDF sample (BA Application Form v2), with the decisions of
// 2026-11-03 applied:
//   - the start page explains the form, why we collect the information, the page count and the rules, and holds the 11 legal ticks;
//     every later page stays locked until they are ticked;
//   - packages are chosen in section 03; the software, size and sign-off pages show only what was chosen;
//   - a tool that appears under two packages is asked once (decision 3, applied to every duplicate): Payment collection in Finance
//     (Sales asks it only when Finance is not chosen), Email marketing in Marketing (Sales asks it only when Marketing is not chosen),
//     Platform in the software section (IT does not ask it again);
//   - IT support requests uses the OR ONE options (decision 4: Zendesk is out).
// Status stays "draft" until Mohammad approves the form and the vendor round 2 is done. A draft form never opens for a client in production.
import type { Cond, Field, FormDefinition, PageSpec, ToolRow } from "../types";
import {
  AD_SPEND, APPROVAL_SPEED, CUSTOMERS, DEVICES_EACH, DEVICES_TOTAL, ENTITIES, INDUSTRIES, LANGUAGE_COUNT, OTHER, PAGES, PROVINCES, START, STAFF, VOLUME, YEARS,
  band, pickMany, withOther,
} from "../choices.ts";

const SUPPORT_HOURS = ["Business hours, weekdays", "Extended hours, weekdays", "Seven days a week", "24 hours a day"] as const;
const CURRENCIES = ["Canadian dollars (CAD)", "US dollars (USD)", "Euros (EUR)", "British pounds (GBP)", OTHER] as const;


const PACKAGES = ["Sales", "Customer Service", "Marketing", "Finance", "IT", "Something else (tailored automation)"] as const;
const has = (pkg: string): Cond => ({ field: "packages", has: pkg });
const anyPkg = (...pkgs: string[]): Cond => ({ any: pkgs.map(has) });
const without = (pkg: string): Cond => ({ not: has(pkg) });

const text = (id: string, label: string, o: Partial<Field> = {}): Field => ({ id, label, kind: "text", required: true, ...o });
const email = (id: string, label: string, o: Partial<Field> = {}): Field => ({ id, label, kind: "email", required: true, ...o });
const phone = (id: string, label: string, o: Partial<Field> = {}): Field => ({ id, label, kind: "phone", required: true, ...o });
const num = (id: string, label: string, o: Partial<Field> = {}): Field => ({ id, label, kind: "number", required: true, ...o });
const long = (id: string, label: string, o: Partial<Field> = {}): Field => ({ id, label, kind: "longtext", required: true, ...o });
const yn = (id: string, label: string, o: Partial<Field> = {}): Field => ({ id, label, kind: "yesno", required: true, choice: true, ...o });
const check = (id: string, label: string, textOf: string, o: Partial<Field> = {}): Field => ({ id, label, kind: "check", text: textOf, ...o });

/** One row of the software section: the options as the PDF lists them, plus "Not sure, recommend" and an "Already use" box. */
function tool(id: string, label: string, options: string[], group: string, showIf: Cond, o: Partial<Field> = {}): Field[] {
  const row: ToolRow = { id, label, options };
  return [
    { id: `tool.${row.id}`, label: row.label, group, kind: "select", choice: true, required: true, discuss: false, showIf, options: [...row.options, "Not sure, recommend"], ...o },
    { id: `tool.${row.id}.already`, label: `${row.label}: already use`, group, kind: "text", required: false, discuss: false, showIf },
  ];
}

/** The 11 clauses, word for word from the PDF (section 13). Ticked on the start page, before anything else opens. */
const LEGAL: readonly { title: string; text: string }[] = [
  { title: "The information is my company's responsibility.", text: "I confirm the information in this form is true and complete. ORAGROL relies on it to set the scope, my starting plan size and the price. If it is wrong, incomplete or out of date, the result and any loss are not ORAGROL's fault, and the proposal and fees may change." },
  { title: "The client decides; ORAGROL follows.", text: "The rules I set (the sign-off sheet, the limits, \"always\" and \"never\") are my company's decision. ORAGROL builds the system to follow them exactly and is responsible for following them. What happens inside my rules is my company's responsibility. ORAGROL takes no decision on my behalf unless I ask it in this form or in writing. My company alone, not ORAGROL, is responsible to my own customers, suppliers, staff and other third parties for my decisions and for what is sent in my name." },
  { title: "Named decider.", text: "The people named are authorized to decide and approve for my company. ORAGROL may rely on an approval given by a named person. I will tell ORAGROL immediately if a named person changes." },
  { title: "Approval and control.", text: "Nothing is built, connected or sent without my written approval. For money, legal matters, refunds, security events and anything else, my named decider decides and ORAGROL carries out exactly what was approved. ORAGROL does not give legal, tax, financial or professional advice." },
  { title: "Lawful use.", text: "My company is responsible for using the system lawfully: for example consent for recording calls, notices that AI is used, privacy, anti-spam, advertising and employment law, and the content of messages sent to my customers, suppliers and staff." },
  { title: "Authority, access and personal information.", text: "I may act for the company and may give ORAGROL access to the systems, accounts and data named here. I am responsible for permissions from my own vendors and other third parties. This form contains personal information about my staff; they know, and I may give it to ORAGROL to prepare my proposal." },
  { title: "Third-party software.", text: "I buy my software directly from vendors and pay them. ORAGROL is not the seller. Vendor price, features and data location change and are confirmed at order time; ORAGROL does not state that data is stored in Canada unless the vendor says so." },
  { title: "Plan size limit.", text: "My plan has a monthly size limit and the proposal will set my starting band." },
  { title: "No contract and no promise.", text: "This form is not a contract and no price is agreed. Nothing is built or charged before I sign the contract. ORAGROL commits to the agreed work, not to a result, ranking, saving or level of availability. ORAGROL may decline an application or ask for more information." },
  { title: "Confidential and kept.", text: "The form is confidential and used only to assess my application and prepare my proposal. If no contract is signed, ORAGROL keeps it for 24 months and then deletes it. Governing law: Ontario and the federal laws of Canada." },
  { title: "The contract governs once signed.", text: "Once a contract is signed, the contract and the signed proposal govern and replace this form." },
];

const START_BODY = [
  "Thank you for applying to Business Automation. This application is 4 to 11 pages, depending on the packages you choose. Your answers are saved as you go, so you can leave and return with the same private link.",
  "We ask for this information so that we can understand your business and prepare your proposal. Nothing is built, connected or charged before you sign a contract.",
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
    ...withOther(pickMany("lang_customers", "Which languages do your customers mainly use? Choose all that apply.", ["English", "French", OTHER])),
  ] } },
  { kind: "fields", page: { id: "people", title: "02 People", intro: "Accountant: compulsory if you choose Finance; otherwise optional.", fields: [
    text("dm_name", "Decision-maker: name and title", { prefill: "person" }),
    email("dm_email", "Decision-maker email", { prefill: "email" }),
    phone("dm_phone", "Decision-maker phone", { prefill: "phone" }),
    text("billing", "Billing contact: name and email"),
    text("tech_contact", "Technical contact or IT provider (or \"None\")", { allowNone: true }),
    text("money_approver", "Who approves money actions (payroll, payments): name and title"),
    text("acct", "Accountant: name, firm, email", { required: false, requiredIf: has("Finance") }),
    band("decision_style", "How are decisions made in your company?", ["I decide alone", "I decide together with one other person", "A group, board or committee decides"]),
    text("decision_others", "Is there anyone else who must approve? (names and roles)", { required: false }),
    band("reach_time", "When is the best time to reach the decision-maker?", ["Mornings", "Afternoons", "Evenings", "Any time"], { required: false }),
    text("urgent_contact", "Urgent contact for the decision-maker", { required: false }),
    { id: "requesters", label: "Up to 5 named people from your team can send us requests. Name at least one.", kind: "people", required: true, min: 1, max: 5,
      columns: [{ id: "name", label: "Name", kind: "text" }, { id: "role", label: "Role", kind: "text" }, { id: "email", label: "Email", kind: "email" }] },
  ] } },
  { kind: "fields", page: { id: "need", title: "03 What do you need?", intro: "Choose at least one package. Complete the sections for the packages you chose and skip the rest. Best estimates are fine. We use your answers to set your scope and your starting size.", fields: [
    { id: "packages", label: "Packages you need", kind: "multiselect", required: true, options: [...PACKAGES], choice: true },
    long("goal", "What is the main problem you want solved first, and what would success look like?"),
    long("something_else", "If something else: describe the job", { requiredIf: has("Something else (tailored automation)"), showIf: has("Something else (tailored automation)") }),
    band("start", "When would you like to start?", START),
    long("urgent", "Is there a deadline or an event we must plan around? (optional)", { required: false }),
    long("fixed_tools", "Are there tools, contracts or suppliers that cannot change? (optional)", { required: false }),
  ] } },
  { kind: "fields", page: { id: "software", title: "04 Your software", intro: "For each tool type you need, choose one, name the tool you already use, or tick \"Not sure, recommend\". We check that a tool you already use can connect before you sign. You buy and pay for your software directly from the vendor. We confirm each vendor's current price and where it stores data when you order. Show only the packages you chose in section 03. Ad accounts (Google Ads, Meta Ads, LinkedIn Ads), Google Search Console and Google Analytics stay in your own accounts.", fields: [
    ...tool("crm", "Customer database (CRM)", ["HubSpot", "Pipedrive", "Zoho CRM"], "Sales", has("Sales")),
    ...tool("esign", "Electronic signing", ["DocuSign", "Dropbox Sign", "PandaDoc"], "Sales", has("Sales")),
    ...tool("sales_email", "Email marketing", ["HubSpot Marketing Hub", "Mailchimp", "Brevo"], "Sales", { all: [has("Sales"), without("Marketing")] }),
    ...tool("sales_payments", "Payment collection", ["Stripe", "Square", "PayPal"], "Sales", { all: [has("Sales"), without("Finance")] }),
    ...tool("desk", "Customer support desk: tickets and inbox", ["Zoho Desk", "HubSpot Service Hub", "Freshdesk"], "Customer Service", has("Customer Service")),
    ...tool("chat", "Website chat", ["Tidio", "Intercom", "Zoho SalesIQ"], "Customer Service", has("Customer Service")),
    ...tool("voice", "AI-answered calls (add-on)", ["Retell AI", "Vapi", "Twilio", "Not needed"], "Customer Service", has("Customer Service")),
    ...tool("social", "Social scheduling", ["Metricool", "Hootsuite", "Buffer"], "Marketing", has("Marketing")),
    ...tool("seo", "SEO tool", ["Semrush", "Ahrefs", "SE Ranking"], "Marketing", has("Marketing")),
    ...tool("design", "Design", ["Canva", "Adobe Express", "Figma"], "Marketing", has("Marketing")),
    ...tool("landing", "Landing page", ["Unbounce", "Instapage", "Webflow"], "Marketing", has("Marketing")),
    ...tool("mkt_email", "Email marketing", ["HubSpot Marketing Hub", "Mailchimp", "Brevo"], "Marketing", has("Marketing")),
    ...tool("ads", "Ad platform (one)", ["Google Ads", "Meta Ads", "LinkedIn Ads"], "Marketing", has("Marketing")),
    ...tool("accounting", "Accounting software", ["QuickBooks Online", "Xero", "Zoho Books"], "Finance", has("Finance")),
    ...tool("payroll", "Payroll", ["Payworks", "ADP"], "Finance", has("Finance")),
    ...tool("expense", "Expense capture", ["Dext", "Expensify", "Zoho Expense"], "Finance", has("Finance")),
    ...tool("fin_payments", "Payment collection", ["Stripe", "Square", "PayPal"], "Finance", has("Finance")),
    ...tool("device", "Device management", ["Microsoft Intune", "NinjaOne", "Atera"], "IT", has("IT")),
    ...tool("backup", "Backup", ["Keepit", "Veeam", "Afi"], "IT", has("IT")),
    ...tool("itsupport", "IT support requests", ["Support desk above", "Freshservice", "Jira Service Mgmt"], "IT", has("IT")),
    ...tool("password", "Password manager", ["1Password", "Bitwarden", "Keeper"], "IT", has("IT")),
    ...tool("email_sec", "Email security", ["Defender for Office 365", "Proofpoint", "Mimecast"], "IT", has("IT")),
    ...tool("endpoint", "Endpoint protection", ["Defender for Business", "SentinelOne", "CrowdStrike Falcon Go"], "IT", has("IT")),
    { id: "platform", label: "Platform", group: "IT", kind: "select", choice: true, required: true, discuss: false, showIf: has("IT"), options: ["Microsoft 365", "Google Workspace", "Other"] },
    { id: "platform_other", label: "Platform: other", group: "IT", kind: "text", required: false, discuss: false, showIf: { field: "platform", is: "Other" }, requiredIf: { field: "platform", is: "Other" } },
  ] } },
  { kind: "fields", page: { id: "sales_cs", title: "05 Sales and Customer Service", showIf: anyPkg("Sales", "Customer Service"), fields: [
    band("s_handled", "How many customers or leads would we handle for you in a typical month?", CUSTOMERS, { group: "Sales", showIf: has("Sales") }),
    band("s_leads", "How many new leads or enquiries do you get in a typical month?", VOLUME, { group: "Sales", showIf: has("Sales") }),
    band("s_busiest", "In your busiest month, about how many leads or enquiries do you get?", VOLUME, { group: "Sales", showIf: has("Sales") }),
    long("s_steps", "What are your sales steps, from first contact to closing a deal?", { group: "Sales", showIf: has("Sales") }),
    long("s_offer", "What you quote or propose (products, services, price list)", { group: "Sales", showIf: has("Sales") }),
    long("s_crm_stages", "Your CRM stages or pipeline names", { group: "Sales", showIf: has("Sales") }),
    ...withOther(pickMany("s_lead_sources", "How do leads reach you today? Choose all that apply.", ["Web form", "Email", "Phone", "Referrals", "Social media", "Events and trade shows", OTHER], { group: "Sales", showIf: has("Sales") })),
    ...withOther(pickMany("c_channels", "Which channels do customers use to contact you? Choose all that apply.", ["Email", "Website chat", "Phone", "Social media messages", "Text messages", OTHER], { group: "Customer Service", showIf: has("Customer Service") })),
    ...withOther(band("c_hours", "When do you offer support?", [...SUPPORT_HOURS, OTHER], { group: "Customer Service", showIf: has("Customer Service") })),
    ...withOther(band("c_tz", "Which time zone do you work in?", ["Eastern", "Central", "Mountain", "Pacific", "Atlantic", "Newfoundland", OTHER], { group: "Customer Service", showIf: has("Customer Service") })),
    ...withOther(pickMany("c_languages", "Which languages do you support customers in? Choose all that apply.", ["English", "French", OTHER], { group: "Customer Service", showIf: has("Customer Service") })),
    long("c_answers", "Where your answers live (FAQ, knowledge base)", { group: "Customer Service", showIf: has("Customer Service") }),
    ...withOther(band("c_shop", "Do you use an order or shop system for returns and refunds?", ["No order or shop system", "An online store", "A point-of-sale system", OTHER], { group: "Customer Service", showIf: has("Customer Service") })),
    band("c_tickets", "How many customer support requests do you get in a typical month?", VOLUME, { group: "Customer Service", showIf: has("Customer Service") }),
    long("c_policy", "Your refund, return and complaint policy", { group: "Customer Service", showIf: has("Customer Service") }),
    text("c_person", "Who should take a case that needs a person? (name and role)", { group: "Customer Service", showIf: has("Customer Service") }),
    band("c_phone_system", "What phone system do you use? (we log call notes, voicemails and missed calls from it)", ["Cloud phone service", "Office phone system (PBX)", "Mobile phones only", "No phone line"], { group: "Customer Service", showIf: has("Customer Service"), required: false }),
    check("c_ai_wanted", "I want AI-answered calls (add-on, quoted separately)", "I want AI-answered calls (add-on, quoted separately).", { group: "Customer Service", showIf: has("Customer Service"), required: false }),
    band("c_minutes", "About how many call minutes a month do you expect?", ["Under 300", "300 to 1,000", "1,001 to 3,000", "3,001 to 10,000", "More than 10,000"], { group: "Customer Service", showIf: { all: [has("Customer Service"), { field: "c_ai_wanted", is: true }] }, requiredIf: { field: "c_ai_wanted", is: true } }),
    yn("c_ca_number", "Canadian phone number needed? (Yes / No)", { group: "Customer Service", showIf: { all: [has("Customer Service"), { field: "c_ai_wanted", is: true }] }, requiredIf: { field: "c_ai_wanted", is: true } }),
    band("c_call_hours", "When do you want calls answered?", [...SUPPORT_HOURS], { group: "Customer Service", showIf: { all: [has("Customer Service"), { field: "c_ai_wanted", is: true }] }, requiredIf: { field: "c_ai_wanted", is: true } }),
  ] } },
  { kind: "fields", page: { id: "marketing", title: "06 Marketing", showIf: has("Marketing"), fields: [
    { id: "m_goal", label: "Goal (choose one main goal)", kind: "select", choice: true, required: true, options: ["More leads", "More bookings", "Repeat customers", "Visibility"] },
    long("m_result", "What does a good result look like for you?"),
    long("m_audience", "Your audience and main offer", { required: false }),
    { id: "m_platforms", label: "Platforms (choose 2 for social posting)", kind: "multiselect", choice: true, required: true, min: 2, max: 2, options: ["Facebook", "Instagram", "LinkedIn", "Google Business Profile"] },
    { id: "m_ads", label: "Paid ads platform (one), or \"No ads\"", kind: "select", choice: true, required: true, options: ["Google Ads", "Meta Ads", "LinkedIn Ads", "No ads"] },
    band("m_budget", "About how much do you plan to spend on ads each month? (we work from $1,500 on one platform)", AD_SPEND, { requiredIf: { not: { field: "m_ads", is: "No ads" } }, showIf: { not: { field: "m_ads", is: "No ads" } } }),
    yn("m_ad_accounts", "Your ad accounts exist? (Yes / No)"),
    { id: "m_addons", label: "Add-ons you want quoted", kind: "multiselect", choice: true, required: false, options: ["Extra social platform", "Extra content pack", "Extra design pack", "Extra ad platform or campaign", "SEO work", "Market and competitor research", "Digital campaign", "Lead-gen campaign", "Video, photo or offline marketing"] },
    long("m_material", "Existing material to share (logo, brand guide, photos, past content)", { required: false }),
    text("m_approver", "Who approves your content? (name and role)"),
    band("m_approve_speed", "How quickly can they approve it? (we plan for about 2 working days)", APPROVAL_SPEED),
  ] } },
  { kind: "fields", page: { id: "finance", title: "07 Finance", showIf: has("Finance"), intro: "You decide about money. For each money action (payroll, payments, payables) you choose on the sign-off sheet whether we prepare it for your named decider to approve, or carry it out after your approval through your own tools. ORAGROL does not decide amounts or recipients, does not file tax and does not give financial advice. Your accountant keeps professional judgment.", fields: [
    band("f_transactions", "How many invoices, payments and expenses do you process in a typical month?", VOLUME, { group: "Size" }),
    band("f_payroll", "How many employees are on your payroll?", STAFF, { group: "Size" }),
    band("f_companies", "How many companies (legal entities) should we cover?", ENTITIES, { group: "Size" }),
    ...withOther(pickMany("f_currencies", "Which currencies do you work in? Choose all that apply.", [...CURRENCIES], { group: "Size" })),
    { id: "f_year_end", label: "Financial year-end date", kind: "date", required: true, group: "Size" },
    text("f_accountant", "Your accountant (name, firm)", { group: "Size" }),
    { id: "f_wants", label: "What you want", kind: "multiselect", choice: true, required: false, group: "What you want", options: ["Invoice preparation", "Payment collection", "Expense tracking", "Reconciliation support", "Cash-flow monitoring", "Payroll preparation", "Accounts payable", "Tax reminders", "Monthly reports", "Multi-currency work (add-on)", "Year-end and tax preparation for your accountant (add-on)", "Clean-up of old books (quoted first)"] },
    text("f_sales_tax", "Sales tax set-up we should use (as confirmed by you or your accountant)", { group: "Tax and payments" }),
    text("f_merchant", "Merchant account for payment collection", { group: "Tax and payments" }),
    ...withOther(band("f_approval_limit", "Above what amount should a payment need your approval?", ["Every payment needs my approval", "Above $500", "Above $1,000", "Above $2,500", "Above $5,000", "Above $10,000", OTHER], { group: "Tax and payments" })),
  ] } },
  { kind: "fields", page: { id: "it", title: "08 IT", showIf: has("IT"), fields: [
    band("it_users", "How many people use your company's computers and accounts?", STAFF, { group: "Users and devices" }),
    band("it_devices_per_user", "On average, how many devices does each person use (laptop, phone, tablet)?", DEVICES_EACH, { group: "Users and devices" }),
    band("it_devices_total", "About how many devices are there in total?", DEVICES_TOTAL, { group: "Users and devices" }),
    text("it_web_address", "Website address", { group: "Your website" }),
    ...withOther(band("it_web_platform", "What is your website built on?", ["WordPress", "Shopify", "Wix", "Squarespace", "Custom built", OTHER], { group: "Your website" })),
    band("it_web_pages", "About how many pages does the website have?", PAGES, { group: "Your website" }),
    band("it_web_languages", "In how many languages is the website?", LANGUAGE_COUNT, { group: "Your website" }),
    band("it_hosting_owner", "Who owns the hosting account?", ["We do", "Our web agency", "Our IT provider"], { group: "Your website" }),
    yn("it_admin_access", "Do we get admin access? (Yes / No)", { group: "Your website" }),
    { id: "it_site_state", label: "About your site today", kind: "multiselect", choice: true, required: false, group: "Your website", options: ["Backups exist today", "Software is kept up to date", "The site breaks after updates", "Built by a developer without documentation"] },
    { id: "it_options", label: "Options", kind: "multiselect", choice: true, required: false, group: "Options", options: ["More than 2 devices per user (add-on)", "More than one website (add-on)", "Restore test (add-on)", "Website rescue or migration (quoted first)"] },
    text("it_account_approver", "Who approves account, password and device actions"),
    text("it_contact", "Your IT contact or current provider", { required: false }),
  ] } },
  { kind: "fields", page: { id: "sign_off", title: "09 Sign-off sheet", intro: "You decide what runs on its own. Unless you say otherwise, anything we prepare for your customers, suppliers or staff waits for your approval before it is sent. Choose one for each line you use.", fields: [
    { id: "so_replies", label: "Replies to routine customer questions", kind: "select", choice: true, required: true, options: ["Runs automatically", "Needs my approval"], showIf: has("Customer Service") },
    { id: "so_followups", label: "Follow-up emails to leads and clients", kind: "select", choice: true, required: true, options: ["Runs automatically", "Needs my approval"], showIf: anyPkg("Sales", "Marketing") },
    { id: "so_quotes", label: "Quotes, proposals and new offers", kind: "select", choice: true, required: true, options: ["Runs automatically", "Needs my approval"], showIf: has("Sales") },
    { id: "so_social", label: "Social posts and newsletters", kind: "select", choice: true, required: true, options: ["Runs automatically", "Needs my approval"], showIf: has("Marketing") },
    { id: "so_ads", label: "Changes to ad spending", kind: "select", choice: true, required: true, options: ["Runs automatically", "Needs my approval"], showIf: has("Marketing") },
    { id: "so_invoices", label: "Invoices and payment reminders", kind: "select", choice: true, required: true, options: ["Runs automatically", "Needs my approval"], showIf: has("Finance") },
    { id: "so_money", label: "Sending money (payments, payroll)", kind: "select", choice: true, required: true, options: ["Runs automatically", "Needs my approval"], showIf: has("Finance") },
    { id: "so_accounts", label: "Account, password and device actions", kind: "select", choice: true, required: true, options: ["Runs automatically", "Needs my approval"], showIf: has("IT") },
    text("so_other", "Other", { required: false }),
    text("so_decider", "Named decider (name, title)", { group: "Decisions" }),
    text("so_backup", "Backup decider", { group: "Decisions" }),
    email("so_notices", "Who gets usage notices (email)", { group: "Decisions" }),
    text("so_reach", "Best time to reach your decider", { group: "Decisions" }),
    long("so_always", "Rules we must always follow (policy, discounts, tone, legal wording), or \"None\"", { group: "Decisions", allowNone: true }),
    long("so_never", "Things we must never do, or \"None\"", { group: "Decisions", allowNone: true }),
    long("so_decisions", "Decisions you ask ORAGROL to take for you, or \"None\"", { group: "Decisions", allowNone: true }),
  ] } },
  { kind: "fields", page: { id: "plan", title: "10 Your plan size", intro: "Your plan has a monthly size limit, set from your answers in sections 05 to 08. We tell you at 85% and again at 97%. At 100% you have 3 days to continue or upgrade. We never stop service because of a limit without warning you first.", fields: [
    check("plan_notices", "I understand and agree to receive notices at the contacts above", "I understand and agree to receive notices at the contacts above."),
  ] } },
  { kind: "fields", page: { id: "meeting", title: "11 Request a meeting (optional)", intro: "You can pass this section without filling anything. If you ticked \"I need to discuss this in a meeting\" on any field, those fields become your meeting agenda. Offer 2 or 3 date and time options, with your time zone. ORAGROL checks availability and tells you by email whether a slot is confirmed or which alternatives are free.", fields: [
    { id: "meet_want", label: "I would like a meeting", kind: "check", required: false, text: "I would like a meeting." },
    long("meet_options", "2 or 3 date and time options, with your time zone", { required: false, requiredIf: { any: [{ field: "meet_want", is: true }, { flagged: true }] }, discuss: false }),
    { id: "meet_mode", label: "Phone or video", kind: "select", choice: true, options: ["Phone", "Video"], required: false, discuss: false, requiredIf: { any: [{ field: "meet_want", is: true }, { flagged: true }] } },
    long("meet_attendees", "Who will attend (name and role)", { required: false, requiredIf: { any: [{ field: "meet_want", is: true }, { flagged: true }] }, discuss: false }),
    long("meet_topics", "Extra topics to discuss", { required: false }),
  ] } },
  { kind: "fields", page: { id: "signature", title: "12 Name, details and signature", intro: "Every box is compulsory.", fields: [
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

export const baApplication: FormDefinition = {
  id: "ba-application",
  name: "Business Automation application form",
  formType: "application",
  product: "ba",
  status: "published",
  version: "1.0",
  pages,
  tiers: [],
  signature: { name: "signer_name", title: "signer_title", typed: "signature", agree: "signer_authority" },
  whatNext: [
    "We check that the tools you already use can connect, and confirm each vendor's price and data location with you.",
    "We send you a proposal: scope, fees, starting band, limits and terms. If you asked for a meeting, we meet first.",
    "You approve the proposal and sign the contract. Nothing is built before this.",
    "We build, you approve the setup in your dashboard, and we go live.",
  ],
};
