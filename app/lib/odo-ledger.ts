// ORAGROL ODO — Evidence ledger
//
// Turns raw research findings + visitor answers into ONE flat, numbered
// list of facts. Everything downstream — service matching (Jev), the SWOT
// (Claude), the report, the ZM77 payload — reads this ledger and nothing
// else, so every conclusion can cite an evidence ID (E3, A2) back to a
// concrete source. Master Reference §6/§19: every finding cites its evidence.
//
// TIER RULES (§6.1, written in as code, not left to review):
//   observed — (a) a directly observed technical fact (DNS record, header,
//              certificate log, registry entry), or (b) a direct, unhedged
//              answer to a direct question.
//   inferred — hedged answers ("not sure", "not that we know of"), pattern
//              or category signals, single incidents, anything reasoned
//              rather than seen.
// A not_determined research check produces NO ledger entry at all — it is a
// coverage gap in ODO, never a fact about the prospect (§20 Pending #20).
//
// `supports` lists service codes this fact is evidence OF NEED for.
// `counters` lists service codes this fact is evidence AGAINST (a strength).
// `audience: "internal"` facts (incumbent IT provider, tenant IDs) go to the
// reviewer/ZM77 only and never into the client report.

import type { ResearchFindings } from "./odo-research";
import type { InterviewState } from "./odo-interviewer";
import { reportableCompetitors } from "./odo-competitors";

export type Tier = "observed" | "inferred";
export type Polarity = "gap" | "strength" | "context";
export type Severity = "high" | "medium" | "low" | "info";
export type Area =
  | "email" | "web" | "domain" | "exposure" | "privacy" | "governance"
  | "identity" | "data" | "people" | "ai" | "operations" | "presence" | "business";

export type Evidence = {
  id: string;
  fact: string;
  /** The raw thing observed — the DNS record, header value, answer text. Shown beside the finding (§34 counter: show raw evidence). */
  raw?: string;
  source: string;
  tier: Tier;
  polarity: Polarity;
  severity: Severity;
  area: Area;
  supports: string[];
  counters: string[];
  framework?: string;
  audience: "client" | "internal";
  collectedAt: string;
};

type Draft = Omit<Evidence, "id" | "collectedAt" | "counters" | "supports" | "audience"> & {
  supports?: string[];
  counters?: string[];
  audience?: "client" | "internal";
};

const today = () => new Date().toISOString();

export const AREA_LABEL: Record<Area, string> = {
  email: "Email security",
  web: "Website security",
  domain: "Domain & DNS",
  exposure: "External exposure",
  privacy: "Privacy & compliance",
  governance: "Security governance",
  identity: "Identity & access",
  data: "Data protection",
  people: "People & awareness",
  ai: "AI use",
  operations: "Operations & automation",
  presence: "Online presence",
  business: "Business profile",
};

/** Research-derived facts. Pure function of the findings — deterministic and testable. */
export function researchEvidence(f: ResearchFindings): Draft[] {
  const out: Draft[] = [];
  const add = (d: Draft) => out.push(d);

  // ---- Email authentication (CIS 9) ----
  const dns = f.dns;
  if (dns) {
    if (dns.spf.state === "absent") {
      add({ fact: "No SPF record is published — anyone can send email that claims to be from this domain.", source: "DNS TXT lookup", tier: "observed", polarity: "gap", severity: "high", area: "email", supports: ["C04-S02"], framework: "CIS 9" });
    } else if (dns.spf.state === "observed") {
      const s = dns.spf.value;
      if (s.qualifier === "+all" || s.qualifier === "?all" || s.qualifier === null) {
        add({ fact: `SPF is published but ends in ${s.qualifier ?? "no 'all' rule"}, so it does not tell receivers to reject forged mail.`, raw: s.raw, source: "DNS TXT lookup", tier: "observed", polarity: "gap", severity: "medium", area: "email", supports: ["C04-S02"], framework: "CIS 9" });
      } else {
        add({ fact: `SPF is published with a ${s.qualifier} policy.`, raw: s.raw, source: "DNS TXT lookup", tier: "observed", polarity: "strength", severity: "info", area: "email", counters: [] });
      }
      if (s.exceedsLookupLimit) {
        add({ fact: `SPF needs ${s.lookupCount} DNS lookups — over the limit of 10, so it can fail silently for some receivers.`, raw: s.raw, source: "DNS TXT lookup", tier: "observed", polarity: "gap", severity: "medium", area: "email", supports: ["C04-S02"], framework: "RFC 7208" });
      }
    }

    if (dns.dmarc.state === "absent") {
      add({ fact: "No DMARC record is published — receiving mail servers get no instruction to block spoofed email from this domain.", source: "DNS TXT lookup (_dmarc)", tier: "observed", polarity: "gap", severity: "high", area: "email", supports: ["C04-S02"], framework: "CIS 9" });
    } else if (dns.dmarc.state === "observed") {
      const d = dns.dmarc.value;
      if (d.isMonitorOnly) {
        add({ fact: "DMARC is published but set to p=none (monitor only) — it blocks no spoofed email.", raw: d.raw, source: "DNS TXT lookup (_dmarc)", tier: "observed", polarity: "gap", severity: "high", area: "email", supports: ["C04-S02"], framework: "CIS 9" });
      } else {
        add({ fact: `DMARC is enforced (p=${d.policy}).`, raw: d.raw, source: "DNS TXT lookup (_dmarc)", tier: "observed", polarity: "strength", severity: "info", area: "email" });
      }
      if (!d.hasAggregateReporting) {
        add({ fact: "DMARC has no aggregate reporting address, so nobody receives reports about who is sending as this domain.", raw: d.raw, source: "DNS TXT lookup (_dmarc)", tier: "observed", polarity: "gap", severity: "low", area: "email", supports: ["C04-S02"] });
      }
    }

    // DKIM: ODO checks common selectors only — absence of those is NOT proof
    // DKIM is off (custom selectors exist). Inferred, never observed.
    if (dns.dkim.state === "absent") {
      add({ fact: "No DKIM signing key was found at the common selectors checked (a custom selector may exist).", source: "DNS CNAME/TXT lookup (common DKIM selectors)", tier: "inferred", polarity: "gap", severity: "medium", area: "email", supports: ["C04-S02"] });
    } else if (dns.dkim.state === "observed" && dns.dkim.value.selectorsFound.length > 0) {
      add({ fact: `DKIM signing is set up (${dns.dkim.value.selectorsFound.map((s) => s.platform).filter(Boolean).join(", ") || "selector found"}).`, source: "DNS CNAME/TXT lookup", tier: "observed", polarity: "strength", severity: "info", area: "email" });
    }

    if (dns.hygiene.mtaSts.state === "absent") {
      add({ fact: "MTA-STS is not configured, so inbound mail delivery to this domain can be downgraded to unencrypted.", source: "DNS TXT lookup (_mta-sts)", tier: "observed", polarity: "gap", severity: "low", area: "email", supports: ["C04-S02"] });
    }
    if (dns.hygiene.caa.state === "absent") {
      add({ fact: "No CAA record restricts which certificate authorities may issue certificates for this domain.", source: "DNS CAA lookup", tier: "observed", polarity: "gap", severity: "low", area: "domain", supports: ["C07-S02"] });
    }

    if (dns.microsoft365.state === "observed" && dns.microsoft365.value.isMicrosoft365) {
      const m = dns.microsoft365.value;
      add({ fact: `Runs Microsoft 365${m.exchangeOnline ? " with Exchange Online email" : ""}${m.deviceRegistration ? "; Entra device registration is active" : ""}.`, source: "Microsoft tenant discovery (public)", tier: "observed", polarity: "context", severity: "info", area: "business" });
    }
    if (dns.mail.state === "observed") {
      const m = dns.mail.value;
      if (m.gateway) add({ fact: `Inbound email passes through a ${m.gateway} security gateway.`, source: "DNS MX lookup", tier: "observed", polarity: "strength", severity: "info", area: "email", counters: [] });
      const isM365 = dns.microsoft365.state === "observed" && dns.microsoft365.value.isMicrosoft365;
      if (m.provider && !isM365) add({ fact: `Email is hosted on ${m.provider}.`, source: "DNS MX lookup", tier: "observed", polarity: "context", severity: "info", area: "business" });
    }
    if (dns.delegation.state === "observed" && dns.delegation.value.operator) {
      const d = dns.delegation.value;
      add({ fact: `DNS is operated by ${d.operator} (${d.operatorClass}) — indicates who likely manages IT today.`, raw: d.nameservers.join(", "), source: "DNS NS lookup", tier: "inferred", polarity: "context", severity: "info", area: "business", audience: "internal" });
    }
  }

  // ---- Website security (CIS 16 / OWASP) ----
  if (f.ssl?.grade) {
    const g = f.ssl.grade;
    if (["C", "D", "E", "F", "T", "M"].includes(g)) {
      add({ fact: `The website's TLS configuration grades ${g} on SSL Labs.`, source: "Qualys SSL Labs", tier: "observed", polarity: "gap", severity: "high", area: "web", supports: ["C07-S02"] });
    } else if (g.startsWith("A")) {
      add({ fact: `The website's TLS configuration grades ${g} on SSL Labs.`, source: "Qualys SSL Labs", tier: "observed", polarity: "strength", severity: "info", area: "web" });
    }
  }
  const h = f.page?.securityHeaders;
  if (h) {
    const missing = h.findings.filter((x) => !x.present).map((x) => x.header);
    if (!h.hsts) add({ fact: "The site does not send an HSTS header, so browsers are not forced onto HTTPS.", source: "HTTP response headers", tier: "observed", polarity: "gap", severity: "medium", area: "web", supports: ["C07-S02"], framework: "OWASP" });
    if (!h.csp) add({ fact: "The site has no Content-Security-Policy, the main browser-side defence against injected scripts.", source: "HTTP response headers", tier: "observed", polarity: "gap", severity: "medium", area: "web", supports: ["C07-S02"], framework: "OWASP" });
    if (h.presentCount >= 5) add({ fact: `${h.presentCount} of 6 recommended security headers are in place.`, source: "HTTP response headers", tier: "observed", polarity: "strength", severity: "info", area: "web" });
    else if (missing.length >= 3) add({ fact: `${missing.length} of 6 recommended security headers are missing: ${missing.join(", ")}.`, source: "HTTP response headers", tier: "observed", polarity: "gap", severity: "low", area: "web", supports: ["C07-S02"] });
  }
  const ck = f.page?.cookies;
  if (ck && ck.insecureCookies > 0) {
    add({ fact: `${ck.insecureCookies} of ${ck.totalCookies} cookies set on the homepage lack the Secure or HttpOnly flag.`, source: "HTTP Set-Cookie headers", tier: "observed", polarity: "gap", severity: "medium", area: "web", supports: ["C07-S02"] });
  }
  const cs = f.page?.contentSecurity;
  if (cs && cs.thirdPartyScriptsWithoutSri.length > 0) {
    add({ fact: `${cs.thirdPartyScriptsWithoutSri.length} third-party script(s) load without integrity checks — if that provider is compromised, the code on this site changes silently.`, raw: cs.thirdPartyScriptsWithoutSri.slice(0, 5).join(", "), source: "Homepage HTML", tier: "observed", polarity: "gap", severity: "low", area: "web", supports: ["C07-S02", "C02-S02"] });
  }

  // ---- Domain & infrastructure ----
  const inf = f.infra;
  if (inf?.registration.state === "observed") {
    const r = inf.registration.value;
    if (r.expiringWithin90Days) add({ fact: `The domain registration expires within 90 days${r.expiresAt ? ` (${r.expiresAt.slice(0, 10)})` : ""}. If it lapses, website and email stop.`, source: "RDAP domain registry", tier: "observed", polarity: "gap", severity: "high", area: "domain", supports: ["C14-S03"] });
    if (!r.transferLocked) add({ fact: "The domain has no registrar transfer lock, making it easier to hijack.", source: "RDAP domain registry", tier: "observed", polarity: "gap", severity: "medium", area: "domain", supports: ["C14-S03"] });
    if (r.createdAt) add({ fact: `Domain registered in ${r.createdAt.slice(0, 4)}${r.registrar ? ` via ${r.registrar}` : ""}.`, source: "RDAP domain registry", tier: "observed", polarity: "context", severity: "info", area: "business" });
  }
  if (inf?.dnssec.state === "absent") {
    add({ fact: "DNSSEC is not enabled for the domain.", source: "DNS-over-HTTPS validation", tier: "observed", polarity: "gap", severity: "low", area: "domain", supports: ["C06-S04"] });
  }
  if (inf?.hosting.state === "observed" && inf.hosting.value.country && !inf.hosting.value.isCanada) {
    const hv = inf.hosting.value;
    add({ fact: `The website is hosted outside Canada (${hv.country}${hv.org ? `, ${hv.org}` : ""}). If it collects personal information, PIPEDA cross-border disclosure applies.`, source: "IP → ASN (ARIN RDAP)", tier: "inferred", polarity: "gap", severity: "low", area: "privacy", supports: ["C08-S03"], framework: "PIPEDA" });
  }

  // ---- External exposure ----
  const as = f.attackSurface;
  if (as?.danglingCnames.state === "observed" && as.danglingCnames.value.length > 0) {
    const list = as.danglingCnames.value;
    add({ fact: `${list.length} subdomain(s) point at a deleted ${[...new Set(list.map((d) => d.platform))].join("/")} resource — a live subdomain-takeover risk.`, raw: list.map((d) => `${d.subdomain} → ${d.cnameTarget}`).join("; "), source: "Certificate transparency + DNS", tier: "observed", polarity: "gap", severity: "high", area: "exposure", supports: ["C02-S01", "C07-S02"] });
  }
  if (as?.sensitiveSubdomains && as.sensitiveSubdomains.length > 0) {
    const labels = [...new Set(as.sensitiveSubdomains.map((s) => s.label))];
    add({ fact: `Public certificate logs reveal internal/remote-access systems (${labels.join(", ")}).`, raw: as.sensitiveSubdomains.slice(0, 6).map((s) => s.name).join(", "), source: "Certificate transparency (crt.sh)", tier: "observed", polarity: "gap", severity: "medium", area: "exposure", supports: ["C02-S01", "C05-S02", "C06-S04"] });
  }
  const cmp = f.compliance;
  if (cmp?.jsLibraries.state === "observed" && cmp.jsLibraries.value.vulnerable.length > 0) {
    const v = cmp.jsLibraries.value.vulnerable;
    const high = v.some((x) => /high|critical/i.test(x.severity));
    add({ fact: `The website runs ${v.length} JavaScript librar${v.length === 1 ? "y" : "ies"} with published vulnerabilities.`, raw: v.map((x) => `${x.name} ${x.version}${x.cve.length ? ` (${x.cve.slice(0, 2).join(", ")})` : ""}`).join("; "), source: "Google Lighthouse + retire.js database", tier: "observed", polarity: "gap", severity: high ? "high" : "medium", area: "exposure", supports: ["C02-S01", "C07-S02"], framework: "CIS 7" });
  }

  // ---- Privacy & compliance ----
  const wk = f.page?.wellKnown;
  if (wk?.privacyPolicy.state === "absent") {
    add({ fact: "No privacy policy was found on the website.", source: "Website crawl (common privacy paths)", tier: "observed", polarity: "gap", severity: "high", area: "privacy", supports: ["C08-S03", "C01-S02"], framework: "PIPEDA" });
  } else if (wk?.privacyPolicy.state === "observed") {
    add({ fact: "A privacy policy is published on the website.", source: "Website crawl", tier: "observed", polarity: "strength", severity: "info", area: "privacy" });
  }
  if (wk?.securityTxt.state === "absent") {
    add({ fact: "No security.txt file — there is no published way for researchers to report a vulnerability.", source: "/.well-known/security.txt", tier: "observed", polarity: "gap", severity: "low", area: "governance", supports: ["C01-S03"], framework: "RFC 9116" });
  }
  if (cmp?.preConsentTrackers && cmp.preConsentTrackers.trackers.length > 0) {
    const t = cmp.preConsentTrackers.trackers.map((x) => x.label);
    add({ fact: `Tracking tools (${[...new Set(t)].join(", ")}) load before the visitor gives any consent.`, source: "Google Lighthouse network log", tier: "observed", polarity: "gap", severity: "medium", area: "privacy", supports: ["C08-S03", "C01-S02"], framework: "Quebec Law 25 / PIPEDA" });
  }
  if (cmp?.accessibility?.score != null && cmp.accessibility.score < 90) {
    add({ fact: `Website accessibility scores ${cmp.accessibility.score}/100 (automated check). Ontario's AODA requires WCAG 2.0 AA for organizations with 50+ employees.`, source: "Google Lighthouse accessibility audit", tier: "observed", polarity: "gap", severity: cmp.accessibility.score < 70 ? "medium" : "low", area: "privacy", supports: ["C01-S02"], framework: "AODA" });
  }

  // ---- Online presence & business signals (context / inferred) ----
  const gb = f.googleBusiness;
  if (gb?.rating != null && gb.reviewCount != null) {
    if (gb.rating >= 4.5 && gb.reviewCount >= 20) add({ fact: `Strong Google rating: ${gb.rating}★ from ${gb.reviewCount} reviews.`, source: "Google Places", tier: "observed", polarity: "strength", severity: "info", area: "presence" });
    else if (gb.rating < 3.8 && gb.reviewCount >= 5) add({ fact: `Google rating is ${gb.rating}★ from ${gb.reviewCount} reviews — below the level most customers filter for.`, source: "Google Places", tier: "observed", polarity: "gap", severity: "low", area: "presence", supports: ["C15-S04", "C15-S01"] });
    else add({ fact: `Google rating: ${gb.rating}★ from ${gb.reviewCount} reviews.`, source: "Google Places", tier: "observed", polarity: "context", severity: "info", area: "presence" });
  }
  const seo = f.page?.seo;
  if (seo && seo.issues.length >= 3) {
    add({ fact: `${seo.issues.length} on-page SEO issues on the homepage (e.g. ${seo.issues.slice(0, 2).join("; ")}).`, source: "Homepage HTML", tier: "observed", polarity: "gap", severity: "low", area: "presence" });
  }
  const tech = f.page?.techStack;
  if (tech) {
    if (tech.detected.length) add({ fact: `Website built with: ${tech.detected.slice(0, 8).map((t) => t.name).join(", ")}.`, source: "Homepage fingerprint", tier: "observed", polarity: "context", severity: "info", area: "business" });
    if (!tech.hasAnalytics) add({ fact: "No website analytics detected — visitor and conversion data is not being measured.", source: "Homepage fingerprint", tier: "inferred", polarity: "gap", severity: "low", area: "operations", supports: ["C15-S05", "C13-S02"] });
    if (!(tech.byCategory.marketing?.length)) add({ fact: "No CRM or marketing-automation tool is visible on the website (lead capture may be manual).", source: "Homepage fingerprint", tier: "inferred", polarity: "gap", severity: "low", area: "operations", supports: ["C15-S02"] });
    if (tech.hasPayments) add({ fact: "The website takes payments online.", source: "Homepage fingerprint", tier: "observed", polarity: "context", severity: "info", area: "business", supports: ["C10-S03", "C08-S01", "C08-S05"] });
    if (tech.hasChatWidget) add({ fact: "A live-chat/support widget is present on the website.", source: "Homepage fingerprint", tier: "observed", polarity: "strength", severity: "info", area: "operations" });
  }
  const hist = f.history;
  if (hist?.state === "observed" && hist.value.staleFor24Months) {
    add({ fact: "The website has barely changed in 24 months (archive history).", source: "Wayback Machine", tier: "inferred", polarity: "gap", severity: "low", area: "presence", supports: ["C11-S01"] });
  }
  const hir = f.hiring;
  if (hir?.state === "observed" && hir.value.jobPostings.length > 0) {
    const titles = hir.value.jobPostings.map((j) => j.title);
    add({ fact: `Currently hiring: ${titles.slice(0, 5).join(", ")}${titles.length > 5 ? ` (+${titles.length - 5} more)` : ""}.`, source: "Company careers page", tier: "observed", polarity: "context", severity: "info", area: "business", supports: ["C01-S01"] });
    if (titles.some((t) => /admin|data entry|coordinator|clerk|bookkeep|receptionist|assistant/i.test(t))) {
      add({ fact: "Open roles include administrative/data-entry work — a common sign of manual processes that automation can absorb.", source: "Company careers page", tier: "inferred", polarity: "gap", severity: "low", area: "operations", supports: ["C12-S01", "C11-S02"] });
    }
    if (titles.some((t) => /\b(it|help ?desk|system administrator|sysadmin|security|network)\b/i.test(t))) {
      add({ fact: "Hiring for IT/security roles — the function is being built or stretched.", source: "Company careers page", tier: "inferred", polarity: "context", severity: "info", area: "governance", supports: ["C01-S04", "C14-S04"] });
    }
    if (titles.some((t) => /\b(developer|engineer|programmer|software)\b/i.test(t))) {
      add({ fact: "Hiring for software development roles — an in-house dev team is being built or is growing.", source: "Company careers page", tier: "inferred", polarity: "context", severity: "info", area: "governance", supports: ["C07-S04", "C07-S01"] });
    }
  }
  const hibp = f.hibp;
  if (hibp?.state === "observed" && hibp.value.breaches.length > 0) {
    const names = hibp.value.breaches.map((b) => b.name).slice(0, 5);
    add({ fact: `The email address provided at intake has appeared in ${hibp.value.breaches.length} known data breach${hibp.value.breaches.length === 1 ? "" : "es"} (${names.join(", ")}${hibp.value.breaches.length > names.length ? ", …" : ""}). A password or personal detail from one of these could still be reused elsewhere.`, source: "HIBP breachedaccount API (consented check of the intake email only)", tier: "observed", polarity: "gap", severity: "high", area: "identity", supports: ["C05-S02", "C04-S03", "C03-S01"] });
  } else if (hibp?.state === "absent") {
    add({ fact: "The email address provided at intake has not appeared in any known data breach.", source: "HIBP breachedaccount API (consented check of the intake email only)", tier: "observed", polarity: "strength", severity: "info", area: "identity" });
  }
  const bc = f.bcRegistry;
  if (bc?.state === "observed") {
    const r = bc.value;
    add({ fact: `Registered in British Columbia as ${r.legalName} (${r.registrationId}, ${r.active ? "active" : "inactive"}${r.extraProvincial ? ", extra-provincial" : ""}).`, source: "OrgBook BC (OGL-BC)", tier: "observed", polarity: "context", severity: "info", area: "business", supports: r.extraProvincial ? ["C08-S03"] : [] });
  }
  const comp = f.competitorProfiles?.filter((c) => c.classification === "confirmed_competitor" || c.classification === "probable_competitor") ?? [];
  if (comp.length) {
    add({ fact: `${comp.length} comparable local business(es) identified for benchmarking.`, raw: comp.slice(0, 5).map((c) => c.name).join(", "), source: "Tavily + Geoapify + Google Places", tier: "inferred", polarity: "context", severity: "info", area: "business", audience: "internal" });
  }

  // ---- L1 Business Profile → client-facing context (ODO brain rebuild Phase 4, 2026-10-02) ----
  // Before this, everything odo-business-profile.ts (Claude reading up to 15
  // site pages) learned about the business stopped at the interviewer — it
  // shaped which questions got asked but never reached the report itself.
  // This surfaces the two most report-worthy slices: what ODO understood
  // about the business (grounds the rest of the report in something the
  // client recognizes as accurate), and what sensitive data types it found
  // on the site (context for why the data-protection findings below it
  // matter). Deliberately light-touch — a single summary line, not a dump
  // of every BusinessProfile field — the SWOT/outcome narrative do the
  // interpreting, this just gives them real material to interpret.
  const profile = f.businessProfile;
  if (profile) {
    const bits: string[] = [];
    if (profile.whatTheySell) bits.push(profile.whatTheySell);
    if (profile.businessModel !== "unclear") bits.push(`${profile.businessModel} business model`);
    if (profile.audienceDescription) bits.push(`serving ${profile.audienceDescription}`);
    if (profile.locations.length) bits.push(`based in ${profile.locations.join(", ")}`);
    if (bits.length) {
      add({
        fact: `What ODO learned from the website: ${bits.join("; ")}.`,
        raw: profile.summary || undefined,
        source: "Website content analysis (ODO)",
        tier: "inferred",
        polarity: "context",
        severity: "info",
        area: "business",
      });
    }
    if (profile.sensitiveDataTypes.length) {
      add({
        fact: `The website indicates the business collects or handles: ${profile.sensitiveDataTypes.join(", ")}.`,
        source: "Website content analysis (ODO)",
        tier: "inferred",
        polarity: "context",
        severity: "info",
        area: "data",
      });
    }
  }

  // ---- L4 compliance signals → client-facing context (Phase 4) ----
  // Same gap as above: odo-industry-rules.ts's framework flags only ever
  // reached the interviewer's prompt, never the report. These are flagged
  // as "worth asking about," not confirmed gaps — if the visitor answered
  // the follow-up question, that answer already produced its own, more
  // specific A-prefixed evidence above; this line just names which
  // regulatory framework plausibly applies and why, so the report doesn't
  // silently drop frameworks ODO already identified as relevant.
  for (const sig of f.complianceSignals ?? []) {
    add({
      fact: `${sig.framework} likely applies: ${sig.trigger}.`,
      source: "Industry/compliance signal detection (ODO knowledge base)",
      tier: "inferred",
      polarity: "context",
      severity: "info",
      area: "privacy",
      framework: sig.framework,
    });
  }

  // ---- L3 named competitors → client-facing findings (Phase 4) ----
  // Approved 2026-10-01 with legal guardrails: neutral facts only (no
  // "worse"/"better"/rankings), source + date on every line, "Google Maps"
  // attribution wherever rating data is shown, never quote a competitor's
  // reviews. Before this, `comp` above was the ONLY place competitor data
  // reached the ledger, and it was internal-audience-only — a named
  // competitor never actually reached the client. reportableCompetitors()
  // is the same confirmed/probable filter as `comp`, already capped at 3 by
  // the L3 cascade (odo-competitors.ts), so this never lists more than the
  // approved count.
  for (const c of reportableCompetitors(f.competitorProfiles ?? [])) {
    const places = c.identity.state === "observed" ? c.identity.value : null;
    const overlapText = c.serviceOverlap.matchedKeywords.length
      ? `overlapping services (${c.serviceOverlap.matchedKeywords.join(", ")})`
      : "the same general market";
    const ratingText = places?.rating != null ? ` Google rating ${places.rating}★ from ${places.reviewCount ?? 0} reviews (via Google Maps).` : "";
    add({
      fact: `${c.name} is a verified local business in ${overlapText}.${ratingText}`,
      raw: [places?.address ? `Address: ${places.address}` : null, c.website ? `Website: ${c.website}` : null, `Discovered via: ${c.discoverySources.join(", ")}`]
        .filter(Boolean)
        .join(" · "),
      source: places ? "Google Maps (Google Places)" : c.discoverySources.join(" + "),
      tier: "observed",
      polarity: "context",
      severity: "info",
      area: "business",
    });
  }

  return out;
}

/**
 * Answer-derived facts (rebuilt 2026-10-03, Master Reference §37.3). Every
 * fact here was extracted by the live interviewer from an answer it judged
 * "valid" or "unsure" — contradictory, contradicts-public and nonsense
 * answers produce no evidence at all, and skipped questions produce none
 * either (a skip is unknown, never a gap). "Unsure" answers arrive already
 * tagged tier "inferred", so a hedge can never become a confirmed finding.
 */
export function answerEvidence(findings: ResearchFindings): Array<Draft & { questionId: string }> {
  const interview = (findings as unknown as Record<string, unknown>)._interview as InterviewState | undefined;
  if (!interview) return [];
  const out: Array<Draft & { questionId: string }> = interview.evidence.map((e) => ({
    fact: e.fact,
    raw: e.raw,
    source: "Visitor answer",
    tier: e.tier,
    polarity: e.polarity,
    severity: e.severity,
    area: e.area,
    supports: e.supports ?? [],
    counters: e.counters ?? [],
    ...(e.framework ? { framework: e.framework } : {}),
    questionId: e.questionId,
  }));
  // An active/recent incident the visitor described is a real, distinct need
  // (certified forensic IR) — the only path in the catalog that supports
  // C10-S04. Flagged by the interviewer's own judgement (playbook "urgent").
  if (interview.urgent) {
    const turn = [...interview.judged].reverse().find((j) => j.type === "answer" || j.type === "answer_and_question") ?? interview.judged[interview.judged.length - 1];
    out.push({
      fact: "The visitor described an active or recent security incident.",
      raw: turn ? turn.visitorText.slice(0, 1000) : "",
      source: "Visitor answer",
      tier: "observed",
      polarity: "gap",
      severity: "high",
      area: "governance",
      supports: ["C10-S04", "C03-S04"],
      questionId: turn?.questionId ?? "urgent",
    });
  }
  return out;
}

/** Assign stable IDs: E1..En for research, A1..An for interview answers. */
export function buildLedger(findings: ResearchFindings): Evidence[] {
  const now = today();
  const research = researchEvidence(findings).map((d, i) => ({
    ...d, id: `E${i + 1}`, supports: d.supports ?? [], counters: d.counters ?? [], audience: d.audience ?? "client", collectedAt: now,
  }));
  const ans = answerEvidence(findings).map((d, i) => {
    const { questionId: _q, ...rest } = d;
    void _q;
    return { ...rest, id: `A${i + 1}`, supports: d.supports ?? [], counters: d.counters ?? [], audience: d.audience ?? "client", collectedAt: now };
  });
  return [...research, ...ans];
}

/** Compact text form for Jev/Claude state. Internal-audience items included only when asked. */
export function ledgerAsText(ledger: Evidence[], opts: { includeInternal?: boolean } = {}): string {
  return ledger
    .filter((e) => opts.includeInternal || e.audience === "client")
    .map((e) => `[${e.id}] (${e.tier}, ${e.polarity}${e.severity !== "info" ? `, ${e.severity}` : ""}) ${e.fact}`)
    .join("\n");
}
