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
};

export async function fetchHomepage(rawDomain: string): Promise<Determination<PageSnapshot>> {
  const domain = normalizeDomain(rawDomain);
  for (const candidate of [`https://${domain}`, `https://www.${domain}`]) {
    const res = await fetchOrDetermine("page:home", candidate, { timeoutMs: 12000 });
    if (res.state === "observed") {
      const headers: Record<string, string> = {};
      res.value.headers.forEach((v, k) => (headers[k.toLowerCase()] = v));
      return observed({ finalUrl: candidate, status: res.value.status, html: res.value.body, headers }, "page:home");
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
};

export async function runPageResearch(rawDomain: string): Promise<PageResearch> {
  const [snapshot, wellKnown] = await Promise.all([fetchHomepage(rawDomain), checkWellKnown(rawDomain)]);
  const page = snapshot.state === "observed" ? snapshot.value : null;
  return {
    snapshot,
    techStack: page ? analyzeTechStack(page) : null,
    seo: page ? analyzeSeo(page) : null,
    wellKnown,
  };
}
