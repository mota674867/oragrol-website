"use client";
import { KeyboardEvent, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import PreFooterCta from "@/app/components/site/pre-footer-cta";
import SiteFooter from "@/app/components/site/footer";
import OragrolMegaNav from "@/app/components/site/oragrol-mega-nav";
import UtilityBar from "@/app/components/site/utility-bar";
import { NAV_ITEMS } from "@/app/components/site/nav-items";
import "@/app/gpt-pages.css";

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
  const move = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft"].includes(e.key))
      return;
    e.preventDefault();
    const d = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : -1;
    setActive((active + d + industryIds.length) % industryIds.length);
  };
  return (
    <>
    <UtilityBar />
    <main className="ind-premium-page">
      <header className="industry-header">
        <Link className="wordmark" href="/">
          <span>ORAGROL</span>
          <small>GLOBAL</small>
        </Link>
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
            <span>{t("hero.pillarProtect")}</span>
            <span>{t("hero.pillarAutomate")}</span>
            <span>{t("hero.pillarUnify")}</span>
          </div>
          <a href="#industry-index">
            {t("hero.chooseIndustry")} <span>↓</span>
          </a>
        </div>
      </section>

      <section className="ind-navigator" id="industry-index">
        <div className="ind-ring-wrap">
          <p>{t("navigator.eyebrow")}</p>
          <div
            className="ind-ring"
            role="tablist"
            aria-label={t("navigator.ringAriaLabel")}
            onKeyDown={move}
          >
            {industryIds.map((id, i) => (
              <button
                id={`industry-tab-${i}`}
                role="tab"
                aria-selected={active === i}
                aria-controls="industry-journey"
                tabIndex={active === i ? 0 : -1}
                className={`ind-node ind-node-${i + 1} ${active === i ? "active" : ""}`}
                onClick={() => setActive(i)}
                aria-label={t(`list.${id}.name`)}
                key={id}
              >
                <i />
                <span>{String(i + 1).padStart(2, "0")}</span>
              </button>
            ))}
            <div className="ind-ring-centre">
              <small>{t("navigator.selectedLabel")}</small>
              <h2>{t(`list.${industryId}.name`)}</h2>
            </div>
          </div>
          <div className="ind-ring-key">
            {industryIds.map((id, i) => (
              <button
                className={active === i ? "active" : ""}
                onClick={() => setActive(i)}
                key={id}
              >
                {String(i + 1).padStart(2, "0")} · {t(`list.${id}.name`)}
              </button>
            ))}
          </div>
        </div>
        <article className="ind-editorial">
          <span>{t(`list.${industryId}.subBrand`)}</span>
          <h2>{t("editorial.heading")}</h2>
          <p>{t(`list.${industryId}.overview`)}</p>
          <a href="#industry-journey">
            {t("editorial.viewPath")} <b>↓</b>
          </a>
        </article>
      </section>

      <section
        className="ind-journey"
        id="industry-journey"
        role="tabpanel"
        aria-labelledby={`industry-tab-${active}`}
        aria-live="polite"
        key={industryId}
      >
        <div className="ind-journey-title">
          <span>{t("journey.eyebrow")}</span>
          <h2>{t(`list.${industryId}.name`)}</h2>
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
          <span>{t("journey.protectLabel")}</span>
          <h3>{t("journey.protectHeading")}</h3>
          {risks.slice(0, 3).map((x) => (
            <p key={x}>{x}</p>
          ))}
          <small>{(t.raw(`list.${industryId}.priorities`) as string[]).slice(0, 2).join(" · ")}</small>
        </article>
        <article className="ind-anchor ind-automate">
          <span>{t("journey.automateLabel")}</span>
          <h3>{t("journey.automateHeading")}</h3>
          {jobs.map((job) => (
            <div key={job.jobKind}>
              <h4>{t(`jobShortNames.${job.jobKind}`)}</h4>
              <p>{job.why}</p>
            </div>
          ))}
        </article>
        <article className="ind-anchor ind-unify">
          <span>{t("journey.unifyLabel")}</span>
          <h3>{t("journey.unifyHeading")}</h3>
          <p>{t(`list.${industryId}.unify`)}</p>
        </article>
      </section>

      {active === 0 && (
        <details className="ind-evidence">
          <summary>
            <span>{t("evidence.labelPrefix")}</span>
            <b>{t("evidence.openDrawer")}</b>
          </summary>
          <div>
            <article>
              <strong>{t("evidence.stat1.value")}</strong>
              <p>
                {t("evidence.stat1.prefix")}
                <code>p=reject</code>
                {t("evidence.stat1.suffix")}
              </p>
              <a href="https://powerdmarc.com/canada-dmarc-adoption/">
                {t("evidence.stat1Source")} ↗
              </a>
            </article>
            <article>
              <strong>{t("evidence.stat2.value")}</strong>
              <p>{t("evidence.stat2.prefix")}</p>
              <a href="https://www.rcmp.ca/en/federal-policing/cybercrime/cyber-features/business-email-compromise">
                {t("evidence.stat2Source")} ↗
              </a>
            </article>
            <article>
              <strong>{t("evidence.stat3.value")}</strong>
              <p>{t("evidence.stat3.prefix")}</p>
              <a href="https://www.priv.gc.ca/en/privacy-topics/business-privacy/breaches-and-safeguards/privacy-breaches-at-your-business/gd_pb_201810/">
                {t("evidence.stat3Source")} ↗
              </a>
            </article>
          </div>
          <p>{t("evidence.disclaimer")}</p>
        </details>
      )}

      <section className="ind-full-profile" aria-label={`${t(`list.${industryId}.name`)} ${t("fullProfile.detailsAriaSuffix")}`}>
        <div className="ind-full-heading">
          <span>{t("fullProfile.eyebrow")}</span>
          <h2>{t("fullProfile.heading")}</h2>
          <p>{t("fullProfile.sub")}</p>
        </div>
        <div className="ind-accordions">
          <details name="industry-detail">
            <summary>{t("fullProfile.accordionRisk")} <span>+</span></summary>
            <p>{t(`list.${industryId}.detail.context`)}</p>
          </details>
          <details name="industry-detail">
            <summary>{t("fullProfile.accordionProtect")} <span>+</span></summary>
            <ul>{detailProtect.map((item)=><li key={item}>{item}</li>)}</ul>
          </details>
          <details name="industry-detail">
            <summary>{t("fullProfile.accordionAutomate")} <span>+</span></summary>
            <ul>{detailAutomate.map((item)=><li key={item}>{item}</li>)}</ul>
          </details>
          <details name="industry-detail">
            <summary>{t("fullProfile.accordionUnify")} <span>+</span></summary>
            <p>{t(`list.${industryId}.unify`)}</p>
          </details>
          <details name="industry-detail">
            <summary>{t(`list.${industryId}.detail.question`)} <span>+</span></summary>
            <p>{t(`list.${industryId}.detail.answer`)}</p>
          </details>
        </div>
        <p className="ind-scope-note">{t("fullProfile.scopeNote")}</p>
      </section>

      <PreFooterCta page="industries" />

      <SiteFooter/>
    </main>
    </>
  );
}

export default IndustriesClient;
