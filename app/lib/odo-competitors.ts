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
};

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
          "places.displayName,places.rating,places.userRatingCount,places.formattedAddress,places.businessStatus,places.types",
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
  context: { industryKeywords: string[]; prospectCity: string | null }
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

      const sources = new Set<string>([c.source]);
      if (identity.state === "observed") sources.add("google_places");

      const identityVerified = identity.state === "observed";
      const hasOverlap = overlap.score > 0;
      const multiSource = sources.size >= 2;

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
