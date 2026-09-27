// ORAGROL ODO — Native DNS & identity-platform research
//
// Replaces the MXToolbox dependency entirely. Node's resolver is free,
// unlimited, faster than a third-party API, and actually returns DKIM —
// which the MXToolbox path hardcoded to `false` even when it succeeded.
//
// Every result is a Determination (see odo-evidence.ts): observed / absent /
// not_determined. A resolver timeout is never reported as a missing record.
//
// BOUNDARY: everything here is a DNS lookup or a request to a public
// discovery endpoint that any mail client performs automatically. Nothing
// probes the prospect's infrastructure.

import { Resolver } from "node:dns/promises";
import {
  type Determination,
  observed,
  absent,
  notDetermined,
  resolveOrDetermine,
  fetchOrDetermine,
} from "./odo-evidence";

// Dedicated resolver so ODO's burst of parallel lookups doesn't inherit
// whatever the platform default is configured with.
function makeResolver() {
  // Tight per-attempt budget: odo-evidence adds its own retry layer on top,
  // so a generous resolver timeout multiplies (4s x 2 tries x 3 retries = 24s
  // for a single failing lookup, and several run in parallel).
  const r = new Resolver({ timeout: 1500, tries: 1 });
  r.setServers(["1.1.1.1", "8.8.8.8"]);
  return r;
}

export function normalizeDomain(input: string): string {
  return input
    .replace(/^https?:\/\//i, "")
    .replace(/\/.*$/, "")
    .replace(/^www\./i, "")
    .trim()
    .toLowerCase();
}

// ---------------------------------------------------------------------------
// Email authentication — presence AND strength
// ---------------------------------------------------------------------------

export type SpfRecord = {
  raw: string;
  /** "-all" hard fail, "~all" soft fail, "?all" neutral, null if no all-mechanism */
  qualifier: "-all" | "~all" | "?all" | "+all" | null;
  lookupCount: number;
  /** SPF breaks silently above 10 DNS-resolving mechanisms. */
  exceedsLookupLimit: boolean;
};

export async function checkSpf(domain: string): Promise<Determination<SpfRecord>> {
  const r = makeResolver();
  const txt = await resolveOrDetermine("dns:spf", () => r.resolveTxt(domain));
  if (txt.state !== "observed") return txt as Determination<SpfRecord>;

  const flat = txt.value.map((chunks) => chunks.join(""));
  const spf = flat.find((t) => /^v=spf1\b/i.test(t));
  if (!spf) return absent<SpfRecord>("dns:spf");

  const qMatch = spf.match(/([-~?+])all\b/);
  const qualifier = qMatch ? (`${qMatch[1]}all` as SpfRecord["qualifier"]) : null;
  const lookupCount = (spf.match(/\b(include|a|mx|ptr|exists|redirect)[:=]/gi) || []).length;

  return observed(
    { raw: spf, qualifier, lookupCount, exceedsLookupLimit: lookupCount > 10 },
    "dns:spf"
  );
}

export type DmarcRecord = {
  raw: string;
  policy: "none" | "quarantine" | "reject";
  subdomainPolicy: "none" | "quarantine" | "reject" | null;
  percentage: number;
  hasAggregateReporting: boolean;
  hasForensicReporting: boolean;
  /** p=none enforces nothing. This is the finding, not the absence of DMARC. */
  isMonitorOnly: boolean;
};

export async function checkDmarc(domain: string): Promise<Determination<DmarcRecord>> {
  const r = makeResolver();
  const txt = await resolveOrDetermine("dns:dmarc", () => r.resolveTxt(`_dmarc.${domain}`));
  if (txt.state !== "observed") return txt as Determination<DmarcRecord>;

  const flat = txt.value.map((chunks) => chunks.join(""));
  const rec = flat.find((t) => /^v=DMARC1\b/i.test(t));
  if (!rec) return absent<DmarcRecord>("dns:dmarc");

  const policy = (rec.match(/\bp=(none|quarantine|reject)\b/i)?.[1]?.toLowerCase() ??
    "none") as DmarcRecord["policy"];
  const sp = rec.match(/\bsp=(none|quarantine|reject)\b/i)?.[1]?.toLowerCase() as
    | DmarcRecord["subdomainPolicy"]
    | undefined;
  const pct = Number(rec.match(/\bpct=(\d{1,3})\b/i)?.[1] ?? 100);

  return observed(
    {
      raw: rec,
      policy,
      subdomainPolicy: sp ?? null,
      percentage: Number.isFinite(pct) ? pct : 100,
      hasAggregateReporting: /\brua=/i.test(rec),
      hasForensicReporting: /\bruf=/i.test(rec),
      isMonitorOnly: policy === "none",
    },
    "dns:dmarc"
  );
}

// Common DKIM selectors by platform. DKIM has no discovery mechanism, so
// checking known selectors is the only passive route.
const DKIM_SELECTORS: Array<{ selector: string; platform: string }> = [
  { selector: "selector1", platform: "Microsoft 365" },
  { selector: "selector2", platform: "Microsoft 365" },
  { selector: "google", platform: "Google Workspace" },
  { selector: "default", platform: "generic" },
  { selector: "k1", platform: "Mailchimp/Mandrill" },
  { selector: "s1", platform: "generic" },
  { selector: "dkim", platform: "generic" },
  { selector: "mail", platform: "generic" },
];

export type DkimRecord = {
  selectorsFound: Array<{ selector: string; platform: string; target: string }>;
  /** M365 DKIM CNAMEs leak the tenant name, e.g. contoso365.onmicrosoft.com */
  tenantHint: string | null;
};

export async function checkDkim(domain: string): Promise<Determination<DkimRecord>> {
  const r = makeResolver();
  const found: DkimRecord["selectorsFound"] = [];
  let anyDetermined = false;

  const results = await Promise.allSettled(
    DKIM_SELECTORS.map(async ({ selector, platform }) => {
      const host = `${selector}._domainkey.${domain}`;
      const cname = await resolveOrDetermine(`dns:dkim:${selector}`, () => r.resolveCname(host), {
        retries: 2,
      });
      if (cname.state === "observed" && cname.value[0]) {
        return { selector, platform, target: cname.value[0], determined: true };
      }
      if (cname.state === "absent") {
        const txt = await resolveOrDetermine(`dns:dkim:${selector}`, () => r.resolveTxt(host), {
          retries: 2,
        });
        if (txt.state === "observed") {
          return { selector, platform, target: txt.value.map((c) => c.join("")).join(""), determined: true };
        }
        return { determined: txt.state === "absent" };
      }
      return { determined: false };
    })
  );

  for (const res of results) {
    if (res.status !== "fulfilled") continue;
    if (res.value.determined) anyDetermined = true;
    if ("selector" in res.value && res.value.selector) {
      found.push({ selector: res.value.selector, platform: res.value.platform!, target: res.value.target! });
    }
  }

  if (found.length > 0) {
    const tenant = found
      .map((f) => f.target.match(/([a-z0-9-]+)\.onmicrosoft\.com/i)?.[1])
      .find(Boolean);
    return observed({ selectorsFound: found, tenantHint: tenant ?? null }, "dns:dkim");
  }

  // No selector matched. That is only a finding if the lookups actually
  // answered — if every one timed out we know nothing.
  return anyDetermined
    ? absent<DkimRecord>("dns:dkim")
    : notDetermined<DkimRecord>("all selector lookups failed to resolve", "dns:dkim");
}

// ---------------------------------------------------------------------------
// Mail platform & incumbent vendor
// ---------------------------------------------------------------------------

export type MailPlatform = {
  mxHosts: string[];
  /** Mailbox provider, where determinable from MX alone. */
  provider: string | null;
  /** A security gateway in front of the mailbox — masks the provider. */
  gateway: string | null;
};

const GATEWAY_PATTERNS: Array<[RegExp, string]> = [
  [/mimecast/i, "Mimecast"],
  [/pphosted|proofpoint/i, "Proofpoint"],
  [/barracudanetworks|barracuda/i, "Barracuda"],
  [/messagelabs|symanteccloud/i, "Broadcom/Symantec"],
  [/mailcontrol/i, "Forcepoint"],
  [/trendmicro|trendmicromail/i, "Trend Micro"],
  [/sophos/i, "Sophos"],
  [/hornetsecurity|antispameurope/i, "Hornetsecurity"],
  [/fortimail|fortinet/i, "Fortinet"],
  [/cisco|iphmx/i, "Cisco Secure Email"],
];

const PROVIDER_PATTERNS: Array<[RegExp, string]> = [
  [/\.mail\.protection\.outlook\.com$/i, "Microsoft 365"],
  [/aspmx.*\.google(mail)?\.com$/i, "Google Workspace"],
  [/\.zoho\./i, "Zoho Mail"],
  [/\.protonmail\./i, "Proton Mail"],
  [/\.fastmail\./i, "Fastmail"],
  [/\.mailgun\./i, "Mailgun"],
  [/\.improvmx\./i, "ImprovMX"],
];

export async function checkMailPlatform(domain: string): Promise<Determination<MailPlatform>> {
  const r = makeResolver();
  const mx = await resolveOrDetermine("dns:mx", () => r.resolveMx(domain));
  if (mx.state !== "observed") return mx as Determination<MailPlatform>;

  const hosts = mx.value.sort((a, b) => a.priority - b.priority).map((m) => m.exchange.toLowerCase());
  const joined = hosts.join(" ");

  const gateway = GATEWAY_PATTERNS.find(([re]) => re.test(joined))?.[1] ?? null;
  const provider = PROVIDER_PATTERNS.find(([re]) => hosts.some((h) => re.test(h)))?.[1] ?? null;

  return observed({ mxHosts: hosts, provider, gateway }, "dns:mx");
}

/**
 * Definitive Microsoft 365 detection.
 *
 * MX records are NOT reliable for this: a security gateway in front of the
 * mailbox hides the provider completely. Verified against real domains,
 * MX-only detection misidentified the majority of a Mimecast/Proofpoint/
 * Barracuda-fronted sample. This endpoint is what every Office client queries
 * during account setup and answers for any domain.
 *
 * Domain-only. Never pass a synthesised username — that would be user
 * enumeration, which is out of bounds.
 */
export type M365Tenant = {
  isMicrosoft365: boolean;
  tenantId: string | null;
  /** Exchange Online confirmed via the autodiscover CNAME. */
  exchangeOnline: boolean;
  /** Entra device registration active — puts Intune/Conditional Access in scope. */
  deviceRegistration: boolean;
};

export async function checkMicrosoft365(domain: string): Promise<Determination<M365Tenant>> {
  const r = makeResolver();

  const [oidc, autodiscover, deviceReg] = await Promise.all([
    fetchOrDetermine(
      "m365:oidc",
      `https://login.microsoftonline.com/${encodeURIComponent(domain)}/.well-known/openid-configuration`,
      { timeoutMs: 8000 }
    ),
    resolveOrDetermine("dns:autodiscover", () => r.resolveCname(`autodiscover.${domain}`), { retries: 2 }),
    resolveOrDetermine("dns:enterpriseregistration", () => r.resolveCname(`enterpriseregistration.${domain}`), { retries: 2 }),
  ]);

  let tenantId: string | null = null;
  let isM365 = false;

  if (oidc.state === "observed") {
    try {
      const doc = JSON.parse(oidc.value.body) as { issuer?: string; token_endpoint?: string };
      const guid = (doc.issuer ?? doc.token_endpoint ?? "").match(
        /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i
      )?.[1];
      if (guid) {
        tenantId = guid;
        isM365 = true;
      }
    } catch {
      // Malformed response — fall through to the DNS signals below.
    }
  }

  const exchangeOnline =
    autodiscover.state === "observed" &&
    autodiscover.value.some((t) => /autodiscover\.outlook\.com/i.test(t));
  if (exchangeOnline) isM365 = true;

  const deviceRegistration =
    deviceReg.state === "observed" &&
    deviceReg.value.some((t) => /enterpriseregistration\.windows\.net/i.test(t));

  // Only report "not Microsoft" when at least one probe actually answered.
  const anyAnswered =
    oidc.state !== "not_determined" ||
    autodiscover.state !== "not_determined" ||
    deviceReg.state !== "not_determined";

  if (!isM365 && !anyAnswered) {
    return notDetermined<M365Tenant>("no identity probe returned an answer", "m365");
  }

  return observed({ isMicrosoft365: isM365, tenantId, exchangeOnline, deviceRegistration }, "m365");
}

// ---------------------------------------------------------------------------
// DNS hygiene & incumbent IT provider
// ---------------------------------------------------------------------------

const DNS_OPERATORS: Array<[RegExp, string, "hyperscale" | "registrar" | "regional"]> = [
  [/cloudflare/i, "Cloudflare", "hyperscale"],
  [/awsdns/i, "AWS Route 53", "hyperscale"],
  [/azure-dns/i, "Azure DNS", "hyperscale"],
  [/googledomains|google\.com$/i, "Google Cloud DNS", "hyperscale"],
  [/godaddy|domaincontrol/i, "GoDaddy", "registrar"],
  [/namecheap|registrar-servers/i, "Namecheap", "registrar"],
  [/wixdns/i, "Wix", "registrar"],
  [/squarespacedns/i, "Squarespace", "registrar"],
  [/shopify/i, "Shopify", "registrar"],
  [/rebel\.ca|webnames\.ca|namespro/i, "Canadian registrar", "registrar"],
];

export type DnsDelegation = {
  nameservers: string[];
  operator: string | null;
  /**
   * A small regional operator behind a mid-size company usually means a small
   * local IT shop is the incumbent — the most displaceable situation there is.
   */
  operatorClass: "hyperscale" | "registrar" | "regional" | "unknown";
};

export async function checkDnsDelegation(domain: string): Promise<Determination<DnsDelegation>> {
  const r = makeResolver();
  const ns = await resolveOrDetermine("dns:ns", () => r.resolveNs(domain));
  if (ns.state !== "observed") return ns as Determination<DnsDelegation>;

  const nameservers = ns.value.map((n) => n.toLowerCase());
  const joined = nameservers.join(" ");
  const match = DNS_OPERATORS.find(([re]) => re.test(joined));

  return observed(
    {
      nameservers,
      operator: match?.[1] ?? null,
      operatorClass: match?.[2] ?? "regional",
    },
    "dns:ns"
  );
}

export type DnsHygiene = {
  caa: Determination<string[]>;
  mtaSts: Determination<boolean>;
  tlsRpt: Determination<boolean>;
  bimi: Determination<boolean>;
};

export async function checkDnsHygiene(domain: string): Promise<DnsHygiene> {
  const r = makeResolver();
  const [caa, mtaSts, tlsRpt, bimi] = await Promise.all([
    resolveOrDetermine("dns:caa", async () =>
      (await r.resolveCaa(domain)).map((c) => c.issue ?? c.issuewild ?? c.iodef ?? "").filter(Boolean)
    ),
    resolveOrDetermine("dns:mta-sts", () => r.resolveTxt(`_mta-sts.${domain}`)),
    resolveOrDetermine("dns:tls-rpt", () => r.resolveTxt(`_smtp._tls.${domain}`)),
    resolveOrDetermine("dns:bimi", () => r.resolveTxt(`default._bimi.${domain}`)),
  ]);

  const toBool = (d: Determination<string[][]>): Determination<boolean> =>
    d.state === "observed" ? observed(true, d.source) : (d as Determination<boolean>);

  return {
    caa,
    mtaSts: toBool(mtaSts),
    tlsRpt: toBool(tlsRpt),
    bimi: toBool(bimi),
  };
}

// ---------------------------------------------------------------------------
// Aggregate
// ---------------------------------------------------------------------------

export type DnsResearch = {
  domain: string;
  spf: Determination<SpfRecord>;
  dmarc: Determination<DmarcRecord>;
  dkim: Determination<DkimRecord>;
  mail: Determination<MailPlatform>;
  microsoft365: Determination<M365Tenant>;
  delegation: Determination<DnsDelegation>;
  hygiene: DnsHygiene;
};

export async function runDnsResearch(rawDomain: string): Promise<DnsResearch> {
  const domain = normalizeDomain(rawDomain);
  const [spf, dmarc, dkim, mail, microsoft365, delegation, hygiene] = await Promise.all([
    checkSpf(domain),
    checkDmarc(domain),
    checkDkim(domain),
    checkMailPlatform(domain),
    checkMicrosoft365(domain),
    checkDnsDelegation(domain),
    checkDnsHygiene(domain),
  ]);
  return { domain, spf, dmarc, dkim, mail, microsoft365, delegation, hygiene };
}
