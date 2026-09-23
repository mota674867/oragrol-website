// ORAGROL Live Chat — Chat Close Route
// Place at: app/api/chat-close/route.ts
//
// Called when visitor closes the chat window or 10 min inactivity fires.
// Sends transcript email to visitor and logs to HubSpot.

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

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
    await sendTranscriptEmail({ visitorName, visitorEmail, messages, escalated }).catch(
      err => console.error('[chat-close] Transcript email failed:', err)
    );

    // 2. Log to HubSpot (best-effort)
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

async function sendTranscriptEmail(params: {
  visitorName: string;
  visitorEmail: string;
  messages: Array<{ role: string; content: string; timestamp: number; imageUrl?: string }>;
  escalated: boolean;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.CONTACT_FROM_EMAIL || 'ORAGROL <onboarding@resend.dev>';
  if (!apiKey) return;

  const resend = new Resend(apiKey);
  const sessionDate = new Date().toLocaleDateString('en-CA', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    timeZone: 'America/Toronto',
  });

  const transcriptHtml = params.messages.map(msg => {
    const sender = msg.role === 'user' ? params.visitorName : 'ORAGROL';
    const time = new Date(msg.timestamp).toLocaleTimeString('en-CA', {
      hour: '2-digit', minute: '2-digit', timeZone: 'America/Toronto',
    });
    const imageHtml = msg.imageUrl
      ? `<br/><img src="${msg.imageUrl}" alt="Uploaded image" style="max-width:300px;margin-top:6px;border-radius:4px;" />`
      : '';
    return `
      <div style="margin-bottom:14px;">
        <div style="font-size:11px;color:#888;margin-bottom:3px;">${sender} · ${time}</div>
        <div style="background:${msg.role === 'user' ? '#f5f5f5' : '#0A0A0A'};color:${msg.role === 'user' ? '#111' : '#fff'};padding:10px 14px;border-radius:8px;font-size:13px;line-height:1.5;">
          ${msg.content.replace(/\n/g, '<br/>')}${imageHtml}
        </div>
      </div>`;
  }).join('');

  const escalationNote = params.escalated
    ? `<div style="background:#fff8e1;border:1px solid #ffc107;border-radius:8px;padding:12px 16px;margin-bottom:20px;font-size:13px;">Our team has been flagged and will follow up with you at <a href="mailto:info@orgro.ca">info@orgro.ca</a>.</div>`
    : '';

  const html = `<!DOCTYPE html><html><body style="font-family:-apple-system,sans-serif;max-width:580px;margin:0 auto;padding:24px;color:#111;">
    <div style="margin-bottom:20px;"><strong style="font-size:18px;">ORAGROL</strong></div>
    <h2 style="font-size:16px;font-weight:600;margin-bottom:4px;">Here's a summary of your chat with ORAGROL today.</h2>
    <p style="font-size:12px;color:#888;margin-bottom:20px;">${sessionDate}</p>
    ${escalationNote}
    ${transcriptHtml}
    <hr style="border:none;border-top:1px solid #e5e5e5;margin:20px 0;" />
    <p style="font-size:12px;color:#888;line-height:1.6;">
      Want to explore our services? <a href="https://orgro.ca/services" style="color:#018ABE;">View here →</a><br/><br/>
      <strong>Note:</strong> This conversation was handled by ORAGROL's AI assistant. Information provided is for general guidance only and may contain errors. Contact us at <a href="mailto:info@orgro.ca">info@orgro.ca</a> for professional advice.
    </p>
  </body></html>`;

  await resend.emails.send({
    from: fromEmail,
    to: params.visitorEmail,
    subject: `Your chat with ORAGROL — ${sessionDate}`,
    html,
  });
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
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const searchRes = await fetch('https://api.hubapi.com/crm/v3/objects/contacts/search', {
    method: 'POST', headers,
    body: JSON.stringify({
      filterGroups: [{ filters: [{ propertyName: 'email', operator: 'EQ', value: params.visitorEmail }] }],
      properties: ['email'], limit: 1,
    }),
  });
  const searchData = await searchRes.json();
  let contactId: string;

  if (searchData.results?.length > 0) {
    contactId = searchData.results[0].id;
  } else {
    const [firstName, ...lastParts] = params.visitorName.split(' ');
    const createRes = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
      method: 'POST', headers,
      body: JSON.stringify({ properties: { email: params.visitorEmail, firstname: firstName, lastname: lastParts.join(' ') || '', company: params.visitorCompany || '', lead_source: 'Live Chat' } }),
    });
    const createData = await createRes.json();
    contactId = createData.id;
  }

  if (!contactId) return;

  const transcriptText = params.messages.map(m => `[${m.role === 'user' ? params.visitorName : 'ORAGROL AI'}]: ${m.content}`).join('\n\n');
  const noteBody = `Live Chat — ${new Date().toLocaleDateString('en-CA', { timeZone: 'America/Toronto' })}\nSession: ${params.sessionId}\nEscalated: ${params.escalated ? 'Yes' : 'No'}\n\n${transcriptText}`;

  await fetch('https://api.hubapi.com/crm/v3/objects/notes', {
    method: 'POST', headers,
    body: JSON.stringify({
      properties: { hs_note_body: noteBody, hs_timestamp: Date.now() },
      associations: [{ to: { id: contactId }, types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 202 }] }],
    }),
  });
}
