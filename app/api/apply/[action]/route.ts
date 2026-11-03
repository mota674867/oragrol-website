import { NextResponse } from "next/server";
import { getClientIp } from "../../../lib/rate-limit";
import { rateLimitShared } from "../../../lib/rate-limit-shared";
import { getCatalogue } from "../../../lib/apply/catalogue";
import { handleApply } from "../../../lib/apply/handler";
import { ocsApplyConfig } from "../../../lib/apply/ocs";
import { draftFormsAllowed } from "../../../lib/apply/registry";

// Save and submit for the private application forms. The browser sends the link code in the body (never in a URL);
// this route checks it, limits the rate, and passes the answers to OCS through the signed door. See lib/apply/handler.ts.
export const dynamic = "force-dynamic";

const NO_STORE = { "cache-control": "private, no-store", "x-robots-tag": "noindex, nofollow, noarchive" };

export async function POST(request: Request, ctx: { params: Promise<{ action: string }> }) {
  const { action } = await ctx.params;
  if (action !== "save" && action !== "submit" && action !== "details") return NextResponse.json({ status: "failed" }, { status: 404, headers: NO_STORE });
  if (Number(request.headers.get("content-length") ?? 0) > 1_000_000) return NextResponse.json({ status: "failed", code: "TOO_LARGE" }, { status: 413, headers: NO_STORE });
  const raw = await request.text();
  const address = getClientIp(request);
  const result = await handleApply(action, raw, { address: address === "unknown" ? null : address.slice(0, 64), agent: (request.headers.get("user-agent") ?? "").slice(0, 300) || null }, {
    config: ocsApplyConfig(),
    catalogue: getCatalogue(),
    allowDraft: draftFormsAllowed(),
    limit: async (key, opts) => (await rateLimitShared(key, opts)).ok,
  });
  return NextResponse.json(result.body, { status: result.status, headers: NO_STORE });
}
