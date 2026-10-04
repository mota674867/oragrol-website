"use client";

// Outbound research tool — Mohammad's private page. Reached only by typing
// the admin passcode into the scan page's name box (no link to it anywhere).
// The passcode travels in the URL fragment (#…), which browsers never send to
// a server or write to logs. Without a valid one this page looks exactly like
// a normal 404, so it gives nothing away.

import { useEffect, useState } from "react";

type Phase = "checking" | "denied" | "ready";

export default function OutboundTool() {
  const [phase, setPhase] = useState<Phase>("checking");
  const [key, setKey] = useState("");
  const [company, setCompany] = useState("");
  const [website, setWebsite] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState("");

  useEffect(() => {
    async function verify() {
      const k = decodeURIComponent(window.location.hash.replace(/^#/, ""));
      if (!k) { setPhase("denied"); return; }
      try {
        const r = await fetch(`/api/odo/admin/outbound?key=${encodeURIComponent(k)}&website=probe`);
        if (r.ok) { setKey(k); setPhase("ready"); } else setPhase("denied");
      } catch {
        setPhase("denied");
      }
    }
    void verify();
  }, []);

  async function run(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true); setMessage(""); setHistory("");
    try {
      const res = await fetch(`/api/odo/admin/outbound?key=${encodeURIComponent(key)}`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ company, website }),
      });
      const data = (await res.json()) as { message?: string };
      setMessage(data.message ?? (res.ok ? "Started." : "Something went wrong."));
    } catch {
      setMessage("Could not reach the server.");
    }
    setBusy(false);
  }

  async function check() {
    if (!website) { setHistory("Enter the website first."); return; }
    const res = await fetch(`/api/odo/admin/outbound?key=${encodeURIComponent(key)}&website=${encodeURIComponent(website)}`);
    const data = (await res.json()) as { runs?: number; dossiers?: Array<{ runAt: string }> };
    setHistory(data.runs ? `${data.runs} run(s) on file. Latest: ${new Date(data.dossiers![0].runAt).toLocaleString()}` : "No runs on file for that website yet.");
  }

  if (phase === "checking") return <main style={{ minHeight: "60vh" }} />;
  if (phase === "denied") {
    return (
      <main style={{ minHeight: "60vh", display: "grid", placeItems: "center", fontFamily: "system-ui, sans-serif" }}>
        <p><b>404</b> &nbsp;|&nbsp; This page could not be found.</p>
      </main>
    );
  }

  const input: React.CSSProperties = { width: "100%", padding: "12px 14px", marginTop: 6, border: "1px solid #888", borderRadius: 6, fontSize: 16, background: "#fff", color: "#111" };
  return (
    <main style={{ maxWidth: 520, margin: "80px auto", padding: "0 20px", fontFamily: "system-ui, sans-serif", color: "#111" }}>
      <h1 style={{ fontSize: 26, marginBottom: 6 }}>Outbound research</h1>
      <p style={{ marginBottom: 24, color: "#444" }}>Enter a company and its website. ODO researches public information only, then emails you the dossier in 1–2 minutes.</p>
      <form onSubmit={run}>
        <label>Company name<input style={input} value={company} onChange={(e) => setCompany(e.target.value)} required /></label>
        <label style={{ display: "block", marginTop: 16 }}>Website<input style={input} value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://example.com" required /></label>
        <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
          <button type="submit" disabled={busy} style={{ padding: "12px 20px", background: "#111", color: "#fff", border: 0, borderRadius: 6, fontSize: 16, cursor: "pointer" }}>{busy ? "Starting…" : "Run research"}</button>
          <button type="button" onClick={check} style={{ padding: "12px 20px", background: "#fff", color: "#111", border: "1px solid #111", borderRadius: 6, fontSize: 16, cursor: "pointer" }}>Check history</button>
        </div>
      </form>
      {message ? <p style={{ marginTop: 20 }}>{message}</p> : null}
      {history ? <p style={{ marginTop: 12, color: "#444" }}>{history}</p> : null}
    </main>
  );
}
