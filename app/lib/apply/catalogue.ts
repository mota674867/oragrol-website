// What the OR ONE application form offers: the 10 categories (the website's names, in the website's order) and, per category,
// the "Size and situation" questions from the structure plan (DRAFT v1, 2026-11-02).
//
// NOT YET FILLED IN, on purpose: the items (77, with points and risk bands), their fixed limits and defaults, and the tool types with
// their verified vendors. They come from the 10 handling tables and the vendor verification round, which Mohammad is still reviewing.
// Until they are loaded the picker has nothing to offer, the form cannot be completed, and its status stays "draft" (nothing opens for clients).
import type { Catalogue, Field } from "./types";
import { fixtureCatalogue } from "./catalogue-fixture.ts";

const n = (id: string, label: string, help?: string): Field => ({ id, label, kind: "number", required: true, help });
const t = (id: string, label: string, help?: string): Field => ({ id, label, kind: "text", required: true, help, allowNone: true });
const lt = (id: string, label: string, help?: string): Field => ({ id, label, kind: "longtext", required: true, help, allowNone: true });
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

const REAL: Catalogue = {
  toolTypes: [],
  categories: [
    { id: "sales", name: CATEGORY_NAMES.sales, items: [], situation: [
      n("leads", "Leads or enquiries a month"), n("customers", "Customers handled"), t("sources", "Main lead sources"),
      yn("cold", "Will you send cold email?"), yn("dnc", "Do you have a do-not-contact list?"),
      { id: "steps", label: "Sales steps, first contact to close", kind: "longtext" },
    ] },
    { id: "marketing", name: CATEGORY_NAMES.marketing, items: [], situation: [
      t("goal", "One main goal"), t("social", "Social platforms you use"), t("ads", "Ad platform and monthly ad budget cap, or no ads"),
      t("website", "Website system"), yn("admin", "Can ORAGROL get admin access to the website, if website management is picked?"),
      yn("brand", "Do you have a brand kit?"), t("approve", "Who approves content, and how fast"),
    ] },
    { id: "finance", name: CATEGORY_NAMES.finance, items: [], situation: [
      n("transactions", "Transactions a month"), n("payroll", "Employees on payroll"), n("companies", "Number of companies"), t("provider", "Payroll provider"),
      yn("hst", "Are you registered for sales tax (HST)?"), t("approval", "The amount above which a payment needs approval, or \"every payment needs approval\""),
    ] },
    { id: "hr", name: CATEGORY_NAMES.hr, items: [], situation: [
      t("provinces", "Employees and provinces"), n("hires", "Hires a year"), t("system", "HR system"),
      yn("screen", "Do you screen resumes today?"), yn("jobs", "Do you advertise jobs publicly in Ontario?"),
    ] },
    { id: "support", name: CATEGORY_NAMES.support, items: [], situation: [
      t("channels", "Channels"), t("hours", "Support hours and time zone"), n("tickets", "Tickets a month"), t("shop", "Order or shop system"),
      t("phone", "Phone system and call minutes, if AI calls are wanted"), yn("number", "Do you need a Canadian phone number?"), t("person", "Who handles a case that needs a person (name)"),
    ] },
    { id: "operations", name: CATEGORY_NAMES.operations, items: [], situation: [
      t("calendar", "Calendar platform"), t("sync", "Tools to keep in sync"), t("carriers", "Carriers and shipping spend limit, if shipping"),
      t("stock", "Number of stock lines, if inventory"), yn("consent", "Do you have a consent practice for recording meetings?"),
    ] },
    { id: "it", name: CATEGORY_NAMES.it, items: [], situation: [
      n("users", "Users"), n("devices", "Devices per user"), t("site", "Website address, platform and hosting owner"), yn("admin", "Can ORAGROL get admin access?"),
      yn("backups", "Do backups exist today?"), t("window", "Maintenance window"), lt("critical", "Critical systems list"),
    ] },
    { id: "procurement", name: CATEGORY_NAMES.procurement, items: [], situation: [
      n("suppliers", "Number of suppliers"), n("orders", "Purchase orders a month"),
      t("limit", "The amount below which a purchase order may run automatically, or \"every order needs approval\""), t("tool", "Purchase order tool"),
    ] },
    { id: "legal", name: CATEGORY_NAMES.legal, items: [], situation: [
      n("licences", "Number of licences and permits"), yn("broker", "Is there an insurance broker contact?"), t("minutes", "Minute book location"),
    ] },
    { id: "leadership", name: CATEGORY_NAMES.leadership, items: [], situation: [
      n("kpis", "Number of KPIs wanted"), t("tools", "The tools that feed them"), t("recipients", "Report recipients"), t("board", "Board or investor reporting frequency"),
    ] },
  ],
};

/**
 * The catalogue a form uses. A development-only switch loads a small FICTIONAL fixture so the picker and the item pages can be
 * tried before the real items exist. It can never run in production.
 */
export function getCatalogue(): Catalogue {
  if (process.env.NODE_ENV !== "production" && process.env.APPLY_FIXTURE_CATALOGUE === "1") return fixtureCatalogue;
  return REAL;
}
