"use client";
import Link from "next/link";
import "../gpt-pages.css";

import { useState } from "react";
import { ScopeTray, useScope } from "../components/ScopeTray";

type Service = { code: string; name: string; line: string; price: string };
type Category = {
  short: string;
  title: string;
  description: string;
  services: Service[];
};

const categories: Category[] = [
  {
    short: "Risk",
    title: "Know & manage your risk",
    description:
      "A clear, prioritized view of what's actually putting your business at risk.",
    services: [
      {
        code: "C01-S01",
        name: "Risk Check",
        line: "Know where your real risk is, prioritized and clear.",
        price: "$4,500 one-time",
      },
      {
        code: "C01-S02",
        name: "Compliance Ready",
        line: "Know exactly what compliance requires, and how close you are.",
        price: "$5,000 + $500/mo",
      },
      {
        code: "C01-S03",
        name: "Policy Guard",
        line: "Security policies that are current, approved, and actually followed.",
        price: "$800/mo",
      },
      {
        code: "C01-S04",
        name: "Virtual CISO",
        line: "Strategic security leadership, without a full-time hire.",
        price: "$2,500-$4,500/mo",
      },
    ],
  },
  {
    short: "Exposure",
    title: "Find & fix weaknesses",
    description: "Exploitable gaps found and tracked to closure.",
    services: [
      {
        code: "C02-S01",
        name: "Vuln Watch",
        line: "Continuous scanning that finds and tracks weaknesses to closure.",
        price: "$15/user/mo",
      },
      {
        code: "C02-S02",
        name: "Vendor Watch",
        line: "Know which vendors put your business at risk.",
        price: "$400/mo",
      },
    ],
  },
  {
    short: "Threats",
    title: "Detect & stop threats",
    description: "Round-the-clock eyes on your environment.",
    services: [
      {
        code: "C03-S01",
        name: "AI Security Monitoring",
        line: "Round-the-clock visibility across your environment.",
        price: "$20/user/mo",
      },
      {
        code: "C03-S02",
        name: "Managed Threat Response",
        line: "Real threats, triaged and stopped before they spread.",
        price: "$25/user/mo",
      },
      {
        code: "C03-S03",
        name: "Threat Watch",
        line: "Intelligence on the threats actually targeting your industry.",
        price: "$8/user/mo",
      },
      {
        code: "C03-S04",
        name: "Security Response",
        line: "A coordinated response plan for when things go wrong.",
        price: "$600/mo",
      },
    ],
  },
  {
    short: "People",
    title: "Protect your people & devices",
    description: "The everyday surface every attacker tries first.",
    services: [
      {
        code: "C04-S01",
        name: "Device Guard",
        line: "Endpoint protection that's managed, not just installed.",
        price: "$12/user/mo",
      },
      {
        code: "C04-S02",
        name: "Mail Shield",
        line: "Email security that stops what filters miss.",
        price: "$6/user/mo",
      },
      {
        code: "C04-S03",
        name: "Staff Security",
        line: "Training that turns your team into a defense.",
        price: "$40/user/yr",
      },
    ],
  },
  {
    short: "Identity",
    title: "Control who gets in",
    description: "The right people, the right access.",
    services: [
      {
        code: "C05-S01",
        name: "Access Manager",
        line: "The right people, the right access, nothing more.",
        price: "$8/user/mo",
      },
      {
        code: "C05-S02",
        name: "Login Shield",
        line: "Multi-factor authentication, rolled out and managed.",
        price: "$4/user/mo",
      },
      {
        code: "C05-S03",
        name: "Admin Shield",
        line: "Privileged accounts, watched closely.",
        price: "$30/priv-user/mo",
      },
      {
        code: "C05-S04",
        name: "Access Governance",
        line: "Regular reviews so access never quietly drifts.",
        price: "$6/user/mo",
      },
      {
        code: "C05-S05",
        name: "Trust Guard",
        line: "Never trust, always verify.",
        price: "$10/user/mo",
      },
    ],
  },
  {
    short: "Cloud",
    title: "Secure your cloud & systems",
    description: "Misconfigurations, workloads and infrastructure covered.",
    services: [
      {
        code: "C06-S01",
        name: "Cloud Guard",
        line: "Cloud misconfigurations found before they're exploited.",
        price: "$400/mo",
      },
      {
        code: "C06-S02",
        name: "Workload Shield",
        line: "Protection for what actually runs in your cloud.",
        price: "$500/mo",
      },
      {
        code: "C06-S03",
        name: "Infra Guard",
        line: "Servers and infrastructure, hardened and watched.",
        price: "$450/mo",
      },
      {
        code: "C06-S04",
        name: "Network Shield",
        line: "Network segmentation that actually contains a breach.",
        price: "$350/mo",
      },
      {
        code: "C06-S05",
        name: "Cloud Compliance",
        line: "Your cloud environment, provably compliant.",
        price: "$300/mo",
      },
    ],
  },
  {
    short: "Apps",
    title: "Secure your apps & websites",
    description: "From how you build to what customers touch.",
    services: [
      {
        code: "C07-S01",
        name: "App Shield",
        line: "Application security woven into how you build.",
        price: "$300/app/mo",
      },
      {
        code: "C07-S02",
        name: "Web Shield",
        line: "Your public-facing web apps, monitored and protected.",
        price: "$250/app/mo",
      },
      {
        code: "C07-S03",
        name: "API Guard",
        line: "APIs are the new front door.",
        price: "$300/API/mo",
      },
      {
        code: "C07-S04",
        name: "Code Shield",
        line: "Secure development practices your team can follow.",
        price: "$600/mo",
      },
      {
        code: "C07-S05",
        name: "App Test",
        line: "Real testing that proves an app is safe.",
        price: "$3,500/app",
      },
    ],
  },
  {
    short: "Data",
    title: "Protect your data",
    description: "Know what you have, keep it from leaving.",
    services: [
      {
        code: "C08-S01",
        name: "Data Shield",
        line: "Data protection built around what your business holds.",
        price: "$10/user/mo",
      },
      {
        code: "C08-S02",
        name: "Data Guard",
        line: "Stop sensitive data from leaving when it shouldn't.",
        price: "$8/user/mo",
      },
      {
        code: "C08-S03",
        name: "Privacy Guard",
        line: "Privacy compliance without the guesswork.",
        price: "$700/mo",
      },
      {
        code: "C08-S04",
        name: "Data Classifier",
        line: "Know what data you have and how sensitive it is.",
        price: "$400/mo",
      },
      {
        code: "C08-S05",
        name: "Data Watch",
        line: "Ongoing eyes on how your data moves.",
        price: "$6/user/mo",
      },
    ],
  },
  {
    short: "AI",
    title: "Secure your AI systems",
    description: "The same discipline, now for your AI.",
    services: [
      {
        code: "C09-S01",
        name: "AI Check",
        line: "Find out if your AI systems are actually safe.",
        price: "$4,500 one-time",
      },
      {
        code: "C09-S02",
        name: "AI Governance",
        line: "Policy and oversight for how your business uses AI.",
        price: "$900/mo",
      },
      {
        code: "C09-S03",
        name: "Model Shield",
        line: "Protection for the AI models running in production.",
        price: "$350/model/mo",
      },
      {
        code: "C09-S04",
        name: "AI Data Guard",
        line: "Keep the data feeding your AI systems protected.",
        price: "$8/user/mo",
      },
      {
        code: "C09-S05",
        name: "AI Threat Guard",
        line: "Threats built specifically for AI, detected and stopped.",
        price: "$400/mo",
      },
    ],
  },
  {
    short: "Proof",
    title: "Get certified proof",
    description:
      "Human-led specialist engagements that test, attest and document what matters.",
    services: [
      {
        code: "C10-S01",
        name: "Real-World Test",
        line: "Authorized ethical hackers test your real exposure, safely.",
        price: "$7,500-$18,000 / engagement",
      },
      {
        code: "C10-S02",
        name: "Audit-Ready",
        line: "Build SOC 2 evidence and controls for licensed CPA attestation.",
        price: "$8,000-$15,000 readiness + $12,000-$20,000/yr",
      },
      {
        code: "C10-S03",
        name: "Payment-Ready",
        line: "Prepare PCI-DSS evidence and control mapping for certified QSA review.",
        price: "$10,000-$25,000/yr",
      },
      {
        code: "C10-S04",
        name: "Proof After Breach",
        line: "Create a certified forensic record of what happened and how it was contained.",
        price: "$12,000-$30,000 / incident",
      },
    ],
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

export default function Home() {
  const [active, setActive] = useState(0);
  const [trayOpen, setTrayOpen] = useState(false);
  const scope = useScope();
  const selected = categories[active];
  return (
    <main className="services-page">
      <header className="site-header">
        <Link className="wordmark" href="#">
          <span>ORAGROL</span>
          <small>GLOBAL</small>
        </Link>
        <nav className="service-nav">
          {navItems.map((n, i) => (
            <Link className={i === 0 ? "active" : ""} href={n === "Services" ? "/" : n === "Business Automation" ? "/business-automation" : n === "OR ONE" ? "/or-one" : n === "Industries" ? "/industries" : n === "Resources" ? "/resources" : "/company"} key={n}>
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
          <Link className="score-link" href="#final-cta">
            Get Cyber Health Score
          </Link>
          <button className="search" aria-label="Search">
            <span />
          </button>
          <button className="language">EN / FR</button>
        </div>
      </header>

      <section className="hero" aria-labelledby="hero-title">
        <div className="monument" aria-hidden="true">
          <span className="or">OR</span>
          <span className="ten">10</span>
          <span className="index-label">Cybersecurity service index</span>
        </div>
        <div className="hero-content">
          <div className="eyebrow-row">
            <p>Services / Cybersecurity</p>
            <p>42 services / 10 disciplines</p>
          </div>
          <div className="statement">
            <h1 id="hero-title">
              Ten disciplines.<span>One clearer defence.</span>
            </h1>
            <div className="support-grid">
              <p className="lead">
                Explore 42 cybersecurity services organized across ten connected
                disciplines—so you can identify what matters, understand your
                options and protect your business with precision.
              </p>
              <Link className="explore" href="#or10-index">
                Explore the service index<span>↘</span>
              </Link>
            </div>
          </div>
          <div className="hero-footer">
            <p>Governance</p>
            <p>Protection</p>
            <p>Resilience</p>
            <p>Response</p>
            <p className="canada">Built for Canadian business</p>
          </div>
        </div>
      </section>

      <section className="radial-section" id="or10-index">
        <div className="radial-heading">
          <p>OR10 / Security index</p>
          <h2>
            Choose where
            <br />
            to begin.
          </h2>
          <p>
            Select one discipline to see the services, outcomes and protected
            prices connected to it.
          </p>
        </div>
        <div className="radial-stage">
          <div className="radial" aria-label="Ten cybersecurity categories">
            <div className="radial-core">
              <strong>OR10</strong>
              <span>{String(active + 1).padStart(2, "0")} / 10</span>
            </div>
            {categories.map((c, i) => (
              <button
                onClick={() => setActive(i)}
                className={`radial-node node-${i + 1} ${active === i ? "selected" : ""}`}
                key={c.title}
                aria-pressed={active === i}
              >
                <b>{String(i + 1).padStart(2, "0")}</b>
                <span>{c.short}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="category-panel">
          <div className="category-head">
            <span>Category {String(active + 1).padStart(2, "0")}</span>
            <h3>{selected.title}</h3>
            <p>{selected.description}</p>
          </div>
          <div className="service-rows">
            {selected.services.map((s) => {
              const id = `cyber:${s.code}`;
              return (
                <article key={s.code}>
                  <span>{s.code}</span>
                  <div>
                    <h4>{s.name}</h4>
                    <p>{s.line}</p>
                  </div>
                  <strong>{s.price}</strong>
                  <button
                    className={
                      scope.has(id) ? "service-scope added" : "service-scope"
                    }
                    onClick={() => {
                      scope.toggle({
                        id,
                        area: "Cybersecurity",
                        code: s.code,
                        title: s.name,
                        detail: s.line,
                        commercial: s.price,
                      });
                      setTrayOpen(true);
                    }}
                  >
                    {scope.has(id) ? "Added ✓" : "Add to Scope +"}
                  </button>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="guidance">
        <div>
          <p>Not sure where to start?</p>
          <h2>
            Clarity before
            <br />
            complexity.
          </h2>
        </div>
        <div className="guidance-copy">
          <p>
            Services are individual capabilities. Your Cyber Health Score helps
            identify which capabilities matter now, which can wait and where
            investment will make the greatest difference.
          </p>
          <div className="guidance-points">
            <span>01 Understand your position</span>
            <span>02 Prioritize real exposure</span>
            <span>03 Choose only what you need</span>
          </div>
        </div>
      </section>

      <section className="final-cta" id="final-cta">
        <p>Your clearest next step</p>
        <h2>
          Know where you stand.
          <br />
          <span>Know what to do next.</span>
        </h2>
        <Link href="#">
          Get Your Cyber Health Score <span>↗</span>
        </Link>
        <p className="talk">
          Prefer to talk first? <u>Talk to ORAGROL</u>
        </p>
      </section>

      <footer className="home-footer">
        <div className="footer-top">
          <h2>
            ORAGROL is where cybersecurity
            <br />
            protection and intelligent business
            <br />
            automation meet.
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
            <Link href="#">Privacy Policy</Link>
            <Link href="#">Terms of Use</Link>
            <Link href="#">Accessibility</Link>
          </div>
        </div>
        <div className="social">
          <Link aria-label="LinkedIn" href="https://www.linkedin.com/company/oragrol-global/">in</Link>
          <Link aria-label="Instagram" href="https://www.instagram.com/oragrolglobal">◎</Link>
        </div>
        <div className="footer-lockup home-footer-lockup"><div className="footer-word">ORAGROL</div><span>GLOBAL</span></div>
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
        activeArea="Cybersecurity"
      />
    </main>
  );
}
