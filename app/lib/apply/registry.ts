// Which forms exist, and which may open. Only "published" forms open for a client; a draft opens only where
// APPLY_ALLOW_DRAFT_FORMS=1 is set (a preview or a local run, never Production). That is how "the form cannot go live
// until its content is final" is enforced in code, not by memory.
import type { FormDefinition } from "./types";
import { orOneApplication } from "./forms/or-one-application.ts";
import { baApplication } from "./forms/ba-application.ts";
import { baSetup, orOneSetup } from "./forms/setup.ts";
import type { Answers, Catalogue } from "./types";

const FORMS: readonly FormDefinition[] = [orOneApplication, baApplication];

export const allForms = (): readonly FormDefinition[] => FORMS;

export function findForm(formType: string, product: string): FormDefinition | null {
  return FORMS.find((f) => f.formType === formType && f.product === product) ?? null;
}
export function formById(id: string): FormDefinition | null {
  return FORMS.find((f) => f.id === id) ?? null;
}
/** The form to show for this link, or null when it does not exist yet or is not cleared to open. */
export function openableForm(formType: string, product: string, allowDraft: boolean): FormDefinition | null {
  const form = findForm(formType, product);
  if (!form) return null;
  return form.status === "published" || allowDraft ? form : null;
}
export const draftFormsAllowed = (): boolean => process.env.APPLY_ALLOW_DRAFT_FORMS === "1";

// ---------------------------------------------------------------- Business setup
// A setup form is not fixed: it is built for each link from the answers on the client's submitted application (OCS hands them over when the
// link is opened), so it always matches what that client applied for. The same draft gate applies as for the application forms.
const SETUP_PRODUCT: Record<string, "or_one" | "ba"> = { "or-one-setup": "or_one", "ba-setup": "ba" };
const APPLICATION_FORM: Record<"or_one" | "ba", string> = { or_one: "or-one-application", ba: "ba-application" };
export const setupProductFor = (formId: string): "or_one" | "ba" | null => SETUP_PRODUCT[formId] ?? null;
export const applicationFormIdFor = (product: "or_one" | "ba"): string => APPLICATION_FORM[product];
export function buildSetup(product: string, applicationAnswers: Answers, catalogue: Catalogue): FormDefinition | null {
  if (product === "or_one") return orOneSetup(applicationAnswers, catalogue);
  if (product === "ba") return baSetup(applicationAnswers);
  return null;
}
/** The setup to show for this link, or null when there is none for the product or it is not cleared to open. */
export function openableSetup(product: string, applicationAnswers: Answers, catalogue: Catalogue, allowDraft: boolean): FormDefinition | null {
  const form = buildSetup(product, applicationAnswers, catalogue);
  return form && (form.status === "published" || allowDraft) ? form : null;
}
