"use client";
import Link from "next/link";

import { KeyboardEvent, useState } from "react";
import { industryDetails } from "./industry-details";
import "../gpt-pages.css";

type Industry = {
  name: string;
  focus: string;
  overview: string;
  risks: string[];
  priorities: string[];
  categories: string;
  jobs: [{ name: string; why: string }, { name: string; why: string }];
  unify: string;
  path: string;
  cta: string;
  href: string;
  secondary?: string;
};

const industries: Industry[] = [
  {
    name: "Professional Services",
    focus: "Accounting & bookkeeping firms",
    overview:
      "Accounting and bookkeeping firms sit at the centre of their clients’ financial lives—tax filings, payroll records, banking details and, often, authority to move client money. That concentration of sensitive data and payment authority makes firms a high-value target, independent of size.",
    risks: [
      "Business email compromise and fraudulent banking-detail changes",
      "Account takeover across email and cloud-accounting platforms",
      "Unmanaged remote devices and unreviewed third-party access",
      "Backup and recovery gaps affecting client financial records",
      "Weak SPF, DKIM or DMARC enforcement",
    ],
    priorities: [
      "MFA on every email and cloud-accounting account",
      "Independent verification for payment-detail changes",
      "DMARC moved from monitoring to full enforcement",
      "Regular staff and vendor access reviews",
      "Tested backups and documented security awareness",
    ],
    categories:
      "Cyber Risk & Governance · Endpoint, Email & Human Security · Identity & Access Security · Data Security & Privacy · Vulnerability & Exposure Management",
    jobs: [
      {
        name: "Sales Flow Automation",
        why: "Keep every referral, enquiry, proposal and engagement-letter follow-up moving—even through busy season.",
      },
      {
        name: "Operational Intelligence",
        why: "Turn scattered firm data into a current view of capacity, realization and client profitability.",
      },
    ],
    unify:
      "When new-client intake, engagement and billing, staff capacity and client communication must move as one coordinated system—not as separate automations—that is OR ONE territory.",
    path: "Start with protection",
    cta: "See how ORAGROL protects accounting firms",
    href: "/",
    secondary: "Ready to automate a defined job? Explore Business Automation.",
  },
  {
    name: "Healthcare",
    focus: "Clinics & healthcare SMBs",
    overview:
      "Clinics work across scheduling, EMR, billing and communication systems maintained by several vendors, while staff turnover creates recurring access-control work around highly sensitive patient information.",
    risks: [
      "Phishing aimed at front-desk and billing teams",
      "Weak separation between clinical and administrative access",
      "Unmanaged devices touching patient information",
    ],
    priorities: [
      "MFA across clinical and billing systems",
      "Access reviews during every staff change",
      "Managed protection for every connected endpoint",
    ],
    categories:
      "Endpoint, Email & Human Security · Identity & Access Security · Data Security & Privacy",
    jobs: [
      {
        name: "Customer Support Automation",
        why: "Improve high-volume scheduling, intake and follow-up communication.",
      },
      {
        name: "Managed IT Operations",
        why: "Keep scheduling and records systems dependable without building a full internal IT team.",
      },
    ],
    unify:
      "When patient intake, billing, staff scheduling and communication must coordinate across providers or locations, the need has moved into OR ONE territory.",
    path: "Start with protection",
    cta: "See how ORAGROL protects healthcare practices",
    href: "/",
  },
  {
    name: "Financial Services",
    focus: "Advisors, brokers & lenders",
    overview:
      "Financial firms handle regulated data, high-value transactions and third-party platforms while maintaining evidence and audit trails as part of everyday operations.",
    risks: [
      "Credential-based account takeover",
      "Regulated financial-data exposure",
      "Custodian, lender and CRM vendor risk",
    ],
    priorities: [
      "Strict identity and privileged-access controls",
      "Continuous compliance evidence",
      "Ongoing vendor-risk monitoring",
    ],
    categories:
      "Cyber Risk & Governance · Identity & Access Security · Vulnerability & Exposure Management · Data Security & Privacy",
    jobs: [
      {
        name: "Operational Intelligence",
        why: "Create dependable visibility across reporting, portfolio and pipeline data.",
      },
      {
        name: "Managed IT Operations",
        why: "Maintain monitored, dependable infrastructure around critical workflows.",
      },
    ],
    unify:
      "When compliance reporting, client communication and advisor operations need one coordinated, auditable system, that becomes OR ONE territory.",
    path: "Start with protection",
    cta: "See how ORAGROL protects financial firms",
    href: "/",
  },
  {
    name: "Retail & E-commerce",
    focus: "Commerce across channels",
    overview:
      "Retail and e-commerce operators manage payment data, seasonal demand and an always-on customer journey across marketing, checkout, fulfilment and support.",
    risks: [
      "Payment and checkout compromise",
      "Web and API exposure",
      "Customer-data loss or misuse",
    ],
    priorities: [
      "Application and API security",
      "PCI-relevant security hygiene",
      "Continuous visibility into public systems",
    ],
    categories:
      "Application, API & Web Security · Data Security & Privacy · Threat Detection & Response",
    jobs: [
      {
        name: "Customer Growth Automation",
        why: "Strengthen repeat purchases, retention and reactivation at scale.",
      },
      {
        name: "Sales Flow Automation",
        why: "Keep leads and abandonment follow-up moving without manual effort.",
      },
    ],
    unify:
      "When marketing, sales, fulfilment and customer support must operate as one connected system across channels, that is OR ONE territory.",
    path: "Start with a focused automation",
    cta: "Explore automation for retail growth",
    href: "/business-automation",
  },
  {
    name: "Manufacturing",
    focus: "Production & supply continuity",
    overview:
      "Manufacturers combine office IT, production-adjacent systems, legacy equipment and supplier access—where an ordinary technology incident can become measurable production downtime.",
    risks: [
      "Supplier and vendor access exposure",
      "Aging or unmanaged endpoints",
      "Weak separation between office and production systems",
    ],
    priorities: [
      "Vendor access review",
      "Complete endpoint coverage",
      "Network segmentation around critical operations",
    ],
    categories:
      "Vulnerability & Exposure Management · Cloud & Infrastructure Security · Endpoint, Email & Human Security",
    jobs: [
      {
        name: "Managed IT Operations",
        why: "Tie infrastructure reliability directly to production continuity.",
      },
      {
        name: "Operational Intelligence",
        why: "Replace delayed inventory, supplier and production reporting with a current view.",
      },
    ],
    unify:
      "When supply-chain, inventory and operating data need one coordinated planning-and-execution system, the requirement becomes OR ONE.",
    path: "Start with protection",
    cta: "See how ORAGROL protects manufacturers",
    href: "/",
  },
  {
    name: "Technology",
    focus: "Growth-stage companies",
    overview:
      "Technology companies often scale revenue and headcount faster than internal process, accumulating SaaS tools, integrations and inconsistent access governance along the way.",
    risks: [
      "SaaS sprawl and weak offboarding",
      "API and integration exposure",
      "Uncontrolled use of AI tools",
    ],
    priorities: [
      "Identity governance across the stack",
      "Application and API security",
      "Practical AI governance",
    ],
    categories:
      "Identity & Access Security · Application, API & Web Security · AI Security & Governance",
    jobs: [
      {
        name: "Sales Flow Automation",
        why: "Scale pipeline execution without scaling administration at the same rate.",
      },
      {
        name: "Operational Intelligence",
        why: "Connect product, customer and revenue information into current decisions.",
      },
    ],
    unify:
      "When sales, product data and customer operations require one system rather than a growing collection of tools, that is OR ONE territory.",
    path: "Start with a focused automation",
    cta: "Explore automation for technology growth",
    href: "/business-automation",
  },
  {
    name: "Construction & Real Estate",
    focus: "Distributed teams & projects",
    overview:
      "Construction and real-estate businesses coordinate office, field and site teams through email, mobile devices and a mix of project, transaction and client-management systems.",
    risks: [
      "Field and mobile-device exposure",
      "Invoice and payment-change fraud",
      "Inconsistent access across sites and teams",
    ],
    priorities: [
      "Managed mobile devices",
      "Independent payment verification",
      "Enforced email authentication",
    ],
    categories:
      "Endpoint, Email & Human Security · Cyber Risk & Governance · Identity & Access Security",
    jobs: [
      {
        name: "Managed IT Operations",
        why: "Support a distributed workforce and its devices reliably.",
      },
      {
        name: "Customer Growth Automation",
        why: "Maintain disciplined follow-up across long buyer, tenant and client cycles.",
      },
    ],
    unify:
      "When project management, client communication and back-office finance need to coordinate across multiple sites or listings, that is OR ONE territory.",
    path: "Start with protection",
    cta: "See how ORAGROL protects distributed teams",
    href: "/",
  },
  {
    name: "Education",
    focus: "Schools & education providers",
    overview:
      "Education providers hold student and family data across administrative and learning systems while handling a constant volume of communication with parents, students and staff.",
    risks: [
      "Phishing targeting administrative staff",
      "Student-data exposure",
      "Inconsistent access across learning and admin systems",
    ],
    priorities: [
      "Security awareness for staff",
      "Governed access across platforms",
      "Clear data-handling policy",
    ],
    categories:
      "Endpoint, Email & Human Security · Data Security & Privacy · Identity & Access Security",
    jobs: [
      {
        name: "Customer Support Automation",
        why: "Handle repeat parent and student enquiries more consistently.",
      },
      {
        name: "Managed IT Operations",
        why: "Support administrative and learning systems as one dependable environment.",
      },
    ],
    unify:
      "When admissions, communication and administration must coordinate across programs or campuses, the operating need becomes OR ONE.",
    path: "Start with protection",
    cta: "See how ORAGROL protects education providers",
    href: "/",
  },
  {
    name: "Other Canadian SMBs",
    focus: "A clear place to begin",
    overview:
      "Businesses that do not fit a named vertical still rely on the same essentials: email, cloud tools, a handful of vendors and operating work that is often more manual than it needs to be.",
    risks: [
      "Phishing and account takeover",
      "Incomplete MFA coverage",
      "Unmanaged vendor access",
    ],
    priorities: [
      "MFA across every critical account",
      "A documented risk baseline",
      "Basic vendor and access review",
    ],
    categories:
      "Cyber Risk & Governance · Endpoint, Email & Human Security · Identity & Access Security",
    jobs: [
      {
        name: "Sales Flow Automation",
        why: "Create a dependable path from enquiry to close.",
      },
      {
        name: "Customer Support Automation",
        why: "Respond, route and follow up consistently as demand grows.",
      },
    ],
    unify:
      "When sales, support and operations genuinely need to run as one coordinated system rather than separate functions, that is OR ONE territory.",
    path: "Start with clarity",
    cta: "Get Your Cyber Health Score",
    href: "#",
  },
];

const nav = [
  "Services",
  "Business Automation",
  "OR ONE",
  "Industries",
  "Resources",
  "Company",
];

const currentJobName: Record<string, string> = {
  "Sales Flow Automation": "Lead-to-Close Automation",
  "Customer Support Automation": "Always-On Customer Support",
  "Operational Intelligence": "Know Your Numbers",
  "Managed IT Operations": "Outsourced IT Operations",
  "Customer Growth Automation": "Grow & Retain",
};

function IndustriesClient() {
  const [active, setActive] = useState(0);
  const industry = industries[active];
  const detail = industryDetails[industry.name];
  const move = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft"].includes(e.key))
      return;
    e.preventDefault();
    const d = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : -1;
    setActive((active + d + industries.length) % industries.length);
  };
  return (
    <main className="ind-premium-page">
      <header className="industry-header">
        <Link className="wordmark" href="/">
          <span>ORAGROL</span>
          <small>GLOBAL</small>
        </Link>
        <nav>
          {nav.map((n, i) => (
            <Link
              className={i === 3 ? "active" : ""}
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
        <div>
          <a href="#industry-advisory">Find your path</a>
          <button className="search" aria-label="Search">
            <span />
          </button>
          <button className="language">EN / FR</button>
        </div>
      </header>

      <section className="ind-hero ind-hero-clean">
        <div className="ind-centred-or" aria-hidden="true">
          OR
        </div>
        <div className="ind-hero-copy">
          <p>Industries / Canada</p>
          <h1>
            Every industry operates differently.
            <br />
            <span>Its protection should too.</span>
          </h1>
          <p>
            Explore how ORAGROL aligns cybersecurity, intelligent automation and
            OR ONE with the risks, workflows and priorities of your industry.
          </p>
          <div className="ind-hero-pillars" aria-label="ORAGROL approach">
            <span>Protect</span>
            <span>Automate</span>
            <span>Unify</span>
          </div>
          <a href="#industry-index">
            Choose your industry <span>↓</span>
          </a>
        </div>
      </section>

      <section className="ind-navigator" id="industry-index">
        <div className="ind-ring-wrap">
          <p>01 / Select an industry</p>
          <div
            className="ind-ring"
            role="tablist"
            aria-label="Industries"
            onKeyDown={move}
          >
            {industries.map((item, i) => (
              <button
                id={`industry-tab-${i}`}
                role="tab"
                aria-selected={active === i}
                aria-controls="industry-journey"
                tabIndex={active === i ? 0 : -1}
                className={`ind-node ind-node-${i + 1} ${active === i ? "active" : ""}`}
                onClick={() => setActive(i)}
                aria-label={item.name}
                key={item.name}
              >
                <i />
                <span>{String(i + 1).padStart(2, "0")}</span>
              </button>
            ))}
            <div className="ind-ring-centre">
              <small>Selected industry</small>
              <h2>{industry.name}</h2>
            </div>
          </div>
          <div className="ind-ring-key">
            {industries.map((item, i) => (
              <button
                className={active === i ? "active" : ""}
                onClick={() => setActive(i)}
                key={item.name}
              >
                {String(i + 1).padStart(2, "0")} · {item.name}
              </button>
            ))}
          </div>
        </div>
        <article className="ind-editorial">
          <span>{industry.focus}</span>
          <h2>The operating reality.</h2>
          <p>{industry.overview}</p>
          <a href="#industry-journey">
            View the coordinated path <b>↓</b>
          </a>
        </article>
      </section>

      <section
        className="ind-journey"
        id="industry-journey"
        role="tabpanel"
        aria-labelledby={`industry-tab-${active}`}
        aria-live="polite"
        key={industry.name}
      >
        <div className="ind-journey-title">
          <span>02 / One coordinated path</span>
          <h2>{industry.name}</h2>
        </div>
        <svg
          className="ind-ribbon"
          viewBox="0 0 1600 760"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="journeyGradient" x1="0" x2="1">
              <stop offset="0" stopColor="#c94a1a" />
              <stop offset=".52" stopColor="#8b8d8f" />
              <stop offset="1" stopColor="#3e4146" />
            </linearGradient>
          </defs>
          <path
            className="ind-ribbon-shadow"
            d="M-40 570 C180 570 160 185 410 190 C650 195 610 620 845 615 C1080 610 1050 190 1290 185 C1450 182 1515 335 1640 335"
          />
          <path d="M-40 570 C180 570 160 185 410 190 C650 195 610 620 845 615 C1080 610 1050 190 1290 185 C1450 182 1515 335 1640 335" />
        </svg>
        <article className="ind-anchor ind-protect">
          <span>01 / Protect</span>
          <h3>Protect what matters.</h3>
          {industry.risks.slice(0, 3).map((x) => (
            <p key={x}>{x}</p>
          ))}
          <small>{industry.priorities.slice(0, 2).join(" · ")}</small>
        </article>
        <article className="ind-anchor ind-automate">
          <span>02 / Automate</span>
          <h3>Automate the right jobs.</h3>
          {industry.jobs.map((job) => (
            <div key={job.name}>
                  <h4>{currentJobName[job.name] ?? job.name}</h4>
              <p>{job.why}</p>
            </div>
          ))}
        </article>
        <article className="ind-anchor ind-unify">
          <span>03 / Unify</span>
          <h3>Know when it becomes OR ONE.</h3>
          <p>{industry.unify}</p>
        </article>
      </section>

      {active === 0 && (
        <details className="ind-evidence">
          <summary>
            <span>Flagship evidence / Accounting & bookkeeping</span>
            <b>Open evidence drawer</b>
          </summary>
          <div>
            <article>
              <strong>28.1%</strong>
              <p>
                of sampled Canadian domains in a 2026 vendor study enforced
                DMARC at <code>p=reject</code>.
              </p>
              <a href="https://powerdmarc.com/canada-dmarc-adoption/">
                PowerDMARC · 2026 ↗
              </a>
            </article>
            <article>
              <strong>$26B+</strong>
              <p>
                stolen globally through business email compromise, including
                Canadian businesses.
              </p>
              <a href="https://www.rcmp.ca/en/federal-policing/cybercrime/cyber-features/business-email-compromise">
                RCMP · Updated 2025 ↗
              </a>
            </article>
            <article>
              <strong>2 years</strong>
              <p>
                minimum record-retention period for breaches under federal
                PIPEDA guidance.
              </p>
              <a href="https://www.priv.gc.ca/en/privacy-topics/business-privacy/breaches-and-safeguards/privacy-breaches-at-your-business/gd_pb_201810/">
                OPC guidance ↗
              </a>
            </article>
          </div>
          <p>
            Controls support a stronger insurance-renewal conversation, but do
            not guarantee coverage, approval or lower premiums.
          </p>
        </details>
      )}

      <section className="ind-full-profile" aria-label={`${industry.name} details`}>
        <div className="ind-full-heading">
          <span>03 / Industry detail</span>
          <h2>What leaders need to know.</h2>
          <p>Open only the detail relevant to your decision.</p>
        </div>
        <div className="ind-accordions">
          <details name="industry-detail">
            <summary>Risk and Canadian context <span>+</span></summary>
            <p>{detail.context}</p>
          </details>
          <details name="industry-detail">
            <summary>Protect <span>+</span></summary>
            <ul>{detail.protect.map((item)=><li key={item}>{item}</li>)}</ul>
          </details>
          <details name="industry-detail">
            <summary>Automate <span>+</span></summary>
            <ul>{detail.automate.map((item)=><li key={item}>{item}</li>)}</ul>
          </details>
          <details name="industry-detail">
            <summary>Unify with OR ONE <span>+</span></summary>
            <p>{industry.unify}</p>
          </details>
          <details name="industry-detail">
            <summary>{detail.question} <span>+</span></summary>
            <p>{detail.answer}</p>
          </details>
        </div>
        <p className="ind-scope-note">Applicable laws, standards and contractual duties vary by province, activity, regulator and data handled. ORAGROL confirms scope before recommending controls or automation.</p>
      </section>

      <section className="ind-recommend">
        <div>
          <span>Recommended path / {industry.name}</span>
          <h2>{industry.path}</h2>
        </div>
        <Link href={industry.href}>
          {industry.cta}
          <span>↗</span>
        </Link>
      </section>

      <footer className="industry-footer">
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
            <Link href="/">Services</Link>
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
    </main>
  );
}

export default IndustriesClient;
