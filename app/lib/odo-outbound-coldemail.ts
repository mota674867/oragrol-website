import type { Dossier } from "./odo-outbound";

// Pure content picks for the cold-email PDF (kept free of react-pdf so tests can import them).

export const clean = (t: string) => t.replace(/\s*\[E\d+\]/g, "").replace(/^[✓✗]\s*/, "").replace(/[^\x20-\x7E -ÿ–—•‘’“”]/g, "");
const SEV = { high: 0, medium: 1, low: 2 } as const;

/** Up to 3 observed gaps, most important first. Public-evidence facts only. */
export function coldEmailObservations(d: Dossier): string[] {
  return d.gaps
    .filter((g) => g.confidence === "high" && g.severity in SEV)
    .sort((a, b) => SEV[a.severity as keyof typeof SEV] - SEV[b.severity as keyof typeof SEV])
    .slice(0, 3)
    .map((g) => clean(g.fact));
}

/** The one package to name: the Business Automation / OR ONE pick, else the top service match. */
export function coldEmailRecommendation(d: Dossier): { name: string; why: string } | null {
  if (d.automationLane) return { name: d.automationLane.name, why: d.automationLane.reason };
  const top = d.recommendations[0];
  return top ? { name: top.name, why: top.reason } : null;
}
