"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
    "The scan takes 3–4 minutes. ODO researches your business publicly while you answer a few quick questions. Your full report arrives within 24 hours.",
  intro:
    "I'm ODO — OR Discovery & Opportunity Agent. Before I ask you anything, I'm going to research your business publicly.",
  consent:
    "By starting your scan, you consent to ORAGROL researching publicly available information about your business and storing your contact details per our Privacy Policy.",
  humanReview: "Reviewed by an ORAGROL specialist before delivery.",
  completedSubtext:
    "Our team is reviewing your findings. Your personalized report will be in your inbox within 24 hours.",
  inconclusiveSubtext:
    "Based on what we could gather, we do not have enough to give you a confident evaluation yet. Our team will contact you directly within 24 hours.",
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
    title: "Only relevant questions",
    body: "We ask what the research cannot answer.",
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

function makeIdempotencyKey() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `odo-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function normalizeWebsite(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function validateForm(form: typeof INITIAL_FORM): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!form.name.trim()) errors.name = "Enter your name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = "Enter a valid work email.";
  }
  if (!form.company.trim()) errors.company = "Enter your company name.";
  if (form.website.trim() && !/^https?:\/\/[^\s]+$/i.test(normalizeWebsite(form.website) || "")) {
    errors.website = "Enter a valid website URL, or choose No website.";
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
  if ((payload as Record<string,unknown>)?.code === "email_cooldown" || (payload as Record<string,unknown>)?.code === "domain_cooldown") {
    return "A recent scan is already on file. Your next scan will be available after the stated cooldown period.";
  }
  if ((payload as Record<string,unknown>)?.code === "rate_limited") return "Please wait a moment and try again.";
  return (payload as Record<string,unknown>)?.message as string || fallback;
}

function Field({ id, label, value, onChange, placeholder, type = "text", error }: { id: string; label: string; value: string; onChange: (v: string) => void; placeholder: string; type?: string; error?: string }) {
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

function ResearchPreview({ phase, step }: { phase: string; step: string }) {
  const stepIndex = Math.max(0, RESEARCH_STEPS.findIndex((item) => item.key === step));
  const live = phase === "researching";
  return (
    <section className="odo-scan__preview" aria-live="polite" aria-label={live ? "ODO research progress" : "Example research preview"}>
      <div className="odo-scan__preview-heading">
        <h2>{live ? "ODO is researching" : "A look inside the scan"}</h2>
        <span>{live ? "LIVE" : "EXAMPLE PREVIEW"}</span>
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

export default function OdoScanPage({ locale = "en", onEvent = (_e: Record<string, unknown>) => {} }: { locale?: string; onEvent?: (e: Record<string, unknown>) => void }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [consent, setConsent] = useState(false);
  const [phase, setPhase] = useState("idle");
  const [step, setStep] = useState("website");
  const [sessionId, setSessionId] = useState("");
  const [question, setQuestion] = useState<{id: string; text: string; options?: Array<string | {value: string; label?: string}>} | null>(null);
  const [answer, setAnswer] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const pollRef = useRef<ReturnType<typeof window.setInterval> | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const emit = useCallback((type: string, extra: Record<string, unknown> = {}) => onEvent({ type, ...extra }), [onEvent]);

  const stopUpdates = useCallback(() => {
    if (pollRef.current) window.clearInterval(pollRef.current);
    pollRef.current = null;
    eventSourceRef.current?.close?.();
    eventSourceRef.current = null;
  }, []);

  useEffect(() => () => stopUpdates(), [stopUpdates]);

  const applyStatus = useCallback((payload: Record<string, unknown>) => {
    const next = payload?.status as string | undefined;
    if (!next) return;
    if (payload.phase) setPhase(String(payload.phase));
    if (payload.step) setStep(String(payload.step));
    if (payload.question) setQuestion(payload.question as {id: string; text: string; options?: Array<string | {value: string; label?: string}>});
    if (next === "report_pending") {
      stopUpdates();
      setPhase("summary");
      setBusy(false);
      setMessage(ODO_COPY.completedSubtext);
      emit("report-pending");
    } else if (next === "inconclusive") {
      stopUpdates();
      setPhase("summary");
      setBusy(false);
      setMessage((payload.message as string) || ODO_COPY.inconclusiveSubtext);
      emit("inconclusive");
    } else if (next === "failed") {
      stopUpdates();
      setPhase("error");
      setBusy(false);
      setMessage("We could not complete the scan. Please try again later or contact our team.");
      emit("failed");
    } else if (next === "questions") {
      setPhase("questions");
      setBusy(false);
    } else {
      setPhase(String(payload.phase || "researching"));
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
      applyStatus(await readJson(response));
    } catch {
      // Keep the scan running; the next bounded poll retries without exposing internals.
    }
  }, [applyStatus]);

  const startUpdates = useCallback((id: string, eventsUrl: string, statusUrl: string = ODO_ROUTES.status) => {
    stopUpdates();
    if (typeof window !== "undefined" && "EventSource" in window && eventsUrl) {
      const source = new EventSource(eventsUrl);
      eventSourceRef.current = source;
      source.onmessage = (event: MessageEvent) => {
        try { applyStatus(JSON.parse(event.data)); } catch { /* Ignore malformed provider data. */ }
      };
      source.onerror = () => source.close();
    }
    pollStatus(id, statusUrl);
    pollRef.current = window.setInterval(() => pollStatus(id, statusUrl), 2500);
  }, [applyStatus, pollStatus, stopUpdates]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const savedSession = window.sessionStorage.getItem("oragrol_odo_session_id");
    if (!savedSession) return undefined;
    setSessionId(savedSession);
    setPhase("researching");
    startUpdates(savedSession, `${ODO_ROUTES.events}?session_id=${encodeURIComponent(savedSession)}`, ODO_ROUTES.status);
    return undefined;
  }, [startUpdates]);

  const updateField = (name: string, value: string) => {
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const submitStart = async (event) => {
    event.preventDefault();
    const nextErrors = validateForm(form);
    if (!consent) nextErrors.consent = "Accept the consent notice before starting.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setBusy(true);
    setPhase("researching");
    setMessage("");
    emit("scan-start-requested");
    try {
      const response = await fetch(ODO_ROUTES.start, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          idempotency_key: makeIdempotencyKey(),
          locale,
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
        setMessage(formatError(payload, "We could not start the scan. Please review your details and try again."));
        emit("scan-start-rejected", { code: payload?.code });
        return;
      }
      setSessionId(String(payload.session_id));
      if (typeof window !== "undefined") window.sessionStorage.setItem("oragrol_odo_session_id", String(payload.session_id));
      emit("scan-started");
      startUpdates(String(payload.session_id), String(payload.events_url || `${ODO_ROUTES.events}?session_id=${encodeURIComponent(String(payload.session_id))}`), String(payload.status_url || ODO_ROUTES.status));
    } catch {
      setBusy(false);
      setPhase("idle");
      setMessage("We could not connect to the scan service. Please try again.");
      emit("scan-start-failed");
    }
  };

  const submitAnswer = async (event: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement> | null, selectedAnswer: string = answer.trim()) => {
    event?.preventDefault();
    if (!selectedAnswer || !sessionId || busy || !question?.id) return;
    setBusy(true);
    try {
      const response = await fetch(ODO_ROUTES.answer, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          idempotency_key: makeIdempotencyKey(),
          question_id: question.id,
          answer: selectedAnswer,
        }),
      });
      const payload = await readJson(response);
      if (!response.ok) {
        setBusy(false);
        setMessage(formatError(payload, "We could not save that answer. Please try again."));
        return;
      }
      setQuestion(null);
      setAnswer("");
      applyStatus(payload);
      startUpdates(sessionId, String(payload.events_url || `${ODO_ROUTES.events}?session_id=${encodeURIComponent(sessionId)}`), String(payload.status_url || ODO_ROUTES.status));
    } catch {
      setBusy(false);
      setMessage("We could not save that answer. Please try again.");
    }
  };

  const cancelScan = async () => {
    if (!sessionId) return;
    stopUpdates();
    setBusy(false);
    setPhase("idle");
    setSessionId("");
    if (typeof window !== "undefined") window.sessionStorage.removeItem("oragrol_odo_session_id");
    setMessage("Your scan is paused. You can start again when you are ready.");
    try {
      await fetch(ODO_ROUTES.cancel, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
        keepalive: true,
      });
    } catch {
      // The server applies its own retention and expiry rules if this request is interrupted.
    }
  };

  const showLive = phase === "researching";
  const showQuestion = phase === "questions" && question;
  const showSummary = phase === "summary";
  const showError = phase === "error";
  const headline = useMemo(() => ODO_COPY.headline, []);

  return (
    <main className="odo-scan" data-odo-scan data-phase={phase}>
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
            <div><strong>3–4</strong><span>MINUTE SCAN</span></div>
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
          {phase === "idle" || phase === "error" ? (
            <>
              <h2>Start your business scan.</h2>
              <p className="odo-scan__workspace-subtitle">{ODO_COPY.preChatNote}</p>
              <p className="odo-scan__intro">{ODO_COPY.intro}</p>
              <form id="odo-start-form" className="odo-scan__form" onSubmit={submitStart} noValidate>
                <Field id="name" label="Your name" value={form.name} onChange={(value) => updateField("name", value)} placeholder="Full name" error={errors.name} />
                <Field id="email" label="Work email" value={form.email} onChange={(value) => updateField("email", value)} placeholder="you@company.com" type="email" error={errors.email} />
                <Field id="company" label="Company name" value={form.company} onChange={(value) => updateField("company", value)} placeholder="Business name" error={errors.company} />
                <Field id="website" label="Website" value={form.website} onChange={(value) => updateField("website", value)} placeholder="https://yourwebsite.com" type="url" error={errors.website} />
                <button type="button" className="odo-scan__no-website" onClick={() => updateField("website", "")}>No website?</button>
                <label className="odo-scan__consent">
                  <input type="checkbox" checked={consent} onChange={(event) => { setConsent(event.target.checked); setErrors((current) => ({ ...current, consent: undefined })); }} />
                  <span>{ODO_COPY.consent} <a href="/privacy">Privacy Policy</a></span>
                </label>
                {errors.consent ? <p className="odo-scan__inline-error" role="alert">{errors.consent}</p> : null}
                <button type="submit" className="odo-scan__submit" disabled={busy}>
                  {busy ? "Preparing your scan…" : "Start my free scan"}<span aria-hidden="true">→</span>
                </button>
                <p className="odo-scan__fine-print">Free. No payment details required.</p>
                {message ? <p className="odo-scan__server-message" role="alert">{message}</p> : null}
              </form>
              <ResearchPreview phase="idle" step="website" />
            </>
          ) : showQuestion ? (
            <>
              <PhaseTrack phase="questions" />
              <div className="odo-scan__question-panel">
                <p className="odo-scan__section-kicker">ONE QUESTION AT A TIME</p>
                <h2>{question.text}</h2>
                <form onSubmit={submitAnswer}>
                  {Array.isArray(question.options) && question.options && question.options.length ? (
                    <div className="odo-scan__options" role="group" aria-label="Choose an answer">
                      {(question.options || []).map((option) => {
                        const value = typeof option === "string" ? option : option.value;
                        const label = typeof option === "string" ? option : option.label || value;
                        return <button key={value} type="button" className="odo-scan__option" disabled={busy} onClick={(event: React.MouseEvent<HTMLButtonElement>) => submitAnswer(event, value)}>{label}</button>;
                      })}
                    </div>
                  ) : (
                    <>
                      <textarea value={answer} onChange={(event) => setAnswer(event.target.value)} rows={5} autoFocus aria-label="Your answer" placeholder="Write your answer here" />
                      <button type="submit" className="odo-scan__submit" disabled={busy || !answer.trim()}>Continue <span aria-hidden="true">→</span></button>
                    </>
                  )}
                </form>
                <button type="button" className="odo-scan__cancel" onClick={cancelScan}>Pause scan</button>
              </div>
            </>
          ) : showSummary ? (
            <div className="odo-scan__terminal" role="status">
              <p className="odo-scan__section-kicker">SCAN COMPLETE</p>
              <h2>Your scan is complete.</h2>
              <p>{message}</p>
              <p className="odo-scan__legal">These findings are based on publicly available information and ODO’s initial analysis. An ORAGROL specialist reviews every report before delivery.</p>
            </div>
          ) : showError ? (
            <div className="odo-scan__terminal" role="alert">
              <p className="odo-scan__section-kicker">SCAN PAUSED</p>
              <h2>We need to try again.</h2>
              <p>{message}</p>
              <button type="button" className="odo-scan__submit" onClick={() => { setPhase("idle"); setMessage(""); }}>Return to scan <span aria-hidden="true">→</span></button>
            </div>
          ) : (
            <>
              <div className="odo-scan__live-heading"><h2>ODO is researching.</h2><span>LIVE</span></div>
              <p className="odo-scan__workspace-subtitle">We are reviewing your public business information before asking anything unnecessary.</p>
              <ResearchPreview phase={showLive ? "researching" : phase} step={step} />
              <button type="button" className="odo-scan__cancel" onClick={cancelScan}>Pause scan</button>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
