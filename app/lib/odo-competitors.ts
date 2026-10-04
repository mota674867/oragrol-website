// ORAGROL ODO — Competitor classification
//
// WHY THIS EXISTS
// The old competitor list was just Tavily search-result titles with the
// word "competitor" in the query — no verification at all. Any business
// whose name showed up in a search snippet could be printed in a client
// report as "your competitor." For a security vendor, one wrong competitor
// name in a report is a credibility-ending mistake.
//
// This module classifies each candidate against minimum evidence rules
// before it is allowed to appear as a competitor finding. It does NOT
// introduce a new confidence scale — classification sits on top of the
// existing 3-state Determination (observed/absent/not_determined) from
// odo-evidence.ts. Only "identity verified" (an observed Determination)
// counts toward a classification; not_determined never upgrades a rank.
//
// Classification (from weakest to strongest evidence):
//   insufficient_evidence — could not verify the business independently
//   irrelevant_candidate  — verified, but nothing ties it to the prospect
//   comparable_business   — verified, same general space, no real overlap
//   probable_competitor   — verified + service overlap + one supporting signal
//   confirmed_competitor  — verified + service overlap + same market +
//                            at least two independent sources agree
//
// Only confirmed_competitor and probable_competitor may reach the report
// (see reportableCompetitors). Everything else stays internal — visible to
// a reviewer, never printed as a finding about the prospect's market.

import { Determination, observed, absent, notDetermined } from "./odo-evidence";
import { fetchGeoapifyNearby, type GeoLocation } from "./odo-geoapify";

export type CompetitorClassification =
  | "confirmed_competitor"
  | "probable_competitor"
  | "comparable_business"
  | "irrelevant_candidate"
  | "insufficient_evidence";

export type PlacesEnrichment = {
  rating: number | null;
  reviewCount: number | null;
  address: string | null;
  businessStatus: string | null;
  types: string[];
  phone: string | null;
  website: string | null;
};

// Google Places "types" that describe every listing (not this business
// specifically) — stripped before the job description is built, so what's
// left actually says what the business does.
const GENERIC_PLACE_TYPES = new Set([
  "point_of_interest", "establishment", "store", "premise", "subpremise",
]);

/** A short, human "what they do" line built from Places categories — e.g. "Accounting firm, Tax preparation service". Never invented: empty when Places returned nothing specific. */
export function jobDescriptionFromTypes(types: string[]): string {
  const words = types
    .filter((t) => !GENERIC_PLACE_TYPES.has(t))
    .map((t) => t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()));
  const seen = new Set<string>();
  const unique = words.filter((w) => (seen.has(w) ? false : (seen.add(w), true)));
  return unique.slice(0, 3).join(", ");
}

export type CompetitorProfile = {
  name: string;
  website: string | null;
  discoverySources: string[];
  identity: Determination<PlacesEnrichment>;
  serviceOverlap: { matchedKeywords: string[]; score: number };
  geographicOverlap: boolean | null; // null = not_determined, not "no"
  classification: CompetitorClassification;
  reasoning: string;
};

export type CandidateInput = { name: string; website: string | null; source: string; snippet?: string };

const CANADIAN_CITIES = [
  "Toronto", "Mississauga", "Vaughan", "Markham", "Brampton", "Richmond Hill",
  "Scarborough", "Etobicoke", "North York", "Ottawa", "Hamilton", "London",
  "Kitchener", "Waterloo", "Windsor", "Burlington", "Oakville", "Vancouver",
  "Calgary", "Edmonton", "Montreal", "Winnipeg", "Surrey", "Ajax", "Whitby",
  "Oshawa", "Barrie", "Guelph", "Kingston", "Niagara Falls",
];

export function detectCity(text: string | null): string | null {
  if (!text) return null;
  const lower = text.toLowerCase();
  for (const city of CANADIAN_CITIES) {
    if (lower.includes(city.toLowerCase())) return city;
  }
  return null;
}

function keywordScore(candidateText: string, industryKeywords: string[]): { matchedKeywords: string[]; score: number } {
  const lower = candidateText.toLowerCase();
  const matched = industryKeywords.filter((k) => lower.includes(k.toLowerCase()));
  return { matchedKeywords: matched, score: matched.length };
}

function dedupeCandidates(candidates: CandidateInput[]): CandidateInput[] {
  const seen = new Set<string>();
  const out: CandidateInput[] = [];
  for (const c of candidates) {
    const key = (c.website || c.name).toLowerCase().trim();
    if (key && !seen.has(key)) {
      seen.add(key);
      out.push(c);
    }
  }
  return out;
}

/**
 * Places API (New) text search — used both to verify a candidate business
 * exists and to pull its rating/address for geographic-overlap checks.
 * Absence of the API key is not_determined, never "no such business."
 */
async function enrichWithPlaces(name: string, cityHint: string | null): Promise<Determination<PlacesEnrichment>> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return notDetermined("no GOOGLE_PLACES_API_KEY configured", "google-places-new");

  try {
    const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask":
          "places.displayName,places.rating,places.userRatingCount,places.formattedAddress,places.businessStatus,places.types,places.nationalPhoneNumber,places.websiteUri",
      },
      body: JSON.stringify({ textQuery: cityHint ? `${name} ${cityHint}` : name }),
      signal: AbortSignal.timeout(8000),
    });
    if (res.status === 403 || res.status === 429) {
      return notDetermined(`blocked by origin (HTTP ${res.status})`, "google-places-new");
    }
    if (!res.ok) return notDetermined(`HTTP ${res.status}`, "google-places-new");

    const data = (await res.json()) as { places?: Array<Record<string, unknown>> };
    const place = data.places?.[0];
    if (!place) return absent("google-places-new");

    return observed(
      {
        rating: (place.rating as number | undefined) ?? null,
        reviewCount: (place.userRatingCount as number | undefined) ?? null,
        address: (place.formattedAddress as string | undefined) ?? null,
        businessStatus: (place.businessStatus as string | undefined) ?? null,
        types: (place.types as string[] | undefined) ?? [],
        phone: (place.nationalPhoneNumber as string | undefined) ?? null,
        website: (place.websiteUri as string | undefined) ?? null,
      },
      "google-places-new"
    );
  } catch (err) {
    const reason = err instanceof Error ? (err.name === "TimeoutError" ? "timeout" : err.message) : String(err);
    return notDetermined(reason, "google-places-new");
  }
}

/**
 * Classify each candidate against minimum evidence rules. Caps at 5
 * candidates — Places calls cost money and a report only ever names 2-3
 * competitors anyway.
 */
export async function classifyCompetitors(
  candidates: CandidateInput[],
  context: { industryKeywords: string[]; prospectCity: string | null; targetCountry?: "CA" | "OTHER" }
): Promise<CompetitorProfile[]> {
  const top = dedupeCandidates(candidates).slice(0, 5);

  return Promise.all(
    top.map(async (c) => {
      const identity = await enrichWithPlaces(c.name, context.prospectCity);
      const overlap = keywordScore(`${c.name} ${c.snippet ?? ""}`, context.industryKeywords);

      const candidateCity = identity.state === "observed" ? detectCity(identity.value.address) : null;
      const geographicOverlap =
        context.prospectCity && candidateCity
          ? candidateCity.toLowerCase() === context.prospectCity.toLowerCase()
          : null;

      // COUNTRY GATE — approved 2026-10-01: a Canadian business only sees
      // Canadian competitors, a foreign business only sees competitors in
      // that same country. A wrong-country name in a client report is
      // exactly the "credibility-ending mistake" this module's header
      // already warns about, so this is a hard exclusion, not a downgrade —
      // but only when the address is actually known; an address ODO
      // couldn't verify is never treated as a country mismatch (fail open,
      // same rule as every other check here).
      const addressText = identity.state === "observed" ? identity.value.address?.toLowerCase() ?? "" : "";
      const addressSaysCanada = /\bcanada\b/.test(addressText);
      const countryMismatch =
        identity.state === "observed" && addressText.length > 0 && context.targetCountry
          ? (context.targetCountry === "CA" && !addressSaysCanada) ||
            (context.targetCountry === "OTHER" && addressSaysCanada)
          : false;

      const sources = new Set<string>([c.source]);
      if (identity.state === "observed") sources.add("google_places");

      const identityVerified = identity.state === "observed" && !countryMismatch;
      const hasOverlap = overlap.score > 0;
      const multiSource = sources.size >= 2;

      if (countryMismatch) {
        return {
          name: c.name,
          website: c.website,
          discoverySources: [...sources],
          identity,
          serviceOverlap: overlap,
          geographicOverlap,
          classification: "irrelevant_candidate" as CompetitorClassification,
          reasoning: `Verified business, but outside ${context.targetCountry === "CA" ? "Canada" : "the prospect's country"} — excluded by the country-restriction rule, never presented as a competitor.`,
        };
      }

      let classification: CompetitorClassification;
      let reasoning: string;

      if (identityVerified && hasOverlap && geographicOverlap === true && multiSource) {
        classification = "confirmed_competitor";
        reasoning = `Verified business, overlapping services (${overlap.matchedKeywords.join(", ")}), same market (${context.prospectCity}), confirmed by ${sources.size} independent sources.`;
      } else if (identityVerified && hasOverlap && (geographicOverlap === true || multiSource)) {
        classification = "probable_competitor";
        reasoning = "Verified business with service overlap, but geography or source count falls short of full confirmation.";
      } else if (identityVerified && !hasOverlap) {
        classification = "comparable_business";
        reasoning = "Verified, similar-type business, but no confirmed service overlap — market context only, not a direct competitor.";
      } else if (identityVerified) {
        classification = "irrelevant_candidate";
        reasoning = "Verified business, but nothing ties it to the prospect's market or services.";
      } else {
        classification = "insufficient_evidence";
        reasoning = "Could not independently verify this business — do not present it as a competitor.";
      }

      return {
        name: c.name,
        website: c.website,
        discoverySources: [...sources],
        identity,
        serviceOverlap: overlap,
        geographicOverlap,
        classification,
        reasoning,
      };
    })
  );
}

/** Only these two classifications are safe to print as a competitor finding. */
export function reportableCompetitors(profiles: CompetitorProfile[]): CompetitorProfile[] {
  return profiles.filter((p) => p.classification === "confirmed_competitor" || p.classification === "probable_competitor");
}

// ---------------------------------------------------------------------------
// Location-cascade competitor search — ODO brain rebuild, roadmap item 1.
//
// ADDED 2026-10-01 — Mohammad approved exactly this cascade: "inside canada
// - if the business was other country, check the competitor only on that
// country... for example for a company in vancouver, better to mention only
// vancouver competitor, it have more effect, if not found a competitor
// around, use the nears city, the full country." Also: "menton name can
// help to validate our report" (competitor naming approved).
//
// Implementation note: "same city / nearest city / province" are done here
// as one widening-radius search from the business's own coordinates, not as
// three separate geocoded lookups — a 15km→60km→400km radius sweep
// naturally picks up neighbouring cities before it reaches province scale,
// and Geoapify (odo-geoapify.ts) only takes a radius, not a named-city
// lookup. The final "whole country" step drops the radius filter entirely
// and relies on Tavily's web-search candidates, which are not geography-
// bound to begin with.
//
// COUNTRY RESTRICTION — a Canadian business only ever sees Canadian
// competitors; a foreign business only ever sees competitors in that same
// country. Country is read from the domain's TLD first (.ca is unambiguous),
// then from the L1 Business Profile's stated locations (odo-business-
// profile.ts), defaulting to Canada — ORAGROL's own market — only when
// neither signal says otherwise. NEEDS VERIFICATION before this ships: the
// Geoapify radius sweep has never been tested against a real account (see
// odo-geoapify.ts's own header) — spot-check once deployed.
export type LocationCascadeStep = "same_city" | "widened_radius" | "country_wide" | "none_found";

export type CascadeResult = {
  profiles: CompetitorProfile[]; // capped at 3 — "exactly 3" per Mohammad's approval, or fewer if genuinely none could be verified
  cascadeStepUsed: LocationCascadeStep;
};

/** TLD first (unambiguous when present), then the L1 Business Profile's stated locations, defaulting to Canada (ORAGROL's own market). */
export function detectCountry(domain: string, profileLocations: string[] = []): "CA" | "OTHER" {
  const tld = domain.toLowerCase().split(".").pop();
  if (tld === "ca") return "CA";
  if (tld && ["us", "uk", "au", "nz", "ie", "de", "fr", "in", "sg"].includes(tld)) return "OTHER";
  const text = profileLocations.join(" ").toLowerCase();
  if (/\bcanada\b|\bontario\b|\bquebec\b|\balberta\b|\bbritish columbia\b|\bmanitoba\b/.test(text)) return "CA";
  if (/\bunited states\b|\busa\b|\bu\.s\.\b|\bunited kingdom\b|\baustralia\b/.test(text)) return "OTHER";
  return "CA"; // default — ORAGROL's own market, see header note
}

const CASCADE_RADII: Array<{ step: LocationCascadeStep; radiusMeters: number }> = [
  { step: "same_city", radiusMeters: 15_000 },
  { step: "widened_radius", radiusMeters: 400_000 }, // sweeps in the nearest city, then effectively the whole province
];

/**
 * Widens the search radius step by step until 3 reportable (confirmed or
 * probable) competitors are found, or every step is exhausted. Never
 * fabricates a competitor to force a count of 3 — ODO's standing rule is
 * "not found" is a gap, never manufactured, same as everywhere else in
 * this research pipeline.
 */
export type CompetitorSearchOptions = {
  /** How many reportable competitors to stop at. Default 3 — Mohammad's approved client-report count. Outbound mode (internal, not client-facing) widens this to 5. */
  targetCount?: number;
  /** When true, "comparable_business" (verified, same space, no confirmed overlap) may fill remaining slots once confirmed/probable are exhausted. Off by default — client reports only ever name confirmed/probable competitors. Outbound mode turns this on since it's internal targeting intel, not a claim shown to the prospect. Never includes irrelevant_candidate or insufficient_evidence either way. */
  allowComparable?: boolean;
};

export function reportableForOptions(profiles: CompetitorProfile[], opts: Required<CompetitorSearchOptions>): CompetitorProfile[] {
  const strict = reportableCompetitors(profiles);
  if (!opts.allowComparable || strict.length >= opts.targetCount) return strict;
  const comparable = profiles.filter((p) => p.classification === "comparable_business");
  return [...strict, ...comparable.slice(0, opts.targetCount - strict.length)];
}

export async function findCascadingCompetitors(
  location: GeoLocation | null,
  industry: string | null,
  industryKeywords: string[],
  prospectCity: string | null,
  tavilyCandidates: CandidateInput[],
  targetCountry: "CA" | "OTHER" = "CA",
  options: CompetitorSearchOptions = {}
): Promise<CascadeResult> {
  const opts: Required<CompetitorSearchOptions> = { targetCount: options.targetCount ?? 3, allowComparable: options.allowComparable ?? false };
  let lastClassified: CompetitorProfile[] = [];

  if (location) {
    for (const { step, radiusMeters } of CASCADE_RADII) {
      const geoResult = await fetchGeoapifyNearby(location, industry, { radiusMeters, limit: 10 });
      const geoCandidates = geoResult.state === "observed" ? geoResult.value : [];
      const merged = dedupeCandidates([...tavilyCandidates, ...geoCandidates]);
      if (!merged.length) continue;
      const classified = await classifyCompetitors(merged, { industryKeywords, prospectCity, targetCountry });
      lastClassified = classified;
      if (reportableForOptions(classified, opts).length >= opts.targetCount) {
        return { profiles: reportableForOptions(classified, opts).slice(0, opts.targetCount), cascadeStepUsed: step };
      }
    }
  }

  // Country-wide fallback — Tavily's web-search candidates aren't geography-
  // bound, so this is the natural last step regardless of coordinates. The
  // country gate inside classifyCompetitors still applies here — this step
  // widens geography, never the country restriction.
  if (tavilyCandidates.length) {
    const classified = await classifyCompetitors(tavilyCandidates, { industryKeywords, prospectCity: null, targetCountry });
    const reportable = reportableForOptions(classified, opts);
    const best = reportable.length ? reportable : lastClassified.length ? reportableForOptions(lastClassified, opts) : [];
    if (best.length) return { profiles: best.slice(0, opts.targetCount), cascadeStepUsed: "country_wide" };
  }

  // Exhausted every step — report however many (0 included) were verified at
  // the last attempt, never a fabricated count.
  return { profiles: reportableForOptions(lastClassified, opts).slice(0, opts.targetCount), cascadeStepUsed: "none_found" };
}
