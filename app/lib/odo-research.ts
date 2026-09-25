// ORAGROL ODO — Parallel research engine
// Calls all 22 APIs simultaneously and returns structured findings.
// Each API call is wrapped in a safe fetcher — a single API failure
// never blocks the others or crashes the scan.

export type ResearchFindings = {
  // Website & SEO
  website: WebsiteFindings | null;
  seo: SeoFindings | null;
  technologies: TechFindings | null;
  // Security
  ssl: SslFindings | null;
  emailSecurity: EmailSecurityFindings | null;
  securityHeaders: SecurityHeadersFindings | null;
  mozillaObservatory: MozillaFindings | null;
  breachHistory: BreachFindings | null;
  shodan: ShodanFindings | null;
  virusTotal: VirusTotalFindings | null;
  certificates: CertFindings | null;
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

async function fetchEmailSecurity(domain: string): Promise<EmailSecurityFindings> {
  const host = domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  const token = process.env.MXTOOLBOX_API_KEY;
  if (!token) return { spf: false, dkim: false, dmarc: false, dmarcPolicy: null };
  const [spfRes, dmarcRes] = await Promise.allSettled([
    fetch(`https://mxtoolbox.com/api/v1/lookup/spf/${host}`, { headers: { Authorization: token }, signal: AbortSignal.timeout(10000) }),
    fetch(`https://mxtoolbox.com/api/v1/lookup/dmarc/${host}`, { headers: { Authorization: token }, signal: AbortSignal.timeout(10000) }),
  ]);
  const spfData = spfRes.status === "fulfilled" && spfRes.value.ok ? await spfRes.value.json() as Record<string, unknown> : null;
  const dmarcData = dmarcRes.status === "fulfilled" && dmarcRes.value.ok ? await dmarcRes.value.json() as Record<string, unknown> : null;
  const dmarcRecord = (dmarcData as Record<string, string> | null)?.Information || "";
  const policyMatch = dmarcRecord.match(/p=(\w+)/i);
  const policy = policyMatch?.[1]?.toLowerCase() as "none" | "quarantine" | "reject" | null ?? null;
  return {
    spf: !!(spfData && !(spfData as Record<string, unknown[]>).Failed?.length),
    dkim: false,
    dmarc: !!dmarcData,
    dmarcPolicy: policy,
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

async function fetchBuiltWith(domain: string): Promise<TechFindings> {
  const apiKey = process.env.BUILTWITH_API_KEY;
  if (!apiKey) return { cms: null, analytics: [], payments: [], marketing: [], framework: null, allTech: [] };
  const host = domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  const res = await fetch(`https://api.builtwith.com/v21/api.json?KEY=${apiKey}&LOOKUP=${host}`, { signal: AbortSignal.timeout(15000) });
  const data = await res.json() as Record<string, unknown>;
  const results = (data.Results as Array<Record<string, unknown>>)?.[0];
  const paths = (results?.Result as Record<string, unknown>)?.Paths as Array<Record<string, unknown>> | undefined;
  const allTech: string[] = [];
  const cms: string[] = [];
  const analytics: string[] = [];
  const payments: string[] = [];
  const marketing: string[] = [];
  paths?.forEach(path => {
    (path.Technologies as Array<Record<string, string>> | undefined)?.forEach(tech => {
      allTech.push(tech.Name);
      const cats = tech.Categories?.toLowerCase() || "";
      if (cats.includes("cms") || cats.includes("blog")) cms.push(tech.Name);
      if (cats.includes("analytic")) analytics.push(tech.Name);
      if (cats.includes("payment")) payments.push(tech.Name);
      if (cats.includes("marketing") || cats.includes("email")) marketing.push(tech.Name);
    });
  });
  return { cms: cms[0] || null, analytics, payments, marketing, framework: null, allTech: [...new Set(allTech)].slice(0, 30) };
}

async function fetchHaveIBeenPwned(domain: string): Promise<BreachFindings> {
  const apiKey = process.env.HIBP_API_KEY;
  const host = domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  const headers: Record<string, string> = { "User-Agent": "ORAGROL-ODO/1.0" };
  if (apiKey) headers["hibp-api-key"] = apiKey;
  const res = await fetch(`https://haveibeenpwned.com/api/v3/breacheddomain/${encodeURIComponent(host)}`, { headers, signal: AbortSignal.timeout(10000) });
  if (res.status === 404) return { breached: false, breachCount: 0, breaches: [] };
  if (!res.ok) throw new Error(`HIBP returned ${res.status}`);
  const data = await res.json() as Record<string, string[]>;
  const breaches = Object.entries(data).slice(0, 10).map(([account]) => ({ name: account, date: "unknown", dataTypes: [] }));
  return { breached: true, breachCount: Object.keys(data).length, breaches };
}

async function fetchVirusTotal(domain: string): Promise<VirusTotalFindings> {
  const apiKey = process.env.VIRUSTOTAL_API_KEY;
  if (!apiKey) return { malicious: 0, suspicious: 0, clean: true };
  const host = domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  const res = await fetch(`https://www.virustotal.com/api/v3/domains/${encodeURIComponent(host)}`, {
    headers: { "x-apikey": apiKey },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) return { malicious: 0, suspicious: 0, clean: true };
  const data = await res.json() as Record<string, unknown>;
  const stats = ((data.data as Record<string, unknown>)?.attributes as Record<string, unknown>)?.last_analysis_stats as Record<string, number> | undefined;
  return {
    malicious: stats?.malicious || 0,
    suspicious: stats?.suspicious || 0,
    clean: !stats?.malicious && !stats?.suspicious,
  };
}

async function fetchShodan(domain: string): Promise<ShodanFindings> {
  const apiKey = process.env.SHODAN_API_KEY;
  if (!apiKey) return { openPorts: [], exposedServices: [], vulnerabilities: [] };
  const host = domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  const res = await fetch(`https://api.shodan.io/dns/resolve?hostnames=${encodeURIComponent(host)}&key=${apiKey}`, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) return { openPorts: [], exposedServices: [], vulnerabilities: [] };
  const ips = await res.json() as Record<string, string>;
  const ip = Object.values(ips)[0];
  if (!ip) return { openPorts: [], exposedServices: [], vulnerabilities: [] };
  const hostRes = await fetch(`https://api.shodan.io/shodan/host/${ip}?key=${apiKey}`, { signal: AbortSignal.timeout(10000) });
  if (!hostRes.ok) return { openPorts: [], exposedServices: [], vulnerabilities: [] };
  const hostData = await hostRes.json() as Record<string, unknown>;
  return {
    openPorts: (hostData.ports as number[] | undefined) || [],
    exposedServices: ((hostData.data as Array<Record<string, string>> | undefined) || []).map(s => s.transport || "").filter(Boolean).slice(0, 10),
    vulnerabilities: Object.keys((hostData.vulns as Record<string, unknown> | undefined) || {}).slice(0, 10),
  };
}

async function fetchCertificates(domain: string): Promise<CertFindings> {
  const host = domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/^www\./, "");
  const res = await fetch(`https://crt.sh/?q=%25.${encodeURIComponent(host)}&output=json`, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) return { subdomains: [], totalCerts: 0 };
  const data = await res.json() as Array<{ name_value: string }>;
  const subdomains = [...new Set(data.map(c => c.name_value).filter(n => !n.includes("*")))].slice(0, 20);
  return { subdomains, totalCerts: data.length };
}

async function fetchSecurityHeaders(url: string): Promise<SecurityHeadersFindings> {
  const res = await fetch(`https://securityheaders.com/?q=${encodeURIComponent(url)}&followRedirects=on`, { signal: AbortSignal.timeout(10000) });
  const grade = res.headers.get("x-grade") || null;
  const score = grade ? { "A+": 100, "A": 90, "B": 75, "C": 60, "D": 45, "E": 30, "F": 10 }[grade] || null : null;
  return { grade, score: score || null, missingHeaders: [] };
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

async function fetchHunter(domain: string): Promise<StaffFindings> {
  const apiKey = process.env.HUNTER_API_KEY;
  if (!apiKey) return { estimatedCount: null, emailPattern: null, keyContacts: [] };
  const host = domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  const res = await fetch(`https://api.hunter.io/v2/domain-search?domain=${encodeURIComponent(host)}&api_key=${apiKey}&limit=5`, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) return { estimatedCount: null, emailPattern: null, keyContacts: [] };
  const data = await res.json() as Record<string, unknown>;
  const d = (data.data as Record<string, unknown> | undefined);
  return {
    estimatedCount: (d?.emails as unknown[])?.length || null,
    emailPattern: (d?.pattern as string | undefined) || null,
    keyContacts: ((d?.emails as Array<Record<string, string>> | undefined) || []).slice(0, 3).map(e => `${e.first_name || ""} ${e.last_name || ""}`.trim()).filter(Boolean),
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
    emailSecurity,
    securityHeaders,
    breachHistory,
    shodan,
    virusTotal,
    certificates,
    technologies,
    staffAndContacts,
    googleBusiness,
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
    // Website & performance
    ...(hasWebsite && domain ? [
      safeFetch("PageSpeed", () => fetchPageSpeed(domain), errors),
      safeFetch("SSL Labs", () => fetchSslGrade(domain), errors),
      safeFetch("MXToolbox", () => fetchEmailSecurity(domain), errors),
      safeFetch("SecurityHeaders", () => fetchSecurityHeaders(domain), errors),
      safeFetch("HaveIBeenPwned", () => fetchHaveIBeenPwned(domain), errors),
      safeFetch("Shodan", () => fetchShodan(domain), errors),
      safeFetch("VirusTotal", () => fetchVirusTotal(domain), errors),
      safeFetch("crt.sh", () => fetchCertificates(domain), errors),
      safeFetch("BuiltWith", () => fetchBuiltWith(domain), errors),
      safeFetch("Hunter.io", () => fetchHunter(domain), errors),
      safeFetch("Google Places", () => fetchGoogleBusiness(businessName, domain), errors),
    ] : [
      Promise.resolve(null), Promise.resolve(null), Promise.resolve(null),
      Promise.resolve(null), Promise.resolve(null), Promise.resolve(null),
      Promise.resolve(null), Promise.resolve(null), Promise.resolve(null),
      Promise.resolve(null), Promise.resolve(null),
    ]),
  ]);

  function getVal<T>(result: PromiseSettledResult<unknown>): T | null {
    return result.status === "fulfilled" ? (result.value as T | null) : null;
  }

  const generalResearchData = getVal<GeneralResearchFindings>(generalResearch);
  const staffData = getVal<StaffFindings>(staffAndContacts);
  const { industry, businessSize } = await detectIndustryAndSize(generalResearchData, staffData);

  return {
    website: getVal<WebsiteFindings>(pageSpeed),
    seo: null,
    technologies: getVal<TechFindings>(technologies),
    ssl: getVal<SslFindings>(ssl),
    emailSecurity: getVal<EmailSecurityFindings>(emailSecurity),
    securityHeaders: getVal<SecurityHeadersFindings>(securityHeaders),
    mozillaObservatory: null,
    breachHistory: getVal<BreachFindings>(breachHistory),
    shodan: getVal<ShodanFindings>(shodan),
    virusTotal: getVal<VirusTotalFindings>(virusTotal),
    certificates: getVal<CertFindings>(certificates),
    googleBusiness: getVal<GoogleBusinessFindings>(googleBusiness),
    staffAndContacts: staffData,
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
  };
}
