// ORAGROL Live Chat — Utility Functions (self-contained)

export const HARD_STOP_TOPICS = [
  'contract terms', 'sla', 'service level agreement', 'liability',
  'indemnification', 'discount', 'promo', 'promotion', 'special offer',
  'legal advice', 'compliance certification', 'hipaa', 'e&o insurance',
  'errors and omissions', 'negotiate', 'custom price', 'lower price',
  'cheaper', 'insurance coverage',
];

export const URGENT_KEYWORDS = [
  'breach', 'hacked', 'hack', 'ransomware', 'compromised', 'urgent',
  'attack', 'locked out', "can't access", 'cannot access', 'being extorted',
  'extortion', 'data stolen', 'infected', 'malware', 'intrusion',
  'phishing attack', 'system down', 'unauthorized access', 'data leak',
  'cyberattack',
];

// CodeQL flagged Math.random() here as insecure randomness 2026-10-02: this
// id is sent to the chat API on every message and the upload endpoint
// (ChatWidget.tsx), so guessing another visitor's id would mean reading or
// adding to their conversation, including any name/email/image they gave
// it — Math.random() is not a CSPRNG and is guessable, especially combined
// with Date.now() narrowing the window. crypto.randomUUID() (same approach
// odo-redis.ts's generateSessionId already uses for scan sessions) is
// actually unpredictable.
export function generateSessionId(): string {
  return `chat_${Date.now()}_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
}

export function isUrgentMessage(message: string): boolean {
  const lower = message.toLowerCase();
  return URGENT_KEYWORDS.some(k => lower.includes(k));
}

export function isHardStopTopic(message: string): boolean {
  const lower = message.toLowerCase();
  return HARD_STOP_TOPICS.some(t => lower.includes(t));
}

export function isAskingForHuman(message: string): boolean {
  const lower = message.toLowerCase();
  return [
    'speak to a person', 'talk to a person', 'real person', 'human',
    'speak to someone', 'talk to someone', 'speak with someone',
    'agent', 'representative', 'team member', 'can i speak', 'can i talk',
    'connect me', 'transfer me',
  ].some(p => lower.includes(p));
}

export function isBusinessHours(): boolean {
  const now = new Date();
  const etOffset = -5;
  const utcHour = now.getUTCHours();
  const utcDay = now.getUTCDay();
  const etHour = (utcHour + etOffset + 24) % 24;
  return utcDay >= 1 && utcDay <= 5 && etHour >= 9 && etHour < 18;
}

export function formatWhatsAppMessage(params: {
  visitorName: string;
  visitorEmail: string;
  visitorCompany?: string;
  reason: string;
  urgent: boolean;
  lastMessage: string;
  imageUploaded: boolean;
}): string {
  const urgentTag = params.urgent ? '🚨 URGENT — ' : '';
  const imageTag = params.imageUploaded ? '\n📎 Visitor uploaded an image.' : '';
  return `${urgentTag}ORAGROL Chat Escalation\n\n👤 ${params.visitorName} (${params.visitorEmail})${params.visitorCompany ? `\n🏢 ${params.visitorCompany}` : ''}\n\n💬 Reason: ${params.reason}\n\nLast message: "${params.lastMessage.slice(0, 200)}"${imageTag}\n\n⏱ Reply within 3–4 min or fallback fires automatically.`;
}
