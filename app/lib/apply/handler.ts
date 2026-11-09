// Save and submit for the private forms, as plain functions with their dependencies passed in (so they can be tested without a web
// server). The route file (app/api/apply/[action]/route.ts) only wires in the real fetch, rate limiter and settings.
// What it guarantees:
//   - the browser can only name its own link; it cannot choose which form applies (a signed token ties the link to its form);
//   - only fields that exist in the form are saved, clipped to their limits; nothing else reaches OCS;
//   - a submit is checked in full here, with the same engine the browser uses, before OCS stores it;
//   - replies say nothing about why a link failed: an unknown, expired or switched-off link is a plain 404.
import { detailsFor } from "./catalogue.ts";
import { confirmSubmit, type NotifyDeps } from "./notify.ts";
import { buildPackage, PACKAGE_KEY } from "./package.ts";
import { expand, fromLabelled, meetingList, signaturePayload, toLabelled, validateAll } from "./engine.ts";
import type { Ctx } from "./engine.ts";
import { applicationFormIdFor, buildSetup, formById, setupProductFor } from "./registry.ts";
import { formTokenOk, LINK_CODE, ocsApply } from "./ocs.ts";
import type { ClientMeta, OcsApplyConfig, OcsReply } from "./ocs.ts";
import type { Answers, Catalogue, FormDefinition, Flags } from "./types";

export const MAX_BODY_CHARS = 240_000;

export interface ApplyDeps {
  readonly config: OcsApplyConfig | null;
  readonly catalogue: Catalogue;
  readonly allowDraft: boolean;
  readonly fetchImpl?: typeof fetch;
  /** Sends the confirmation email after a submit; absent means no email. */
  readonly notify?: NotifyDeps;
  readonly limit: (key: string, opts: { limit: number; windowMs: number }) => Promise<boolean>;
}
export interface ApplyResult { readonly status: number; readonly body: Record<string, unknown> }

const reply = (status: number, body: Record<string, unknown>): ApplyResult => ({ status, body });
const plain = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === "object" && !Array.isArray(v);

const LIMITS = { save: { limit: 200, windowMs: 10 * 60_000 }, submit: { limit: 12, windowMs: 10 * 60_000 }, details: { limit: 120, windowMs: 10 * 60_000 } } as const;

/** The result of an OCS call, turned into what the browser may learn. */
function fromOcs(r: OcsReply | null, okBody: (b: Record<string, unknown>) => Record<string, unknown>): ApplyResult {
  if (!r) return reply(503, { status: "failed", code: "UNAVAILABLE" });
  if (r.status === 200 && r.body && r.body.status === "ok") return reply(200, { status: "ok", ...okBody(r.body) });
  if (r.status === 404) return reply(404, { status: "failed" });
  if (r.status === 409) return reply(409, { status: "failed", code: "ALREADY_SUBMITTED" });
  if (r.status === 413) return reply(413, { status: "failed", code: "TOO_LARGE" });
  if (r.status === 429) return reply(429, { status: "failed", code: "SLOW_DOWN" });
  return reply(r.status === 401 || r.status === 503 ? 503 : 502, { status: "failed", code: "UNAVAILABLE" });
}

/**
 * The form for a link: a fixed application form, or a Business setup rebuilt from the answers on the application it was sent for.
 * The setup's answers come from OCS (a quiet open: nothing is logged), never from the browser, so the browser cannot shape its own form.
 */
async function resolveForm(formId: string, code: string, client: ClientMeta, deps: ApplyDeps): Promise<FormDefinition | null> {
  const fixed = formById(formId);
  if (fixed) return fixed;
  const product = setupProductFor(formId);
  if (!product || !deps.config) return null;
  const opened = await ocsApply("/v1/apply/open", { code, quiet: true, client }, deps.config, deps.fetchImpl);
  if (!opened || opened.status !== 200 || !opened.body || opened.body.status !== "ok" || opened.body.state !== "open") return null;
  if (opened.body.formType !== "setup" || opened.body.product !== product) return null;
  return setupFromOpen(product, opened.body, deps.catalogue);
}

/** The setup form for an opened setup link: built from the application it is based on. Null when OCS gave no application. */
export function setupFromOpen(product: string, openBody: Record<string, unknown>, catalogue: Catalogue): FormDefinition | null {
  const based = openBody.basedOn;
  if ((product !== "or_one" && product !== "ba" && product !== "services") || !plain(based)) return null;
  const applicationAnswers = restore(applicationFormIdFor(product), catalogue, based.answers).answers;
  return buildSetup(product, applicationAnswers, catalogue);
}

export async function handleApply(action: "save" | "submit" | "details", rawBody: string, client: ClientMeta, deps: ApplyDeps): Promise<ApplyResult> {
  if (!deps.config) return reply(503, { status: "failed", code: "UNAVAILABLE" });
  if (rawBody.length > MAX_BODY_CHARS) return reply(413, { status: "failed", code: "TOO_LARGE" });
  let input: unknown;
  try { input = JSON.parse(rawBody); } catch { return reply(400, { status: "failed" }); }
  if (!plain(input)) return reply(400, { status: "failed" });
  const { code, form: formId, token } = input;
  if (typeof code !== "string" || !LINK_CODE.test(code) || typeof formId !== "string") return reply(404, { status: "failed" });
  if (!formTokenOk(deps.config.secret, code, formId, token)) return reply(404, { status: "failed" });
  if (!(await deps.limit(`apply:${action}:${client.address ?? "unknown"}`, LIMITS[action]))) return reply(429, { status: "failed", code: "SLOW_DOWN" });
  const def = await resolveForm(formId, code, client, deps);
  if (!def || (def.status !== "published" && !deps.allowDraft)) return reply(404, { status: "failed" });

  if (action === "details") {
    // Only the details of the categories the client ticked are ever sent to the browser.
    const names = Array.isArray(input.categories) ? input.categories.filter((n): n is string => typeof n === "string").slice(0, 10) : [];
    return reply(200, { status: "ok", categories: detailsFor(deps.catalogue, names) });
  }

  const answers: Answers = plain(input.answers) ? input.answers : {};
  const flags: Flags = plain(input.flags) ? Object.fromEntries(Object.entries(input.flags).map(([k, v]) => [k, v === true])) : {};
  const pages = expand(def, deps.catalogue, answers);
  const ctx: Ctx = { answers, flags, catalogue: deps.catalogue };
  // Only fields that exist in the form survive this step.
  const labelled = toLabelled(def, pages, ctx);

  if (action === "save") {
    const page = Number.isInteger(input.page) ? Math.min(Math.max(input.page as number, 1), 40) : 1;
    return fromOcs(await ocsApply("/v1/apply/save", { code, answers: labelled, page, client }, deps.config, deps.fetchImpl),
      (b) => ({ saved: b.saved === true, savedAt: typeof b.savedAt === "string" ? b.savedAt : null }));
  }

  const check = validateAll(def, deps.catalogue, answers, flags);
  if (!check.ok) return reply(422, { status: "invalid", pageIndex: check.pageIndex, errors: check.errors });
  const signature = signaturePayload(def, answers);
  if (!signature) return reply(422, { status: "invalid", pageIndex: pages.length - 1, errors: {} });
  const meetings = meetingList(pages, ctx);
  const record = { ...labelled, [PACKAGE_KEY]: buildPackage(def, pages, ctx, meetings) };
  const result = fromOcs(await ocsApply("/v1/apply/submit", { code, answers: record, signature, meetings, client }, deps.config, deps.fetchImpl),
    (b) => ({ reference: typeof b.reference === "string" ? b.reference : null, submittedAt: typeof b.submittedAt === "string" ? b.submittedAt : null, meetings: typeof b.meetings === "number" ? b.meetings : 0 }));
  if (result.status === 200 && deps.notify && typeof result.body.reference === "string") {
    try {
      // The address comes from the invitation held by OCS, never from the browser.
      const opened = await ocsApply("/v1/apply/open", { code, quiet: true, client }, deps.config, deps.fetchImpl);
      const prefill = opened?.body && plain(opened.body.prefill) ? opened.body.prefill : {};
      await confirmSubmit({ def, pages, ctx, reference: result.body.reference, email: String(prefill.email ?? "") }, deps.notify);
    } catch (err) { console.error("[apply] confirmation email failed", err instanceof Error ? err.message : "error"); }
  }
  return result;
}

/** What the page needs after OCS opened a link: the saved answers read back into the form, and the invitation details. */
export function restore(formId: string, catalogue: Catalogue, saved: unknown): { answers: Answers; flags: Flags } {
  const def = formById(formId);
  if (!def) return { answers: {}, flags: {} };
  return restoreFor(def, catalogue, saved);
}
/** The same, for a form that was built for this link (a Business setup). */
export function restoreFor(def: FormDefinition, catalogue: Catalogue, saved: unknown): { answers: Answers; flags: Flags } {
  return fromLabelled(def, catalogue, plain(saved) ? saved : null);
}
