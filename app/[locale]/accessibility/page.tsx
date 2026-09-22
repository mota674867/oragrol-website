// Nav bar (2026-09-06): GPT's own placement comment assumed "the existing
// site layout" renders the approved global nav above this page automatically
// -- it doesn't, on this site's architecture (redesigned routes render only
// their own page content + the global ChatWidget; see site-chrome.tsx). Added
// the same `industry-header` shell used by Privacy Policy/Terms of Use/
// Resources/Company/Industries/Contact, above the existing breadcrumb, which
// stays put beneath it. Accessibility is deliberately not one of that nav's
// links -- it stays reachable only through the footer's Legal column, same
// as the other two legal pages.
//
// Bilingual (Phase 2l, ORAGROL_Legal_Pages_FR_Translation.md): same
// conversion as privacy-policy/page.tsx and terms-of-use/page.tsx -- async
// Server Component, locale from `params`, content from
// `getAccessibilityStatement(locale)` (see that content file's own header
// comment), locale-aware header/breadcrumb/language-toggle/contact-card
// links, and `renderInline`'s new `isFr` param to prefix internal body
// links.

import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { Fragment, type ReactNode } from "react";
import SiteFooter from "@/app/components/site/footer";
import OragrolMegaNav from "@/app/components/site/oragrol-mega-nav";
import { NAV_ITEMS } from "@/app/components/site/nav-items";
import { languageAlternates } from "@/app/lib/seo";
import "@/app/gpt-pages.css";
import {
  getAccessibilityStatement,
  type AccessibilityBlock,
  type AccessibilityStatementContent,
} from "./ORAGROL_AccessibilityContent";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isFr = locale === "fr";
  const canonicalPath = isFr ? "/fr/accessibility" : "/accessibility";

  return {
    title: isFr ? "Déclaration d'accessibilité | ORAGROL Global" : "Accessibility Statement | ORAGROL Global",
    description: isFr
      ? "L'engagement d'ORAGROL Global envers un site Web accessible et inclusif."
      : "ORAGROL Global's commitment to an accessible and inclusive website.",
    alternates: {
      canonical: canonicalPath,
      languages: languageAlternates("/accessibility"),
    },
    robots: { index: true, follow: true },
    openGraph: {
      title: isFr ? "Déclaration d'accessibilité | ORAGROL Global" : "Accessibility Statement | ORAGROL Global",
      description: isFr
        ? "L'engagement d'ORAGROL Global envers un site Web accessible et inclusif."
        : "ORAGROL Global's commitment to an accessible and inclusive website.",
      url: canonicalPath,
      siteName: "ORAGROL Global",
      locale: isFr ? "fr_CA" : "en_CA",
      alternateLocale: isFr ? "en_CA" : "fr_CA",
      type: "website",
    },
  };
}

function sectionId(number: string, title: string) {
  return `${number}-${title}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function renderInline(text: string, isFr: boolean): ReactNode[] {
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\)|  \n)/g;
  return text.split(pattern).filter(Boolean).map((part, index) => {
    if (part === "  \n") return <br key={index} />;
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={index}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.endsWith("*")) return <em key={index}>{part.slice(1, -1)}</em>;

    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      const external = /^https?:\/\//.test(link[2]);
      const href = external ? link[2] : isFr ? `/fr${link[2]}` : link[2];
      return <a key={index} href={href} {...(external ? { target: "_blank", rel: "noreferrer" } : {})}>{link[1]}{external ? " ↗" : ""}</a>;
    }
    return <Fragment key={index}>{part}</Fragment>;
  });
}

function AccessibilityBlocks({ blocks, isFr }: { blocks: AccessibilityBlock[]; isFr: boolean }) {
  return <>{blocks.map((block, index) => block.type === "paragraph"
    ? <p key={index}>{renderInline(block.text, isFr)}</p>
    : <ul key={index}>{block.items.map((item) => <li key={item}>{renderInline(item, isFr)}</li>)}</ul>
  )}</>;
}

function ContentsLinks({ content, label }: { content: AccessibilityStatementContent; label: string }) {
  return <nav aria-label={label}>{content.sections.map((section) => (
    <a href={`#${sectionId(section.number, section.title)}`} key={section.number}>
      <span>{section.number}</span><span>{section.title}</span>
    </a>
  ))}</nav>;
}

export default async function AccessibilityPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isFr = locale === "fr";
  const otherLocale = isFr ? "en" : "fr";
  const content = getAccessibilityStatement(locale);
  const tocLabel = isFr ? "Sections de la Déclaration d'accessibilité" : "Accessibility Statement sections";
  const contactHref = isFr ? `/fr${content.contact.href}` : content.contact.href;

  return <>
    <main className="accessibility-page">
      <header className="industry-header accessibility-header">
        <Link className="wordmark" href="/">
          <span>ORAGROL</span>
          <small>GLOBAL</small>
        </Link>
        <OragrolMegaNav items={NAV_ITEMS} />
        <div>
          <button className="search" aria-label={isFr ? "Recherche" : "Search"}>
            <span />
          </button>
          <Link
            className="language"
            href="/accessibility"
            locale={otherLocale}
            aria-label={isFr ? "Changer de langue" : "Change language"}
          >
            {locale.toUpperCase()} / {otherLocale.toUpperCase()}
          </Link>
        </div>
      </header>

      <header className="accessibility-hero">
        <div className="accessibility-shell">
          <nav className="accessibility-breadcrumb" aria-label="Breadcrumb">
            <Link href="/">{isFr ? "Accueil" : "Home"}</Link><span>/</span><span>{isFr ? "Mentions légales" : "Legal"}</span><span>/</span><span aria-current="page">{content.title}</span>
          </nav>
          <div className="accessibility-hero__layout">
            <div className="accessibility-hero__content">
              <p className="accessibility-eyebrow">{isFr ? "MENTIONS LÉGALES · ACCESSIBILITÉ" : "LEGAL · ACCESSIBILITY"}</p>
              <h1>{content.title}</h1>
              <p className="accessibility-subtitle">{content.subtitle}</p>
              <div className="accessibility-dates">
                <span>{(isFr ? "EN VIGUEUR DEPUIS LE " : "EFFECTIVE ") + content.effectiveDate.toUpperCase()}</span>
                <span>{(isFr ? "DERNIÈRE MISE À JOUR LE " : "LAST UPDATED ") + content.lastUpdated.toUpperCase()}</span>
              </div>
            </div>
            <span className="accessibility-hero__number" aria-hidden="true">03</span>
          </div>
        </div>
      </header>

      <div className="accessibility-content-surface">
        <div className="accessibility-shell accessibility-layout">
          <aside className="accessibility-toc"><h2>{isFr ? "SUR CETTE PAGE" : "ON THIS PAGE"}</h2><ContentsLinks content={content} label={tocLabel} /></aside>
          <article className="accessibility-document">
            <details className="accessibility-toc-mobile"><summary>{isFr ? "SUR CETTE PAGE" : "ON THIS PAGE"} <span aria-hidden="true">+</span></summary><ContentsLinks content={content} label={tocLabel} /></details>
            <section className="accessibility-plain" aria-labelledby="plain-language-heading">
              <h2 id="plain-language-heading">{isFr ? "EN LANGAGE SIMPLE" : "IN PLAIN LANGUAGE"}</h2>
              <AccessibilityBlocks blocks={content.plainLanguage} isFr={isFr} />
            </section>
            {content.sections.map((section) => (
              <section className="accessibility-section" id={sectionId(section.number, section.title)} key={section.number}>
                <span className="accessibility-section__number" aria-hidden="true">{section.number}</span>
                <div className="accessibility-section__body"><h2>{section.title}</h2><AccessibilityBlocks blocks={section.blocks} isFr={isFr} /></div>
              </section>
            ))}
            <section className="accessibility-contact-card" aria-labelledby="accessibility-contact-heading">
              <h2 id="accessibility-contact-heading">{content.contact.heading}</h2>
              <p>{content.contact.description}</p>
              <p className="accessibility-contact-card__location">{content.contact.location}</p>
              <a href={contactHref}>{content.contact.linkLabel} <span aria-hidden="true">↗</span></a>
            </section>
          </article>
        </div>
      </div>
    </main>
    <SiteFooter />
    <style>{ACCESSIBILITY_STYLES}</style>
  </>;
}

const ACCESSIBILITY_STYLES = `
  .accessibility-page {
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
     .privacy-header/.terms-header/.resource-header. */
  .accessibility-header {
    background: #fff !important;
    border-color: var(--rule) !important;
    position: relative;
    z-index: 20;
  }

  .accessibility-header a,
  .accessibility-header button,
  .accessibility-header .wordmark span,
  .accessibility-header .wordmark small {
    color: var(--graphite) !important;
  }

  .accessibility-header nav a {
    opacity: 0.65;
  }

  .accessibility-header nav a:hover {
    opacity: 1;
  }

  .accessibility-shell { width: min(100%, 1500px); margin-inline: auto; padding-inline: clamp(24px, 4vw, 72px); }
  .accessibility-hero { min-height: 405px; padding-top: clamp(32px, 4vw, 58px); display: grid; background: var(--titanium); }
  .accessibility-breadcrumb { display: flex; flex-wrap: wrap; gap: 9px; color: var(--muted); font-size: 12px; }
  .accessibility-breadcrumb a { color: inherit; text-decoration: none; }
  .accessibility-hero__layout { min-height: 315px; display: grid; grid-template-columns: minmax(0, 2.2fr) minmax(190px, .75fr); align-items: center; gap: 50px; }
  .accessibility-eyebrow { margin: 0; color: var(--orange); font-size: 12px; font-weight: 600; letter-spacing: .075em; }
  .accessibility-hero h1 { margin: 20px 0 16px; font-family: var(--font-neue-haas-display, "Neue Haas Grotesk Display Pro"), "Helvetica Neue", Arial, sans-serif; font-size: clamp(62px, 6.8vw, 108px); font-weight: 350; line-height: .96; letter-spacing: -.055em; }
  .accessibility-subtitle { max-width: 720px; margin: 0; color: var(--muted); font-size: clamp(17px, 1.45vw, 23px); line-height: 1.5; }
  .accessibility-dates { display: flex; flex-wrap: wrap; gap: 18px 50px; margin-top: 34px; font-size: 11px; font-weight: 600; letter-spacing: .08em; }
  .accessibility-hero__number { justify-self: end; color: #e2dfd8; font-family: var(--font-neue-haas-display, "Neue Haas Grotesk Display Pro"), "Helvetica Neue", Arial, sans-serif; font-size: clamp(150px, 17vw, 270px); font-weight: 250; line-height: .8; letter-spacing: -.08em; }
  .accessibility-content-surface { background: var(--content-gray); }
  .accessibility-layout { display: grid; grid-template-columns: minmax(210px, .78fr) minmax(0, 2.4fr); gap: clamp(44px, 6vw, 110px); padding-top: 64px; padding-bottom: 88px; }
  .accessibility-toc { align-self: start; position: sticky; top: 104px; padding-right: 30px; border-right: 1px solid var(--rule); }
  .accessibility-toc h2, .accessibility-toc-mobile summary, .accessibility-plain > h2 { margin: 0; font-size: 11px; font-weight: 600; letter-spacing: .065em; }
  .accessibility-toc nav, .accessibility-toc-mobile nav { display: grid; gap: 14px; margin-top: 28px; }
  .accessibility-toc a, .accessibility-toc-mobile a { display: grid; grid-template-columns: 27px 1fr; gap: 8px; color: var(--muted); font-size: 12px; line-height: 1.35; text-decoration: none; }
  .accessibility-toc a > span:first-child, .accessibility-toc-mobile a > span:first-child { color: var(--orange); }
  .accessibility-toc a:hover, .accessibility-toc-mobile a:hover { color: var(--graphite); }
  .accessibility-document { width: min(100%, 890px); }
  .accessibility-toc-mobile { display: none; }
  .accessibility-plain { margin-bottom: 58px; padding: 4px 0 4px 28px; border-left: 2px solid var(--orange); }
  .accessibility-plain > h2 { margin-bottom: 18px; }
  .accessibility-plain p { margin: 0 0 14px; color: #333230; font-size: 17px; line-height: 1.66; }
  .accessibility-plain p:last-child { margin-bottom: 0; }
  .accessibility-section { scroll-margin-top: 105px; display: grid; grid-template-columns: 42px minmax(0, 1fr); gap: 18px; padding: 31px 0; border-top: 1px solid var(--rule); }
  .accessibility-section__number { padding-top: 5px; color: var(--orange); font-size: 13px; font-weight: 600; }
  .accessibility-section__body h2 { margin: 0 0 18px; font-family: var(--font-neue-haas-display, "Neue Haas Grotesk Display Pro"), "Helvetica Neue", Arial, sans-serif; font-size: clamp(26px, 2.15vw, 35px); font-weight: 500; line-height: 1.12; letter-spacing: -.025em; }
  .accessibility-section__body p, .accessibility-section__body li { color: #45433f; font-size: 16px; line-height: 1.7; }
  .accessibility-section__body p { margin: 0 0 17px; }
  .accessibility-section__body ul { display: grid; gap: 9px; margin: 12px 0 22px; padding-left: 20px; }
  .accessibility-section__body li::marker { color: var(--orange); }
  .accessibility-section__body a { color: inherit; text-decoration-color: var(--orange); text-underline-offset: 3px; }
  .accessibility-contact-card { margin-top: 32px; padding: 34px; background: var(--graphite); color: #fff; }
  .accessibility-contact-card h2 { margin: 0 0 12px; font-size: 13px; font-weight: 600; letter-spacing: .055em; text-transform: uppercase; }
  .accessibility-contact-card p { max-width: 720px; margin: 0 0 12px; color: #d4d4d4; font-size: 15px; line-height: 1.55; }
  .accessibility-contact-card .accessibility-contact-card__location { color: #929292; font-size: 12px; }
  .accessibility-contact-card a { display: inline-block; margin-top: 7px; padding: 12px 16px; background: #fff; color: var(--graphite); text-decoration: none; }
  @media (max-width: 900px) {
    .accessibility-hero__layout { grid-template-columns: minmax(0, 1fr) 150px; }
    .accessibility-layout { grid-template-columns: 180px minmax(0, 1fr); gap: 40px; }
  }
  @media (max-width: 700px) {
    .accessibility-shell { padding-inline: 20px; }
    .accessibility-hero { min-height: 430px; padding-top: 27px; }
    .accessibility-hero__layout { position: relative; grid-template-columns: 1fr; min-height: 350px; }
    .accessibility-hero__content { position: relative; z-index: 1; }
    .accessibility-hero h1 { font-size: clamp(56px, 17vw, 78px); }
    .accessibility-hero__number { position: absolute; right: 0; top: 25px; opacity: .7; font-size: 150px; }
    .accessibility-dates { display: grid; gap: 10px; margin-top: 28px; }
    .accessibility-layout { display: block; padding-top: 34px; padding-bottom: 54px; }
    .accessibility-toc { display: none; }
    .accessibility-toc-mobile { display: block; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 1px solid var(--rule); }
    .accessibility-toc-mobile summary { display: flex; justify-content: space-between; cursor: pointer; list-style: none; }
    .accessibility-toc-mobile summary::-webkit-details-marker { display: none; }
    .accessibility-plain { padding-left: 20px; }
    .accessibility-section { grid-template-columns: 32px minmax(0, 1fr); gap: 10px; }
    .accessibility-section__body p, .accessibility-section__body li { font-size: 15.5px; }
    .accessibility-contact-card { margin-inline: -20px; padding: 28px 20px; }
  }
`;
