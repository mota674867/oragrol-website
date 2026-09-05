// This page intentionally has no promotional CTA; it ends directly with the
// shared dark footer.
//
// Nav bar (2026-09-05): added the site's standard global nav — the same
// `industry-header` shell already used by Company, Resources, Industries and
// Contact (see app/gpt-pages.css) — above the existing breadcrumb, per
// explicit direction: Privacy Policy stays OUT of that nav's link list (it's
// reachable only via the footer's Legal column) and the breadcrumb stays put
// beneath it, unchanged. `.privacy-header` below is this page's own tint
// modifier, matching its titanium/graphite palette the same way
// `.company-header`/`.res-header` match theirs.

import type { Metadata } from "next";
import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import SiteFooter from "../components/site/footer";
import "../gpt-pages.css";
import {
  PRIVACY_POLICY,
  type PrivacyBlock,
} from "./ORAGROL_PrivacyPolicyContent";

export const metadata: Metadata = {
  title: "Privacy Policy | ORAGROL Global",
  description:
    "How ORAGROL Global collects, uses, stores and protects personal information under applicable Canadian privacy law.",
  alternates: { canonical: "/privacy-policy" },
  robots: { index: true, follow: true },
};

// Same six links as the standard nav on Company/Resources/Industries/Contact.
// Privacy Policy is deliberately not one of them — it stays reachable only
// through the footer's Legal column.
const nav = [
  "Services",
  "Business Automation",
  "OR ONE",
  "Industries",
  "Resources",
  "Company",
];

function sectionId(number: string, title: string) {
  return `${number}-${title}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function renderInline(text: string): ReactNode[] {
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
  return text.split(pattern).filter(Boolean).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }

    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }

    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      const external = /^https?:\/\//.test(link[2]);
      return (
        <a
          key={index}
          href={link[2]}
          {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
        >
          {link[1]}{external ? " ↗" : ""}
        </a>
      );
    }

    return <Fragment key={index}>{part}</Fragment>;
  });
}

function PolicyBlocks({ blocks }: { blocks: PrivacyBlock[] }) {
  return (
    <>
      {blocks.map((block, index) => {
        if (block.type === "paragraph") {
          return <p key={index}>{renderInline(block.text)}</p>;
        }

        if (block.type === "list") {
          return (
            <ul key={index}>
              {block.items.map((item) => <li key={item}>{renderInline(item)}</li>)}
            </ul>
          );
        }

        return (
          <div className="privacy-table-wrap" key={index}>
            <table>
              <thead>
                <tr>{block.headers.map((header) => <th key={header}>{header}</th>)}</tr>
              </thead>
              <tbody>
                {block.rows.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </>
  );
}

function ContentsLinks() {
  return (
    <nav aria-label="Privacy Policy sections">
      {PRIVACY_POLICY.sections.map((section) => (
        <a href={`#${sectionId(section.number, section.title)}`} key={section.number}>
          <span>{section.number}</span>
          <span>{section.title}</span>
        </a>
      ))}
    </nav>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <>
      <main className="privacy-page">
        <header className="industry-header privacy-header">
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
            <button className="search" aria-label="Search">
              <span />
            </button>
            <button className="language">EN / FR</button>
          </div>
        </header>

        <header className="privacy-hero">
          <div className="privacy-shell">
            <nav className="privacy-breadcrumb" aria-label="Breadcrumb">
              <Link href="/">Home</Link><span>/</span><span>Legal</span><span>/</span>
              <span aria-current="page">Privacy Policy</span>
            </nav>

            <div className="privacy-hero__layout">
              <div className="privacy-hero__content">
                <p className="privacy-eyebrow">LEGAL · PRIVACY</p>
                <h1>{PRIVACY_POLICY.title}</h1>
                <p className="privacy-subtitle">{PRIVACY_POLICY.subtitle}</p>
                <div className="privacy-dates">
                  <span>EFFECTIVE {PRIVACY_POLICY.effectiveDate.toUpperCase()}</span>
                  <span>LAST UPDATED {PRIVACY_POLICY.lastUpdated.toUpperCase()}</span>
                </div>
              </div>
              <span className="privacy-hero__number" aria-hidden="true">01</span>
            </div>
          </div>
        </header>

        <div className="privacy-shell privacy-layout">
          <aside className="privacy-toc">
            <h2>ON THIS PAGE</h2>
            <ContentsLinks />
          </aside>

          <article className="privacy-document">
            <details className="privacy-toc-mobile">
              <summary>ON THIS PAGE <span aria-hidden="true">+</span></summary>
              <ContentsLinks />
            </details>

            <section className="plain-language" aria-labelledby="plain-language-heading">
              <h2 id="plain-language-heading">IN PLAIN LANGUAGE</h2>
              <PolicyBlocks blocks={PRIVACY_POLICY.plainLanguage} />
            </section>

            {PRIVACY_POLICY.sections.map((section) => (
              <section
                className={`privacy-section${section.number === "15" ? " privacy-section--contact" : ""}`}
                id={sectionId(section.number, section.title)}
                key={section.number}
              >
                <span className="privacy-section__number" aria-hidden="true">
                  {section.number}
                </span>
                <div className="privacy-section__body">
                  <h2>{section.title}</h2>
                  <PolicyBlocks blocks={section.blocks} />
                </div>
              </section>
            ))}
          </article>
        </div>
      </main>

      <SiteFooter />
      <style>{PRIVACY_STYLES}</style>
    </>
  );
}

const PRIVACY_STYLES = `
  .privacy-page {
    --orange: #ef4d00;
    --graphite: #111111;
    --titanium: #f3f1ec;
    --muted: #6c6a66;
    --rule: #d6d2ca;
    background: #fff;
    color: var(--graphite);
    font-family: var(--font-neue-haas-text, "Neue Haas Grotesk Text Pro"), "Helvetica Neue", Arial, sans-serif;
  }

  /* Tint modifier for the shared .industry-header shell, matching this
     page's own titanium/graphite palette — same pattern as .company-header
     and .res-header (see app/gpt-pages.css). */
  .privacy-header {
    background: #fff !important;
    border-color: var(--rule) !important;
    position: relative;
    z-index: 20;
  }

  .privacy-header a,
  .privacy-header button,
  .privacy-header .wordmark span,
  .privacy-header .wordmark small {
    color: var(--graphite) !important;
  }

  .privacy-header nav a {
    opacity: 0.65;
  }

  .privacy-header nav a:hover {
    opacity: 1;
  }

  .privacy-shell {
    width: min(100%, 1500px);
    margin-inline: auto;
    padding-inline: clamp(24px, 4vw, 72px);
  }

  .privacy-hero {
    min-height: 405px;
    padding-top: clamp(32px, 4vw, 58px);
    display: grid;
    background: var(--titanium);
  }

  .privacy-breadcrumb {
    display: flex;
    flex-wrap: wrap;
    gap: 9px;
    color: var(--muted);
    font-size: 12px;
  }

  .privacy-breadcrumb a {
    color: inherit;
    text-decoration: none;
  }

  .privacy-hero__layout {
    min-height: 315px;
    display: grid;
    grid-template-columns: minmax(0, 2.2fr) minmax(190px, 0.75fr);
    align-items: center;
    gap: 50px;
  }

  .privacy-eyebrow {
    margin: 0;
    color: var(--orange);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.075em;
  }

  .privacy-hero h1 {
    margin: 20px 0 16px;
    font-family: var(--font-neue-haas-display, "Neue Haas Grotesk Display Pro"), "Helvetica Neue", Arial, sans-serif;
    font-size: clamp(62px, 6.8vw, 108px);
    font-weight: 350;
    line-height: 0.96;
    letter-spacing: -0.055em;
  }

  .privacy-subtitle {
    max-width: 720px;
    margin: 0;
    color: var(--muted);
    font-size: clamp(17px, 1.45vw, 23px);
    line-height: 1.5;
  }

  .privacy-dates {
    display: flex;
    flex-wrap: wrap;
    gap: 18px 50px;
    margin-top: 34px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
  }

  .privacy-hero__number {
    justify-self: end;
    color: #e2dfd8;
    font-family: var(--font-neue-haas-display, "Neue Haas Grotesk Display Pro"), "Helvetica Neue", Arial, sans-serif;
    font-size: clamp(150px, 17vw, 270px);
    font-weight: 250;
    line-height: 0.8;
    letter-spacing: -0.08em;
  }

  .privacy-layout {
    display: grid;
    grid-template-columns: minmax(210px, 0.78fr) minmax(0, 2.4fr);
    gap: clamp(44px, 6vw, 110px);
    padding-top: 64px;
    padding-bottom: 88px;
  }

  .privacy-toc {
    align-self: start;
    position: sticky;
    top: 104px;
    padding-right: 30px;
    border-right: 1px solid var(--rule);
  }

  .privacy-toc h2,
  .privacy-toc-mobile summary,
  .plain-language > h2 {
    margin: 0;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.065em;
  }

  .privacy-toc nav,
  .privacy-toc-mobile nav {
    display: grid;
    gap: 14px;
    margin-top: 28px;
  }

  .privacy-toc a,
  .privacy-toc-mobile a {
    display: grid;
    grid-template-columns: 27px 1fr;
    gap: 8px;
    color: var(--muted);
    font-size: 12px;
    line-height: 1.35;
    text-decoration: none;
  }

  .privacy-toc a > span:first-child,
  .privacy-toc-mobile a > span:first-child {
    color: var(--orange);
  }

  .privacy-toc a:hover,
  .privacy-toc-mobile a:hover {
    color: var(--graphite);
  }

  .privacy-document {
    width: min(100%, 890px);
  }

  .privacy-toc-mobile {
    display: none;
  }

  .plain-language {
    margin-bottom: 58px;
    padding: 4px 0 4px 28px;
    border-left: 2px solid var(--orange);
  }

  .plain-language > h2 {
    margin-bottom: 18px;
  }

  .plain-language p {
    margin: 0 0 14px;
    color: #333230;
    font-size: 17px;
    line-height: 1.66;
  }

  .plain-language p:last-child {
    margin-bottom: 0;
  }

  .privacy-section {
    scroll-margin-top: 105px;
    display: grid;
    grid-template-columns: 42px minmax(0, 1fr);
    gap: 18px;
    padding: 31px 0;
    border-top: 1px solid var(--rule);
  }

  .privacy-section__number {
    padding-top: 5px;
    color: var(--orange);
    font-size: 13px;
    font-weight: 600;
  }

  .privacy-section__body h2 {
    margin: 0 0 18px;
    font-family: var(--font-neue-haas-display, "Neue Haas Grotesk Display Pro"), "Helvetica Neue", Arial, sans-serif;
    font-size: clamp(26px, 2.15vw, 35px);
    font-weight: 500;
    line-height: 1.12;
    letter-spacing: -0.025em;
  }

  .privacy-section__body p,
  .privacy-section__body li {
    color: #45433f;
    font-size: 16px;
    line-height: 1.7;
  }

  .privacy-section__body p {
    margin: 0 0 17px;
  }

  .privacy-section__body ul {
    display: grid;
    gap: 9px;
    margin: 12px 0 22px;
    padding-left: 20px;
  }

  .privacy-section__body li::marker {
    color: var(--orange);
  }

  .privacy-section__body a {
    color: inherit;
    text-decoration-color: var(--orange);
    text-underline-offset: 3px;
  }

  .privacy-table-wrap {
    margin: 26px 0;
    overflow-x: auto;
    border-top: 1px solid var(--graphite);
    border-bottom: 1px solid var(--graphite);
  }

  .privacy-table-wrap table {
    width: 100%;
    min-width: 540px;
    border-collapse: collapse;
    text-align: left;
  }

  .privacy-table-wrap th,
  .privacy-table-wrap td {
    padding: 13px 12px;
    border-bottom: 1px solid var(--rule);
    vertical-align: top;
  }

  .privacy-table-wrap th {
    font-size: 10px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .privacy-table-wrap td {
    color: #45433f;
    font-size: 14px;
    line-height: 1.45;
  }

  .privacy-table-wrap tbody tr:last-child td {
    border-bottom: 0;
  }

  .privacy-section--contact {
    margin-top: 32px;
    padding: 34px;
    grid-template-columns: 42px minmax(0, 1fr);
    border: 0;
    background: var(--graphite);
    color: #fff;
  }

  .privacy-section--contact .privacy-section__body h2,
  .privacy-section--contact .privacy-section__body p,
  .privacy-section--contact .privacy-section__body a {
    color: #fff;
  }

  .privacy-section--contact .privacy-section__body a {
    display: inline-block;
    margin-top: 6px;
    padding: 12px 16px;
    background: #fff;
    color: var(--graphite);
    text-decoration: none;
  }

  @media (max-width: 900px) {
    .privacy-hero__layout {
      grid-template-columns: minmax(0, 1fr) 150px;
    }

    .privacy-layout {
      grid-template-columns: 180px minmax(0, 1fr);
      gap: 40px;
    }
  }

  @media (max-width: 700px) {
    .privacy-shell {
      padding-inline: 20px;
    }

    .privacy-hero {
      min-height: 430px;
      padding-top: 27px;
    }

    .privacy-hero__layout {
      position: relative;
      grid-template-columns: 1fr;
      min-height: 350px;
    }

    .privacy-hero__content {
      position: relative;
      z-index: 1;
    }

    .privacy-hero h1 {
      font-size: clamp(56px, 17vw, 78px);
    }

    .privacy-hero__number {
      position: absolute;
      right: 0;
      top: 25px;
      opacity: 0.7;
      font-size: 150px;
    }

    .privacy-dates {
      display: grid;
      gap: 10px;
      margin-top: 28px;
    }

    .privacy-layout {
      display: block;
      padding-top: 34px;
      padding-bottom: 54px;
    }

    .privacy-toc {
      display: none;
    }

    .privacy-toc-mobile {
      display: block;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 1px solid var(--rule);
    }

    .privacy-toc-mobile summary {
      display: flex;
      justify-content: space-between;
      cursor: pointer;
      list-style: none;
    }

    .privacy-toc-mobile summary::-webkit-details-marker {
      display: none;
    }

    .plain-language {
      padding-left: 20px;
    }

    .privacy-section {
      grid-template-columns: 32px minmax(0, 1fr);
      gap: 10px;
    }

    .privacy-section__body p,
    .privacy-section__body li {
      font-size: 15.5px;
    }

    .privacy-section--contact {
      margin-inline: -20px;
      padding: 28px 20px;
    }
  }
`;
