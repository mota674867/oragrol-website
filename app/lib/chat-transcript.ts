// ORAGROL live chat — transcript emails, shared by the manual close
// route and the automatic 15-minutes-of-silence close (chat-session.ts).

import { Resend } from 'resend';

export type Msg = { role: string; content: string; timestamp: number; imageUrl?: string };

export async function sendTeamCopy(params: {
  visitorName: string;
  visitorEmail: string;
  visitorCompany?: string;
  messages: Msg[];
  escalated: boolean;
  autoClosed?: boolean;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const fromEmail = process.env.CONTACT_FROM_EMAIL || 'ORAGROL <onboarding@resend.dev>';
  if (!apiKey || !to) return;
  const esc = (v: string) => v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const rows = params.messages.map((m) => {
    const who = m.role === 'user' ? esc(params.visitorName) : 'ORAGROL';
    const time = new Date(m.timestamp).toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Toronto' });
    return `<p style="margin:0 0 10px;"><strong>${who}</strong> <span style="color:#888;font-size:11px;">${time}</span><br/>${esc(m.content).replace(/\n/g, '<br/>')}</p>`;
  }).join('');
  const html = `<div style="font-family:-apple-system,sans-serif;max-width:640px;color:#111;">
    <p><strong>Live chat transcript</strong>${params.escalated ? ' — <span style="color:#c00;">escalated to the team</span>' : ''}${params.autoClosed ? ' <span style="color:#888;font-size:12px;">(closed automatically after 15 minutes of silence)</span>' : ''}</p>
    <p style="background:#f5f5f5;padding:10px 14px;border-radius:6px;font-size:13px;">
      <strong>Name:</strong> ${esc(params.visitorName)}<br/>
      <strong>Email:</strong> ${esc(params.visitorEmail)}<br/>
      <strong>Company:</strong> ${params.visitorCompany ? esc(params.visitorCompany) : '—'}
    </p>${rows}</div>`;
  await new Resend(apiKey).emails.send({
    from: fromEmail,
    to,
    replyTo: params.visitorEmail,
    subject: `[Chat transcript] ${params.visitorName}${params.visitorCompany ? ' — ' + params.visitorCompany : ''}`,
    html,
  });
}

export async function sendTranscriptEmail(params: {
  visitorName: string;
  visitorEmail: string;
  messages: Array<{ role: string; content: string; timestamp: number; imageUrl?: string }>;
  escalated: boolean;
  autoClosed?: boolean;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.CONTACT_FROM_EMAIL || 'ORAGROL <onboarding@resend.dev>';
  if (!apiKey) return;

  const resend = new Resend(apiKey);
  const firstName = (params.visitorName.trim().split(/\s+/)[0] || 'there').replace(/[<>&"]/g, '');
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
          ${msg.content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br/>')}${imageHtml}
        </div>
      </div>`;
  }).join('');

  const escalationNote = params.escalated
    ? `<div style="background:#fff8e1;border:1px solid #ffc107;border-radius:8px;padding:12px 16px;margin-bottom:20px;font-size:13px;">Our team has been flagged and will follow up with you at <a href="mailto:info@orgro.ca">info@orgro.ca</a>.</div>`
    : '';

  const html = `<!DOCTYPE html><html><body style="font-family:-apple-system,sans-serif;max-width:580px;margin:0 auto;padding:24px;color:#111;">
    <div style="margin-bottom:20px;"><strong style="font-size:18px;">ORAGROL</strong></div>
    <p style="font-size:14px;line-height:1.6;margin:0 0 6px;">Hello ${firstName},</p>
    <p style="font-size:14px;line-height:1.6;margin:0 0 6px;">Thank you for chatting with ORAGROL today. ${params.autoClosed ? "Your chat was quiet for a little while, so we closed it for you and are sending a copy below for your records." : "Here is a copy of your conversation for your records."}</p>
    <p style="font-size:14px;line-height:1.6;margin:0 0 16px;">If you have more questions, simply reply to this email or visit <a href="https://orgro.ca/contact" style="color:#018ABE;">orgro.ca/contact</a>. We would be glad to help.</p>
    <p style="font-size:12px;color:#888;margin-bottom:20px;">Your conversation &middot; ${sessionDate}</p>
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

/** Visitor copy (unless they opted out) + ORAGROL copy — once per chat. HubSpot keeps only the lead (name, email, company), never the conversation. */
export async function sendChatTranscripts(p: {
  sessionId: string;
  visitorName: string;
  visitorEmail: string;
  visitorCompany?: string;
  messages: Msg[];
  escalated: boolean;
  sendToVisitor: boolean;
  autoClosed: boolean;
}) {
  if (p.sendToVisitor) {
    await sendTranscriptEmail({ visitorName: p.visitorName, visitorEmail: p.visitorEmail, messages: p.messages, escalated: p.escalated, autoClosed: p.autoClosed })
      .catch((err) => console.error('[chat] Transcript email failed:', err));
  }
  await sendTeamCopy({ visitorName: p.visitorName, visitorEmail: p.visitorEmail, visitorCompany: p.visitorCompany, messages: p.messages, escalated: p.escalated, autoClosed: p.autoClosed })
    .catch((err) => console.error('[chat] Team copy failed:', err));
}
