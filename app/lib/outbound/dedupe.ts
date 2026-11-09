// ORAGROL Outbound engine — no repeated deals.
//
// Before any paid step, a business is checked three ways:
//   1. website domain  (a chain with many locations shares one domain = one deal)
//   2. business name + postcode / address
//   3. the email address, once one is found
// against everything already seen (HubSpot export, earlier runs) and the
// do-not-contact list. A contacted business rests 90 days.

import { normalizeForMatch } from "../lead-finder/text";

// Canadian provincial second-level domains (e.g. firm.on.ca) keep three labels.
const PROVINCE_SLDS = new Set(["ab", "bc", "mb", "nb", "nl", "ns", "nt", "nu", "on", "pe", "qc", "sk", "yk", "gc"]);
const MULTI_TLDS = new Set(["co.uk", "com.au", "co.nz", "com.br"]);

/** "https://www.Smith-Law.ca/team" -> "smith-law.ca". Null when it is not a usable web address. */
export function registrableDomain(website: string | null | undefined): string | null {
  if (!website) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(website.trim()) ? website.trim() : `https://${website.trim()}`);
    const host = url.hostname.toLowerCase().replace(/\.$/, "");
    if (!host.includes(".") || /^\d+\.\d+\.\d+\.\d+$/.test(host)) return null;
    const labels = host.split(".");
    const last2 = labels.slice(-2).join(".");
    if (labels.length >= 3 && (PROVINCE_SLDS.has(labels[labels.length - 2]) || MULTI_TLDS.has(last2))) {
      return labels.slice(-3).join(".");
    }
    return last2;
  } catch {
    return null;
  }
}

/** Website hosts that belong to a platform, not to the business: never treat as one business per domain. */
const SHARED_HOSTS = new Set([
  "facebook.com", "instagram.com", "linkedin.com", "google.com", "business.site", "wixsite.com",
  "squarespace.com", "yelp.ca", "yelp.com", "yellowpages.ca", "canada411.ca", "godaddysites.com",
  "wordpress.com", "blogspot.com", "weebly.com", "linktr.ee",
]);

export function isSharedHost(domain: string | null): boolean {
  return !!domain && SHARED_HOSTS.has(domain);
}

export function nameKey(name: string, postcodeOrAddress: string | null): string {
  const n = normalizeForMatch(name).replace(/\b(inc|ltd|llp|llc|corp|corporation|limited|professional corporation|pc)\b/g, "").replace(/\s+/g, " ").trim();
  const where = normalizeForMatch(postcodeOrAddress ?? "").replace(/\s+/g, "");
  return `name:${n}|${where}`;
}

export const domainKey = (d: string): string => `domain:${d}`;
export const emailKey = (e: string): string => `email:${e.trim().toLowerCase()}`;
