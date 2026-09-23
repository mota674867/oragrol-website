// ORAGROL Live Chat — Chat Close Route
// Place at: app/api/chat-close/route.ts
//
// Called when:
// - Visitor closes the chat window
// - 10 minutes of inactivity (fired from client-side timeout)
//
// Actions:
// - Sends transcript email to visitor
// - Logs final session record to HubSpot

import { NextRequest, NextResponse } from 'next/server';
import { sendTranscriptEmail } from '../chat/route';

interface CloseRequest {
  sessionId: string;
  visitorName: string;
  visitorEmail: string;
  visitorCompany?: string;
  messages: Array<{
    role: string;
    content: string;
    timestamp: number;
    imageUrl?: string;
  }>;
  escalated: boolean;
}

export async function POST(req: NextRequest) {
  try {
    const body: CloseRequest = await req.json();
    const { visitorName, visitorEmail, visitorCompany, messages, escalated } = body;

    if (!visitorEmail || !visitorName || !messages?.length) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    // 1. Send transcript email to visitor
    await sendTranscriptEmail({
      visitorName,
      visitorEmail,
      messages,
      escalated,
    }).catch(err => console.error('[chat-close] Transcript email failed:', err));

    // 2. Log to HubSpot (best-effort, same soft-fail pattern as cyber-health)
    if (process.env.HUBSPOT_ACCESS_TOKEN) {
      await logToHubSpot({
        visitorName,
        visitorEmail,
        visitorCompany,
        messages,
        escalated,
        sessionId: body.sessionId,
      }).catch(err => console.error('[chat-close] HubSpot log failed:', err));
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[chat-close] Error:', error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

async function logToHubSpot(params: {
  visitorName: string;
  visitorEmail: string;
  visitorCompany?: string;
  messages: Array<{ role: string; content: string; timestamp: number }>;
  escalated: boolean;
  sessionId: string;
}) {
  const token = process.env.HUBSPOT_ACCESS_TOKEN!;
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  // Find or create contact
  const searchRes = await fetch(
    `https://api.hubapi.com/crm/v3/objects/contacts/search`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({
        filterGroups: [
          {
            filters: [
              { propertyName: 'email', operator: 'EQ', value: params.visitorEmail },
            ],
          },
        ],
        properties: ['email', 'firstname', 'company'],
        limit: 1,
      }),
    }
  );

  const searchData = await searchRes.json();
  let contactId: string;

  if (searchData.results?.length > 0) {
    contactId = searchData.results[0].id;
  } else {
    // Create new contact
    const [firstName, ...lastParts] = params.visitorName.split(' ');
    const createRes = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        properties: {
          email: params.visitorEmail,
          firstname: firstName,
          lastname: lastParts.join(' ') || '',
          company: params.visitorCompany || '',
          lead_source: 'Live Chat',
        },
      }),
    });
    const createData = await createRes.json();
    contactId = createData.id;
  }

  if (!contactId) return;

  // Build transcript note
  const transcriptText = params.messages
    .map(m => {
      const sender = m.role === 'user' ? params.visitorName : 'ORAGROL AI';
      return `[${sender}]: ${m.content}`;
    })
    .join('\n\n');

  const noteBody = `Live Chat Session — ${new Date().toLocaleDateString('en-CA', { timeZone: 'America/Toronto' })}
Session ID: ${params.sessionId}
Escalated: ${params.escalated ? 'Yes' : 'No'}

TRANSCRIPT:
${transcriptText}`;

  // Create note on the contact
  await fetch('https://api.hubapi.com/crm/v3/objects/notes', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      properties: {
        hs_note_body: noteBody,
        hs_timestamp: Date.now(),
      },
      associations: [
        {
          to: { id: contactId },
          types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 202 }],
        },
      ],
    }),
  });

  // Update contact with escalation flag if applicable
  if (params.escalated) {
    await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        properties: {
          hs_lead_status: 'IN_PROGRESS',
          // Custom property — create in HubSpot if it doesn't exist yet
          chat_escalated: 'true',
        },
      }),
    });
  }
}
