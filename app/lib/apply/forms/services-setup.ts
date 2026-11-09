// The Services Business Setup: shown after the contract is signed, pre-filled from the client's Services application (every line is
// built from the application's answers, so setup matches what the client applied for). DRAFT for Mohammad's review: not registered, not
// published. Nothing here asks for a password, key or card number: the client's own administrator approves read-only access in the
// vendor's own sign-in. Specialist (C10) services are not part of this setup (held until after landing).
import type { Answers, Cond, Field, FormDefinition, PageSpec } from "../types";
import { band } from "../choices.ts";

const CONFIRM = ["Correct", "Change needed"] as const;
const when = (on: boolean): Cond | undefined => (on ? undefined : { field: "not_applicable_here", is: true });

const text = (id: string, label: string, o: Partial<Field> = {}): Field => ({ id, label, kind: "text", required: true, ...o });
const email = (id: string, label: string, o: Partial<Field> = {}): Field => ({ id, label, kind: "email", required: true, ...o });
const long = (id: string, label: string, o: Partial<Field> = {}): Field => ({ id, label, kind: "longtext", required: true, ...o });
const check = (id: string, label: string, textOf: string, o: Partial<Field> = {}): Field => ({ id, label, kind: "check", text: textOf, ...o });
const choose = (id: string, label: string, options: readonly string[], o: Partial<Field> = {}): Field =>
  ({ id, label, kind: "select", choice: true, required: true, options: [...options], ...o });

const show = (v: unknown): string => (Array.isArray(v) ? v.join(", ") : v === undefined || v === null ? "" : String(v));

/** A line the client confirms or corrects. The application's answer is shown as help text and is never changed here. */
function confirmRow(id: string, label: string, asOnApplication: string, group?: string): Field[] {
  return [
    { id: `c.${id}`, label, group, kind: "select", choice: true, required: true, options: [...CONFIRM], help: `As on your application: ${asOnApplication || "—"}` },
    { id: `c.${id}.change`, label: `${label}: what should change`, group, kind: "longtext", required: false, discuss: false,
      showIf: { field: `c.${id}`, is: "Change needed" }, requiredIf: { field: `c.${id}`, is: "Change needed" } },
  ];
}

const ACCESS_HOW = ["Our own IT person or provider installs it", "ORAGROL guides us step by step", "We use a deployment tool (for example Intune)"] as const;
const SCAN_WINDOW = ["Any time", "Evenings and weekends only", "Weekends only"] as const;
const REACH = ["24 hours a day, 7 days a week", "Business hours, with a phone for after hours"] as const;
const CODE_HOST = ["GitHub", "GitLab", "Bitbucket", "Azure DevOps", "Another platform"] as const;

export const SERVICES_STATEMENTS: readonly { id: string; label: string; text: string }[] = [
  { id: "final.access", label: "Read-only access", text: "My administrator will approve read-only access for ORAGROL in my own account. I have not sent and will not send any password, key or card number to ORAGROL." },
  { id: "final.reports", label: "Reports and approval", text: "ORAGROL reviews every report before it is sent to me. Any change to my systems needs my named approver's approval first." },
  { id: "final.isolation", label: "Device isolation", text: "If ORAGROL confirms a serious threat, ORAGROL or its security provider may isolate the affected device from the network to contain it, and will tell my named urgent contact straight away." },
  { id: "final.scanning", label: "Scanning", text: "I own or control the websites, applications and cloud accounts named here, and I authorise ORAGROL to scan them in the window I chose." },
  { id: "final.contacts", label: "Named people", text: "The people named here are authorised to act for my company. I will tell ORAGROL immediately if one of them changes." },
  { id: "final.golive", label: "Go-live", text: "I approve this setup. ORAGROL may start my service." },
];

export function servicesSetup(app: Answers): FormDefinition {
  const platform = show(app.platform);
  const m365 = platform === "Microsoft 365" || platform === "Both";
  const google = platform === "Google Workspace" || platform === "Both";
  const individual = Array.isArray(app.individual) ? (app.individual as string[]) : [];
  const dev = individual.includes("Secure Software Development Lifecycle (SSDLC)") || individual.includes("Application Security Testing");
  const cloud = show(app.cloud_accounts) !== "" && show(app.cloud_accounts) !== "None";
  const sites = show(app.sites) !== "" && show(app.sites) !== "None";

  const pages: PageSpec[] = [
    { kind: "fields", page: { id: "company", title: "01 Confirm your company and contract details", intro: "Pre-filled from your application. For each line choose Correct, or Change needed and tell us what to change. Your application is not changed by this page.", fields: [
      ...confirmRow("company", "Company legal name and trade name", `${show(app.company_legal_name)}${app.trade_name ? ` / ${show(app.trade_name)}` : ""}`),
      ...confirmRow("address", "Business address and provinces", `${show(app.address)}; ${show(app.provinces)}`),
      ...confirmRow("decider", "Decision-maker: name, title, email, phone", `${show(app.dm_name)}, ${show(app.dm_email)}, ${show(app.dm_phone)}`),
      ...confirmRow("billing", "Billing contact", show(app.billing)),
      ...confirmRow("package", "Package and individual services", `${show(app.package)}${individual.length ? `; ${individual.join(", ")}` : ""}`),
      ...confirmRow("size", "Number of people, devices and platform", `${show(app.users)} email accounts; ${show(app.devices)} devices; ${platform}`),
    ] } },
    { kind: "fields", page: { id: "contacts", title: "02 Contacts and urgent alerts", intro: "These are the people we call and write to. Every name must be a real person who can act.", fields: [
      ...confirmRow("urgent", "Urgent threat contact: name and phone", show(app.urgent_name), "Urgent threats"),
      ...confirmRow("urgent_backup", "Backup for urgent threats", show(app.urgent_backup), "Urgent threats"),
      choose("u.hours", "When can your urgent contact be reached?", REACH, { group: "Urgent threats" }),
      email("u.email", "Email for urgent alerts", { group: "Urgent threats", discuss: false }),
      ...confirmRow("reports", "Who receives the reports", show(app.report_to), "Reports"),
      ...confirmRow("approver", "Who approves changes to your systems", show(app.change_approver), "Approvals"),
      text("ap.backup", "Backup approver: name, role, email and phone", { group: "Approvals", minWords: 3 }),
      choose("ap.reach", "Best way to reach your approver", ["Email", "Phone", "Either"], { group: "Approvals" }),
    ] } },
    { kind: "fields", page: { id: "access", title: "03 Approve read-only access", intro: "ORAGROL reads from your systems with read-only access. Your own administrator approves it in your account through the vendor's secure sign-in. Do not send passwords or keys.", fields: [
      text("m365.admin", "Microsoft 365 administrator: name and email", { group: "Microsoft 365", showIf: when(m365), discuss: false }),
      check("m365.approve", "Microsoft 365 approval", "My Microsoft 365 administrator will approve ORAGROL's read-only access when ORAGROL sends the approval request.", { group: "Microsoft 365", showIf: when(m365) }),
      text("g.admin", "Google Workspace administrator: name and email", { group: "Google Workspace", showIf: when(google), discuss: false }),
      check("g.approve", "Google Workspace approval", "My Google Workspace administrator will approve ORAGROL's read-only access when ORAGROL sends the approval request.", { group: "Google Workspace", showIf: when(google) }),
      choose("e.how", "How will the protection software be installed on your computers?", ACCESS_HOW, { group: "Your computers" }),
      text("e.contact", "Who installs it: name and email", { group: "Your computers", discuss: false }),
      long("cl.list", "Your cloud accounts (names or IDs, for example the Azure subscription name)", { group: "Cloud accounts", showIf: when(cloud) }),
      check("cl.approve", "Cloud account approval", "My administrator will approve ORAGROL's read-only access to these accounts through the provider's own sign-in.", { group: "Cloud accounts", showIf: when(cloud) }),
      long("w.list", "Websites and web applications to cover (addresses)", { group: "Websites and applications", showIf: when(sites) }),
      choose("w.window", "When may we scan them?", SCAN_WINDOW, { group: "Websites and applications", showIf: when(sites) }),
      band("dev.host", "Where is your source code kept?", CODE_HOST, { group: "Software development", showIf: when(dev) }),
    ] } },
    { kind: "fields", page: { id: "authorise", title: "04 Your authorisations", intro: "Read each statement. You sign them together on the last page.", fields: [
      ...SERVICES_STATEMENTS.filter((s) => s.id !== "final.golive").map((s) => check(`auth.${s.id.replace("final.", "")}`, s.label, s.text, { group: "Authorisations" })),
      long("auth.notes", "Anything we should know before we start, such as busy periods, systems we must not touch, or people on leave", { required: false, group: "Before we start" }),
    ] } },
    { kind: "fields", page: { id: "final", title: "05 Final approval and go-live", intro: "Your decision-maker confirms, then signs. After that, ORAGROL starts your service.", fields: [
      check("final.golive", "Go-live", SERVICES_STATEMENTS[SERVICES_STATEMENTS.length - 1].text, { group: "Approval" }),
      text("signer_name", "Name of the decision-maker", { group: "Signature", prefill: "person", discuss: false }),
      text("signer_title", "Title and authority", { group: "Signature", discuss: false }),
      { id: "signed_on", label: "Date (filled automatically)", group: "Signature", kind: "autodate" },
      { id: "signature", label: "Signature (type your full name)", group: "Signature", kind: "typed" },
    ] } },
  ];
  const clean = pages.map((p) => (p.kind === "fields" ? { ...p, page: { ...p.page, fields: p.page.fields.map((f) => ({ ...f, discuss: false })) } } : p));
  return {
    id: "services-setup", name: "Services Business Setup", formType: "setup", product: "services", status: "published", version: "1.0", pages: clean, tiers: [],
    signature: { name: "signer_name", title: "signer_title", typed: "signature", agree: "final.golive" },
    whatNext: ["ORAGROL checks each line you confirmed or changed.", "Your administrator approves the read-only access we request.", "We run a first scan and check that every connection works.", "We start your service and send your first report."],
  };
}
