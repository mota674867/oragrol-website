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
  reference?: string;
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

  const ref = (params.reference || '').replace(/[^A-Za-z0-9]/g, '').slice(-8).toUpperCase();
  const intro = params.autoClosed
    ? "Protecting your business starts with a clear, careful conversation, and we treat yours with the same care. After 15 minutes of inactivity we closed your session securely to keep your information safe. A complete copy of what was discussed is below for your records."
    : "Protecting your business starts with a clear, careful conversation, and we treat yours with the same care. Your session has been closed securely, and a complete copy of what was discussed is below for your records.";

  const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f2f0eb;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f2f0eb;padding:24px 12px;"><tr><td align="center">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:6px;overflow:hidden;font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;color:#111;">
    <tr><td style="background:#0A0A0A;padding:26px 32px;">
      <div style="font-size:20px;font-weight:700;letter-spacing:.32em;color:#ffffff;">ORAGROL</div>
      <div style="font-size:11px;letter-spacing:.2em;color:#ef4d00;margin-top:8px;">SECURE CONVERSATION RECORD</div>
    </td></tr>
    <tr><td style="height:3px;background:#ef4d00;font-size:0;line-height:0;">&nbsp;</td></tr>
    <tr><td style="padding:32px 32px 8px;">
      <p style="font-size:16px;line-height:1.6;margin:0 0 14px;">Hello ${firstName},</p>
      <p style="font-size:15px;line-height:1.7;margin:0 0 14px;color:#222;">Thank you for speaking with ORAGROL. ${intro}</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:18px 0 6px;border:1px solid #e6e3dc;border-radius:6px;background:#faf9f6;"><tr><td style="padding:14px 18px;font-size:12px;line-height:1.8;color:#444;">
        <strong style="color:#111;letter-spacing:.08em;">SESSION CLOSED SECURELY</strong><br/>
        ${sessionDate}${ref ? `<br/>Reference: <span style="font-family:Consolas,Menlo,monospace;">${ref}</span>` : ''}<br/>
        Kept securely for 30 days, then permanently deleted.
      </td></tr></table>
    </td></tr>
    <tr><td style="padding:18px 32px 6px;">
      <div style="font-size:11px;letter-spacing:.18em;color:#888;margin-bottom:14px;">YOUR CONVERSATION</div>
      ${transcriptHtml}
    </td></tr>
    <tr><td style="padding:10px 32px 32px;">
      <p style="font-size:15px;line-height:1.7;margin:0 0 16px;color:#222;">When you are ready for the next step, our team is here to help you protect and run your business with confidence.</p>
      <a href="https://orgro.ca/contact" style="display:inline-block;background:#ef4d00;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 26px;border-radius:4px;">Speak with our team</a>
      <p style="font-size:13px;line-height:1.7;margin:18px 0 0;color:#444;">Not sure where to start? Our free business scan gives you a clear, personalised picture in minutes: <a href="https://orgro.ca/scan" style="color:#018ABE;">orgro.ca/scan</a></p>
    </td></tr>
    <tr><td style="background:#faf9f6;border-top:1px solid #e6e3dc;padding:20px 32px;">
      <p style="font-size:11px;line-height:1.7;color:#888;margin:0;">This conversation was handled by ORAGROL's AI assistant. Information provided is general guidance only and may contain errors; please speak with our team for advice specific to your business.<br/><br/>ORAGROL Global Inc. &middot; Cybersecurity &middot; Business Automation &middot; OR ONE &middot; orgro.ca</p>
    </td></tr>
  </table>
  </td></tr></table></body></html>`;

  await resend.emails.send({
    from: fromEmail,
    to: params.visitorEmail,
    subject: `Your ORAGROL conversation — a secure copy for your records`,
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
    await sendTranscriptEmail({ visitorName: p.visitorName, visitorEmail: p.visitorEmail, messages: p.messages, escalated: p.escalated, autoClosed: p.autoClosed, reference: p.sessionId })
      .catch((err) => console.error('[chat] Transcript email failed:', err));
  }
  await sendTeamCopy({ visitorName: p.visitorName, visitorEmail: p.visitorEmail, visitorCompany: p.visitorCompany, messages: p.messages, escalated: p.escalated, autoClosed: p.autoClosed })
    .catch((err) => console.error('[chat] Team copy failed:', err));
}
