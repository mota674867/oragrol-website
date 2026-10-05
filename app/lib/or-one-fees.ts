/** OR ONE tier fees (CAD). The ONE source for the OR ONE page cards and the live chat's knowledge. */
export const OR_ONE_TIER_KEYS = ["STARTER", "100", "200", "400"] as const;
export type OrOneTierKey = (typeof OR_ONE_TIER_KEYS)[number];
export const OR_ONE_TIER_FEES: Record<OrOneTierKey, { build: number; monthly: number }> = {
  STARTER: { build: 22000, monthly: 999 },
  "100": { build: 75000, monthly: 3999 },
  "200": { build: 150000, monthly: 5999 },
  "400": { build: 220000, monthly: 8999 },
};
