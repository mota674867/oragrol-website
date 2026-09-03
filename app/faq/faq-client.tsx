"use client";
import Link from "next/link";
import { useState } from "react";
import "../gpt-pages.css";
const groups = [
  {
    title: "Getting started",
    items: [
      [
        "How do I choose which services I need?",
        "Pick what you already know you need, or use Not sure — help me choose. Our team will help you find the right starting point without guessing.",
      ],
      [
        "Do I need to talk to someone before I sign up?",
        "No. You can use email, ORAGROL chat, the website form or meet in person. A conversation is only needed when you want one or the service requires custom scoping.",
      ],
      [
        "What if I want to talk to someone before deciding?",
        "ORAGROL chat is available 24/7. A real person is available Monday to Friday, 9am to 6pm ET, subject to availability.",
      ],
    ],
  },
  {
    title: "How you purchase",
    items: [
      [
        "What happens after I reach out?",
        "We confirm what you need and prepare a proposal covering the appropriate scope.",
      ],
      [
        "How do you prepare a proposal?",
        "We use the products or services you selected to define scope, pricing and terms for your review.",
      ],
      [
        "What is in the contract?",
        "The exact products or services ordered, conditions, amount, payment method and both sides’ responsibilities.",
      ],
      [
        "How do I sign and confirm?",
        "You review, sign and return the contract. We finalize it before the order is confirmed.",
      ],
      [
        "When and how do I pay?",
        "Payment follows the signed contract, never before. It is due according to the terms stated there.",
      ],
      [
        "Do I get an invoice?",
        "Yes. Once the signed contract and payment are received, we issue a complete invoice for the order.",
      ],
    ],
  },
  {
    title: "Payment, contracts and cancellation",
    items: [
      [
        "What payment methods do you accept?",
        "Card or bank transfer, as stated in your contract.",
      ],
      [
        "Is GST or HST shown separately?",
        "Yes. Applicable tax is shown as a separate line on your invoice.",
      ],
      [
        "What happens if a payment is late?",
        "Invoices are due within 30 days. Unpaid balances accrue interest at 1.5% per month, and service may be paused when payment is more than 15 days overdue.",
      ],
      [
        "Can I cancel or change services later?",
        "Yes. With 60 days’ written notice and no outstanding balance, there is no cancellation fee. Other cancellation costs and OR ONE term conditions are defined in the contract.",
      ],
      [
        "What happens to my data if I cancel?",
        "Under our standard agreement, data is returned or securely destroyed within 30 days, with written certification available on request.",
      ],
      [
        "What guarantees do you offer?",
        "Action-taking services state target response times. They remain targets, not guarantees, until proven in live operation.",
      ],
      [
        "What are my responsibilities and yours?",
        "Both sides’ responsibilities are written explicitly into the contract before signing.",
      ],
    ],
  },
  {
    title: "How the service works",
    items: [
      [
        "Is this just a security report?",
        "No. Most services are designed to take action, while selected services provide ongoing expert oversight and advice.",
      ],
      [
        "Who does the work?",
        "Detection and analysis can run automatically around the clock. Nothing reaches you and no action is taken without human review.",
      ],
      [
        "How fast do you respond to a real problem?",
        "Each action-taking service has a stated target response time. The applicable target appears with the service.",
      ],
      [
        "What access do you need?",
        "Primarily read access and, for action-taking services, limited write access to approved business systems. Access can start narrow and expand when appropriate.",
      ],
      [
        "Is this one-time or ongoing?",
        "Most services provide ongoing protection rather than a one-time checkup.",
      ],
    ],
  },
  {
    title: "What you receive",
    items: [
      [
        "What do I receive?",
        "Clear visibility into findings, fixes and open items, plus urgent alerts. Delivery begins through written summaries and email, with a fuller online dashboard planned.",
      ],
      [
        "Do I need a technical background?",
        "No. Information is written for business owners and decision-makers.",
      ],
      [
        "Will dangerous findings be flagged immediately?",
        "Yes. Urgent findings are not held for a scheduled update.",
      ],
    ],
  },
  {
    title: "Technical support",
    items: [
      [
        "What if something is not working?",
        "Reach us through ORAGROL chat or email and our team will review it.",
      ],
      [
        "How fast do you respond to support?",
        "Urgent issues for active clients follow the target stated in their service. General questions are handled the same or next business day.",
      ],
      [
        "Do you offer support outside business hours?",
        "ORAGROL chat is available 24/7. Human support is Monday to Friday, 9am to 6pm ET, subject to availability.",
      ],
      [
        "Can chat help with an active incident if I am not a client?",
        "Chat can route your message, but it is not emergency incident response and does not create a service relationship. It does not provide remediation instructions.",
      ],
    ],
  },
  {
    title: "Company and trust",
    items: [
      [
        "How do I reach ORAGROL?",
        "Use ORAGROL chat or the contact form. Department mailboxes will be published once the permanent domain is active.",
      ],
      [
        "Where are you located?",
        "Headquarters and Registered Office: Thunder Bay, Ontario. Toronto Presence: Toronto, Ontario.",
      ],
      [
        "Can I talk to a real person?",
        "Yes, Monday to Friday, 9am to 6pm ET, subject to availability.",
      ],
      [
        "Is my data safe?",
        "We handle data in line with Canadian privacy law and require appropriate insurance before taking on client-system access.",
      ],
      [
        "How much does it cost?",
        "Starting prices appear on each service page. Your exact cost depends on the selected Cybersecurity, Business Automation or OR ONE scope.",
      ],
      [
        "What if we outgrow our plan?",
        "Cybersecurity tiers and Business Automation packages can be upgraded, while OR ONE scales into custom requirements.",
      ],
      [
        "Do you replace our IT provider?",
        "Usually no. We work alongside existing IT providers or internal teams, focusing on the security and automation layer.",
      ],
      [
        "Which industries do you serve?",
        "We support Canadian small and medium-sized businesses across the industry profiles shown on our Industries page.",
      ],
    ],
  },
] as const;

const nav = [
  ["Services", "/services"],
  ["Business Automation", "/business-automation"],
  ["OR ONE", "/or-one"],
  ["Industries", "/industries"],
  ["Resources", "/resources"],
  ["Company", "/company"],
];

function FAQPageClient() {
  const [query, setQuery] = useState("");
  const filtered = groups
    .map((g) => ({
      ...g,
      items: g.items.filter(([q, a]) =>
        (q + " " + a).toLowerCase().includes(query.toLowerCase()),
      ),
    }))
    .filter((g) => g.items.length);
  return (
    <main className="faq-page">
      <header className="faq-nav">
        <Link className="wordmark" href="/">
          <span>ORAGROL</span>
          <small>GLOBAL</small>
        </Link>
        <nav>
          {nav.map(([n, h]) => (
            <Link href={h} key={n}>
              {n}
            </Link>
          ))}
        </nav>
        <Link href="/contact">Contact</Link>
      </header>
      <section className="faq-hero">
        <span>OR</span>
        <div>
          <p>ORAGROL / QUESTIONS</p>
          <h1>
            Clear answers.
            <br />
            <i>Before you begin.</i>
          </h1>
          <p>
            Services, purchasing, support and how we work—explained without
            unnecessary technical language.
          </p>
          <label className="faq-search">
            <span aria-hidden="true" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="search"
              placeholder="Search questions"
              aria-label="Search frequently asked questions"
            />
          </label>
        </div>
      </section>
      <section className="faq-content">
        {filtered.length ? (
          filtered.map((g, gi) => (
            <article key={g.title}>
              <header>
                <span>{String(gi + 1).padStart(2, "0")}</span>
                <h2>{g.title}</h2>
              </header>
              <div>
                {g.items.map(([q, a]) => (
                  <details key={q}>
                    <summary>
                      {q}
                      <b>+</b>
                    </summary>
                    <p>{a}</p>
                  </details>
                ))}
              </div>
            </article>
          ))
        ) : (
          <p className="faq-no-results">
            No matching questions. Try a shorter search.
          </p>
        )}
      </section>
      <section className="faq-cta">
        <p>STILL HAVE A QUESTION?</p>
        <h2>Start with a clear conversation.</h2>
        <Link href="/contact">Contact ORAGROL ↗</Link>
      </section>
      <footer className="faq-footer">
        <strong>
          ORAGROL <small>GLOBAL</small>
        </strong>
        <nav>
          <Link href="/company">Company</Link>
          <Link href="/resources">Resources</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/contact">Contact</Link>
        </nav>
        <div className="social">
          <a
            aria-label="LinkedIn"
            href="https://www.linkedin.com/company/oragrol-global/"
          >
            in
          </a>
          <a
            aria-label="Instagram"
            href="https://www.instagram.com/oragrolglobal"
          >
            ◎
          </a>
        </div>
        <span>Thunder Bay · Ontario · Canada</span>
      </footer>
    </main>
  );
}

export default FAQPageClient;
