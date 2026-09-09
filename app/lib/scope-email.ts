import { Resend } from "resend";
import type { ScopeResolvedItem, ScopeArea } from "./hubspot";

/**
 * Email sending for My Scope, per My_Scope_Final_Ready_For_Claude.md
 * Section D and the exact templates in Section 8.
 *
 * Deliberately does NOT copy app/api/cyber-health/route.ts's
 * onboarding@resend.dev fallback sender — Section 8 explicitly forbids
 * that for this flow ("no onboarding@resend.dev production fallback").
 * Requires a real CONTACT_FROM_EMAIL; throws clearly if missing rather
 * than silently sending from an unverified test address.
 *
 * Uses Resend's real idempotencyKey option (scope-store.ts's
 * `scope/{actionId}/{role}` per Section D), not a home-grown dedup
 * scheme layered on top of a provider that already has one.
 */

const AREA_LABEL: Record<ScopeArea, string> = {
  Cybersecurity: "Cybersecurity",
  Automation: "Business Automation",
  "OR ONE": "OR ONE",
};
const AREA_ORDER: ScopeArea[] = ["Cybersecurity", "Automation", "OR ONE"];

function fromEmail(): string {
  const from = process.env.CONTACT_FROM_EMAIL;
  if (!from) {
    throw new Error(
      "CONTACT_FROM_EMAIL is not configured. Refusing to fall back to an unverified onboarding@resend.dev " +
        "sender for this flow — Section 8 explicitly forbids that production fallback.",
    );
  }
  return from;
}

function scopeRecipient(): string {
  // Section 9: "Prefer a scope-specific recipient constant/config to
  // avoid changing unrelated forms." Deliberately its own env var
  // rather than reusing CONTACT_TO_EMAIL (Cyber Health/Contact's own
  // setting) — changing that shared value's meaning wasn't reviewed for
  // those other flows' consequences, per the same section's warning.
  return process.env.SCOPE_TO_EMAIL || "info@orgro.ca";
}

function attachmentFilename(reference: string): string {
  return `ORAGROL_My_Scope_${reference}.pdf`;
}

function itemsPlainText(items: ScopeResolvedItem[]): string {
  const areasPresent = AREA_ORDER.filter((a) => items.some((i) => i.area === a));
  const lines: string[] = [];
  for (const area of areasPresent) {
    lines.push(AREA_LABEL[area]);
    for (const item of items.filter((i) => i.area === area)) {
      lines.push(`- ${item.code} | ${item.name}`);
    }
  }
  return lines.join("\n");
}

export type SendEmailResult =
  | { state: "sent"; providerId: string }
  | { state: "failed"; error: string };

async function send(params: {
  to: string;
  replyTo: string;
  subject: string;
  text: string;
  idempotencyKey: string;
  attachment: { filename: string; content: Buffer };
}): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { state: "failed", error: "RESEND_API_KEY is not configured." };
  }
  const resend = new Resend(apiKey);
  try {
    const { data, error } = await resend.emails.send(
      {
        from: fromEmail(),
        to: [params.to],
        replyTo: params.replyTo,
        subject: params.subject,
        text: params.text,
        attachments: [{ filename: params.attachment.filename, content: params.attachment.content }],
      },
      { idempotencyKey: params.idempotencyKey },
    );
    if (error) {
      return { state: "failed", error: `Resend error: ${error.message ?? JSON.stringify(error)}`.slice(0, 500) };
    }
    if (!data?.id) {
      return { state: "failed", error: "Resend returned no email id." };
    }
    return { state: "sent", providerId: data.id };
  } catch (err) {
    return { state: "failed", error: `Resend threw: ${err instanceof Error ? err.message : String(err)}`.slice(0, 500) };
  }
}

export async function sendScopeClientEmail(params: {
  intent: "pdf_download" | "review_requested";
  reference: string;
  clientEmail: string;
  clientName: string;
  pdf: Buffer;
  idempotencyKey: string;
}): Promise<SendEmailResult> {
  const subject =
    params.intent === "pdf_download"
      ? `Your ORAGROL My Scope PDF - ${params.reference}`
      : `Your ORAGROL scope review request - ${params.reference}`;
  const text =
    params.intent === "pdf_download"
      ? `Hello ${params.clientName},\n\nYour selected scope is attached for your records. Downloading a copy does not request a review. If you would like to discuss your selections, contact us at https://orgro.ca/contact.\n\nORAGROL`
      : `Hello ${params.clientName},\n\nWe have received your request for a private scope review. A copy of your selected scope is attached for your records. ORAGROL will contact you about your request.\n\nORAGROL`;

  return send({
    to: params.clientEmail,
    replyTo: "info@orgro.ca",
    subject,
    text,
    idempotencyKey: params.idempotencyKey,
    attachment: { filename: attachmentFilename(params.reference), content: params.pdf },
  });
}

export async function sendScopeInternalEmail(params: {
  intent: "pdf_download" | "review_requested";
  reference: string;
  client: { name: string; email: string; phone: string; company: string };
  items: ScopeResolvedItem[];
  sourcePath: string;
  context?: string;
  timeframe?: string;
  submittedAt: string;
  pdf: Buffer;
  idempotencyKey: string;
}): Promise<SendEmailResult> {
  const subject =
    params.intent === "pdf_download"
      ? `[PDF Download] ${params.client.company} - ${params.reference}`
      : `[Review Requested] ${params.client.company} - ${params.reference}`;
  const opening =
    params.intent === "pdf_download"
      ? "PDF download only. Low-priority follow-up; no review was requested."
      : "Private review requested. High priority - prompt personal follow-up.";

  const text = [
    opening,
    "",
    `Full name: ${params.client.name}`,
    `Email: ${params.client.email}`,
    `Phone: ${params.client.phone}`,
    `Company: ${params.client.company}`,
    "",
    "Selected items",
    itemsPlainText(params.items),
    "",
    `Source page: ${params.sourcePath}`,
    `Context: ${params.context?.trim() || "Not provided"}`,
    `Timeframe: ${params.timeframe?.trim() || "Not provided"}`,
    `Submitted at: ${params.submittedAt}`,
    `Reference: ${params.reference}`,
  ].join("\n");

  return send({
    to: scopeRecipient(),
    replyTo: params.client.email,
    subject,
    text,
    idempotencyKey: params.idempotencyKey,
    attachment: { filename: attachmentFilename(params.reference), content: params.pdf },
  });
}
