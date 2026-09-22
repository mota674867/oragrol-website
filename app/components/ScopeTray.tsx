"use client";

import { FormEvent, useMemo, useState, useEffect } from "react";
import { useTranslations } from "next-intl";

export type ScopeArea = "Cybersecurity" | "Automation" | "OR ONE";
export type ScopeItem = {
  id: string;
  area: ScopeArea;
  code: string;
  title: string;
  detail: string;
  commercial?: string;
  /**
   * OR ONE only: the individual capability codes selected within this
   * one aggregate scope entry (see app/lib/or-one-capability-registry.ts).
   * Populated by or-one-client.tsx so the server can resolve real
   * per-capability identities instead of just a count — see
   * app/lib/scope-resolve.ts, which is what actually reads this.
   */
  capabilityCodes?: string[];
};

const key = "oragrol-scope-v2";

export function useScope() {
  const [items, setItems] = useState<ScopeItem[]>([]);
  // Hydrate from localStorage after mount (client-only; SSR/first paint stays
  // empty on purpose to avoid a hydration mismatch).
  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time localStorage hydration on mount, not a reactive sync loop
      setItems(JSON.parse(localStorage.getItem(key) || "[]"));
    } catch {
      /* ignore malformed localStorage content */
    }
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(items));
    } catch {
      /* storage may be unavailable (private browsing, quota) — non-fatal */
    }
  }, [items]);
  const has = (id: string) => items.some((x) => x.id === id);
  const toggle = (item: ScopeItem) =>
    setItems((s) => (s.some((x) => x.id === item.id) ? s.filter((x) => x.id !== item.id) : [...s, item]));
  const remove = (id: string) => setItems((s) => s.filter((x) => x.id !== id));
  // Called after a successful PDF download or review submission — the
  // action is complete, so the scope shouldn't still be sitting there
  // (and reappearing) on the next page load. The existing persistence
  // effect above writes this empty array to localStorage automatically.
  const clear = () => setItems([]);
  return { items, setItems, has, toggle, remove, clear };
}

// Required before either action can proceed — name, a syntactically
// valid email, phone, AND company (per My_Scope_Final_Ready_For_Claude.md
// Section 1: "Both actions collect four REQUIRED fields"). This is a UX
// gate only; scope-schema.ts enforces the same four fields server-side,
// which is the actual source of truth.
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function isClientReady(client: { name: string; email: string; phone: string; company: string }) {
  return (
    client.name.trim().length > 0 &&
    emailPattern.test(client.email.trim()) &&
    client.phone.trim().length > 0 &&
    client.company.trim().length > 0
  );
}

type ClientInfo = {
  name: string;
  email: string;
  phone: string;
  company: string;
  timeframe: string; // optional field — never required, per Section 1
  context: string; // optional field — never required
};

// Bumps only if the disclosure text below actually changes; recorded
// server-side per action so a future copy change doesn't retroactively
// misdescribe what an earlier submitter actually saw and agreed to. The
// disclosure copy itself (Bilingual, D-086, Task #21) now lives in
// messages.ScopeTray.form.disclosure and is rendered via t() in the
// component below — this version tag is independent of language, since
// it tracks the underlying legal text, not its translation.
const DISCLOSURE_VERSION = "2026-09-09";

type SelectionPayload = { id: string; capabilityCodes?: string[] };
function toSelectionPayload(item: ScopeItem): SelectionPayload {
  return item.capabilityCodes && item.capabilityCodes.length > 0
    ? { id: item.id, capabilityCodes: item.capabilityCodes }
    : { id: item.id };
}

type ScopeApiResponse = { reference: string; actionId: string; downloadToken: string };

async function submitScope(
  intent: "pdf_download" | "review_requested",
  items: ScopeItem[],
  client: ClientInfo,
): Promise<ScopeApiResponse> {
  const requestId = crypto.randomUUID();
  const res = await fetch("/api/scope", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      requestId,
      intent,
      name: client.name.trim(),
      email: client.email.trim(),
      phone: client.phone.trim(),
      company: client.company.trim(),
      timeframe: client.timeframe.trim() || undefined,
      context: client.context.trim() || undefined,
      selections: items.map(toSelectionPayload),
      sourcePath: window.location.pathname,
      disclosureVersion: DISCLOSURE_VERSION,
      acknowledged: true, // this function is only ever called after the checkbox is confirmed checked — see the two handlers below
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error || `Request failed (${res.status}).`);
  }
  return res.json();
}

/**
 * The PDF is generated by an async job (scope-worker.ts's
 * pdf_generation handler), not synchronously in the POST response —
 * poll the protected download endpoint until it's ready. 202 = still
 * generating, 200 = ready, anything else = a real error worth stopping
 * on rather than retrying forever.
 */
async function pollForPdf(
  downloadToken: string,
  // Bilingual (D-086, Task #21): the timeout message is passed in by the
  // component (which has t() available) rather than hardcoded here, since
  // this is a plain module-level function, not a component, and can't call
  // useTranslations() itself.
  timeoutMessage: string,
  maxAttempts = 20,
  intervalMs = 1500,
): Promise<Blob> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const res = await fetch(`/api/scope/download?token=${encodeURIComponent(downloadToken)}`);
    if (res.status === 200) return res.blob();
    if (res.status !== 202) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body?.error || `Download failed (${res.status}).`);
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error(timeoutMessage);
}

function triggerBrowserDownload(blob: Blob, reference: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ORAGROL_My_Scope_${reference}.pdf`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

type FlowState =
  | { status: "idle" }
  | { status: "submitting"; intent: "pdf_download" | "review_requested" }
  | { status: "preparing_pdf" }
  | { status: "success"; intent: "pdf_download" | "review_requested"; reference: string; downloadToken: string }
  | { status: "error"; message: string };

export function ScopeTray({
  items,
  remove,
  clear,
  open,
  setOpen,
  activeArea,
}: {
  items: ScopeItem[];
  remove: (id: string) => void;
  clear: () => void;
  open: boolean;
  setOpen: (v: boolean) => void;
  activeArea: ScopeArea;
}) {
  const t = useTranslations("ScopeTray");
  const [client, setClient] = useState<ClientInfo>({
    name: "",
    email: "",
    phone: "",
    company: "",
    timeframe: "",
    context: "",
  });
  const [acknowledged, setAcknowledged] = useState(false);
  const [flow, setFlow] = useState<FlowState>({ status: "idle" });

  const ready = isClientReady(client);
  const canSubmit = ready && acknowledged && items.length > 0;

  const grouped = useMemo(
    () =>
      (["Cybersecurity", "Automation", "OR ONE"] as ScopeArea[])
        .map((area) => ({ area, items: items.filter((x) => x.area === area) }))
        .filter((x) => x.items.length),
    [items],
  );

  const update = (name: keyof ClientInfo, value: string) => setClient((s) => ({ ...s, [name]: value }));

  const handleDownload = async () => {
    if (!canSubmit) return;
    setFlow({ status: "submitting", intent: "pdf_download" });
    try {
      const { reference, downloadToken } = await submitScope("pdf_download", items, client);
      setFlow({ status: "preparing_pdf" });
      const blob = await pollForPdf(downloadToken, t("form.pdfTimeout"));
      triggerBrowserDownload(blob, reference);
      setFlow({ status: "success", intent: "pdf_download", reference, downloadToken });
      clear();
    } catch (err) {
      setFlow({ status: "error", message: err instanceof Error ? err.message : String(err) });
    }
  };

  const handleReviewSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setFlow({ status: "submitting", intent: "review_requested" });
    try {
      const { reference, downloadToken } = await submitScope("review_requested", items, client);
      setFlow({ status: "success", intent: "review_requested", reference, downloadToken });
      clear();
    } catch (err) {
      setFlow({ status: "error", message: err instanceof Error ? err.message : String(err) });
    }
  };

  // Section 1: "a review after a download creates a distinct review
  // event" — a fresh requestId is generated inside submitScope() on
  // every call, so a review submitted after an earlier download is
  // never mistaken by the server for a retry of that download.
  const handleDownloadCopyAfterReview = async () => {
    if (flow.status !== "success") return;
    try {
      const blob = await pollForPdf(flow.downloadToken, t("form.pdfTimeout"));
      triggerBrowserDownload(blob, flow.reference);
    } catch (err) {
      setFlow({ status: "error", message: err instanceof Error ? err.message : String(err) });
    }
  };

  const busy = flow.status === "submitting" || flow.status === "preparing_pdf";

  return (
    <>
      <button className="scope-launcher" onClick={() => setOpen(true)}>
        <span>{t("launcher")}</span>
        <b>{String(items.length).padStart(2, "0")}</b>
      </button>
      {open && <div className="scope-scrim" onClick={() => setOpen(false)} />}
      <aside className={open ? "scope-tray open" : "scope-tray"} aria-hidden={!open}>
        <div className="scope-or" aria-hidden="true">
          OR
        </div>
        <header>
          <div>
            <span>{t("headerLabel")}</span>
            <strong>
              {String(items.length).padStart(2, "0")} {t("selectedSuffix")}
            </strong>
          </div>
          <button onClick={() => setOpen(false)} aria-label={t("closeAriaLabel")}>
            ×
          </button>
        </header>
        <div className="scope-rail">
          {(["Cybersecurity", "Automation", "OR ONE"] as ScopeArea[]).map((a, i) => (
            <span className={a === activeArea ? "current" : ""} key={a}>
              {i > 0 && <i />}
              {t(`areas.${a}`)}
            </span>
          ))}
        </div>
        <div className="scope-body">
          {flow.status === "success" ? (
            // Checked before the items.length branch below: items is
            // cleared on a successful download/submit (see clear() calls
            // in handleDownload/handleReviewSubmit), so this confirmation
            // must not depend on items still being present to render.
            <div className="scope-confirmation-block">
              <p className="scope-confirmation">
                {flow.intent === "pdf_download"
                  ? t("confirmation.pdfDownloaded", { reference: flow.reference })
                  : t("confirmation.reviewReceived", { reference: flow.reference })}
              </p>
              {flow.intent === "review_requested" && (
                <button type="button" className="scope-download-copy" onClick={handleDownloadCopyAfterReview}>
                  {t("confirmation.downloadCopy")}
                </button>
              )}
            </div>
          ) : items.length === 0 ? (
            <div className="scope-empty">
              <span>{t("empty.label")}</span>
              <h3>{t("empty.heading")}</h3>
              <p>{t("empty.body")}</p>
            </div>
          ) : (
            <>
              <section className="scope-summary">
                <span>{t("summary.label")}</span>
                <h3>{t("summary.heading")}</h3>
                <p>{t("summary.body")}</p>
              </section>
              {grouped.map((group) => (
                <section className="scope-group" key={group.area}>
                  <h4>{t(`areas.${group.area}`)}</h4>
                  {group.items.map((item) => (
                    <article key={item.id}>
                      <span>{item.code}</span>
                      <div>
                        <b>{item.title}</b>
                        <small>{item.commercial || item.detail}</small>
                      </div>
                      <button onClick={() => remove(item.id)} disabled={busy}>
                        {t("removeButton")}
                      </button>
                    </article>
                  ))}
                </section>
              ))}

              <form onSubmit={handleReviewSubmit}>
                <label>
                  {t("form.priorityLabel")}
                  <textarea
                    value={client.context}
                    onChange={(e) => update("context", e.target.value)}
                    placeholder={t("form.priorityPlaceholder")}
                    disabled={busy}
                  />
                </label>
                <div>
                  <label>
                    {t("form.nameLabel")}
                    <input required value={client.name} onChange={(e) => update("name", e.target.value)} disabled={busy} />
                  </label>
                  <label>
                    {t("form.emailLabel")}
                    <input
                      required
                      type="email"
                      value={client.email}
                      onChange={(e) => update("email", e.target.value)}
                      disabled={busy}
                    />
                  </label>
                </div>
                <label>
                  {t("form.phoneLabel")}
                  <input required type="tel" value={client.phone} onChange={(e) => update("phone", e.target.value)} disabled={busy} />
                </label>
                <label>
                  {t("form.companyLabel")}
                  <input required value={client.company} onChange={(e) => update("company", e.target.value)} disabled={busy} />
                </label>
                <label>
                  {t("form.timeframeLabel")} <small>{t("form.optionalSuffix")}</small>
                  <select value={client.timeframe} onChange={(e) => update("timeframe", e.target.value)} disabled={busy}>
                    <option value="">{t("form.timeframeNotSpecified")}</option>
                    <option>{t("form.timeframe30Days")}</option>
                    <option>{t("form.timeframe1to3")}</option>
                    <option>{t("form.timeframe3to6")}</option>
                    <option>{t("form.timeframeExploring")}</option>
                  </select>
                </label>
                <p className="scope-disclosure">{t("form.disclosure")}</p>
                <label className="scope-consent">
                  <input
                    required
                    type="checkbox"
                    checked={acknowledged}
                    onChange={(e) => setAcknowledged(e.target.checked)}
                    disabled={busy}
                  />{" "}
                  {t("form.consentLabel")}
                </label>

                {flow.status === "error" && <p className="scope-error">{flow.message}</p>}

                <div className="scope-actions">
                  <button className="scope-download" type="button" disabled={!canSubmit || busy} onClick={handleDownload}>
                    {flow.status === "submitting" && flow.intent === "pdf_download"
                      ? t("form.submittingLabel")
                      : flow.status === "preparing_pdf"
                        ? t("form.preparingPdfLabel")
                        : t("form.downloadButton")}
                  </button>
                  <button className="scope-submit" type="submit" disabled={!canSubmit || busy}>
                    {flow.status === "submitting" && flow.intent === "review_requested"
                      ? t("form.submittingLabel")
                      : t("form.submitButton")}{" "}
                    <span aria-hidden="true">↗</span>
                  </button>
                </div>
                {!ready && items.length > 0 && (
                  <small className="scope-download-hint">
                    {t("form.readyHint")}
                  </small>
                )}
              </form>
            </>
          )}
        </div>
        <footer>
          <button onClick={() => setOpen(false)}>{t("continueBrowsing")}</button>
        </footer>
      </aside>
    </>
  );
}
