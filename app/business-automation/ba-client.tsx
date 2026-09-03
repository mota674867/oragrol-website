"use client";
import Link from "next/link";
import { useState } from "react";
import { ScopeTray, useScope } from "../components/ScopeTray";
import "../gpt-pages.css";

type Job = {
  id: string;
  index: string;
  name: string;
  short: string;
  outcome: string;
  fit: string;
  build: string;
  monthly: string;
  tools: string;
  accent: string;
};
const jobs: Job[] = [
  {
    id: "sales-flow",
    index: "01",
    name: "Lead-to-Close Automation",
    short: "Lead to close",
    outcome:
      "Capture, qualify and follow every opportunity—from first enquiry to a clean handoff and close.",
    fit: "Teams losing leads between inboxes, spreadsheets and CRM follow-up.",
    build: "$9,500",
    monthly: "$2,200/mo",
    tools: "Your CRM, email, calendar and proposal tools.",
    accent: "Revenue flow",
  },
  {
    id: "customer-support",
    index: "02",
    name: "Always-On Customer Support",
    short: "Always on",
    outcome:
      "Respond faster, route requests correctly and keep every customer conversation moving.",
    fit: "Teams handling repeat questions, slow routing or inconsistent support across channels.",
    build: "$7,000",
    monthly: "$2,800/mo",
    tools: "Your helpdesk, shared inbox, knowledge base and messaging tools.",
    accent: "Service continuity",
  },
  {
    id: "operational-intelligence",
    index: "03",
    name: "Know Your Numbers",
    short: "Know your numbers",
    outcome:
      "Bring scattered business data into one dependable view for reporting, alerts and decisions.",
    fit: "Leaders waiting on manual reports or making decisions from disconnected systems.",
    build: "$7,500",
    monthly: "$3,500/mo",
    tools: "Your accounting, CRM, operations and reporting tools.",
    accent: "Decision clarity",
  },
  {
    id: "managed-it",
    index: "04",
    name: "Outsourced IT Operations",
    short: "Operate reliably",
    outcome:
      "Add an AI-driven IT operations and monitoring layer for routine device, account, ticket and infrastructure work.",
    fit: "Growing businesses that need operational coordination and monitoring, not a full break-fix helpdesk MSP.",
    build: "$4,000",
    monthly: "$700/mo base + $110/user/mo",
    tools: "Your Microsoft 365, ticketing, device and infrastructure tools.",
    accent: "AI-driven operations · not full managed IT",
  },
  {
    id: "customer-growth",
    index: "05",
    name: "Grow & Retain",
    short: "Grow and retain",
    outcome:
      "Strengthen onboarding, retention, reactivation and revenue opportunities across the customer lifecycle.",
    fit: "Businesses with valuable customers but inconsistent follow-up after the first sale.",
    build: "$7,000",
    monthly: "$4,500/mo",
    tools: "Your CRM, billing, email and customer-success tools.",
    accent: "Customer value",
  },
  {
    id: "tailored",
    index: "06",
    name: "Tailored Automation",
    short: "One bounded outcome",
    outcome:
      "Design one focused automation around an operational job that does not fit the five defined systems.",
    fit: "Businesses with a clear, measurable requirement that needs private scoping.",
    build: "Privately scoped",
    monthly: "Confirmed after scoping",
    tools: "Designed around the approved tools your business already uses.",
    accent: "Purpose-built",
  },
];
const navItems = [
  "Services",
  "Business Automation",
  "OR ONE",
  "Industries",
  "Resources",
  "Company",
];
function BusinessAutomationClient() {
  const [active, setActive] = useState(0);
  const [trayOpen, setTrayOpen] = useState(false);
  const scope = useScope();
  const job = jobs[active];
  const scopeItem = (j: Job) => ({
    id: `automation:${j.id}`,
    area: "Automation" as const,
    code: j.index,
    title: j.name,
    detail: j.outcome,
    commercial: `Build Fee ${j.build} / Monthly Management ${j.monthly}`,
  });
  const toggleScope = (j: Job) => {
    scope.toggle(scopeItem(j));
    setTrayOpen(true);
  };
  return (
    <main className="ba-full-page ba-jobs-page">
      <header className="ba-header">
        <Link className="wordmark" href="/">
          <span>ORAGROL</span>
          <small>GLOBAL</small>
        </Link>
        <nav className="ba-nav">
          {navItems.map((n, i) => (
            <Link
              className={i === 1 ? "active" : ""}
              href={
                n === "Services"
                  ? "/services"
                  : n === "Business Automation"
                    ? "/business-automation"
                    : n === "OR ONE"
                      ? "/or-one"
                      : n === "Industries"
                        ? "/industries"
                        : n === "Resources"
                          ? "/resources"
                          : "/company"
              }
              key={n}
            >
              {n}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <button
            className="scope-nav-button"
            onClick={() => setTrayOpen(true)}
          >
            My Scope <b>{scope.items.length}</b>
          </button>
          <button className="search" aria-label="Search">
            <span />
          </button>
          <button className="language">EN / FR</button>
        </div>
      </header>
      <section className="ba-hero" aria-labelledby="ba-title">
        <div className="ba-mark" aria-hidden="true">
          <span className="ba-or">OR</span>
          <span className="ba-five">5</span>
          <small>Five defined automation jobs</small>
        </div>
        <div className="ba-content">
          <div className="ba-meta">
            <span>Business Automation</span>
            <span>Built around measurable outcomes</span>
          </div>
          <div className="ba-statement">
            <h1 id="ba-title">
              Automate the work<span>that&apos;s capping your growth.</span>
            </h1>
            <div className="ba-support">
              <p>
                Five outcome-built automation systems, connected to the tools
                your business already uses.
              </p>
              <a href="#job-selector">
                Explore the five jobs <span>↘</span>
              </a>
            </div>
          </div>
          <div className="ba-footer">
            <div>
              {jobs.slice(0, 5).map((j) => (
                <b key={j.id}>
                  <i>{j.index}</i>
                  {j.short}
                </b>
              ))}
            </div>
            <span>No new platform required</span>
          </div>
        </div>
      </section>
      <section className="job-selector" id="job-selector">
        <div className="job-selector-head">
          <p>OR5 / Choose the outcome</p>
          <h2>
            Five jobs.
            <br />
            <span>One clear result each.</span>
          </h2>
          <p>
            Select a job to understand the outcome, fit and commercial
            structure. Add any relevant job to My Scope.
          </p>
        </div>
        <div className="job-stage">
          <nav>
            {jobs.map((j, i) => (
              <button
                className={active === i ? "active" : ""}
                onClick={() => setActive(i)}
                key={j.id}
              >
                <span>{j.index}</span>
                <b>{j.name}</b>
                <small>{j.short}</small>
              </button>
            ))}
          </nav>
          <article className={job.id === "tailored" ? "tailored-job" : ""}>
            <div className="job-kicker">
              <span>
                {job.index} / {job.accent}
              </span>
              <small>
                {job.id === "tailored"
                  ? "Privately scoped"
                  : "Defined automation job"}
              </small>
            </div>
            <h3>{job.name}</h3>
            <p className="job-outcome">{job.outcome}</p>
            <div className="job-facts">
              <div>
                <span>Ideal fit</span>
                <p>{job.fit}</p>
              </div>
              <div>
                <span>Works through</span>
                <p>{job.tools}</p>
              </div>
            </div>
            <div className="job-commercial">
              <div>
                <span>Build Fee</span>
                <strong>{job.build}</strong>
                <small>One-time design, configuration and connection.</small>
              </div>
              <div>
                <span>Monthly Management</span>
                <strong>{job.monthly}</strong>
                <small>Monitoring, maintenance and ongoing improvement.</small>
              </div>
            </div>
            <button
              className={
                scope.has(`automation:${job.id}`)
                  ? "scope-add added"
                  : "scope-add"
              }
              onClick={() => toggleScope(job)}
            >
              {scope.has(`automation:${job.id}`)
                ? "Added to My Scope ✓"
                : "Check My Fit · Add to Scope"}
              <span>↗</span>
            </button>
          </article>
        </div>
        <p className="commercial-note">
          Prices are shown in Canadian dollars. API usage, software subscriptions
          and third-party infrastructure remain the client&apos;s responsibility and
          are not included.
        </p>
      </section>
      <section className="existing-tools">
        <div>
          <p>Built around your reality</p>
          <h2>
            Your tools stay.
            <br />
            <span>The work moves.</span>
          </h2>
        </div>
        <div>
          <p>
            ORAGROL&apos;s automation engine works through the systems your
            business already uses. Your team continues working in its CRM,
            inbox, helpdesk, accounting and collaboration tools—without being
            forced onto a new platform.
          </p>
          <div className="tool-line">
            <span>CRM</span>
            <i>→</i>
            <span>Inbox</span>
            <i>→</i>
            <span>Operations</span>
            <i>→</i>
            <span>Reporting</span>
          </div>
        </div>
      </section>
      <section className="ba-job-journey">
        <p>How it starts</p>
        <div>
          {[
            [
              "01",
              "Assess",
              "Confirm the job, expected outcome and current tools.",
            ],
            [
              "02",
              "Design",
              "Map the workflow, controls and measures of success.",
            ],
            ["03", "Build", "Connect and configure the approved automation."],
            ["04", "Operate", "Monitor, maintain and improve the live job."],
          ].map((x, i) => (
            <article key={x[0]}>
              <span>{x[0]}</span>
              <div>
                <h3>{x[1]}</h3>
                <p>{x[2]}</p>
              </div>
              {i < 3 && <i>→</i>}
            </article>
          ))}
        </div>
      </section>
      <section className="fee-explainer">
        <div>
          <p>Two fees. Two responsibilities.</p>
          <h2>
            Built once.
            <br />
            <span>Looked after continuously.</span>
          </h2>
        </div>
        <div className="fee-pair">
          <article>
            <span>01 / Build Fee</span>
            <h3>Connect it to how you work.</h3>
            <p>
              The one-time fee covers design, configuration, integration,
              testing and launch within the agreed scope.
            </p>
          </article>
          <article>
            <span>02 / Monthly Management</span>
            <h3>Keep it dependable.</h3>
            <p>
              The recurring fee covers monitoring, maintenance and responsible
              improvement as your operating environment changes.
            </p>
          </article>
        </div>
      </section>
      <section className="ba-final-cta" id="ba-cta">
        <p>Your clearest next step</p>
        <h2>
          Choose the work.
          <br />
          <span>We&apos;ll shape the right scope.</span>
        </h2>
        <button onClick={() => setTrayOpen(true)}>
          Open My Scope <span>↗</span>
        </button>
        <p>
          {scope.items.length
            ? `${scope.items.length} selection${scope.items.length === 1 ? "" : "s"} ready to review.`
            : "Start by selecting the job that best matches your need."}
        </p>
      </section>
      <footer className="inner-footer">
        <div className="footer-top">
          <h2>
            Cybersecurity protection.
            <br />
            Intelligent business automation.
            <br />
            One coordinated partner.
          </h2>
          <div>
            <span>EXPLORE</span>
            <Link href="/services">Services</Link>
            <Link href="/business-automation">Business Automation</Link>
            <Link href="/or-one">OR ONE</Link>
            <Link href="/industries">Industries</Link>
          </div>
          <div>
            <span>COMPANY</span>
            <Link href="/company">Company</Link>
            <Link href="/resources">Resources</Link>
            <Link href="/faq">FAQ</Link>
            <Link href="/contact">Contact</Link>
          </div>
          <div>
            <span>LEGAL</span>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Use</a>
            <a href="#">Accessibility</a>
          </div>
        </div>
        <div className="social">
          <a aria-label="LinkedIn" href="https://www.linkedin.com/company/oragrol-global/">in</a>
          <a aria-label="Instagram" href="https://www.instagram.com/oragrolglobal">◎</a>
        </div>
        <div className="footer-lockup">
          <div className="footer-word">ORAGROL</div>
          <span>GLOBAL</span>
        </div>
        <div className="footer-base">
          <span>© 2026 ORAGROL GLOBAL</span>
          <span>Thunder Bay · Ontario · Canada</span>
          <span>EN / FR</span>
        </div>
      </footer>
      <ScopeTray
        items={scope.items}
        remove={scope.remove}
        open={trayOpen}
        setOpen={setTrayOpen}
        activeArea="Automation"
      />
    </main>
  );
}

export default BusinessAutomationClient;
