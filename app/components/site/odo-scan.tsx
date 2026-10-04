"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import "./odo-scan.css";

/*
 * ORAGROL ODO /scan — complete React handoff for Claude
 *
 * Source of truth: ORAGROL_ODO_Complete_Master_Reference_v4_2026-09-25.md
 * Visual direction: approved ODO split-screen concept.
 *
 * Required stack assumptions:
 * - Next.js App Router / React client component.
 * - Space Grotesk for headings and Manrope for body, labels, and buttons.
 * - The server owns Redis, Postgres, n8n, Tavily, Jev, Claude, object storage,
 *   HubSpot, Resend, ZM77, rate limits, retention, and approval delivery.
 * - No provider secret, raw prompt, internal score, Jev output, or ZM77 data is
 *   ever sent to or stored in this browser component.
 *
 * Backend contract for Claude:
 * POST /api/odo/scan/start
 *   Request:
 *   {
 *     idempotency_key: string,
 *     locale: "en" | "fr",
 *     lead: { name, email, company, website: string | null },
 *     consent: { accepted: true, version: string, timestamp: ISOString }
 *   }
 *   Response 202:
 *   { session_id, status: "researching", status_url, events_url }
 *   Response 409: { code: "email_cooldown" | "domain_cooldown", next_available_at }
 *   Response 422: { code: "invalid_input", field_errors: Record<string,string> }
 *   Response 429: { code: "rate_limited", retry_after_seconds }
 *
 * GET /api/odo/scan/status?session_id=<opaque-id>
 *   Response:
 *   { status: "researching" | "questions" | "report_pending" |
 *     "inconclusive" | "failed", phase, step, question?, message?, retryable? }
 *   `question` contains only the next client-facing question. Never return
 *   internal findings, scores, prompts, provider responses, or recommendations.
 *
 * GET /api/odo/scan/events?session_id=<opaque-id>
 *   Optional SSE stream with the same status payloads. Polling remains the
 *   required fallback for browsers or deployments without SSE support.
 *
 * POST /api/odo/scan/answer
 *   Request: { session_id, idempotency_key, question_id, answer }
 *   Response 202: { status: "researching" | "questions" | "report_pending" |
 *                    "inconclusive", status_url, events_url }
 *   Enforce the 15-question hard ceiling server-side. Never trust a client
 *   question counter.
 *
 * POST /api/odo/scan/cancel
 *   Request: { session_id }
 *   Response 204. Do not delete the durable record immediately; apply the
 *   retention policy and Redis inactivity expiry on the server.
 *
 * Required server controls:
 * - Create a tenant-scoped lead/session identifier. Never use raw email as a
 *   Redis key. Store tenant_id on every Postgres row and enforce RLS.
 * - Capture consent_timestamp and consent_version before research starts.
 * - Store the dedicated idempotency record keyed by session_id + step_name +
 *   request_hash. Reject changed-input retries and audit the mismatch.
 * - Create/update HubSpot only through the server workflow.
 * - Completed scans activate the 7-day email and 30-day domain cooldowns.
 *   Abandoned scans never activate them.
 * - Every outcome goes to ZM77 and then Mohammad's approval gate. Nothing is
 *   delivered to the client directly from the browser.
 * - Use expiring links for approved PDFs. Never put report content in URLs.
 * - Jev is pilot-only until the written TypeSafe due-diligence gate is closed.
 * - Research scope includes website structure/speed/SSL/mobile/broken links,
 *   SEO, Google Business Profile, blog/social activity, staff and job signals,
 *   technology stack, SPF/DKIM/DMARC, domain data, breach history, competitors,
 *   industry adoption, registry/review sources, and Wayback history.
 * - Approved research tools are server-side only: Tavily, BuiltWith/Wappalyzer,
 *   Google PageSpeed, MXToolbox, SSL Labs, HaveIBeenPwned, SerpAPI/DataForSEO,
 *   Google Places, Hunter, and the bounded Jev decision layer.
 * - Research data must be minimised for third-party APIs and retained/deleted
 *   according to the master retention and legal-hold rules.
 */

export const ODO_ROUTES = Object.freeze({
  start: "/api/odo/scan/start",
  status: "/api/odo/scan/status",
  events: "/api/odo/scan/events",
  answer: "/api/odo/scan/answer",
  cancel: "/api/odo/scan/cancel",
});

export const ODO_COPY = Object.freeze({
  headline: "Let ODO figure out what your business needs",
  description:
    "ODO researches your business, identifies what matters, and turns the findings into clear priorities.",
  promise: "No sales call. No commitment.",
  preChatNote:
    "The scan takes about 5–10 minutes. ODO researches your business publicly first, then asks a few questions you answer in your own words. Your report arrives within 24 hours.",
  intro:
    "I'm ODO — OR Discovery & Opportunity Agent. I research your business publicly first, then ask only what research can't see.",
  consent:
    "By starting your scan, you consent to ORAGROL researching publicly available information about your business and storing your contact details per our Privacy Policy.",
  humanReview: "Reviewed by an ORAGROL specialist before delivery.",
  completedSubtext:
    "Our team is reviewing your findings. Your personalized report will be in your inbox within 24 hours.",
  inconclusiveSubtext:
    "With the public information available and the answers given, ODO can't produce a reliable analysis report.",
  unavailable:
    "ODO can't continue right now — please try again a little later. Nothing was lost on your side, and this attempt won't count against you.",
  // Master Reference §37.7 — the protection line, on every completed scan.
  protectionLine:
    "ODO's review is based on public information and your answers. It is not a penetration test or a compliance audit. An ORAGROL specialist reviews every report before delivery.",
});

export const ODO_BACKEND_CONTRACT = Object.freeze({
  maxQuestions: 15,
  emailCooldownDays: 7,
  domainCooldownDays: 30,
  redisAbandonedExpiryDays: 7,
  redisCompletedExpiryDays: 90,
  researchStalenessDays: 30,
  durableMinimumMonths: 6,
  contractedRetentionYears: 10,
  reportDeliverySlaHours: 24,
  consentVersion: "odo-v4-2026-09-25",
  approvalGate: "zm77_then_mohammad",
});

const RESEARCH_STEPS = [
  { key: "website", label: "Website analyzed" },
  { key: "technology", label: "Technology stack identified" },
  { key: "security", label: "Security posture checked" },
  { key: "search", label: "SEO position evaluated" },
  { key: "competitors", label: "Competitors identified" },
  { key: "profile", label: "Building your business intelligence profile…" },
  { key: "opportunity", label: "Generating your opportunity map…" },
];

const HOW_IT_WORKS = [
  {
    number: "01",
    title: "Research first",
    body: "We review your business and public presence.",
  },
  {
    number: "02",
    title: "A real conversation",
    body: "ODO asks what research can't see. You answer in your own words — and can ask ODO questions too.",
  },
  {
    number: "03",
    title: "Clear priorities, reviewed",
    body: "Your personalized report includes a SWOT analysis.",
  },
];

const INITIAL_FORM = Object.freeze({
  name: "",
  email: "",
  company: "",
  website: "",
});

// Resume within 24 hours (Master Reference §37.14 #2): the session id is kept
// in this browser, so a visitor who closes the tab can come back and carry on
// without paying for the research twice. Only this browser can resume — a
// session is never handed out by email address alone.
const SAVED_SESSION_KEY = "oragrol_odo_session";
const RESUME_WINDOW_MS = 24 * 60 * 60 * 1000;
function saveSession(id: string) {
  try { window.localStorage.setItem(SAVED_SESSION_KEY, JSON.stringify({ id, savedAt: Date.now() })); } catch { /* storage unavailable */ }
}
function loadSession(): string | null {
  try {
    const raw = window.localStorage.getItem(SAVED_SESSION_KEY) ?? null;
    if (raw) {
      const v = JSON.parse(raw) as { id?: string; savedAt?: number };
      if (v.id && v.savedAt && Date.now() - v.savedAt < RESUME_WINDOW_MS) return v.id;
      window.localStorage.removeItem(SAVED_SESSION_KEY);
    }
    return window.sessionStorage.getItem("oragrol_odo_session_id"); // older tabs
  } catch { return null; }
}
function forgetSession() {
  try { window.localStorage.removeItem(SAVED_SESSION_KEY); window.sessionStorage.removeItem("oragrol_odo_session_id"); } catch { /* storage unavailable */ }
}

function makeIdempotencyKey() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `odo-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function normalizeWebsite(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function validateForm(form: {name: string; email: string; company: string; website: string}): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!form.name.trim()) errors.name = "Enter your name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = "Enter a valid work email.";
  }
  if (!form.company.trim()) errors.company = "Enter your company name.";
  // CHANGED 2026-10-01 — website is now required to start a scan (approved
  // alongside the entry gate: ODO's research needs a real site to work
  // from, and a no-website visitor is routed to a consultation instead of
  // an automated scan — see the "No website?" button below).
  if (!form.website.trim()) {
    errors.website = "Enter your website address, or use the \"No website?\" link below.";
  } else if (!/^https?:\/\/[^\s]+$/i.test(normalizeWebsite(form.website) || "")) {
    errors.website = "Enter a valid website URL.";
  }
  return errors;
}

async function readJson(response: Response): Promise<Record<string, unknown>> {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

function formatError(payload: Record<string, unknown> | null, fallback: string): string {
  // FIXED 2026-10-01 — this used to replace the backend's actual cooldown
  // message (the exact, Mohammad-approved copy with the real "available
  // again on [date]" line) with a generic placeholder. Cooldown responses
  // are now routed to CooldownModal (see submitStart) before this function
  // is ever called, but the real message is kept here as a fallback too in
  // case a cooldown payload ever reaches this path some other way.
  // FIXED 2026-10-03 — "rate_limited" used to be flattened to "Please wait a
  // moment and try again", which is actively misleading for the daily
  // per-connection limit: waiting a moment never helps, it resets at
  // midnight. The server already sends the precise reason for both the
  // hourly and the daily limit, so show it.
  return (payload as Record<string,unknown>)?.message as string || fallback;
}

function CooldownModal({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="odo-scan__modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="odo-scan__modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="odo-cooldown-title"
        aria-describedby="odo-cooldown-message"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="odo-scan__section-kicker">ONE SCAN AT A TIME</p>
        <h2 id="odo-cooldown-title">You've already got a scan on file</h2>
        <p id="odo-cooldown-message">{message}</p>
        <button type="button" className="odo-scan__submit" onClick={onClose}>
          Got it <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  );
}

function Field({ id, label, value, onChange, onCommit, placeholder, type = "text", error }: { id: string; label: string; value: string; onChange: (v: string) => void; onCommit?: (v: string) => void; placeholder: string; type?: string; error?: string }) {
  return (
    <label className="odo-scan__field" htmlFor={id}>
      <span className="odo-scan__field-label">{label}</span>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={id === "name" ? "name" : id === "email" ? "email" : id === "company" ? "organization" : "url"}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onCommit ? (event) => onCommit(event.target.value) : undefined}
        onKeyDown={onCommit ? (event) => { if (event.key === "Enter") onCommit((event.target as HTMLInputElement).value); } : undefined}
      />
      {error ? <span id={`${id}-error`} className="odo-scan__field-error">{error}</span> : null}
    </label>
  );
}

function PhaseTrack({ phase }: { phase: string }) {
  const active = phase === "researching" ? 0 : phase === "questions" ? 1 : 2;
  return (
    <div className="odo-scan__phase-track" aria-label="Scan progress">
      {["Research", "Questions", "Summary"].map((label, index) => (
        <React.Fragment key={label}>
          <span className={index <= active ? "is-active" : ""}>{String(index + 1).padStart(2, "0")} {label}</span>
          {index < 2 ? <i aria-hidden="true" /> : null}
        </React.Fragment>
      ))}
    </div>
  );
}

// A visible, moving indicator while ODO works — added 2026-10-01 because the
// research screen previously only updated a static checklist on each poll
// (every 2.5s), with no continuously-animated element. A visitor glancing at
// an unchanging screen between polls had no visual confirmation anything was
// happening. This spins constantly regardless of poll timing; respects
// prefers-reduced-motion via the existing global rule at the bottom of
// odo-scan.css.
function LiveSpinner() {
  return <span className="odo-scan__spinner" aria-hidden="true" />;
}

function ResearchPreview({ phase, step }: { phase: string; step: string }) {
  const stepIndex = Math.max(0, RESEARCH_STEPS.findIndex((item) => item.key === step));
  const live = phase === "researching";
  return (
    <section className="odo-scan__preview" aria-live="polite" aria-label={live ? "ODO research progress" : "Example research preview"}>
      <div className="odo-scan__preview-heading">
        <h2>{live ? "ODO is researching" : "A look inside the scan"}</h2>
        <span className="odo-scan__live-badge">{live ? <><LiveSpinner /> LIVE</> : "EXAMPLE PREVIEW"}</span>
      </div>
      <div className="odo-scan__preview-track">
        <span className="odo-scan__or-mark" aria-hidden="true">OR</span>
        <PhaseTrack phase={live ? "researching" : "researching"} />
      </div>
      <ol className="odo-scan__research-list">
        {RESEARCH_STEPS.map((item, index) => {
          const complete = live && index < stepIndex;
          const current = live && index === stepIndex;
          return (
            <li key={item.key} className={current ? "is-current" : complete ? "is-complete" : ""}>
              <span className="odo-scan__research-icon" aria-hidden="true">{complete ? "✓" : current ? "◔" : "·"}</span>
              <span>{item.label}</span>
            </li>
          );
        })}
      </ol>
      <p className="odo-scan__preview-note">Your questions adapt to what we find.</p>
    </section>
  );
}

// FIXED 2026-09-29 — this used to be an inline default parameter
// (`onEvent = (_e) => {}`), which JS re-evaluates on every render since
// page.tsx never passes an onEvent prop. A fresh function identity every
// render meant `emit` -> `applyStatus` -> `pollStatus` -> `startUpdates`
// (each memoized on the previous one via useCallback) also got a new
// identity every render, which made the session-restore useEffect below
// (dependency: [startUpdates]) re-fire on every single render instead of
// once on mount. That effect unconditionally calls setPhase("researching")
// before restarting polling/SSE, so it was resetting the UI back to the
// research screen and tearing down/recreating the EventSource + polling
// interval on every render, in a tight loop — this is why the status
// vocabulary fix above never visibly took effect: the backend was already
// returning "questioning" correctly, but the phase was being stomped back
// to "researching" faster than a render could paint the question. Found by
// spotting ~800 requests to /api/odo/scan/status and /events fire within
// ~15 seconds of a single fresh scan submission (should have been ~6).
// A stable module-level no-op fixes it: same reference every render, so
// nothing downstream churns and the mount effect runs exactly once.
const NOOP_EVENT_HANDLER = (_e: Record<string, unknown>) => {};

// ─── Live interview chat (Master Reference §37.6) ───────────────────────────
//
// REBUILT 2026-10-03. The old one-question-at-a-time panel (multiple-choice
// buttons, checkboxes, a "writing your next question" placeholder) is gone.
// ODO and the visitor now talk in a single scrolling thread, WhatsApp-style:
// ODO on the left, the visitor on the right, every message staying visible.
// The visitor types answers in their own words, can press "Prefer not to
// answer" on anything, and can ask ODO questions along the way.
//
// The server is the single source of truth for the conversation. Every
// status payload carries `chat_version`, which only ever moves forward, so a
// late or out-of-order poll can never paint an older conversation over a
// newer one (the "answered question flashes back" bug class from the
// 2026-10-02 live test is structurally impossible here).

type ChatItem = { id: string; role: "odo" | "visitor"; kind: string; text: string; hint?: string };
type Progress = { questions_asked: number; max_questions: number; visitor_questions_left: number };

function ChatBubble({ item }: { item: ChatItem }) {
  if (item.role === "visitor") {
    return (
      <div className="odo-chat__row odo-chat__row--visitor">
        <div className={`odo-chat__bubble odo-chat__bubble--visitor${item.kind === "skip" ? " is-skip" : ""}`}>{item.text}</div>
      </div>
    );
  }
  return (
    <div className="odo-chat__row odo-chat__row--odo">
      <span className="odo-chat__avatar" aria-hidden="true">OR</span>
      <div className={`odo-chat__bubble odo-chat__bubble--odo${item.kind === "question" ? " is-question" : ""}`}>{item.text}</div>
    </div>
  );
}

function TypingBubble({ activity }: { activity: string | null }) {
  return (
    <div className="odo-chat__row odo-chat__row--odo" role="status" aria-label={activity || "ODO is typing"}>
      <span className="odo-chat__avatar" aria-hidden="true">OR</span>
      <div className="odo-chat__bubble odo-chat__bubble--odo odo-chat__bubble--typing">
        {/* A live check mid-interview (Master Reference §37.3) shows what ODO is
            actually doing, instead of an unexplained pause. */}
        {activity ? <span className="odo-chat__activity">{activity}</span> : null}
        <span className="odo-scan__typing-dots" aria-hidden="true"><span></span><span></span><span></span></span>
      </div>
    </div>
  );
}

export default function OdoScanPage({ locale = "en", onEvent = NOOP_EVENT_HANDLER }: { locale?: string; onEvent?: (e: Record<string, unknown>) => void }) {
  const [form, setForm] = useState<{name: string; email: string; company: string; website: string}>({...INITIAL_FORM});
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [consent, setConsent] = useState(false);
  const [phase, setPhase] = useState("idle");
  const [step, setStep] = useState("website");
  const [sessionId, setSessionId] = useState("");
  const [message, setMessage] = useState("");
  const [endKind, setEndKind] = useState<"complete" | "insufficient" | null>(null);
  const [cooldownModal, setCooldownModal] = useState<{ code: string; message: string } | null>(null);
  const [busy, setBusy] = useState(false);

  // Conversation state — always replaced wholesale from the server.
  const [chat, setChat] = useState<ChatItem[]>([]);
  const [awaiting, setAwaiting] = useState(false);
  const [activity, setActivity] = useState<string | null>(null);
  const [pending, setPending] = useState<{ id: string; hint: string | null } | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [draft, setDraft] = useState("");
  const [optimistic, setOptimistic] = useState<ChatItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const chatVersionRef = useRef(0);
  const submittingRef = useRef(false);
  const threadRef = useRef<HTMLDivElement | null>(null);
  const composerRef = useRef<HTMLTextAreaElement | null>(null);

  // ADDED 2026-10-01 — Cloudflare Turnstile captcha (entry-gate requirement,
  // odo-gate.ts verifyTurnstile on the backend). Rendered explicitly via
  // window.turnstile.render so the token can be captured into state and the
  // widget reset on a failed/expired check.
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileReady, setTurnstileReady] = useState(false);
  const turnstileContainerRef = useRef<HTMLDivElement | null>(null);
  const turnstileWidgetIdRef = useRef<string | null>(null);
  const pollRef = useRef<number | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const emit = useCallback((type: string, extra: Record<string, unknown> = {}) => onEvent({ type, ...extra }), [onEvent]);

  const stopUpdates = useCallback(() => {
    if (pollRef.current) window.clearInterval(pollRef.current as unknown as ReturnType<typeof setInterval>);
    pollRef.current = null;
    eventSourceRef.current?.close?.();
    eventSourceRef.current = null;
  }, []);

  useEffect(() => () => stopUpdates(), [stopUpdates]);

  useEffect(() => {
    if (!turnstileReady || phase !== "idle") return;
    const container = turnstileContainerRef.current;
    const turnstile = (window as unknown as { turnstile?: { render: (el: HTMLElement, opts: Record<string, unknown>) => string; reset: (id: string) => void; remove: (id: string) => void } }).turnstile;
    if (!container || !turnstile || turnstileWidgetIdRef.current) return;
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    if (!siteKey) {
      console.error("[ODO] NEXT_PUBLIC_TURNSTILE_SITE_KEY is not configured — captcha widget cannot render.");
      return;
    }
    turnstileWidgetIdRef.current = turnstile.render(container, {
      sitekey: siteKey,
      callback: (token: string) => setTurnstileToken(token),
      "expired-callback": () => setTurnstileToken(""),
      "error-callback": () => setTurnstileToken(""),
    });
    return () => {
      if (turnstileWidgetIdRef.current) {
        turnstile.remove(turnstileWidgetIdRef.current);
        turnstileWidgetIdRef.current = null;
      }
    };
  }, [turnstileReady, phase]);

  const applyStatus = useCallback((payload: Record<string, unknown>) => {
    const next = payload?.status as string | undefined;
    if (!next) return;

    // Conversation staleness guard — see the file-section header above.
    const version = payload.chat_version;
    if (typeof version === "number") {
      if (version < chatVersionRef.current) return; // a straggler from before the latest state — drop it entirely
      if (version > chatVersionRef.current) {
        chatVersionRef.current = version;
        if (Array.isArray(payload.chat)) setChat(payload.chat as ChatItem[]);
        setAwaiting(payload.awaiting === true);
        setPending((payload.pending as { id: string; hint: string | null } | null) ?? null);
        setProgress((payload.progress as Progress | undefined) ?? null);
        setOptimistic(null); // the server now holds the visitor's message
      }
      // `activity` changes WITHOUT a version bump while ODO runs a live
      // check — read it from any payload that isn't stale.
      setActivity(payload.awaiting === true ? ((payload.activity as string | null | undefined) ?? null) : null);
    }
    if (payload.step && next === "researching") setStep(String(payload.step));

    const clearSavedSession = () => { if (typeof window !== "undefined") forgetSession(); };
    if (next === "complete") {
      stopUpdates();
      clearSavedSession();
      setPhase("summary");
      setEndKind("complete");
      setBusy(false);
      setMessage(ODO_COPY.completedSubtext);
      emit("report-pending");
    } else if (next === "insufficient_data") {
      stopUpdates();
      clearSavedSession();
      setPhase("summary");
      setEndKind("insufficient");
      setBusy(false);
      setMessage((payload.message as string) || ODO_COPY.inconclusiveSubtext);
      emit("inconclusive");
    } else if (next === "failed") {
      stopUpdates();
      clearSavedSession();
      setPhase("error");
      setBusy(false);
      setMessage((payload.message as string) || ODO_COPY.unavailable);
      emit("failed");
    } else if (next === "cancelled") {
      stopUpdates();
      clearSavedSession();
      setPhase("idle");
      setBusy(false);
    } else if (next === "questioning") {
      setPhase("questions");
      setBusy(false);
    } else if (next === "evaluating") {
      setPhase("evaluating");
      setBusy(true);
    } else {
      setPhase("researching");
      setBusy(true);
    }
  }, [emit, stopUpdates]);

  const pollStatus = useCallback(async (id: string, statusUrl: string = ODO_ROUTES.status) => {
    try {
      const separator = statusUrl.includes("?") ? "&" : "?";
      const response = await fetch(`${statusUrl}${separator}session_id=${encodeURIComponent(id)}`, {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      if (response.status === 404) {
        // The saved scan expired — start fresh rather than wait forever.
        stopUpdates();
        forgetSession();
        setSessionId("");
        setPhase("idle");
        setBusy(false);
        return;
      }
      applyStatus(await readJson(response));
    } catch {
      // Keep the scan running; the next poll retries.
    }
  }, [applyStatus, stopUpdates]);

  const startUpdates = useCallback((id: string, eventsUrl: string, statusUrl: string = ODO_ROUTES.status) => {
    stopUpdates();
    if (typeof window !== "undefined" && "EventSource" in window && eventsUrl) {
      const source = new EventSource(eventsUrl);
      eventSourceRef.current = source;
      source.onmessage = (event: MessageEvent) => {
        try { applyStatus(JSON.parse(event.data)); } catch { /* ignore malformed data */ }
      };
      source.onerror = () => source.close();
    }
    pollStatus(id, statusUrl);
    pollRef.current = window.setInterval(() => pollStatus(id, statusUrl), 2500) as unknown as number;
  }, [applyStatus, pollStatus, stopUpdates]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const savedSession = loadSession();
    if (!savedSession) return undefined;
    setSessionId(savedSession);
    setPhase("researching");
    startUpdates(savedSession, `${ODO_ROUTES.events}?session_id=${encodeURIComponent(savedSession)}`, ODO_ROUTES.status);
    return undefined;
  }, [startUpdates]);

  // Keep the newest message in view.
  useEffect(() => {
    const el = threadRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [chat, optimistic, submitting, awaiting]);

  // Private shortcut for ORAGROL staff: if the name box holds the admin
  // passcode, go to the outbound tool. The check runs on the server — the
  // passcode is never in this page's code. Anything else does nothing at all.
  const router = useRouter();
  const lastKnock = useRef("");
  const adminKnock = (value: string) => {
    const v = value.trim();
    if (v.length < 8 || v === lastKnock.current) return;
    lastKnock.current = v;
    fetch("/api/odo/admin/outbound-auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ passcode: v }) })
      .then((r) => r.json())
      .then((d: { ok?: boolean }) => { if (d.ok) router.push(`/ops/outbound#${encodeURIComponent(v)}`); })
      .catch(() => {});
  };

  const updateField = (name: string, value: string) => {
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const resetConversation = () => {
    chatVersionRef.current = 0;
    setChat([]);
    setAwaiting(false);
    setActivity(null);
    setPending(null);
    setProgress(null);
    setDraft("");
    setOptimistic(null);
    setEndKind(null);
  };

  const submitStart = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateForm(form);
    if (!consent) nextErrors["consent"] = "Accept the consent notice before starting.";
    if (!turnstileToken) nextErrors["turnstile"] = "Please complete the verification above before starting.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setBusy(true);
    setPhase("researching");
    setMessage("");
    setCooldownModal(null);
    resetConversation();
    emit("scan-start-requested");
    try {
      const response = await fetch(ODO_ROUTES.start, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          idempotency_key: makeIdempotencyKey(),
          locale,
          turnstile_token: turnstileToken,
          lead: {
            name: form.name.trim(),
            email: form.email.trim().toLowerCase(),
            company: form.company.trim(),
            website: normalizeWebsite(form.website) || null,
          },
          consent: {
            accepted: true,
            version: ODO_BACKEND_CONTRACT.consentVersion,
            timestamp: new Date().toISOString(),
          },
        }),
      });
      const payload = await readJson(response);
      if (!response.ok) {
        setBusy(false);
        setPhase("idle");
        if (payload?.code === "email_cooldown" || payload?.code === "domain_cooldown") {
          setCooldownModal({
            code: String(payload.code),
            message: String(payload.message || "A recent scan is already on file. Please check back soon."),
          });
        } else {
          setMessage(formatError(payload, "We could not start the scan. Please review your details and try again."));
        }
        // The token is single-use — a fresh challenge is needed before retrying.
        setTurnstileToken("");
        if (turnstileWidgetIdRef.current) {
          (window as unknown as { turnstile?: { reset: (id: string) => void } }).turnstile?.reset(turnstileWidgetIdRef.current);
        }
        emit("scan-start-rejected", { code: payload?.code });
        return;
      }
      setSessionId(String(payload.session_id));
      if (typeof window !== "undefined") saveSession(String(payload.session_id));
      emit("scan-started");
      startUpdates(String(payload.session_id), String(payload.events_url || `${ODO_ROUTES.events}?session_id=${encodeURIComponent(String(payload.session_id))}`), String(payload.status_url || ODO_ROUTES.status));
    } catch {
      setBusy(false);
      setPhase("idle");
      setMessage("We could not connect to the scan service. Please try again.");
      emit("scan-start-failed");
    }
  };

  /** Send a typed message or a "Prefer not to answer" skip. */
  const sendTurn = async (kind: "message" | "skip") => {
    if (submittingRef.current || !sessionId || !pending || awaiting) return;
    const text = draft.trim();
    if (kind === "message" && !text) return;
    submittingRef.current = true;
    setSubmitting(true);
    setMessage("");
    setOptimistic({ id: "local-pending", role: "visitor", kind: kind === "skip" ? "skip" : "answer", text: kind === "skip" ? "Prefer not to answer" : text });
    if (kind === "message") setDraft("");
    const restore = () => { setOptimistic(null); if (kind === "message") setDraft(text); };
    try {
      const response = await fetch(ODO_ROUTES.answer, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          version: chatVersionRef.current,
          ...(kind === "skip" ? { skip: true } : { message: text }),
        }),
      });
      const payload = await readJson(response);
      if (!response.ok) {
        if (payload?.code === "stale") {
          restore();
          applyStatus(payload);
          setMessage("The conversation was updated — please check ODO's latest message.");
        } else if (payload?.code === "busy") {
          restore();
          setMessage("ODO is still replying to your last message — one moment.");
        } else if (payload?.status === "failed") {
          applyStatus(payload);
        } else {
          restore();
          setMessage(formatError(payload, "We couldn't send that — please try again."));
        }
        return;
      }
      applyStatus(payload);
    } catch {
      restore();
      setMessage("We couldn't send that — please check your connection and try again.");
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
      composerRef.current?.focus();
    }
  };

  const onComposerKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter sends on desktop; on touch keyboards Enter is a new line and the
    // Send button sends (same convention as WhatsApp).
    const coarse = typeof window !== "undefined" && window.matchMedia?.("(pointer: coarse)").matches;
    if (event.key === "Enter" && !event.shiftKey && !coarse) {
      event.preventDefault();
      void sendTurn("message");
    }
  };

  const startNewScan = () => {
    setSessionId("");
    resetConversation();
    setMessage("");
    setForm({ ...INITIAL_FORM });
    setErrors({});
    setConsent(false);
    if (typeof window !== "undefined") forgetSession();
    setPhase("idle");
  };

  const cancelScan = async () => {
    if (!sessionId) return;
    stopUpdates();
    setBusy(false);
    setPhase("idle");
    setSessionId("");
    resetConversation();
    if (typeof window !== "undefined") forgetSession();
    setMessage("Your scan is paused. You can start again when you are ready.");
    try {
      await fetch(ODO_ROUTES.cancel, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
        keepalive: true,
      });
    } catch {
      // The server applies its own retention and expiry rules.
    }
  };

  const inConversation = phase === "questions" || phase === "evaluating" || (phase === "summary" && chat.length > 0);
  const odoTyping = submitting || awaiting;
  const canType = phase === "questions" && !!pending && !odoTyping;
  const questionNumber = progress ? Math.min(progress.questions_asked, progress.max_questions) : 0;
  const headline = useMemo(() => ODO_COPY.headline, []);

  return (
    <main className="odo-scan" data-odo-scan data-phase={phase}>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
        onLoad={() => setTurnstileReady(true)}
      />
      <header className="odo-scan__masthead">
        <span className="odo-scan__wordmark">ORAGROL GLOBAL</span>
        <div className="odo-scan__masthead-actions">
          <button type="button" className="odo-scan__language" aria-label="Change language">EN <span>/</span> FR</button>
          <button type="button" className="odo-scan__close" aria-label="Close scan" onClick={() => { if (typeof window !== "undefined") window.history.back(); }}>×</button>
        </div>
      </header>

      <div className="odo-scan__main">
        <section className="odo-scan__editorial" aria-labelledby="odo-scan-title">
          <h1 id="odo-scan-title">{headline}</h1>
          <p className="odo-scan__lead">{ODO_COPY.description}</p>
          <p className="odo-scan__promise">{ODO_COPY.promise}</p>

          <div className="odo-scan__facts" aria-label="Scan facts">
            <div><strong>5–10</strong><span>MINUTE SCAN</span></div>
            <div><strong>Free</strong><span>NO CHARGE</span></div>
            <div><strong>24h</strong><span>REPORT DELIVERY</span></div>
          </div>

          <section className="odo-scan__how" aria-labelledby="odo-how-title">
            <h2 id="odo-how-title">How it works</h2>
            <ol>
              {HOW_IT_WORKS.map((item) => (
                <li key={item.number}>
                  <span>{item.number}</span>
                  <div><strong>{item.title}</strong><p>{item.body}</p></div>
                </li>
              ))}
            </ol>
            <p className="odo-scan__review-note">{ODO_COPY.humanReview}</p>
          </section>
        </section>

        <section className="odo-scan__workspace" aria-label="Start your business scan">
          {phase === "idle" ? (
            <>
              <h2>Start your business scan.</h2>
              <p className="odo-scan__workspace-subtitle">{ODO_COPY.preChatNote}</p>
              <p className="odo-scan__intro">{ODO_COPY.intro}</p>
              <form id="odo-start-form" className="odo-scan__form" onSubmit={submitStart} noValidate>
                <Field id="name" label="Your name" value={form.name} onChange={(value) => updateField("name", value)} onCommit={adminKnock} placeholder="Full name" error={errors.name} />
                <Field id="email" label="Work email" value={form.email} onChange={(value) => updateField("email", value)} placeholder="you@company.com" type="email" error={errors.email} />
                <Field id="company" label="Company name" value={form.company} onChange={(value) => updateField("company", value)} placeholder="Business name" error={errors.company} />
                <Field id="website" label="Website" value={form.website} onChange={(value) => updateField("website", value)} placeholder="https://yourwebsite.com" type="url" error={errors.website} />
                <a className="odo-scan__no-website" href="https://orgro.ca/contact">No website? Book a quick consultation instead →</a>
                <label className="odo-scan__consent">
                  <input type="checkbox" checked={consent} onChange={(event) => { setConsent(event.target.checked); setErrors((current) => ({ ...current, consent: undefined })); }} />
                  <span>{ODO_COPY.consent} <a href="/privacy">Privacy Policy</a></span>
                </label>
                {errors.consent ? <p className="odo-scan__inline-error" role="alert">{errors.consent}</p> : null}
                {/* Cloudflare Turnstile — verified server-side before any paid research/AI call runs. */}
                <div ref={turnstileContainerRef} className="odo-scan__turnstile" />
                {errors.turnstile ? <p className="odo-scan__inline-error" role="alert">{errors.turnstile}</p> : null}
                <button type="submit" className="odo-scan__submit" disabled={busy}>
                  {busy ? "Preparing your scan…" : "Start my free scan"}<span aria-hidden="true">→</span>
                </button>
                <p className="odo-scan__fine-print">Free. No payment details required.</p>
                {message ? <p className="odo-scan__server-message" role="alert">{message}</p> : null}
              </form>
              <ResearchPreview phase="idle" step="website" />
            </>
          ) : phase === "error" ? (
            <div className="odo-scan__terminal" role="alert">
              <p className="odo-scan__section-kicker">SCAN STOPPED</p>
              <h2>We need to try again later.</h2>
              <p>{message || ODO_COPY.unavailable}</p>
              <button type="button" className="odo-scan__submit" onClick={startNewScan}>Return to scan <span aria-hidden="true">→</span></button>
            </div>
          ) : inConversation ? (
            <div className="odo-chat">
              <div className="odo-chat__head">
                <PhaseTrack phase={phase === "questions" ? "questions" : "summary"} />
                {phase === "questions" && questionNumber > 0 ? (
                  <p className="odo-chat__progress">Question {questionNumber} of up to {progress?.max_questions ?? 15}</p>
                ) : null}
              </div>

              <div className="odo-chat__thread" ref={threadRef} aria-live="polite" aria-label="Conversation with ODO">
                {chat.map((item) => <ChatBubble key={item.id} item={item} />)}
                {optimistic ? <ChatBubble item={optimistic} /> : null}
                {phase === "questions" && odoTyping ? <TypingBubble activity={activity} /> : null}
              </div>

              {phase === "questions" ? (
                <form className="odo-chat__composer" onSubmit={(event) => { event.preventDefault(); void sendTurn("message"); }}>
                  <textarea
                    ref={composerRef}
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={onComposerKeyDown}
                    rows={3}
                    maxLength={2000}
                    autoFocus
                    disabled={!canType}
                    aria-label="Your answer"
                    placeholder={odoTyping ? "ODO is typing…" : pending?.hint || "Type your answer…"}
                  />
                  <div className="odo-chat__actions">
                    <button type="button" className="odo-chat__skip" disabled={!canType} onClick={() => void sendTurn("skip")}>
                      Prefer not to answer
                    </button>
                    <button type="submit" className="odo-chat__send" disabled={!canType || !draft.trim()}>
                      Send <span aria-hidden="true">→</span>
                    </button>
                  </div>
                  {message ? <p className="odo-scan__server-message" role="alert">{message}</p> : null}
                  <p className="odo-chat__fine">
                    You can ask ODO a question at any time{progress ? ` — ${progress.visitor_questions_left} left during this scan` : ""}.
                  </p>
                  <button type="button" className="odo-scan__cancel" onClick={cancelScan}>Pause scan</button>
                </form>
              ) : phase === "evaluating" ? (
                <div className="odo-chat__status" role="status">
                  <LiveSpinner /> <span>ODO is preparing your review…</span>
                </div>
              ) : (
                <div className="odo-scan__terminal odo-chat__ending" role="status">
                  <p className="odo-scan__section-kicker">{endKind === "insufficient" ? "SCAN ENDED" : "INTERVIEW COMPLETE"}</p>
                  <h2>{endKind === "insufficient" ? "Not enough reliable information." : "Thank you — your interview is complete."}</h2>
                  <p>{message}</p>
                  {endKind === "complete" ? <p className="odo-scan__legal">{ODO_COPY.protectionLine}</p> : null}
                  <button type="button" className="odo-scan__submit" onClick={startNewScan}>Start another scan <span aria-hidden="true">→</span></button>
                </div>
              )}
            </div>
          ) : phase === "summary" ? (
            <div className="odo-scan__terminal" role="status">
              <p className="odo-scan__section-kicker">{endKind === "insufficient" ? "SCAN ENDED" : "SCAN COMPLETE"}</p>
              <h2>{endKind === "insufficient" ? "Not enough reliable information." : "Your scan is complete."}</h2>
              <p>{message}</p>
              {endKind === "complete" ? <p className="odo-scan__legal">{ODO_COPY.protectionLine}</p> : null}
              <button type="button" className="odo-scan__submit" onClick={startNewScan}>Start another scan <span aria-hidden="true">→</span></button>
            </div>
          ) : (
            <>
              <div className="odo-scan__live-heading"><h2>ODO is researching.</h2><span className="odo-scan__live-badge"><LiveSpinner /> LIVE</span></div>
              <p className="odo-scan__workspace-subtitle">Reviewing your public business information first, so ODO only asks what research can&apos;t see.</p>
              <ResearchPreview phase="researching" step={step} />
              <button type="button" className="odo-scan__cancel" onClick={cancelScan}>Pause scan</button>
            </>
          )}
        </section>
      </div>
      {cooldownModal ? <CooldownModal message={cooldownModal.message} onClose={() => setCooldownModal(null)} /> : null}
    </main>
  );
}
