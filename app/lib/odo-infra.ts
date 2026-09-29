// ORAGROL ODO — Domain registration, hosting jurisdiction & DNSSEC
//
// Section 33, Area 5 (Expanded Research Source Registry, 2026-09-27).
// All three checks are free, keyless, standards-based (RDAP is RFC 9083;
// DNS-over-HTTPS JSON is a de-facto standard both Cloudflare and Google
// serve identically) — no vendor account, no rate-limit surprises.
//
// EVIDENCE RULE: same as every other module here (odo-evidence.ts). A
// malformed or unreachable RDAP/DoH response is not_determined, never
// "domain has no registrar lock" or "not signed."
//
// Node's `dns` module cannot resolve DS/DNSKEY records (there is no
// `resolveDs`/`resolveDnskey` in `node:dns/promises`), so DNSSEC status is
// read from a resolver's own validation result via DNS-over-HTTPS instead
// of asking the authoritative chain directly. That is a validating-resolver
// opinion, not a direct chain-of-trust check — good enough to say "the
// domain publishes DS records and a validating resolver approves them,"
// not by itself a cryptographic re-verification.

import { Resolver } from "node:dns/promises";
import { type Determination, observed, absent, notDetermined, fetchOrDetermine } from "./odo-evidence";
import { normalizeDomain } from "./odo-dns";

// ---------------------------------------------------------------------------
// Domain RDAP — age, expiry, registrar lock
// ---------------------------------------------------------------------------

// A small map of the RDAP servers ODO's actual ICP will hit most: Canadian
// SMBs skew .ca and .com/.org/.net. rdap.org is a public bootstrap
// redirector (resolves any TLD per the IANA bootstrap registry, RFC 7484)
// used as the fallback for anything not in this map, rather than ODO
// maintaining its own copy of the full IANA bootstrap file.
const RDAP_SERVERS: Record<string, string> = {
  ca: "https://rdap.cira.ca/domain/",
  com: "https://rdap.verisign.com/com/v1/domain/",
  net: "https://rdap.verisign.com/net/v1/domain/",
  org: "https://rdap.publicinterestregistry.org/rdap/domain/",
};

function rdapDomainUrl(domain: string): string {
  const tld = domain.split(".").pop() ?? "";
  const base = RDAP_SERVERS[tld] ?? "https://rdap.org/domain/";
  return `${base}${domain}`;
}

export type DomainRegistration = {
  registrar: string | null;
  createdAt: string | null;
  expiresAt: string | null;
  /** True when expiry is inside the next 90 days — a concrete operational risk. */
  expiringWithin90Days: boolean;
  /** clientTransferProhibited or serverTransferProhibited set — domain is locked against transfer. */
  transferLocked: boolean;
  statuses: string[];
};

type RdapEvent = { eventAction?: string; eventDate?: string };
type RdapEntity = {
  roles?: string[];
  vcardArray?: [string, Array<[string, Record<string, unknown>, string, string?]>];
};
type RdapDomainResponse = {
  ldhName?: string;
  events?: RdapEvent[];
  status?: string[];
  entities?: RdapEntity[];
  secureDNS?: { delegationSigned?: boolean };
};

function entityName(entities: RdapEntity[] | undefined, role: string): string | null {
  const match = entities?.find((e) => e.roles?.includes(role));
  const fnField = match?.vcardArray?.[1]?.find((f) => f[0] === "fn");
  return (fnField?.[3] as string | undefined) ?? null;
}

export async function checkDomainRegistration(rawDomain: string): Promise<Determination<DomainRegistration>> {
  const domain = normalizeDomain(rawDomain);
  const res = await fetchOrDetermine("rdap:domain", rdapDomainUrl(domain), { timeoutMs: 10000 });
  if (res.state !== "observed") return res as Determination<DomainRegistration>;

  let data: RdapDomainResponse;
  try {
    data = JSON.parse(res.value.body) as RdapDomainResponse;
  } catch {
    return notDetermined<DomainRegistration>("malformed RDAP response", "rdap:domain");
  }
  if (!data.ldhName && !data.events) {
    // Some registries return a well-formed "not found" RDAP error object
    // rather than a 404 — treat a response with none of the expected shape
    // as absent-of-registration only when it explicitly says so, otherwise
    // not_determined rather than guessing.
    return notDetermined<DomainRegistration>("RDAP response missing expected fields", "rdap:domain");
  }

  const created = data.events?.find((e) => e.eventAction === "registration")?.eventDate ?? null;
  const expires = data.events?.find((e) => e.eventAction === "expiration")?.eventDate ?? null;
  const statuses = data.status ?? [];
  const transferLocked = statuses.some((s) => /transferprohibited/i.test(s));

  let expiringWithin90Days = false;
  if (expires) {
    const days = (new Date(expires).getTime() - Date.now()) / 86_400_000;
    expiringWithin90Days = Number.isFinite(days) && days >= 0 && days <= 90;
  }

  return observed(
    {
      registrar: entityName(data.entities, "registrar"),
      createdAt: created,
      expiresAt: expires,
      expiringWithin90Days,
      transferLocked,
      statuses,
    },
    "rdap:domain"
  );
}

// ---------------------------------------------------------------------------
// Hosting jurisdiction — where the site's A record actually lives
// ---------------------------------------------------------------------------

export type HostingJurisdiction = {
  ip: string;
  country: string | null;
  org: string | null;
  /** Canadian personal data hosted outside Canada is a PIPEDA/Law 25 cross-border-disclosure question, not a defect by itself. */
  isCanada: boolean;
};

type RdapIpEntity = { roles?: string[]; vcardArray?: RdapEntity["vcardArray"] };
type RdapIpResponse = { country?: string; name?: string; entities?: RdapIpEntity[] };

export async function checkHostingJurisdiction(rawDomain: string): Promise<Determination<HostingJurisdiction>> {
  const domain = normalizeDomain(rawDomain);
  const r = new Resolver({ timeout: 1500, tries: 1 });
  r.setServers(["1.1.1.1", "8.8.8.8"]);

  let ip: string | null = null;
  try {
    const addrs = await r.resolve4(domain);
    ip = addrs[0] ?? null;
  } catch {
    return notDetermined<HostingJurisdiction>("could not resolve an A record", "rdap:ip");
  }
  if (!ip) return notDetermined<HostingJurisdiction>("no A record returned", "rdap:ip");

  const res = await fetchOrDetermine("rdap:ip", `https://rdap.org/ip/${ip}`, { timeoutMs: 10000 });
  if (res.state !== "observed") return res as Determination<HostingJurisdiction>;

  try {
    const data = JSON.parse(res.value.body) as RdapIpResponse;
    const country = data.country ?? entityName(data.entities as RdapEntity[] | undefined, "registrant") ?? null;
    const org = data.name ?? null;
    return observed(
      { ip, country, org, isCanada: country === "CA" },
      "rdap:ip"
    );
  } catch {
    return notDetermined<HostingJurisdiction>("malformed RDAP IP response", "rdap:ip");
  }
}

// ---------------------------------------------------------------------------
// DNSSEC — via DNS-over-HTTPS, reading the resolver's AD flag
// ---------------------------------------------------------------------------

export type DnssecStatus = {
  /** The resolving DNS server validated a signed chain for this name. */
  validatedByResolver: boolean;
};

type DohResponse = { Status?: number; AD?: boolean };

export async function checkDnssec(rawDomain: string): Promise<Determination<DnssecStatus>> {
  const domain = normalizeDomain(rawDomain);
  const res = await fetchOrDetermine(
    "dnssec:doh",
    `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=A`,
    { timeoutMs: 8000, headers: { Accept: "application/dns-json" } }
  );
  if (res.state !== "observed") return res as Determination<DnssecStatus>;

  try {
    const data = JSON.parse(res.value.body) as DohResponse;
    if (typeof data.AD !== "boolean") {
      return notDetermined<DnssecStatus>("resolver response missing AD flag", "dnssec:doh");
    }
    // AD=false is not proof of "unsigned" — an unsigned domain and a signed-
    // but-not-validated one both read AD=false from this single query. Only
    // AD=true is a positive, reportable finding; false is reported as
    // absent because that is the honest default for the overwhelming
    // majority of SMB domains, which do not sign at all.
    return data.AD ? observed({ validatedByResolver: true }, "dnssec:doh") : absent<DnssecStatus>("dnssec:doh");
  } catch {
    return notDetermined<DnssecStatus>("malformed DoH response", "dnssec:doh");
  }
}

// ---------------------------------------------------------------------------
// Aggregate
// ---------------------------------------------------------------------------

export type InfraResearch = {
  registration: Determination<DomainRegistration>;
  hosting: Determination<HostingJurisdiction>;
  dnssec: Determination<DnssecStatus>;
};

export async function runInfraResearch(rawDomain: string): Promise<InfraResearch> {
  const [registration, hosting, dnssec] = await Promise.all([
    checkDomainRegistration(rawDomain),
    checkHostingJurisdiction(rawDomain),
    checkDnssec(rawDomain),
  ]);
  return { registration, hosting, dnssec };
}
