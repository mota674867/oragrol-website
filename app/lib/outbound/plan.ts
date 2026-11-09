// ORAGROL Outbound engine — the search plan.
//
// Mohammad sets the plan once (areas and sectors) and changes it only when he
// wants. Every night the engine takes the next area x sector that is not
// resting, reads businesses from the source, and moves on when that
// combination has no more businesses. A finished combination rests 90 days.
//
// Order: Greater Toronto Area first, then the rest of Ontario, then the rest of
// Canada. Quebec areas are left out of the default plan because Quebec leads
// are held for French and the Law 25 check; add them when that is ready.
//
// NEEDS VERIFICATION: the Geoapify category names below come from Geoapify's
// documented category list, not from a live query. Check result quality per
// category on the first real run. OpenStreetMap data has no employee count, so
// firm size cannot be filtered at the source; size comes from the sector mix.

export type Area = {
  id: string;
  name: string;
  province: string;
  /** 1 = GTA, 2 = rest of Ontario, 3 = rest of Canada */
  tier: 1 | 2 | 3;
  lat: number;
  lon: number;
  radiusKm: number;
};

export type Sector = {
  id: string;
  label: string;
  /** Geoapify categories (comma-joined in the request). */
  categories: string[];
  /** Typical firm size in this sector, for the two email openings. */
  size: "small" | "mid";
};

export type SearchPlan = { areas: Area[]; sectors: Sector[]; paused?: string[] };

export type PlanItemState = {
  /** Next page offset at the source. */
  offset: number;
  /** Date (YYYY-MM-DD) this combination was finished; it rests from then. */
  finishedOn?: string;
};

export type PlanState = Record<string, PlanItemState>;

export type PlanItem = { key: string; area: Area; sector: Sector; offset: number };

export const DEFAULT_PLAN: SearchPlan = {
  areas: [
    { id: "toronto", name: "Toronto", province: "ON", tier: 1, lat: 43.6532, lon: -79.3832, radiusKm: 12 },
    { id: "mississauga", name: "Mississauga", province: "ON", tier: 1, lat: 43.589, lon: -79.6441, radiusKm: 12 },
    { id: "vaughan", name: "Vaughan", province: "ON", tier: 1, lat: 43.8361, lon: -79.4983, radiusKm: 10 },
    { id: "markham", name: "Markham", province: "ON", tier: 1, lat: 43.8561, lon: -79.337, radiusKm: 10 },
    { id: "brampton", name: "Brampton", province: "ON", tier: 1, lat: 43.7315, lon: -79.7624, radiusKm: 10 },
    { id: "oakville", name: "Oakville", province: "ON", tier: 1, lat: 43.4675, lon: -79.6877, radiusKm: 8 },
    { id: "richmond-hill", name: "Richmond Hill", province: "ON", tier: 1, lat: 43.8828, lon: -79.4403, radiusKm: 8 },
    { id: "burlington", name: "Burlington", province: "ON", tier: 1, lat: 43.3255, lon: -79.799, radiusKm: 8 },
    { id: "ottawa", name: "Ottawa", province: "ON", tier: 2, lat: 45.4215, lon: -75.6972, radiusKm: 15 },
    { id: "hamilton", name: "Hamilton", province: "ON", tier: 2, lat: 43.2557, lon: -79.8711, radiusKm: 12 },
    { id: "kitchener", name: "Kitchener-Waterloo", province: "ON", tier: 2, lat: 43.4516, lon: -80.4925, radiusKm: 12 },
    { id: "london-on", name: "London", province: "ON", tier: 2, lat: 42.9849, lon: -81.2453, radiusKm: 12 },
    { id: "calgary", name: "Calgary", province: "AB", tier: 3, lat: 51.0447, lon: -114.0719, radiusKm: 15 },
    { id: "edmonton", name: "Edmonton", province: "AB", tier: 3, lat: 53.5461, lon: -113.4938, radiusKm: 15 },
    { id: "vancouver", name: "Vancouver", province: "BC", tier: 3, lat: 49.2827, lon: -123.1207, radiusKm: 15 },
    { id: "winnipeg", name: "Winnipeg", province: "MB", tier: 3, lat: 49.8951, lon: -97.1384, radiusKm: 12 },
    { id: "halifax", name: "Halifax", province: "NS", tier: 3, lat: 44.6488, lon: -63.5752, radiusKm: 12 },
  ],
  sectors: [
    { id: "accounting", label: "Accounting firms", categories: ["office.accountant"], size: "mid" },
    { id: "law", label: "Law firms", categories: ["office.lawyer"], size: "mid" },
    { id: "dental", label: "Dental clinics", categories: ["healthcare.dentist"], size: "small" },
    { id: "clinics", label: "Medical and health clinics", categories: ["healthcare.clinic_or_praxis"], size: "small" },
    { id: "insurance", label: "Insurance brokers", categories: ["office.insurance"], size: "small" },
    { id: "real-estate", label: "Real estate offices", categories: ["office.estate_agent"], size: "small" },
    { id: "it-services", label: "IT and tech companies", categories: ["office.it"], size: "mid" },
    { id: "manufacturing", label: "Manufacturing", categories: ["production.factory"], size: "mid" },
  ],
};

export const planKey = (areaId: string, sectorId: string): string => `${areaId}|${sectorId}`;

function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000);
}

/** Is this combination resting on `today`? */
export function isResting(s: PlanItemState | undefined, today: string, restDays: number): boolean {
  return !!s?.finishedOn && daysBetween(s.finishedOn, today) < restDays;
}

/**
 * Combinations to work, in order: area tier, then area order, then sector
 * order. Resting and paused combinations are left out. A combination whose
 * rest has ended starts again from the first page.
 */
export function nextItems(plan: SearchPlan, state: PlanState, today: string, restDays: number): PlanItem[] {
  const paused = new Set(plan.paused ?? []);
  const areas = [...plan.areas].map((a, i) => ({ a, i })).sort((x, y) => x.a.tier - y.a.tier || x.i - y.i).map((x) => x.a);
  const out: PlanItem[] = [];
  for (const area of areas) {
    if (paused.has(area.id)) continue;
    for (const sector of plan.sectors) {
      if (paused.has(sector.id)) continue;
      const key = planKey(area.id, sector.id);
      if (paused.has(key)) continue;
      const s = state[key];
      if (isResting(s, today, restDays)) continue;
      const offset = s && !s.finishedOn ? s.offset : 0;
      out.push({ key, area, sector, offset });
    }
  }
  return out;
}

/** Basic checks so a bad edit to the plan fails loudly instead of searching nowhere. */
export function validatePlan(plan: SearchPlan): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const a of plan.areas) {
    if (ids.has(a.id)) errors.push(`duplicate id ${a.id}`);
    ids.add(a.id);
    if (!(a.lat >= 41 && a.lat <= 84 && a.lon >= -142 && a.lon <= -52)) errors.push(`area ${a.id} is outside Canada`);
    if (!(a.radiusKm > 0 && a.radiusKm <= 50)) errors.push(`area ${a.id} radius must be 1 to 50 km`);
  }
  for (const s of plan.sectors) {
    if (ids.has(s.id)) errors.push(`duplicate id ${s.id}`);
    ids.add(s.id);
    if (s.categories.length === 0) errors.push(`sector ${s.id} has no category`);
  }
  if (plan.areas.length === 0) errors.push("the plan has no area");
  if (plan.sectors.length === 0) errors.push("the plan has no sector");
  return errors;
}
