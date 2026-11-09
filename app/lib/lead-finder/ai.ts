// ORAGROL Lead Finder (pilot) — the cheap-model step: pick the owner or manager.
//
// The model sees page text and a NUMBERED list of addresses the code found. It
// answers with a number, a name and a title. It cannot write an address. Code
// (grade.ts) then checks the name is really on the site.
//
// NEEDS VERIFICATION on the first live run: the model id below and the shape of
// the reply (Haiku 5.5 supports adaptive thinking; this call asks for plain JSON
// text only). The first live run logs real token usage, so cost is measured.

import Anthropic from "@anthropic-ai/sdk";
import { UNTRUSTED_TEXT_RULE } from "../odo-safety";
import type { Picker, PickInput, PickOutput } from "./grade";

export const LEAD_FINDER_MODEL = "claude-haiku-5-5";

const SYSTEM = [
  "You help a sales researcher find the owner or manager of a small business from the business's OWN website.",
  "You are given the text of a few pages and a numbered list of email addresses found on those pages.",
  "Choose AT MOST ONE address from the list that belongs to the owner, a principal, partner or director, or the office or practice manager, and say who that person is.",
  "RULES: choose ONLY from the numbered list and answer with its number — never write, edit or guess an address. The person's full name and title must be written in the page text. If no listed address clearly belongs to such a person, return null.",
  "roleType is \"owner\" for owner, founder, principal, partner, director, president, or the dentist, doctor or lawyer who runs the practice; \"manager\" for an office, practice or general manager; \"other\" for anyone else (receptionist, assistant, associate, staff member).",
  UNTRUSTED_TEXT_RULE,
  'Return ONLY JSON: {"choice":{"index":number,"personName":string,"title":string,"roleType":"owner"|"manager"|"other"}|null,"reason":string}',
].join("\n");

function buildUser(i: PickInput): string {
  const list = i.candidates
    .map((c) => `[${c.index}] ${c.email} — found on ${c.pageUrl}${c.snippet ? ` — near: "${c.snippet}"` : ""}`)
    .join("\n");
  const pages = i.pages.map((p) => `PAGE ${p.url}\n${p.text}`).join("\n\n");
  return `Business: ${i.business} (${i.website})\n\nADDRESSES:\n${list}\n\n${pages}`;
}

export function parsePick(text: string): PickOutput["choice"] | "invalid" {
  try {
    const parsed = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1)) as {
      choice?: { index?: unknown; personName?: unknown; title?: unknown; roleType?: unknown } | null;
    };
    const c = parsed.choice;
    if (c == null) return null;
    if (
      typeof c.index !== "number" ||
      typeof c.personName !== "string" ||
      typeof c.title !== "string" ||
      (c.roleType !== "owner" && c.roleType !== "manager" && c.roleType !== "other")
    ) return "invalid";
    return { index: c.index, personName: c.personName, title: c.title, roleType: c.roleType };
  } catch {
    return "invalid";
  }
}

export function makeHaikuPicker(apiKey: string): Picker {
  const client = new Anthropic({ apiKey });
  return async (input) => {
    const res = await client.messages.create(
      { model: LEAD_FINDER_MODEL, max_tokens: 600, system: SYSTEM, messages: [{ role: "user", content: buildUser(input) }] },
      { timeout: 45000 },
    );
    const usage = { input_tokens: res.usage.input_tokens, output_tokens: res.usage.output_tokens };
    const text = res.content.map((c) => (c.type === "text" ? c.text : "")).join("");
    const choice = parsePick(text);
    if (choice === "invalid") throw new Error("model reply was not valid JSON in the required shape");
    return { choice, reason: "model", usage };
  };
}
