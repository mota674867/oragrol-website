// ORAGROL Live Chat — Chat Close Route
// Place at: app/api/chat-close/route.ts
//
// Called when visitor closes the chat window or 10 min inactivity fires.
// Sends transcript email to visitor and logs to HubSpot.

import { NextRequest, NextResponse } from 'next/server';
import { sendTeamCopy, sendTranscriptEmail, type Msg } from '../../lib/chat-transcript';

interface CloseRequest {
  sessionId: string;
  visitorName: string;
  visitorEmail: string;
  visitorCompany?: string;
  // The widget sends { from, text } (older callers sent { role, content }) — both are accepted and normalized below.
  messages: Array<{
    role?: string;
    content?: string;
    from?: string;
    text?: string;
    timestamp?: number;
    imageUrl?: string;
  }>;
  escalated: boolean;
  /** false when the visitor unticked "email me a copy" — ORAGROL still gets its own copy. */
  sendToVisitor?: boolean;
}

function normalize(messages: CloseRequest['messages']): Msg[] {
  return messages
    .map((m) => ({
      role: m.role === 'user' || m.from === 'visitor' ? 'user' : 'assistant',
      content: String(m.content ?? m.text ?? ''),
      timestamp: typeof m.timestamp === 'number' ? m.timestamp : Date.now(),
      imageUrl: m.imageUrl,
    }))
    .filter((m) => m.content.trim().length > 0);
}

export async function POST(req: NextRequest) {
  try {
    const body: CloseRequest = await req.json();
    const { visitorName, visitorEmail, visitorCompany, escalated } = body;
    const messages = normalize(body.messages ?? []);

    if (!visitorEmail || !visitorName || !messages.length) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    // 1. Transcript to the visitor (exactly as chatted), unless they opted out of the copy.
    if (body.sendToVisitor !== false) {
      await sendTranscriptEmail({ visitorName, visitorEmail, messages, escalated }).catch(
        err => console.error('[chat-close] Transcript email failed:', err)
      );
    }

    // 1b. The same transcript to ORAGROL, with the visitor's details on top.
    await sendTeamCopy({ visitorName, visitorEmail, visitorCompany, messages, escalated }).catch(
      err => console.error('[chat-close] Team copy failed:', err)
    );


    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[chat-close] Error:', error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
