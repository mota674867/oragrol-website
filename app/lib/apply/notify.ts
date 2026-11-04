// Confirmation email after a submit. Never allowed to fail the submit: the caller ignores errors.
import type { FormDefinition } from "./types.ts";
import type { Ctx } from "./engine.ts";
import type { Page } from "./types.ts";
import { copySections } from "./copy-sections.ts";

export interface Mail { readonly to: string; readonly subject: string; readonly html: string; readonly attachments?: readonly { filename: string; content: Buffer }[] }
export interface SubmitInfo { readonly def: FormDefinition; readonly pages: readonly Page[]; readonly ctx: Ctx; readonly reference: string; readonly email: string }
export interface NotifyDeps { readonly send: (m: Mail) => Promise<void>; readonly render: (def: FormDefinition, sections: ReturnType<typeof copySections>, reference: string) => Promise<Buffer> }

const esc = (t: string) => t.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/;

export async function confirmSubmit(info: SubmitInfo, deps: NotifyDeps): Promise<void> {
  if (!EMAIL.test(info.email)) return;
  const wantsPdf = info.ctx.answers.pdf_copy === true;
  const attachments = wantsPdf
    ? [{ filename: `ORAGROL-${info.reference}.pdf`, content: await deps.render(info.def, copySections(info.pages, info.ctx), info.reference) }]
    : undefined;
  await deps.send({
    to: info.email,
    subject: `We received your ${info.def.name} (${info.reference})`,
    html: `<p>Thank you. We received your ${esc(info.def.name)}. Your reference is <strong>${esc(info.reference)}</strong>.</p>`
      + (wantsPdf ? "<p>Your PDF copy is attached.</p>" : "")
      + "<p>ORAGROL Global</p>",
    attachments,
  });
}
