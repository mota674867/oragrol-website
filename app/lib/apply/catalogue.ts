// The OR ONE catalogue: the 10 categories, their "Size and situation" questions (PDF section 05), their software rows (PDF section 04)
// and their 77 items with points and risk bands (PDF section 06). Source: OR ONE Application Form, approved PDF sample, checked against
// the 10 handling tables and the live OR ONE menu (533 points). Decisions applied (Mohammad, 2026-11-03): investor/board reporting is
// locked; payments is asked once, in Finance (Customer Service does not ask again).
//
// Still to confirm before publishing: the vendor rows (round 2), the fixed limits and defaults text, and the wording of each item.
import type { Catalogue, Category, Field, Item, ItemBand, ToolRow } from "./types";
import { fixtureCatalogue } from "./catalogue-fixture.ts";

const n = (id: string, label: string): Field => ({ id, label, kind: "number", required: true });
const t = (id: string, label: string): Field => ({ id, label, kind: "text", required: true });
const lt = (id: string, label: string): Field => ({ id, label, kind: "longtext", required: true });
const yn = (id: string, label: string): Field => ({ id, label, kind: "yesno", required: true, choice: true });

export const CATEGORY_NAMES = {
  sales: "Sales",
  marketing: "Marketing & Branding",
  finance: "Finance & Accounting",
  hr: "HR & People",
  support: "Customer Service",
  operations: "Operations & Admin",
  it: "IT & Technology",
  procurement: "Procurement & Vendor",
  legal: "Legal & Compliance",
  leadership: "Leadership & Strategy",
} as const;

const std = (id: string, name: string, points: number, whatItDoes: string, fixedLimits: string[], suggestedDefault: string): Item =>
  ({ id, name, points, band: "standard" as ItemBand, whatItDoes, fixedLimits, suggestedDefault });
const ctl = (id: string, name: string, points: number, whatItDoes: string, fixedLimits: string[], suggestedDefault: string, locked = false): Item =>
  ({ id, name, points, band: "controlled" as ItemBand, whatItDoes, fixedLimits, suggestedDefault, ...(locked ? { locked: true } : {}) });
const crit = (id: string, name: string, points: number, whatItDoes: string, fixedLimits: string[], suggestedDefault: string): Item =>
  ({ id, name, points, band: "critical" as ItemBand, whatItDoes, fixedLimits, suggestedDefault, locked: true });

const row = (id: string, label: string, options: string[]): ToolRow => ({ id, label, options });

const CATEGORIES: Category[] = [
  {
    id: "sales", name: CATEGORY_NAMES.sales,
    situation: [n("leads", "Leads or enquiries a month"), n("customers", "Customers handled"), t("sources", "Main lead sources"),
      yn("cold", "Will you send cold email? (Yes / No)"), yn("dnc", "Do-not-contact list exists? (Yes / No)")],
    tools: [
      row("crm", "Customer database (CRM)", ["HubSpot", "Pipedrive", "Zoho CRM"]),
      row("email", "Email marketing", ["Brevo", "Mailchimp", "HubSpot Marketing Hub"]),
      row("esign", "Electronic signing", ["DocuSign", "Dropbox Sign", "PandaDoc"]),
      row("cold", "Cold-email sending", ["Instantly", "Smartlead", "lemlist"]),
      row("prospect", "Prospect data", ["Apollo.io", "Lusha", "ZoomInfo"]),
    ],
    items: [
      std("s-leadgen", "Lead generation/prospecting", 10, "Builds a prospect list from your ideal-client profile using public business information, scores fit, and adds each lead to your CRM with its source.", ["Public business information only; no LinkedIn automation", "Every source logged", "Monthly prospect cap"], "Automatic into the CRM as 'prospect'"),
      std("s-cold", "Cold email outreach", 8, "Writes and sends personalised first emails and follow-up steps, sorts replies, and handles unsubscribes and bounces.", ["Unsubscribe in every email and a suppression list", "Separate sending domain with a slow volume ramp", "Auto-pause if bounces or complaints pass a limit", "Daily cap"], "Needs my approval for the template and first batch"),
      std("s-qualify", "Lead qualification", 8, "Scores and ranks incoming leads against your criteria, replies within minutes with a booking link, and routes the best with a short brief.", ["Uses only your criteria"], "Automatic"),
      ctl("s-quote", "Quote/proposal drafting", 7, "Prepares draft quotes and proposals from your price list and CRM data, and chases unanswered quotes.", ["Uses only your prices; never invents prices or discounts", "Drafts logged"], "Draft goes to you before sending"),
      ctl("s-crm", "CRM data entry & pipeline tracking", 6, "Keeps the CRM current as deals move, flags stale deals, and records win/loss reasons and lead source.", ["Creates and updates only, never deletes", "Duplicate merges suggested, not done", "Full change log"], "Automatic"),
      ctl("s-followup", "Follow-up with existing clients", 5, "Scheduled check-ins and renewal and review reminders to current and past clients.", ["Unsubscribe in every message"], "Runs within your rules"),
      ctl("s-upsell", "Upsell/cross-sell offer generation", 8, "Flags clients likely to want more and drafts the offer.", ["No price or discount outside your price list", "Unsubscribe in every message"], "Offer goes to you before sending"),
      std("s-forecast", "Sales forecasting & reporting", 7, "Builds forecasts and reports from CRM data, including results by lead source.", ["Labelled 'estimate based on available data'", "No promised results"], "Automatic"),
      std("s-referral", "Referral management", 5, "Tracks referrals and prepares referral requests.", ["Never pays or promises rewards"], "Requests go to you before sending"),
    ],
  },
  {
    id: "marketing", name: CATEGORY_NAMES.marketing,
    situation: [t("goal", "One main goal"), t("social", "Social platforms you use"), t("ads", "Ad platform and monthly ad budget cap, or \"no ads\""),
      yn("website", "Website system and admin access? (Yes / No)"), yn("brand", "Brand kit exists? (Yes / No)"),
      t("approve", "Who approves content, and how fast")],
    tools: [
      row("cms", "Website system", ["WordPress", "Webflow", "Wix"]),
      row("social", "Social scheduling", ["Metricool", "Hootsuite", "Buffer"]),
      row("seo", "SEO tool", ["SE Ranking", "Semrush", "Ahrefs"]),
      row("design", "Design", ["Canva", "Adobe Express", "Figma"]),
      row("landing", "Landing pages", ["My website's CMS", "Unbounce", "Instapage"]),
      row("ads", "Ad platform (one)", ["Google Ads", "Meta Ads", "LinkedIn Ads"]),
    ],
    items: [
      std("m-web", "Website management", 8, "Edits text, pages, blog, images and menus on your CMS; checks broken links and speed.", ["CMS API only (WordPress, Webflow)", "No code or design rebuild", "No new site build"], "Needs my approval before anything goes live"),
      std("m-seo", "SEO", 10, "Keyword research, page titles and descriptions, a fixes list, and a monthly ranking report.", ["No ranking guarantee", "No buying links"], "Fixes need approval; reports automatic"),
      std("m-content", "Content writing", 7, "Articles, page text and newsletters in your voice, using only your approved claims.", ["Approved claims library only; no invented facts, prices or testimonials"], "Needs my approval before publishing"),
      ctl("m-social", "Social media posting", 6, "Plans, writes, designs, schedules and posts; answers comments only with approved replies.", ["Official publishing APIs only", "Platforms from the fixed list"], "Needs my approval before each post"),
      ctl("m-email", "Email marketing", 6, "Builds and sends newsletters and campaigns to your contact list.", ["Only contacts not on the do-not-contact list", "Unsubscribe link in every message"], "Needs my approval before each send"),
      ctl("m-ads", "Paid ad campaign management", 12, "Builds, monitors and adjusts campaigns inside your ad account.", ["Never spends above your written budget cap", "You pay the ad platform directly"], "Needs my approval for new campaigns and any budget change"),
      std("m-design", "Graphic design (routine)", 8, "Social images, banners and simple flyers from your brand kit.", ["Template-based; no logo or brand creation; no video"], "Drafts automatic; needs approval before use"),
      std("m-research", "Market & competitor research", 7, "Competitor pages, pricing, ads and news, with a summary report.", ["Public sources only"], "Automatic"),
      std("m-analytics", "Marketing analytics/reporting", 6, "Pulls analytics, ad, email and social numbers into a monthly report against your goal.", ["Reports only the numbers the tools show"], "Automatic"),
      ctl("m-leadgen", "Lead-gen campaigns", 9, "Joins ads, landing page text, emails and tracking into one campaign.", ["Same limits as the ad and email items", "Landing page published only on your CMS after approval"], "Needs my approval for the plan and each send"),
    ],
  },
  {
    id: "finance", name: CATEGORY_NAMES.finance,
    situation: [n("transactions", "Transactions a month"), n("payroll", "Employees on payroll"), n("companies", "Number of companies"),
      t("payroll_provider", "Payroll provider"), yn("hst", "Registered for sales tax (HST)? (Yes / No)"),
      t("approval_limit", "Amount above which a payment needs approval, or \"every payment\"")],
    tools: [
      row("accounting", "Accounting software (core)", ["QuickBooks Online", "Xero", "Zoho Books"]),
      row("payments", "Payments", ["Stripe", "Square", "PayPal"]),
      row("payroll", "Payroll", ["Payworks", "ADP"]),
      row("expense", "Expense capture", ["Dext", "Expensify", "Zoho Expense"]),
      row("billpay", "Bill payment / payout", ["Accounting tool's bill pay", "Wise Business", "PayPal Payouts"]),
    ],
    items: [
      ctl("f-bookkeeping", "Bookkeeping", 9, "Categorises day-to-day transactions from bank feeds, receipts and invoices; tracks subscriptions and loan payments.", ["Unclear items go to a person"], "Automatic for clear matches"),
      crit("f-ap", "Accounts payable", 8, "Captures incoming bills, checks them against orders and your rules, and prepares them; after approval, schedules or pays them.", ["Your named approver approves every payment before ORAGROL Automation acts", "ORAGROL Automation carries out exactly what was approved"], "Needs my approval before any payment"),
      ctl("f-ar", "Accounts receivable/invoicing", 8, "Prepares and sends invoices with tax from your confirmed setup, tracks what clients owe, and sends reminders.", ["Tax only from your confirmed configuration; no invented rates"], "Reminders automatic; write-offs and credit notes need approval"),
      crit("f-payroll", "Payroll processing", 10, "Prepares each payroll run from your data; after approval, runs it in your payroll system.", ["Your named approver approves every run", "Runs only in your own payroll tool"], "Needs my approval before every run"),
      ctl("f-bankrec", "Bank reconciliation", 7, "Matches the books to bank statements and flags differences.", ["Uses the accounting software's bank feeds; no bank credentials"], "Automatic matches; differences to a person"),
      ctl("f-statements", "Financial statements", 9, "Builds P&L, balance sheet and cash flow, as drafts for your accountant.", ["Labelled as drafts"], "Automatic as drafts"),
      std("f-budget", "Budgeting & forecasting", 8, "Builds budgets and forecasts from past results and your assumptions.", ["Labelled as drafts"], "Automatic as drafts"),
      crit("f-expense", "Expense tracking/reimbursement", 6, "Collects receipts, checks them against your policy, prepares reimbursements; after approval, pays them.", ["Your named approver approves before any reimbursement is paid"], "Needs my approval before any reimbursement"),
      ctl("f-cashflow", "Cash flow management", 7, "Monitors cash, upcoming bills and receipts, and flags problems early.", ["Alerts only"], "Automatic alerts"),
      std("f-reporting", "Financial reporting to ownership", 6, "Prepares regular summaries for the owner from the books.", ["Figures trace to records"], "Automatic on your schedule"),
      crit("f-tax", "Tax preparation (client-validated filing)", 12, "Prepares the information for filings and deadline reminders, and delivers the package to your designated person.", ["ORAGROL Automation never files", "No tax advice; your accountant keeps professional judgment"], "Prepare only; your designated person reviews and files"),
    ],
  },
  {
    id: "hr", name: CATEGORY_NAMES.hr,
    situation: [t("employees_provinces", "Employees and provinces"), n("hires", "Hires a year"), t("hr_system", "HR system (or \"none\")"),
      yn("screen", "Do you screen resumes today? (Yes / No)"), yn("jobs_on", "Do you advertise jobs publicly in Ontario? (Yes / No)")],
    tools: [
      row("hr", "HR records system", ["Humi", "BambooHR", "Rippling"]),
      row("ats", "Job posting and applicants", ["Workable", "Recruitee", "Zoho Recruit"]),
      row("lms", "Staff training system", ["TalentLMS", "Docebo", "360Learning"]),
    ],
    items: [
      std("h-recruit", "Recruiting/job posting", 5, "Writes the job ad, posts it to your accounts, and collects applications.", ["Posts only on your accounts", "Uses your approved hiring wording"], "Ad needs my approval before posting"),
      crit("h-screen", "Resume screening", 7, "Reads resumes and scores them against the role criteria you wrote, and shows the reasons.", ["Never rejects or hires by itself", "Scores only on your criteria (never age, gender, name, photo or nationality)", "Keeps the reason for each score"], "Suggestion only; a person decides every shortlist and reject"),
      ctl("h-onboarding", "Onboarding", 6, "Sends the new-hire pack, collects forms, creates tasks, and tracks completion.", ["Personal data stays in your HR or payroll tool"], "Checklist automatic; documents after approval"),
      ctl("h-records", "Employee records", 5, "Keeps records organised and current in your HR tool and flags missing items.", ["Never deletes a record"], "Form updates automatic; pay, title and status changes need approval"),
      ctl("h-benefits", "Benefits administration", 7, "Prepares enrolment, tracks eligibility dates, and answers routine questions from your plan documents.", ["No advice on which plan to choose"], "Enrolment changes need approval"),
      std("h-training", "Training & development", 7, "Assigns courses, sends reminders, tracks completion and reports.", ["Uses your chosen training content"], "Automatic"),
      std("h-pto", "PTO/time-off tracking", 4, "Takes requests, tracks balances, routes them for approval, and updates the calendar.", ["Balances follow your written policy"], "Approval by the manager you name"),
      ctl("h-policy", "Workplace policy management", 6, "Drafts and updates policies and the handbook, and tracks who has acknowledged them.", ["Drafts only, labelled for your lawyer; never issued as final"], "Drafts need approval before release"),
      crit("h-offboard", "Offboarding", 5, "Prepares the exit checklist, access removal requests and paperwork drafts.", ["Never decides a termination", "Final pay and records come from your payroll tool after approval"], "Your named approver approves before any step that affects pay, access or status"),
      ctl("h-law", "Employment-law compliance tracking", 8, "Watches for changes to employment rules that apply to you and flags them.", ["Alerts only, not legal advice"], "Alerts automatic"),
    ],
  },
  {
    id: "support", name: CATEGORY_NAMES.support,
    situation: [t("channels", "Channels (email, chat, phone, social)"), t("hours", "Support hours and time zone"), n("tickets", "Tickets a month"),
      t("shop", "Order or shop system (or \"none\")"), t("phone", "Phone system and call minutes, if AI calls are wanted"),
      yn("ca_number", "Canadian phone number needed? (Yes / No)"), t("person", "Who handles a case that needs a person")],
    tools: [
      row("desk", "Customer support desk: tickets and inbox (core)", ["Freshdesk", "Zoho Desk", "HubSpot Service Hub"]),
      row("chat", "Website chat", ["Tidio", "Intercom", "Zoho SalesIQ"]),
      row("voice", "AI-answered calls", ["Vapi", "Retell AI", "Twilio"]),
      row("shop", "Order / shop system", ["WooCommerce", "Shopify", "BigCommerce"]),
      row("survey", "Survey tool", ["Built into the support desk", "Typeform", "SurveyMonkey"]),
    ],
    items: [
      ctl("c-answer", "Answering inquiries", 8, "Answers customer questions by email and chat from your FAQ and policies; logs calls and voicemails and follows them up.", ["Answers only from your approved material", "Live AI calls only once voice is built and tested"], "Automatic for questions your material answers; the rest to a person"),
      ctl("c-complaints", "Complaint triage/handling", 7, "Sorts complaints by type and urgency, resolves routine ones, and escalates others with a summary.", ["Anything blank or unclear goes to a person"], "Routine automatic; your red flags go to a person"),
      ctl("c-orders", "Order/service issue resolution", 7, "Looks up the order or service record and resolves standard issues within your policy.", ["Changes outside policy need approval"], "Automatic within policy"),
      crit("c-returns", "Returns/refunds", 6, "Checks a return against your policy and prepares the return or refund.", ["Refunds go only through the approval gate", "Never refunded without your named approver"], "Needs my approval; you may set your own automatic conditions"),
      std("c-faq", "FAQ/knowledge base upkeep", 5, "Spots repeated questions and gaps, and drafts FAQ articles.", ["Drafts only"], "Needs my approval before publishing"),
      std("c-survey", "Satisfaction surveys", 4, "Sends surveys after a closed case or order, compiles results, and flags unhappy customers.", ["Unsubscribe in every survey"], "Automatic"),
      std("c-tickets", "Support ticket tracking", 6, "Keeps the queue in order, chases overdue tickets, and closes resolved ones.", ["Never deletes tickets"], "Automatic"),
      ctl("c-aftersales", "After-sales follow-up", 5, "Checks in after a purchase or service, collects feedback, and passes problems to a person.", ["Unsubscribe in every message"], "Automatic within your rules"),
    ],
  },
  {
    id: "operations", name: CATEGORY_NAMES.operations,
    situation: [t("calendar", "Calendar platform"), t("sync", "Tools to keep in sync"), t("shipping", "Carriers and shipping spend limit, if shipping"),
      n("stock_lines", "Number of stock lines, if inventory"), yn("consent", "Consent practice for recording meetings? (Yes / No)")],
    tools: [
      row("meetings", "Meetings and notes", ["Zoom", "Microsoft Teams", "Google Meet"]),
      row("tasks", "Project / task tool", ["Asana", "Monday.com", "ClickUp / Trello"]),
      row("inventory", "Inventory", ["Zoho Inventory", "Shop system's stock", "Katana / Cin7"]),
      row("shipping", "Shipping", ["ShipStation", "Shippo", "EasyPost"]),
    ],
    items: [
      std("o-schedule", "Scheduling/calendar management", 5, "Books, moves and cancels appointments, avoids clashes, and sends reminders.", ["Works only in the calendars you connect"], "Automatic inside your hours; invites to outsiders need approval"),
      std("o-filing", "Document filing", 5, "Names, files and tags documents in your storage.", ["Never deletes or overwrites; every move is logged"], "Automatic"),
      ctl("o-dataentry", "Data entry across systems", 7, "Copies data between your tools so they match, and flags differences.", ["Only tools with an API", "Never writes into finance or payroll records without the Finance rules"], "Listed fields automatic; other fields need approval"),
      std("o-comms", "Internal communications", 5, "Drafts and sends internal announcements.", ["Internal channels only"], "Drafts need approval before sending"),
      std("o-meetings", "Meeting coordination & notetaking", 7, "Finds times, sends agendas, and produces notes, action items and summaries from your meeting tool.", ["Recording consent is your responsibility"], "Notes automatic; sending to others needs approval"),
      std("o-sop", "SOP documentation", 6, "Turns how the work is done into written procedures.", ["Drafts labelled as drafts"], "Drafts need approval before publishing"),
      std("o-tasks", "Project/task tracking", 6, "Creates and updates tasks, chases owners, and reports what is late.", ["Owner and deadline changes only as your rules say"], "Automatic"),
      ctl("o-stock", "Inventory tracking/reorder alerts", 7, "Tracks stock levels and flags low stock and reorder time.", ["Alerts only; placing orders belongs to Procurement"], "Alerts automatic"),
      ctl("o-shipping", "Shipping coordination", 6, "Compares rates, books shipments, prints labels, tracks parcels, and tells the customer.", ["Your carrier account and your spend limit"], "Booking needs approval above your amount limit"),
    ],
  },
  {
    id: "it", name: CATEGORY_NAMES.it,
    situation: [n("users", "Users"), n("devices", "Devices per user"), t("website", "Website address, platform and hosting owner"),
      yn("site_admin", "Admin access to the website? (Yes / No)"), yn("backups", "Backups exist today? (Yes / No)"), t("window", "Maintenance window"),
      lt("critical_systems", "Critical systems list")],
    tools: [
      row("device", "Device management", ["Microsoft Intune", "NinjaOne", "Atera"]),
      row("backup", "Backup", ["Keepit", "Veeam", "Afi"]),
      row("itsupport", "IT support requests", ["Support desk above", "Freshservice", "Jira Service Mgmt"]),
      row("password", "Password manager", ["1Password", "Bitwarden", "Keeper"]),
      row("email_sec", "Email security", ["Defender for Office 365", "Proofpoint Essentials", "Mimecast"]),
      row("endpoint", "Endpoint protection", ["Defender for Business", "SentinelOne", "CrowdStrike Falcon Go"]),
      row("platform", "Platform", ["Microsoft 365", "Google Workspace", "Other"]),
    ],
    items: [
      crit("i-patch", "Software maintenance/patching", 7, "Plans and runs updates in the agreed window, checks they worked, and rolls back if your rule says so.", ["Only in the agreed window", "Verification after every change", "A recovery step before every change"], "Routine updates automatic in the window; critical systems need approval"),
      std("i-license", "Software license management", 5, "Keeps the list of licences, seats and renewal dates; flags unused seats and renewals.", ["Alerts and lists only; never buys or cancels"], "Alerts automatic; buying or cancelling needs approval"),
      crit("i-helpdesk", "IT helpdesk", 7, "Handles password resets, access, onboarding accounts and common how-tos.", ["Identity checked first", "Disabling accounts, resets and removing devices always need your named decider", "Every action logged"], "Common how-tos automatic; access changes need identity check and your decider"),
      ctl("i-backup", "Data backup", 6, "Runs and checks backups every night and reports failures.", ["Operates and verifies only; no promise that a restore will work"], "Automatic"),
      ctl("i-hygiene", "Basic cyber hygiene monitoring", 7, "Watches for missing updates, weak settings and unusual sign-ins, and flags them.", ["Flags only; any security incident goes to the cyber Services team"], "Alerts automatic"),
      ctl("i-web", "Website/hosting upkeep", 6, "Updates platform and plugins in the window, monitors uptime, reminds renewals, and runs a basic security scan.", ["One website after a fit check", "Hosting stays in your account", "No content edits or redesign"], "Updates in the window automatic; renewals need approval"),
      ctl("i-connect", "Connecting software tools together", 10, "Builds and runs connections so data moves between your tools.", ["Only tools with an API", "No custom development of the tools themselves"], "New connection needs approval; running connections automatic"),
    ],
  },
  {
    id: "procurement", name: CATEGORY_NAMES.procurement,
    situation: [n("suppliers", "Number of suppliers"), n("po_month", "Purchase orders a month"),
      t("po_limit", "Amount below which a purchase order may run automatically, or \"every order\""), t("po_tool", "Purchase order tool")],
    tools: [
      row("po", "Purchase orders", ["Accounting tool's POs", "Zoho Inventory", "Procurify"]),
    ],
    items: [
      std("p-sourcing", "Supplier sourcing/shortlisting", 7, "Researches suppliers for a need you state; compares price, terms, delivery and reviews; makes a dated, sourced shortlist.", ["Shortlist only; never contacts a supplier, commits or signs"], "Automatic as a report"),
      ctl("p-po", "Purchase orders", 5, "Creates POs from approved needs, sends them, tracks confirmation and delivery, and matches supplier bills to POs.", ["Only to suppliers on your approved list", "Only inside your amount limit", "PO sent exactly as approved"], "Every PO needs your named approver"),
      ctl("p-reorder", "Reorder/inventory management", 7, "Watches stock, proposes reorder quantities from your rules, and creates the PO after approval.", ["Same limits as Purchase orders", "Never changes reorder rules itself"], "Proposal needs approval"),
      std("p-vendor", "Vendor performance tracking", 6, "Tracks delivery time, price changes and order errors for each supplier, and reports.", ["Reports only; never ends a supplier relationship"], "Automatic reports"),
    ],
  },
  {
    id: "legal", name: CATEGORY_NAMES.legal,
    situation: [n("licences", "Number of licences and permits"), yn("broker", "Insurance broker contact exists? (Yes / No)"),
      t("minute_book", "Minute book location"), t("privacy_contact", "Named privacy contact (from section 02)")],
    tools: [
      row("records", "Corporate records", ["My own storage + ORAGROL register", "Ownr", "Collage"]),
    ],
    items: [
      crit("l-license", "License/permit renewal tracking and filing", 7, "Tracks every licence and permit with dates and fees, reminds you early, and prepares renewal packages and forms.", ["Government portals: ORAGROL Automation prepares; your authorised person submits", "Your credentials never go in chat"], "Reminders automatic; every renewal needs your named approver"),
      ctl("l-regulatory", "Regulatory compliance tracking", 8, "Keeps a list of the rules that apply to your business and province, watches for changes, and flags what needs action.", ["Alerts and summaries only, not legal advice"], "Alerts automatic"),
      ctl("l-insurance", "Insurance management", 6, "Tracks policies, coverage, premiums and renewal dates; compares broker quotes you provide.", ["Never buys, changes or cancels cover"], "Reminders automatic; changes need approval"),
      ctl("l-records", "Corporate record-keeping", 6, "Keeps the minute book, registers, resolutions and annual-filing dates; drafts resolutions.", ["Drafts only; never signs; never deletes a record"], "Drafts need approval; filing by your authorised person"),
      ctl("l-privacy", "Privacy/data compliance tracking (PIPEDA)", 8, "Maps the personal data you hold and where it is; tracks consent, retention, and access and deletion requests.", ["A suspected breach goes at once to your privacy contact, who decides on any notice"], "Alerts automatic"),
    ],
  },
  {
    id: "leadership", name: CATEGORY_NAMES.leadership,
    situation: [n("kpis", "Number of KPIs wanted"), t("kpi_tools", "Tools that feed them"), t("recipients", "Report recipients"),
      t("board_frequency", "Board or investor reporting frequency")],
    tools: [
      row("dash", "Dashboards", ["My ORAGROL dashboard", "Looker Studio", "Power BI / Zoho Analytics"]),
    ],
    items: [
      std("d-kpi", "KPI/performance dashboards", 7, "Builds live dashboards of the metrics you choose, from your connected tools.", ["Shows only numbers that trace to a connected tool"], "Automatic"),
      ctl("d-investor", "Investor/board reporting", 7, "Drafts and compiles the report pack from the books and dashboards, with commentary drafts.", ["Every report labelled as a draft", "Sends only to the recipients you list", "Figures trace to the books"], "Every report needs your named approver before it goes to anyone", true),
      std("d-analytics", "Company-wide analytics", 9, "Joins data across the business and finds patterns and trends for the owner.", ["Shows what the data says and how complete it is; no decisions by ORAGROL Automation"], "Automatic as reports"),
      std("d-risk", "Risk monitoring/flagging", 7, "Watches the risk signals you define (cash, late payments, supplier problems, compliance dates) and flags them.", ["Flags only; you decide what to do"], "Alerts automatic"),
    ],
  },
];

/** The live catalogue. Items come from the approved OR ONE sample (77 items, 533 points). */
export const REAL: Catalogue = { categories: CATEGORIES };

/** What the browser is first given: the category names only. Items, questions, software and limits are sent when a category is ticked. */
export function stripped(c: Category): Category { return { id: c.id, name: c.name, situation: [], tools: [], items: [] }; }
/** The full catalogue with details only for the named categories; every other category is names only. */
export function withDetails(full: Catalogue, names: readonly string[]): Catalogue {
  const wanted = new Set(names);
  return { categories: full.categories.map((c) => (wanted.has(c.name) ? c : stripped(c))) };
}
/** The details of the named categories (at most the ones that exist), for the "details" call. */
export function detailsFor(full: Catalogue, names: readonly string[]): Category[] {
  const wanted = new Set(names);
  return full.categories.filter((c) => wanted.has(c.name));
}

/**
 * The catalogue a form uses. A development-only switch loads a small FICTIONAL fixture so the picker and the item pages can be
 * tried before the real items exist. It can never run in production.
 */
export function getCatalogue(): Catalogue {
  if (process.env.NODE_ENV !== "production" && process.env.APPLY_FIXTURE_CATALOGUE === "1") return fixtureCatalogue;
  return REAL;
}
