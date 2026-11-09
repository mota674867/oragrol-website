// ORAGROL Outbound engine — writes the 4 emails for one approved lead (Sonnet).
//
// The model writes ONLY from the facts it is given (the first-look findings,
// each with proof). Code then checks the result: plain text, no links before
// day 8, no invented numbers, short bodies. Code adds the footer (sender
// identification, mailing address, unsubscribe) — the model never writes it.
//
// NEEDS VERIFICATION on the first live run: the model id and real token cost.

import Anthropic from "@anthropic-ai/sdk";
import { UNTRUSTED_TEXT_RULE } from "../odo-safety";
import type { Finding } from "./first-look";

export const WRITER_MODEL = "claude-sonnet-5-5";
/** USD per 1M tokens, Sonnet 5.5, checked 2026-11-09 (planning). NEEDS VERIFICATION on the first invoice. */
export const WRITER_PRICING = { inputPerM: 2, outputPerM: 10, verifiedAt: "2026-11-09" } as const;

export type EmailStep = "day0" | "day3" | "day8" | "day15";
export const EMAIL_STEPS: EmailStep[] = ["day0", "day3", "day8", "day15"];

export type DraftEmail = { subject: string; body: string };
export type EmailSet = Record<EmailStep, DraftEmail>;

export type WriterInput = {
  businessName: string;
  personName: string;
  personTitle: string;
  sectorLabel: string;
  size: "small" | "mid";
  city: string | null;
  findings: Finding[];
};

export type WriterOutput = { emails: EmailSet; usage: { input_tokens: number; output_tokens: number } | null };
export type Writer = (input: WriterInput) => Promise<WriterOutput>;

export const LINK_PLACEHOLDERS = ["{{CATALOGUE_LINK}}", "{{SCAN_LINK}}"] as const;

const SYSTEM = [
  "You write short, plain, honest first-contact emails for Oragrol Global, a Toronto cybersecurity and business-automation company, to the owner or manager of a Canadian business.",
  "Write 4 emails: day0, day3, day8, day15. Plain text only. Each body is 60 to 120 words, no greeting longer than 'Hi <first name>,' and no sign-off (code adds the signature and footer).",
  "day0: state ONE finding from the FACTS list in plain words, say why it matters to a business like theirs in one sentence, then ask: 'Want the one-page summary?'.",
  "day3: a second fact from the list if there is one; otherwise a different angle on the first. Same question.",
  "day8: one short paragraph, then offer the catalogue using exactly {{CATALOGUE_LINK}} and the free Cyber Health scan using exactly {{SCAN_LINK}}. These two placeholders are the ONLY links allowed, and only in day8.",
  "day15: a polite close: say you won't write again, and they can reply any time.",
  "Opening angle: if SIZE is 'small' lead with the free finding; if SIZE is 'mid' lead with the finding and add one sentence that Oragrol runs this kind of work with AI agents for less than the cost of a hire.",
  "RULES: use ONLY the FACTS given. Never invent a number, a statistic, a client, a law, a breach, a price or a claim about Oragrol. Never write a URL or email address. No exclamation marks, no 'I hope this finds you well', no hype words. If FACTS is empty, do not invent a finding: day0 and day3 then briefly offer the free scan by name without a link.",
  UNTRUSTED_TEXT_RULE,
  'Return ONLY JSON: {"day0":{"subject":string,"body":string},"day3":{...},"day8":{...},"day15":{...}}',
].join("\n");

function buildUser(i: WriterInput): string {
  const facts = i.findings.length ? i.findings.map((f, n) => `${n + 1}. ${f.fact}`).join("\n") : "(none)";
  return [
    `BUSINESS: ${i.businessName}${i.city ? `, ${i.city}` : ""}`,
    `SECTOR: ${i.sectorLabel}`,
    `SIZE: ${i.size}`,
    `PERSON: ${i.personName} (${i.personTitle})`,
    `FACTS:\n${facts}`,
  ].join("\n");
}

/** Returns a list of problems; empty means the set is acceptable. */
export function checkEmailSet(set: EmailSet, i: WriterInput): string[] {
  const problems: string[] = [];
  const factText = i.findings.map((f) => f.fact).join(" ");
  const allowedNumbers = new Set<string>([...(factText.match(/\d+/g) ?? []), "1", "3", "8", "15"]);
  for (const step of EMAIL_STEPS) {
    const e = set[step];
    if (!e || typeof e.subject !== "string" || typeof e.body !== "string") { problems.push(`${step}: missing`); continue; }
    const words = e.body.trim().split(/\s+/).length;
    if (words < 25 || words > 180) problems.push(`${step}: ${words} words`);
    if (e.subject.length === 0 || e.subject.length > 80) problems.push(`${step}: subject length`);
    if (/https?:\/\/|www\.|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(e.subject + " " + e.body)) problems.push(`${step}: contains a link or address`);
    if (/<[a-z][^>]*>/i.test(e.body)) problems.push(`${step}: contains HTML`);
    if (/!/.test(e.subject + e.body)) problems.push(`${step}: exclamation mark`);
    const hasPlaceholder = LINK_PLACEHOLDERS.some((p) => e.body.includes(p));
    if (step !== "day8" && hasPlaceholder) problems.push(`${step}: link placeholder before day 8`);
    if (step === "day8" && !LINK_PLACEHOLDERS.every((p) => e.body.includes(p))) problems.push("day8: link placeholders missing");
    const stripped = e.body.replace(/\{\{[A-Z_]+\}\}/g, "");
    for (const n of stripped.match(/\d+(?:[.,]\d+)?%?/g) ?? []) {
      const digits = n.replace(/[^\d]/g, "");
      if (!allowedNumbers.has(digits)) problems.push(`${step}: number "${n}" is not in the facts`);
    }
  }
  return problems;
}

export function parseEmailSet(text: string): EmailSet | null {
  try {
    const parsed = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1)) as Record<string, unknown>;
    const out = {} as EmailSet;
    for (const step of EMAIL_STEPS) {
      const e = parsed[step] as { subject?: unknown; body?: unknown } | undefined;
      if (!e || typeof e.subject !== "string" || typeof e.body !== "string") return null;
      out[step] = { subject: e.subject.trim(), body: e.body.trim() };
    }
    return out;
  } catch {
    return null;
  }
}

export function writerCostUsd(u: { input_tokens: number; output_tokens: number } | null | undefined): number {
  if (!u) return 0;
  return (u.input_tokens * WRITER_PRICING.inputPerM + u.output_tokens * WRITER_PRICING.outputPerM) / 1_000_000;
}

export function makeSonnetWriter(apiKey: string): Writer {
  const client = new Anthropic({ apiKey });
  return async (input) => {
    const res = await client.messages.create(
      { model: WRITER_MODEL, max_tokens: 1500, system: SYSTEM, messages: [{ role: "user", content: buildUser(input) }] },
      { timeout: 60000 },
    );
    const usage = { input_tokens: res.usage.input_tokens, output_tokens: res.usage.output_tokens };
    const text = res.content.map((c) => (c.type === "text" ? c.text : "")).join("");
    const emails = parseEmailSet(text);
    if (!emails) throw Object.assign(new Error("writer reply was not valid JSON in the required shape"), { usage });
    return { emails, usage };
  };
}

/** Footer added by code to every email. Sending stays blocked while the mailing address is not configured. */
export function footer(mailingAddress: string | null): string {
  return [
    "",
    "--",
    "Mohammad, Oragrol Global",
    mailingAddress ?? "[MAILING ADDRESS NOT SET]",
    "Not interested? Reply 'unsubscribe' or use {{UNSUBSCRIBE_LINK}} and we will not write again.",
  ].join("\n");
}
