// ORAGROL Live Chat — Utility Functions

import { HARD_STOP_TOPICS, URGENT_KEYWORDS } from './chat-knowledge';

/**
 * Generate a unique session ID
 */
export function generateSessionId(): string {
  return `chat_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Check if message contains urgent/incident keywords
 */
export function isUrgentMessage(message: string): boolean {
  const lower = message.toLowerCase();
  return URGENT_KEYWORDS.some(keyword => lower.includes(keyword));
}

/**
 * Check if message touches a hard-stop topic (legal, contracts, discounts)
 */
export function isHardStopTopic(message: string): boolean {
  const lower = message.toLowerCase();
  return HARD_STOP_TOPICS.some(topic => lower.includes(topic));
}

/**
 * Check if visitor is explicitly asking for a human
 */
export function isAskingForHuman(message: string): boolean {
  const lower = message.toLowerCase();
  const humanPhrases = [
    'speak to a person',
    'talk to a person',
    'real person',
    'human',
    'speak to someone',
    'talk to someone',
    'speak with someone',
    'agent',
    'representative',
    'team member',
    'can i speak',
    'can i talk',
    'connect me',
    'transfer me',
  ];
  return humanPhrases.some(phrase => lower.includes(phrase));
}

/**
 * Check if it is currently business hours (Mon–Fri 9am–6pm ET)
 */
export function isBusinessHours(): boolean {
  const now = new Date();
  // Convert to Eastern Time
  const etOffset = -5; // EST; adjust for EDT (-4) if needed
  const utcHour = now.getUTCHours();
  const utcDay = now.getUTCDay(); // 0 = Sunday, 6 = Saturday

  const etHour = (utcHour + etOffset + 24) % 24;

  const isWeekday = utcDay >= 1 && utcDay <= 5;
  const isDuringHours = etHour >= 9 && etHour < 18;

  return isWeekday && isDuringHours;
}

/**
 * Format the WhatsApp escalation message for Mohammad
 */
export function formatWhatsAppMessage(params: {
  visitorName: string;
  visitorEmail: string;
  visitorCompany?: string;
  reason: string;
  urgent: boolean;
  lastMessage: string;
  imageUploaded: boolean;
  chatUrl: string;
}): string {
  const urgentTag = params.urgent ? '🚨 URGENT — ' : '';
  const imageTag = params.imageUploaded ? '\n📎 Visitor uploaded an image.' : '';

  return `${urgentTag}ORAGROL Chat Escalation

👤 ${params.visitorName} (${params.visitorEmail})${params.visitorCompany ? `\n🏢 ${params.visitorCompany}` : ''}

💬 Reason: ${params.reason}

Last message: "${params.lastMessage.slice(0, 200)}${params.lastMessage.length > 200 ? '...' : ''}"${imageTag}

⏱ Reply within 3–4 min to join live, or the fallback fires automatically.`;
}

/**
 * Format the transcript email HTML body
 */
export function formatTranscriptEmail(params: {
  visitorName: string;
  messages: Array<{ role: string; content: string; timestamp: number; imageUrl?: string }>;
  escalated: boolean;
  sessionDate: string;
}): string {
  const messageHtml = params.messages
    .map(msg => {
      const sender = msg.role === 'user' ? params.visitorName : 'ORAGROL';
      const time = new Date(msg.timestamp).toLocaleTimeString('en-CA', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Toronto',
      });
      const imageHtml = msg.imageUrl
        ? `<br/><img src="${msg.imageUrl}" alt="Visitor uploaded image" style="max-width:400px;margin-top:8px;border-radius:4px;" />`
        : '';

      return `
        <div style="margin-bottom:16px;">
          <div style="font-size:12px;color:#888;margin-bottom:4px;">${sender} · ${time}</div>
          <div style="background:${msg.role === 'user' ? '#f5f5f5' : '#0A0A0A'};color:${msg.role === 'user' ? '#111' : '#fff'};padding:12px 16px;border-radius:8px;font-size:14px;line-height:1.5;">
            ${msg.content.replace(/\n/g, '<br/>')}${imageHtml}
          </div>
        </div>
      `;
    })
    .join('');

  const escalationNote = params.escalated
    ? `<div style="background:#fff8e1;border:1px solid #ffc107;border-radius:8px;padding:12px 16px;margin-bottom:24px;font-size:14px;color:#333;">
        Our team has been flagged and will follow up with you directly. You can also reach us anytime at <a href="mailto:info@orgro.ca" style="color:#018ABE;">info@orgro.ca</a>.
      </div>`
    : '';

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#111;">

  <div style="margin-bottom:24px;">
    <div style="font-size:20px;font-weight:700;color:#0A0A0A;letter-spacing:-0.3px;">ORAGROL</div>
    <div style="font-size:12px;color:#888;margin-top:2px;">GLOBAL</div>
  </div>

  <h2 style="font-size:18px;font-weight:600;color:#111;margin-bottom:4px;">Here's a summary of your chat with ORAGROL today.</h2>
  <p style="font-size:13px;color:#888;margin-bottom:24px;">${params.sessionDate} · Toronto, ON</p>

  ${escalationNote}

  <div style="margin-bottom:32px;">
    ${messageHtml}
  </div>

  <hr style="border:none;border-top:1px solid #e5e5e5;margin-bottom:24px;" />

  <div style="background:#f9f9f9;border-radius:8px;padding:16px;margin-bottom:24px;">
    <p style="font-size:13px;color:#555;margin:0;line-height:1.6;">
      Want to explore our full service catalog? <a href="https://orgro.ca/services" style="color:#018ABE;">View it here →</a>
    </p>
  </div>

  <div style="font-size:12px;color:#888;line-height:1.6;border-top:1px solid #e5e5e5;padding-top:16px;">
    <strong>Important:</strong> This conversation was handled by ORAGROL's AI assistant. Information provided is for general guidance only and may contain errors. For professional advice or to speak with our team directly, contact us at <a href="mailto:info@orgro.ca" style="color:#018ABE;">info@orgro.ca</a>.<br/><br/>
    © 2026 ORAGROL Global. Toronto, Ontario, Canada.
  </div>

</body>
</html>
  `.trim();
}
