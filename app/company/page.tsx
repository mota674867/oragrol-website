import type { Metadata } from "next";
import Link from "next/link";
import "../gpt-pages.css";

export const metadata: Metadata = {
  title: "Company | Orchestrated AI Governance, Risk, Operations and Learning",
  description:
    "ORAGROL Global connects cybersecurity, intelligent automation and operational thinking around how a business actually works. Founder-led, built from real operating experience, headquartered in Thunder Bay, Ontario.",
  alternates: {
    canonical: "/company",
  },
  openGraph: {
    title: "Company | ORAGROL Global",
    description:
      "Built to connect what business can no longer manage separately — cybersecurity, automation and operational thinking, founder-led from Ontario, Canada.",
    url: "/company",
    siteName: "ORAGROL Global",
    locale: "en_CA",
    type: "website",
  },
};

const nav = [
  "Services",
  "Business Automation",
  "OR ONE",
  "Industries",
  "Resources",
  "Company",
];

export default function CompanyPage() {
  return (
    <main className="company-page">
      <header className="industry-header company-header">
        <Link className="wordmark" href="/">
          <span>ORAGROL</span>
          <small>GLOBAL</small>
        </Link>
        <nav>
          {nav.map((n) => (
            <Link
              className={n === "Company" ? "active" : ""}
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
                          : n === "Company"
                            ? "/company"
                            : "#"
              }
              key={n}
            >
              {n}
            </Link>
          ))}
        </nav>
        <div>
          <a href="#company-story">Our story</a>
          <button className="search" aria-label="Search">
            <span />
          </button>
          <button className="language">EN / FR</button>
        </div>
      </header>

      <section className="company-hero">
        <div className="company-hero-copy">
          <p>Company / ORAGROL Global</p>
          <h1>
            Built to connect what business can no longer manage separately.
          </h1>
          <p>
            ORAGROL Global connects cybersecurity, intelligent automation and
            operational thinking around how a business actually works.
          </p>
          <a href="#company-story">
            Discover our story <span>↓</span>
          </a>
        </div>
        <div className="company-hero-mark" aria-hidden="true">
          <i />
          <i />
          <i />
          <span>OR</span>
        </div>
        <p className="company-name-line">
          Orchestrated AI Governance, Risk, Operations and Learning.
        </p>
      </section>

      <section className="company-story" id="company-story">
        <article className="company-why">
          <span>01 / Why ORAGROL exists</span>
          <h2>Technology should create confidence, not more complexity.</h2>
          <p>
            Growing businesses are expected to protect more information, operate
            across more systems and make faster decisions, often without the
            internal specialist structure available to larger organizations.
          </p>
          <p>
            ORAGROL begins with the reality of the business. We identify what
            must be protected, what work can be improved and where separate
            systems need to operate together.
          </p>
        </article>
        <article className="company-meaning">
          <span>02 / The name</span>
          <h3>ORAGROL</h3>
          <p>
            <strong>
              Orchestrated AI Governance, Risk, Operations and Learning.
            </strong>
          </p>
          <p>
            A name created to describe a coordinated way of protecting,
            operating and continuously improving a modern business.
          </p>
          <div className="company-terms">
            <span>Orchestrated</span>
            <span>AI</span>
            <span>Governance</span>
            <span>Risk</span>
            <span>Operations</span>
            <span>Learning</span>
          </div>
        </article>
        <article className="company-orange">
          <span>03 / Why orange</span>
          <h3>The colour of translation, understanding and action.</h3>
          <p>
            Inspired by the cybersecurity Orange Team, orange represents the
            bridge between security insight and secure development. It reflects
            how ORAGROL turns discovered risk into knowledge, practical
            improvement and stronger decisions.
          </p>
          <p>
            It is used with control as a signal that something important is
            becoming clear or ready for action.
          </p>
        </article>
      </section>

      <section className="company-paths">
        <div>
          <span>01</span>
          <h3>Protect</h3>
          <p>
            Understand exposure, strengthen essential controls and respond with
            confidence.
          </p>
          <Link href="/">Cybersecurity Services ↗</Link>
        </div>
        <div>
          <span>02</span>
          <h3>Automate</h3>
          <p>
            Improve defined jobs where coordination and execution can create
            measurable value.
          </p>
          <Link href="/business-automation">Business Automation ↗</Link>
        </div>
        <div>
          <span>03</span>
          <h3>Unify</h3>
          <p>
            Connect departments, systems and decisions within one secure
            operating environment.
          </p>
          <Link href="/or-one">OR ONE ↗</Link>
        </div>
      </section>

      <section className="company-founder">
        <div className="founder-portrait">
          <div>
            <span>MCT</span>
            <small>
              Founder portrait
              <br />
              Final image pending
            </small>
          </div>
        </div>
        <article>
          <span>04 / Founder</span>
          <h2>Built from operating experience.</h2>
          <h3>
            Mohammad Chelouy Tabrizi <small>Founder and CEO</small>
          </h3>
          <p>
            Mohammad built his first cybersecurity company in Iran in 2012.
            Running a real security business and solving practical client
            problems shaped the business first philosophy behind ORAGROL Global.
          </p>
          <p>
            Across more than fifteen years, his work has extended through
            cybersecurity, regional market development, partnerships and
            international operations. His academic background includes software
            engineering, an MBA and a PhD in Management.
          </p>
          <p>
            He founded ORAGROL Global in Ontario in 2025 to give Canadian
            businesses practical cybersecurity and intelligent operating
            capability without forcing them to assemble the solution from
            disconnected providers.
          </p>
          <blockquote>
            “Technology should make a business clearer, stronger and more
            capable. If it only adds complexity, it has not solved the right
            problem.”
          </blockquote>
        </article>
      </section>

      <section className="company-operating">
        <article>
          <span>05 / How we operate</span>
          <h2>
            Founder led. Specialist supported. Built to scale responsibly.
          </h2>
          <p>
            Strategy, client understanding and consequential delivery decisions
            remain close to the founder. Specialist capabilities and delivery
            partners are used where they create real value, with defined human
            authority for important decisions.
          </p>
          <div className="operating-points">
            <span>Clear outcome</span>
            <span>Named responsibility</span>
            <span>Human approval</span>
            <span>Reviewable evidence</span>
          </div>
        </article>
        <aside>
          <span>06 / Canadian foundation</span>
          <h3>Ontario, Canada</h3>
          <div>
            <p>Headquarters and Registered Office</p>
            <strong>Thunder Bay, Ontario</strong>
          </div>
          <div>
            <p>Toronto Office</p>
            <strong>Toronto, Ontario</strong>
          </div>
          <p>
            Canada is the foundation. North America is the direction. The
            standard remains practical thinking, responsible technology and
            systems built around the businesses they serve.
          </p>
        </aside>
      </section>

      <section className="company-cta">
        <div>
          <span>One clear starting point</span>
          <h2>
            Know where you stand.
            <br />
            Know what to do next.
          </h2>
        </div>
        <a href="#">
          Get Your Cyber Health Score <b>↗</b>
        </a>
      </section>

      <footer className="industry-footer company-footer">
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
