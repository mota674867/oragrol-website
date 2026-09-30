// ORAGROL ODO — Adaptive question bank
//
// Master Reference §2/§3: ask ONLY what research could not determine, one at
// a time, and only while an answer could still change the outcome. Hard cap
// 20. Target 0–3 initially, more only when material.
//
// How a question gets picked:
//   1. Candidates = bank minus (already asked) minus (already known from
//      research) minus (not relevant given earlier answers).
//   2. Jev scores each candidate's MATERIALITY — "how much would this answer
//      change which services ODO recommends, given what's already known?"
//   3. Highest wins. Stop when the best remaining materiality is too low to
//      justify the visitor's time, or at the cap.
//   Without Jev (no key / error) a fixed priority order is used instead, so
//   the scan never stalls.
//
// Every option maps to evidence templates (odo-ledger.ts). Hedged options
// ("Not sure", "Not that we know of") are ALWAYS tier "inferred" — the
// §6.1 hedged-answer-as-confirmation disqualifier, written in as data.

import { askJev, scoreToUnit, type JevQuestion } from "./jev";
import type { Tier, Polarity, Severity, Area } from "./odo-ledger";

export type AnswerEvidenceTemplate = {
  fact: string;
  tier: Tier;
  polarity: Polarity;
  severity: Severity;
  area: Area;
  supports?: string[];
  counters?: string[];
  framework?: string;
  /** Raises the custom-service / escalation flag (a genuinely off-catalog need, e.g. ISO 27001). */
  customFlag?: string;
};

export type OdoQuestion = { id: string; text: string; options?: string[] };

export type QuestionContext = {
  industry: string | null;
  businessSize: string | null;
  hasWebsite: boolean;
  answers: Record<string, string>;
  /** Evidence summary text — what's already known — for Jev's materiality call. */
  knownText: string;
};

type BankEntry = OdoQuestion & {
  /** Fallback order when Jev is unavailable (lower first). */
  priority: number;
  /** Skip when research/earlier answers already cover it. */
  skip?: (ctx: QuestionContext) => boolean;
  /** What this question determines — given to Jev for the materiality call. */
  determines: string;
  evidence: Record<string, AnswerEvidenceTemplate[]>;
};

const G = (fact: string, tier: Tier, severity: Severity, area: Area, supports: string[], extra: Partial<AnswerEvidenceTemplate> = {}): AnswerEvidenceTemplate =>
  ({ fact, tier, polarity: "gap", severity, area, supports, ...extra });
const ST = (fact: string, area: Area, counters: string[] = []): AnswerEvidenceTemplate =>
  ({ fact, tier: "observed", polarity: "strength", severity: "info", area, counters });
const CX = (fact: string, area: Area, tier: Tier = "observed", supports: string[] = [], extra: Partial<AnswerEvidenceTemplate> = {}): AnswerEvidenceTemplate =>
  ({ fact, tier, polarity: "context", severity: "info", area, supports, ...extra });

const INDUSTRIES = ["Healthcare", "Legal", "Finance & Accounting", "Technology", "Retail", "Construction", "Food & Beverage", "Education", "Marketing & Advertising", "Consulting", "Manufacturing", "Real Estate", "Other"];

const BANK: BankEntry[] = [
  {
    id: "q_industry", priority: 1,
    text: "What industry or sector does your business operate in?",
    options: INDUSTRIES,
    determines: "the business's industry — drives threat profile, compliance obligations and benchmarks",
    skip: (c) => !!c.industry,
    evidence: Object.fromEntries(INDUSTRIES.map((i) => [i, [CX(`Industry (stated): ${i}.`, "business", "observed", ["Healthcare", "Legal", "Finance & Accounting"].includes(i) ? ["C03-S03", "C13-S03"] : [])]])),
  },
  {
    id: "q_staff_count", priority: 2,
    text: "Approximately how many people work at your company?",
    options: ["1–10", "11–50", "51–200", "200+"],
    determines: "company size — decides whether Ontario AODA applies (50+), and whether strategic security leadership (vCISO) is proportionate",
    skip: (c) => !!c.businessSize,
    evidence: {
      "1–10": [CX("Team size (stated): 1–10 people.", "business")],
      "11–50": [CX("Team size (stated): 11–50 people.", "business")],
      "51–200": [CX("Team size (stated): 51–200 people — Ontario AODA accessibility obligations apply.", "business", "observed", ["C01-S04"])],
      "200+": [CX("Team size (stated): 200+ people — Ontario AODA accessibility obligations apply.", "business", "observed", ["C01-S04"])],
    },
  },
  {
    id: "q_biggest_challenge", priority: 3,
    text: "What is your biggest operational challenge right now?",
    options: ["Cybersecurity and data protection", "Day-to-day efficiency and automation", "Growing the business", "Managing costs", "Customer experience", "Compliance and regulations"],
    determines: "the visitor's own priority — which half of the report (security vs automation) matters most to them",
    evidence: {
      "Cybersecurity and data protection": [CX("Stated priority: cybersecurity and data protection.", "governance", "observed", ["C01-S01"])],
      "Day-to-day efficiency and automation": [CX("Stated priority: day-to-day efficiency and automation.", "operations", "observed", ["C11-S02", "C11-S01", "C11-S04"])],
      "Growing the business": [CX("Stated priority: growing the business.", "operations", "observed", ["C15-S02", "C11-S03"])],
      "Managing costs": [CX("Stated priority: managing costs.", "operations", "observed", ["C11-S03"])],
      "Customer experience": [CX("Stated priority: customer experience.", "operations", "observed", ["C15-S01", "C15-S04"])],
      "Compliance and regulations": [CX("Stated priority: compliance and regulations.", "privacy", "observed", ["C01-S02"])],
    },
  },
  {
    id: "q_security_owner", priority: 4,
    text: "Who looks after IT and security for your business today?",
    options: ["A dedicated in-house IT or security person/team", "An outside IT provider", "Someone part-time, on top of their main job", "Nobody specifically", "I'm not sure"],
    determines: "whether anyone owns security — a governance gap no public scan can see",
    evidence: {
      "A dedicated in-house IT or security person/team": [ST("A dedicated in-house IT/security function exists.", "governance", ["C01-S04"])],
      "An outside IT provider": [CX("IT is handled by an outside provider.", "governance", "observed", ["C02-S02"])],
      "Someone part-time, on top of their main job": [G("IT/security is handled part-time by someone with another main job — no dedicated owner.", "observed", "medium", "governance", ["C01-S04", "C01-S01", "C14-S04", "C03-S02", "C05-S04"], { framework: "NIST CSF Govern" })],
      "Nobody specifically": [G("Nobody is specifically responsible for IT or security.", "observed", "high", "governance", ["C01-S04", "C01-S01", "C14-S01", "C03-S02", "C05-S04", "C14-S05"], { framework: "NIST CSF Govern" })],
      "I'm not sure": [G("Unclear who owns IT/security (visitor unsure).", "inferred", "medium", "governance", ["C01-S04", "C01-S01", "C05-S04"])],
    },
  },
  {
    id: "q_mfa", priority: 5,
    text: "Is multi-factor authentication (a code or app prompt, not just a password) required to sign in to email and key business systems?",
    options: ["Yes, for everyone", "Only for some people or systems", "No", "Not that I know of"],
    determines: "MFA coverage — the single most common gap behind account takeovers",
    evidence: {
      "Yes, for everyone": [ST("MFA is required for everyone on email and key systems.", "identity", ["C05-S02"])],
      "Only for some people or systems": [G("MFA is only partly enforced (some people or systems).", "observed", "medium", "identity", ["C05-S02", "C05-S01"], { framework: "CIS 6" })],
      "No": [G("MFA is not required on email or key business systems.", "observed", "high", "identity", ["C05-S02", "C05-S03"], { framework: "CIS 6" })],
      "Not that I know of": [G("MFA enforcement is unconfirmed (\"not that I know of\").", "inferred", "medium", "identity", ["C05-S02"], { framework: "CIS 6" })],
    },
  },
  {
    id: "q_backups", priority: 6,
    text: "If ransomware locked your main files and systems today, could you restore them from a backup kept separately?",
    options: ["Yes, and we've tested a restore", "We have backups but haven't tested a restore", "No", "I'm not sure"],
    determines: "recoverability — whether a ransomware event is an inconvenience or a business-ending event",
    evidence: {
      "Yes, and we've tested a restore": [ST("Separate backups exist and a restore has been tested.", "data", ["C08-S01"])],
      "We have backups but haven't tested a restore": [G("Backups exist but a restore has never been tested.", "observed", "medium", "data", ["C08-S01", "C03-S04"], { framework: "CIS 11" })],
      "No": [G("No separate backup to restore from after ransomware.", "observed", "high", "data", ["C08-S01", "C03-S04"], { framework: "CIS 11" })],
      "I'm not sure": [G("Backup/restore capability is unconfirmed (visitor unsure).", "inferred", "medium", "data", ["C08-S01"], { framework: "CIS 11" })],
    },
  },
  {
    id: "q_incident_plan", priority: 7,
    text: "If you had a cyber incident tomorrow — a hacked mailbox or ransomware — is there a written plan for what to do?",
    options: ["Yes, written and practised", "Yes, written but never practised", "No written plan", "I'm not sure"],
    determines: "incident readiness — whether response is planned or improvised",
    evidence: {
      "Yes, written and practised": [ST("A written incident response plan exists and has been practised.", "governance", ["C01-S03", "C03-S04"])],
      "Yes, written but never practised": [G("An incident plan exists on paper but has never been practised.", "observed", "low", "governance", ["C03-S04"], { framework: "CIS 17" })],
      "No written plan": [G("There is no written incident response plan.", "observed", "high", "governance", ["C01-S03", "C03-S04"], { framework: "CIS 17" })],
      "I'm not sure": [G("Existence of an incident response plan is unconfirmed.", "inferred", "medium", "governance", ["C01-S03", "C03-S04"], { framework: "CIS 17" })],
    },
  },
  {
    id: "q_training", priority: 8,
    text: "Do staff get security awareness or phishing training?",
    options: ["Yes, at least once a year", "Only when they join", "No", "I'm not sure"],
    determines: "human-risk controls — most breaches start with a person, not a system",
    evidence: {
      "Yes, at least once a year": [ST("Staff receive security awareness training at least yearly.", "people", ["C04-S03"])],
      "Only when they join": [G("Security training happens only at onboarding, not ongoing.", "observed", "medium", "people", ["C04-S03"], { framework: "CIS 14" })],
      "No": [G("Staff receive no security awareness training.", "observed", "medium", "people", ["C04-S03"], { framework: "CIS 14" })],
      "I'm not sure": [G("Security training status is unconfirmed.", "inferred", "low", "people", ["C04-S03"], { framework: "CIS 14" })],
    },
  },
  {
    id: "q_email_security_awareness", priority: 9,
    text: "Has your team seen phishing or suspicious emails targeting your business in the last 12 months?",
    options: ["Yes, frequently", "Yes, occasionally", "Not that we know of", "We don't monitor this"],
    determines: "whether email-borne attacks are an active, current problem for this business",
    evidence: {
      "Yes, frequently": [G("Phishing attempts against the team are frequent (stated).", "observed", "medium", "email", ["C04-S02"]), G("Frequent phishing suggests staff need ongoing awareness training.", "inferred", "medium", "people", ["C04-S03"])],
      "Yes, occasionally": [CX("Occasional phishing attempts reported (single/occasional incidents are not proof of a systemic gap).", "email", "inferred", ["C04-S03"])],
      "Not that we know of": [CX("No phishing attempts known (hedged).", "email", "inferred")],
      "We don't monitor this": [G("Suspicious email activity is not monitored.", "observed", "medium", "email", ["C04-S02", "C03-S01"])],
    },
  },
  {
    id: "q_devices", priority: 10,
    text: "How does your team work day to day?",
    options: ["In the office, on company devices", "Company devices, partly remote", "A mix of personal and company devices", "Mostly personal devices"],
    determines: "endpoint and remote-access exposure",
    evidence: {
      "In the office, on company devices": [CX("Team works in the office on company devices.", "identity")],
      "Company devices, partly remote": [CX("Hybrid/remote work on company devices.", "identity", "observed", ["C05-S05"])],
      "A mix of personal and company devices": [G("Staff use a mix of personal and company devices.", "observed", "medium", "identity", ["C04-S01", "C05-S05"], { framework: "CIS 1/10" })],
      "Mostly personal devices": [G("Work is done mostly on personal devices.", "observed", "high", "identity", ["C04-S01", "C05-S05", "C08-S02"], { framework: "CIS 1/10" })],
    },
  },
  {
    id: "q_data_types", priority: 11,
    text: "What's the most sensitive kind of information your business handles?",
    options: ["Health or medical records", "Payment card or banking details", "Customer personal information", "Mostly internal business data", "Mostly public information"],
    determines: "data sensitivity — decides compliance scope (PIPEDA, PHIPA, PCI) and how serious other gaps are",
    evidence: {
      "Health or medical records": [CX("Handles health or medical records.", "data", "observed", ["C08-S01", "C08-S03", "C01-S02", "C03-S03", "C08-S05"], { framework: "PHIPA / PIPEDA" })],
      "Payment card or banking details": [CX("Handles payment card or banking details.", "data", "observed", ["C08-S01", "C01-S02", "C08-S05"], { framework: "PCI DSS" })],
      "Customer personal information": [CX("Handles customer personal information.", "data", "observed", ["C08-S03"], { framework: "PIPEDA" })],
      "Mostly internal business data": [CX("Mostly internal business data.", "data", "observed", ["C08-S04"])],
      "Mostly public information": [CX("Handles mostly public information.", "data")],
    },
  },
  {
    id: "q_systems", priority: 12,
    text: "Where do your main business systems run?",
    options: ["Microsoft 365 or Google Workspace only", "Cloud platforms like AWS or Azure (our own apps/servers)", "Our own servers in the office", "A mix of cloud and office servers"],
    determines: "infrastructure footprint — whether cloud posture or on-prem hardening is in scope",
    evidence: {
      "Microsoft 365 or Google Workspace only": [CX("Runs on Microsoft 365 / Google Workspace only.", "business", "observed", ["C02-S02"])],
      "Cloud platforms like AWS or Azure (our own apps/servers)": [CX("Runs its own apps/servers on AWS/Azure-type cloud platforms.", "business", "observed", ["C06-S01", "C06-S05", "C06-S02", "C07-S01", "C07-S03", "C07-S05"])],
      "Our own servers in the office": [CX("Runs its own servers in the office.", "business", "observed", ["C06-S03", "C14-S02", "C14-S05"])],
      "A mix of cloud and office servers": [CX("Hybrid: cloud platforms plus office servers.", "business", "observed", ["C06-S01", "C06-S03", "C06-S02", "C14-S05"])],
    },
  },
  {
    id: "q_ai_use", priority: 13,
    text: "Does your team use AI tools (like ChatGPT or Copilot) with customer or business data?",
    options: ["Yes, and we have rules for it", "Yes, without formal rules", "We've built AI into our product or customer service", "No", "I'm not sure"],
    determines: "AI exposure — whether business data is flowing into AI tools without controls",
    evidence: {
      "Yes, and we have rules for it": [ST("AI tools are used under written rules.", "ai", ["C09-S02"])],
      "Yes, without formal rules": [G("Staff use AI tools with business data and there are no formal rules.", "observed", "medium", "ai", ["C09-S01", "C09-S02", "C09-S04", "C12-S02"])],
      "We've built AI into our product or customer service": [CX("AI is built into the product or customer service.", "ai", "observed", ["C09-S05", "C09-S01", "C09-S03"])],
      "No": [CX("No AI tools in use with business data (stated).", "ai")],
      "I'm not sure": [G("AI tool use with business data is unknown.", "inferred", "low", "ai", ["C09-S02"])],
    },
  },
  {
    id: "q_manual_work", priority: 14,
    text: "Where does your team lose the most time to manual work?",
    options: ["Re-typing data between systems", "Chasing leads, quotes and follow-ups", "Answering the same customer questions", "Onboarding new clients", "Reports and spreadsheets", "Not much — we're fairly automated"],
    determines: "the biggest automation opportunity — the one thing public research can only guess at",
    evidence: {
      "Re-typing data between systems": [G("Staff re-type data between systems.", "observed", "medium", "operations", ["C12-S01", "C12-S03", "C11-S02", "C12-S04"])],
      "Chasing leads, quotes and follow-ups": [G("Lead, quote and follow-up handling is manual.", "observed", "medium", "operations", ["C15-S02", "C12-S01"])],
      "Answering the same customer questions": [G("Staff spend time answering repetitive customer questions.", "observed", "medium", "operations", ["C15-S01", "C13-S01"])],
      "Onboarding new clients": [G("Client onboarding is manual.", "observed", "medium", "operations", ["C15-S03", "C12-S01"])],
      "Reports and spreadsheets": [G("Reporting is built by hand in spreadsheets.", "observed", "medium", "operations", ["C13-S04", "C13-S02", "C13-S03", "C13-S05"])],
      "Not much — we're fairly automated": [ST("Operations are already largely automated (stated).", "operations", ["C11-S02"]), CX("Existing automation may be a candidate for optimization.", "operations", "inferred", ["C11-S05", "C12-S05"])],
    },
  },
  {
    id: "q_compliance_pressure", priority: 15,
    text: "Have clients, insurers or partners asked you to complete a security questionnaire or certification?",
    options: ["Yes — SOC 2 or ISO 27001", "Yes — a cyber insurance questionnaire", "Yes — PCI for card payments", "No"],
    determines: "external compliance pressure — often the real deadline behind security work",
    evidence: {
      "Yes — SOC 2 or ISO 27001": [
        G("Clients or partners are asking for a SOC 2 or ISO 27001 attestation.", "observed", "high", "privacy", ["C10-S02", "C01-S02", "C01-S03"], { framework: "SOC 2" }),
        CX("ISO 27001 specifically is not a certification ORAGROL issues directly — worth a direct conversation if that exact standard is required.", "privacy", "observed", [], { customFlag: "Client needs ISO 27001 specifically (not a catalog item) — escalate for a direct conversation." }),
      ],
      "Yes — a cyber insurance questionnaire": [G("A cyber insurer has sent a questionnaire — insurers increasingly require third-party proof (a pentest) to bind or renew coverage.", "observed", "medium", "privacy", ["C10-S01", "C01-S02", "C01-S01"])],
      "Yes — PCI for card payments": [G("A PCI-DSS requirement has been raised for card payment handling.", "observed", "high", "privacy", ["C10-S03", "C01-S02"], { framework: "PCI DSS" })],
      "No": [CX("No external security questionnaires so far.", "privacy")],
    },
  },
  {
    id: "q_open", priority: 99,
    text: "Anything else about your business, IT or day-to-day operations you'd like us to know?",
    determines: "anything the structured questions missed — including needs outside the service catalog",
    evidence: {},
  },
];

export const QUESTION_BY_ID: Record<string, BankEntry> = Object.fromEntries(BANK.map((b) => [b.id, b]));

/** Per-question, per-option evidence templates (read by odo-ledger.ts). */
export const ANSWER_EVIDENCE: Record<string, Record<string, AnswerEvidenceTemplate[]>> =
  Object.fromEntries(BANK.map((b) => [b.id, b.evidence]));

export const MAX_QUESTIONS = 20;
/** Below this many answers we always keep asking core questions (public research cannot see internal controls at all). */
const MIN_QUESTIONS = 4;
/** Soft cap — beyond this, only continue for a clearly material question. */
const SOFT_CAP = 8;

function candidates(ctx: QuestionContext): BankEntry[] {
  return BANK.filter((b) => !(b.id in ctx.answers) && !(b.skip?.(ctx)));
}

export function toPublic(q: BankEntry): OdoQuestion {
  return { id: q.id, text: q.text, ...(q.options ? { options: q.options } : {}) };
}

export type NextQuestionDecision =
  | { done: false; question: OdoQuestion; method: "jev" | "fallback"; materiality: number | null }
  | { done: true; reason: string; method: "jev" | "fallback" };

/**
 * Pick the next question, or decide the questioning phase is over.
 * Deterministic when Jev is unavailable; never throws.
 */
export async function nextQuestion(ctx: QuestionContext): Promise<NextQuestionDecision> {
  const asked = Object.keys(ctx.answers).length;
  if (asked >= MAX_QUESTIONS) return { done: true, reason: "question cap reached", method: "fallback" };
  if ("q_open" in ctx.answers) return { done: true, reason: "closing question answered", method: "fallback" };

  const pool = candidates(ctx);
  // The free-text catch-all is only ever the LAST question.
  const structured = pool.filter((q) => q.id !== "q_open");
  const openQ = pool.find((q) => q.id === "q_open");

  if (structured.length === 0) {
    return openQ ? { done: false, question: toPublic(openQ), method: "fallback", materiality: null } : { done: true, reason: "no questions left", method: "fallback" };
  }

  // Industry/size first when unknown — everything else is scored against them.
  const mustFirst = structured.find((q) => q.id === "q_industry") ?? structured.find((q) => q.id === "q_staff_count");
  if (mustFirst) return { done: false, question: toPublic(mustFirst), method: "fallback", materiality: null };

  const levels = [
    "Would not change any recommendation — already answered by research or irrelevant here",
    "Might slightly refine confidence on one finding",
    "Would likely change one recommendation or its confidence tier",
    "Would change several recommendations or confidence tiers",
  ];
  const qs: Record<string, JevQuestion> = {};
  for (const q of structured) {
    qs[q.id] = {
      type: "score",
      instructions: `ODO is deciding which follow-up question to ask a small/medium business during a free security & automation discovery scan. Given what is already known (state), how much would the answer to this question change which services are recommended, or how confident those recommendations are? Question: "${q.text}" — it determines ${q.determines}.`,
      criteria: levels,
    };
  }
  const state = `Industry: ${ctx.industry ?? "unknown"}. Size: ${ctx.businessSize ?? "unknown"}. Has website: ${ctx.hasWebsite}.\nAlready known:\n${ctx.knownText || "(nothing yet)"}`;
  const jev = await askJev(state, qs, { label: "materiality", timeoutMs: 8000 });

  if (jev && Object.keys(jev.answers).length > 0) {
    const scored = structured
      .map((q) => ({ q, m: scoreToUnit(jev.answers[q.id], levels.length) }))
      .filter((x): x is { q: BankEntry; m: number } => x.m !== null)
      .sort((a, b) => b.m - a.m || a.q.priority - b.q.priority);
    const best = scored[0];
    if (best) {
      const threshold = asked < MIN_QUESTIONS ? 0 : asked < SOFT_CAP ? 0.34 : 0.67;
      if (best.m >= threshold) return { done: false, question: toPublic(best.q), method: "jev", materiality: best.m };
      return openQ && !("q_open" in ctx.answers)
        ? { done: false, question: toPublic(openQ), method: "jev", materiality: best.m }
        : { done: true, reason: `remaining questions not material (best ${best.m.toFixed(2)})`, method: "jev" };
    }
  }

  // Fallback — fixed priority order, stop at the soft cap.
  if (asked >= SOFT_CAP - 1) {
    return openQ ? { done: false, question: toPublic(openQ), method: "fallback", materiality: null } : { done: true, reason: "soft cap reached (no Jev)", method: "fallback" };
  }
  const next = [...structured].sort((a, b) => a.priority - b.priority)[0];
  return { done: false, question: toPublic(next), method: "fallback", materiality: null };
}
