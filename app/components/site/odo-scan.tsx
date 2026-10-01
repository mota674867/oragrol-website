"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Script from "next/script";
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
  if ((payload as Record<string,unknown>)?.code === "rate_limited") return "Please wait a moment and try again.";
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

export default function OdoScanPage({ locale = "en", onEvent = NOOP_EVENT_HANDLER }: { locale?: string; onEvent?: (e: Record<string, unknown>) => void }) {
  const [form, setForm] = useState<{name: string; email: string; company: string; website: string}>({...INITIAL_FORM});
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [consent, setConsent] = useState(false);
  const [phase, setPhase] = useState("idle");
  const [step, setStep] = useState("website");
  const [sessionId, setSessionId] = useState("");
  const [question, setQuestion] = useState<{id: string; text: string; options?: Array<string | {value: string; label?: string}>; multiSelect?: boolean} | null>(null);
  const [answer, setAnswer] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [cooldownModal, setCooldownModal] = useState<{ code: string; message: string } | null>(null);
  const [findingsSummary, setFindingsSummary] = useState<{ security_issues: number; marketing_gaps: number; opportunities: number; total: number } | null>(null);
  const [busy, setBusy] = useState(false);
  // ADDED 2026-10-01 — Cloudflare Turnstile captcha (entry-gate requirement,
  // odo-gate.ts verifyTurnstile on the backend). Rendered explicitly via
  // window.turnstile.render (not the implicit data-sitekey div) so we can
  // capture the token into state and reset the widget on a failed/expired
  // check, same pattern Cloudflare's own docs recommend for SPAs.
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileReady, setTurnstileReady] = useState(false);
  const turnstileContainerRef = useRef<HTMLDivElement | null>(null);
  const turnstileWidgetIdRef = useRef<string | null>(null);
  const pollRef = useRef<number | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  // FIXED 2026-10-01 — guards against the SSE stream and the 2.5s polling
  // fallback racing each other. submitAnswer() calls stopUpdates() (clears
  // the interval, closes the EventSource) before starting fresh ones, but
  // that cannot cancel a GET /status fetch that was already in flight from
  // the OLD interval tick, or an SSE message already in the browser's queue
  // before close() ran. That stale response — read from Redis BEFORE the
  // just-submitted answer was saved — can arrive after the fresh question
  // is already on screen and silently overwrite it with the PREVIOUS
  // question, which the visitor then sees as ODO re-asking something they
  // already answered. Found from a live scan: "again repeated the same
  // question... if like this i will shutdown odo." Every status payload
  // (both /status and /events) carries `questions_asked`, which only moves
  // forward — so a payload reporting fewer than the highest we've already
  // shown is necessarily a stale straggler and is dropped before touching
  // any state, not just the question field.
  const questionsAskedRef = useRef<number>(0);
  // FIXED 2026-10-01 — tracks which question.id selectedOptions was last
  // cleared for. Both SSE and the polling fallback resend the SAME
  // unanswered question on every cycle (every ~1-2.5s) until the visitor
  // submits an answer. applyStatus() used to call setSelectedOptions([])
  // on every single one of those resends, not just when the question
  // actually changed — so a checked box was wiped within a couple of
  // seconds of checking it. Found from a live report: "choose of one more
  // option in question, when check one, it will automatically jump to
  // uncheck after 2 second."
  const lastQuestionIdRef = useRef<string | null>(null);

  const emit = useCallback((type: string, extra: Record<string, unknown> = {}) => onEvent({ type, ...extra }), [onEvent]);

  const stopUpdates = useCallback(() => {
    if (pollRef.current) window.clearInterval(pollRef.current as unknown as ReturnType<typeof setInterval>);
    pollRef.current = null;
    eventSourceRef.current?.close?.();
    eventSourceRef.current = null;
  }, []);

  useEffect(() => () => stopUpdates(), [stopUpdates]);

  // Render the Turnstile widget once its script has loaded AND the intake
  // form (which holds the container div) is on screen. Runs on every
  // render where both are true but only actually renders once, guarded by
  // turnstileWidgetIdRef — the form only mounts the container when
  // phase === "idle", so this effect re-fires each time that happens (e.g.
  // after cancelScan() returns to the intake screen) and re-renders a fresh
  // widget then.
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

  // FIXED 2026-09-29 — this switch never matched the backend's real status
  // vocabulary. The backend (odo/scan/start, /answer, /status routes) has
  // always used "questioning" / "complete" / "insufficient_data" /
  // "cancelled"; this code only recognized "questions" / "report_pending" /
  // "inconclusive", none of which the backend ever sends. Every scan that
  // reached the question or summary stage silently fell into the `else`
  // branch below and stayed stuck showing the research screen forever —
  // found via a live test scan, not a code review.
  const applyStatus = useCallback((payload: Record<string, unknown>) => {
    const next = payload?.status as string | undefined;
    if (!next) return;
    // Drop stale/out-of-order updates — see questionsAskedRef above. A
    // payload reporting fewer questions answered than we've already shown
    // can only be a straggler from before the most recent submitAnswer().
    const payloadQuestionsAsked = payload.questions_asked;
    if (typeof payloadQuestionsAsked === "number") {
      if (payloadQuestionsAsked < questionsAskedRef.current) return;
      questionsAskedRef.current = payloadQuestionsAsked;
    }
    if (payload.step) setStep(String(payload.step));
    if (payload.question) {
      const incoming = payload.question as {id: string; text: string; options?: Array<string | {value: string; label?: string}>; multiSelect?: boolean};
      setQuestion(incoming);
      // FIXED 2026-10-01 — only clear picks when the question actually
      // changed. Both SSE and the polling fallback keep resending the
      // SAME unanswered question every cycle until the visitor submits,
      // and this used to wipe selectedOptions on every single resend —
      // see the lastQuestionIdRef comment above for the reported symptom.
      if (lastQuestionIdRef.current !== incoming.id) {
        lastQuestionIdRef.current = incoming.id;
        setSelectedOptions([]);
      }
    }
    if (payload.findings_summary) {
      setFindingsSummary(payload.findings_summary as { security_issues: number; marketing_gaps: number; opportunities: number; total: number });
    }
    // FIXED 2026-10-01 — every terminal status (complete / insufficient_data
    // / failed / cancelled) used to leave "oragrol_odo_session_id" sitting in
    // sessionStorage. The mount effect below restores whatever session_id is
    // there and immediately re-polls it — so the very next time that same
    // browser tab opened /scan (a reload, or just visiting the page again),
    // it silently re-fetched the already-finished scan, got "complete" back
    // again, and jumped straight to the "Scan Complete" screen instead of
    // the intake form — permanently, until something manually cleared site
    // data. Found from a live report: "it is not allow me even to open and
    // enter the new email." Clearing the key here means the completion/
    // error screen still shows once, right now, in this tab — but a fresh
    // page load afterwards correctly starts clean.
    const clearSavedSession = () => { if (typeof window !== "undefined") window.sessionStorage.removeItem("oragrol_odo_session_id"); };
    if (next === "complete") {
      stopUpdates();
      clearSavedSession();
      setPhase("summary");
      setBusy(false);
      setMessage(ODO_COPY.completedSubtext);
      emit("report-pending");
    } else if (next === "insufficient_data") {
      stopUpdates();
      clearSavedSession();
      setPhase("summary");
      setBusy(false);
      setMessage((payload.message as string) || ODO_COPY.inconclusiveSubtext);
      emit("inconclusive");
    } else if (next === "failed") {
      stopUpdates();
      clearSavedSession();
      setPhase("error");
      setBusy(false);
      setMessage("We could not complete the scan. Please try again later or contact our team.");
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
      // FIXED 2026-10-01 — the backend sets "evaluating" (odo/scan/answer,
      // then odo-pipeline.ts's runEvaluation) for the whole stretch between
      // the last question and the finished report: building the evidence
      // ledger, matching services, writing the SWOT and outlook. This
      // status had no branch of its own and fell into the catch-all below,
      // which shows "ODO is researching" with stage 1 ("Research") bolded
      // again — looking like the scan restarted. Found from a live report:
      // "i complete the question but the orange bold color not shift to
      // next stage, still shows on research."
      setPhase("evaluating");
      setBusy(true);
    } else {
      // "researching" (or any future/unknown value) — keep showing the
      // live research screen rather than guessing a phase name.
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
    pollRef.current = window.setInterval(() => pollStatus(id, statusUrl), 2500) as unknown as number;
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
    setFindingsSummary(null);
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
        // The token is single-use — whatever the rejection reason, Turnstile
        // needs a fresh challenge before the visitor can submit again.
        setTurnstileToken("");
        if (turnstileWidgetIdRef.current) {
          (window as unknown as { turnstile?: { reset: (id: string) => void } }).turnstile?.reset(turnstileWidgetIdRef.current);
        }
        emit("scan-start-rejected", { code: payload?.code });
        return;
      }
      setSessionId(String(payload.session_id));
      questionsAskedRef.current = 0; // Fresh scan — any earlier scan's ref value must not block it.
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
      setSelectedOptions([]);
      applyStatus(payload);
      startUpdates(sessionId, String(payload.events_url || `${ODO_ROUTES.events}?session_id=${encodeURIComponent(sessionId)}`), String(payload.status_url || ODO_ROUTES.status));
    } catch {
      setBusy(false);
      setMessage("We could not save that answer. Please try again.");
    }
  };

  // Resets the page back to the intake form from the completion screen.
  // Added 2026-10-01 alongside the sessionStorage fix above — the summary
  // screen previously had no way back to the form at all in the same tab
  // (only the error screen had a "Return to scan" button). Nothing to
  // cancel server-side here; the scan already finished.
  const startNewScan = () => {
    setSessionId("");
    questionsAskedRef.current = 0; // Fresh scan — any earlier scan's ref value must not block it.
    setQuestion(null);
    setAnswer("");
    setSelectedOptions([]);
    setMessage("");
    setFindingsSummary(null);
    setForm({ ...INITIAL_FORM });
    setErrors({});
    setConsent(false);
    if (typeof window !== "undefined") window.sessionStorage.removeItem("oragrol_odo_session_id");
    setPhase("idle");
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
  const showEvaluating = phase === "evaluating";
  const showSummary = phase === "summary";
  const showError = phase === "error";
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
                {/* CHANGED 2026-10-01 — no-website visitors are routed straight to a
                    consultation instead of clearing the field and scanning anyway. */}
                <a className="odo-scan__no-website" href="https://orgro.ca/contact">No website? Book a quick consultation instead →</a>
                <label className="odo-scan__consent">
                  <input type="checkbox" checked={consent} onChange={(event) => { setConsent(event.target.checked); setErrors((current) => ({ ...current, consent: undefined })); }} />
                  <span>{ODO_COPY.consent} <a href="/privacy">Privacy Policy</a></span>
                </label>
                {errors.consent ? <p className="odo-scan__inline-error" role="alert">{errors.consent}</p> : null}
                {/* Cloudflare Turnstile captcha — odo-gate.ts verifies this
                    token server-side before any paid research/AI call runs. */}
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
          ) : showQuestion ? (
            <>
              <PhaseTrack phase="questions" />
              <div className="odo-scan__question-panel">
                <p className="odo-scan__section-kicker">ONE QUESTION AT A TIME</p>
                <h2>{question.text}</h2>
                <form onSubmit={submitAnswer}>
                  {Array.isArray(question.options) && question.options && question.options.length ? (
                    question.multiSelect ? (
                      <>
                        <p className="odo-scan__multiselect-hint">Select all that apply, then continue.</p>
                        <div className="odo-scan__options odo-scan__options--multi" role="group" aria-label="Choose one or more answers">
                          {(question.options || []).map((option) => {
                            const value = typeof option === "string" ? option : option.value;
                            const label = typeof option === "string" ? option : option.label || value;
                            const checked = selectedOptions.includes(value);
                            return (
                              <label key={value} className={`odo-scan__option odo-scan__option--checkbox${checked ? " is-selected" : ""}`}>
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  disabled={busy}
                                  onChange={() => setSelectedOptions((current) => (current.includes(value) ? current.filter((v) => v !== value) : [...current, value]))}
                                />
                                <span>{label}</span>
                              </label>
                            );
                          })}
                        </div>
                        <button
                          type="button"
                          className="odo-scan__submit"
                          disabled={busy || selectedOptions.length === 0}
                          onClick={(event: React.MouseEvent<HTMLButtonElement>) => submitAnswer(event, selectedOptions.join(" | "))}
                        >
                          Continue <span aria-hidden="true">→</span>
                        </button>
                      </>
                    ) : (
                      <div className="odo-scan__options" role="group" aria-label="Choose an answer">
                        {(question.options || []).map((option) => {
                          const value = typeof option === "string" ? option : option.value;
                          const label = typeof option === "string" ? option : option.label || value;
                          return <button key={value} type="button" className="odo-scan__option" disabled={busy} onClick={(event: React.MouseEvent<HTMLButtonElement>) => submitAnswer(event, value)}>{label}</button>;
                        })}
                      </div>
                    )
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
              {findingsSummary ? (
                <div className="odo-scan__findings-summary">
                  <p>We identified <strong>{findingsSummary.total} area{findingsSummary.total === 1 ? "" : "s"}</strong> across your business:</p>
                  <ul>
                    <li><span aria-hidden="true">🔴</span> {findingsSummary.security_issues} critical finding{findingsSummary.security_issues === 1 ? "" : "s"} in your security posture</li>
                    <li><span aria-hidden="true">🟠</span> {findingsSummary.marketing_gaps} gap{findingsSummary.marketing_gaps === 1 ? "" : "s"} in your sales and marketing system</li>
                    <li><span aria-hidden="true">🟡</span> {findingsSummary.opportunities} opportunit{findingsSummary.opportunities === 1 ? "y" : "ies"} your competitors are already using</li>
                  </ul>
                </div>
              ) : null}
              <p className="odo-scan__legal">These findings are based on publicly available information and ODO’s initial analysis. An ORAGROL specialist reviews every report before delivery.</p>
              <button type="button" className="odo-scan__submit" onClick={startNewScan}>Start another scan <span aria-hidden="true">→</span></button>
            </div>
          ) : showError ? (
            <div className="odo-scan__terminal" role="alert">
              <p className="odo-scan__section-kicker">SCAN PAUSED</p>
              <h2>We need to try again.</h2>
              <p>{message}</p>
              <button type="button" className="odo-scan__submit" onClick={() => { setPhase("idle"); setMessage(""); }}>Return to scan <span aria-hidden="true">→</span></button>
            </div>
          ) : showEvaluating ? (
            // ADDED 2026-10-01 alongside the "evaluating" status fix above —
            // this is the stretch between the last question and the
            // finished report (matching services, writing the SWOT and
            // outlook). PhaseTrack gets the real phase so "Summary" lights
            // up as active (anything other than "researching"/"questions"
            // resolves to stage 3 — see PhaseTrack), instead of staying on
            // "Research" like the old catch-all did.
            <>
              <PhaseTrack phase={phase} />
              <div className="odo-scan__live-heading"><h2>ODO is building your report.</h2><span className="odo-scan__live-badge"><LiveSpinner /> LIVE</span></div>
              <p className="odo-scan__workspace-subtitle">Matching your answers to services and writing your summary — this only takes a few seconds.</p>
            </>
          ) : (
            <>
              <div className="odo-scan__live-heading"><h2>ODO is researching.</h2><span className="odo-scan__live-badge"><LiveSpinner /> LIVE</span></div>
              <p className="odo-scan__workspace-subtitle">We are reviewing your public business information before asking anything unnecessary.</p>
              <ResearchPreview phase={showLive ? "researching" : phase} step={step} />
              <button type="button" className="odo-scan__cancel" onClick={cancelScan}>Pause scan</button>
            </>
          )}
        </section>
      </div>
      {cooldownModal ? <CooldownModal message={cooldownModal.message} onClose={() => setCooldownModal(null)} /> : null}
    </main>
  );
}
