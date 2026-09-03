"use client";
import Link from "next/link";

import { FormEvent, useEffect, useState } from "react";
import "../gpt-pages.css";

type Conversation =
  | "Cybersecurity Services"
  | "Business Automation"
  | "OR ONE"
  | "Partnership or General Enquiry";
type ScopeItem = { id: string; area: string; code: string; title: string };

const nav = [
  "Services",
  "Business Automation",
  "OR ONE",
  "Industries",
  "Resources",
  "Company",
];
const options: { name: Conversation; index: string; summary: string }[] = [
  {
    name: "Cybersecurity Services",
    index: "01",
    summary:
      "Assess risk, strengthen protection or address a specific security priority.",
  },
  {
    name: "Business Automation",
    index: "02",
    summary:
      "Improve a defined business process through secure, practical automation.",
  },
  {
    name: "OR ONE",
    index: "03",
    summary:
      "Coordinate cybersecurity, automation and operational intelligence within one secure system.",
  },
  {
    name: "Partnership or General Enquiry",
    index: "04",
    summary: "Discuss partnerships, company information or another request.",
  },
];

function ContactPageClient() {
  const [conversation, setConversation] = useState<Conversation>(
    "Cybersecurity Services",
  );
  const [scope, setScope] = useState<ScopeItem[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  // Hydrate from localStorage after mount (client-only; SSR/first paint
  // stays empty on purpose to avoid a hydration mismatch) — same pattern
  // as ScopeTray's own useScope hook.
  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setScope(JSON.parse(localStorage.getItem("oragrol-scope-v2") || "[]"));
    } catch {}
  }, []);
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(null);
    const form = new FormData(e.currentTarget);
    const scopeSummary =
      scope.length > 0
        ? `${scope.length} selection${scope.length === 1 ? "" : "s"}: ${scope.map((x) => x.title).join(", ")}`
        : undefined;
    const payload = {
      firstName: String(form.get("firstName") || ""),
      lastName: String(form.get("lastName") || ""),
      email: String(form.get("email") || ""),
      company: String(form.get("company") || ""),
      jobTitle: String(form.get("jobTitle") || "") || undefined,
      companySize: String(form.get("companySize") || "") || undefined,
      conversation,
      context: String(form.get("context") || ""),
      contactMethod: String(form.get("contactMethod") || "") || undefined,
      preferredTime: String(form.get("preferredTime") || "") || undefined,
      scopeSummary,
    };
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data: { ok: boolean; error?: string } = await res.json();
      if (!res.ok || !data.ok) {
        setSubmitError(data.error || "Could not send your message. Please try again.");
        return;
      }
      setSubmitted(true);
    } catch {
      setSubmitError("Could not send your message. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <main className="contact-page">
      <header className="industry-header contact-header">
        <Link className="wordmark" href="/">
          <span>ORAGROL</span>
          <small>GLOBAL</small>
        </Link>
        <nav>
          {nav.map((n) => (
            <Link
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
          <a className="active" href="#enquiry">
            Start enquiry
          </a>
          <button className="search" aria-label="Search">
            <span />
          </button>
          <button className="language">EN / FR</button>
        </div>
      </header>

      <section className="contact-hero">
        <div className="contact-hero-mark" aria-hidden="true">
          OR
        </div>
        <div>
          <p>Contact / ORAGROL Global</p>
          <h1>
            Start with a<br />
            <span>clear conversation.</span>
          </h1>
          <p>
            Whether you are exploring ORAGROL Global for a specific priority or
            a more coordinated transformation, begin with a conversation shaped
            around how your business operates.
          </p>
          <a href="#conversations">
            Choose your conversation <b>↓</b>
          </a>
        </div>
      </section>

      <section className="contact-conversations" id="conversations">
        <header>
          <span>01 / Begin here</span>
          <h2>
            Choose your
            <br />
            conversation.
          </h2>
          <p>
            Select the direction closest to your current priority. You can add
            context before submitting.
          </p>
        </header>
        <div className="conversation-grid">
          {options.map((o) => (
            <button
              className={conversation === o.name ? "selected" : ""}
              onClick={() => setConversation(o.name)}
              aria-pressed={conversation === o.name}
              key={o.name}
            >
              <span>{o.index}</span>
              <i>{conversation === o.name ? "Selected" : "Select"}</i>
              <h3>{o.name}</h3>
              <p>{o.summary}</p>
              <b>↗</b>
            </button>
          ))}
        </div>
      </section>

      <section className="contact-enquiry" id="enquiry">
        <div className="enquiry-intro">
          <span>02 / Your enquiry</span>
          <h2>Tell us what you are working on.</h2>
          <p>
            Share the outcome you need. We will review the context before
            recommending a next step.
          </p>
          {scope.length > 0 && (
            <aside>
              <small>MY SCOPE ATTACHED</small>
              <strong>
                {String(scope.length).padStart(2, "0")} selection
                {scope.length === 1 ? "" : "s"}
              </strong>
              <p>
                {scope
                  .slice(0, 3)
                  .map((x) => x.title)
                  .join(" · ")}
                {scope.length > 3 ? ` · +${scope.length - 3} more` : ""}
              </p>
            </aside>
          )}
        </div>
        <form onSubmit={submit}>
          <div className="selected-conversation">
            <span>Conversation</span>
            <strong>{conversation}</strong>
            <button
              type="button"
              onClick={() =>
                document.getElementById("conversations")?.scrollIntoView()
              }
            >
              Change
            </button>
          </div>
          <div className="field-pair">
            <label>
              First name
              <input required name="firstName" />
            </label>
            <label>
              Last name
              <input required name="lastName" />
            </label>
          </div>
          <div className="field-pair">
            <label>
              Business email
              <input
                required
                type="email"
                name="email"
                placeholder="name@company.ca"
              />
            </label>
            <label>
              Company
              <input required name="company" />
            </label>
          </div>
          <div className="field-pair">
            <label>
              Job title
              <input name="jobTitle" />
            </label>
            <label>
              Company size
              <select name="companySize" defaultValue="">
                <option value="" disabled>
                  Select
                </option>
                <option>1–10 employees</option>
                <option>11–50 employees</option>
                <option>51–200 employees</option>
                <option>201+ employees</option>
              </select>
            </label>
          </div>
          <label>
            What would you like to achieve?
            <textarea
              required
              name="context"
              placeholder="Describe the priority, outcome or challenge in your own words."
            />
          </label>
          <div className="field-pair">
            <label>
              Preferred contact method
              <select name="contactMethod" defaultValue="Email">
                <option>Email</option>
                <option>Video call</option>
              </select>
            </label>
            <label>
              Preferred time to connect
              <input
                name="preferredTime"
                placeholder="Morning, afternoon or a specific date"
              />
            </label>
          </div>
          <label className="contact-consent">
            <input required type="checkbox" /> I agree that ORAGROL Global may
            contact me about this enquiry.
          </label>
          <button className="contact-submit" type="submit" disabled={submitting}>
            {submitting ? "Sending…" : "Submit Enquiry"} <span>↗</span>
          </button>
          {submitError && (
            <div className="contact-confirmation" role="alert">
              <strong>Something went wrong.</strong>
              <span>{submitError}</span>
            </div>
          )}
          {scope.length > 0 && (
            <button
              className="contact-pdf"
              type="button"
              onClick={() =>
                alert(
                  "Open My Scope on Services, Business Automation or OR ONE to download the current branded PDF.",
                )
              }
            >
              Download My Scope as PDF
            </button>
          )}
          {submitted && (
            <div className="contact-confirmation" role="status">
              <strong>Thank you.</strong>
              <span>
                Your enquiry has been sent to the ORAGROL Global team for
                review. We aim to respond within two business days.
              </span>
            </div>
          )}
          <small className="contact-privacy">
            Your information will be used only to review and respond to your
            request.
          </small>
        </form>
      </section>

      <section className="contact-next">
        <header>
          <span>03 / What happens next</span>
          <h2>
            A considered response.
            <br />
            <i>Not an automated sales pitch.</i>
          </h2>
        </header>
        <div>
          {[
            [
              "01",
              "Review",
              "We review your enquiry, selected scope and stated priorities.",
            ],
            [
              "02",
              "Confirm",
              "You receive confirmation that your request has been received.",
            ],
            [
              "03",
              "Connect",
              "We arrange the right conversation for your requirements.",
            ],
            [
              "04",
              "Scope",
              "We define the recommended path before any commitment.",
            ],
          ].map((s) => (
            <article key={s[0]}>
              <span>{s[0]}</span>
              <h3>{s[1]}</h3>
              <p>{s[2]}</p>
            </article>
          ))}
        </div>
        <p>
          We aim to acknowledge qualified enquiries within two business days.
        </p>
      </section>

      <section className="contact-locations">
        <div>
          <span>04 / ORAGROL Global</span>
          <h2>
            Canadian foundation.
            <br />
            Clear points of contact.
          </h2>
        </div>
        <div className="location-cards">
          <article>
            <span>Registered Headquarters</span>
            <h3>Thunder Bay</h3>
            <p>Ontario · Canada</p>
          </article>
          <article>
            <span>Toronto Presence</span>
            <h3>Toronto</h3>
            <p>
              Client relationships and business development
              <br />
              Ontario · Canada
            </p>
          </article>
          <article>
            <span>Digital enquiries</span>
            <h3>orgro.ca</h3>
            <p>
              Our approved @orgro.ca contact email will be published when
              activated.
            </p>
          </article>
        </div>
      </section>

      <section className="contact-call">
        <span>One clear starting point</span>
        <h2>
          Begin with what
          <br />
          matters now.
        </h2>
        <a href="#enquiry">
          Start Your Enquiry <b>↑</b>
        </a>
      </section>

      <footer className="contact-footer">
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

export default ContactPageClient;
