// ORAGROL ODO — Attack-surface mining from certificate transparency logs
//
// Section 33, Area 6. crt.sh already runs (see fetchCertificates in
// odo-research.ts) but was under-mined — it stored a flat subdomain list
// and did nothing with it. This module reads that same list for two real,
// passive findings:
//
//   1. Infrastructure-revealing names (vpn., owa., citrix., rdp., ...) —
//      a certificate for vpn.example.com tells a reader that a VPN
//      concentrator exists, before anyone probes anything.
//   2. Dangling CNAMEs — a subdomain's CNAME points at a deprovisioned
//      cloud resource (the target itself is NXDOMAIN on a platform that
//      claims unclaimed names on registration). Anyone can then register
//      that resource and serve content under the prospect's own domain —
//      a live, high-severity subdomain-takeover risk established purely
//      from DNS, never by requesting the page.
//
// HARD BOUNDARY (do not relax): naming a host from a certificate log is
// passive. Connecting to it is not. This module only ever performs DNS
// lookups (CNAME/A) against the discovered names — it never issues an HTTP
// request to any subdomain. Only the registrable apex and www are ever
// fetched by ODO (see odo-page.ts).

import { Resolver } from "node:dns/promises";
import { type Determination, observed, absent, resolveOrDetermine } from "./odo-evidence";

const SENSITIVE_NAME_PATTERNS: Array<[RegExp, string]> = [
  [/^vpn\./i, "VPN concentrator"],
  [/^owa\./i, "Outlook Web Access"],
  [/^citrix\./i, "Citrix remote access"],
  [/^rdp\./i, "Remote desktop gateway"],
  [/^sonicwall\./i, "SonicWall appliance"],
  [/^remote\./i, "Remote access portal"],
  [/^vault\./i, "Secrets/vault service"],
  [/^jenkins\./i, "CI/CD (Jenkins)"],
  [/^gitlab\./i, "Source control (GitLab)"],
  [/^jira\./i, "Issue tracker (Jira)"],
  [/^confluence\./i, "Wiki (Confluence)"],
  [/^grafana\./i, "Monitoring dashboard (Grafana)"],
  [/^kibana\./i, "Log dashboard (Kibana)"],
  [/^pgadmin\./i, "Database admin (pgAdmin)"],
  [/^phpmyadmin\./i, "Database admin (phpMyAdmin)"],
  [/^ftp\./i, "FTP server"],
  [/^smtp\./i, "Mail server (direct)"],
  [/^webmail\./i, "Webmail portal"],
];

export type SensitiveSubdomain = { name: string; label: string };

export function findSensitiveSubdomains(subdomains: string[]): SensitiveSubdomain[] {
  const out: SensitiveSubdomain[] = [];
  for (const name of subdomains) {
    const match = SENSITIVE_NAME_PATTERNS.find(([re]) => re.test(name));
    if (match) out.push({ name, label: match[1] });
  }
  return out;
}

// Cloud platforms that hand out subdomains under a shared parent zone and
// will resolve NXDOMAIN once the underlying resource is deleted — the
// precondition for a dangling-CNAME takeover.
const CLAIMABLE_CNAME_TARGETS: Array<[RegExp, string]> = [
  [/\.s3\.amazonaws\.com$/i, "AWS S3"],
  [/\.s3-website[.-][a-z0-9-]+\.amazonaws\.com$/i, "AWS S3 (website hosting)"],
  [/\.azurewebsites\.net$/i, "Azure App Service"],
  [/\.blob\.core\.windows\.net$/i, "Azure Blob Storage"],
  [/\.cloudapp\.azure\.com$/i, "Azure Cloud Service"],
  [/\.trafficmanager\.net$/i, "Azure Traffic Manager"],
  [/\.herokuapp\.com$/i, "Heroku"],
  [/\.github\.io$/i, "GitHub Pages"],
  [/\.githubusercontent\.com$/i, "GitHub"],
  [/\.netlify\.app$/i, "Netlify"],
  [/\.vercel\.app$/i, "Vercel"],
  [/\.fastly\.net$/i, "Fastly"],
  [/\.wordpress\.com$/i, "WordPress.com"],
  [/\.shopify\.com$/i, "Shopify"],
  [/\.zendesk\.com$/i, "Zendesk"],
  [/\.helpjuice\.com$/i, "Helpjuice"],
  [/\.surge\.sh$/i, "Surge.sh"],
];

export type DanglingCname = { subdomain: string; cnameTarget: string; platform: string };

/**
 * A CNAME whose target matches a claimable-platform pattern AND which the
 * resolver cannot find (NXDOMAIN/ENOTFOUND on the target) is a live
 * takeover risk. A target that still resolves is not dangling, whatever
 * platform it points at — most CNAMEs to these platforms are perfectly
 * healthy, active sites.
 */
export async function findDanglingCnames(subdomains: string[]): Promise<{
  checked: number;
  dangling: DanglingCname[];
  notDetermined: number;
}> {
  const r = new Resolver({ timeout: 1500, tries: 1 });
  r.setServers(["1.1.1.1", "8.8.8.8"]);

  // Bounded — this is a per-scan cost, not a domain-wide sweep. crt.sh
  // already caps the list at 20 in fetchCertificates.
  const candidates = subdomains.slice(0, 20);
  let notDetermined = 0;
  const dangling: DanglingCname[] = [];

  await Promise.all(
    candidates.map(async (name) => {
      const cname = await resolveOrDetermine(`cname:${name}`, () => r.resolveCname(name), { retries: 1 });
      if (cname.state !== "observed") {
        if (cname.state === "not_determined") notDetermined++;
        return;
      }
      const target = cname.value[0];
      if (!target) return;
      const match = CLAIMABLE_CNAME_TARGETS.find(([re]) => re.test(target));
      if (!match) return;

      // The CNAME points at a claimable platform's zone — now check whether
      // the target itself actually resolves. If it does, someone still owns
      // it; not dangling.
      const targetLookup = await resolveOrDetermine(`cname-target:${target}`, () => r.resolve4(target), {
        retries: 1,
      });
      if (targetLookup.state === "absent") {
        dangling.push({ subdomain: name, cnameTarget: target, platform: match[1] });
      } else if (targetLookup.state === "not_determined") {
        notDetermined++;
      }
    })
  );

  return { checked: candidates.length, dangling, notDetermined };
}

export type AttackSurfaceResearch = {
  sensitiveSubdomains: SensitiveSubdomain[];
  danglingCnames: Determination<DanglingCname[]>;
};

export async function runAttackSurfaceResearch(subdomains: string[]): Promise<AttackSurfaceResearch> {
  if (subdomains.length === 0) {
    return { sensitiveSubdomains: [], danglingCnames: absent<DanglingCname[]>("attack-surface:cname") };
  }
  const sensitive = findSensitiveSubdomains(subdomains);
  const { dangling, checked, notDetermined } = await findDanglingCnames(subdomains);

  const danglingDetermination: Determination<DanglingCname[]> =
    dangling.length > 0
      ? observed(dangling, "attack-surface:cname")
      : notDetermined === checked && checked > 0
        ? { state: "not_determined", reason: "all CNAME lookups failed to resolve", source: "attack-surface:cname", collectedAt: new Date().toISOString() }
        : absent<DanglingCname[]>("attack-surface:cname");

  return { sensitiveSubdomains: sensitive, danglingCnames: danglingDetermination };
}
