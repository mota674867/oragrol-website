// /api/odo/admin/outbound — Outbound mode (Master Reference §37.9)
//
// ADMIN ONLY, gated by ODO_ADMIN_KEY exactly like /api/odo/admin/cost
// (fails closed: if the env var isn't set, every request is refused).
//
//   POST ?key=…  body { company, website }
//     Starts a public-evidence-only research run for that company (1–2 min,
//     in the background). The dossier is emailed to the ORAGROL admin inbox
//     (the OCS hand-off) and stored, so it can be read back below.
//     Re-running the same website later reports what changed.
//
//   GET  ?key=…&website=example.com
//     Returns the stored dossiers for that website, newest first.
//
// Nothing here contacts the company. How and when this is used is
// Mohammad's decision; ODO only provides the ability.

import { after, NextRequest, NextResponse } from "next/server";
import { claimOutboundRun, runOutbound, getOutboundHistory, dossierAsText } from "@/app/lib/odo-outbound";
import { sendOdoOutboundDossierEmail } from "@/app/lib/odo-email";
import { checkWebsiteValidity } from "@/app/lib/odo-gate";

export const maxDuration = 300;

function authorized(req: NextRequest): boolean {
  const adminKey = process.env.ODO_ADMIN_KEY;
  return Boolean(adminKey) && req.nextUrl.searchParams.get("key") === adminKey;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!authorized(req)) return NextResponse.json({ code: "unauthorized" }, { status: 401 });
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ code: "invalid_json" }, { status: 400 }); }
  const company = String(body.company ?? "").trim().slice(0, 200);
  const website = String(body.website ?? "").trim().slice(0, 300);
  if (!company || !website) return NextResponse.json({ code: "validation_error", message: "company and website are required." }, { status: 400 });

  const valid = await checkWebsiteValidity(website).catch(() => null);
  if (!valid || !valid.valid) {
    return NextResponse.json({ code: "invalid_website", message: valid && !valid.valid ? valid.reason : "That website could not be checked." }, { status: 400 });
  }
  if (!(await claimOutboundRun(website))) {
    return NextResponse.json({ code: "busy", message: "A run for this website is already in progress." }, { status: 409 });
  }

  after(async () => {
    try {
      const dossier = await runOutbound(company, website);
      const hasChanges = Boolean(dossier.changes && (dossier.changes.newGaps.length || dossier.changes.resolvedGaps.length || dossier.changes.newStrengths.length || dossier.changes.lostStrengths.length));
      const r = await sendOdoOutboundDossierEmail({ company, domain: dossier.domain, hasChanges, text: dossierAsText(dossier) });
      if (r.state !== "sent") console.warn(`[ODO Outbound] Dossier email not sent (${r.state}).`);
    } catch (err) {
      console.error("[ODO Outbound] Run failed:", err);
    }
  });

  return NextResponse.json({ status: "started", message: "Research running — the dossier will arrive by email in 1–2 minutes and can be read back with GET." }, { status: 202 });
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  if (!authorized(req)) return NextResponse.json({ code: "unauthorized" }, { status: 401 });
  const website = req.nextUrl.searchParams.get("website") ?? "";
  if (!website) return NextResponse.json({ code: "validation_error", message: "website is required." }, { status: 400 });
  const history = await getOutboundHistory(website);
  return NextResponse.json({ runs: history.length, dossiers: history });
}
