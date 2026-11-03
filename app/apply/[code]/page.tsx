import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { BrandLogo } from "../brand-logo";
import { rateLimitShared } from "../../lib/rate-limit-shared";
import { getCatalogue, withDetails } from "../../lib/apply/catalogue";
import { withPrefill } from "../../lib/apply/engine";
import { restore } from "../../lib/apply/handler";
import { formToken, LINK_CODE, ocsApply, ocsApplyConfig } from "../../lib/apply/ocs";
import { draftFormsAllowed, openableForm } from "../../lib/apply/registry";
import { ApplyForm } from "./apply-form";

export const dynamic = "force-dynamic";

function Notice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="ap-shell ap-center">
      <BrandLogo />
      <h1 className="ap-h1">{title}</h1>
      <p className="ap-muted">{children}</p>
    </main>
  );
}

/**
 * orgro.ca/apply/<code>: the private form for one person. The server asks OCS to open the link; an unknown, expired or switched-off
 * link is a plain "page not found". The browser then works with the form and saves through /api/apply (never directly to OCS).
 */
export default async function ApplyPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  if (!LINK_CODE.test(code)) notFound();
  const config = ocsApplyConfig();
  if (!config) {
    // Reason only, never a value: lets us tell a missing or invalid setting from an OCS failure in the server logs.
    console.error("apply open: not configured", { hasUrl: Boolean(process.env.OCS_APPLY_URL), secretLength: (process.env.OCS_APPLY_SECRET ?? "").length });
    return <Notice title="Temporarily unavailable">This form cannot be opened right now. Please try again later.</Notice>;
  }

  const h = await headers();
  const address = (h.get("x-forwarded-for") ?? "").split(",")[0]?.trim().slice(0, 64) || null;
  const agent = (h.get("user-agent") ?? "").slice(0, 300) || null;
  if (!(await rateLimitShared(`apply:open:${address ?? "unknown"}`, { limit: 60, windowMs: 10 * 60_000 })).ok) {
    return <Notice title="Please wait a few minutes">There have been too many attempts from your address. Try again shortly.</Notice>;
  }

  const opened = await ocsApply("/v1/apply/open", { code, client: { address, agent } }, config);
  if (!opened || opened.status >= 500 || opened.status === 401) {
    console.error("apply open: OCS did not accept the request", { reachable: opened !== null, status: opened?.status ?? null });
    return <Notice title="Temporarily unavailable">This form cannot be opened right now. Please try again later.</Notice>;
  }
  if (opened.status !== 200 || !opened.body || opened.body.status !== "ok") notFound();
  const o = opened.body;
  const reference = typeof o.reference === "string" ? o.reference : "";

  if (o.state === "submitted") {
    return <Notice title="Thank you, this form has been submitted">Reference {reference}. We will be in touch about the next step. If you need to change something, reply to the email we sent you.</Notice>;
  }
  const form = typeof o.formType === "string" && typeof o.product === "string" ? openableForm(o.formType, o.product, draftFormsAllowed()) : null;
  if (!form) return <Notice title="This form is not open yet">Your private link is valid, but the form is not ready. We will contact you when it is.</Notice>;

  const catalogue = getCatalogue();
  const p = (o.prefill ?? {}) as Record<string, unknown>;
  const invitation = { company: String(p.company ?? ""), person: String(p.person ?? ""), phone: String(p.phone ?? ""), email: String(p.email ?? "") };
  const saved = restore(form.id, catalogue, o.answers);
  const answers = withPrefill(form, catalogue, saved.answers, invitation);

  return (
    <ApplyForm
      code={code}
      token={formToken(config.secret, code, form.id)}
      form={form}
      catalogue={withDetails(catalogue, Array.isArray(answers.categories) ? (answers.categories as string[]) : [])}
      reference={reference}
      expiresAt={typeof o.expiresAt === "string" ? o.expiresAt : null}
      lastPage={typeof o.lastPage === "number" ? o.lastPage : 1}
      initialAnswers={answers}
      initialFlags={saved.flags}
    />
  );
}
