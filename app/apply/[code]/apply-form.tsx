"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { BrandLogo } from "../brand-logo";
import { ThemeToggle } from "../theme-toggle";
import {
  MAX_FLAGS_BEFORE_WARNING, NONE_TEXT, canDiscuss, capsFor, catalogueReady, expand, firstIncomplete, isRequired, isVisible, optionsOf,
  pickedCategories, pickedItems, pickedPoints, tierEstimate, validatePage,
} from "../../lib/apply/engine";
import type { Ctx } from "../../lib/apply/engine";
import type { Answers, Catalogue, Field, Flags, FormDefinition } from "../../lib/apply/types";

type SaveState = { kind: "idle" } | { kind: "saving" } | { kind: "saved"; at: string } | { kind: "error" };
type Phase = { kind: "form" } | { kind: "done"; reference: string; meetings: number } | { kind: "closed"; reason: "gone" | "submitted" };

const timeNow = () => new Date().toLocaleTimeString("en-CA", { hour: "2-digit", minute: "2-digit", hour12: false });

export function ApplyForm({ code, token, form, catalogue, reference, expiresAt, lastPage, initialAnswers, initialFlags }: {
  code: string; token: string; form: FormDefinition; catalogue: Catalogue; reference: string; expiresAt: string | null; lastPage: number;
  initialAnswers: Answers; initialFlags: Flags;
}) {
  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  const [flags, setFlags] = useState<Flags>(initialFlags);
  const [attempted, setAttempted] = useState<Record<string, boolean>>({});
  const [save, setSave] = useState<SaveState>({ kind: "idle" });
  const [phase, setPhase] = useState<Phase>({ kind: "form" });
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState("");

  const ctx: Ctx = useMemo(() => ({ answers, flags, catalogue }), [answers, flags, catalogue]);
  const pages = useMemo(() => expand(form, catalogue, answers), [form, catalogue, answers]);
  const firstBad = firstIncomplete(pages, ctx);
  const reach = firstBad === -1 ? pages.length - 1 : firstBad;

  const [pageId, setPageId] = useState<string>(() => {
    const first = expand(form, catalogue, initialAnswers);
    const bad = firstIncomplete(first, { answers: initialAnswers, flags: initialFlags, catalogue });
    const limit = bad === -1 ? first.length - 1 : bad;
    return first[Math.max(0, Math.min(lastPage - 1, limit))]?.id ?? first[0]!.id;
  });
  const index = Math.max(0, pages.findIndex((p) => p.id === pageId));
  const page = pages[index]!;
  const isLast = index === pages.length - 1;
  const errors = validatePage(page, ctx);
  const showErrors = attempted[page.id] === true;
  const flagCount = Object.entries(flags).filter(([id, on]) => on && pages.some((p) => p.fields.some((f) => f.id === id && canDiscuss(f, ctx)))).length;

  const heading = useRef<HTMLHeadingElement | null>(null);

  // ---------------------------------------------------------------- saving as you go

  const latest = useRef({ answers, flags, index });
  useEffect(() => { latest.current = { answers, flags, index }; });
  const dirty = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const post = useCallback(async (action: "save" | "submit", extra: object = {}) => {
    const { answers: a, flags: f, index: i } = latest.current;
    const response = await fetch(`/api/apply/${action}`, {
      method: "POST", headers: { "content-type": "application/json" }, cache: "no-store", keepalive: action === "save",
      body: JSON.stringify({ code, form: form.id, token, answers: a, flags: f, page: i + 1, ...extra }),
    });
    const body = (await response.json().catch(() => ({}))) as Record<string, unknown>;
    return { status: response.status, body };
  }, [code, form.id, token]);

  const flush = useCallback(async () => {
    if (timer.current) { clearTimeout(timer.current); timer.current = null; }
    if (!dirty.current) return true;
    dirty.current = false;
    setSave({ kind: "saving" });
    try {
      const r = await post("save");
      if (r.status === 200) { setSave({ kind: "saved", at: timeNow() }); return true; }
      if (r.status === 404) setPhase({ kind: "closed", reason: "gone" });
      else if (r.status === 409) setPhase({ kind: "closed", reason: "submitted" });
      else { dirty.current = true; setSave({ kind: "error" }); }
    } catch { dirty.current = true; setSave({ kind: "error" }); }
    return false;
  }, [post]);

  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) { mounted.current = true; return; }
    dirty.current = true;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => { void flush(); }, 1200);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [answers, flags, flush]);
  useEffect(() => {
    const onHide = () => { if (document.visibilityState === "hidden") void flush(); };
    document.addEventListener("visibilitychange", onHide);
    return () => document.removeEventListener("visibilitychange", onHide);
  }, [flush]);

  // ---------------------------------------------------------------- moving between pages

  const go = useCallback(async (id: string) => {
    setNotice("");
    setPageId(id);
    // The save runs before the next render, so tell it the page being opened (it also records how far the client got).
    latest.current = { ...latest.current, index: Math.max(0, pages.findIndex((p) => p.id === id)) };
    dirty.current = true;
    await flush();
    window.scrollTo({ top: 0 });
    requestAnimationFrame(() => heading.current?.focus());
  }, [flush, pages]);

  const focusFirstError = (errs: Record<string, string>) => {
    const id = page.fields.find((f) => errs[f.id])?.id;
    if (id) document.querySelector<HTMLElement>(`[data-field="${CSS.escape(id)}"] :is(input,select,textarea,button)`)?.focus();
  };

  const next = async () => {
    const errs = validatePage(page, ctx);
    if (Object.keys(errs).length) {
      setAttempted((a) => ({ ...a, [page.id]: true }));
      setNotice(`Please complete the ${Object.keys(errs).length === 1 ? "field" : `${Object.keys(errs).length} fields`} marked below to continue.`);
      requestAnimationFrame(() => focusFirstError(errs));
      return;
    }
    await go(pages[index + 1]!.id);
  };

  const submit = async () => {
    const errs = validatePage(page, ctx);
    if (Object.keys(errs).length) {
      setAttempted((a) => ({ ...a, [page.id]: true }));
      setNotice("Please complete every box and the signature to submit.");
      requestAnimationFrame(() => focusFirstError(errs));
      return;
    }
    const bad = firstIncomplete(pages, ctx);
    if (bad >= 0) {
      setAttempted((a) => ({ ...a, [pages[bad]!.id]: true }));
      setNotice(`Page "${pages[bad]!.title}" still needs an answer before you can submit.`);
      await go(pages[bad]!.id);
      return;
    }
    setSubmitting(true); setNotice("");
    try {
      await flush();
      const r = await post("submit");
      if (r.status === 200) { setPhase({ kind: "done", reference: String(r.body.reference ?? reference), meetings: Number(r.body.meetings ?? 0) }); window.scrollTo({ top: 0 }); return; }
      if (r.status === 404) { setPhase({ kind: "closed", reason: "gone" }); return; }
      if (r.status === 409) { setPhase({ kind: "closed", reason: "submitted" }); return; }
      if (r.status === 422) {
        const at = Number(r.body.pageIndex);
        const target = pages[Number.isInteger(at) && at >= 0 ? Math.min(at, pages.length - 1) : pages.length - 1]!;
        setAttempted((a) => ({ ...a, [target.id]: true }));
        setNotice("Something still needs an answer before you can submit.");
        await go(target.id);
        return;
      }
      setNotice(r.status === 429 ? "Too many attempts. Please wait a few minutes and try again." : "We could not submit right now. Your answers are saved. Please try again in a moment.");
    } catch { setNotice("We could not reach the server. Your answers are saved. Please check your connection and try again."); }
    finally { setSubmitting(false); }
  };

  const setValue = (id: string, value: unknown) => setAnswers((a) => ({ ...a, [id]: value }));
  const setFlag = (id: string, on: boolean) => setFlags((f) => ({ ...f, [id]: on }));

  // ---------------------------------------------------------------- screens

  if (phase.kind === "done") {
    return (
      <div className="ap-shell">
        <Header reference={phase.reference} />
        <main className="ap-card ap-thanks" id="main">
          <h1 className="ap-h1" tabIndex={-1} ref={heading}>Thank you. Your form has been submitted.</h1>
          <p>Your reference is <strong>{phase.reference}</strong>. Your answers are now locked. If something needs to change, reply to the email we sent you and we will record it as a new, dated version.</p>
          {phase.meetings > 0 && <p>You marked {phase.meetings} {phase.meetings === 1 ? "item" : "items"} for a meeting. We will email you to confirm a time, and your proposal waits on those items until we have talked.</p>}
          <h2 className="ap-h2">What happens next</h2>
          <ol className="ap-next">{form.whatNext.map((s) => <li key={s}>{s}</li>)}</ol>
          <p className="ap-muted">You can close this page.</p>
        </main>
      </div>
    );
  }
  if (phase.kind === "closed") {
    return (
      <main className="ap-shell ap-center">
        <BrandLogo />
        <h1 className="ap-h1">{phase.reason === "submitted" ? "This form has already been submitted" : "This link is no longer active"}</h1>
        <p className="ap-muted">{phase.reason === "submitted" ? "Your answers are locked. We will be in touch about the next step." : "Please contact the person at ORAGROL who sent it to you."}</p>
      </main>
    );
  }

  const groups: { group: string | null; fields: Field[] }[] = [];
  for (const f of page.fields) {
    if (!isVisible(f, ctx)) continue;
    const g = f.group ?? null;
    if (!groups.length || groups[groups.length - 1]!.group !== g) groups.push({ group: g, fields: [] });
    groups[groups.length - 1]!.fields.push(f);
  }
  const errorCount = Object.keys(errors).length;

  return (
    <div className="ap-shell">
      <Header reference={reference} />
      <div className="ap-progress" role="group" aria-label="Progress">
        <p className="ap-step-label">Page {index + 1} of {pages.length}<span> · {page.title}</span></p>
        <div className="ap-bar" aria-hidden="true"><i style={{ width: `${((index + 1) / pages.length) * 100}%` }} /></div>
        <ol className="ap-steps">
          {pages.map((p, i) => (
            <li key={p.id}>
              <button type="button" className="ap-dot" disabled={i > reach} aria-current={i === index ? "step" : undefined}
                onClick={() => void go(p.id)} title={p.title}>
                <span aria-hidden="true">{i + 1}</span><span className="ap-sr">{p.title}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>

      <main className="ap-card" id="main">
        <h1 className="ap-h1" tabIndex={-1} ref={heading}>{page.title}</h1>
        {page.intro && <p className="ap-muted ap-intro">{page.intro}</p>}
        {page.body?.map((paragraph) => <p key={paragraph} className="ap-intro">{paragraph}</p>)}
        {page.terms && (
          <details className="ap-terms">
            <summary>Terms and privacy notice</summary>
            <ol>{page.terms.map((t) => <li key={t.title}><strong>{t.title.replace(/^\d+\.\s*/, "")}</strong> {t.text}</li>)}</ol>
          </details>
        )}
        <p className="ap-legend"><span className="ap-star" aria-hidden="true">*</span> Compulsory. Everything else is optional. {index === 0 && expiresAt ? <>Your answers are saved as you go; use the same link to come back until {new Date(expiresAt).toLocaleDateString("en-CA", { day: "numeric", month: "long", year: "numeric", timeZone: "America/Toronto" })}.</> : null}</p>

        {flagCount > 0 && (
          <p className={`ap-flagbar${flagCount > MAX_FLAGS_BEFORE_WARNING ? " ap-flagbar-warn" : ""}`} role="status">
            {flagCount} {flagCount === 1 ? "item is" : "items are"} marked for a meeting.{flagCount > MAX_FLAGS_BEFORE_WARNING ? " More than 5 means your proposal will take longer." : ""}
          </p>
        )}
        {notice && <p className="ap-notice" role="alert">{notice}</p>}
        {showErrors && errorCount > 0 && !notice && <p className="ap-notice" role="alert">{errorCount === 1 ? "One field needs an answer." : `${errorCount} fields need an answer.`}</p>}

        <form onSubmit={(e) => { e.preventDefault(); void (isLast ? submit() : next()); }} noValidate>
          {groups.map((g, gi) => (
            <section key={`${g.group ?? "_"}-${gi}`} className="ap-group" aria-label={g.group ?? undefined}>
              {g.group && <h2 className="ap-h2">{g.group}</h2>}
              {g.fields.map((f) => (
                <FieldView key={f.id} field={f} ctx={ctx} form={form} error={showErrors ? errors[f.id] ?? null : null}
                  value={answers[f.id]} flagged={flags[f.id] === true}
                  onChange={(v) => setValue(f.id, v)} onFlag={(on) => setFlag(f.id, on)} />
              ))}
            </section>
          ))}

          <div className="ap-actions">
            <button type="button" className="ap-btn ap-btn-quiet" disabled={index === 0 || submitting} onClick={() => void go(pages[index - 1]!.id)}>Back</button>
            <span className="ap-save" role="status" aria-live="polite">
              {save.kind === "saving" ? "Saving…" : save.kind === "saved" ? `Saved at ${save.at}` : save.kind === "error" ? "Not saved yet. Check your connection; we will retry." : "Saved as you go"}
            </span>
            {isLast
              ? <button type="submit" className="ap-btn ap-btn-primary" disabled={submitting} aria-busy={submitting}>{submitting ? "Submitting…" : "Submit"}</button>
              : <button type="submit" className="ap-btn ap-btn-primary">Next</button>}
          </div>
        </form>
      </main>
      <p className="ap-foot">ORAGROL GLOBAL · This page is private to you. Please do not share the link.<br />This form was prepared with the help of AI. Mistakes are possible: please check your answers and tell us if anything looks wrong.</p>
    </div>
  );
}

function Header({ reference }: { reference: string }) {
  return (
    <header className="ap-head">
      <BrandLogo />
      <span className="ap-ref">Private form{reference ? ` · ${reference}` : ""}</span>
      <ThemeToggle />
    </header>
  );
}

// -------------------------------------------------------------------- one field

function FieldView({ field: f, ctx, form, error, value, flagged, onChange, onFlag }: {
  field: Field; ctx: Ctx; form: FormDefinition; error: string | null; value: unknown; flagged: boolean;
  onChange: (v: unknown) => void; onFlag: (on: boolean) => void;
}) {
  const required = isRequired(f, ctx);
  const id = `f-${f.id.replace(/[^a-z0-9]/gi, "-")}`;
  const described = [f.help ? `${id}-help` : "", error ? `${id}-err` : ""].filter(Boolean).join(" ") || undefined;
  const common = { id, "aria-invalid": error ? true : undefined, "aria-describedby": described, "aria-required": required || undefined } as const;
  const text = typeof value === "string" ? value : "";
  const isNone = text === NONE_TEXT;

  let control: ReactNode;
  switch (f.kind) {
    case "text": case "email": case "phone": case "url": case "typed":
      control = <input {...common} className={f.kind === "typed" ? "ap-input ap-signature" : "ap-input"} type={f.kind === "email" ? "email" : f.kind === "phone" ? "tel" : "text"}
        inputMode={f.kind === "url" ? "url" : undefined} autoComplete="off" maxLength={capsFor(f).chars} placeholder={f.placeholder}
        disabled={isNone} value={isNone ? "" : text} onChange={(e) => onChange(e.target.value)} />;
      break;
    case "number":
      control = <input {...common} className="ap-input ap-input-short" type="text" inputMode="decimal" autoComplete="off" maxLength={14} value={text} onChange={(e) => onChange(e.target.value)} />;
      break;
    case "date":
      control = <input {...common} className="ap-input ap-input-short" type="date" value={text} onChange={(e) => onChange(e.target.value)} />;
      break;
    case "longtext":
      control = <textarea {...common} className="ap-input ap-area" rows={4} maxLength={capsFor(f).chars} disabled={isNone} value={isNone ? "" : text} onChange={(e) => onChange(e.target.value)} />;
      break;
    case "select": case "yesno": {
      const options = optionsOf(f);
      control = f.choice || f.kind === "yesno"
        ? <div className="ap-choices" role="radiogroup" aria-labelledby={`${id}-label`}>{options.map((o) =>
            <label key={o} className="ap-choice"><input type="radio" name={id} checked={value === o} onChange={() => onChange(o)} /><span>{o}</span></label>)}</div>
        : <select {...common} className="ap-input" value={text} onChange={(e) => onChange(e.target.value)}><option value="">Choose…</option>{options.map((o) => <option key={o}>{o}</option>)}</select>;
      break;
    }
    case "multiselect": {
      const picked = Array.isArray(value) ? (value as string[]) : [];
      control = <div className="ap-choices ap-choices-grid">{optionsOf(f).map((o) =>
        <label key={o} className="ap-choice"><input type="checkbox" checked={picked.includes(o)} onChange={(e) => onChange(e.target.checked ? [...picked, o] : picked.filter((x) => x !== o))} /><span>{o}</span></label>)}</div>;
      break;
    }
    case "check":
      control = <label className="ap-choice ap-legal"><input type="checkbox" id={id} aria-invalid={error ? true : undefined} aria-describedby={described} checked={value === true} onChange={(e) => onChange(e.target.checked)} /><span>{f.text && f.text !== f.label ? <><strong>{f.label.replace(/^\d+\.\s*/, "")}</strong> {f.text}</> : (f.text ?? f.label)}{required && <span className="ap-star" aria-hidden="true"> *</span>}</span></label>;
      break;
    case "autodate":
      control = <p className="ap-static"><span suppressHydrationWarning>{new Date().toLocaleDateString("en-CA", { day: "numeric", month: "long", year: "numeric" })}</span> <span className="ap-muted">(recorded when you submit)</span></p>;
      break;
    case "copy":
      control = <p className="ap-static">{typeof ctx.answers[f.copyFrom ?? ""] === "string" ? (ctx.answers[f.copyFrom ?? ""] as string) : "–"}</p>;
      break;
    case "people":
      control = <People field={f} value={value} onChange={onChange} invalid={Boolean(error)} id={id} />;
      break;
    case "items":
      control = <ItemsPicker form={form} ctx={ctx} value={value} onChange={onChange} />;
      break;
  }

  const labelled = f.kind !== "check";
  return (
    <div className={`ap-field${error ? " ap-field-bad" : ""}`} data-field={f.id}>
      {labelled && (
        <label id={`${id}-label`} htmlFor={f.kind === "select" && !f.choice ? id : (["text", "email", "phone", "url", "typed", "number", "date", "longtext"] as string[]).includes(f.kind) ? id : undefined} className="ap-label">
          {f.label}{required && <span className="ap-star" aria-hidden="true"> *</span>}{required && <span className="ap-sr"> (compulsory)</span>}
        </label>
      )}
      {f.help && <p className="ap-help" id={`${id}-help`}>{f.help}</p>}
      {control}
      {f.allowNone && (f.kind === "text" || f.kind === "longtext") && (
        <label className="ap-choice ap-none"><input type="checkbox" checked={isNone} onChange={(e) => onChange(e.target.checked ? NONE_TEXT : "")} /><span>{NONE_TEXT}</span></label>
      )}
      {canDiscuss(f, ctx) && (
        <label className="ap-choice ap-discuss"><input type="checkbox" checked={flagged} onChange={(e) => onFlag(e.target.checked)} /><span>I need to discuss this in a meeting</span></label>
      )}
      {error && <p className="ap-err" id={`${id}-err`}>{error}</p>}
    </div>
  );
}

// -------------------------------------------------------------------- the list of people

function People({ field: f, value, onChange, invalid, id }: { field: Field; value: unknown; onChange: (v: unknown) => void; invalid: boolean; id: string }) {
  const rows = (Array.isArray(value) ? value : []) as Record<string, string>[];
  const cols = f.columns ?? [];
  const max = f.max ?? 10;
  const set = (i: number, col: string, v: string) => onChange(rows.map((r, j) => (j === i ? { ...r, [col]: v } : r)));
  return (
    <div className="ap-people" aria-invalid={invalid || undefined}>
      {rows.map((row, i) => (
        <fieldset key={i} className="ap-person">
          <legend>Person {i + 1}</legend>
          {cols.map((c) => (
            <label key={c.id} className="ap-person-col"><span>{c.label}</span>
              <input className="ap-input" type={c.kind === "email" ? "email" : c.kind === "phone" ? "tel" : "text"} maxLength={c.kind === "email" ? 254 : 120} autoComplete="off" value={row[c.id] ?? ""} onChange={(e) => set(i, c.id, e.target.value)} />
            </label>
          ))}
          <button type="button" className="ap-btn ap-btn-quiet ap-small" onClick={() => onChange(rows.filter((_, j) => j !== i))}>Remove</button>
        </fieldset>
      ))}
      {rows.length < max && <button type="button" id={id} className="ap-btn ap-btn-quiet ap-small" onClick={() => onChange([...rows, Object.fromEntries(cols.map((c) => [c.id, ""]))])}>+ Add a person</button>}
    </div>
  );
}

// -------------------------------------------------------------------- the item picker

function ItemsPicker({ form, ctx, value, onChange }: { form: FormDefinition; ctx: Ctx; value: unknown; onChange: (v: unknown) => void }) {
  const picked = Array.isArray(value) ? (value as string[]) : [];
  const { catalogue } = ctx;
  if (!catalogueReady(catalogue)) {
    return <p className="ap-static ap-muted">The list of items is not published yet. We will contact you when it is.</p>;
  }
  const points = pickedPoints(ctx.answers, catalogue);
  const tier = tierEstimate(form, ctx.answers, catalogue);
  const count = pickedItems(ctx.answers, catalogue).length;
  const shown = pickedCategories(ctx.answers, catalogue).filter((c) => c.items.length);
  if (shown.length === 0) return <p className="ap-static ap-muted">Tick at least one category above to see its items.</p>;
  return (
    <div className="ap-items">
      <p className="ap-tier" role="status" aria-live="polite">
        {count === 0 ? "No items chosen yet." : <>{count} {count === 1 ? "item" : "items"} · <strong>{points} points</strong> · estimated plan: <strong>{tier === "Signature" ? "Signature (we will contact you)" : tier}</strong></>}
      </p>
      {shown.map((c) => (
        <fieldset key={c.id} className="ap-cat">
          <legend>{c.name}</legend>
          {c.items.map((item) => (
            <label key={item.id} className="ap-item">
              <input type="checkbox" checked={picked.includes(item.id)} onChange={(e) => onChange(e.target.checked ? [...picked, item.id] : picked.filter((x) => x !== item.id))} />
              <span><strong>{item.name}</strong> <em>{item.points} points</em><small>{item.whatItDoes}</small></span>
            </label>
          ))}
        </fieldset>
      ))}
    </div>
  );
}
