// The form engine (orgro.ca/apply). Pure functions, no browser or server APIs, so the same code runs in the client's browser
// (page gating, meeting boxes, saving) and on the website's server (the final check before OCS stores a submit).
// Rules it enforces come from the approved structure (Mohammad, 2026-11-02):
//   - every field is compulsory (*) or optional; a compulsory field never accepts a blank;
//   - a page cannot be passed until every compulsory field on it is complete and in the right format;
//   - "I need to discuss this in a meeting" counts a compulsory field as complete and puts it on the meeting agenda;
//   - nothing outside the form definition is ever saved.
// Only `import type` below: Node can run this file directly in tests.
import type { Answers, Catalogue, Category, Cond, Field, Flags, FormDefinition, Invitation, Item, Labelled, Page } from "./types";

export const NONE_TEXT = "None / not applicable";
export const MEETING_KEY = "Discuss in a meeting";
export const PATH_SEPARATOR = " › ";
export const MAX_FLAGS_BEFORE_WARNING = 5;

const MAX_TEXT = 300;
const MAX_LONGTEXT = 2000;
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const PHONE = /^\+?[0-9 ().-]{7,32}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
// Characters OCS refuses (control characters other than tab, new line and carriage return).
const BAD_CHARS = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g;

export interface Ctx { readonly answers: Answers; readonly flags: Flags; readonly catalogue: Catalogue }
export interface ConcretePage extends Page { readonly spec: "fields" | "situation" | "tools" | "itemRules" }

// ------------------------------------------------------------------ what the client picked

const strings = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);

export function pickedItems(answers: Answers, catalogue: Catalogue): { category: Category; item: Item }[] {
  const picked = new Set(strings(answers["items"]));
  return catalogue.categories.flatMap((category) => category.items.filter((item) => picked.has(item.id)).map((item) => ({ category, item })));
}
export function pickedCategories(answers: Answers, catalogue: Catalogue): Category[] {
  const ids = new Set(pickedItems(answers, catalogue).map((p) => p.category.id));
  return catalogue.categories.filter((c) => ids.has(c.id));
}
export function pickedPoints(answers: Answers, catalogue: Catalogue): number {
  return pickedItems(answers, catalogue).reduce((n, p) => n + p.item.points, 0);
}
/** The smallest tier that fits, or "Signature" above the largest. STARTER also needs a single category. */
export function tierEstimate(def: FormDefinition, answers: Answers, catalogue: Catalogue): string | null {
  const points = pickedPoints(answers, catalogue);
  if (points === 0) return null;
  const cats = pickedCategories(answers, catalogue).length;
  for (const t of [...def.tiers].sort((a, b) => a.maxPoints - b.maxPoints)) {
    if (points <= t.maxPoints && (!t.oneCategoryOnly || cats <= 1)) return t.name;
  }
  return "Signature";
}

// ------------------------------------------------------------------ conditions

export function test(cond: Cond | undefined, ctx: Ctx): boolean {
  if (!cond) return true;
  if ("all" in cond) return cond.all.every((c) => test(c, ctx));
  if ("any" in cond) return cond.any.some((c) => test(c, ctx));
  if ("not" in cond) return !test(cond.not, ctx);
  if ("flagged" in cond) return Object.values(ctx.flags).some(Boolean);
  if ("category" in cond) return pickedCategories(ctx.answers, ctx.catalogue).some((c) => c.name === cond.category);
  const v = ctx.answers[cond.field];
  if ("is" in cond) return v === cond.is;
  if ("has" in cond) return strings(v).includes(cond.has);
  return !isBlank(v);
}

export function isBlank(v: unknown): boolean {
  if (v === undefined || v === null) return true;
  if (typeof v === "string") return v.trim() === "";
  if (Array.isArray(v)) return v.length === 0;
  return false;
}

export const isVisible = (f: Field, ctx: Ctx): boolean => test(f.showIf, ctx);
export function isRequired(f: Field, ctx: Ctx): boolean {
  if (!isVisible(f, ctx)) return false;
  if (f.kind === "typed") return true; // the typed signature is always compulsory
  if (f.kind === "check") return f.required !== false;
  return f.required === true || (f.requiredIf !== undefined && test(f.requiredIf, ctx));
}
/** The meeting box is offered on compulsory fields only, never on legal boxes or the signature. */
export function canDiscuss(f: Field, ctx: Ctx): boolean {
  return isRequired(f, ctx) && f.discuss !== false && f.kind !== "check" && f.kind !== "typed" && f.kind !== "autodate" && f.kind !== "copy";
}

// ------------------------------------------------------------------ pages

const ruleChoices = (item: Item): string[] =>
  item.locked ? ["Needs my approval", "Red flag (hand to a person)"] : ["Automatic", "Needs my approval", "Red flag (hand to a person)"];

/** The pages the client actually sees, given what they have picked so far. Pages with nothing to ask are left out. */
export function expand(def: FormDefinition, catalogue: Catalogue, answers: Answers): ConcretePage[] {
  const out: ConcretePage[] = [];
  for (const spec of def.pages) {
    if (spec.kind === "fields") {
      if (test(spec.page.showIf, { answers, flags: {}, catalogue })) out.push({ ...spec.page, spec: "fields" });
      continue;
    }
    const base = { id: spec.id, title: spec.title, intro: spec.intro };
    if (spec.kind === "situation") {
      const fields = pickedCategories(answers, catalogue).flatMap((c) =>
        c.situation.map((f) => ({ ...f, id: `sit.${c.id}.${f.id}`, group: c.name, required: f.required ?? true })));
      if (fields.length) out.push({ ...base, fields, spec: "situation" });
    } else if (spec.kind === "tools") {
      // One row per tool in each picked category, as the PDF's software section lists them: the options, "Not sure, recommend",
      // and an "Already use" box. Each row is compulsory (a blank is never accepted; "None" is not a tool choice).
      const fields = pickedCategories(answers, catalogue).flatMap((c) => c.tools.flatMap((r): Field[] => [
        { id: `tool.${c.id}.${r.id}`, label: r.label, group: c.name, kind: "select", choice: true, required: true, discuss: false,
          options: [...r.options, "Not sure, recommend"] },
        { id: `tool.${c.id}.${r.id}.already`, label: `${r.label}: already use`, group: c.name, kind: "text", required: false, discuss: false },
      ]));
      const all = [...fields, ...(spec.extra ?? [])];
      if (all.length) out.push({ ...base, fields: all, spec: "tools" });
    } else {
      // One page per picked category, one card per picked item.
      for (const c of pickedCategories(answers, catalogue)) {
        const fields = pickedItems(answers, catalogue).filter((p) => p.category.id === c.id).flatMap(({ item }): Field[] => {
          const choice = `rule.${item.id}.choice`;
          const automatic = { field: choice, is: "Automatic" } as const;
          // One choice and one box, as the PDF's table: "Limit, approver or never do". If Automatic is chosen on a controlled
          // item, the limit is compulsory (PDF section 06).
          return [
            { id: choice, label: "Your choice", group: `${item.name} (${item.points} pts)`, kind: "select", choice: true, required: true, options: ruleChoices(item),
              help: `${item.whatItDoes}\nORAGROL's fixed limits (they cannot be changed): ${item.fixedLimits.length ? item.fixedLimits.join("; ") : "none"}.\nOur suggestion: ${item.suggestedDefault}. It is not pre-selected: the choice is yours.` },
            { id: `rule.${item.id}.limit`, label: "Limit, approver or \"never do\"", group: `${item.name} (${item.points} pts)`, kind: "text", discuss: false,
              requiredIf: item.band === "standard" ? undefined : automatic },
          ];
        });
        if (fields.length) out.push({ ...base, id: `${spec.id}.${c.id}`, title: `${spec.title}: ${c.name}`, fields, spec: "itemRules" });
      }
    }
  }
  return out;
}

export function visibleFields(page: Page, ctx: Ctx): Field[] { return page.fields.filter((f) => isVisible(f, ctx)); }

// ------------------------------------------------------------------ validation

/** The error for one field, or null. A flagged compulsory field with a blank answer counts as complete. */
export function validateField(f: Field, ctx: Ctx): string | null {
  if (!isVisible(f, ctx)) return null;
  const v = ctx.answers[f.id];
  const required = isRequired(f, ctx);
  const flagged = ctx.flags[f.id] === true && canDiscuss(f, ctx);
  if (f.kind === "autodate" || f.kind === "copy") return null;
  if (f.kind === "check") return v === true || !required ? null : "Tick this box to continue.";
  if (f.kind === "people") return peopleError(f, v, required, flagged);
  if (f.kind === "items") return pickedItems(ctx.answers, ctx.catalogue).length > 0 || !required ? null : "Choose at least one item.";
  if (isBlank(v)) return required && !flagged ? "This is required." : null;
  switch (f.kind) {
    case "text": case "typed": return typeof v === "string" && v.trim().length <= MAX_TEXT ? (f.kind === "typed" && v.trim().length < 2 ? "Type your full name." : null) : "Too long.";
    case "longtext": return typeof v === "string" && v.trim().length <= MAX_LONGTEXT ? null : "Too long.";
    case "email": return typeof v === "string" && v.trim().length <= 254 && EMAIL.test(v.trim()) ? null : "Enter a valid email address.";
    case "phone": return typeof v === "string" && PHONE.test(v.trim()) ? null : "Enter a valid phone number, for example +1 416 555 0100.";
    case "url": return urlOk(v) ? null : "Enter a valid website address, for example orgro.ca.";
    case "date": return dateOk(v) ? null : "Enter a valid date.";
    case "number": return numberError(f, v);
    case "select": case "yesno": {
      const allowed = optionsOf(f);
      return typeof v === "string" && allowed.includes(v) ? null : "Choose one of the options.";
    }
    case "multiselect": {
      const allowed = optionsOf(f);
      const chosen = strings(v);
      if (!chosen.every((x) => allowed.includes(x))) return "Choose one of the options.";
      const min = f.min ?? 1;
      if (chosen.length < min) return min === 1 ? "Choose at least one option." : `Choose ${min === f.max ? `exactly ${min}` : `at least ${min}`}.`;
      if (f.max !== undefined && chosen.length > f.max) return `Choose no more than ${f.max}.`;
      return null;
    }
  }
  return null;
}

export function optionsOf(f: Field): string[] {
  if (f.kind === "yesno") return ["Yes", "No"];
  return [...(f.options ?? []), ...(f.allowNone ? [NONE_TEXT] : [])];
}

function urlOk(v: unknown): boolean {
  if (typeof v !== "string" || v.trim().length > MAX_TEXT) return false;
  const raw = v.trim();
  try {
    const u = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    return (u.protocol === "https:" || u.protocol === "http:") && /\.[a-z]{2,}$/i.test(u.hostname);
  } catch { return false; }
}
function dateOk(v: unknown): boolean {
  if (typeof v !== "string" || !DATE.test(v)) return false;
  const d = new Date(`${v}T12:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
}
function numberError(f: Field, v: unknown): string | null {
  const n = typeof v === "number" ? v : typeof v === "string" && /^-?\d+(\.\d+)?$/.test(v.trim()) ? Number(v.trim()) : NaN;
  if (!Number.isFinite(n)) return "Enter a number (your best estimate is fine).";
  if (n < (f.min ?? 0)) return `Enter ${f.min ?? 0} or more.`;
  if (n > (f.max ?? 1_000_000_000)) return "That number is too large.";
  return null;
}
function peopleError(f: Field, v: unknown, required: boolean, flagged: boolean): string | null {
  const rows = Array.isArray(v) ? v : [];
  const cols = f.columns ?? [];
  const min = f.min ?? (required ? 1 : 0);
  if (rows.length === 0) return required && !flagged ? `Add at least ${min} ${min === 1 ? "person" : "people"}.` : null;
  if (rows.length > (f.max ?? 10)) return `Add no more than ${f.max ?? 10}.`;
  for (const row of rows) {
    const r = (row ?? {}) as Record<string, unknown>;
    for (const c of cols) {
      const x = r[c.id];
      if (typeof x !== "string" || x.trim() === "") return "Fill in every column for each person.";
      if (c.kind === "email" && !EMAIL.test(x.trim())) return "Enter a valid email address for each person.";
      if (c.kind === "phone" && !PHONE.test(x.trim())) return "Enter a valid phone number for each person.";
      if (x.trim().length > MAX_TEXT) return "Too long.";
    }
  }
  return rows.length < min && !flagged ? `Add at least ${min} ${min === 1 ? "person" : "people"}.` : null;
}

/** Errors on one page, by field id. Empty object = the page can be passed. */
export function validatePage(page: Page, ctx: Ctx): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const f of page.fields) { const e = validateField(f, ctx); if (e) errors[f.id] = e; }
  return errors;
}
/** The first page that cannot be passed yet, as an index into `pages`, or -1 when every page is complete. */
export function firstIncomplete(pages: readonly Page[], ctx: Ctx): number {
  return pages.findIndex((p) => Object.keys(validatePage(p, ctx)).length > 0);
}
/** The tier / points rule of the picker: the picker needs at least one item, and an empty catalogue can never be completed. */
export function catalogueReady(catalogue: Catalogue): boolean { return catalogue.categories.some((c) => c.items.length > 0); }

// ------------------------------------------------------------------ the saved (readable) answers

const pathOf = (page: Page, f: Field): string[] => (f.group ? [page.title, f.group, f.label] : [page.title, f.label]);
export const flagKey = (page: Page, f: Field): string => pathOf(page, f).join(PATH_SEPARATOR);

function clip(s: string, f: Field): string {
  const max = f.kind === "longtext" ? MAX_LONGTEXT : MAX_TEXT;
  return s.replace(BAD_CHARS, "").trim().slice(0, max);
}
const cleanKey = (s: string) => s.replace(BAD_CHARS, " ").slice(0, 120);

function setPath(root: Labelled, path: string[], value: unknown) {
  let node = root;
  for (const key of path.slice(0, -1)) {
    const k = cleanKey(key);
    node = (node[k] ??= {}) as Labelled;
  }
  node[cleanKey(path[path.length - 1]!)] = value;
}
function getPath(root: Labelled, path: string[]): unknown {
  let node: unknown = root;
  for (const key of path) {
    if (node === null || typeof node !== "object" || Array.isArray(node)) return undefined;
    node = (node as Labelled)[cleanKey(key)];
  }
  return node;
}

/** What is saved at OCS: only visible fields of the form, under page title and field label, never anything else. */
export function toLabelled(def: FormDefinition, pages: readonly Page[], ctx: Ctx): Labelled {
  const out: Labelled = { Form: { Name: def.name, Version: def.version } };
  const flagged: string[] = [];
  for (const page of pages) {
    for (const f of page.fields) {
      if (!isVisible(f, ctx) || f.kind === "autodate") continue;
      const v = ctx.answers[f.id];
      if (ctx.flags[f.id] === true && canDiscuss(f, ctx)) flagged.push(flagKey(page, f));
      let saved: unknown;
      if (f.kind === "copy") saved = f.copyFrom ? ctx.answers[f.copyFrom] : undefined;
      else if (f.kind === "check") saved = v === true ? true : undefined;
      else if (f.kind === "number") saved = typeof v === "number" ? v : typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v)) ? Number(v) : undefined;
      else if (f.kind === "multiselect") saved = strings(v).length ? strings(v).slice(0, 50).map((x) => clip(x, f)) : undefined;
      else if (f.kind === "items") {
        const names = pickedItems(ctx.answers, ctx.catalogue).map((p) => p.item.name);
        saved = names.length ? names : undefined;
      } else if (f.kind === "people") {
        const rows = (Array.isArray(v) ? v : []).slice(0, f.max ?? 10).map((row) => {
          const r = (row ?? {}) as Record<string, unknown>;
          return Object.fromEntries((f.columns ?? []).map((c) => [cleanKey(c.label), typeof r[c.id] === "string" ? clip(r[c.id] as string, f) : ""]));
        });
        saved = rows.length ? rows : undefined;
      } else saved = typeof v === "string" && v.trim() !== "" ? clip(v, f) : undefined;
      if (saved !== undefined && saved !== "") setPath(out, pathOf(page, f), saved);
    }
  }
  if (flagged.length) out[MEETING_KEY] = flagged;
  return out;
}

/** Reads saved answers back into the form. Generated pages depend on the picked items, so it runs until nothing new appears. */
export function fromLabelled(def: FormDefinition, catalogue: Catalogue, labelled: Labelled | null | undefined): { answers: Answers; flags: Flags } {
  const answers: Answers = {};
  const flags: Flags = {};
  if (!labelled || typeof labelled !== "object") return { answers, flags };
  const flagged = new Set(strings(labelled[MEETING_KEY]));
  for (let round = 0; round < 4; round += 1) {
    let changed = false;
    for (const page of expand(def, catalogue, answers)) {
      for (const f of page.fields) {
        if (f.id in answers) continue;
        const v = getPath(labelled, pathOf(page, f));
        let value: unknown;
        if (v === undefined) { if (!flagged.has(flagKey(page, f))) continue; }
        else if (f.kind === "items") {
          const names = new Set(strings(v));
          value = catalogue.categories.flatMap((c) => c.items).filter((i) => names.has(i.name)).map((i) => i.id);
        } else if (f.kind === "number") value = typeof v === "number" ? String(v) : undefined;
        else if (f.kind === "check") value = v === true ? true : undefined;
        else if (f.kind === "multiselect") value = strings(v);
        else if (f.kind === "people") {
          value = (Array.isArray(v) ? v : []).map((row) => {
            const r = (row ?? {}) as Record<string, unknown>;
            return Object.fromEntries((f.columns ?? []).map((c) => [c.id, typeof r[c.label] === "string" ? (r[c.label] as string) : ""]));
          });
        } else if (f.kind === "copy" || f.kind === "autodate") continue;
        else value = typeof v === "string" ? v : undefined;
        if (value !== undefined) { answers[f.id] = value; changed = true; }
        if (flagged.has(flagKey(page, f))) flags[f.id] = true;
      }
    }
    if (!changed) break;
  }
  return { answers, flags };
}

/** Pre-fills the invitation details where the field asks for them and nothing was answered yet. */
export function withPrefill(def: FormDefinition, catalogue: Catalogue, answers: Answers, invitation: Invitation): Answers {
  const next = { ...answers };
  for (const page of expand(def, catalogue, next)) {
    for (const f of page.fields) if (f.prefill && isBlank(next[f.id])) next[f.id] = invitation[f.prefill];
  }
  return next;
}

/** The meeting agenda: every flagged compulsory field, as OCS stores it (section = page, item = field). */
export function meetingList(pages: readonly Page[], ctx: Ctx): { section: string; item: string; note: string | null }[] {
  const out: { section: string; item: string; note: string | null }[] = [];
  for (const page of pages) {
    for (const f of page.fields) {
      if (isVisible(f, ctx) && ctx.flags[f.id] === true && canDiscuss(f, ctx)) {
        out.push({ section: page.title.slice(0, 120), item: (f.group ? `${f.group}${PATH_SEPARATOR}${f.label}` : f.label).slice(0, 300), note: null });
      }
    }
  }
  return out.slice(0, 100);
}

/** The signature record OCS needs, from the signature fields of the form. Null while it is incomplete. */
export function signaturePayload(def: FormDefinition, answers: Answers): { name: string; title: string | null; signature: string; agree: true } | null {
  const s = def.signature;
  const name = typeof answers[s.name] === "string" ? (answers[s.name] as string).trim() : "";
  const typed = typeof answers[s.typed] === "string" ? (answers[s.typed] as string).trim() : "";
  const title = typeof answers[s.title] === "string" && (answers[s.title] as string).trim() ? (answers[s.title] as string).trim().slice(0, 120) : null;
  if (name.length < 2 || typed.length < 2 || answers[s.agree] !== true) return null;
  return { name: name.slice(0, 160), title, signature: typed.slice(0, 160), agree: true };
}

/** The full check before a submit: every page, with the page index and field of the first problem. */
export function validateAll(def: FormDefinition, catalogue: Catalogue, answers: Answers, flags: Flags): { ok: boolean; pageIndex: number; errors: Record<string, string> } {
  const pages = expand(def, catalogue, answers);
  const ctx: Ctx = { answers, flags, catalogue };
  const index = firstIncomplete(pages, ctx);
  if (index >= 0) return { ok: false, pageIndex: index, errors: validatePage(pages[index]!, ctx) };
  if (!signaturePayload(def, answers)) return { ok: false, pageIndex: pages.length - 1, errors: { [def.signature.typed]: "Complete the signature block." } };
  return { ok: true, pageIndex: -1, errors: {} };
}
