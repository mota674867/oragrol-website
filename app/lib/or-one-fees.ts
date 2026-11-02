/** OR ONE tier fees (CAD). The ONE source for the OR ONE page cards and the live chat's knowledge. */
export const OR_ONE_TIER_KEYS = ["STARTER", "100", "200", "400"] as const;
export type OrOneTierKey = (typeof OR_ONE_TIER_KEYS)[number];
export const OR_ONE_TIER_FEES: Record<OrOneTierKey, { build: number; monthly: number }> = {
  STARTER: { build: 16999, monthly: 1599 },
  "100": { build: 39999, monthly: 4499 },
  "200": { build: 79999, monthly: 5999 },
  "400": { build: 139999, monthly: 8999 },
};
