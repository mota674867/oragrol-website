// Which forms exist, and which may open. Only "published" forms open for a client; a draft opens only where
// APPLY_ALLOW_DRAFT_FORMS=1 is set (a preview or a local run, never Production). That is how "the form cannot go live
// until its content is final" is enforced in code, not by memory.
import type { FormDefinition } from "./types";
import { orOneApplication } from "./forms/or-one-application.ts";
import { baApplication } from "./forms/ba-application.ts";

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
