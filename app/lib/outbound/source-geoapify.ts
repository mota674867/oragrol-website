// ORAGROL Outbound engine — where business names come from: Geoapify Places.
//
// Already used by ODO (odo-geoapify.ts); free tier is 3,000 requests a day.
// One request returns one page of places for one area x sector. The engine
// asks for the next page only when it needs more businesses.
//
// Terms: Geoapify serves OpenStreetMap data (ODbL). Anything that SHOWS these
// results to a viewer must carry "Powered by Geoapify" and the OSM attribution.
//
// NEEDS VERIFICATION on the first live run: the property names read below
// (website, contact.phone, formatted address...) follow Geoapify's documented
// Places response; real coverage of websites and phones is unknown and is what
// the pilot measures.

import type { Area, Sector } from "./plan";

export type Prospect = {
  name: string;
  website: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  postcode: string | null;
  sourceId: string;
  source: "geoapify";
  areaId: string;
  sectorId: string;
};

export type SourcePage = { prospects: Prospect[]; exhausted: boolean };
export type Source = (area: Area, sector: Sector, offset: number, limit: number) => Promise<SourcePage>;

type Props = Record<string, unknown>;
const str = (v: unknown): string | null => (typeof v === "string" && v.trim() ? v.trim() : null);

export function prospectFromGeoapify(p: Props, area: Area, sector: Sector): Prospect | null {
  const name = str(p.name);
  if (!name) return null;
  const contact = (p.contact ?? {}) as Props;
  const raw = ((p.datasource as Props | undefined)?.raw ?? {}) as Props;
  const website = str(p.website) ?? str(contact.website) ?? str(raw.website) ?? str(raw["contact:website"]);
  const phone = str(contact.phone) ?? str(raw.phone) ?? str(raw["contact:phone"]);
  const sourceId = str(p.place_id) ?? `${name}|${str(p.formatted) ?? ""}`;
  return {
    name,
    website,
    phone,
    address: str(p.formatted) ?? str(p.address_line2),
    city: str(p.city),
    province: str(p.state_code) ?? area.province,
    postcode: str(p.postcode),
    sourceId,
    source: "geoapify",
    areaId: area.id,
    sectorId: sector.id,
  };
}

export function makeGeoapifySource(apiKey: string, fetchImpl: typeof fetch = fetch): Source {
  return async (area, sector, offset, limit) => {
    const params = new URLSearchParams({
      categories: sector.categories.join(","),
      filter: `circle:${area.lon},${area.lat},${Math.round(area.radiusKm * 1000)}`,
      bias: `proximity:${area.lon},${area.lat}`,
      limit: String(limit),
      offset: String(offset),
      apiKey,
    });
    const res = await fetchImpl(`https://api.geoapify.com/v2/places?${params.toString()}`, {
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error(`Geoapify HTTP ${res.status}`);
    const data = (await res.json()) as { features?: Array<{ properties?: Props }> };
    const features = data.features ?? [];
    const prospects = features
      .map((f) => prospectFromGeoapify(f.properties ?? {}, area, sector))
      .filter((x): x is Prospect => x !== null);
    return { prospects, exhausted: features.length < limit };
  };
}
