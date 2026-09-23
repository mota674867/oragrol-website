// ORAGROL Live Chat — Escalation Fallback Route
// Place at: app/api/chat-escalation-fallback/route.ts
//
// Called from client after 3–4 minutes pass with no human join confirmation.
// Returns the fallback message to show the visitor.
// Also fires during after-hours for any escalation attempt.

import { NextRequest, NextResponse } from 'next/server';
import { isBusinessHours } from '@/lib/chat-utils';

interface FallbackRequest {
  sessionId: string;
  visitorName: string;
  visitorEmail: string;
  afterHours?: boolean;
}

export async function POST(req: NextRequest) {
  try {
    const body: FallbackRequest = await req.json();
    const { sessionId, visitorName } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
    }

    const afterHours = body.afterHours || !isBusinessHours();

    const fallbackMessage = afterHours
      ? `Our team isn't available right now, but your message is important. Send us a summary at info@orgro.ca — priority messages go straight to our team, not a queue. We'll follow up as soon as we're back.`
      : `I've flagged this for our team — we're currently with another client. For the fastest response, drop us a message at info@orgro.ca and we'll get back to you as a priority. You won't go into a queue — it goes straight to our team.`;

    return NextResponse.json({
      message: fallbackMessage,
      afterHours,
      sessionId,
    });
  } catch (error) {
    console.error('[chat-escalation-fallback] Error:', error);
    return NextResponse.json(
      {
        message:
          "We're unable to connect right now. Please email us at info@orgro.ca and we'll get back to you shortly.",
        afterHours: false,
        sessionId: '',
      },
      { status: 200 }
    );
  }
}
