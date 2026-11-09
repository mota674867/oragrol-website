// ORAGROL Outbound engine — limits and switches (Mohammad's rules, 2026-11-10).
//
// SENDING: there is NO sending code in this engine. Nothing here can send an
// email. Sending is a separate step that will be built after Mohammad lands in
// Canada and provides the 3 sending domains and 9 mailboxes, after the CASL
// lawyer review, and only with his "yes".

export const OUTBOUND_LIMITS = {
  /** Valid leads prepared per day. 60 are sent, the spare 10 carry over. */
  targetValid: 70,
  /** New businesses offered for approval per day. */
  sendPerDay: 60,
  /** Businesses whose website is read per day (duplicates skipped for free do not count). */
  maxScanPerDay: 400,
  /** Hard stop on AI cost per day, CAD. */
  dailyCostCapCad: 25,
  /** Hard stop on AI cost per month, CAD (22 working days x 25). Confirmed by Mohammad 2026-11-10. */
  monthlyCostCapCad: 550,
  /** A finished area x sector, and a contacted business, rest this many days. */
  restDays: 90,
  /** Businesses read at the same time. */
  concurrency: 3,
  /** Places asked from the source per page. */
  sourcePageSize: 40,
} as const;

export type OutboundLimits = Record<keyof typeof OUTBOUND_LIMITS, number>;

/** Planning rate, same as the Lead Finder pilot. Re-check before money decisions. */
export const USD_TO_CAD = 1.4;

/** The nightly engine only runs when this is "1". Default: off. */
export function engineEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.OUTBOUND_ENGINE_ENABLED === "1";
}

/** Writing leads to HubSpot only happens when this is "1". Default: off. */
export function hubspotWriteEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.OUTBOUND_HUBSPOT_WRITE === "1";
}

/** Fixed: the engine prepares and holds. It never sends. */
export const SENDING_ENABLED = false as const;
