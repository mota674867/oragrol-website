// ORAGROL ODO — Parallel research engine
//
// Every source runs in parallel; one failure never blocks the others or
// crashes the scan (Promise.allSettled, never Promise.all).
//
// EVIDENCE RULE — read before adding a source.
// A source that cannot answer must return `not_determined`, never a value
// that reads as a finding. The removed MXToolbox path returned
// `{ spf: false, dkim: false, dmarc: false }` whenever its key was absent,
// which reported every prospect as having no email authentication at all.
// See odo-evidence.ts. Absent and not-determined are different states and
// only `absent` may be scored as a gap.
//
// REMOVED 2026-09-27 — do not reinstate without re-checking terms:
//   VirusTotal     — Public API forbids use "in commercial products or
//                    services"; ODO is one. Premium is ~$1,500-4,000/mo.
//   HaveIBeenPwned — the breacheddomain endpoint only answers for domains
//                    you have verified ownership of, so it can never scan a
//                    prospect. (A consented check of the single email the
//                    prospect supplies at intake is a separate, valid idea.)
//                    WIRED 2026-09-30 — Mohammad approved the ~$3.95/mo cost
//                    (Pending Item #22). See odo-hibp.ts: it checks only the
//                    visitor's own consented intake address via the
//                    breachedaccount endpoint, never the bare domain.
//   Shodan         — free accounts have no host-lookup API access.
//   BuiltWith      — $295/month; replaced by native fingerprinting in
//                    odo-page.ts.
//   Hunter.io      — free tier is 25 searches/month and inbound ODO has no
//                    contact to discover; deferred to Outbound Mode.
//   MXToolbox      — replaced by native DNS in odo-dns.ts, which is free,
//                    unlimited, and actually returns DKIM.
//   SecurityHeaders.io — replaced by reading response headers directly.
//
// INVESTIGATED 2026-09-29 — the master spec called these "public, no key."
// None of the four actually are; do not wire them without a real plan:
//   Facebook Ads Library — requires a verified Meta Developer account, a
//                    registered app, an access token, and sometimes identity
//                    verification. Real, but an account-setup decision for
//                    Mohammad, not a code task — same shape as the HIBP
//                    consented-check decision (Pending Item #22).
//   Google Ads Transparency Center — no official API of any kind exists;
//                    Google's own position is that the archive is for human
//                    viewing. Third parties (SerpApi/SearchApi/Apify) only
//                    offer this via reverse-engineered scraping, paid, with
//                    stated legal/ToS risk — against ODO's own evidence-
//                    provenance stance (same reasoning that excluded Shodan).
//   CIPO (Canadian Trademarks) — no live query API; ised-isde.canada.ca
//                    documents only a web search UI and an ordered bulk-data
//                    process, not a free instant per-mark lookup.
//   Corporations Canada — same shape as CIPO: a web search UI plus a bulk
//                    JSON/CSV dataset dump, no live single-corporation REST
//                    endpoint. A per-scan live lookup as the spec assumed
//                    isn't buildable; a periodic bulk-download-and-index job
//                    is a genuinely different, heavier build for later.
// All four stay as null stubs (trademarks, businessRegistry, paidAds) below,
// same as before — but now because they were checked and found infeasible
// as specified, not because they were never looked at.
//
// ADDED 2026-09-29 — OrgBook BC (bcRegistry field, odo-orgbook.ts). Licence
// confirmed: OGL-BC, commercial use allowed, attribution required wherever
// shown. BC registrations only — `absent` is never a gap for an Ontario
// prospect. See the module header before scoring anything from it.

import { runDnsResearch, type DnsResearch } from "./odo-dns";
import { runPageResearch, type PageResearch } from "./odo-page";
import { coverageReport, type Determination } from "./odo-evidence";
import { classifyCompetitors, detectCity, type CompetitorProfile, type CandidateInput } from "./odo-competitors";
import { runInfraResearch, type InfraResearch } from "./odo-infra";
import { runAttackSurfaceResearch, type AttackSurfaceResearch } from "./odo-attack-surface";
import {
  fetchPageSpeedCompliance,
  fetchRetireRepo,
  deriveCompliance,
  type PageSpeedRaw,
  type ComplianceResearch,
} from "./odo-compliance";
import { checkWaybackHistory, type WaybackHistory } from "./odo-history";
import { checkHiringSignal, type HiringSignal } from "./odo-hiring";
import { fetchGeoapifyNearby } from "./odo-geoapify";
import { lookupOrgBook, type OrgBookRecord } from "./odo-orgbook";
import { checkHibpBreach, type HibpResult } from "./odo-hibp";

export type ResearchFindings = {
  // Website & SEO
  website: WebsiteFindings | null;
  seo: SeoFindings | null;
  technologies: TechFindings | null;
  // Security
  ssl: SslFindings | null;
  mozillaObservatory: MozillaFindings | null;
  certificates: CertFindings | null;
  /** Native DNS: SPF/DKIM/DMARC with policy strength, mail platform, M365 tenant, NS delegation, DNS hygiene. */
  dns: DnsResearch | null;
  /** Native homepage analysis: tech stack, on-page SEO health, well-known files, security headers, cookies, CSP/SRI. */
  page: PageResearch | null;
  /** Domain RDAP (age/expiry/registrar lock), hosting jurisdiction, DNSSEC. */
  infra: InfraResearch | null;
  /** crt.sh-derived: infrastructure-revealing subdomain names, dangling-CNAME takeover risk. */
  attackSurface: AttackSurfaceResearch | null;
  /** Accessibility (axe-core via PageSpeed), pre-consent tracker detection, JS-library CVE mapping (retire.js DB). */
  compliance: ComplianceResearch | null;
  /** Wayback Machine capture history — first/last seen, distinct-version count, 24-month staleness proxy. */
  history: Determination<WaybackHistory> | null;
  /** Careers-page hiring signal: schema.org JobPosting entries and/or a detected ATS embed. */
  hiring: Determination<HiringSignal> | null;
  // Business
  googleBusiness: GoogleBusinessFindings | null;
  staffAndContacts: StaffFindings | null;
  crunchbase: CrunchbaseFindings | null;
  // Marketing
  webPresence: WebPresenceFindings | null;
  socialMedia: SocialFindings | null;
  /** Not implemented — see "INVESTIGATED 2026-09-29" above. Facebook Ads Library needs a Meta Developer account/app decision; Google Ads Transparency has no API at all. */
  paidAds: PaidAdsFindings | null;
  similarWeb: SimilarWebFindings | null;
  // Legal & Compliance
  /** Not implemented — CIPO has no live query API, only a search UI and an ordered bulk-data process. See "INVESTIGATED 2026-09-29" above. */
  trademarks: TrademarkFindings | null;
  /** Not implemented — Corporations Canada has no live per-corporation REST endpoint, only a search UI and a bulk dataset dump. See "INVESTIGATED 2026-09-29" above. */
  businessRegistry: RegistryFindings | null;
  /** OrgBook BC — BC registration (incl. extra-provincial) matched by exact normalized name. `absent` = not registered in BC, NOT a gap. Attribution required when shown (ORGBOOK_ATTRIBUTION). */
  bcRegistry: Determination<OrgBookRecord> | null;
  /** Credential exposure (Pending Item #22) — checks ONLY the visitor's own consented intake email via HIBP's breachedaccount endpoint. `absent` here is the GOOD outcome (never appeared in a known breach). */
  hibp: Determination<HibpResult> | null;
  // General research
  generalResearch: GeneralResearchFindings | null;
  /** Classified competitor candidates — see odo-competitors.ts. Only confirmed_competitor and probable_competitor are report-safe. */
  competitorProfiles: CompetitorProfile[] | null;
  competitors: CompetitorFindings | null;
  // Metadata
  industry: string | null;
  businessSize: "micro" | "small" | "medium" | "large" | null;
  errors: string[];
  /**
   * Reviewer-facing coverage. Which checks answered, which found a genuine
   * absence, and which could not be determined. A not-determined check is a
   * gap in ODO's coverage, never a finding about the prospect — surface it
   * here so it cannot silently become bad news in the report.
   */
  coverage: { observed: string[]; absent: string[]; notDetermined: Array<{ check: string; reason: string }> };
};

// --- Type stubs (Jev reads these) ---
export type WebsiteFindings = { url: string; pageSpeedScore: number | null; mobileScore: number | null; hasBlog: boolean; lastUpdated: string | null; brokenLinks: number };
export type SeoFindings = { domainAuthority: number | null; backlinks: number | null; topKeywords: string[]; rankingPages: number | null };
export type TechFindings = { cms: string | null; analytics: string[]; payments: string[]; marketing: string[]; framework: string | null; allTech: string[] };
export type SslFindings = { grade: string | null; validUntil: string | null; issuer: string | null; vulnerabilities: string[] };
export type EmailSecurityFindings = { spf: boolean; dkim: boolean; dmarc: boolean; dmarcPolicy: "none" | "quarantine" | "reject" | null };
export type SecurityHeadersFindings = { grade: string | null; score: number | null; missingHeaders: string[] };
export type MozillaFindings = { grade: string | null; score: number | null; tests: Record<string, unknown> };
export type BreachFindings = { breached: boolean; breachCount: number; breaches: Array<{ name: string; date: string; dataTypes: string[] }> };
export type ShodanFindings = { openPorts: number[]; exposedServices: string[]; vulnerabilities: string[] };
export type VirusTotalFindings = { malicious: number; suspicious: number; clean: boolean };
export type CertFindings = { subdomains: string[]; totalCerts: number };
export type GoogleBusinessFindings = { rating: number | null; reviewCount: number | null; responseRate: string | null; lastUpdated: string | null; categories: string[]; location: { lat: number; lon: number } | null };
export type StaffFindings = { estimatedCount: number | null; emailPattern: string | null; keyContacts: string[] };
export type CrunchbaseFindings = { founded: string | null; fundingTotal: string | null; fundingRounds: number | null; investors: string[]; employeeRange: string | null };
export type WebPresenceFindings = { hasYoutube: boolean; hasPodcast: boolean; hasApp: boolean; appRating: number | null; waybackFirstSeen: string | null };
export type SocialFindings = { linkedin: { followers: number | null; lastPost: string | null } | null; instagram: { followers: number | null; lastPost: string | null } | null; facebook: { likes: number | null } | null };
export type PaidAdsFindings = { runningFacebookAds: boolean; runningGoogleAds: boolean; adCount: number | null };
export type SimilarWebFindings = { monthlyVisits: number | null; bounceRate: number | null; topSources: string[]; competitors: string[] };
export type TrademarkFindings = { hasTrademarks: boolean; trademarkCount: number; trademarks: Array<{ name: string; status: string }> };
export type RegistryFindings = { registered: boolean; incorporationDate: string | null; status: string | null; address: string | null };
export type GeneralResearchFindings = { summary: string; keyFacts: string[]; recentNews: string[]; pressmentions: number };
export type CompetitorFindings = { competitors: Array<{ name: string; website: string | null; source: string }> };

// --- Safe fetcher ---
async function safeFetch<T>(
  name: string,
  fn: () => Promise<T>,
  errors: string[]
): Promise<T | null> {
  try {
    return await fn();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    errors.push(`${name}: ${message}`);
    console.error(`[ODO Research] ${name} failed:`, message);
    return null;
  }
}

// --- Individual API callers ---

/** Derives the legacy WebsiteFindings shape from the shared PageSpeed call (see fetchPageSpeedCompliance in odo-compliance.ts) instead of making its own second PageSpeed request for the same category. */
function deriveWebsiteFindings(url: string, raw: PageSpeedRaw | null): WebsiteFindings {
  const perf = raw?.lighthouseResult?.categories?.performance?.score;
  const score = typeof perf === "number" ? Math.round(perf * 100) : null;
  return { url, pageSpeedScore: score, mobileScore: score, hasBlog: false, lastUpdated: null, brokenLinks: 0 };
}

async function fetchSslGrade(domain: string): Promise<SslFindings> {
  const host = domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  const res = await fetch(`https://api.ssllabs.com/api/v3/analyze?host=${encodeURIComponent(host)}&fromCache=on&maxAge=24`, { signal: AbortSignal.timeout(20000) });
  const data = await res.json() as Record<string, unknown>;
  const endpoint = (data.endpoints as Array<Record<string, unknown>>)?.[0];
  return {
    grade: (endpoint?.grade as string) || null,
    validUntil: null,
    issuer: null,
    vulnerabilities: [],
  };
}


async function fetchTavily(query: string): Promise<Array<{ title: string; url: string; content: string }>> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) throw new Error("TAVILY_API_KEY not configured");
  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ api_key: apiKey, query, search_depth: "advanced", max_results: 5 }),
    signal: AbortSignal.timeout(20000),
  });
  const data = await res.json() as { results: Array<{ title: string; url: string; content: string }> };
  return data.results || [];
}


async function fetchCertificates(domain: string): Promise<CertFindings> {
  const host = domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/^www\./, "");
  const res = await fetch(`https://crt.sh/?q=%25.${encodeURIComponent(host)}&output=json`, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) return { subdomains: [], totalCerts: 0 };
  const data = await res.json() as Array<{ name_value: string }>;
  const subdomains = [...new Set(data.map(c => c.name_value).filter(n => !n.includes("*")))].slice(0, 20);
  return { subdomains, totalCerts: data.length };
}


// Migrated 2026-09-29 from the deprecated findplacefromtext endpoint to
// Places API (New) — the old endpoint is on Google's deprecation path and
// the New API is what GOOGLE_PLACES_API_KEY is provisioned for.
async function fetchGoogleBusiness(businessName: string, website: string | null): Promise<GoogleBusinessFindings> {
  const empty: GoogleBusinessFindings = { rating: null, reviewCount: null, responseRate: null, lastUpdated: null, categories: [], location: null };
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return empty;
  try {
    const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        // location.latitude/longitude added 2026-09-29 to feed Geoapify's
        // radius-based nearby-competitor search (odo-geoapify.ts) — that API
        // needs a real coordinate for the prospect and had no source before.
        "X-Goog-FieldMask": "places.rating,places.userRatingCount,places.types,places.location",
      },
      body: JSON.stringify({ textQuery: website ? `${businessName} ${website}` : businessName }),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return empty;
    const data = await res.json() as { places?: Array<Record<string, unknown>> };
    const place = data.places?.[0];
    const loc = place?.location as { latitude?: number; longitude?: number } | undefined;
    return {
      rating: (place?.rating as number | undefined) ?? null,
      reviewCount: (place?.userRatingCount as number | undefined) ?? null,
      responseRate: null,
      lastUpdated: null,
      categories: ((place?.types as string[] | undefined) ?? []).slice(0, 5),
      location: loc && typeof loc.latitude === "number" && typeof loc.longitude === "number" ? { lat: loc.latitude, lon: loc.longitude } : null,
    };
  } catch {
    return empty;
  }
}


const INDUSTRY_KEYWORDS = [
  { keywords: ["health", "medical", "clinic", "hospital", "dental", "pharmacy"], label: "Healthcare" },
  { keywords: ["law", "legal", "attorney", "lawyer", "firm"], label: "Legal" },
  { keywords: ["restaurant", "food", "cafe", "catering", "bakery"], label: "Food & Beverage" },
  { keywords: ["real estate", "property", "realty", "mortgage"], label: "Real Estate" },
  { keywords: ["tech", "software", "saas", "app", "digital", "it services"], label: "Technology" },
  { keywords: ["finance", "accounting", "tax", "bookkeeping", "cpa"], label: "Finance & Accounting" },
  { keywords: ["construction", "contractor", "building", "renovation"], label: "Construction" },
  { keywords: ["retail", "store", "shop", "ecommerce", "e-commerce"], label: "Retail" },
  { keywords: ["marketing", "advertising", "agency", "creative", "pr"], label: "Marketing & Advertising" },
  { keywords: ["education", "school", "training", "coaching", "tutoring"], label: "Education" },
  { keywords: ["manufacturing", "factory", "production", "industrial"], label: "Manufacturing" },
  { keywords: ["consulting", "advisory", "strategy", "management"], label: "Consulting" },
];

async function detectIndustryAndSize(
  generalResearch: GeneralResearchFindings | null,
  staffFindings: StaffFindings | null
): Promise<{ industry: string | null; industryKeywords: string[]; businessSize: "micro" | "small" | "medium" | "large" | null }> {
  let industry: string | null = null;
  let industryKeywords: string[] = [];
  let businessSize: "micro" | "small" | "medium" | "large" | null = null;

  if (generalResearch?.keyFacts) {
    const facts = generalResearch.keyFacts.join(" ").toLowerCase();
    for (const ind of INDUSTRY_KEYWORDS) {
      if (ind.keywords.some(k => facts.includes(k))) { industry = ind.label; industryKeywords = ind.keywords; break; }
    }
  }

  const count = staffFindings?.estimatedCount || null;
  if (count !== null) {
    if (count <= 10) businessSize = "micro";
    else if (count <= 50) businessSize = "small";
    else if (count <= 200) businessSize = "medium";
    else businessSize = "large";
  }

  return { industry, industryKeywords, businessSize };
}

// --- Main research runner ---

// Number of website-dependent sources in runParallelResearch's batch. The
// no-website branch must supply exactly this many nulls or every destructured
// result after the gap shifts/goes undefined — which is how a 10th source
// (hiring) was added on 2026-09-29 with only 9 placeholders, crashing every
// "No website?" scan. Update this count whenever a website source is added.
const WEBSITE_SOURCE_COUNT = 10;
const WEBSITE_SOURCE_PLACEHOLDERS = (): Promise<null>[] =>
  Array.from({ length: WEBSITE_SOURCE_COUNT }, () => Promise.resolve(null));

export async function runParallelResearch(
  businessName: string,
  website: string | null,
  hasWebsite: boolean,
  visitorEmail?: string | null
): Promise<ResearchFindings> {
  const errors: string[] = [];
  const domain = website || "";

  // Build all parallel promises
  const [
    generalResearch,
    competitors,
    bcRegistryResult,
    hibpResult,
    pageSpeedRawResult,
    retireRepoResult,
    ssl,
    certAndAttackSurfaceResult,
    googleBusiness,
    dnsResult,
    pageResult,
    infraResult,
    historyResult,
    hiringResult,
  ] = await Promise.allSettled([
    // General research via Tavily
    safeFetch("Tavily:general", () => fetchTavily(`${businessName} company overview services reviews`).then(results => ({
      summary: results[0]?.content?.slice(0, 500) || "",
      keyFacts: results.map(r => r.content?.slice(0, 200) || "").filter(Boolean).slice(0, 5),
      recentNews: results.filter(r => r.title?.includes("2026") || r.title?.includes("2025")).map(r => r.title).slice(0, 3),
      pressmentions: results.length,
    })), errors),
    // Competitor research via Tavily
    safeFetch("Tavily:competitors", () => fetchTavily(`${businessName} competitors alternative companies`).then(results => ({
      competitors: results.map(r => ({ name: r.title || "", website: r.url || null, source: "tavily" })).slice(0, 5),
    })), errors),
    // OrgBook BC — name-based, so it runs with or without a website.
    safeFetch("OrgBook BC", () => lookupOrgBook(businessName), errors),
    // HIBP — email-based (the visitor's own consented intake address), independent of website/hasWebsite.
    safeFetch("HIBP credential exposure", () => checkHibpBreach(visitorEmail ?? ""), errors),
    // Website-dependent sources
    ...(hasWebsite && domain ? [
      safeFetch("PageSpeed+Compliance", () => fetchPageSpeedCompliance(domain), errors),
      safeFetch("retire.js repository", () => fetchRetireRepo(), errors),
      safeFetch("SSL Labs", () => fetchSslGrade(domain), errors),
      // crt.sh's subdomain list feeds directly into attack-surface mining
      // (dangling CNAMEs, sensitive naming) — chained rather than run as a
      // separate top-level entry so it only waits on crt.sh, not the batch.
      safeFetch("crt.sh + attack surface", () =>
        fetchCertificates(domain).then(async (cert) => ({ cert, attackSurface: await runAttackSurfaceResearch(cert.subdomains) })),
        errors
      ),
      safeFetch("Google Places", () => fetchGoogleBusiness(businessName, domain), errors),
      safeFetch("DNS", () => runDnsResearch(domain), errors),
      safeFetch("Page", () => runPageResearch(domain), errors),
      safeFetch("Infra (RDAP/DNSSEC/hosting)", () => runInfraResearch(domain), errors),
      safeFetch("Wayback history", () => checkWaybackHistory(domain), errors),
      safeFetch("Hiring signal", () => checkHiringSignal(domain), errors),
    ] : WEBSITE_SOURCE_PLACEHOLDERS()),
  ]);

  function getVal<T>(result: PromiseSettledResult<unknown>): T | null {
    return result.status === "fulfilled" ? (result.value as T | null) : null;
  }

  const generalResearchData = getVal<GeneralResearchFindings>(generalResearch);
  const dns = getVal<DnsResearch>(dnsResult);
  const page = getVal<PageResearch>(pageResult);
  const infra = getVal<InfraResearch>(infraResult);
  const history = getVal<Determination<WaybackHistory>>(historyResult);
  const hiring = getVal<Determination<HiringSignal>>(hiringResult);
  const bcRegistry = getVal<Determination<OrgBookRecord>>(bcRegistryResult);
  const hibp = getVal<Determination<HibpResult>>(hibpResult);
  const pageSpeedRaw = getVal<Determination<PageSpeedRaw>>(pageSpeedRawResult);
  const retireRepo = getVal<Determination<import("./odo-compliance").RetireRepo>>(retireRepoResult);
  const certAndAttackSurface = getVal<{ cert: CertFindings; attackSurface: AttackSurfaceResearch }>(certAndAttackSurfaceResult);

  const homepageHtml = page?.snapshot.state === "observed" ? page.snapshot.value.html : null;
  const compliance: ComplianceResearch | null =
    pageSpeedRaw && retireRepo ? deriveCompliance(pageSpeedRaw, retireRepo, homepageHtml) : null;

  const websiteFindings: WebsiteFindings | null =
    hasWebsite && domain ? deriveWebsiteFindings(domain, pageSpeedRaw?.state === "observed" ? pageSpeedRaw.value : null) : null;

  // Business size: no free source gives verified headcount for a private
  // Canadian SMB (Crunchbase and Hunter are both out). Whatever comes back
  // here is Inferred tier unless the client states it directly.
  const { industry, industryKeywords, businessSize } = await detectIndustryAndSize(generalResearchData, null);

  // Competitor discovery — Tavily search results plus Geoapify's nearby-
  // business search (Section 33, Area 2), merged into one candidate pool.
  // Geoapify needs a real coordinate, which only comes from the Google
  // Places lookup above, and a category, which only comes from industry
  // detection above — so both run in this second wave, not the main batch.
  const competitorCandidates = getVal<CompetitorFindings>(competitors);
  const googleBusinessData = getVal<GoogleBusinessFindings>(googleBusiness);
  const geoapifyResult = googleBusinessData?.location
    ? await fetchGeoapifyNearby(googleBusinessData.location, industry)
    : null;
  const geoapifyCandidates: CandidateInput[] = geoapifyResult?.state === "observed" ? geoapifyResult.value : [];

  const prospectCity = detectCity(generalResearchData?.summary ?? null) ?? detectCity(businessName);
  const allCandidates = [...(competitorCandidates?.competitors ?? []), ...geoapifyCandidates];
  const competitorProfiles = allCandidates.length
    ? await classifyCompetitors(allCandidates, { industryKeywords, prospectCity })
    : null;

  // Coverage — which checks actually answered. Anything not_determined is a
  // gap in ODO, not a finding about the prospect.
  const determinations: Record<string, Determination<unknown>> = {};
  competitorProfiles?.forEach((p, i) => {
    determinations[`competitor.${i + 1}.identity`] = p.identity;
  });
  if (geoapifyResult) determinations["competitor.geoapify"] = geoapifyResult;
  if (dns) {
    determinations["email.spf"] = dns.spf;
    determinations["email.dmarc"] = dns.dmarc;
    determinations["email.dkim"] = dns.dkim;
    determinations["mail.platform"] = dns.mail;
    determinations["identity.microsoft365"] = dns.microsoft365;
    determinations["dns.delegation"] = dns.delegation;
    determinations["dns.caa"] = dns.hygiene.caa;
    determinations["dns.mtaSts"] = dns.hygiene.mtaSts;
    determinations["dns.tlsRpt"] = dns.hygiene.tlsRpt;
    determinations["dns.bimi"] = dns.hygiene.bimi;
  }
  if (page) {
    determinations["page.homepage"] = page.snapshot;
    determinations["wellknown.robots"] = page.wellKnown.robotsTxt;
    determinations["wellknown.sitemap"] = page.wellKnown.sitemapXml;
    determinations["wellknown.securityTxt"] = page.wellKnown.securityTxt;
    determinations["wellknown.privacyPolicy"] = page.wellKnown.privacyPolicy;
  }
  if (infra) {
    determinations["infra.registration"] = infra.registration;
    determinations["infra.hosting"] = infra.hosting;
    determinations["infra.dnssec"] = infra.dnssec;
  }
  if (certAndAttackSurface) {
    determinations["attackSurface.danglingCnames"] = certAndAttackSurface.attackSurface.danglingCnames;
  }
  if (compliance) {
    determinations["compliance.jsLibraries"] = compliance.jsLibraries;
  }
  if (history) determinations["research.waybackHistory"] = history;
  if (hiring) determinations["business.hiringSignal"] = hiring;
  if (bcRegistry) determinations["registry.orgbookBC"] = bcRegistry;
  if (hibp) determinations["identity.hibpExposure"] = hibp;

  return {
    website: websiteFindings,
    seo: null,
    technologies: null,
    ssl: getVal<SslFindings>(ssl),
    mozillaObservatory: null,
    certificates: certAndAttackSurface?.cert ?? null,
    dns,
    page,
    infra,
    attackSurface: certAndAttackSurface?.attackSurface ?? null,
    compliance,
    history,
    hiring,
    googleBusiness: googleBusinessData,
    staffAndContacts: null,
    crunchbase: null,
    webPresence: null,
    socialMedia: null,
    paidAds: null,
    similarWeb: null,
    trademarks: null,
    businessRegistry: null,
    bcRegistry,
    hibp,
    generalResearch: generalResearchData,
    competitors: competitorCandidates,
    competitorProfiles,
    industry,
    businessSize,
    errors,
    coverage: coverageReport(determinations),
  };
}

// --- End-screen findings summary (Section 27 of the master reference) ---
//
// Shared between the SSE stream (odo/scan/events/route.ts) and the polling
// fallback (odo/scan/status/route.ts) so both surfaces report the exact same
// numbers for the same scan — this used to live only in the SSE route,
// which meant a visitor whose browser fell back to polling (the documented,
// required fallback for "browsers or deployments without SSE support") saw
// no counts at all on the completion screen.
//
// This is a fast heuristic over already-gathered research signals, not the
// full Jev-scored evaluation the final report uses — it exists so the
// completion screen can show real, non-placeholder numbers immediately,
// per Section 27: "Numbers are real — generated from actual ODO findings,
// not placeholders."
export type OdoFindingsSummary = {
  security_issues: number;
  marketing_gaps: number;
  opportunities: number;
  total: number;
};

export function buildFindingsSummary(findings: Record<string, unknown>): OdoFindingsSummary {
  const f = findings as ResearchFindings;
  let securityIssues = 0;
  let marketingGaps = 0;
  let opportunities = 0;

  if (f.ssl?.grade && ["C", "D", "F"].includes(f.ssl.grade)) securityIssues++;
  // Count only confirmed absences. A not-determined check is a coverage gap
  // in ODO, never an issue attributed to the prospect.
  if (f.dns?.spf.state === "absent") securityIssues++;
  if (f.dns?.dkim.state === "absent") securityIssues++;
  if (f.dns?.dmarc.state === "absent") securityIssues++;
  else if (f.dns?.dmarc.state === "observed" && f.dns.dmarc.value.isMonitorOnly) securityIssues++;
  if (f.page?.wellKnown.privacyPolicy.state === "absent") securityIssues++;
  if (!f.paidAds?.runningFacebookAds && !f.paidAds?.runningGoogleAds) marketingGaps++;
  if (f.website?.pageSpeedScore && f.website.pageSpeedScore < 50) marketingGaps++;
  if (f.seo?.domainAuthority && f.seo.domainAuthority < 20) marketingGaps++;
  if (f.technologies?.allTech && f.technologies.allTech.length < 5) opportunities++;
  if (f.competitors?.competitors && f.competitors.competitors.length > 0) opportunities++;

  return {
    security_issues: securityIssues,
    marketing_gaps: marketingGaps,
    opportunities,
    total: securityIssues + marketingGaps + opportunities,
  };
}
