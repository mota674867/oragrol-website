// The private application forms (orgro.ca/apply/<code>): the shapes of a form definition, the catalogue it draws from,
// and the answers. A form is DATA (see forms/*.ts); one engine (engine.ts) runs every form, in the browser and on the server.
// Only `import type` is allowed in this file and in engine.ts, so the engine can be tested with plain Node.

/** A condition on other answers. `field` refers to a field id; `category` to a catalogue category the client picked items from. */
export type Cond =
  | { readonly field: string; readonly is: string | boolean }
  | { readonly field: string; readonly has: string }
  | { readonly field: string; readonly filled: true }
  | { readonly category: string }
  | { readonly flagged: true }
  | { readonly all: readonly Cond[] }
  | { readonly any: readonly Cond[] }
  | { readonly not: Cond };

export type FieldKind =
  | "text" | "longtext" | "email" | "phone" | "url" | "number" | "date"
  | "select" | "multiselect" | "yesno" | "people" | "items" | "check" | "typed" | "autodate" | "copy";

export interface PersonColumn { readonly id: string; readonly label: string; readonly kind: "text" | "email" | "phone" }

export interface Field {
  /** Unique across the whole form. Generated fields use a prefix: sit.<category>.<id>, rule.<item>.<id>, tool.<type>.<id>. */
  readonly id: string;
  /** What the client sees; also the key in the saved answers, so it must be unique within its page and group. */
  readonly label: string;
  readonly kind: FieldKind;
  /** A sub-heading on the page (for example an item name); also a level in the saved answers. */
  readonly group?: string;
  readonly help?: string;
  readonly placeholder?: string;
  readonly required?: boolean;
  readonly requiredIf?: Cond;
  readonly showIf?: Cond;
  readonly options?: readonly string[];
  /** Show choices as radio buttons / checkboxes instead of a menu. */
  readonly choice?: boolean;
  /** Adds an explicit "None / not applicable" choice (a blank is never accepted for a compulsory field). */
  readonly allowNone?: boolean;
  /** Set false to hide the "I need to discuss this in a meeting" box on a compulsory field. Default: shown. */
  readonly discuss?: boolean;
  readonly min?: number;
  readonly max?: number;
  readonly columns?: readonly PersonColumn[];
  /** Pre-filled from the invitation: company, person, phone, email. */
  readonly prefill?: "company" | "person" | "phone" | "email";
  /** kind "copy": shows another field's answer, read-only. */
  readonly copyFrom?: string;
  /** kind "check": the full wording shown next to the box. */
  readonly text?: string;
}

export interface Page {
  readonly id: string;
  readonly title: string;
  readonly intro?: string;
  readonly fields: readonly Field[];
}

/** A page that is generated from what the client picked. */
export type PageSpec =
  | { readonly kind: "fields"; readonly page: Page }
  | { readonly kind: "situation"; readonly id: string; readonly title: string; readonly intro?: string }
  | { readonly kind: "tools"; readonly id: string; readonly title: string; readonly intro?: string; readonly extra?: readonly Field[] }
  | { readonly kind: "itemRules"; readonly id: string; readonly title: string; readonly intro?: string };

export interface Tier { readonly name: string; readonly maxPoints: number; readonly oneCategoryOnly?: boolean }

export interface FormDefinition {
  readonly id: string;
  readonly name: string;
  readonly formType: "application" | "setup";
  readonly product: "or_one" | "ba" | "services";
  /** Only "published" forms open for clients. "draft" opens only where APPLY_ALLOW_DRAFT_FORMS=1 (preview, never production). */
  readonly status: "draft" | "published";
  readonly version: string;
  readonly pages: readonly PageSpec[];
  readonly tiers: readonly Tier[];
  /** Which field ids make the signature. */
  readonly signature: { readonly name: string; readonly title: string; readonly typed: string; readonly agree: string };
  /** Shown on the thank-you screen. */
  readonly whatNext: readonly string[];
}

export type ItemBand = "standard" | "controlled" | "critical";
export interface Item {
  readonly id: string;
  readonly name: string;
  readonly points: number;
  readonly band: ItemBand;
  readonly whatItDoes: string;
  /** ORAGROL's fixed limits for this item: shown, locked. */
  readonly fixedLimits: readonly string[];
  readonly suggestedDefault: string;
  /** Locked items offer only "needs approval" or "red flag". */
  readonly locked?: boolean;
  readonly toolTypes: readonly string[];
}
export interface Category {
  readonly id: string;
  /** The website name of the category. */
  readonly name: string;
  readonly situation: readonly Field[];
  readonly items: readonly Item[];
}
export interface ToolType { readonly id: string; readonly name: string; readonly vendors: readonly string[] }
export interface Catalogue { readonly categories: readonly Category[]; readonly toolTypes: readonly ToolType[] }

/** Flat answers by field id, as the form holds them while the client types. */
export type Answers = Record<string, unknown>;
/** Fields flagged "I need to discuss this in a meeting": field id -> true. */
export type Flags = Record<string, boolean>;
/** Readable answers as saved at OCS: page title > (group >) field label > value. */
export type Labelled = Record<string, unknown>;

export interface Invitation { readonly company: string; readonly person: string; readonly phone: string; readonly email: string }
