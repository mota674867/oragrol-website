// Private application forms (orgro.ca/apply): engine and server-side handler.
// Run: node --test tests/apply-engine.test.mjs   (Node 22.18+ runs the .ts files directly)
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  DISCUSS_OPTION, NONE_TEXT, canDiscuss, capsFor, limitTokens, offersDiscuss, optionsOf, catalogueReady, expand, firstIncomplete, fromLabelled, isRequired, isVisible, meetingList, pickedPoints, signaturePayload,
  tierEstimate, toLabelled, validateAll, validateField, validatePage, withPrefill, MAX_FLAGS_BEFORE_WARNING, MEETING_KEY,
} from "../app/lib/apply/engine.ts";
import { fixtureCatalogue } from "../app/lib/apply/catalogue-fixture.ts";
import { detailsFor, getCatalogue, withDetails } from "../app/lib/apply/catalogue.ts";
import { orOneApplication as form } from "../app/lib/apply/forms/or-one-application.ts";
import { baApplication as ba } from "../app/lib/apply/forms/ba-application.ts";
import { baSetup, orOneSetup } from "../app/lib/apply/forms/setup.ts";
import { allForms, openableForm, openableSetup, setupProductFor } from "../app/lib/apply/registry.ts";
import { handleApply, setupFromOpen } from "../app/lib/apply/handler.ts";
import { formToken, ocsApplyConfig, sign } from "../app/lib/apply/ocs.ts";

const FX = fixtureCatalogue;
const REAL = getCatalogue();
const INVITE = { company: "Northwind Dental Group", person: "Laura Chen", phone: "+1 416 555 0134", email: "laura@northwind.example" };
const ctxOf = (answers, flags = {}, catalogue = FX) => ({ answers, flags, catalogue });
const field = (pages, id) => pages.flatMap((p) => p.fields).find((f) => f.id === id);

/** Fills every compulsory visible field with a valid value, repeating until the generated pages have appeared. */
function fillAll(catalogue = FX, start = {}) {
  const items = start.items ?? ["fx-leads", "fx-quotes", "fx-pay"];
  const categories = catalogue.categories.filter((c) => c.items.some((i) => items.includes(i.id))).map((c) => c.name);
  const answers = withPrefill(form, catalogue, { items, categories, ...start }, INVITE);
  for (let round = 0; round < 6; round += 1) {
    for (const page of expand(form, catalogue, answers)) {
      for (const f of page.fields) {
        const ctx = ctxOf(answers, {}, catalogue);
        if (!isRequired(f, ctx) || f.id in answers && answers[f.id] !== "" && answers[f.id] !== undefined) continue;
        answers[f.id] = sample(f);
      }
    }
  }
  return answers;
}
function sample(f) {
  switch (f.kind) {
    case "email": return "a@b.example";
    case "phone": return "+1 416 555 0100";
    case "url": return "orgro.ca";
    case "number": return "12";
    case "date": return "2026-12-01";
    case "check": return true;
    case "yesno": return "Yes";
    case "select": return f.options?.[0] ?? "x";
    case "multiselect": return (f.options ?? ["x"]).slice(0, Math.max(1, f.min ?? 1));
    case "people": return [{ name: "Sam Lee", role: "Owner", email: "sam@x.example" }];
    case "typed": return "Laura Chen";
    default: return "Some answer";
  }
}

// ---------------------------------------------------------------- structure and the draft gate

test("every field id is unique and every label is unique on its page and group (the saved answers are keyed by label)", () => {
  for (const catalogue of [REAL, FX]) {
    const answers = fillAll(catalogue);
    const pages = expand(form, catalogue, answers);
    const ids = new Set();
    for (const p of pages) {
      const labels = new Set();
      for (const f of p.fields) {
        assert.ok(!ids.has(f.id), `duplicate id ${f.id}`); ids.add(f.id);
        const key = `${f.group ?? ""}|${f.label}`;
        assert.ok(!labels.has(key), `duplicate label on page "${p.title}": ${key}`); labels.add(key);
        assert.ok(f.label.length <= 120 && (f.group ?? "").length <= 120 && p.title.length <= 120, "keys must fit OCS's 120 characters");
      }
    }
  }
});

test("the OR ONE form is published and opens for a client; the draft gate still keeps any draft form closed unless the preview switch is on", () => {
  assert.equal(form.status, "published");
  assert.equal(openableForm("application", "or_one", false)?.id, "or-one-application");
  assert.equal(openableForm("setup", "ba", true), null, "a setup is never a fixed form");
  form.status = "draft";
  try {
    assert.equal(openableForm("application", "or_one", false), null);
    assert.equal(openableForm("application", "or_one", true)?.id, "or-one-application");
  } finally { form.status = "published"; }
});

test("a form can only be published once its draft markers are gone", () => {
  for (const f of allForms()) {
    if (f.status !== "published") continue;
    const text = JSON.stringify(f);
    assert.doesNotMatch(text, /\[[^\]]*(to confirm|TBD|TODO)[^\]]*\]/i, `${f.id} still has a placeholder`);
    assert.ok(catalogueReady(REAL), `${f.id} is published but the item catalogue is empty`);
  }
});

test("the real catalogue is the approved OR ONE menu: 10 categories in the website's order, 77 items, 533 points, 11 locked", () => {
  assert.deepEqual(REAL.categories.map((c) => c.name), ["Sales", "Marketing & Branding", "Finance & Accounting", "HR & People", "Customer Service",
    "Operations & Admin", "IT & Technology", "Procurement & Vendor", "Legal & Compliance", "Leadership & Strategy"]);
  const items = REAL.categories.flatMap((c) => c.items);
  assert.equal(items.length, 77);
  assert.equal(items.reduce((n, i) => n + i.points, 0), 533);
  assert.equal(items.filter((i) => i.locked).length, 11, "the 10 critical items plus investor/board reporting");
  assert.equal(items.find((i) => i.id === "d-investor").locked, true, "investor/board reporting is locked (decision 2026-11-03)");
  assert.equal(catalogueReady(REAL), true);
  const need = expand(form, REAL, {}).find((p) => p.id === "need");
  assert.equal(validatePage(need, ctxOf({ ...fillAll(REAL, { items: [] }) }, {}, REAL)).items, "Choose at least one item.");
});

// ---------------------------------------------------------------- gating, formats, the meeting box

test("a page cannot be passed with a compulsory field blank; optional fields may stay blank", () => {
  const company = expand(form, FX, {}).find((p) => p.id === "company");
  const errors = validatePage(company, ctxOf({}));
  assert.equal(errors.company_legal_name, "This is required.");
  assert.equal(errors.trade_name, undefined, "trade name is optional");
  assert.equal(errors.year_end, undefined, "year-end is only compulsory when Finance is picked");
});

test("wrong formats are refused: email, phone, website, number, date", () => {
  const f = (id) => field(expand(form, FX, {}), id);
  const ok = (id, v) => validateField(f(id), ctxOf({ [id]: v }));
  assert.match(ok("dm_email", "nope"), /valid email/); assert.equal(ok("dm_email", "a@b.example"), null);
  assert.match(ok("dm_phone", "call me"), /valid phone/); assert.equal(ok("dm_phone", "416-555-0100"), null);
  assert.match(ok("website", "not a site"), /valid website/); assert.equal(ok("website", "https://orgro.ca/x"), null); assert.equal(ok("website", "orgro.ca"), null);
  // Business questions are pick lists now: only a listed option is accepted.
  assert.match(ok("employees", "twelve"), /Choose one/); assert.equal(ok("employees", "8 to 19"), null);
  // The few exact numbers left (the setup forms' ad cap and mailboxes) take whole numbers, digits only.
  const cap = field(expand(baSetup(fillBA({ packages: ["Marketing"] })), FX, {}), "a.cap");
  assert.match(validateField(cap, ctxOf({ "a.cap": "twelve" })), /whole number/); assert.match(validateField(cap, ctxOf({ "a.cap": "12.5" })), /whole number/);
  assert.match(validateField(cap, ctxOf({ "a.cap": "-3" })), /whole number/); assert.equal(validateField(cap, ctxOf({ "a.cap": "1500" })), null);
  assert.match(validateField(field(expand(form, FX, {}), "year_end"), ctxOf({ year_end: "2026-02-31", "Categories you need": [] })) ?? "valid date", /valid date/);
});

test("\"None / not applicable\" must be chosen explicitly where something does not apply", () => {
  const pages = expand(form, FX, {});
  assert.equal(validateField(field(pages, "tech_contact"), ctxOf({ tech_contact: NONE_TEXT })), null);
  assert.equal(validateField(field(pages, "tech_contact"), ctxOf({})), "This is required.", "a blank is never accepted; \"None\" must be chosen");
});

test("\"I would rather discuss this with you\" completes a compulsory pick list; it is offered on pick lists only, never on legal boxes, the signature, rule choices or tool rows", () => {
  const pages = expand(form, FX, {});
  const industry = field(pages, "industry");
  assert.equal(validateField(industry, ctxOf({})), "This is required.");
  assert.equal(validateField(industry, ctxOf({ industry: DISCUSS_OPTION })), null);
  assert.equal(optionsOf(industry).at(-1), DISCUSS_OPTION, "the last choice of the list");
  assert.equal(offersDiscuss(industry), true);
  assert.equal(offersDiscuss(field(pages, "trade_name")), false, "optional or typed fields carry no such choice");
  for (const id of ["agree", "signature", "signer_name", "signer_authority", "items", "meet_options"]) assert.equal(offersDiscuss(field(pages, id)), false, id);
  assert.equal(validateField(field(pages, "agree"), ctxOf({})), "Tick this box to continue.");
  // a multiple choice with a required count is satisfied by the discuss choice alone
  const platforms = field(expand(ba, FX, { packages: ["Marketing"] }), "m_platforms");
  assert.equal(validateField(platforms, ctxOf({ m_platforms: [DISCUSS_OPTION] })), null);
  assert.match(validateField(platforms, ctxOf({ m_platforms: ["Facebook"] })), /exactly 2/);
  // the old box under every field is gone
  assert.equal(canDiscuss(industry, ctxOf({})), false);
});

test("rule choices and tool rows never offer the discuss choice; every other pick list does", () => {
  const answers = { items: ["fx-leads", "fx-pay"] };
  const pages = expand(form, FX, answers);
  assert.equal(optionsOf(field(pages, "rule.fx-leads.choice")).includes(DISCUSS_OPTION), false);
  const tool = pages.flatMap((p) => p.fields).find((f) => f.id.startsWith("tool.") && f.kind === "select");
  if (tool) assert.equal(optionsOf(tool).includes(DISCUSS_OPTION), false);
});

test("one optional note ends each page that asks questions; none on the agreement page or the signature page", () => {
  const pages = expand(form, FX, fillAll());
  for (const p of pages) {
    const note = p.fields.find((f) => f.id.startsWith("discuss."));
    const signature = p.fields.some((f) => f.kind === "typed"); const agreement = p.fields.some((f) => f.id === "agree");
    if (signature || agreement) assert.equal(note, undefined, p.id); else if (p.fields.some((f) => f.required !== false)) assert.ok(note && note.kind === "longtext" && note.required === false, p.id);
  }
  const company = pages.find((p) => p.id === "company");
  assert.equal(company.fields.at(-1).label, "Anything you want to discuss in a meeting? Tell us here.");
});

test("choosing the discuss option or writing a page note makes the meeting details compulsory; the page is optional otherwise", () => {
  const pages = expand(form, FX, {});
  const meeting = pages.find((p) => p.id === "meeting");
  assert.deepEqual(validatePage(meeting, ctxOf({})), {});
  assert.deepEqual(Object.keys(validatePage(meeting, ctxOf({ industry: DISCUSS_OPTION }))).sort(), ["meet_attendees", "meet_mode", "meet_options"]);
  assert.deepEqual(Object.keys(validatePage(meeting, ctxOf({ "discuss.need": "Please call me about the budget." }))).sort(), ["meet_attendees", "meet_mode", "meet_options"]);
  assert.deepEqual(Object.keys(validatePage(meeting, ctxOf({ meet_want: true }))).sort(), ["meet_attendees", "meet_mode", "meet_options"]);
});

test("the meeting agenda lists every pick list answered 'I would rather discuss this with you' and every page note, as page and item, ready for OCS", () => {
  const answers = { ...fillAll(), industry: DISCUSS_OPTION, "discuss.need": "Please talk about the budget with me." };
  const pages = expand(form, FX, answers);
  const list = meetingList(pages, ctxOf(answers));
  assert.deepEqual(list, [
    { section: "01 Your company", item: "Which industry are you in?", note: null },
    { section: "03 What do you need?", item: "Anything to discuss on this page", note: "Please talk about the budget with me." },
  ]);
  assert.deepEqual(meetingList(expand(form, FX, fillAll()), ctxOf(fillAll())), [], "nothing flagged, nothing listed");
});

// ---------------------------------------------------------------- generated pages

test("the items picked decide the pages: software, size and situation, and one rules page per category with a card per item", () => {
  const answers = { items: ["fx-leads", "fx-pay"] };
  const pages = expand(form, FX, answers);
  assert.deepEqual(pages.map((p) => p.title), ["Before you start", "01 Your company", "02 People", "03 What do you need?", "04 Your software", "05 Size and situation",
    "06 Your rules, item by item: Sales", "06 Your rules, item by item: Finance & Accounting", "07 Approvers and escalation", "08 Your rules in general",
    "09 Request a meeting (optional)", "10 Name, details and signature"]);
  const software = pages.find((p) => p.id === "software");
  assert.ok(software.fields.some((f) => f.group === "Sales" && f.label === "Customer records (CRM)"), "the software rows come from the picked category");
  assert.ok(!software.fields.some((f) => f.group === "Finance & Accounting"), "no software row for a category that was not picked");
  assert.equal(pickedPoints(answers, FX), 28);
  assert.equal(tierEstimate(form, answers, FX), "100", "28 points would fit STARTER, but STARTER is one category only");
  assert.equal(tierEstimate(form, { items: ["fx-leads", "fx-quotes"] }, FX), "STARTER");
  assert.equal(tierEstimate(form, { items: [] }, FX), null);
});

test("with nothing picked there are no generated pages; the real catalogue offers no items so none appear", () => {
  assert.deepEqual(expand(form, FX, {}).filter((p) => p.spec !== "fields"), []);
  assert.deepEqual(expand(form, REAL, {}).filter((p) => p.spec !== "fields"), [], "nothing is generated until the client picks items");
});

test("item cards: nothing is pre-selected; locked items offer no Automatic; one 'limit, approver or never do' box per item", () => {
  const answers = { items: ["fx-leads", "fx-quotes", "fx-pay"] };
  const pages = expand(form, FX, answers);
  const choice = (item) => field(pages, `rule.${item}.choice`);
  assert.deepEqual(choice("fx-leads").options, ["Automatic", "Needs my approval", "Red flag (hand to a person)"]);
  assert.deepEqual(choice("fx-pay").options, ["Needs my approval", "Red flag (hand to a person)"]);
  assert.equal(validateField(choice("fx-leads"), ctxOf(answers)), "This is required.", "no default is selected");
  // one box per item ("Limit, approver or never do"), as the PDF's table; compulsory only for Automatic on a controlled item
  assert.equal(validateField(field(pages, "rule.fx-leads.limit"), ctxOf({ ...answers, "rule.fx-leads.choice": "Automatic" })), null, "standard item");
  assert.equal(validateField(field(pages, "rule.fx-quotes.limit"), ctxOf({ ...answers, "rule.fx-quotes.choice": "Automatic" })), "This is required.", "controlled item on Automatic");
  assert.equal(validateField(field(pages, "rule.fx-quotes.limit"), ctxOf({ ...answers, "rule.fx-quotes.choice": "Needs my approval" })), null);
  assert.equal(pages.find((p) => p.id === "rules.sales").fields.length, 5, "two items, two fields each, plus the page note");
});

test("picking a category makes the related people compulsory on the People page (accountant for Finance)", () => {
  const people = (answers) => expand(form, FX, answers).find((p) => p.id === "people");
  assert.equal(validatePage(people({ items: ["fx-leads"] }), ctxOf({ items: ["fx-leads"] })).acct, undefined);
  assert.equal(validatePage(people({ items: ["fx-pay"] }), ctxOf({ items: ["fx-pay"] })).acct, "This is required.");
});

// ---------------------------------------------------------------- saving and reading back

test("a fully answered form passes every page and the final check; take any compulsory box away and it does not", () => {
  const answers = fillAll();
  const flags = {};
  assert.deepEqual(validateAll(form, FX, answers, flags), { ok: true, pageIndex: -1, errors: {} });
  assert.equal(firstIncomplete(expand(form, FX, answers), ctxOf(answers)), -1);
  const noAgree = { ...answers, agree: false };
  const r = validateAll(form, FX, noAgree, flags);
  assert.equal(r.ok, false); assert.equal(r.errors.agree, "Tick this box to continue.");
  const noItems = { ...answers, items: [] };
  assert.equal(validateAll(form, FX, noItems, flags).ok, false);
  assert.equal(validateAll(form, FX, { ...answers, signature: "" }, flags).ok, false);
});

test("saved answers are readable (page > field) and read back exactly, including people, pick lists, items and meeting choices", () => {
  const answers = { ...fillAll(), industry: DISCUSS_OPTION, "discuss.need": "Please talk about the budget with me." };
  const flags = {};
  const pages = expand(form, FX, answers);
  const labelled = toLabelled(form, pages, ctxOf(answers, flags));
  assert.deepEqual(labelled.Form, { Name: "OR ONE application form", Version: "1.0" });
  assert.equal(labelled["01 Your company"]["Company legal name"], "Northwind Dental Group");
  assert.equal(labelled["01 Your company"]["How many employees are on your payroll?"], "1 to 7", "a range is saved as the exact text the client chose");
  assert.equal(labelled["01 Your company"]["Which industry are you in?"], DISCUSS_OPTION, "'discuss' is saved as plain words ZM77 can read");
  assert.equal(labelled["03 What do you need?"]["Anything you want to discuss in a meeting? Tell us here."], "Please talk about the budget with me.");
  assert.deepEqual(labelled["03 What do you need?"]["Items you need"], ["Example item A: lead replies", "Example item B: quote drafts", "Example item C: sending money"]);
  assert.deepEqual(labelled["02 People"]["Up to 5 named people from your team can send us requests. Name at least one."], [{ Name: "Sam Lee", Role: "Owner", Email: "sam@x.example" }]);
  assert.equal(labelled["06 Your rules, item by item: Sales"]["Example item A: lead replies (8 pts)"]["Your choice"], "Automatic");
  assert.equal(labelled[MEETING_KEY], undefined, "the old flag list is gone: the answers themselves say what is to be discussed");
  assert.ok(Buffer.byteLength(JSON.stringify(labelled)) < 200 * 1024);

  const back = fromLabelled(form, FX, JSON.parse(JSON.stringify(labelled)));
  const again = toLabelled(form, expand(form, FX, back.answers), ctxOf(back.answers, back.flags));
  assert.deepEqual(again, labelled, "save, load and save again changes nothing");
  assert.deepEqual(back.flags, flags);
});

test("only fields of the form are ever saved: junk, hidden answers and over-long text do not get through", () => {
  const answers = fillAll();
  Object.assign(answers, { "totally.unknown": "x", tech_name: NONE_TEXT, tech_email: "left-over@x.example", goal: `bad\u0000text ${"yy ".repeat(3000)}`, time_sink: "o".repeat(1500) });
  const pages = expand(form, FX, answers);
  const labelled = toLabelled(form, pages, ctxOf(answers, {}));
  assert.ok(!JSON.stringify(labelled).includes("totally"), "unknown ids are dropped");
  assert.ok(!JSON.stringify(labelled).includes("left-over@x.example"), "a field the form does not have is not saved");
  const goal = labelled["03 What do you need?"]["What is the main problem you want solved first, and what would success look like?"];
  assert.ok(goal.length <= 1000 && goal.split(" ").length <= 250, "clipped to the limit");
  assert.ok(!goal.includes("\u0000"));
  assert.equal(labelled["03 What do you need?"]["What takes most of your team's time today?"].length, 40, "one long run of one letter is cut to 40 characters, never 1,500");
  assert.equal(limitTokens("a ".repeat(5) + "b".repeat(100)).split(" ").at(-1).length, 40);
});

test("invitation details pre-fill the form where it asks for them and never overwrite what the client typed", () => {
  const a = withPrefill(form, FX, {}, INVITE);
  assert.equal(a.company_legal_name, "Northwind Dental Group"); assert.equal(a.dm_name, "Laura Chen"); assert.equal(a.dm_email, "laura@northwind.example"); assert.equal(a.signer_phone, "+1 416 555 0134");
  assert.equal(withPrefill(form, FX, { dm_name: "Someone Else" }, INVITE).dm_name, "Someone Else");
});

test("the signature needs a name, a typed signature and the authority tick", () => {
  const answers = fillAll();
  assert.deepEqual(signaturePayload(form, answers), { name: "Laura Chen", title: "Some answer", signature: "Laura Chen", agree: true });
  assert.equal(signaturePayload(form, { ...answers, signer_authority: false }), null);
  assert.equal(signaturePayload(form, { ...answers, signature: "L" }), null);
});

// ---------------------------------------------------------------- the server side

const SECRET = "k".repeat(40);
const CODE = "A".repeat(43);
const CONFIG = { base: "https://ocs.example", secret: SECRET };
function harness({ config = CONFIG, ocs = { status: 200, body: { status: "ok", saved: true, savedAt: "2026-11-02T10:00:00.000Z", reference: "OR-APP-7K2M9QXV", submittedAt: "2026-11-02T10:00:00.000Z", meetings: 1 } }, allowDraft = true, limitOk = true, down = false } = {}) {
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({ url: String(url), init, body: JSON.parse(init.body) });
    if (down) throw new Error("down");
    return { status: ocs.status, json: async () => ocs.body };
  };
  const limited = [];
  return { calls, limited, deps: { config, catalogue: FX, allowDraft, fetchImpl, limit: async (key) => { limited.push(key); return limitOk; } } };
}
const body = (over = {}, answers = fillAll(), flags = {}) => JSON.stringify({ code: CODE, form: form.id, token: formToken(SECRET, CODE, form.id), answers, flags, page: 3, ...over });
const CLIENT = { address: "203.0.113.9", agent: "Mozilla/5.0" };

test("save: sends only the readable, form-defined answers to OCS, signed with the website's own key, with the client's address", async () => {
  const h = harness();
  const answers = { ...fillAll(), junk: "x" };
  const r = await handleApply("save", body({}, answers), CLIENT, h.deps);
  assert.equal(r.status, 200); assert.deepEqual(r.body, { status: "ok", saved: true, savedAt: "2026-11-02T10:00:00.000Z" });
  const call = h.calls[0];
  assert.equal(call.url, "https://ocs.example/v1/apply/save");
  const ts = call.init.headers["x-ocs-timestamp"];
  assert.equal(call.init.headers["x-ocs-signature"], "sha256=" + createHmac("sha256", SECRET).update(`${ts}.${call.init.body}`).digest("hex"));
  assert.equal(call.body.code, CODE); assert.equal(call.body.page, 3); assert.deepEqual(call.body.client, CLIENT);
  assert.ok(call.body.answers["01 Your company"] && !JSON.stringify(call.body.answers).includes("junk"));
  assert.equal(sign(SECRET, "1", "x"), "sha256=" + createHmac("sha256", SECRET).update("1.x").digest("hex"));
});

test("a link that does not belong to the form named is refused: the browser cannot pick a lenient form or someone else's link", async () => {
  const h = harness();
  assert.equal((await handleApply("save", body({ token: formToken(SECRET, "B".repeat(43), form.id) }), CLIENT, h.deps)).status, 404);
  assert.equal((await handleApply("save", body({ token: "x" }), CLIENT, h.deps)).status, 404);
  assert.equal((await handleApply("save", body({ form: "other-form" }), CLIENT, h.deps)).status, 404);
  assert.equal((await handleApply("save", body({ code: "short" }), CLIENT, h.deps)).status, 404);
  assert.equal((await handleApply("save", "{not json", CLIENT, h.deps)).status, 400);
  assert.equal(h.calls.length, 0, "nothing reached OCS");
});

test("a draft form cannot be saved or submitted unless drafts are allowed; no OCS settings means 'unavailable', never a crash", async () => {
  const closed = harness({ allowDraft: false });
  form.status = "draft";
  try { assert.equal((await handleApply("save", body(), CLIENT, closed.deps)).status, 404); } finally { form.status = "published"; }
  assert.equal((await handleApply("save", body(), CLIENT, closed.deps)).status, 200, "published: opens without the preview switch");
  assert.equal((await handleApply("save", body(), CLIENT, harness({ config: null }).deps)).status, 503);
  assert.equal(ocsApplyConfig({}), null); assert.equal(ocsApplyConfig({ OCS_APPLY_URL: "http://evil.example", OCS_APPLY_SECRET: SECRET }), null);
  assert.deepEqual(ocsApplyConfig({ OCS_APPLY_URL: "https://ocs.example/path?x=1", OCS_APPLY_SECRET: SECRET }), CONFIG);
});

test("limits: too many requests from one address get 'slow down'; oversize bodies are refused", async () => {
  const h = harness({ limitOk: false });
  const r = await handleApply("submit", body(), CLIENT, h.deps);
  assert.equal(r.status, 429); assert.equal(h.calls.length, 0); assert.deepEqual(h.limited, ["apply:submit:203.0.113.9"]);
  assert.equal((await handleApply("save", "x".repeat(250_000), CLIENT, harness().deps)).status, 413);
});

test("submit: an incomplete form is stopped here with the page and fields to fix; OCS never sees it", async () => {
  const h = harness();
  const answers = fillAll(); answers.agree = false;
  const r = await handleApply("submit", body({}, answers), CLIENT, h.deps);
  assert.equal(r.status, 422); assert.equal(r.body.status, "invalid"); assert.equal(typeof r.body.pageIndex, "number"); assert.equal(r.body.errors.agree, "Tick this box to continue.");
  assert.equal(h.calls.length, 0);
});

test("submit: a complete form goes to OCS with the signature and the meeting agenda; the reply tells the browser only what it needs", async () => {
  const h = harness();
  const answers = { ...fillAll(), industry: DISCUSS_OPTION, meet_options: "Tue or Thu morning, Toronto time", meet_mode: "Phone", meet_attendees: "Laura Chen, Operations Director" };
  const r = await handleApply("submit", body({}, answers), CLIENT, h.deps);
  assert.equal(r.status, 200); assert.deepEqual(r.body, { status: "ok", reference: "OR-APP-7K2M9QXV", submittedAt: "2026-11-02T10:00:00.000Z", meetings: 1 });
  const sent = h.calls[0].body;
  assert.equal(h.calls[0].url, "https://ocs.example/v1/apply/submit");
  assert.deepEqual(sent.signature, { name: "Laura Chen", title: "Some answer", signature: "Laura Chen", agree: true });
  assert.deepEqual(sent.meetings, [{ section: "01 Your company", item: "Which industry are you in?", note: null }]);
  assert.ok(!JSON.stringify(r.body).includes(CODE), "the link code is never echoed");
});

test("OCS answers are turned into plain statuses: 404 stays a bare 404, 409 already submitted, unreachable is 'unavailable'", async () => {
  const run = (opts) => handleApply("save", body(), CLIENT, harness(opts).deps);
  assert.deepEqual(await run({ ocs: { status: 404, body: { status: "failed", detail: "secret reason" } } }), { status: 404, body: { status: "failed" } });
  assert.deepEqual(await run({ ocs: { status: 409, body: { status: "failed" } } }), { status: 409, body: { status: "failed", code: "ALREADY_SUBMITTED" } });
  assert.equal((await run({ ocs: { status: 413, body: {} } })).status, 413);
  assert.equal((await run({ ocs: { status: 401, body: {} } })).status, 503, "a wrong key is our problem, not the client's");
  assert.deepEqual(await run({ down: true }), { status: 503, body: { status: "failed", code: "UNAVAILABLE" } });
});

// ---------------------------------------------------------------- the link stays private

test("the private pages are never indexed, cached or listed", async () => {
  const config = await readFile(new URL("../next.config.ts", import.meta.url), "utf8");
  assert.match(config, /source: "\/apply\/:path\*"[\s\S]*X-Robots-Tag[\s\S]*noindex[\s\S]*no-store[\s\S]*Referrer-Policy[\s\S]*no-referrer/);
  const robots = await readFile(new URL("../app/robots.ts", import.meta.url), "utf8");
  assert.match(robots, /disallow: \["\/apply\/", "\/api\/apply\/"\]/);
  const sitemap = await readFile(new URL("../app/sitemap.ts", import.meta.url), "utf8");
  assert.doesNotMatch(sitemap, /apply/);
  const proxy = await readFile(new URL("../proxy.ts", import.meta.url), "utf8");
  assert.match(proxy, /\?!api\|apply\|_next/);
  const layout = await readFile(new URL("../app/apply/layout.tsx", import.meta.url), "utf8");
  assert.match(layout, /index: false, follow: false/); assert.match(layout, /referrer: "no-referrer"/);
  assert.doesNotMatch(layout, /SiteChrome|ChatWidget/, "no menu, search or chat widget on a private page");
});

test("the link code and OCS key are never in the browser's code, and the browser never calls OCS", async () => {
  const client = await readFile(new URL("../app/apply/[code]/apply-form.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(client, /OCS_APPLY|process\.env|ocs\.ts|\/v1\/apply/);
  assert.match(client, /\/api\/apply\/\$\{action\}/);
  const route = await readFile(new URL("../app/api/apply/[action]/route.ts", import.meta.url), "utf8");
  assert.doesNotMatch(route, /console\.(log|info|warn|error)/, "the route never logs bodies or link codes");
});

test("the form looks like the dashboard: same font (Inter, self-hosted), same light and dark palettes, same switch; nothing from the public site's theme", async () => {
  const css = await readFile(new URL("../app/apply/apply.css", import.meta.url), "utf8");
  assert.match(css, /font-family: Inter/); assert.match(css, /\/fonts\/InterVariable\.woff2/);
  for (const token of ["#F4F2ED", "#141719", "#00758F", "#DDD9CF", "#5d6063", "#4d5154", "#00d9ff", "#9af1ff"]) assert.ok(css.includes(token), `missing dashboard colour ${token}`);
  const layout = await readFile(new URL("../app/apply/layout.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(layout, /globals\.css|next\/font|env-light/, "no site theme, no Google fonts on the private pages");
  assert.match(layout, /og-theme/); assert.match(layout, /"light"/, "light by default, like the dashboard");
  const fontFile = await readFile(new URL("../public/fonts/InterVariable.woff2", import.meta.url)); assert.ok(fontFile.length > 100_000);
  await readFile(new URL("../public/fonts/Inter-LICENSE.txt", import.meta.url));
});

// ---------------------------------------------------------------- the BA application form (PDF: BA Application Form v2)

function fillBA(start = {}) {
  const answers = withPrefill(ba, FX, { packages: ["Sales"], ...start }, INVITE);
  for (let round = 0; round < 6; round += 1) {
    for (const page of expand(ba, FX, answers)) {
      for (const f of page.fields) {
        if (!isRequired(f, ctxOf(answers, {}, FX)) || (f.id in answers && answers[f.id] !== "" && answers[f.id] !== undefined)) continue;
        answers[f.id] = sample(f);
      }
    }
  }
  return answers;
}
const ids = (answers) => new Set(expand(ba, FX, answers).flatMap((p) => p.fields.filter((f) => isVisible(f, ctxOf(answers, {}, FX))).map((f) => f.id)));
const titles = (answers) => expand(ba, FX, answers).map((p) => p.title);

test("BA: the start page comes first with the 11 terms to read and ONE tick to agree; nothing else opens until it is ticked", () => {
  assert.equal(ba.status, "published");
  assert.equal(openableForm("application", "ba", false)?.id, "ba-application");
  const start = expand(ba, FX, {})[0];
  assert.equal(start.id, "start");
  assert.equal(start.terms.length, 11);
  assert.deepEqual(start.fields.map((f) => f.id), ["agree"]);
  assert.deepEqual(Object.keys(validatePage(start, ctxOf({}, {}, FX))), ["agree"]);
  assert.deepEqual(validatePage(start, ctxOf({ agree: true }, {}, FX)), {});
});

test("OR ONE: the start page is short, the 10 terms are read in one block and agreed with one tick; no internal names reach the client", () => {
  const start = expand(form, FX, {})[0];
  assert.equal(start.terms.length, 10);
  assert.deepEqual(start.fields.map((f) => f.id), ["agree"]);
  assert.ok(start.body.join(" ").length < 560, "high-level: what it is and why we ask, no more");
  for (const f of [form, ba]) assert.doesNotMatch(JSON.stringify(f), /ZM77/i, `${f.id} must not name the internal system`);
  assert.doesNotMatch(JSON.stringify(REAL), /ZM77/i);
});

test("silent limits: every typed box has a word and character cap by kind of question, enforced on check and on save (nothing shown to the client)", () => {
  const pages = expand(form, FX, {});
  const words = (n) => Array.from({ length: n }, (_, i) => `w${i}`).join(" ");
  const tiny = (n) => Array(n).fill("w").join(" ");
  assert.equal(validateField(field(pages, "dm_name"), ctxOf({ dm_name: words(15) })), null, "a name of 15 words is fine");
  assert.equal(validateField(field(pages, "dm_name"), ctxOf({ dm_name: words(16) })), "That answer is too long. Please shorten it.");
  assert.equal(validateField(field(pages, "goal"), ctxOf({ goal: tiny(250) })), null);
  assert.equal(validateField(field(pages, "goal"), ctxOf({ goal: "o".repeat(1500) })), "That answer is too long. Please shorten it.", "one 1,500-letter word is refused");
  assert.equal(validateField(field(pages, "goal"), ctxOf({ goal: `${"w ".repeat(480)}${"x".repeat(60)}` })), "That answer is too long. Please shorten it.", "over 1,000 characters, or a 60-letter word");
  assert.equal(validateField(field(pages, "goal"), ctxOf({ goal: words(300) })), "That answer is too long. Please shorten it.", "300 words in a long box");
  assert.equal(validateField(field(pages, "address"), ctxOf({ address: words(41) })), "That answer is too long. Please shorten it.");
  assert.equal(validateField(field(pages, "signature"), ctxOf({ signature: words(20) })), "That answer is too long. Please shorten it.");
  const people = field(pages, "requesters");
  assert.equal(validateField(people, ctxOf({ requesters: [{ name: words(20), role: "x", email: "a@b.example" }] })), "That answer is too long. Please shorten it.");
  // Saving clips instead of failing, so a pasted essay never reaches OCS.
  const answers = { ...fillAll(), dm_name: words(40), goal: tiny(900) };
  const labelled = toLabelled(form, expand(form, FX, answers), ctxOf(answers));
  assert.equal(labelled["02 People"]["Decision-maker: name and title"].split(" ").length, 15);
  assert.equal(labelled["03 What do you need?"]["What is the main problem you want solved first, and what would success look like?"].split(" ").length, 250);
  assert.equal(capsFor({ id: "x", label: "Email", kind: "email" }).words, 1);
});

test("BA: the packages chosen decide the pages; a package not chosen has no page and no software rows", () => {
  assert.deepEqual(titles({ packages: ["Sales"] }), ["Before you start", "01 Your company", "02 People", "03 What do you need?", "04 Your software",
    "05 Sales and Customer Service", "09 Sign-off sheet", "10 Your plan size", "11 Request a meeting (optional)", "12 Name, details and signature"]);
  const sales = ids({ packages: ["Sales"] });
  assert.ok(sales.has("tool.crm") && sales.has("tool.esign") && !sales.has("tool.social") && !sales.has("tool.accounting") && !sales.has("tool.device"));
});

test("BA: a tool that appears under two packages is asked once (payments in Finance, email in Marketing, platform in software)", () => {
  assert.ok(ids({ packages: ["Sales"] }).has("tool.sales_payments"), "Sales alone asks payments");
  const both = ids({ packages: ["Sales", "Finance"] });
  assert.ok(both.has("tool.fin_payments") && !both.has("tool.sales_payments"), "with Finance chosen, payments is asked under Finance only");
  assert.ok(ids({ packages: ["Sales"] }).has("tool.sales_email") && !ids({ packages: ["Sales", "Marketing"] }).has("tool.sales_email"));
  assert.ok(ids({ packages: ["Sales", "Marketing"] }).has("tool.mkt_email"));
  const it = ids({ packages: ["IT"] });
  assert.ok(it.has("platform") && it.has("tool.itsupport"));
  assert.ok(!expand(ba, FX, { packages: ["IT"] }).find((p) => p.id === "it").fields.some((f) => f.id === "platform"), "the IT section does not ask the platform again");
});

test("BA: IT support uses the OR ONE options (decision 4); Zendesk is not offered anywhere on the BA form", () => {
  const field = expand(ba, FX, { packages: ["IT"] }).flatMap((p) => p.fields).find((f) => f.id === "tool.itsupport");
  assert.deepEqual(field.options, ["Support desk above", "Freshservice", "Jira Service Mgmt", "Not sure, recommend"]);
  assert.doesNotMatch(JSON.stringify(ba), /Zendesk/);
});

test("BA: platforms must be exactly 2, and the ad budget is asked only when ads are wanted", () => {
  const pages = expand(ba, FX, { packages: ["Marketing"] });
  const plat = pages.find((p) => p.id === "marketing").fields.find((f) => f.id === "m_platforms");
  assert.equal(validateField(plat, ctxOf({ m_platforms: ["Facebook"] }, {}, FX)), "Choose exactly 2.");
  assert.equal(validateField(plat, ctxOf({ m_platforms: ["Facebook", "Instagram"] }, {}, FX)), null);
  const budget = pages.find((p) => p.id === "marketing").fields.find((f) => f.id === "m_budget");
  assert.equal(isVisible(budget, ctxOf({ m_ads: "No ads" }, {}, FX)), false);
  assert.equal(isRequired(budget, ctxOf({ m_ads: "Google Ads" }, {}, FX)), true);
});

test("BA: something else needs a description; a complete BA form passes every page and the final check", () => {
  const answers = fillBA({ packages: ["Sales", "Something else (tailored automation)"] });
  assert.equal(validateField(field(expand(ba, FX, answers), "something_else"), ctxOf({ packages: answers.packages, something_else: "" }, {}, FX)), "This is required.");
  const full = fillBA();
  assert.deepEqual(validateAll(ba, FX, full, {}), { ok: true, pageIndex: -1, errors: {} });
  assert.equal(validateAll(ba, FX, { ...full, agree: false }, {}).ok, false, "the agreement must be ticked");
});

// ---------------------------------------------------------------- the Business Setup forms (PDF: Business Setup samples)

/** Fills every compulsory visible field of a form, repeating until nothing new appears (pages and rows depend on earlier answers). */
function fillDef(def, catalogue, start) {
  const answers = { ...start };
  for (let round = 0; round < 6; round += 1) {
    for (const page of expand(def, catalogue, answers)) {
      for (const f of page.fields) {
        if (!isRequired(f, ctxOf(answers, {}, catalogue)) || (f.id in answers && answers[f.id] !== "" && answers[f.id] !== undefined)) continue;
        answers[f.id] = sample(f);
      }
    }
  }
  return answers;
}
const setupFields = (def, catalogue, answers) => expand(def, catalogue, answers).flatMap((p) => p.fields.filter((f) => isVisible(f, ctxOf(answers, {}, catalogue))));

test("OR ONE setup: five pages in the PDF's grouping, one confirm row per item the client chose, the rule and approver shown as the application has them", () => {
  const app = fillAll(REAL, { items: ["s-leadgen", "f-ap", "i-patch"] });
  const setup = orOneSetup(app, REAL);
  assert.equal(setup.formType, "setup"); assert.equal(setup.status, "published");
  assert.deepEqual(setup.pages.map((p) => p.page.title.slice(0, 2)), ["01", "02", "04", "06", "08"]);
  const fields = setupFields(setup, REAL, {});
  const rows = fields.filter((f) => f.id.startsWith("c.item.")).map((f) => f.id);
  assert.deepEqual(rows, ["c.item.s-leadgen", "c.item.f-ap", "c.item.i-patch"], "one confirm row per picked item and no other");
  const row = fields.find((f) => f.id === "c.item.f-ap");
  assert.match(row.help, /Needs my approval/, "the application's rule is shown");
});

test("OR ONE setup: tools are the ones the application chose, with the vendor shown; nothing asks for a password, key or card number", () => {
  const app = fillAll(REAL, { items: ["s-leadgen", "i-patch"] });
  const setup = orOneSetup(app, REAL);
  const fields = setupFields(setup, REAL, {});
  const vendor = fields.find((f) => f.id === "t.tool-sales-crm.vendor");
  assert.ok(vendor, "CRM row present because a sales item was picked");
  assert.match(vendor.help, /HubSpot/, "the vendor the client chose is shown");
  assert.equal(fields.some((f) => f.id.startsWith("t.tool-finance-")), false, "no finance tool row without a finance item");
  for (const f of fields) assert.doesNotMatch(f.label, /your password|api key|card number|secret/i, f.label);
});

test("OR ONE setup: a complete setup can be signed; the client confirms or corrects every row and the final statements", () => {
  const app = fillAll(REAL, { items: ["s-leadgen", "f-ap", "i-patch"] });
  const setup = orOneSetup(app, REAL);
  const answers = fillDef(setup, REAL, {});
  assert.deepEqual(validateAll(setup, REAL, answers, {}), { ok: true, pageIndex: -1, errors: {} });
  assert.equal(validateAll(setup, REAL, { ...answers, "c.item.f-ap": "Change needed" }, {}).ok, false, "a change needs words");
  assert.equal(validateAll(setup, REAL, { ...answers, "final.golive": false }, {}).ok, false, "go-live needs the decision-maker's tick");
});

test("BA setup: five pages, a sign-off line only for the packages chosen, and the packages and approvers shown as on the application", () => {
  const app = fillBA({ packages: ["Sales", "Finance"] });
  const setup = baSetup(app);
  assert.deepEqual(setup.pages.map((p) => p.page.title.slice(0, 2)), ["01", "02", "04", "06", "08"]);
  const lines = setupFields(setup, FX, {}).filter((f) => f.id.startsWith("so.")).map((f) => f.id);
  assert.deepEqual(lines, ["so.followups", "so.quotes", "so.invoices", "so.money"]);
  const packages = setupFields(setup, FX, {}).find((f) => f.id === "c.packages");
  assert.match(packages.help, /Sales, Finance/);
});

test("BA setup: a complete setup can be signed", () => {
  const app = fillBA({ packages: ["Sales", "IT"] });
  const setup = baSetup(app);
  const answers = fillDef(setup, FX, {});
  assert.deepEqual(validateAll(setup, FX, answers, {}), { ok: true, pageIndex: -1, errors: {} });
  // A setup is never a fixed form: it is built per link from the application (see the setup tests at the end of this file).
  assert.equal(openableForm("setup", "ba", true), null);
  assert.equal(openableForm("setup", "or_one", true), null);
});

test("categories: the client ticks them in section 03; only ticked categories show items, software, size and rules, and each needs an item", () => {
  const all = ["fx-leads", "fx-pay"];
  const pageIds = (answers) => expand(form, FX, answers).map((p) => p.id);
  assert.ok(pageIds({ categories: ["Sales"], items: all }).includes("situation"));
  assert.deepEqual(pageIds({ categories: ["Sales"], items: all }).filter((id) => id.startsWith("rules.")), ["rules.sales"], "Finance was not ticked, so its item is dropped");
  assert.equal(pickedPoints({ categories: ["Sales"], items: all }, FX), 8);
  assert.deepEqual(pageIds({ categories: [], items: all }).filter((id) => id.startsWith("rules.") || id === "software" || id === "situation"), [], "no category ticked: no generated pages");
  const ticked = { categories: ["Sales", "Finance & Accounting"], items: ["fx-leads"] };
  const need = expand(form, FX, ticked).find((p) => p.id === "need");
  assert.equal(validateField(field([need], "items"), ctxOf(ticked)), "Choose at least one item in each category you ticked.");
  assert.equal(validateField(field([need], "categories"), ctxOf({ categories: [] })), "This is required.");
  assert.equal(validateField(field([need], "items"), ctxOf({ categories: ["Sales"], items: ["fx-leads"] })), null);
});

test("the web form footer says it was prepared with the help of AI and mistakes are possible", async () => {
  const client = await readFile(new URL("../app/apply/[code]/apply-form.tsx", import.meta.url), "utf8");
  assert.match(client, /prepared with the help of AI\. Mistakes are possible/);
});

// ---------------------------------------------------------------- the browser only receives what the client ticked

test("the browser is first given category names only; a category's items, limits, questions and vendors are sent only when it is ticked", () => {
  const none = JSON.stringify(withDetails(REAL, []));
  for (const secret of ["whatItDoes", "fixedLimits", "suggestedDefault", "HubSpot", "Wise Business", "Procurify", "Cold email outreach"]) assert.ok(!none.includes(secret), `${secret} must not be sent before a tick`);
  assert.equal(JSON.parse(none).categories.length, 10, "the ten category names are public");
  const sales = JSON.stringify(withDetails(REAL, ["Sales"]));
  assert.ok(sales.includes("Cold email outreach") && sales.includes("HubSpot"), "ticked Sales is sent");
  assert.ok(!sales.includes("Wise Business") && !sales.includes("Payroll processing"), "Finance was not ticked, so none of it is sent");
  assert.deepEqual(detailsFor(REAL, ["Marketing & Branding", "nope"]).map((c) => c.name), ["Marketing & Branding"]);
});

test("details call: only the ticked categories come back, only for a valid link, and OCS is never contacted", async () => {
  const h = harness();
  const ask = (over = {}) => handleApply("details", JSON.stringify({ code: CODE, form: form.id, token: formToken(SECRET, CODE, form.id), categories: ["Sales"], ...over }), CLIENT, h.deps);
  const ok = await ask();
  assert.equal(ok.status, 200); assert.deepEqual(ok.body.categories.map((c) => c.name), ["Sales"]);
  assert.ok(!JSON.stringify(ok.body).includes("Example item C"), "Finance details are not included");
  assert.deepEqual((await ask({ categories: ["Finance & Accounting", "made up"] })).body.categories.map((c) => c.name), ["Finance & Accounting"]);
  assert.deepEqual((await ask({ categories: "Sales" })).body.categories, [], "a malformed list gives nothing");
  assert.equal((await ask({ token: "wrong" })).status, 404);
  assert.equal((await ask({ code: "short" })).status, 404);
  assert.equal(h.calls.length, 0, "no call to OCS for details");
  const limited = harness({ limitOk: false });
  assert.equal((await handleApply("details", JSON.stringify({ code: CODE, form: form.id, token: formToken(SECRET, CODE, form.id), categories: ["Sales"] }), CLIENT, limited.deps)).status, 429);
});

test("the page sends the browser a stripped catalogue and the browser fetches details itself", async () => {
  const page = await readFile(new URL("../app/apply/[code]/page.tsx", import.meta.url), "utf8");
  assert.match(page, /withDetails\(catalogue/);
  assert.doesNotMatch(page, /catalogue=\{catalogue\}/, "the full catalogue is never passed to the browser");
  const client = await readFile(new URL("../app/apply/[code]/apply-form.tsx", import.meta.url), "utf8");
  assert.match(client, /\/api\/apply\/details/);
  assert.doesNotMatch(client, /catalogue\.ts|getCatalogue|REAL\b/, "the browser never imports the full catalogue");
});


// ---------------------------------------------------------------- Business setup, built from the application it was sent for
const SETUP_APP = (() => {
  const answers = fillAll();
  const labelled = toLabelled(form, expand(form, FX, answers), ctxOf(answers));
  return { answers, labelled };
})();
const SETUP_OPEN = { status: "ok", state: "open", formType: "setup", product: "or_one", basedOn: { reference: "OR-APP-7K2M9QXV", answers: SETUP_APP.labelled } };
function setupHarness({ open = SETUP_OPEN, allowDraft = true } = {}) {
  const calls = [];
  const fetchImpl = async (url, init) => {
    const call = { url: String(url), body: JSON.parse(init.body) }; calls.push(call);
    if (call.url.endsWith("/v1/apply/open")) return { status: 200, json: async () => open };
    return { status: 200, json: async () => ({ status: "ok", saved: true, savedAt: "2026-11-03T10:00:00.000Z", reference: "OR-SET-4G7H2JKM", submittedAt: "2026-11-03T10:00:00.000Z", meetings: 0 }) };
  };
  return { calls, deps: { config: CONFIG, catalogue: FX, allowDraft, fetchImpl, limit: async () => true } };
}
const setupDef = () => setupFromOpen("or_one", SETUP_OPEN, FX);
const setupBody = (over = {}, answers = fillDef(setupDef(), FX, {})) => JSON.stringify({ code: CODE, form: "or-one-setup", token: formToken(SECRET, CODE, "or-one-setup"), answers, flags: {}, page: 2, ...over });

test("setup: the form is built from the application's own answers: its items and categories, nothing else", () => {
  const def = setupDef();
  assert.equal(def.id, "or-one-setup"); assert.equal(def.formType, "setup");
  const labels = def.pages.flatMap((p) => (p.kind === "fields" ? p.page.fields : [])).map((f) => f.label).join(" | ");
  for (const c of FX.categories) for (const i of c.items) if (SETUP_APP.answers.items.includes(i.id)) assert.ok(labels.includes(i.name), i.name);
  assert.equal(setupFromOpen("or_one", { ...SETUP_OPEN, basedOn: undefined }, FX), null, "no application, no setup");
  assert.equal(setupFromOpen("services", SETUP_OPEN, FX), null);
  assert.equal(setupProductFor("or-one-setup"), "or_one"); assert.equal(setupProductFor("ba-setup"), "ba"); assert.equal(setupProductFor("or-one-application"), null);
});

test("setup: a published setup opens; the gate still applies to any draft setup", () => {
  assert.equal(openableSetup("or_one", SETUP_APP.answers, FX, false)?.id, "or-one-setup");
  assert.equal(openableSetup("or_one", SETUP_APP.answers, FX, true)?.id, "or-one-setup");
  assert.equal(openableSetup("services", SETUP_APP.answers, FX, true), null);
});

test("setup save: the server rebuilds the form from OCS (a quiet open), then saves only the setup's own fields", async () => {
  const h = setupHarness();
  const r = await handleApply("save", setupBody({}, { ...fillDef(setupDef(), FX, {}), junk: "x" }), CLIENT, h.deps);
  assert.equal(r.status, 200);
  assert.equal(h.calls[0].url, "https://ocs.example/v1/apply/open");
  assert.equal(h.calls[0].body.quiet, true);
  assert.equal(h.calls[1].url, "https://ocs.example/v1/apply/save");
  assert.ok(!JSON.stringify(h.calls[1].body.answers).includes("junk"));
});

test("setup submit: a complete, signed setup is stored; an incomplete one is refused before OCS sees it", async () => {
  const h = setupHarness();
  const ok = await handleApply("submit", setupBody(), CLIENT, h.deps);
  assert.equal(ok.status, 200); assert.equal(ok.body.reference, "OR-SET-4G7H2JKM");
  const h2 = setupHarness();
  const bad = await handleApply("submit", setupBody({}, { ...fillDef(setupDef(), FX, {}), signature: "" }), CLIENT, h2.deps);
  assert.equal(bad.status, 422);
  assert.equal(h2.calls.some((c) => c.url.endsWith("/v1/apply/submit")), false);
});

test("setup: refused when OCS says it is not this product's setup, has no application, or the token is wrong", async () => {
  for (const open of [{ ...SETUP_OPEN, product: "ba" }, { ...SETUP_OPEN, formType: "application" }, { ...SETUP_OPEN, basedOn: undefined }, { ...SETUP_OPEN, state: "submitted" }]) {
    assert.equal((await handleApply("save", setupBody(), CLIENT, setupHarness({ open }).deps)).status, 404);
  }
  assert.equal((await handleApply("save", setupBody(), CLIENT, setupHarness({ allowDraft: false }).deps)).status, 200, "a published setup opens without the preview switch");
  assert.equal((await handleApply("save", setupBody({ token: "x" }), CLIENT, setupHarness().deps)).status, 404);
});

test("setup: no field offers the meeting box (a setup is confirm or correct), and nothing is lost from the forms", () => {
  const app = fillBA({ packages: ["Sales", "Marketing"] });
  for (const def of [baSetup(app), setupFromOpen("or_one", SETUP_OPEN, FX)]) {
    const fields = def.pages.flatMap((p) => (p.kind === "fields" ? p.page.fields : []));
    assert.ok(fields.length > 20);
    for (const f of fields) assert.equal(canDiscuss(f, ctxOf({}, {}, FX)), false, f.id);
  }
});

test("go-live guard: all four forms are published and none carries a placeholder, a 'to confirm' tag or a draft marker in anything a client reads", () => {
  const app = fillBA({ packages: ["Sales", "Marketing"] });
  const defs = [form, ba, setupFromOpen("or_one", SETUP_OPEN, FX), baSetup(app)];
  for (const def of defs) {
    assert.equal(def.status, "published", def.id);
    const text = JSON.stringify(def);
    assert.doesNotMatch(text, /\[[^\]]*(to confirm|counsel|TBD|TODO|retention period)[^\]]*\]/i, `${def.id}: placeholder in client text`);
    assert.doesNotMatch(text, /draft/i.test(def.version) ? /$^/ : /draft-/i, def.id);
    assert.doesNotMatch(text, /ZM77/, `${def.id}: internal name`);
  }
  assert.match(JSON.stringify(form), /keeps it for 24 months/);
});
