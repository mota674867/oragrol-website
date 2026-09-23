'use client';

// ORAGROL Live Chat Widget
// Place at: app/components/chat/ChatWidget.tsx
// Import and render in app/layout.tsx (after </main>, before </body>)
//
// Dependencies: none beyond React and Next.js
// Env: NEXT_PUBLIC_CHAT_ENABLED=true to activate

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
} from 'react';
import { generateSessionId } from '../../lib/chat-utils';
import type { ChatMessage, ChatIntakeData } from '../../types/chat';

// ─── Constants ──────────────────────────────────────────────────────────────
const ESCALATION_FALLBACK_DELAY_MS = 3.5 * 60 * 1000; // 3.5 minutes
const INACTIVITY_TIMEOUT_MS = 10 * 60 * 1000;          // 10 minutes → fire close
const GREETING_DELAY_MS = 15 * 1000;                    // 15 seconds → show bubble
const MAX_FILE_SIZE = 5 * 1024 * 1024;                  // 5MB

// ─── Types ───────────────────────────────────────────────────────────────────
type WidgetState = 'hidden' | 'bubble' | 'intake' | 'chat' | 'closed';

// ─── Styles (inline — no external CSS dependency) ────────────────────────────
const S = {
  // Launcher
  launcher: {
    position: 'fixed' as const,
    bottom: '24px',
    right: '24px',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-end',
    gap: '8px',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  bubble: {
    background: '#141414',
    border: '1px solid #262626',
    borderRadius: '12px',
    padding: '12px 16px',
    maxWidth: '240px',
    fontSize: '13px',
    color: '#e0e0e0',
    lineHeight: '1.5',
    position: 'relative' as const,
    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
  },
  bubbleClose: {
    position: 'absolute' as const,
    top: '6px',
    right: '8px',
    background: 'none',
    border: 'none',
    color: '#666',
    cursor: 'pointer',
    fontSize: '14px',
    lineHeight: '1',
    padding: '2px 4px',
  },
  launchBtn: {
    width: '52px',
    height: '52px',
    borderRadius: '50%',
    background: '#018ABE',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 16px rgba(1,138,190,0.4)',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
    color: '#fff',
  },
  // Chat window
  window: {
    position: 'fixed' as const,
    bottom: '88px',
    right: '24px',
    width: '360px',
    maxHeight: '560px',
    background: '#0A0A0A',
    border: '1px solid #262626',
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
    zIndex: 9999,
    boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  header: {
    background: '#141414',
    borderBottom: '1px solid #262626',
    padding: '14px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
    letterSpacing: '-0.2px',
    margin: 0,
  },
  headerSub: {
    color: '#666',
    fontSize: '11px',
    margin: '2px 0 0',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#666',
    cursor: 'pointer',
    fontSize: '18px',
    lineHeight: '1',
    padding: '2px 4px',
  },
  messages: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: '16px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  msgUser: {
    alignSelf: 'flex-end' as const,
    background: '#018ABE',
    color: '#fff',
    borderRadius: '12px 12px 2px 12px',
    padding: '10px 14px',
    maxWidth: '80%',
    fontSize: '13px',
    lineHeight: '1.5',
  },
  msgAssistant: {
    alignSelf: 'flex-start' as const,
    background: '#141414',
    color: '#e0e0e0',
    border: '1px solid #262626',
    borderRadius: '2px 12px 12px 12px',
    padding: '10px 14px',
    maxWidth: '85%',
    fontSize: '13px',
    lineHeight: '1.5',
  },
  msgImage: {
    maxWidth: '200px',
    borderRadius: '8px',
    marginTop: '6px',
    display: 'block',
  },
  typing: {
    alignSelf: 'flex-start' as const,
    background: '#141414',
    border: '1px solid #262626',
    borderRadius: '2px 12px 12px 12px',
    padding: '10px 14px',
    fontSize: '13px',
    color: '#555',
    fontStyle: 'italic' as const,
  },
  inputArea: {
    borderTop: '1px solid #262626',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
    background: '#0A0A0A',
  },
  inputRow: {
    display: 'flex',
    gap: '8px',
    alignItems: 'flex-end',
  },
  textarea: {
    flex: 1,
    background: '#141414',
    border: '1px solid #262626',
    borderRadius: '8px',
    color: '#e0e0e0',
    fontSize: '13px',
    padding: '10px 12px',
    resize: 'none' as const,
    outline: 'none',
    fontFamily: 'inherit',
    lineHeight: '1.5',
    minHeight: '40px',
    maxHeight: '120px',
  },
  sendBtn: {
    background: '#018ABE',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    cursor: 'pointer',
    padding: '10px 14px',
    fontSize: '13px',
    fontWeight: '600',
    whiteSpace: 'nowrap' as const,
    alignSelf: 'flex-end' as const,
  },
  uploadBtn: {
    background: 'none',
    border: '1px solid #262626',
    borderRadius: '8px',
    color: '#555',
    cursor: 'pointer',
    padding: '10px 12px',
    fontSize: '16px',
    lineHeight: '1',
    alignSelf: 'flex-end' as const,
  },
  disclaimer: {
    fontSize: '11px',
    color: '#444',
    textAlign: 'center' as const,
    padding: '0 4px 4px',
    lineHeight: '1.4',
  },
  // Intake form
  intakeForm: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  intakeTitle: {
    color: '#e0e0e0',
    fontSize: '14px',
    fontWeight: '600',
    margin: '0 0 4px',
  },
  intakeSub: {
    color: '#555',
    fontSize: '12px',
    margin: '0 0 8px',
    lineHeight: '1.5',
  },
  intakeInput: {
    background: '#141414',
    border: '1px solid #262626',
    borderRadius: '8px',
    color: '#e0e0e0',
    fontSize: '13px',
    padding: '10px 12px',
    outline: 'none',
    fontFamily: 'inherit',
    width: '100%',
    boxSizing: 'border-box' as const,
  },
  consentLine: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    fontSize: '11px',
    color: '#555',
    lineHeight: '1.5',
    cursor: 'pointer',
  },
  startBtn: {
    background: '#018ABE',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    cursor: 'pointer',
    padding: '11px 16px',
    fontSize: '13px',
    fontWeight: '600',
    width: '100%',
    marginTop: '4px',
  },
  imagePreview: {
    background: '#141414',
    border: '1px dashed #333',
    borderRadius: '6px',
    padding: '8px 10px',
    fontSize: '12px',
    color: '#666',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
  },
  removeImg: {
    background: 'none',
    border: 'none',
    color: '#555',
    cursor: 'pointer',
    fontSize: '14px',
    padding: 0,
    lineHeight: '1',
  },
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ChatWidget() {
  const [widgetState, setWidgetState] = useState<WidgetState>('hidden');
  const [sessionId] = useState(() => generateSessionId());
  const [intake, setIntake] = useState<Partial<ChatIntakeData>>({});
  const [intakeError, setIntakeError] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [escalated, setEscalated] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [pendingImage, setPendingImage] = useState<{ file: File; preview: string } | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inactivityTimer = useRef<ReturnType<typeof setTimeout>>();
  const escalationFallbackTimer = useRef<ReturnType<typeof setTimeout>>();
  const greetingTimer = useRef<ReturnType<typeof setTimeout>>();

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Greeting bubble timer
  useEffect(() => {
    if (dismissed) return;
    greetingTimer.current = setTimeout(() => {
      setWidgetState(prev => (prev === 'hidden' ? 'bubble' : prev));
    }, GREETING_DELAY_MS);
    return () => clearTimeout(greetingTimer.current);
  }, [dismissed]);

  // Inactivity timer — fire chat-close after 10 min silence
  const resetInactivity = useCallback(() => {
    clearTimeout(inactivityTimer.current);
    if (widgetState !== 'chat') return;
    inactivityTimer.current = setTimeout(() => {
      fireClose();
    }, INACTIVITY_TIMEOUT_MS);
  }, [widgetState]);

  useEffect(() => {
    resetInactivity();
    return () => clearTimeout(inactivityTimer.current);
  }, [messages, widgetState, resetInactivity]);

  // Fire close (transcript email + HubSpot log)
  const fireClose = useCallback(async () => {
    if (!intake.email || messages.length === 0) return;
    try {
      await fetch('/api/chat-close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          visitorName: intake.name,
          visitorEmail: intake.email,
          visitorCompany: intake.company,
          messages: messages.map(m => ({
            role: m.role,
            content: m.content,
            timestamp: m.timestamp,
            imageUrl: m.imageUrl,
          })),
          escalated,
        }),
      });
    } catch (e) {
      console.error('[chat] close failed:', e);
    }
  }, [sessionId, intake, messages, escalated]);

  // Fire close on window unload
  useEffect(() => {
    const handler = () => {
      if (widgetState === 'chat' && messages.length > 0) {
        fireClose();
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [widgetState, messages, fireClose]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  function handleDismiss() {
    setDismissed(true);
    setWidgetState('hidden');
    clearTimeout(greetingTimer.current);
  }

  function handleOpen() {
    if (widgetState === 'hidden' || widgetState === 'bubble') {
      setWidgetState('intake');
    }
  }

  function handleCloseWindow() {
    if (widgetState === 'chat' && messages.length > 0) {
      fireClose();
    }
    setWidgetState('hidden');
  }

  function handleIntakeSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!intake.name?.trim()) { setIntakeError('Please enter your name.'); return; }
    if (!intake.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(intake.email)) {
      setIntakeError('Please enter a valid email address.');
      return;
    }
    if (!intake.consentGiven) {
      setIntakeError('Please accept the data collection notice to continue.');
      return;
    }
    setIntakeError('');
    setWidgetState('chat');
    // Add welcome message
    addAssistantMessage(
      `Hi ${intake.name?.split(' ')[0]}! I'm ORAGROL's AI assistant. I can help you explore our services, answer questions about pricing, or point you in the right direction. What's on your mind?`
    );
  }

  function addAssistantMessage(content: string, imageUrl?: string) {
    const msg: ChatMessage = {
      id: `msg_${Date.now()}_ai`,
      role: 'assistant',
      content,
      timestamp: Date.now(),
      imageUrl,
    };
    setMessages(prev => [...prev, msg]);
  }

  function addUserMessage(content: string, imageUrl?: string) {
    const msg: ChatMessage = {
      id: `msg_${Date.now()}_u`,
      role: 'user',
      content,
      timestamp: Date.now(),
      imageUrl,
    };
    setMessages(prev => [...prev, msg]);
    return msg;
  }

  async function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      alert('Only JPG, PNG, and WEBP images are accepted.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      alert('Image must be under 5MB.');
      return;
    }
    const preview = URL.createObjectURL(file);
    setPendingImage({ file, preview });
    e.target.value = '';
  }

  function handleRemoveImage() {
    if (pendingImage) URL.revokeObjectURL(pendingImage.preview);
    setPendingImage(null);
    setUploadedImageUrl(null);
  }

  async function uploadImage(file: File): Promise<string | null> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('sessionId', sessionId);
    try {
      const res = await fetch('/api/chat-upload', { method: 'POST', body: formData });
      if (!res.ok) return null;
      const data = await res.json();
      return data.url || null;
    } catch {
      return null;
    }
  }

  async function handleSend() {
    const text = input.trim();
    if (!text && !pendingImage) return;
    if (isTyping) return;

    let imageUrl: string | null = null;

    // Upload image if attached
    if (pendingImage) {
      imageUrl = await uploadImage(pendingImage.file);
      if (pendingImage) URL.revokeObjectURL(pendingImage.preview);
      setPendingImage(null);
      setUploadedImageUrl(imageUrl);
    }

    const displayText = text || (imageUrl ? '[Image attached]' : '');
    addUserMessage(displayText, imageUrl || undefined);
    setInput('');
    setIsTyping(true);
    resetInactivity();

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          message: displayText,
          imageKey: imageUrl || undefined,
          history,
          visitorName: intake.name,
          visitorEmail: intake.email,
          visitorCompany: intake.company,
        }),
      });

      const data = await res.json();
      setIsTyping(false);
      addAssistantMessage(data.reply);

      if (data.escalate && !escalated) {
        setEscalated(true);
        // Start fallback timer — if no human joins in 3.5 min, fire fallback message
        clearTimeout(escalationFallbackTimer.current);
        escalationFallbackTimer.current = setTimeout(async () => {
          const fbRes = await fetch('/api/chat-escalation-fallback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId,
              visitorName: intake.name,
              visitorEmail: intake.email,
            }),
          });
          const fbData = await fbRes.json();
          addAssistantMessage(fbData.message);
        }, ESCALATION_FALLBACK_DELAY_MS);
      }
    } catch {
      setIsTyping(false);
      addAssistantMessage(
        "I'm having trouble right now. Please email us directly at info@orgro.ca and we'll get back to you promptly."
      );
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // Auto-resize textarea
  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    const ta = e.target;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`;
  }

  // ── Render ────────────────────────────────────────────────────────────────

  if (widgetState === 'hidden') {
    return (
      <div style={S.launcher}>
        <button
          style={S.launchBtn}
          onClick={handleOpen}
          aria-label="Open ORAGROL chat"
          title="Chat with ORAGROL"
        >
          <ChatIcon />
        </button>
      </div>
    );
  }

  if (widgetState === 'bubble') {
    return (
      <div style={S.launcher}>
        <div style={S.bubble} role="dialog" aria-label="Chat invitation">
          <button style={S.bubbleClose} onClick={handleDismiss} aria-label="Dismiss">×</button>
          <p style={{ margin: 0, paddingRight: '16px' }}>
            Have a question? I can help with services, pricing, or finding the right fit for your business.
          </p>
          <button
            onClick={handleOpen}
            style={{
              background: 'none',
              border: 'none',
              color: '#018ABE',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600',
              padding: '8px 0 0',
              display: 'block',
            }}
          >
            Start chatting →
          </button>
        </div>
        <button
          style={S.launchBtn}
          onClick={handleOpen}
          aria-label="Open ORAGROL chat"
        >
          <ChatIcon />
        </button>
      </div>
    );
  }

  return (
    <div style={S.launcher}>
      <div style={S.window} role="dialog" aria-label="ORAGROL chat" aria-modal="false">
        {/* Header */}
        <div style={S.header}>
          <div>
            <p style={S.headerTitle}>ORAGROL</p>
            <p style={S.headerSub}>AI assistant · info@orgro.ca</p>
          </div>
          <button style={S.closeBtn} onClick={handleCloseWindow} aria-label="Close chat">×</button>
        </div>

        {/* Intake form */}
        {widgetState === 'intake' && (
          <form style={S.intakeForm} onSubmit={handleIntakeSubmit} noValidate>
            <p style={S.intakeTitle}>Before we start</p>
            <p style={S.intakeSub}>We'll send you a copy of this conversation when we're done.</p>

            <input
              style={S.intakeInput}
              type="text"
              placeholder="Your name *"
              value={intake.name || ''}
              onChange={e => setIntake(p => ({ ...p, name: e.target.value }))}
              autoComplete="name"
              required
            />
            <input
              style={S.intakeInput}
              type="email"
              placeholder="Email address *"
              value={intake.email || ''}
              onChange={e => setIntake(p => ({ ...p, email: e.target.value }))}
              autoComplete="email"
              required
            />
            <input
              style={S.intakeInput}
              type="text"
              placeholder="Company name (optional)"
              value={intake.company || ''}
              onChange={e => setIntake(p => ({ ...p, company: e.target.value }))}
              autoComplete="organization"
            />

            <label style={S.consentLine}>
              <input
                type="checkbox"
                checked={!!intake.consentGiven}
                onChange={e => setIntake(p => ({ ...p, consentGiven: e.target.checked }))}
                style={{ marginTop: '2px', flexShrink: 0 }}
              />
              <span>
                This chat is handled by AI and may be recorded. By continuing, you consent to data collection per our{' '}
                <a href="/privacy" style={{ color: '#018ABE' }} target="_blank" rel="noopener">Privacy Policy</a>.
              </span>
            </label>

            {intakeError && (
              <p style={{ color: '#e85d4a', fontSize: '12px', margin: 0 }}>{intakeError}</p>
            )}

            <button style={S.startBtn} type="submit">Start chat</button>
          </form>
        )}

        {/* Chat messages */}
        {widgetState === 'chat' && (
          <>
            <div style={S.messages} role="log" aria-live="polite" aria-label="Chat messages">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  style={msg.role === 'user' ? S.msgUser : S.msgAssistant}
                >
                  {msg.content}
                  {msg.imageUrl && (
                    <img
                      src={msg.imageUrl}
                      alt="Uploaded screenshot"
                      style={S.msgImage}
                    />
                  )}
                </div>
              ))}
              {isTyping && (
                <div style={S.typing} aria-label="ORAGROL is typing">
                  ORAGROL is typing…
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div style={S.inputArea}>
              {pendingImage && (
                <div style={S.imagePreview}>
                  <span>📎 {pendingImage.file.name}</span>
                  <button style={S.removeImg} onClick={handleRemoveImage} aria-label="Remove image">×</button>
                </div>
              )}
              <div style={S.inputRow}>
                <button
                  style={S.uploadBtn}
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Attach image"
                  title="Attach image (JPG, PNG, WEBP — max 5MB)"
                  type="button"
                >
                  📎
                </button>
                <textarea
                  ref={textareaRef}
                  style={S.textarea}
                  placeholder="Type a message…"
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  aria-label="Chat message input"
                  maxLength={2000}
                />
                <button
                  style={{
                    ...S.sendBtn,
                    opacity: (!input.trim() && !pendingImage) || isTyping ? 0.5 : 1,
                    cursor: (!input.trim() && !pendingImage) || isTyping ? 'not-allowed' : 'pointer',
                  }}
                  onClick={handleSend}
                  disabled={(!input.trim() && !pendingImage) || isTyping}
                  aria-label="Send message"
                >
                  Send
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  style={{ display: 'none' }}
                  onChange={handleImageSelect}
                  aria-label="Upload image"
                />
              </div>
              <p style={S.disclaimer}>
                AI assistant · May make mistakes · info@orgro.ca
              </p>
            </div>
          </>
        )}
      </div>

      {/* Launcher button (always visible when window is open) */}
      <button
        style={{ ...S.launchBtn, background: '#141414' }}
        onClick={handleCloseWindow}
        aria-label="Close chat"
      >
        <span style={{ fontSize: '20px', color: '#fff' }}>×</span>
      </button>
    </div>
  );
}

// ── Chat Icon SVG ─────────────────────────────────────────────────────────────
function ChatIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
