// ORAGROL ODO — Credential exposure check (HaveIBeenPwned)
//
// Pending Item #22, decided by Mohammad 2026-09-30: wire it in. HIBP's
// *domain* search endpoint stays unusable (it requires proving ownership of
// the domain, which ODO has no relationship to do) — but the prospect
// supplies their own email address at intake, with consent, so checking
// THAT single address is legitimate and defensible in a way scanning an
// arbitrary domain is not. This is the one capability every "free dark web
// scan" competitor leads with that ODO lacked (Section 34).
//
// Cost: HIBP's cheapest paid tier (~$3.95/month) — `HIBP_API_KEY` must be
// provisioned before this does anything; with no key it is not_determined,
// never a fabricated "not breached" (§20 evidence-integrity rule).
//
// A 404 from HIBP's breachedaccount endpoint is a genuine, positive
// "this address has never appeared in a known breach" — fetchOrDetermine
// already treats 404 as `absent`, and here `absent` is the GOOD outcome
// (matches the odo-evidence.ts contract: `absent` = "we looked and it is
// genuinely not there" — here, the "it" is exposed credentials).

import { type Determination, notDetermined, fetchOrDetermine, absent } from "./odo-evidence";

export type HibpBreach = { name: string; breachDate: string; dataClasses: string[] };
export type HibpResult = { breaches: HibpBreach[] };

type RawBreach = { Name?: string; BreachDate?: string; DataClasses?: string[] };

export async function checkHibpBreach(email: string): Promise<Determination<HibpResult>> {
  const apiKey = process.env.HIBP_API_KEY;
  if (!apiKey) return notDetermined<HibpResult>("HIBP_API_KEY not configured", "HIBP breachedaccount API");
  if (!email || !email.includes("@")) return notDetermined<HibpResult>("no valid email supplied at intake", "HIBP breachedaccount API");

  const url = `https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email)}?truncateResponse=false`;
  const res = await fetchOrDetermine("HIBP breachedaccount API", url, {
    timeoutMs: 12000,
    headers: { "hibp-api-key": apiKey, "User-Agent": "ORAGROL-ODO/1.0 (+https://orgro.ca)" },
  });

  if (res.state === "absent") return absent<HibpResult>("HIBP breachedaccount API"); // genuinely never breached — the good outcome
  if (res.state !== "observed") return res as Determination<HibpResult>;

  let raw: RawBreach[];
  try {
    raw = JSON.parse(res.value.body) as RawBreach[];
  } catch {
    return notDetermined<HibpResult>("malformed HIBP response", "HIBP breachedaccount API");
  }
  if (!Array.isArray(raw)) return notDetermined<HibpResult>("unexpected HIBP response shape", "HIBP breachedaccount API");

  return { state: "observed", value: { breaches: raw.map((b) => ({ name: b.Name ?? "unknown", breachDate: b.BreachDate ?? "", dataClasses: b.DataClasses ?? [] })) }, source: "HIBP breachedaccount API", collectedAt: new Date().toISOString() };
}
