// GET /api/odo/admin/chat-usage?key=…&days=7 — the live chat's real daily usage
// (messages, tokens, spend vs the $5 cap). Admin only, same ODO_ADMIN_KEY gate
// as the other admin routes; fails closed if the env var is missing.

import { NextRequest, NextResponse } from "next/server";
import { getChatUsageDay } from "@/app/lib/odo-redis";
import { CHAT_DAILY_CAP_USD } from "@/app/lib/chat-spend";
import { adminKeyOk } from "@/app/lib/admin-auth";

export async function GET(req: NextRequest): Promise<NextResponse> {
  if (!(await adminKeyOk(req, "ODO_ADMIN_KEY"))) return NextResponse.json({ code: "unauthorized" }, { status: 401 });
  const days = Math.min(30, Math.max(1, Number(req.nextUrl.searchParams.get("days")) || 7));
  const out = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(Date.now() - i * 86_400_000);
    const day = d.toLocaleDateString("en-CA", { timeZone: "America/Toronto" });
    const { spendUsd, usage } = await getChatUsageDay(day).catch(() => ({ spendUsd: 0, usage: {} as Record<string, number> }));
    const messages = usage.messages ?? 0;
    out.push({ day, messages, spendUsd: Number(spendUsd.toFixed(4)), avgCostPerMessageUsd: messages ? Number((spendUsd / messages).toFixed(5)) : 0, ...usage });
  }
  return NextResponse.json({ dailyCapUsd: CHAT_DAILY_CAP_USD, days: out });
}
