// ORAGROL ODO — Homepage fetch + native tech-stack and on-page SEO analysis
//
// Replaces two paid vendors with code:
//   BuiltWith   ($295/month) → tech-stack fingerprinting
//   DataForSEO  (paid)       → on-page SEO health
//
// Both work by pattern-matching what the server already publishes to any
// visitor — the same method Wappalyzer uses. The page is fetched ONCE and
// both analysers read the same response, so this costs one HTTP request.
//
// On-page SEO health is more useful to ODO than keyword rankings anyway:
// "eleven pages have no meta description" is remediable work ORAGROL can
// quote for. "You rank 14th for X" is not a service.

import { type Determination, observed, absent, notDetermined, fetchOrDetermine } from "./odo-evidence";
import { normalizeDomain } from "./odo-dns";

export type PageSnapshot = {
  finalUrl: string;
  status: number;
  html: string;
  headers: Record<string, string>;
  /**
   * Raw Set-Cookie header values, one per cookie. A `Headers` object folds
   * repeated header names into one comma-joined string via `.forEach`/
   * `.get()`, which is lossless for most headers but corrupts Set-Cookie
   * (commas appear inside Expires dates and attribute lists too), so this is
   * populated via `Headers.getSetCookie()` — the undici/WHATWG method built
   * for exactly this — instead of being folded into the `headers` record.
   */
  setCookieHeaders: string[];
};

export async function fetchHomepage(rawDomain: string): Promise<Determination<PageSnapshot>> {
  const domain = normalizeDomain(rawDomain);
  for (const candidate of [`https://${domain}`, `https://www.${domain}`]) {
    const res = await fetchOrDetermine("page:home", candidate, { timeoutMs: 12000 });
    if (res.state === "observed") {
      const headers: Record<string, string> = {};
      res.value.headers.forEach((v, k) => (headers[k.toLowerCase()] = v));
      const setCookieHeaders = res.value.headers.getSetCookie?.() ?? [];
      return observed(
        { finalUrl: candidate, status: res.value.status, html: res.value.body, headers, setCookieHeaders },
        "page:home"
      );
    }
    if (res.state === "not_determined" && /blocked by origin/.test(res.reason)) return res as Determination<PageSnapshot>;
  }
  return notDetermined<PageSnapshot>("homepage unreachable on both apex and www", "page:home");
}

// ---------------------------------------------------------------------------
// Tech stack fingerprint
// ---------------------------------------------------------------------------

type Signature = { name: string; category: TechCategory; html?: RegExp; script?: RegExp; header?: [string, RegExp]; cookie?: RegExp };
export type TechCategory = "cms" | "ecommerce" | "analytics" | "marketing" | "payments" | "chat" | "framework" | "cdn" | "hosting";

const SIGNATURES: Signature[] = [
  // CMS / site builders
  { name: "WordPress", category: "cms", html: /<meta[^>]+name=["']generator["'][^>]+WordPress/i, script: /\/wp-(content|includes)\// },
  { name: "Drupal", category: "cms", html: /<meta[^>]+name=["']generator["'][^>]+Drupal/i },
  { name: "Joomla", category: "cms", html: /<meta[^>]+name=["']generator["'][^>]+Joomla/i },
  { name: "Wix", category: "cms", script: /static\.parastorage\.com|wix\.com/i },
  { name: "Squarespace", category: "cms", script: /squarespace\.com|sqspcdn/i },
  { name: "Webflow", category: "cms", html: /data-wf-(site|page)=/i },
  { name: "HubSpot CMS", category: "cms", script: /hs-sites\.com|hubspot\.net/i },
  { name: "Duda", category: "cms", script: /dudamobile|dudaone/i },
  { name: "GoDaddy Website Builder", category: "cms", script: /img1\.wsimg\.com/i },
  // Ecommerce
  { name: "Shopify", category: "ecommerce", script: /cdn\.shopify\.com/i },
  { name: "WooCommerce", category: "ecommerce", script: /\/plugins\/woocommerce\// },
  { name: "BigCommerce", category: "ecommerce", script: /bigcommerce\.com/i },
  // Frameworks
  { name: "Next.js", category: "framework", html: /id=["']__NEXT_DATA__["']|\/_next\//, header: ["x-powered-by", /next\.js/i] },
  { name: "React", category: "framework", html: /data-reactroot|__REACT_DEVTOOLS/ },
  { name: "Vue.js", category: "framework", html: /data-v-[0-9a-f]{8}|__VUE__/ },
  { name: "Angular", category: "framework", html: /ng-version=|_nghost-/ },
  // Analytics
  { name: "Google Analytics 4", category: "analytics", script: /googletagmanager\.com\/gtag\/js|gtag\(/i },
  { name: "Google Tag Manager", category: "analytics", script: /googletagmanager\.com\/gtm\.js/i },
  { name: "Meta Pixel", category: "analytics", script: /connect\.facebook\.net.*fbevents/i },
  { name: "Hotjar", category: "analytics", script: /static\.hotjar\.com/i },
  { name: "Microsoft Clarity", category: "analytics", script: /clarity\.ms/i },
  { name: "Matomo", category: "analytics", script: /matomo\.(js|php)/i },
  { name: "LinkedIn Insight", category: "analytics", script: /snap\.licdn\.com/i },
  // Marketing / CRM
  { name: "HubSpot", category: "marketing", script: /js\.hs-scripts\.com|hs-analytics/i },
  { name: "Mailchimp", category: "marketing", script: /chimpstatic\.com|list-manage\.com/i },
  { name: "Klaviyo", category: "marketing", script: /klaviyo\.com/i },
  { name: "ActiveCampaign", category: "marketing", script: /activehosted\.com/i },
  { name: "Salesforce/Pardot", category: "marketing", script: /pardot\.com|force\.com/i },
  // Payments
  { name: "Stripe", category: "payments", script: /js\.stripe\.com/i },
  { name: "PayPal", category: "payments", script: /paypal(objects)?\.com/i },
  { name: "Square", category: "payments", script: /squareup\.com|squarecdn/i },
  // Chat / support
  { name: "Intercom", category: "chat", script: /widget\.intercom\.io/i },
  { name: "Tawk.to", category: "chat", script: /embed\.tawk\.to/i },
  { name: "Zendesk", category: "chat", script: /zdassets\.com|zendesk\.com/i },
  { name: "Drift", category: "chat", script: /js\.driftt\.com/i },
  { name: "Crisp", category: "chat", script: /client\.crisp\.chat/i },
  { name: "LiveChat", category: "chat", script: /cdn\.livechatinc\.com/i },
  // CDN / hosting
  { name: "Cloudflare", category: "cdn", header: ["server", /cloudflare/i] },
  { name: "Vercel", category: "hosting", header: ["server", /vercel/i] },
  { name: "Netlify", category: "hosting", header: ["server", /netlify/i] },
  { name: "Microsoft IIS", category: "hosting", header: ["server", /microsoft-iis/i] },
  { name: "Apache", category: "hosting", header: ["server", /apache/i] },
  { name: "nginx", category: "hosting", header: ["server", /nginx/i] },
];

export type TechStack = {
  detected: Array<{ name: string; category: TechCategory }>;
  byCategory: Partial<Record<TechCategory, string[]>>;
  generator: string | null;
  poweredBy: string | null;
  /** Third-party hosts loading script — supply-chain surface. */
  thirdPartyScriptHosts: string[];
  /** No analytics at all is itself a finding for a business buying automation. */
  hasAnalytics: boolean;
  hasChatWidget: boolean;
  hasPayments: boolean;
};

export function analyzeTechStack(page: PageSnapshot): TechStack {
  const { html, headers, finalUrl } = page;
  const detected: TechStack["detected"] = [];

  for (const sig of SIGNATURES) {
    const hit =
      (sig.html && sig.html.test(html)) ||
      (sig.script && sig.script.test(html)) ||
      (sig.cookie && sig.cookie.test(headers["set-cookie"] ?? "")) ||
      (sig.header && sig.header[1].test(headers[sig.header[0]] ?? ""));
    if (hit) detected.push({ name: sig.name, category: sig.category });
  }

  const byCategory: TechStack["byCategory"] = {};
  for (const d of detected) (byCategory[d.category] ??= []).push(d.name);

  let ownHost = "";
  try {
    ownHost = new URL(finalUrl).hostname.replace(/^www\./, "");
  } catch {
    /* finalUrl is always constructed by us, but stay defensive */
  }

  const scriptHosts = new Set<string>();
  for (const m of html.matchAll(/<script[^>]+src=["']([^"']+)["']/gi)) {
    try {
      const u = new URL(m[1], finalUrl);
      const h = u.hostname.replace(/^www\./, "");
      if (h && h !== ownHost && !h.endsWith(`.${ownHost}`)) scriptHosts.add(h);
    } catch {
      /* skip malformed src */
    }
  }

  return {
    detected,
    byCategory,
    generator: html.match(/<meta[^>]+name=["']generator["'][^>]+content=["']([^"']+)["']/i)?.[1] ?? null,
    poweredBy: headers["x-powered-by"] ?? null,
    thirdPartyScriptHosts: [...scriptHosts].sort(),
    hasAnalytics: (byCategory.analytics?.length ?? 0) > 0,
    hasChatWidget: (byCategory.chat?.length ?? 0) > 0,
    hasPayments: (byCategory.payments?.length ?? 0) > 0,
  };
}

// ---------------------------------------------------------------------------
// Web security hardening — headers, cookies, CSP/SRI
//
// Section 33, Area 4. The master spec named "Mozilla Observatory" as the
// source, assuming its npm package (`@mdn/mdn-http-observatory`) was a
// lightweight importable scorer. It is not — `npm view` shows it depends on
// @fastify/*, pg, postgrator-cli and @sentry/node: it IS the Observatory's
// backend service, not a library, and installing it would drag a Postgres-
// backed Fastify app into this Next.js serverless bundle for no reason.
//
// So this reads the same publicly-documented header/cookie/CSP rubric
// natively, directly off the response ODO already fetched — no second
// request, no new dependency — and reports it as ODO's own findings list
// (present/absent per header, per cookie, per script tag). It is NOT
// presented as "your Mozilla Observatory grade" anywhere downstream: that
// would claim equivalence with a specific third-party grading algorithm
// ODO is not actually running, which is exactly the kind of fabricated
// tool-equivalence this project's evidence rules exist to prevent.
// ---------------------------------------------------------------------------

export type SecurityHeaderFinding = { header: string; present: boolean; value: string | null };

export type SecurityHeaders = {
  findings: SecurityHeaderFinding[];
  hsts: boolean;
  csp: boolean;
  xFrameOptions: boolean;
  xContentTypeOptions: boolean;
  referrerPolicy: boolean;
  permissionsPolicy: boolean;
  /** Count of the six checked headers that are present. Not a percentile or a vendor grade. */
  presentCount: number;
  missingCount: number;
};

const SECURITY_HEADER_CHECKS: Array<{ key: string; label: string }> = [
  { key: "strict-transport-security", label: "Strict-Transport-Security (HSTS)" },
  { key: "content-security-policy", label: "Content-Security-Policy" },
  { key: "x-frame-options", label: "X-Frame-Options" },
  { key: "x-content-type-options", label: "X-Content-Type-Options" },
  { key: "referrer-policy", label: "Referrer-Policy" },
  { key: "permissions-policy", label: "Permissions-Policy" },
];

export function analyzeSecurityHeaders(page: PageSnapshot): SecurityHeaders {
  const findings: SecurityHeaderFinding[] = SECURITY_HEADER_CHECKS.map(({ key, label }) => ({
    header: label,
    present: page.headers[key] !== undefined,
    value: page.headers[key] ?? null,
  }));
  const missingCount = findings.filter((f) => !f.present).length;

  return {
    findings,
    hsts: page.headers["strict-transport-security"] !== undefined,
    csp: page.headers["content-security-policy"] !== undefined,
    xFrameOptions: page.headers["x-frame-options"] !== undefined,
    xContentTypeOptions: page.headers["x-content-type-options"] !== undefined,
    referrerPolicy: page.headers["referrer-policy"] !== undefined,
    permissionsPolicy: page.headers["permissions-policy"] !== undefined,
    presentCount: findings.length - missingCount,
    missingCount,
  };
}

export type CookieFinding = { name: string; secure: boolean; httpOnly: boolean; sameSite: string | null };

export type CookieSecurity = {
  cookies: CookieFinding[];
  totalCookies: number;
  /** Missing Secure or HttpOnly — a session-hijack/XSS-exfiltration risk, not a style nitpick. */
  insecureCookies: number;
};

function parseSetCookie(raw: string): CookieFinding {
  const attrs = raw.split(";").map((p) => p.trim());
  const nameValue = attrs[0] ?? raw;
  const name = nameValue.split("=")[0]?.trim() || nameValue;
  const rest = attrs.slice(1);
  const secure = rest.some((a) => a.toLowerCase() === "secure");
  const httpOnly = rest.some((a) => a.toLowerCase() === "httponly");
  const sameSiteRaw = rest.find((a) => a.toLowerCase().startsWith("samesite="));
  const sameSite = sameSiteRaw ? sameSiteRaw.split("=")[1]?.trim() ?? null : null;
  return { name, secure, httpOnly, sameSite };
}

export function analyzeCookies(page: PageSnapshot): CookieSecurity {
  const cookies = page.setCookieHeaders.map(parseSetCookie);
  const insecureCookies = cookies.filter((c) => !c.secure || !c.httpOnly).length;
  return { cookies, totalCookies: cookies.length, insecureCookies };
}

export type ContentSecurityAnalysis = {
  hasCsp: boolean;
  cspValue: string | null;
  /** `unsafe-inline`/`unsafe-eval` in a CSP defeat most of what a CSP is for. */
  cspAllowsUnsafeInline: boolean;
  cspAllowsUnsafeEval: boolean;
  /** Third-party <script src> tags with no `integrity` attribute — a compromised CDN silently changes what runs on the prospect's site. */
  thirdPartyScriptsWithoutSri: string[];
  totalThirdPartyScripts: number;
};

export function analyzeContentSecurity(page: PageSnapshot, thirdPartyScriptHosts: string[]): ContentSecurityAnalysis {
  const cspValue = page.headers["content-security-policy"] ?? null;
  const hasCsp = cspValue !== null;
  const cspAllowsUnsafeInline = hasCsp && /unsafe-inline/i.test(cspValue);
  const cspAllowsUnsafeEval = hasCsp && /unsafe-eval/i.test(cspValue);

  const thirdPartyHosts = new Set(thirdPartyScriptHosts);
  const withoutSri = new Set<string>();
  for (const m of page.html.matchAll(/<script\b[^>]*\ssrc=["']([^"']+)["'][^>]*>/gi)) {
    const tag = m[0];
    const src = m[1];
    let host = "";
    try {
      host = new URL(src, page.finalUrl).hostname.replace(/^www\./, "");
    } catch {
      continue;
    }
    if (thirdPartyHosts.has(host) && !/\sintegrity\s*=/i.test(tag)) withoutSri.add(src);
  }

  return {
    hasCsp,
    cspValue,
    cspAllowsUnsafeInline,
    cspAllowsUnsafeEval,
    thirdPartyScriptsWithoutSri: [...withoutSri],
    totalThirdPartyScripts: thirdPartyHosts.size,
  };
}

// ---------------------------------------------------------------------------
// On-page SEO health
// ---------------------------------------------------------------------------

export type SeoHealth = {
  title: string | null;
  titleLength: number;
  metaDescription: string | null;
  metaDescriptionLength: number;
  h1Count: number;
  h1Text: string[];
  hasCanonical: boolean;
  hasOpenGraph: boolean;
  hasStructuredData: boolean;
  structuredDataTypes: string[];
  imagesTotal: number;
  imagesMissingAlt: number;
  hasViewportMeta: boolean;
  langAttribute: string | null;
  issues: string[];
};

export function analyzeSeo(page: PageSnapshot): SeoHealth {
  const { html } = page;
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() ?? null;
  const metaDescription =
    html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)?.[1]?.trim() ?? null;
  const h1Text = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) =>
    m[1].replace(/<[^>]+>/g, "").trim()
  );

  const imgTags = [...html.matchAll(/<img\b[^>]*>/gi)].map((m) => m[0]);
  const imagesMissingAlt = imgTags.filter((t) => !/\balt\s*=\s*["'][^"']+["']/i.test(t)).length;

  const ldTypes = new Set<string>();
  for (const m of html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const parsed = JSON.parse(m[1].trim()) as unknown;
      const walk = (n: unknown) => {
        if (Array.isArray(n)) return n.forEach(walk);
        if (n && typeof n === "object") {
          const t = (n as Record<string, unknown>)["@type"];
          if (typeof t === "string") ldTypes.add(t);
          else if (Array.isArray(t)) t.forEach((x) => typeof x === "string" && ldTypes.add(x));
        }
      };
      walk(parsed);
    } catch {
      /* invalid JSON-LD is itself common; don't fail the scan for it */
    }
  }

  const issues: string[] = [];
  if (!title) issues.push("No <title> tag");
  else if (title.length < 30) issues.push(`Title is short (${title.length} characters)`);
  else if (title.length > 60) issues.push(`Title may be truncated in search results (${title.length} characters)`);
  if (!metaDescription) issues.push("No meta description");
  else if (metaDescription.length > 160) issues.push(`Meta description may be truncated (${metaDescription.length} characters)`);
  if (h1Text.length === 0) issues.push("No H1 heading");
  else if (h1Text.length > 1) issues.push(`${h1Text.length} H1 headings (should be one)`);
  if (imagesMissingAlt > 0) issues.push(`${imagesMissingAlt} of ${imgTags.length} images have no alt text`);
  if (ldTypes.size === 0) issues.push("No structured data (schema.org) markup");
  if (!/<link[^>]+rel=["']canonical["']/i.test(html)) issues.push("No canonical URL");
  if (!/<meta[^>]+name=["']viewport["']/i.test(html)) issues.push("No viewport meta tag (mobile rendering)");

  return {
    title,
    titleLength: title?.length ?? 0,
    metaDescription,
    metaDescriptionLength: metaDescription?.length ?? 0,
    h1Count: h1Text.length,
    h1Text: h1Text.slice(0, 5),
    hasCanonical: /<link[^>]+rel=["']canonical["']/i.test(html),
    hasOpenGraph: /<meta[^>]+property=["']og:/i.test(html),
    hasStructuredData: ldTypes.size > 0,
    structuredDataTypes: [...ldTypes],
    imagesTotal: imgTags.length,
    imagesMissingAlt,
    hasViewportMeta: /<meta[^>]+name=["']viewport["']/i.test(html),
    langAttribute: html.match(/<html[^>]+lang=["']([^"']+)["']/i)?.[1] ?? null,
    issues,
  };
}

// ---------------------------------------------------------------------------
// Well-known files
// ---------------------------------------------------------------------------

export type WellKnown = {
  robotsTxt: Determination<boolean>;
  sitemapXml: Determination<boolean>;
  securityTxt: Determination<boolean>;
  privacyPolicy: Determination<string>;
};

const PRIVACY_PATHS = ["/privacy-policy", "/privacy", "/privacy-notice", "/legal/privacy"];

export async function checkWellKnown(rawDomain: string): Promise<WellKnown> {
  const domain = normalizeDomain(rawDomain);
  const base = `https://${domain}`;
  const toBool = (d: Determination<{ status: number; body: string; headers: Headers }>): Determination<boolean> =>
    d.state === "observed" ? observed(true, d.source) : (d as unknown as Determination<boolean>);

  const [robots, sitemap, security, ...privacy] = await Promise.all([
    fetchOrDetermine("wellknown:robots", `${base}/robots.txt`, { timeoutMs: 6000 }),
    fetchOrDetermine("wellknown:sitemap", `${base}/sitemap.xml`, { timeoutMs: 6000 }),
    fetchOrDetermine("wellknown:security.txt", `${base}/.well-known/security.txt`, { timeoutMs: 6000 }),
    ...PRIVACY_PATHS.map((p) => fetchOrDetermine("wellknown:privacy", `${base}${p}`, { timeoutMs: 6000 })),
  ]);

  const foundPrivacy = privacy.findIndex((p) => p.state === "observed");
  const privacyDetermined = privacy.some((p) => p.state !== "not_determined");

  return {
    robotsTxt: toBool(robots),
    sitemapXml: toBool(sitemap),
    securityTxt: toBool(security),
    privacyPolicy:
      foundPrivacy >= 0
        ? observed(PRIVACY_PATHS[foundPrivacy], "wellknown:privacy")
        : privacyDetermined
          ? absent<string>("wellknown:privacy")
          : notDetermined<string>("all privacy-policy paths unreachable", "wellknown:privacy"),
  };
}

// ---------------------------------------------------------------------------
// Aggregate
// ---------------------------------------------------------------------------

export type PageResearch = {
  snapshot: Determination<PageSnapshot>;
  techStack: TechStack | null;
  seo: SeoHealth | null;
  wellKnown: WellKnown;
  securityHeaders: SecurityHeaders | null;
  cookies: CookieSecurity | null;
  contentSecurity: ContentSecurityAnalysis | null;
};

export async function runPageResearch(rawDomain: string): Promise<PageResearch> {
  const [snapshot, wellKnown] = await Promise.all([fetchHomepage(rawDomain), checkWellKnown(rawDomain)]);
  const page = snapshot.state === "observed" ? snapshot.value : null;
  const techStack = page ? analyzeTechStack(page) : null;
  return {
    snapshot,
    techStack,
    seo: page ? analyzeSeo(page) : null,
    wellKnown,
    securityHeaders: page ? analyzeSecurityHeaders(page) : null,
    cookies: page ? analyzeCookies(page) : null,
    contentSecurity: page && techStack ? analyzeContentSecurity(page, techStack.thirdPartyScriptHosts) : null,
  };
}
