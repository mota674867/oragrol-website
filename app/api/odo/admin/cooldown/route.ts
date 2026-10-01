// GET /api/odo/admin/cooldown?key=YOUR_ODO_ADMIN_KEY&email=...&website=...
// GET /api/odo/admin/cooldown?key=YOUR_ODO_ADMIN_KEY&action=reset&email=...&website=...&authorizedBy=...&reason=...
//
// ODO's internal admin cooldown tool (Master Ref §26 — Admin Override &
// Cooldown Reset), added 2026-10-02 as part of the ODO brain rebuild's
// Phase 5. Everything is done by pasting a URL into a browser with
// ?key=<ODO_ADMIN_KEY> appended — same pattern as the existing
// /api/odo/admin/cost route — because there is no admin login system and
// Mohammad is the only person operating this today. GET (not POST) is used
// deliberately even for the reset action, to match that same
// paste-a-URL-in-a-browser workflow rather than requiring curl/Postman.
//
// Default action ("lookup") shows whether an email and/or domain is
// currently in cooldown and since when, plus the 20 most recent resets —
// so Mohammad can see reset history without a separate tool.
//
// action=reset clears the cooldown(s) for whichever of email/website were
// given, REQUIRES authorizedBy= and reason= (§26: "every reset is logged
// with an authorization note" — enforced here, not just documented),
// writes the audit record (odo-redis.ts's clearCooldowns already does
// this — it predates this route but was never wired to anything until
// now), and emails the client the exact approved "you're clear to rescan"
// message from §26 when there's an email on hand to send it to.
//
// Scope note: §26's fuller process also describes "view scan history
// (date, findings summary, report sent)" before resetting. That full view
// is NOT built here — ODO doesn't persist findings/report history anywhere
// queryable long-term (Redis sessions expire after 48h; the only durable
// record is HubSpot, which this route deliberately doesn't reach into, to
// avoid quietly turning an admin utility into a second HubSpot client).
// What this DOES show is the one thing ODO actually keeps long-term: when
// a cooldown was set, and the history of past resets. Checking the fuller
// findings history in HubSpot directly is a manual step Mohammad already
// has access to.

import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { checkCooldowns, clearCooldowns, listCooldownResetAudit } from "@/app/lib/odo-redis";
import { SITE_URL } from "@/app/lib/site-config";

function unauthorized(): NextResponse {
  return NextResponse.json({ code: "unauthorized" }, { status: 401 });
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const adminKey = process.env.ODO_ADMIN_KEY;
  const params = req.nextUrl.searchParams;
  const suppliedKey = params.get("key");
  if (!adminKey || suppliedKey !== adminKey) return unauthorized();

  const email = params.get("email")?.trim() || null;
  const website = params.get("website")?.trim() || null;
  const action = params.get("action") || "lookup";

  if (!email && !website) {
    return NextResponse.json(
      { code: "missing_target", error: "Provide ?email=... and/or ?website=... to look up or reset." },
      { status: 400 }
    );
  }

  if (action === "reset") {
    const authorizedBy = params.get("authorizedBy")?.trim();
    const reason = params.get("reason")?.trim();
    if (!authorizedBy || !reason) {
      return NextResponse.json(
        {
          code: "missing_authorization",
          error: "Reset requires both authorizedBy=... and reason=... — Master Ref §26 requires every reset to carry a logged authorization note.",
        },
        { status: 400 }
      );
    }

    await clearCooldowns(email, website, authorizedBy, reason);

    let emailSent = false;
    let emailError: string | undefined;
    if (email) {
      const apiKey = process.env.RESEND_API_KEY;
      const from = process.env.CONTACT_FROM_EMAIL;
      if (apiKey && from) {
        try {
          const resend = new Resend(apiKey);
          const { error } = await resend.emails.send({
            from,
            to: [email],
            replyTo: from,
            subject: "Your ORAGROL scan is available again",
            text: `Following your request, our team has reviewed your account and your business scan is now available again. You can start your new scan here: ${SITE_URL}/scan. If you have any questions, contact us at info@orgro.ca.`,
          });
          emailSent = !error;
          if (error) emailError = `Resend error: ${error.message ?? JSON.stringify(error)}`.slice(0, 500);
        } catch (err) {
          emailError = `Email send threw: ${err instanceof Error ? err.message : String(err)}`.slice(0, 500);
        }
      } else {
        emailError = "RESEND_API_KEY / CONTACT_FROM_EMAIL not configured — reset succeeded but no confirmation email was sent.";
      }
    }

    return NextResponse.json({
      success: true,
      reset: { email, website, authorizedBy, reason, resetAt: new Date().toISOString() },
      emailSent,
      ...(emailError ? { emailNote: emailError } : {}),
    });
  }

  const cooldown = await checkCooldowns(email, website);
  const recentResets = await listCooldownResetAudit(20).catch(() => []);

  return NextResponse.json({ cooldown, recentResets });
}
