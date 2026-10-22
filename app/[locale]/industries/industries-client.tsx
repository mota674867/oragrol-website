"use client";
import { KeyboardEvent, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import PreFooterCta from "@/app/components/site/pre-footer-cta";
import SiteFooter from "@/app/components/site/footer";
import OragrolMegaNav from "@/app/components/site/oragrol-mega-nav";
import UtilityBar from "@/app/components/site/utility-bar";
import { NAV_ITEMS } from "@/app/components/site/nav-items";
import "@/app/gpt-pages.css";
import "./industries-explorer.css";
import { HeaderLogo } from "@/app/components/brand/header-logo";

/**
 * Bilingual (D-086, Task #21): rewired to consume the `Industries`
 * namespace in messages/{en,fr}.json — same pattern as the other pages.
 *
 * `industryIds` below reuses the exact 9 camelCase keys already
 * established for Home.industries.list (professionalServices, healthcare,
 * financialServices, retail, manufacturing, technology, construction,
 * education, otherSmbs) so the same industry is addressed the same way
 * everywhere on the site. Each industry's `jobs` reference one of 5
 * canonical `jobKind`s (sales-flow / customer-support /
 * operational-intelligence / managed-it / customer-growth — the same ids
 * Business Automation uses) resolved through this namespace's own
 * `jobShortNames`, kept self-contained rather than cross-referencing the
 * BusinessAutomation namespace.
 *
 * Dropped (not translated) rather than carried forward: the original
 * `categories`, `path`, `cta`, `href` and `secondary` fields on each
 * industry. Confirmed via grep that none of them were ever read anywhere
 * in this component — dead data from an earlier design, not something
 * currently rendered — so there was nothing to translate.
 *
 * `industry-details.ts` (the "Risk and Canadian context / Protect /
 * Automate / FAQ" accordion content) is NO LONGER imported here — its
 * full content (context, protect bullets, automate bullets, question,
 * answer) was translated into `messages.Industries.list.*.detail`
 * instead, since the approved translation doc actually covers it. The
 * standalone .ts file is left in place, untouched, as the English
 * reference the messages content was transcribed from — not wired into
 * this component anymore, same "leave the old English source alone"
 * approach as other pages' now-superseded data modules.
 */

const industryIds = [
  "professionalServices",
  "healthcare",
  "financialServices",
  "retail",
  "manufacturing",
  "technology",
  "construction",
  "education",
  "otherSmbs",
] as const;
type JobKind = "sales-flow" | "customer-support" | "operational-intelligence" | "managed-it" | "customer-growth";

function IndustriesClient() {
  const t = useTranslations("Industries");
  const locale = useLocale();
  const otherLocale = locale === "fr" ? "en" : "fr";
  const pathname = usePathname();
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const industryId = industryIds[active];
  const risks = t.raw(`list.${industryId}.risks`) as string[];
  const jobs = t.raw(`list.${industryId}.jobs`) as { jobKind: JobKind; why: string }[];
  const detailProtect = t.raw(`list.${industryId}.detail.protect`) as string[];
  const detailAutomate = t.raw(`list.${industryId}.detail.automate`) as string[];

  // Deep-link support for the nav dropdown's per-industry links
  // (/industries#industry-tab-N) — selects the matching industry on load.
  // Deliberately an effect, not a lazy useState initializer: window.location
  // isn't available during SSR, and computing this eagerly on the client's
  // first render would mismatch the server-rendered markup. Running it
  // post-mount, after hydration, is the correct pattern here.
  useEffect(() => {
    const match = window.location.hash.match(/^#industry-tab-(\d+)$/);
    if (!match) return;
    const index = Number(match[1]);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- see comment above
    if (index >= 0 && index < industryIds.length) setActive(index);
  }, []);
  // On phones and tablets the industry list is a horizontal rail: keep the
  // selected industry visible by scrolling the rail only (never the page).
  useEffect(() => {
    const rail = listRef.current;
    if (!rail || rail.scrollWidth <= rail.clientWidth) return;
    const tab = rail.children[active] as HTMLElement | undefined;
    if (!tab) return;
    rail.scrollTo({ left: tab.offsetLeft - (rail.clientWidth - tab.offsetWidth) / 2, behavior: "smooth" });
  }, [active]);
  const move = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft"].includes(e.key))
      return;
    e.preventDefault();
    const d = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : -1;
    const next = (active + d + industryIds.length) % industryIds.length;
    setActive(next);
    document.getElementById(`industry-tab-${next}`)?.focus();
  };
  return (
    <>
    <UtilityBar />
    <main className="ind-premium-page">
      <header className="industry-header">
        <HeaderLogo tone="dark-bg" />
        <OragrolMegaNav items={NAV_ITEMS} activePath={pathname} />
        <div>
          <Link href="/cyber-health">{t("nav.getCyberHealthScore")}</Link>
          <button className="search" aria-label={t("nav.search")}>
            <span />
          </button>
        </div>
      </header>

      <section className="ind-hero ind-hero-clean">
        <div className="ind-centred-or" aria-hidden="true">
          OR
        </div>
        <div className="ind-hero-copy">
          <p>{t("hero.eyebrow")}</p>
          <h1>
            {t("hero.title1")}
            <br />
            <span>{t("hero.title2")}</span>
          </h1>
          <p>{t("hero.sub")}</p>
          <div className="ind-hero-pillars" aria-label={t("hero.pillarsAriaLabel")}>
            <span><b aria-hidden="true">01</b>{t("hero.pillarProtect")}</span>
            <span><b aria-hidden="true">02</b>{t("hero.pillarAutomate")}</span>
            <span><b aria-hidden="true">03</b>{t("hero.pillarUnify")}</span>
          </div>
          <span className="ind-hero-line" aria-hidden="true" />
          <a className="ind-hero-cta" href="#industry-index">
            {t("hero.chooseIndustry")} <span>↓</span>
          </a>
        </div>
      </section>

      {/* Industry explorer (redesign 2026-10-22, D-120): one compact section
          replaces the ring navigator, the ribbon journey, the evidence bar and
          the separate detail section. Same content and translation keys. */}
      <section className="indx" id="industry-index" aria-labelledby="indx-title">
        <div className="indx-inner">
          <nav className="indx-index" aria-labelledby="indx-title">
            <p className="indx-eyebrow">{t("navigator.eyebrow")}</p>
            <h2 id="indx-title" className="indx-index-title">{t("hero.chooseIndustry")}.</h2>
            <div
              className="indx-list"
              role="tablist"
              aria-label={t("navigator.ringAriaLabel")}
              onKeyDown={move}
              ref={listRef}
            >
              {industryIds.map((id, i) => (
                <button
                  id={`industry-tab-${i}`}
                  role="tab"
                  type="button"
                  aria-selected={active === i}
                  aria-controls="industry-journey"
                  tabIndex={active === i ? 0 : -1}
                  className={`indx-tab${active === i ? " is-active" : ""}`}
                  onClick={() => setActive(i)}
                  key={id}
                >
                  <span className="indx-tab-num" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                  <span className="indx-tab-name">{t(`list.${id}.name`)}</span>
                  <span className="indx-tab-arrow" aria-hidden="true">→</span>
                </button>
              ))}
            </div>
          </nav>

          <div
            className="indx-panel"
            id="industry-journey"
            role="tabpanel"
            aria-labelledby={`industry-tab-${active}`}
            tabIndex={0}
          >
            <div className="indx-fade" key={industryId}>
              <header className="indx-head">
                <p className="indx-sub">{t(`list.${industryId}.subBrand`)}</p>
                <h3 className="indx-name">{t(`list.${industryId}.name`)}</h3>
                <div className="indx-reality">
                  <h4>{t("editorial.heading")}</h4>
                  <p>{t(`list.${industryId}.overview`)}</p>
                </div>
              </header>

              <div className="indx-path">
                <p className="indx-path-label">{t("journey.eyebrow")}</p>
                <ol className="indx-steps">
                  <li className="indx-step">
                    <span className="indx-node" aria-hidden="true" />
                    <p className="indx-step-label">{t("journey.protectLabel")}</p>
                    <h5>{t("journey.protectHeading")}</h5>
                    <ul className="indx-risks">
                      {risks.slice(0, 3).map((x) => <li key={x}>{x}</li>)}
                    </ul>
                    <p className="indx-note">{(t.raw(`list.${industryId}.priorities`) as string[]).slice(0, 2).join(" · ")}</p>
                  </li>
                  <li className="indx-step">
                    <span className="indx-node" aria-hidden="true" />
                    <p className="indx-step-label">{t("journey.automateLabel")}</p>
                    <h5>{t("journey.automateHeading")}</h5>
                    <dl className="indx-jobs">
                      {jobs.map((job) => (
                        <div key={job.jobKind}>
                          <dt>{t(`jobShortNames.${job.jobKind}`)}</dt>
                          <dd>{job.why}</dd>
                        </div>
                      ))}
                    </dl>
                  </li>
                  <li className="indx-step">
                    <span className="indx-node" aria-hidden="true" />
                    <p className="indx-step-label">{t("journey.unifyLabel")}</p>
                    <h5>{t("journey.unifyHeading")}</h5>
                    <p className="indx-unify">{t(`list.${industryId}.unify`)}</p>
                    <Link className="indx-link" href="/or-one">
                      {t("journey.unifyCta")} <span aria-hidden="true">→</span>
                    </Link>
                  </li>
                </ol>
              </div>

              {active === 0 && (
                <details className="indx-evidence">
                  <summary>
                    <span>{t("evidence.labelPrefix")}</span>
                    <b>{t("evidence.openDrawer")}</b>
                  </summary>
                  <div className="indx-stats">
                    <article>
                      <strong>{t("evidence.stat1.value")}</strong>
                      <p>
                        {t("evidence.stat1.prefix")}
                        <code>p=reject</code>
                        {t("evidence.stat1.suffix")}
                      </p>
                      <a href="https://powerdmarc.com/canada-dmarc-adoption/" target="_blank" rel="noopener noreferrer">
                        {t("evidence.stat1Source")} ↗︎
                      </a>
                    </article>
                    <article>
                      <strong>{t("evidence.stat2.value")}</strong>
                      <p>{t("evidence.stat2.prefix")}</p>
                      <a href="https://www.rcmp.ca/en/federal-policing/cybercrime/cyber-features/business-email-compromise" target="_blank" rel="noopener noreferrer">
                        {t("evidence.stat2Source")} ↗︎
                      </a>
                    </article>
                    <article>
                      <strong>{t("evidence.stat3.value")}</strong>
                      <p>{t("evidence.stat3.prefix")}</p>
                      <a href="https://www.priv.gc.ca/en/privacy-topics/business-privacy/breaches-and-safeguards/privacy-breaches-at-your-business/gd_pb_201810/" target="_blank" rel="noopener noreferrer">
                        {t("evidence.stat3Source")} ↗︎
                      </a>
                    </article>
                  </div>
                  <p className="indx-evidence-note">{t("evidence.disclaimer")}</p>
                </details>
              )}

              <div className="indx-detail" aria-label={`${t(`list.${industryId}.name`)} ${t("fullProfile.detailsAriaSuffix")}`}>
                <div className="indx-detail-head">
                  <h4>{t("fullProfile.heading")}</h4>
                  <p>{t("fullProfile.sub")}</p>
                </div>
                <div className="indx-acc">
                  <details name="industry-detail" open>
                    <summary>{t("fullProfile.accordionRisk")}<span aria-hidden="true" /></summary>
                    <p>{t(`list.${industryId}.detail.context`)}</p>
                  </details>
                  <details name="industry-detail">
                    <summary>{t("fullProfile.accordionProtect")}<span aria-hidden="true" /></summary>
                    <ul>{detailProtect.map((item) => <li key={item}>{item}</li>)}</ul>
                  </details>
                  <details name="industry-detail">
                    <summary>{t("fullProfile.accordionAutomate")}<span aria-hidden="true" /></summary>
                    <ul>{detailAutomate.map((item) => <li key={item}>{item}</li>)}</ul>
                  </details>
                  <details name="industry-detail">
                    <summary>{t("fullProfile.accordionUnify")}<span aria-hidden="true" /></summary>
                    <p>{t(`list.${industryId}.unify`)}</p>
                  </details>
                  <details name="industry-detail">
                    <summary>{t(`list.${industryId}.detail.question`)}<span aria-hidden="true" /></summary>
                    <p>{t(`list.${industryId}.detail.answer`)}</p>
                  </details>
                  <p className="indx-scope">{t("fullProfile.scopeNote")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PreFooterCta page="industries" />

      <SiteFooter/>
    </main>
    </>
  );
}

export default IndustriesClient;
