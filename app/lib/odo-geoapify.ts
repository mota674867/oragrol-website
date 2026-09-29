// ORAGROL ODO — Geoapify Places: local competitor discovery
//
// Section 33, Area 2. Replaces OpenStreetMap Nominatim, whose usage policy
// forbids "downloading all POIs in an area" and discourages commercial
// reliance (see the master reference's rejected-sources table). Geoapify
// serves the same OSM data under terms the project already researched and
// accepted as permitting commercial production use on its free tier (3,000
// requests/day, no card) — provided results carry "Powered by Geoapify" +
// ODbL attribution wherever they reach a viewer. This module only fetches
// and normalizes candidates; whatever renders them in the client report must
// carry that attribution line.
//
// Endpoint shape and example category strings verified against
// apidocs.geoapify.com/docs/places (2026-09-29): GET
// https://api.geoapify.com/v2/places with `categories`,
// `filter=circle:lon,lat,radiusMeters`, `bias=proximity:lon,lat`, `limit`,
// `apiKey`.
//
// NEEDS VERIFICATION before this ships: the industry→category map below is
// built from Geoapify's documented example categories, not from a live
// query — this sandbox has no outbound access to api.geoapify.com to check
// real result quality/relevance per category. Spot-check a few real ICP
// domains against this once deployed (Vercel has full internet access).
//
// Output matches CandidateInput from odo-competitors.ts exactly, so these
// candidates merge directly into the same classifyCompetitors() pass as
// Tavily's. Geoapify only supplies discovery — every candidate still goes
// through independent identity verification (Google Places) before it can
// reach a report; this module is not a shortcut past that.

import { type Determination, observed, notDetermined } from "./odo-evidence";
import type { CandidateInput } from "./odo-competitors";

const INDUSTRY_CATEGORY_MAP: Record<string, string> = {
  Technology: "office.it",
  Legal: "office.lawyer",
  "Finance & Accounting": "office.accountant",
  Consulting: "office.consulting",
  "Real Estate": "office.estate_agent",
  "Marketing & Advertising": "office.advertising_agency",
};

/** Falls back to the broad "commercial" category when the detected industry has no closer Geoapify match — better to cast wide than to silently return nothing for an unmapped industry. */
export function geoapifyCategoryFor(industry: string | null): string {
  return (industry && INDUSTRY_CATEGORY_MAP[industry]) || "commercial";
}

export type GeoLocation = { lat: number; lon: number };

export async function fetchGeoapifyNearby(
  location: GeoLocation,
  industry: string | null,
  opts: { radiusMeters?: number; limit?: number } = {}
): Promise<Determination<CandidateInput[]>> {
  const apiKey = process.env.GEOAPIFY_API_KEY;
  if (!apiKey) return notDetermined<CandidateInput[]>("no GEOAPIFY_API_KEY configured", "geoapify:places");

  const category = geoapifyCategoryFor(industry);
  const radius = opts.radiusMeters ?? 8000; // ~a reasonable "same local market" radius for an SMB
  const limit = opts.limit ?? 10;
  const params = new URLSearchParams({
    categories: category,
    filter: `circle:${location.lon},${location.lat},${radius}`,
    bias: `proximity:${location.lon},${location.lat}`,
    limit: String(limit),
    apiKey,
  });

  try {
    const res = await fetch(`https://api.geoapify.com/v2/places?${params.toString()}`, {
      signal: AbortSignal.timeout(10000),
    });
    if (res.status === 403 || res.status === 429) {
      return notDetermined<CandidateInput[]>(`blocked by origin (HTTP ${res.status})`, "geoapify:places");
    }
    if (!res.ok) return notDetermined<CandidateInput[]>(`HTTP ${res.status}`, "geoapify:places");

    const data = (await res.json()) as { features?: Array<{ properties?: Record<string, unknown> }> };
    const candidates: CandidateInput[] = (data.features ?? [])
      .map((f) => f.properties ?? {})
      .filter((p): p is Record<string, unknown> & { name: string } => typeof p.name === "string" && p.name.length > 0)
      .map((p) => ({
        name: p.name,
        website: typeof p.website === "string" ? p.website : null,
        source: "geoapify",
      }));

    return observed(candidates, "geoapify:places");
  } catch (err) {
    const reason = err instanceof Error ? (err.name === "TimeoutError" ? "timeout" : err.message) : String(err);
    return notDetermined<CandidateInput[]>(reason, "geoapify:places");
  }
}
