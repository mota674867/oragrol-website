// /api/odo/admin/outbound-auth — the hidden "secret knock" check.
//
// The scan page's name box quietly asks this route whether what was typed is
// the admin passcode. The passcode is ODO_ADMIN_KEY itself (one secret, set
// once in Vercel) and is compared HERE, on the server — it is never shipped
// to the browser, so nobody can read it out of the page source.
//
// Answers only { ok: true|false }. Fails closed: with no ODO_ADMIN_KEY set,
// every guess is "no". Capped per IP per day so it can't be guessed at.

import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getClientIp } from "@/app/lib/rate-limit";
import { checkAdminAuthAttempts } from "@/app/lib/odo-redis";

const DAILY_ATTEMPTS_PER_IP = 20;

function sameSecret(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const key = process.env.ODO_ADMIN_KEY;
  let passcode = "";
  try {
    const body = (await req.json()) as { passcode?: unknown };
    passcode = typeof body.passcode === "string" ? body.passcode.slice(0, 200) : "";
  } catch {
    return NextResponse.json({ ok: false });
  }
  if (!key || !passcode) return NextResponse.json({ ok: false });

  const attempts = await checkAdminAuthAttempts(getClientIp(req), DAILY_ATTEMPTS_PER_IP).catch(() => ({ ok: false, count: 0 }));
  if (!attempts.ok) return NextResponse.json({ ok: false });

  return NextResponse.json({ ok: sameSecret(passcode, key) });
}
