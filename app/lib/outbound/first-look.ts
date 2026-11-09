// ORAGROL Outbound engine — the light first look (free, no AI).
//
// Only checks every mail client already does: public DNS records for the
// business's email domain (SPF and DMARC). DKIM is not used: it has no
// discovery, so "not found under common names" proves nothing and is never
// stated to a prospect. Only OBSERVED facts become
// findings, each with the record that proves it. A lookup that timed out is
// "not determined" and is never written as a problem.

import { checkDmarc, checkSpf } from "../odo-dns";
import type { Determination } from "../odo-evidence";

export type Finding = {
  id: string;
  /** Plain words for the email writer. */
  fact: string;
  /** What proves it, kept with the lead. */
  proof: string;
};

export type FirstLook = { domain: string; findings: Finding[]; checkedAt: string };

type Checks = {
  spf: Determination<{ raw: string; qualifier: string | null; exceedsLookupLimit: boolean }>;
  dmarc: Determination<{ raw: string; policy: string; isMonitorOnly: boolean; percentage: number }>;
};

export function findingsFromChecks(domain: string, c: Checks): Finding[] {
  const f: Finding[] = [];
  if (c.dmarc.state === "absent") {
    f.push({ id: "dmarc-missing", fact: `No DMARC record is published for ${domain}, so nothing tells mail servers to reject email that fakes the ${domain} address.`, proof: `DNS TXT _dmarc.${domain}: no v=DMARC1 record` });
  } else if (c.dmarc.state === "observed" && c.dmarc.value.isMonitorOnly) {
    f.push({ id: "dmarc-monitor-only", fact: `The DMARC record for ${domain} is set to "p=none", which only watches: email that fakes the ${domain} address is still delivered.`, proof: `DNS TXT _dmarc.${domain}: ${c.dmarc.value.raw}` });
  }
  if (c.spf.state === "absent") {
    f.push({ id: "spf-missing", fact: `No SPF record is published for ${domain}, so receiving servers cannot check which servers may send email for it.`, proof: `DNS TXT ${domain}: no v=spf1 record` });
  } else if (c.spf.state === "observed") {
    if (c.spf.value.qualifier === "+all" || c.spf.value.qualifier === "?all" || c.spf.value.qualifier === null) {
      f.push({ id: "spf-weak", fact: `The SPF record for ${domain} does not end in a reject rule, so it does not stop other servers from sending as ${domain}.`, proof: `DNS TXT ${domain}: ${c.spf.value.raw}` });
    }
    if (c.spf.value.exceedsLookupLimit) {
      f.push({ id: "spf-too-many-lookups", fact: `The SPF record for ${domain} needs more than 10 lookups, the limit receiving servers allow, so the check can fail even for real email.`, proof: `DNS TXT ${domain}: ${c.spf.value.raw}` });
    }
  }
  return f;
}

export async function firstLook(domain: string): Promise<FirstLook> {
  const [spf, dmarc] = await Promise.all([checkSpf(domain), checkDmarc(domain)]);
  return { domain, findings: findingsFromChecks(domain, { spf, dmarc }), checkedAt: new Date().toISOString() };
}
