// ORAGROL Lead Finder (pilot) — find emails a business published on its own pages.
// Pure code, no network, no AI. Everything the AI later sees comes from here.
//
// CASL rule behind this module: only an address the business itself published
// on its own site counts. We never guess firstname@company patterns.

import { decodeEntities, toText } from "./text";

export type FoundEmail = {
  email: string;
  /** Every fetched page the address appears on (first one is the proof page). */
  pageUrls: string[];
  /** Text around the address on the first page that shows it as visible text ("" if only in a link). */
  snippet: string;
  viaMailto: boolean;
};

const FILE_EXT = /\.(png|jpe?g|gif|svg|webp|avif|ico|css|js|mjs|json|woff2?|ttf|eot|pdf|zip)$/i;
const PLACEHOLDER_DOMAINS =
  /(^|\.)(example\.(com|org|net)|domain\.com|yourdomain\.[a-z]+|yourcompany\.[a-z]+|email\.com|sentry\.io|wixpress\.com|godaddy\.com|schema\.org|w3\.org)$/i;
const EMAIL_RE = /[A-Za-z0-9._%+\-]+@[A-Za-z0-9\-]+(?:\.[A-Za-z0-9\-]+)*\.[A-Za-z]{2,}/g;

/** Cloudflare "email protection": the address is hidden as hex, first byte is the XOR key. */
export function decodeCfEmail(hex: string): string | null {
  if (!/^[0-9a-f]{4,}$/i.test(hex) || hex.length % 2 !== 0) return null;
  const key = parseInt(hex.slice(0, 2), 16);
  let out = "";
  for (let i = 2; i < hex.length; i += 2) out += String.fromCharCode(parseInt(hex.slice(i, i + 2), 16) ^ key);
  return out;
}

function cleanEmail(raw: string): string | null {
  const e = raw.trim().replace(/^[<(\[]+|[>)\].,;:!?'"]+$/g, "").toLowerCase();
  const at = e.indexOf("@");
  if (at < 1 || at !== e.lastIndexOf("@")) return null;
  const local = e.slice(0, at);
  const domain = e.slice(at + 1);
  if (local.length > 64 || domain.length > 253 || local.startsWith(".") || e.includes("..")) return null;
  if (!/^[a-z0-9._%+\-]+$/.test(local) || !/^[a-z0-9.\-]+\.[a-z]{2,}$/.test(domain)) return null;
  if (FILE_EXT.test(e) || PLACEHOLDER_DOMAINS.test(domain)) return null;
  if (/^(u00|x00)/.test(local)) return null;
  return e;
}

/** Turns "name [at] site [dot] com" and "name (at) site (dot) com" into a normal address. */
function deobfuscate(text: string): string {
  return text
    .replace(/\s*[\[\(\{]\s*at\s*[\]\)\}]\s*/gi, "@")
    .replace(/\s*[\[\(\{]\s*dot\s*[\]\)\}]\s*/gi, ".");
}

function snippetFor(text: string, email: string): string {
  const i = text.toLowerCase().indexOf(email);
  if (i < 0) return "";
  const from = Math.max(0, i - 200);
  const to = Math.min(text.length, i + email.length + 200);
  return text.slice(from, to).replace(/\s+/g, " ").trim();
}

/** All addresses on one page (raw HTML), each tagged with the page URL. */
export function extractEmails(html: string, pageUrl: string): FoundEmail[] {
  const decoded = decodeEntities(html);
  const text = toText(html);
  const found = new Map<string, { viaMailto: boolean }>();
  const add = (raw: string, viaMailto: boolean): void => {
    const e = cleanEmail(raw);
    if (!e) return;
    const prev = found.get(e);
    found.set(e, { viaMailto: (prev?.viaMailto ?? false) || viaMailto });
  };

  for (const m of decoded.matchAll(/mailto:([^"'<>\s?]+)/gi)) {
    let target = m[1];
    try { target = decodeURIComponent(target); } catch { /* keep as is */ }
    for (const part of target.split(/[,;]/)) add(part, true);
  }
  for (const m of decoded.matchAll(/data-cfemail=["']([0-9a-f]+)["']/gi)) {
    const e = decodeCfEmail(m[1]);
    if (e) add(e, true);
  }
  for (const m of decoded.matchAll(/email-protection#([0-9a-f]+)/gi)) {
    const e = decodeCfEmail(m[1]);
    if (e) add(e, true);
  }
  for (const m of deobfuscate(text).matchAll(EMAIL_RE)) add(m[0], false);
  for (const m of deobfuscate(decoded).matchAll(EMAIL_RE)) add(m[0], false);

  const lowerText = deobfuscate(text);
  return [...found.entries()].map(([email, v]) => ({
    email,
    pageUrls: [pageUrl],
    snippet: snippetFor(lowerText, email),
    viaMailto: v.viaMailto,
  }));
}

/** Merges per-page results into one entry per address. */
export function mergeEmails(perPage: FoundEmail[][]): FoundEmail[] {
  const byEmail = new Map<string, FoundEmail>();
  for (const list of perPage) {
    for (const f of list) {
      const prev = byEmail.get(f.email);
      if (!prev) {
        byEmail.set(f.email, { ...f, pageUrls: [...f.pageUrls] });
      } else {
        for (const u of f.pageUrls) if (!prev.pageUrls.includes(u)) prev.pageUrls.push(u);
        if (!prev.snippet && f.snippet) prev.snippet = f.snippet;
        prev.viaMailto = prev.viaMailto || f.viaMailto;
      }
    }
  }
  return [...byEmail.values()];
}

const ROLE_LOCALS = new Set([
  "info", "contact", "contactus", "sales", "support", "admin", "administrator", "office", "hello", "hi",
  "enquiries", "enquiry", "inquiries", "inquiry", "reception", "frontdesk", "front", "billing", "accounts",
  "accounting", "service", "services", "team", "mail", "general", "help", "booking", "bookings", "appointments",
  "appointment", "careers", "jobs", "hr", "marketing", "webmaster", "web", "noreply", "no-reply", "donotreply",
  "orders", "order", "quotes", "quote", "estimates", "customerservice", "clientservices", "feedback", "news",
]);
const WEBMAIL_DOMAINS =
  /^(gmail\.com|googlemail\.com|yahoo\.[a-z.]+|hotmail\.[a-z.]+|outlook\.[a-z.]+|live\.[a-z.]+|msn\.com|icloud\.com|me\.com|aol\.com|protonmail\.com|proton\.me|bell\.net|sympatico\.ca|rogers\.com|telus\.net|shaw\.ca|videotron\.ca)$/i;

export type EmailKind = "role" | "personal";

/** "role" = a shared or generic mailbox (info@, sales@) that we never target. */
export function classifyEmail(email: string): { kind: EmailKind; webmail: boolean } {
  const at = email.lastIndexOf("@");
  const local = email.slice(0, at).toLowerCase();
  const domain = email.slice(at + 1).toLowerCase();
  const bare = local.replace(/[._\-+]/g, "").replace(/\d+$/, "");
  const isRole = ROLE_LOCALS.has(local) || ROLE_LOCALS.has(bare) || /^(no[-_.]?reply|do[-_.]?not[-_.]?reply)/.test(local);
  return { kind: isRole ? "role" : "personal", webmail: WEBMAIL_DOMAINS.test(domain) };
}

/** True if the page says solicitors or unsolicited approaches are not welcome. Conservative on purpose. */
export function hasNoSolicitation(text: string): boolean {
  return /\bno\s+solicit(?:ation|ing|ors?)\b|\bdo(?:es)?\s+not\s+solicit\b|\bsolicitors?\s+(?:are\s+)?not\s+welcome\b|\bno\s+unsolicited\b|\b(?:do(?:es)?\s+not|will\s+not|won'?t)\s+(?:accept|respond\s+to|read)\s+unsolicited\b/i.test(
    text,
  );
}

/** Soft hint only: the business may be in Quebec (French and Law 25 check before any email). */
export function quebecHint(text: string): boolean {
  return (
    /\b[GHJ]\d[A-Z][ -]?\d[A-Z]\d\b/.test(text) ||
    /\(?\b(418|438|450|514|579|581|819|873)\)?[\s.\-]\d{3}[\s.\-]\d{4}\b/.test(text) ||
    /\b(Québec|Quebec)\b/.test(text) && /\b(QC|Qc|Québec)\b/.test(text)
  );
}
