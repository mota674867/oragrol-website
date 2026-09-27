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
//   Shodan         — free accounts have no host-lookup API access.
//   BuiltWith      — $295/month; replaced by native fingerprinting in
//                    odo-page.ts.
//   Hunter.io      — free tier is 25 searches/month and inbound ODO has no
//                    contact to discover; deferred to Outbound Mode.
//   MXToolbox      — replaced by native DNS in odo-dns.ts, which is free,
//                    unlimited, and actually returns DKIM.
//   SecurityHeaders.io — replaced by reading response headers directly.

import { runDnsResearch, type DnsResearch } from "./odo-dns";
import { runPageResearch, type PageResearch } from "./odo-page";
import { coverageReport } from "./odo-evidence";

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
  /** Native homepage analysis: tech stack, on-page SEO health, well-known files. */
  page: PageResearch | null;
  // Business
  googleBusiness: GoogleBusinessFindings | null;
  staffAndContacts: StaffFindings | null;
  crunchbase: CrunchbaseFindings | null;
  // Marketing
  webPresence: WebPresenceFindings | null;
  socialMedia: SocialFindings | null;
  paidAds: PaidAdsFindings | null;
  similarWeb: SimilarWebFindings | null;
  // Legal & Compliance
  trademarks: TrademarkFindings | null;
  businessRegistry: RegistryFindings | null;
  // General research
  generalResearch: GeneralResearchFindings | null;
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
export type GoogleBusinessFindings = { rating: number | null; reviewCount: number | null; responseRate: string | null; lastUpdated: string | null; categories: string[] };
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

async function fetchPageSpeed(url: string): Promise<WebsiteFindings> {
  const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY;
  const endpoint = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=mobile${apiKey ? `&key=${apiKey}` : ""}`;
  const res = await fetch(endpoint, { signal: AbortSignal.timeout(15000) });
  const data = await res.json() as Record<string, unknown>;
  const categories = (data.lighthouseResult as Record<string, unknown>)?.categories as Record<string, Record<string, number>> | undefined;
  return {
    url,
    pageSpeedScore: Math.round((categories?.performance?.score ?? 0) * 100) || null,
    mobileScore: Math.round((categories?.performance?.score ?? 0) * 100) || null,
    hasBlog: false,
    lastUpdated: null,
    brokenLinks: 0,
  };
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


async function fetchGoogleBusiness(businessName: string, website: string | null): Promise<GoogleBusinessFindings> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return { rating: null, reviewCount: null, responseRate: null, lastUpdated: null, categories: [] };
  const query = encodeURIComponent(businessName + (website ? ` site:${website}` : ""));
  const res = await fetch(`https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${query}&inputtype=textquery&fields=rating,user_ratings_total,types&key=${apiKey}`, { signal: AbortSignal.timeout(10000) });
  const data = await res.json() as Record<string, unknown>;
  const place = (data.candidates as Array<Record<string, unknown>> | undefined)?.[0];
  return {
    rating: (place?.rating as number | undefined) || null,
    reviewCount: (place?.user_ratings_total as number | undefined) || null,
    responseRate: null,
    lastUpdated: null,
    categories: ((place?.types as string[] | undefined) || []).slice(0, 5),
  };
}


async function detectIndustryAndSize(
  generalResearch: GeneralResearchFindings | null,
  staffFindings: StaffFindings | null
): Promise<{ industry: string | null; businessSize: "micro" | "small" | "medium" | "large" | null }> {
  let industry: string | null = null;
  let businessSize: "micro" | "small" | "medium" | "large" | null = null;

  if (generalResearch?.keyFacts) {
    const facts = generalResearch.keyFacts.join(" ").toLowerCase();
    const industries = [
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
    for (const ind of industries) {
      if (ind.keywords.some(k => facts.includes(k))) { industry = ind.label; break; }
    }
  }

  const count = staffFindings?.estimatedCount || null;
  if (count !== null) {
    if (count <= 10) businessSize = "micro";
    else if (count <= 50) businessSize = "small";
    else if (count <= 200) businessSize = "medium";
    else businessSize = "large";
  }

  return { industry, businessSize };
}

// --- Main research runner ---

export async function runParallelResearch(
  businessName: string,
  website: string | null,
  hasWebsite: boolean
): Promise<ResearchFindings> {
  const errors: string[] = [];
  const domain = website || "";

  // Build all parallel promises
  const [
    generalResearch,
    competitors,
    pageSpeed,
    ssl,
    certificates,
    googleBusiness,
    dnsResult,
    pageResult,
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
    // Website-dependent sources
    ...(hasWebsite && domain ? [
      safeFetch("PageSpeed", () => fetchPageSpeed(domain), errors),
      safeFetch("SSL Labs", () => fetchSslGrade(domain), errors),
      safeFetch("crt.sh", () => fetchCertificates(domain), errors),
      safeFetch("Google Places", () => fetchGoogleBusiness(businessName, domain), errors),
      safeFetch("DNS", () => runDnsResearch(domain), errors),
      safeFetch("Page", () => runPageResearch(domain), errors),
    ] : [
      Promise.resolve(null), Promise.resolve(null), Promise.resolve(null),
      Promise.resolve(null), Promise.resolve(null), Promise.resolve(null),
    ]),
  ]);

  function getVal<T>(result: PromiseSettledResult<unknown>): T | null {
    return result.status === "fulfilled" ? (result.value as T | null) : null;
  }

  const generalResearchData = getVal<GeneralResearchFindings>(generalResearch);
  const dns = getVal<DnsResearch>(dnsResult);
  const page = getVal<PageResearch>(pageResult);

  // Business size: no free source gives verified headcount for a private
  // Canadian SMB (Crunchbase and Hunter are both out). Whatever comes back
  // here is Inferred tier unless the client states it directly.
  const { industry, businessSize } = await detectIndustryAndSize(generalResearchData, null);

  // Coverage — which checks actually answered. Anything not_determined is a
  // gap in ODO, not a finding about the prospect.
  const determinations: Record<string, import("./odo-evidence").Determination<unknown>> = {};
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

  return {
    website: getVal<WebsiteFindings>(pageSpeed),
    seo: null,
    technologies: null,
    ssl: getVal<SslFindings>(ssl),
    mozillaObservatory: null,
    certificates: getVal<CertFindings>(certificates),
    dns,
    page,
    googleBusiness: getVal<GoogleBusinessFindings>(googleBusiness),
    staffAndContacts: null,
    crunchbase: null,
    webPresence: null,
    socialMedia: null,
    paidAds: null,
    similarWeb: null,
    trademarks: null,
    businessRegistry: null,
    generalResearch: generalResearchData,
    competitors: getVal<CompetitorFindings>(competitors),
    industry,
    businessSize,
    errors,
    coverage: coverageReport(determinations),
  };
}
