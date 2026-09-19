import { NextResponse } from "next/server";
import { Resend } from "resend";
import { opportunitySchema, opportunityPageSchema, PAGE_LABEL, type OpportunityPage } from "../../lib/opportunity-schema";
import { getClientIp, rateLimit } from "../../lib/rate-limit";
import { SITE_DOMAIN } from "../../lib/site-config";

/**
 * POST /api/opportunity — one shared route for /careers, /talent and
 * /partnerships (mirrors `OragrolOpportunityPage`'s own one-component-
 * for-three-pages pattern instead of three near-identical routes).
 *
 * Per Mohammad's decision, 2026-09-19 (see the project's
 * ORAGROL_Careers_Talent_Partnerships_Newsletter_Build_Spec doc): these
 * three go straight to Mohammad's inbox via Resend, subject-tagged per
 * source — no CRM record, no HubSpot pipeline, no lead-routing logic.
 * (Newsletter is a separate, still-unbuilt route — HubSpot + Brevo, not
 * this one, since it's a recurring subscription, not a one-off enquiry.)
 *
 * Multipart, not JSON, because Careers submissions carry real PDF
 * attachments (CV/professional profile) that must reach the inbox as
 * real email attachments, not a link.
 *
 * Required env vars: same `RESEND_API_KEY` / `CONTACT_TO_EMAIL` (+
 * optional `CONTACT_FROM_EMAIL`) already used by `/api/contact` — no new
 * environment variables needed for this route.
 */

const FROM_EMAIL = process.env.CONTACT_FROM_EMAIL || "Oragrol Contact Form <onboarding@resend.dev>";

const MAX_FILES = 2;
const MAX_TOTAL_BYTES = 8 * 1024 * 1024;

// Friendly labels for the fields OragrolOpportunityPage is known to send
// today, in a fixed display order. Anything present in the submitted
// `fields` payload but NOT listed here still renders (title-cased from
// its raw key) — a new field added to that component later shows up in
// the email immediately rather than silently vanishing until this route
// is updated too.
const FIELD_ORDER = [
  "fullName", "email", "phoneCountryCode", "phone", "country", "city",
  "applyingAs", "organization", "specialty", "certifications", "role",
  "subject", "discipline", "proposedRegion", "marketExperience",
  "technology", "involvement", "description", "futureOpportunities",
] as const;

const FIELD_LABELS: Record<string, string> = {
  fullName: "Full name",
  email: "Email",
  phoneCountryCode: "Phone country code",
  phone: "Phone number",
  country: "Country",
  city: "City",
  applyingAs: "Applying as",
  organization: "Organization name",
  specialty: "Specialty",
  certifications: "Certifications / accreditation",
  role: "Role",
  subject: "Area of expertise / idea title",
  discipline: "Category / discipline",
  proposedRegion: "Proposed country / region",
  marketExperience: "Local market experience",
  technology: "Technology or opportunity of interest",
  involvement: "Preferred involvement",
  description: "Details",
  futureOpportunities: "Wants future-opportunity contact",
};

function titleCaseKey(key: string) {
  return key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (c) => c.toUpperCase());
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function row(label: string, value: string) {
  if (!value) return "";
  return `<p><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value).replace(/\n/g, "<br />")}</p>`;
}

const SUBJECT_VERB: Record<OpportunityPage, string> = {
  careers: "application",
  talent: "submission",
  partnerships: "enquiry",
};

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limited = rateLimit(`opportunity:${ip}`, { limit: 5, windowMs: 10 * 60 * 1000 });
  if (!limited.ok) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((limited.resetAt - Date.now()) / 1000)) } },
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const page = opportunityPageSchema.safeParse(form.get("page"));
  if (!page.success) {
    return NextResponse.json({ ok: false, error: "Invalid submission." }, { status: 400 });
  }

  let fields: Record<string, string>;
  try {
    const raw = JSON.parse(String(form.get("fields") || "{}"));
    fields = typeof raw === "object" && raw !== null ? raw : {};
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid submission." }, { status: 400 });
  }

  const parsed = opportunitySchema.safeParse({
    page: page.data,
    category: form.get("category"),
    fullName: fields.fullName,
    email: fields.email,
    country: fields.country,
    city: fields.city,
    phoneCountryCode: fields.phoneCountryCode,
    phone: fields.phone,
    description: fields.description,
  });
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Check the form and try again." },
      { status: 400 },
    );
  }
  const d = parsed.data;

  // Careers requires at least one CV/profile PDF — the client already
  // enforces this (op-upload `required` on that page), but a submission
  // is never trusted on client-side validation alone.
  const files = form.getAll("documents").filter((f): f is File => f instanceof File && f.size > 0);
  if (d.page === "careers" && files.length === 0) {
    return NextResponse.json({ ok: false, error: "Attach at least one CV or professional profile PDF." }, { status: 400 });
  }
  if (files.length > MAX_FILES) {
    return NextResponse.json({ ok: false, error: `Choose no more than ${MAX_FILES} PDFs.` }, { status: 400 });
  }
  const nonPdf = files.some((f) => !/\.pdf$/i.test(f.name) || (f.type && f.type !== "application/pdf"));
  if (nonPdf) {
    return NextResponse.json({ ok: false, error: "Only PDF files are accepted." }, { status: 400 });
  }
  const totalBytes = files.reduce((sum, f) => sum + f.size, 0);
  if (totalBytes > MAX_TOTAL_BYTES) {
    return NextResponse.json({ ok: false, error: "The combined file size must not exceed 8 MB." }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL;
  if (!apiKey || !toEmail) {
    console.error(
      `[/api/opportunity] Missing required env var(s): ${[
        !apiKey && "RESEND_API_KEY",
        !toEmail && "CONTACT_TO_EMAIL",
      ]
        .filter(Boolean)
        .join(", ")} — cannot send. See .env.local.example.`,
    );
    return NextResponse.json(
      { ok: false, error: `Submissions aren't configured yet. Please try again shortly or reach us via ${SITE_DOMAIN}.` },
      { status: 500 },
    );
  }

  const orderedKeys = [...FIELD_ORDER, ...Object.keys(fields).filter((k) => !FIELD_ORDER.includes(k as typeof FIELD_ORDER[number]))];
  const html = [
    row("Category", d.category),
    ...orderedKeys.map((key) => {
      const value = fields[key];
      if (!value) return "";
      // futureOpportunities/consent checkboxes arrive as the literal
      // string "on" when checked (native FormData behaviour) — render
      // as Yes rather than the raw value.
      const display = value === "on" ? "Yes" : value;
      return row(FIELD_LABELS[key] || titleCaseKey(key), display);
    }),
  ]
    .filter(Boolean)
    .join("\n");

  const resend = new Resend(apiKey);

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      replyTo: d.email,
      subject: `[${PAGE_LABEL[d.page]}] New ${SUBJECT_VERB[d.page]} — ${d.fullName}`,
      html: html.trim(),
      attachments: files.length
        ? await Promise.all(
            files.map(async (file) => ({
              filename: file.name,
              content: Buffer.from(await file.arrayBuffer()),
            })),
          )
        : undefined,
    });

    if (error) {
      console.error("[/api/opportunity] Resend returned an error:", error);
      return NextResponse.json({ ok: false, error: "Could not send your submission. Please try again." }, { status: 502 });
    }

    return NextResponse.json({ ok: true, id: data?.id ?? null });
  } catch (err) {
    console.error("[/api/opportunity] Unexpected error sending email:", err);
    return NextResponse.json({ ok: false, error: "Could not send your submission. Please try again." }, { status: 500 });
  }
}
