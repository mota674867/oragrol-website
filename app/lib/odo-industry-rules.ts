// ORAGROL ODO — Industry/compliance signals (L4 of the deep-research rebuild)
//
// ADDED 2026-10-01 — ODO brain rebuild, roadmap item 1, L4: "Industry rules
// & threats from the existing Cybersecurity Knowledge Base (not web
// search)." Source: claude/ORAGROL_ODO_Cybersecurity_Knowledge_Base_2026-
// 09-21.md (a Claude Projects doc, not a repo file — frameworks: NIST CSF
// 2.0, CIS Controls v8, SOC 2, ISO/IEC 27001 Annex A, PIPEDA, Quebec Law 25,
// AI governance). This module is the code-native slice of that KB that's
// actually useful DURING research: which compliance frameworks plausibly
// apply to THIS business, so Phase 2's interviewer has real, business-
// specific unknowns to work with instead of asking every visitor the same
// generic "do you handle sensitive data?" question.
//
// This is deliberately NOT a reimplementation of the full KB — odo-
// matching.ts already does framework-aware scoring post-collection, against
// the finished evidence ledger, with Jev. This module has one narrower job:
// given an industry + what the Business Profile (odo-business-profile.ts)
// already found, which frameworks are worth ASKING ABOUT, and why.

export type ComplianceSignal = {
  framework: string;
  trigger: string;
  /** Business-specific question-worthy unknowns this signal raises — Phase 2 reads these alongside the Business Profile's own `unknowns`. */
  unknowns: string[];
};

type IndustryRule = {
  /** Matches the detected industry label (odo-research.ts's keyword labels, or a Business Profile's industryGuess) — case-insensitive. */
  industryMatch: RegExp;
  signal: ComplianceSignal;
};

const INDUSTRY_RULES: IndustryRule[] = [
  {
    industryMatch: /health|medical|clinic|dental|pharma/i,
    signal: {
      framework: "PIPEDA (heightened — health data)",
      trigger: "Healthcare-adjacent industry — likely handles patient/health information",
      unknowns: [
        "how patient/health records are stored and who can access them",
        "whether there's a documented breach-notification process",
      ],
    },
  },
  {
    industryMatch: /legal|^law$|attorney/i,
    signal: {
      framework: "PIPEDA + solicitor-client privilege",
      trigger: "Legal industry — handles privileged/confidential client records",
      unknowns: ["how client files and privileged communications are secured"],
    },
  },
  {
    industryMatch: /finance|accounting|\btax\b|bookkeeping|cpa/i,
    signal: {
      framework: "PIPEDA + SOC 2 (if serving enterprise clients)",
      trigger: "Financial/accounting industry — handles sensitive financial data, may face SOC 2 requests from larger clients",
      unknowns: ["whether any client has asked for a SOC 2 report or security questionnaire"],
    },
  },
  {
    industryMatch: /retail|\bstore\b|\bshop\b|ecommerce|e-commerce/i,
    signal: {
      framework: "PCI-DSS (if processing payments) + PIPEDA",
      trigger: "Retail/ecommerce — likely processes customer payment data directly or via a processor",
      unknowns: ["whether payment processing is handled in-house or fully outsourced to a processor"],
    },
  },
  {
    industryMatch: /tech|software|saas|\bapp\b|digital/i,
    signal: {
      framework: "SOC 2 (if B2B/enterprise) + AI governance (C09) if AI is used",
      trigger: "Technology/SaaS — enterprise customers often require SOC 2; AI-feature products carry AI-governance exposure",
      unknowns: ["whether enterprise customers have requested a security review or SOC 2 report"],
    },
  },
  {
    industryMatch: /real estate|property|realty|mortgage/i,
    signal: {
      framework: "PIPEDA",
      trigger: "Real estate — handles personal/financial data of buyers and sellers",
      unknowns: ["how client financial documents (mortgage, ID) are stored and shared"],
    },
  },
];

// Near-universal trigger per the KB doc §6: any business collecting customer
// data via a website form, CRM, or customer list has at least baseline
// PIPEDA exposure — fires whenever the Business Profile itself already
// found a sensitive data type, regardless of industry.
const UNIVERSAL_DATA_COLLECTION_SIGNAL: ComplianceSignal = {
  framework: "PIPEDA (baseline)",
  trigger: "Collects customer data (website form, CRM, or customer list) — PIPEDA's baseline obligations apply regardless of industry",
  unknowns: ["whether there's a privacy policy describing what customer data is collected and why"],
};

// Quebec Law 25 applies regardless of industry when the business serves
// Quebec customers — detected from the Business Profile's stated locations.
const QUEBEC_SIGNAL: ComplianceSignal = {
  framework: "Quebec Law 25",
  trigger: "Quebec-facing business",
  unknowns: ["whether there's a documented breach-notification process that meets Law 25's mandatory reporting requirement"],
};

// AI governance (C09 in the KB doc) — fires when the Business Profile
// itself already found AI tools/platforms mentioned on the site.
const AI_SIGNAL: ComplianceSignal = {
  framework: "AI governance (C09)",
  trigger: "Site content mentions AI tools/automation",
  unknowns: [
    "whether there's a written AI usage policy",
    "whether any AI-driven decision affecting customers has a human-review step",
  ],
};

/**
 * Given the detected industry and what L1's Business Profile already found,
 * returns which compliance frameworks are worth the interviewer asking
 * about — deduped by framework name so a business that triggers the same
 * framework from more than one rule (e.g. industry + data collection) only
 * surfaces it once.
 */
export function detectComplianceSignals(
  industry: string | null,
  profile: { sensitiveDataTypes: string[]; toolsOrPlatformsMentioned: string[]; locations: string[] } | null
): ComplianceSignal[] {
  const signals: ComplianceSignal[] = [];

  if (industry) {
    for (const rule of INDUSTRY_RULES) {
      if (rule.industryMatch.test(industry)) signals.push(rule.signal);
    }
  }

  if (profile) {
    if (profile.sensitiveDataTypes.length > 0) signals.push(UNIVERSAL_DATA_COLLECTION_SIGNAL);
    if (profile.locations.some((l) => /quebec|montr[ée]al/i.test(l))) signals.push(QUEBEC_SIGNAL);
    if (profile.toolsOrPlatformsMentioned.some((t) => /\bai\b|chatbot|automation|machine learning/i.test(t))) {
      signals.push(AI_SIGNAL);
    }
  }

  const seen = new Set<string>();
  return signals.filter((s) => {
    if (seen.has(s.framework)) return false;
    seen.add(s.framework);
    return true;
  });
}
