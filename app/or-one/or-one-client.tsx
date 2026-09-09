"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { ScopeTray, useScope } from "../components/ScopeTray";
import PreFooterCta from "../components/site/pre-footer-cta";
import SiteFooter from "../components/site/footer";
import OragrolMegaNav from "../components/site/oragrol-mega-nav";
import { NAV_ITEMS } from "../components/site/nav-items";
import { OR_ONE_CAPABILITY_BY_NAME } from "../lib/or-one-capability-registry";
import {
  RevisedProcess,
  RevisedPricing,
  RevisedResponsibility,
  RevisedManagement,
} from "./review-sections";
import "../gpt-pages.css";
type Risk = "Standard" | "Controlled" | "Critical";
type Item = { name: string; points: number; risk: Risk };
type Group = { name: string; benefit: string; items: Item[] };
const groups: Group[] = [
  {
    name: "Sales",
    benefit:
      "Build a sales operation that finds, qualifies and follows opportunity consistently.",
    items: [
      { name: "Lead generation/prospecting", points: 10, risk: "Standard" },
      { name: "Cold email outreach", points: 8, risk: "Standard" },
      { name: "Lead qualification", points: 8, risk: "Standard" },
      { name: "Quote/proposal drafting", points: 7, risk: "Controlled" },
      {
        name: "CRM data entry & pipeline tracking",
        points: 6,
        risk: "Controlled",
      },
      {
        name: "Follow-up with existing clients",
        points: 5,
        risk: "Controlled",
      },
      {
        name: "Upsell/cross-sell offer generation",
        points: 8,
        risk: "Controlled",
      },
      { name: "Sales forecasting & reporting", points: 7, risk: "Standard" },
      { name: "Referral management", points: 5, risk: "Standard" },
    ],
  },
  {
    name: "Marketing & Branding",
    benefit:
      "Create, distribute and measure brand activity without losing consistency.",
    items: [
      { name: "Website management", points: 8, risk: "Standard" },
      { name: "SEO", points: 10, risk: "Standard" },
      { name: "Content writing", points: 7, risk: "Standard" },
      { name: "Social media posting", points: 6, risk: "Controlled" },
      { name: "Email marketing", points: 6, risk: "Controlled" },
      { name: "Paid ad campaign management", points: 12, risk: "Controlled" },
      { name: "Graphic design (routine)", points: 8, risk: "Standard" },
      { name: "Market & competitor research", points: 7, risk: "Standard" },
      { name: "Marketing analytics/reporting", points: 6, risk: "Standard" },
      { name: "Lead-gen campaigns", points: 9, risk: "Controlled" },
    ],
  },
  {
    name: "Finance & Accounting",
    benefit:
      "Turn routine financial administration into a controlled, auditable operating system.",
    items: [
      { name: "Bookkeeping", points: 9, risk: "Controlled" },
      { name: "Accounts payable", points: 8, risk: "Critical" },
      { name: "Accounts receivable/invoicing", points: 8, risk: "Controlled" },
      { name: "Payroll processing", points: 10, risk: "Critical" },
      { name: "Bank reconciliation", points: 7, risk: "Controlled" },
      { name: "Financial statements", points: 9, risk: "Controlled" },
      { name: "Budgeting & forecasting", points: 8, risk: "Standard" },
      { name: "Expense tracking/reimbursement", points: 6, risk: "Critical" },
      { name: "Cash flow management", points: 7, risk: "Controlled" },
      { name: "Financial reporting to ownership", points: 6, risk: "Standard" },
      {
        name: "Tax preparation (client-validated filing)",
        points: 12,
        risk: "Critical",
      },
    ],
  },
  {
    name: "HR & People",
    benefit:
      "Support the employee lifecycle with structured, responsible automation.",
    items: [
      { name: "Recruiting/job posting", points: 5, risk: "Standard" },
      { name: "Resume screening", points: 7, risk: "Critical" },
      { name: "Onboarding", points: 6, risk: "Controlled" },
      { name: "Employee records", points: 5, risk: "Controlled" },
      { name: "Benefits administration", points: 7, risk: "Controlled" },
      { name: "Training & development", points: 7, risk: "Standard" },
      { name: "PTO/time-off tracking", points: 4, risk: "Standard" },
      { name: "Workplace policy management", points: 6, risk: "Controlled" },
      { name: "Offboarding", points: 5, risk: "Critical" },
      {
        name: "Employment-law compliance tracking",
        points: 8,
        risk: "Controlled",
      },
    ],
  },
  {
    name: "Customer Service",
    benefit:
      "Respond faster and maintain a consistent experience from inquiry through follow-up.",
    items: [
      { name: "Answering inquiries", points: 8, risk: "Controlled" },
      { name: "Complaint triage/handling", points: 7, risk: "Controlled" },
      { name: "Order/service issue resolution", points: 7, risk: "Controlled" },
      { name: "Returns/refunds", points: 6, risk: "Critical" },
      { name: "FAQ/knowledge base upkeep", points: 5, risk: "Standard" },
      { name: "Satisfaction surveys", points: 4, risk: "Standard" },
      { name: "Support ticket tracking", points: 6, risk: "Standard" },
      { name: "After-sales follow-up", points: 5, risk: "Controlled" },
    ],
  },
  {
    name: "Operations & Admin",
    benefit: "Connect the everyday work that keeps the business moving.",
    items: [
      { name: "Scheduling/calendar management", points: 5, risk: "Standard" },
      { name: "Document filing", points: 5, risk: "Standard" },
      { name: "Data entry across systems", points: 7, risk: "Controlled" },
      { name: "Internal communications", points: 5, risk: "Standard" },
      {
        name: "Meeting coordination & notetaking",
        points: 7,
        risk: "Standard",
      },
      { name: "SOP documentation", points: 6, risk: "Standard" },
      { name: "Project/task tracking", points: 6, risk: "Standard" },
      {
        name: "Inventory tracking/reorder alerts",
        points: 7,
        risk: "Controlled",
      },
      { name: "Shipping coordination", points: 6, risk: "Controlled" },
    ],
  },
  {
    name: "IT & Technology",
    benefit:
      "Keep technology connected, maintained and operational without unnecessary overhead.",
    items: [
      { name: "Software maintenance/patching", points: 7, risk: "Critical" },
      { name: "Software license management", points: 5, risk: "Standard" },
      { name: "IT helpdesk", points: 7, risk: "Critical" },
      { name: "Data backup", points: 6, risk: "Controlled" },
      { name: "Basic cyber hygiene monitoring", points: 7, risk: "Controlled" },
      { name: "Website/hosting upkeep", points: 6, risk: "Controlled" },
      {
        name: "Connecting software tools together",
        points: 10,
        risk: "Controlled",
      },
    ],
  },
  {
    name: "Procurement & Vendor",
    benefit:
      "Bring structure and visibility to purchasing and supplier performance.",
    items: [
      { name: "Supplier sourcing/shortlisting", points: 7, risk: "Standard" },
      { name: "Purchase orders", points: 5, risk: "Controlled" },
      { name: "Reorder/inventory management", points: 7, risk: "Controlled" },
      { name: "Vendor performance tracking", points: 6, risk: "Standard" },
    ],
  },
  {
    name: "Legal & Compliance",
    benefit:
      "Track recurring obligations and keep evidence organized for responsible review.",
    items: [
      {
        name: "License/permit renewal tracking & filing",
        points: 7,
        risk: "Critical",
      },
      { name: "Regulatory compliance tracking", points: 8, risk: "Controlled" },
      { name: "Insurance management", points: 6, risk: "Controlled" },
      { name: "Corporate record-keeping", points: 6, risk: "Controlled" },
      {
        name: "Privacy/data compliance tracking",
        points: 8,
        risk: "Controlled",
      },
    ],
  },
  {
    name: "Leadership & Strategy",
    benefit:
      "Give leadership a connected view of performance, opportunity and risk.",
    items: [
      { name: "KPI/performance dashboards", points: 7, risk: "Standard" },
      { name: "Investor/board reporting", points: 7, risk: "Controlled" },
      { name: "Company-wide analytics", points: 9, risk: "Standard" },
      { name: "Risk monitoring/flagging", points: 7, risk: "Standard" },
    ],
  },
];
// Note: the `tiers` array (STARTER/100/200/400 range+investment text) that
// used to live here was removed — it was only ever consumed by the
// <section className="orone-tiers"> below, which this 2026-09-08 handoff
// replaces with <RevisedPricing/> (its own pricing data, approved fee
// table). `tierFor` below is unrelated and still used live by the builder
// (the "preliminary system" tier name shown as items are selected), so it
// stays.
const tierFor = (points: number, categoryCount: number) =>
  points === 0
    ? "Not estimated"
    : points <= 30 && categoryCount === 1
      ? "OR/ONE STARTER"
      : points <= 100
        ? "OR/ONE 100"
        : points <= 200
          ? "OR/ONE 200"
          : "OR/ONE 400";

function OrOneClient() {
  const pathname = usePathname();
  const [active, setActive] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [trayOpen, setTrayOpen] = useState(false);
  const scope = useScope();
  const points = useMemo(
    () =>
      groups
        .flatMap((g) => g.items)
        .reduce((t, i) => t + (selected.has(i.name) ? i.points : 0), 0),
    [selected],
  );
  const toggle = (item: Item) =>
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(item.name)) n.delete(item.name);
      else if (points + item.points <= 400) n.add(item.name);
      return n;
    });
  const selectedCategoryCount = useMemo(
    () =>
      groups.filter((g) => g.items.some((i) => selected.has(i.name))).length,
    [selected],
  );
  const risks = useMemo(
    () =>
      groups
        .flatMap((g) => g.items)
        .filter((i) => selected.has(i.name))
        .reduce((a, i) => ({ ...a, [i.risk]: a[i.risk] + 1 }), {
          Standard: 0,
          Controlled: 0,
          Critical: 0,
        }),
    [selected],
  );
  const group = groups[active];
  useEffect(() => {
    scope.setItems((current) => {
      const without = current.filter((x) => x.id !== "orone:builder");
      if (!selected.size) return without;
      return [
        ...without,
        {
          id: "orone:builder",
          area: "OR ONE",
          code: "OR/ONE",
          title: `${tierFor(points, selectedCategoryCount)} preliminary system`,
          detail: `${selected.size} capabilities selected across ${selectedCategoryCount} categories.`,
          commercial: `${points} / 400 points · ${risks.Standard} standard · ${risks.Controlled} controlled · ${risks.Critical} critical`,
          // Server-side resolution (app/lib/scope-resolve.ts) reads
          // this, not `detail`'s count or `title`'s tier name, to
          // recover the actual selected capabilities — see
          // My_Scope_Final_Ready_For_Claude.md Section 2's explicit
          // finding: the old aggregate-count-only item lost the
          // client's real choices. Unmatched names (should not happen —
          // `selected` only ever holds names taken directly from
          // `groups` below — but defensively filtered rather than
          // trusted) are dropped here with a console warning rather
          // than silently sent as a bad code the server would reject.
          capabilityCodes: Array.from(selected)
            .map((name) => {
              const cap = OR_ONE_CAPABILITY_BY_NAME.get(name);
              if (!cap) {
                console.warn(`[OrOneClient] No registry entry for selected capability "${name}" — omitted from scope submission.`);
                return null;
              }
              return cap.code;
            })
            .filter((code): code is string => !!code),
        },
      ];
    });
  }, [
    points,
    selected,
    selectedCategoryCount,
    risks.Standard,
    risks.Controlled,
    risks.Critical,
  ]);
  return (
    <main className="orone-full">
      <header className="one-header">
        <Link className="one-wordmark" href="/">
          <span>ORAGROL</span>
          <small>GLOBAL</small>
        </Link>
        <OragrolMegaNav items={NAV_ITEMS} activePath={pathname} />
        <div className="one-actions">
          <button
            className="scope-nav-button"
            onClick={() => setTrayOpen(true)}
          >
            My Scope <b>{scope.items.length}</b>
          </button>
          <Link href="/cyber-health">Get Cyber Health Score</Link>
          <button className="one-search" aria-label="Search">
            <span />
          </button>
          <button>EN / FR</button>
        </div>
      </header>
      <section className="one-hero" aria-labelledby="one-title">
        <div className="one-grid" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </div>
        <div className="one-meta">
          <span>OR ONE / Coordinated business system</span>
          <span>Security · Automation · Intelligence</span>
        </div>
        <div className="one-headline">
          <p>One connected operating model</p>
          <h1 id="one-title">
            One secure system
            <br />
            for how your business
            <br />
            <span>operates.</span>
          </h1>
        </div>
        <div className="one-monument" aria-hidden="true">
          <span className="one-orange-or">OR</span>
          <strong>ONE</strong>
        </div>
        <div className="one-support">
          <p>
            OR ONE unifies cybersecurity, AI automation and operational
            intelligence into one secure system—built around how your business
            actually works.
          </p>
          <a href="#one-intro">
            Discover OR ONE <span>↘</span>
          </a>
        </div>
        <div className="one-bottom">
          <span>Protect what matters</span>
          <span>Automate what slows you down</span>
          <span>Understand what drives the business</span>
          <span>Operate as one system</span>
        </div>
      </section>
      <section className="orone-intro" id="one-intro">
        <div>
          <p>A separate product line</p>
          <h2>
            Your business,
            <br />
            <span>intelligently operated.</span>
          </h2>
        </div>
        <div>
          <p>
            OR ONE is a dedicated AI workforce engineered for one organization.
            It connects to the tools your business already uses and operates
            through clearly authorized access.
          </p>
          <p>
            It is completely separate from ORAGROL&apos;s 67 standard
            services—with its own engineering model, responsibility structure
            and commercial terms.
          </p>
          <blockquote>Engineered by ORAGROL Global.</blockquote>
        </div>
      </section>
      <RevisedProcess />
      <section className="team-builder" id="team-builder">
        <div className="builder-heading">
          <p>Interactive builder / 77 items</p>
          <h2>
            Build your team.
            <br />
            <span>See the shape of the system.</span>
          </h2>
          <p>
            Select capabilities to create a preliminary scope. The estimate
            shows Points and a likely tier—not a final price or proposal.
            Selections stop at 400 points.
          </p>
        </div>
        <div className="builder-shell">
          <aside>
            {groups.map((g, i) => (
              <button
                className={active === i ? "active" : ""}
                onClick={() => setActive(i)}
                key={g.name}
              >
                <span>{String(i + 1).padStart(2, "0")}</span>
                <b>{g.name}</b>
                <small>
                  {g.items.filter((x) => selected.has(x.name)).length}/
                  {g.items.length}
                </small>
              </button>
            ))}
          </aside>
          <div className="builder-items">
            <div className="builder-group">
              <span>Category {String(active + 1).padStart(2, "0")}</span>
              <h3>{group.name}</h3>
              <p>{group.benefit}</p>
            </div>
            {group.items.map((item) => {
              const blocked =
                !selected.has(item.name) && points + item.points > 400;
              return (
                <button
                  disabled={blocked}
                  className={`${selected.has(item.name) ? "chosen" : ""} ${blocked ? "blocked" : ""}`}
                  onClick={() => toggle(item)}
                  key={item.name}
                >
                  <i>{selected.has(item.name) ? "✓" : blocked ? "×" : "+"}</i>
                  <div>
                    <b>{item.name}</b>
                    <small>
                      {blocked ? "400-point limit reached" : item.risk}
                    </small>
                  </div>
                  <strong>{item.points} pts</strong>
                </button>
              );
            })}
          </div>
          <div className="builder-total">
            <span>Preliminary scope</span>
            <strong>
              {points}
              <i>/400</i>
            </strong>
            <small>Points selected</small>
            <div>
              <p>
                {selected.size}
                <span> items</span>
              </p>
              <p>
                {tierFor(points, selectedCategoryCount)}
                <span> estimated tier</span>
              </p>
            </div>
            <ul>
              <li>
                Standard <b>{risks.Standard}</b>
              </li>
              <li>
                Controlled <b>{risks.Controlled}</b>
              </li>
              <li>
                Critical <b>{risks.Critical}</b>
              </li>
            </ul>
            <button onClick={() => setTrayOpen(true)}>
              Review in My Scope ↗
            </button>
            <button onClick={() => setSelected(new Set())}>
              Clear selection
            </button>
          </div>
        </div>
      </section>
      <RevisedPricing />
      <RevisedResponsibility />
      <RevisedManagement />
      <PreFooterCta page="or-one" />
      <SiteFooter/>
      <ScopeTray
        items={scope.items}
        remove={scope.remove}
        clear={scope.clear}
        open={trayOpen}
        setOpen={setTrayOpen}
        activeArea="OR ONE"
      />
    </main>
  );
}

export default OrOneClient;
