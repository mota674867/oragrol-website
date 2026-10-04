"use client";

// Outbound research tool — Mohammad's private page. Reached only by typing
// the admin passcode into the scan page's name box (no link to it anywhere).
// The passcode travels in the URL fragment (#…), which browsers never send to
// a server or write to logs. Without a valid one this page looks exactly like
// a normal 404, so it gives nothing away. Standalone: no site nav/footer
// (see site-chrome.tsx). Escape (or the × button) returns to the home page.

import { useEffect, useState } from "react";

type Phase = "checking" | "denied" | "ready";
type Past = { company: string; website: string; domain: string; lastRunAt: string; runs: number };

const domainOf = (w: string) => w.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").split(/[/?#]/)[0];
// Hard navigation on purpose: leaves the private page (and its #passcode) completely.
// eslint-disable-next-line @next/next/no-location-assign-relative-destination
const goHome = () => window.location.assign("/");
const fmt = (iso: string) => new Date(iso).toLocaleString();

export default function OutboundTool() {
  const [phase, setPhase] = useState<Phase>("checking");
  const [key, setKey] = useState("");
  const [company, setCompany] = useState("");
  const [website, setWebsite] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState("");
  const [past, setPast] = useState<Past[]>([]);
  const [confirmDup, setConfirmDup] = useState<Past | null>(null);

  // Escape → home page.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") goHome(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    async function verify() {
      const k = decodeURIComponent(window.location.hash.replace(/^#/, ""));
      if (!k) { setPhase("denied"); return; }
      try {
        const r = await fetch("/api/odo/admin/outbound-auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ passcode: k }) });
        const d = (await r.json()) as { ok?: boolean };
        if (d.ok) { setKey(k); setPhase("ready"); void loadPast(k); } else setPhase("denied");
      } catch {
        setPhase("denied");
      }
    }
    void verify();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadPast(k = key) {
    try {
      const res = await fetch(`/api/odo/admin/outbound?key=${encodeURIComponent(k)}&list=1`);
      if (res.ok) setPast(((await res.json()) as { companies?: Past[] }).companies ?? []);
    } catch { /* the list is a convenience */ }
  }

  async function start() {
    setBusy(true); setMessage(""); setHistory(""); setConfirmDup(null);
    try {
      const res = await fetch(`/api/odo/admin/outbound?key=${encodeURIComponent(key)}`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ company, website }),
      });
      const data = (await res.json()) as { message?: string };
      setMessage(data.message ?? (res.ok ? "Started." : "Something went wrong."));
      if (res.ok) setTimeout(() => void loadPast(), 150000);
    } catch {
      setMessage("Could not reach the server.");
    }
    setBusy(false);
  }

  function run(event: React.FormEvent) {
    event.preventDefault();
    const before = past.find((p) => p.domain === domainOf(website));
    if (before && !confirmDup) { setConfirmDup(before); return; }
    void start();
  }

  async function check() {
    if (!website) { setHistory("Enter the website first."); return; }
    try {
      const res = await fetch(`/api/odo/admin/outbound?key=${encodeURIComponent(key)}&website=${encodeURIComponent(website)}`);
      if (!res.ok) { setHistory("Could not read history right now."); return; }
      const data = (await res.json()) as { runs?: number; dossiers?: Array<{ runAt: string }> };
      setHistory(data.runs ? `${data.runs} run(s) on file. Latest: ${fmt(data.dossiers![0].runAt)}` : "No runs on file for that website yet.");
    } catch {
      setHistory("Could not read history right now.");
    }
  }

  const page: React.CSSProperties = { minHeight: "100vh", background: "#f6f3ee", color: "#1a1a1a", fontFamily: "system-ui, sans-serif", position: "relative" };

  if (phase === "checking") return <main style={page} />;
  if (phase === "denied") {
    return (
      <main style={{ ...page, display: "grid", placeItems: "center" }}>
        <p><b>404</b> &nbsp;|&nbsp; This page could not be found.</p>
      </main>
    );
  }

  const input: React.CSSProperties = { width: "100%", padding: "12px 14px", marginTop: 6, border: "1px solid #888", borderRadius: 6, fontSize: 16, background: "#fff", color: "#111", boxSizing: "border-box" };
  const btn: React.CSSProperties = { padding: "12px 20px", borderRadius: 6, fontSize: 16, cursor: "pointer" };
  return (
    <main style={page}>
      <button type="button" aria-label="Close (Esc)" title="Close (Esc)" onClick={goHome} style={{ position: "absolute", top: 16, right: 20, background: "none", border: 0, fontSize: 28, lineHeight: 1, cursor: "pointer", color: "#444" }}>×</button>
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "72px 20px 60px" }}>
        <h1 style={{ fontSize: 26, marginBottom: 6, color: "#1a1a1a" }}>Outbound research</h1>
        <p style={{ marginBottom: 24, color: "#444" }}>Enter a company and its website. ODO researches public information only, then emails you the report (Word + PDF attached) in 1–2 minutes. Press Esc to leave.</p>
        <form onSubmit={run}>
          <label style={{ display: "block", color: "#1a1a1a" }}>Company name<input style={input} value={company} onChange={(e) => { setCompany(e.target.value); setConfirmDup(null); }} required /></label>
          <label style={{ display: "block", marginTop: 16, color: "#1a1a1a" }}>Website<input style={input} value={website} onChange={(e) => { setWebsite(e.target.value); setConfirmDup(null); }} placeholder="https://example.com" required /></label>
          {confirmDup ? (
            <div style={{ marginTop: 16, padding: 14, background: "#fff4e5", border: "1px solid #db5227", borderRadius: 6, color: "#1a1a1a" }}>
              <b>Researched before.</b> {confirmDup.company} was done {confirmDup.runs} time{confirmDup.runs === 1 ? "" : "s"}, last on {fmt(confirmDup.lastRunAt)}. Do it again? (A re-run also shows what changed.)
              <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
                <button type="submit" style={{ ...btn, background: "#db5227", color: "#fff", border: 0 }}>Yes, run again</button>
                <button type="button" onClick={() => setConfirmDup(null)} style={{ ...btn, background: "#fff", color: "#111", border: "1px solid #888" }}>Cancel</button>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
              <button type="submit" disabled={busy} style={{ ...btn, background: "#111", color: "#fff", border: 0 }}>{busy ? "Starting…" : "Run research"}</button>
              <button type="button" onClick={check} style={{ ...btn, background: "#fff", color: "#111", border: "1px solid #111" }}>Check history</button>
            </div>
          )}
        </form>
        {message ? <p style={{ marginTop: 20, color: "#1a1a1a" }}>{message}</p> : null}
        {history ? <p style={{ marginTop: 12, color: "#444" }}>{history}</p> : null}
        {past.length ? (
          <section style={{ marginTop: 36 }}>
            <h2 style={{ fontSize: 16, marginBottom: 8, color: "#1a1a1a" }}>Researched before</h2>
            {past.map((c) => (
              <div key={c.domain} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "8px 0", borderTop: "1px solid #ddd", color: "#1a1a1a" }}>
                <button type="button" onClick={() => { setCompany(c.company); setWebsite(c.website); setConfirmDup(null); }} style={{ background: "none", border: 0, padding: 0, textAlign: "left", cursor: "pointer", color: "#1a1a1a", fontSize: 15 }}>
                  <b>{c.company}</b> <span style={{ color: "#555" }}>{c.domain}</span>
                  <div style={{ fontSize: 13, color: "#666" }}>{c.runs} run{c.runs === 1 ? "" : "s"} · last {fmt(c.lastRunAt)}</div>
                </button>
              </div>
            ))}
          </section>
        ) : null}
      </div>
    </main>
  );
}
