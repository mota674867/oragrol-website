import { NextResponse } from "next/server";
import { newsletterSchema } from "../../lib/newsletter-schema";
import { getClientIp, rateLimit } from "../../lib/rate-limit";
import { syncNewsletterSubscriberToBrevo } from "../../lib/brevo";
import { syncNewsletterSubscriberToHubSpot } from "../../lib/hubspot";

/**
 * POST /api/newsletter — the footer Newsletter signup form's real
 * subscribe step (app/components/site/footer.tsx's `onSubscribe`,
 * previously unwired — see ORAGROL_Careers_Talent_Partnerships_
 * Newsletter_Build_Spec.md Part C/D, built 2026-09-19 once Mohammad
 * finished the HubSpot + Brevo account setup this depends on).
 *
 * JSON, not multipart — this form carries no file uploads, unlike
 * /api/opportunity.
 *
 * Dual-write, deliberately asymmetric:
 *   - Brevo (lib/brevo.ts) is the actual send platform for the monthly
 *     briefing — the thing this form promises to do. A Brevo failure is
 *     a real, reported failure: the person did not actually get
 *     subscribed, so this route must not claim success.
 *   - HubSpot (lib/hubspot.ts) is CRM visibility only (so the contact
 *     shows up tagged in the "Newsletter Subscribers" segment there
 *     too). Best-effort, same pattern as every other HubSpot sync in
 *     this codebase (Cyber Health, chat escalation, Scope) — logged on
 *     failure, never blocks the response.
 *
 * Required env var: `BREVO_API_KEY`. Optional: `HUBSPOT_ACCESS_TOKEN`
 * (without it, CRM sync is skipped and logged, same as elsewhere).
 */

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limited = rateLimit(`newsletter:${ip}`, { limit: 5, windowMs: 10 * 60 * 1000 });
  if (!limited.ok) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((limited.resetAt - Date.now()) / 1000)) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const parsed = newsletterSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Check the form and try again." },
      { status: 400 },
    );
  }
  const { firstName, email } = parsed.data;

  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.error("[/api/newsletter] Missing required env var BREVO_API_KEY — cannot subscribe. See .env.local.example.");
    return NextResponse.json(
      { ok: false, error: "Newsletter signup isn't configured yet. Please try again shortly." },
      { status: 500 },
    );
  }

  const brevoResult = await syncNewsletterSubscriberToBrevo({ email, firstName });
  if (!brevoResult.ok) {
    console.error("[/api/newsletter] Brevo sync failed:", brevoResult.error);
    return NextResponse.json({ ok: false, error: "Could not complete your signup. Please try again." }, { status: 502 });
  }

  // Best-effort — a CRM hiccup never blocks a signup that already
  // succeeded in Brevo above.
  let hubspotSynced = false;
  try {
    const hubspotResult = await syncNewsletterSubscriberToHubSpot({ email, firstName });
    if (hubspotResult.state === "synced") {
      hubspotSynced = true;
    } else {
      console.error("[/api/newsletter] HubSpot sync failed (Brevo subscribe already succeeded):", hubspotResult.error);
    }
  } catch (err) {
    console.error("[/api/newsletter] Unexpected error during HubSpot sync (Brevo subscribe already succeeded):", err);
  }

  return NextResponse.json({ ok: true, hubspotSynced });
}
