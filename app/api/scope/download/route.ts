import { NextRequest, NextResponse } from "next/server";
import { resolveDownloadToken, getAction, getPdf } from "../../../lib/scope-store";

/**
 * GET /api/scope/download?token=... — per Section A: "require the
 * opaque per-submission capability/session, expire access... An action
 * UUID by itself must not grant access to client details." The token is
 * a separate, TTL'd, unguessable value (createDownloadToken in
 * scope-store.ts, a fresh UUID never derived from or equal to the
 * actionId) — knowing an actionId (which appears in the JSON response
 * from POST /api/scope) does NOT grant access on its own.
 *
 * private/no-store on every response path, including errors, so
 * nothing here is cacheable by a shared proxy.
 */

const NO_STORE_HEADERS = { "Cache-Control": "private, no-store" };

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Missing token." }, { status: 400, headers: NO_STORE_HEADERS });
  }

  const actionId = await resolveDownloadToken(token);
  if (!actionId) {
    // Expired or never-existed token: same response either way, so a
    // caller can't distinguish "expired" from "never valid" and use
    // that to probe for real tokens.
    return NextResponse.json({ error: "This download link has expired or is invalid." }, { status: 404, headers: NO_STORE_HEADERS });
  }

  const action = await getAction(actionId);
  if (!action) {
    return NextResponse.json({ error: "Not found." }, { status: 404, headers: NO_STORE_HEADERS });
  }

  const pdf = await getPdf(actionId);
  if (!pdf) {
    // A real, valid, non-expired status — the PDF job just hasn't
    // completed yet (or hit manual_attention) — distinct from "not
    // found," so the client can show "still preparing" rather than an
    // error.
    return NextResponse.json({ status: "pending" }, { status: 202, headers: NO_STORE_HEADERS });
  }

  return new NextResponse(new Uint8Array(pdf), {
    status: 200,
    headers: {
      ...NO_STORE_HEADERS,
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="ORAGROL_My_Scope_${action.reference}.pdf"`,
    },
  });
}
