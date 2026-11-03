// FICTIONAL FIXTURE. Not ORAGROL's real items, prices or vendors. Used only by tests and by local development
// (APPLY_FIXTURE_CATALOGUE=1, refused in production) to exercise the picker, the item pages and the software page.
import type { Catalogue } from "./types";

export const fixtureCatalogue: Catalogue = {
  categories: [
    { id: "sales", name: "Sales", situation: [
      { id: "leads", label: "Leads or enquiries a month", kind: "number", required: true },
      { id: "cold", label: "Will you send cold email?", kind: "yesno", required: true, choice: true },
    ], tools: [
      { id: "crm", label: "Customer records (CRM)", options: ["Example CRM One", "Example CRM Two", "Example CRM Three"] },
    ], items: [
      { id: "fx-leads", name: "Example item A: lead replies", points: 8, band: "standard", whatItDoes: "Example: answers new enquiries within minutes.", fixedLimits: ["Example limit: public information only"], suggestedDefault: "Automatic" },
      { id: "fx-quotes", name: "Example item B: quote drafts", points: 7, band: "controlled", whatItDoes: "Example: prepares draft quotes from your price list.", fixedLimits: ["Example limit: never invents prices"], suggestedDefault: "Needs approval" },
    ] },
    { id: "finance", name: "Finance & Accounting", situation: [
      { id: "transactions", label: "Transactions a month", kind: "number", required: true },
    ], tools: [], items: [
      { id: "fx-pay", name: "Example item C: sending money", points: 20, band: "critical", whatItDoes: "Example: prepares payments.", fixedLimits: ["Example limit: approval always needed"], suggestedDefault: "Needs approval", locked: true },
    ] },
  ],
};
