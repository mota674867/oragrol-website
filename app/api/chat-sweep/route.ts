// /api/chat-sweep — closes silent chats and emails their transcripts.
//
//   POST  from QStash, 15 minutes after a chat's last message. Signature-checked.
//         Body { sessionId, version } — a no-op if a newer message arrived since.
//   GET   from the once-daily Vercel cron (free-plan safety net): closes every
//         chat silent for 15+ minutes. If CRON_SECRET is set, it must match.
//
// Both are idempotent: a chat's transcript is sent exactly once.

import { NextRequest, NextResponse } from "next/server";
import { finalizeChatIfDue, sweepPendingChats, validSessionId } from "../../lib/chat-session";
import { verifyQstashSignature } from "../../lib/chat-qstash";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const ok = verifyQstashSignature(req.headers.get("upstash-signature"), raw, [process.env.QSTASH_CURRENT_SIGNING_KEY, process.env.QSTASH_NEXT_SIGNING_KEY]);
  if (!ok) return NextResponse.json({ ok: false }, { status: 401 });
  let body: { sessionId?: unknown; version?: unknown };
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (!validSessionId(body.sessionId) || typeof body.version !== "number") return NextResponse.json({ ok: false }, { status: 400 });
  const result = await finalizeChatIfDue(body.sessionId, { expectVersion: body.version }).catch((err) => {
    console.error("[chat-sweep] finalize failed:", err);
    return "skipped" as const;
  });
  return NextResponse.json({ ok: true, result });
}

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ ok: false }, { status: 401 });
  const result = await sweepPendingChats().catch((err) => {
    console.error("[chat-sweep] sweep failed:", err);
    return { checked: 0, sent: 0 };
  });
  return NextResponse.json({ ok: true, ...result });
}
