// Nav bar (2026-09-06): GPT's own placement comment assumed "the existing
// site layout" renders the approved global nav above this page automatically
// -- it doesn't, on this site's architecture (redesigned routes render only
// their own page content + the global ChatWidget; see site-chrome.tsx). Added
// the same `industry-header` shell used by Privacy Policy/Resources/Company/
// Industries/Contact, above the existing breadcrumb, which stays put beneath
// it. Terms of Use is deliberately not one of that nav's links -- it stays
// reachable only through the footer's Legal column, same as Privacy Policy.

import type { Metadata } from "next";
import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import SiteFooter from "../components/site/footer";
import "../gpt-pages.css";
import { TERMS_OF_USE, type TermsBlock } from "./ORAGROL_TermsOfUseContent";

export const metadata: Metadata = {
  title: "Terms of Use | ORAGROL Global",
  description: "The terms governing access to and use of the ORAGROL Global website.",
  alternates: { canonical: "/terms-of-use" },
  robots: { index: true, follow: true },
};

// Same six links as the standard nav on Privacy Policy/Resources/Company/
// Industries/Contact. Terms of Use is deliberately not one of them.
const nav = [
  "Services",
  "Business Automation",
  "OR ONE",
  "Industries",
  "Resources",
  "Company",
];

function sectionId(number: string, title: string) {
  return `${number}-${title}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function renderInline(text: string): ReactNode[] {
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\)|  \n)/g;
  return text.split(pattern).filter(Boolean).map((part, index) => {
    if (part === "  \n") return <br key={index} />;
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={index}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.endsWith("*")) return <em key={index}>{part.slice(1, -1)}</em>;

    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      const external = /^https?:\/\//.test(link[2]);
      return <a key={index} href={link[2]} {...(external ? { target: "_blank", rel: "noreferrer" } : {})}>{link[1]}{external ? " ↗" : ""}</a>;
    }
    return <Fragment key={index}>{part}</Fragment>;
  });
}

function TermsBlocks({ blocks }: { blocks: TermsBlock[] }) {
  return <>{blocks.map((block, index) => block.type === "paragraph"
    ? <p key={index}>{renderInline(block.text)}</p>
    : <ul key={index}>{block.items.map((item) => <li key={item}>{renderInline(item)}</li>)}</ul>
  )}</>;
}

function ContentsLinks() {
  return <nav aria-label="Terms of Use sections">{TERMS_OF_USE.sections.map((section) => (
    <a href={`#${sectionId(section.number, section.title)}`} key={section.number}>
      <span>{section.number}</span><span>{section.title}</span>
    </a>
  ))}</nav>;
}

export default function TermsOfUsePage() {
  return <>
    <main className="terms-page">
      <header className="industry-header terms-header">
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

      <header className="terms-hero">
        <div className="terms-shell">
          <nav className="terms-breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link><span>/</span><span>Legal</span><span>/</span><span aria-current="page">Terms of Use</span>
          </nav>
          <div className="terms-hero__layout">
            <div className="terms-hero__content">
              <p className="terms-eyebrow">LEGAL · WEBSITE TERMS</p>
              <h1>{TERMS_OF_USE.title}</h1>
              <p className="terms-subtitle">{TERMS_OF_USE.subtitle}</p>
              <div className="terms-dates">
                <span>EFFECTIVE {TERMS_OF_USE.effectiveDate.toUpperCase()}</span>
                <span>LAST UPDATED {TERMS_OF_USE.lastUpdated.toUpperCase()}</span>
              </div>
            </div>
            <span className="terms-hero__number" aria-hidden="true">02</span>
          </div>
        </div>
      </header>

      <div className="terms-content-surface">
        <div className="terms-shell terms-layout">
          <aside className="terms-toc"><h2>ON THIS PAGE</h2><ContentsLinks /></aside>
          <article className="terms-document">
            <details className="terms-toc-mobile"><summary>ON THIS PAGE <span aria-hidden="true">+</span></summary><ContentsLinks /></details>
            <section className="terms-plain" aria-labelledby="plain-language-heading">
              <h2 id="plain-language-heading">IN PLAIN LANGUAGE</h2>
              <TermsBlocks blocks={TERMS_OF_USE.plainLanguage} />
            </section>
            {TERMS_OF_USE.sections.map((section) => (
              <section className={`terms-section${section.number === "15" ? " terms-section--contact" : ""}`} id={sectionId(section.number, section.title)} key={section.number}>
                <span className="terms-section__number" aria-hidden="true">{section.number}</span>
                <div className="terms-section__body"><h2>{section.title}</h2><TermsBlocks blocks={section.blocks} /></div>
              </section>
            ))}
          </article>
        </div>
      </div>
    </main>
    <SiteFooter />
    <style>{TERMS_STYLES}</style>
  </>;
}

const TERMS_STYLES = `
  .terms-page {
    --orange: #ef4d00;
    --graphite: #111111;
    --titanium: #f3f1ec;
    --content-gray: #f6f6f4;
    --muted: #6c6a66;
    --rule: #d6d2ca;
    color: var(--graphite);
    font-family: var(--font-neue-haas-text, "Neue Haas Grotesk Text Pro"), "Helvetica Neue", Arial, sans-serif;
  }

  /* Tint modifier for the shared .industry-header shell, matching this
     page's own titanium/graphite palette -- same pattern as
     .privacy-header/.resource-header/.company-header. */
  .terms-header {
    background: #fff !important;
    border-color: var(--rule) !important;
    position: relative;
    z-index: 20;
  }

  .terms-header a,
  .terms-header button,
  .terms-header .wordmark span,
  .terms-header .wordmark small {
    color: var(--graphite) !important;
  }

  .terms-header nav a {
    opacity: 0.65;
  }

  .terms-header nav a:hover {
    opacity: 1;
  }

  .terms-shell { width: min(100%, 1500px); margin-inline: auto; padding-inline: clamp(24px, 4vw, 72px); }
  .terms-hero { min-height: 405px; padding-top: clamp(32px, 4vw, 58px); display: grid; background: var(--titanium); }
  .terms-breadcrumb { display: flex; flex-wrap: wrap; gap: 9px; color: var(--muted); font-size: 12px; }
  .terms-breadcrumb a { color: inherit; text-decoration: none; }
  .terms-hero__layout { min-height: 315px; display: grid; grid-template-columns: minmax(0, 2.2fr) minmax(190px, .75fr); align-items: center; gap: 50px; }
  .terms-eyebrow { margin: 0; color: var(--orange); font-size: 12px; font-weight: 600; letter-spacing: .075em; }
  .terms-hero h1 { margin: 20px 0 16px; font-family: var(--font-neue-haas-display, "Neue Haas Grotesk Display Pro"), "Helvetica Neue", Arial, sans-serif; font-size: clamp(62px, 6.8vw, 108px); font-weight: 350; line-height: .96; letter-spacing: -.055em; }
  .terms-subtitle { max-width: 720px; margin: 0; color: var(--muted); font-size: clamp(17px, 1.45vw, 23px); line-height: 1.5; }
  .terms-dates { display: flex; flex-wrap: wrap; gap: 18px 50px; margin-top: 34px; font-size: 11px; font-weight: 600; letter-spacing: .08em; }
  .terms-hero__number { justify-self: end; color: #e2dfd8; font-family: var(--font-neue-haas-display, "Neue Haas Grotesk Display Pro"), "Helvetica Neue", Arial, sans-serif; font-size: clamp(150px, 17vw, 270px); font-weight: 250; line-height: .8; letter-spacing: -.08em; }
  .terms-content-surface { background: var(--content-gray); }
  .terms-layout { display: grid; grid-template-columns: minmax(210px, .78fr) minmax(0, 2.4fr); gap: clamp(44px, 6vw, 110px); padding-top: 64px; padding-bottom: 88px; }
  .terms-toc { align-self: start; position: sticky; top: 104px; padding-right: 30px; border-right: 1px solid var(--rule); }
  .terms-toc h2, .terms-toc-mobile summary, .terms-plain > h2 { margin: 0; font-size: 11px; font-weight: 600; letter-spacing: .065em; }
  .terms-toc nav, .terms-toc-mobile nav { display: grid; gap: 14px; margin-top: 28px; }
  .terms-toc a, .terms-toc-mobile a { display: grid; grid-template-columns: 27px 1fr; gap: 8px; color: var(--muted); font-size: 12px; line-height: 1.35; text-decoration: none; }
  .terms-toc a > span:first-child, .terms-toc-mobile a > span:first-child { color: var(--orange); }
  .terms-toc a:hover, .terms-toc-mobile a:hover { color: var(--graphite); }
  .terms-document { width: min(100%, 890px); }
  .terms-toc-mobile { display: none; }
  .terms-plain { margin-bottom: 58px; padding: 4px 0 4px 28px; border-left: 2px solid var(--orange); }
  .terms-plain > h2 { margin-bottom: 18px; }
  .terms-plain p { margin: 0 0 14px; color: #333230; font-size: 17px; line-height: 1.66; }
  .terms-plain p:last-child { margin-bottom: 0; }
  .terms-section { scroll-margin-top: 105px; display: grid; grid-template-columns: 42px minmax(0, 1fr); gap: 18px; padding: 31px 0; border-top: 1px solid var(--rule); }
  .terms-section__number { padding-top: 5px; color: var(--orange); font-size: 13px; font-weight: 600; }
  .terms-section__body h2 { margin: 0 0 18px; font-family: var(--font-neue-haas-display, "Neue Haas Grotesk Display Pro"), "Helvetica Neue", Arial, sans-serif; font-size: clamp(26px, 2.15vw, 35px); font-weight: 500; line-height: 1.12; letter-spacing: -.025em; }
  .terms-section__body p, .terms-section__body li { color: #45433f; font-size: 16px; line-height: 1.7; }
  .terms-section__body p { margin: 0 0 17px; }
  .terms-section__body ul { display: grid; gap: 9px; margin: 12px 0 22px; padding-left: 20px; }
  .terms-section__body li::marker { color: var(--orange); }
  .terms-section__body a { color: inherit; text-decoration-color: var(--orange); text-underline-offset: 3px; }
  .terms-section--contact { margin-top: 32px; padding: 34px; grid-template-columns: 42px minmax(0, 1fr); border: 0; background: var(--graphite); color: #fff; }
  .terms-section--contact .terms-section__body h2, .terms-section--contact .terms-section__body p, .terms-section--contact .terms-section__body a { color: #fff; }
  .terms-section--contact .terms-section__body a { display: inline-block; margin-top: 6px; padding: 12px 16px; background: #fff; color: var(--graphite); text-decoration: none; }
  @media (max-width: 900px) {
    .terms-hero__layout { grid-template-columns: minmax(0, 1fr) 150px; }
    .terms-layout { grid-template-columns: 180px minmax(0, 1fr); gap: 40px; }
  }
  @media (max-width: 700px) {
    .terms-shell { padding-inline: 20px; }
    .terms-hero { min-height: 430px; padding-top: 27px; }
    .terms-hero__layout { position: relative; grid-template-columns: 1fr; min-height: 350px; }
    .terms-hero__content { position: relative; z-index: 1; }
    .terms-hero h1 { font-size: clamp(56px, 17vw, 78px); }
    .terms-hero__number { position: absolute; right: 0; top: 25px; opacity: .7; font-size: 150px; }
    .terms-dates { display: grid; gap: 10px; margin-top: 28px; }
    .terms-layout { display: block; padding-top: 34px; padding-bottom: 54px; }
    .terms-toc { display: none; }
    .terms-toc-mobile { display: block; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 1px solid var(--rule); }
    .terms-toc-mobile summary { display: flex; justify-content: space-between; cursor: pointer; list-style: none; }
    .terms-toc-mobile summary::-webkit-details-marker { display: none; }
    .terms-plain { padding-left: 20px; }
    .terms-section { grid-template-columns: 32px minmax(0, 1fr); gap: 10px; }
    .terms-section__body p, .terms-section__body li { font-size: 15.5px; }
    .terms-section--contact { margin-inline: -20px; padding: 28px 20px; }
  }
`;
