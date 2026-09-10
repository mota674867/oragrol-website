import { NextRequest, NextResponse } from "next/server";
import { ensureCyberHealthPropertySchema } from "../../../lib/hubspot";

/**
 * GET /api/admin/cyber-health-bootstrap?secret=... — one-time setup
 * action, not part of the ongoing runtime flow. Runs
 * ensureCyberHealthPropertySchema(), which reads HubSpot's existing
 * property schema first and creates only what's missing (idempotent
 * — safe to call more than once, e.g. after adding a property to the
 * list later). Deliberately implemented via code (reusing the SAME
 * CYBER_HEALTH_PROPERTIES constant the runtime worker's
 * latestAssessmentProperties() call depends on) rather than asking a
 * human to hand-type 14 property internal names into HubSpot's UI —
 * a single typo there (e.g. oragrol_cha_cnt vs oragrol_cha_count)
 * would silently break the whole sync with no error until someone
 * went looking for it.
 *
 * Protected by ADMIN_ACTION_SECRET (a plain shared secret set once in
 * Vercel env vars, not tied to any user account) since this mutates
 * HubSpot schema. Low blast radius even if the secret leaked — the
 * only action possible is idempotently ensuring this specific known
 * property list exists — but still gated, not open to anyone who
 * finds the URL.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.ADMIN_ACTION_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "ADMIN_ACTION_SECRET is not configured." }, { status: 500 });
  }
  const provided = req.nextUrl.searchParams.get("secret");
  if (provided !== secret) {
    return NextResponse.json({ error: "Invalid or missing secret." }, { status: 401 });
  }

  try {
    const result = await ensureCyberHealthPropertySchema();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
