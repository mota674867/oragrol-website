// ORAGROL Outbound engine — real connections (internet, Geoapify, Anthropic, HubSpot).
// Used by the nightly route and the local runner. Keys come only from the
// environment and are never printed.

import { safeFetch } from "../odo-ssrf-guard";
import { makeHaikuPicker } from "../lead-finder/ai";
import type { FetchPage } from "../lead-finder/grade";
import { hubspotWriteEnabled } from "./config";
import type { EngineDeps } from "./engine";
import { firstLook } from "./first-look";
import { makeHubSpotLeadWriter } from "./hubspot-sync";
import { RESEARCH_USER_AGENT } from "./robots";
import { makeGeoapifySource } from "./source-geoapify";
import type { OutboundStore } from "./store";
import { makeSonnetWriter } from "./writer";

const MAX_BYTES = 2_000_000;

export const livePageFetch: FetchPage = async (url) => {
  try {
    const res = await safeFetch(url, {
      headers: { "user-agent": RESEARCH_USER_AGENT, accept: "text/html,application/xhtml+xml" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    if (!/html|xml/i.test(res.headers.get("content-type") ?? "")) return null;
    const buf = await res.arrayBuffer();
    if (buf.byteLength > MAX_BYTES) return null;
    return { url: res.url || url, html: new TextDecoder().decode(buf) };
  } catch {
    return null;
  }
};

export async function liveTextFetch(url: string): Promise<string | null> {
  try {
    const res = await safeFetch(url, { headers: { "user-agent": RESEARCH_USER_AGENT }, signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    if (buf.byteLength > 200_000) return null;
    return new TextDecoder().decode(buf);
  } catch {
    return null;
  }
}

export type LiveOptions = { writeEmails?: boolean; env?: NodeJS.ProcessEnv; log?: (m: string) => void };

/** Throws a plain message naming the missing setting (never its value). */
export function makeLiveDeps(store: OutboundStore, o: LiveOptions = {}): EngineDeps {
  const env = o.env ?? process.env;
  const anthropic = env.ANTHROPIC_API_KEY;
  const geo = env.GEOAPIFY_API_KEY;
  if (!anthropic) throw new Error("ANTHROPIC_API_KEY is not set.");
  if (!geo) throw new Error("GEOAPIFY_API_KEY is not set.");
  const hubspot = hubspotWriteEnabled(env) && env.HUBSPOT_ACCESS_TOKEN ? makeHubSpotLeadWriter(env.HUBSPOT_ACCESS_TOKEN) : undefined;
  return {
    store,
    source: makeGeoapifySource(geo),
    fetchPage: livePageFetch,
    fetchText: liveTextFetch,
    pick: makeHaikuPicker(anthropic),
    write: o.writeEmails === false ? null : makeSonnetWriter(anthropic),
    firstLook,
    crm: hubspot,
    log: o.log,
  };
}
