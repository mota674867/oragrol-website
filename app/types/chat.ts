// ORAGROL Live Chat — Type Definitions

export type MessageRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  imageUrl?: string; // visitor-uploaded image (thumbnail URL)
}

export interface ChatSession {
  sessionId: string;
  visitorName: string;
  visitorEmail: string;
  visitorCompany?: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
  escalated: boolean;
  escalationReason?: string;
  urgent: boolean;
  closed: boolean;
}

export interface ChatIntakeData {
  name: string;
  email: string;
  company?: string;
  consentGiven: boolean;
}

export interface ChatApiRequest {
  sessionId: string;
  message: string;
  imageKey?: string; // Vercel Blob key if image was uploaded
  history: Array<{ role: MessageRole; content: string }>;
  visitorName: string;
  visitorEmail: string;
  visitorCompany?: string;
}

export interface ChatApiResponse {
  reply: string;
  escalate: boolean;
  escalationReason?: string;
  urgent: boolean;
  hardStop: boolean;
  sessionId: string;
}
