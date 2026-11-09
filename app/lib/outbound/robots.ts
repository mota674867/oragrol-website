// ORAGROL Outbound engine — polite reading of business websites.
//
// Obeys robots.txt for our user agent ("OragrolResearchBot") and for "*", and
// waits between pages on the same site. A site that blocks us is rejected with
// the reason "robots-blocked"; it is never read around.

export const RESEARCH_UA_TOKEN = "OragrolResearchBot";
export const RESEARCH_USER_AGENT = `Mozilla/5.0 (compatible; ${RESEARCH_UA_TOKEN}/1.0)`;

type Group = { agents: string[]; allow: string[]; disallow: string[] };

export function parseRobots(text: string): Group[] {
  const groups: Group[] = [];
  let cur: Group | null = null;
  let lastWasAgent = false;
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*$/, "").trim();
    if (!line) continue;
    const m = line.match(/^([A-Za-z-]+)\s*:\s*(.*)$/);
    if (!m) continue;
    const field = m[1].toLowerCase();
    const value = m[2].trim();
    if (field === "user-agent") {
      if (!cur || !lastWasAgent) {
        cur = { agents: [], allow: [], disallow: [] };
        groups.push(cur);
      }
      cur.agents.push(value.toLowerCase());
      lastWasAgent = true;
    } else {
      lastWasAgent = false;
      if (!cur) continue;
      if (field === "allow") cur.allow.push(value);
      else if (field === "disallow") cur.disallow.push(value);
    }
  }
  return groups;
}

function matches(rule: string, path: string): boolean {
  if (!rule) return false;
  const anchored = rule.endsWith("$");
  const body = anchored ? rule.slice(0, -1) : rule;
  const re = new RegExp("^" + body.split("*").map((s) => s.replace(/[.+?^${}()|[\]\\]/g, "\\$&")).join(".*") + (anchored ? "$" : ""));
  return re.test(path);
}

/** True when robots.txt lets us read this path. Longest matching rule wins; Allow wins a tie. */
export function robotsAllows(groups: Group[], path: string, agent = RESEARCH_UA_TOKEN): boolean {
  const own = groups.filter((g) => g.agents.some((a) => a !== "*" && agent.toLowerCase().includes(a)));
  const chosen = own.length > 0 ? own : groups.filter((g) => g.agents.includes("*"));
  let best: { len: number; allow: boolean } | null = null;
  for (const g of chosen) {
    for (const r of g.allow) if (matches(r, path) && (!best || r.length >= best.len)) best = { len: r.length, allow: true };
    for (const r of g.disallow) if (matches(r, path) && (!best || r.length > best.len)) best = { len: r.length, allow: false };
  }
  return best ? best.allow : true;
}

export const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));
