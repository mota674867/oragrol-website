// ORAGROL ODO — shared interview evidence types
//
// REMOVED 2026-10-03 (Master Reference §37.2): the fixed question library
// that used to live here — 16 pre-written multiple-choice questions, the
// Jev-scored `nextQuestion()` picker, and the per-option evidence templates.
// Mohammad's decision: "no need a fix library at all — if ODO can realise
// what should ask, let continue; if don't, stop it." ODO now writes every
// question itself (odo-interviewer.ts + odo-playbook.ts), and if the AI is
// unavailable the scan stops honestly instead of falling back to form
// questions pretending to be a live interview.
//
// What remains is the one shape the rest of the pipeline still shares: a
// fact extracted from a visitor's answer, before it gets a ledger ID.

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
};
