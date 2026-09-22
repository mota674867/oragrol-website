"use client";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { ScopeTray, useScope } from "@/app/components/ScopeTray";
import PreFooterCta from "@/app/components/site/pre-footer-cta";
import SiteFooter from "@/app/components/site/footer";
import OragrolMegaNav from "@/app/components/site/oragrol-mega-nav";
import { NAV_ITEMS } from "@/app/components/site/nav-items";
import { DetailsDialog, type DetailsDialogLabels } from "@/app/components/DetailsDialog";
import "@/app/gpt-pages.css";

/**
 * Bilingual (D-086, Task #21): rewired to consume the `BusinessAutomation`
 * namespace in messages/{en,fr}.json instead of hardcoded English —
 * same pattern as home-client.tsx and services-client.tsx. The 6 jobs'
 * stable identity (id, index, build/monthly prices, tools-list) stays in
 * `jobIds`/`jobMeta` below; every display string is resolved through
 * `t()` at render time using that job's id as the key, so English and
 * French can never drift into different job orderings or prices.
 *
 * The DetailsDialog deep content (What's included / You stay in control
 * / Who it suits / Illustrative example) IS translated this pass —
 * unlike Services' still-deferred details accordion, the approved
 * translation doc (ORAGROL_BusinessAutomation_FR_Translation.md)
 * actually covers this content, so `messages.BusinessAutomation.details`
 * carries the full bilingual set and DetailsDialog's own chrome labels
 * (`detailsLabels`) are passed through too. See DetailsDialog.tsx's own
 * comment for why those labels are optional props defaulting to English
 * — this page is the first caller to actually pass translated ones.
 */

type JobId =
  | "sales-flow"
  | "customer-support"
  | "operational-intelligence"
  | "managed-it"
  | "customer-growth"
  | "tailored";

const jobIds: JobId[] = [
  "sales-flow",
  "customer-support",
  "operational-intelligence",
  "managed-it",
  "customer-growth",
  "tailored",
];

// Stable, language-neutral facts: index/build/monthly (currency-
// formatted at render time per locale) and which job has DetailsDialog
// content at all (all 6 do here).
const jobMeta: Record<JobId, { index: string; buildCAD: number; monthlyLabel: { en: string; fr: string } }> = {
  "sales-flow": { index: "01", buildCAD: 9500, monthlyLabel: { en: "$2,200/mo", fr: "2 200 $/mois" } },
  "customer-support": { index: "02", buildCAD: 7000, monthlyLabel: { en: "$2,800/mo", fr: "2 800 $/mois" } },
  "operational-intelligence": { index: "03", buildCAD: 7500, monthlyLabel: { en: "$3,500/mo", fr: "3 500 $/mois" } },
  "managed-it": {
    index: "04",
    buildCAD: 4000,
    monthlyLabel: { en: "$700/mo base + $110/user/mo", fr: "700 $/mois de base + 110 $/utilisateur/mois" },
  },
  "customer-growth": { index: "05", buildCAD: 7000, monthlyLabel: { en: "$4,500/mo", fr: "4 500 $/mois" } },
  tailored: { index: "06", buildCAD: 0, monthlyLabel: { en: "Confirmed after scoping", fr: "Confirmé après l'établissement de la portée" } },
};

const money = (value: number, locale: string) =>
  locale === "fr" ? `${value.toLocaleString("fr-CA")} $` : `$${value.toLocaleString("en-CA")}`;

function BusinessAutomationClient() {
  const t = useTranslations("BusinessAutomation");
  const locale = useLocale();
  const otherLocale = locale === "fr" ? "en" : "fr";
  const pathname = usePathname();
  const [active, setActive] = useState(0);
  const [trayOpen, setTrayOpen] = useState(false);
  const scope = useScope();
  const activeId = jobIds[active];

  const detailsLabels: DetailsDialogLabels = {
    detailsButton: t("detailsLabels.detailsButton"),
    viewWhatsIncluded: t("detailsLabels.viewWhatsIncluded"),
    viewDetailsFor: t("detailsLabels.viewDetailsFor"),
    close: t("detailsLabels.close"),
    whatsIncluded: t("detailsLabels.whatsIncluded"),
    whoItSuitsHeading: t("detailsLabels.whoItSuitsHeading"),
    illustrativeExample: t("detailsLabels.illustrativeExample"),
  };

  // Deep-link support for the nav dropdown's per-job links
  // (/business-automation#ba-job-<id>) — selects the matching job on
  // load. Deliberately an effect, not a lazy useState initializer:
  // window.location isn't available during SSR, and computing this
  // eagerly on the client's first render would mismatch the
  // server-rendered markup. Running it post-mount, after hydration, is
  // the correct pattern here.
  useEffect(() => {
    const match = window.location.hash.match(/^#ba-job-(.+)$/);
    if (!match) return;
    const index = jobIds.findIndex((id) => id === match[1]);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- see comment above
    if (index >= 0) setActive(index);
  }, []);

  const buildFeeDisplay = (id: JobId) =>
    id === "tailored" ? t("jobs.tailored.kickerTag") : money(jobMeta[id].buildCAD, locale);

  const scopeItem = (id: JobId) => {
    const meta = jobMeta[id];
    const commercial = `${t("jobFacts.buildFee")} ${buildFeeDisplay(id)} / ${t("jobFacts.monthlyManagement")} ${meta.monthlyLabel[locale === "fr" ? "fr" : "en"]}`;
    return {
      id: `automation:${id}`,
      area: "Automation" as const,
      code: meta.index,
      title: t(`jobs.${id}.name`),
      detail: t(`jobs.${id}.outcome`),
      commercial,
    };
  };

  // Reconcile stale cart data: a returning visitor may have an
  // `automation:<id>` item added under a previous job name or in the
  // other language. Same id (job id is unchanged, still reads as
  // "already added"), but title/detail/commercial were frozen at
  // add-time. Patch them in place on mount so the ScopeTray, any
  // submitted enquiry and the downloaded PDF reflect the current
  // locale's copy. Runs once per hydration (length-based dep). Same
  // pattern as the /services Virtual CISO reconciliation.
  useEffect(() => {
    const canonical = new Map(jobIds.map((id) => [`automation:${id}`, id]));
    let changed = false;
    const next = scope.items.map((item) => {
      const id = canonical.get(item.id);
      if (!id) return item;
      const fresh = scopeItem(id);
      if (item.title === fresh.title && item.detail === fresh.detail && item.commercial === fresh.commercial) {
        return item;
      }
      changed = true;
      return { ...item, ...fresh };
    });
    if (changed) {
      scope.setItems(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope.items.length, locale]);

  const toggleScope = (id: JobId) => {
    scope.toggle(scopeItem(id));
    setTrayOpen(true);
  };

  return (
    <main className="ba-full-page ba-jobs-page">
      <header className="ba-header">
        <Link className="wordmark" href="/">
          <span>ORAGROL</span>
          <small>GLOBAL</small>
        </Link>
        <OragrolMegaNav items={NAV_ITEMS} activePath={pathname} />
        <div className="header-actions">
          <button className="scope-nav-button" onClick={() => setTrayOpen(true)}>
            {t("nav.myScope")} <b>{scope.items.length}</b>
          </button>
          <Link className="score-link" href="/cyber-health">
            {t("nav.getCyberHealthScore")}
          </Link>
          <button className="search" aria-label={t("nav.search")}>
            <span />
          </button>
          <Link className="language" href={pathname} locale={otherLocale} aria-label={t("nav.changeLanguage")}>
            {locale.toUpperCase()} / {otherLocale.toUpperCase()}
          </Link>
        </div>
      </header>
      <section className="ba-hero" aria-labelledby="ba-title">
        <div className="ba-mark" aria-hidden="true">
          <span className="ba-or">OR</span>
          <span className="ba-five">5</span>
          <small>{t("hero.markLabel")}</small>
        </div>
        <div className="ba-content">
          <div className="ba-meta">
            <span>{t("hero.meta1")}</span>
            <span>{t("hero.meta2")}</span>
          </div>
          <div className="ba-statement">
            <h1 id="ba-title">
              {t("hero.title1")}
              <span>{t("hero.title2")}</span>
            </h1>
            <div className="ba-support">
              <p>{t("hero.support")}</p>
              <a href="#job-selector">
                {t("hero.exploreLink")} <span>↘</span>
              </a>
            </div>
          </div>
          <div className="ba-footer">
            <div>
              {jobIds.slice(0, 5).map((id) => (
                <b key={id}>
                  <i>{jobMeta[id].index}</i>
                  {t(`jobs.${id}.short`)}
                </b>
              ))}
            </div>
            <span>{t("hero.noPlatform")}</span>
          </div>
        </div>
      </section>
      <section className="job-selector" id="job-selector">
        <div className="job-selector-head">
          <p>{t("jobSelector.eyebrow")}</p>
          <h2>
            {t("jobSelector.title1")}
            <br />
            <span>{t("jobSelector.title2")}</span>
          </h2>
          <p>{t("jobSelector.sub")}</p>
        </div>
        <div className="job-stage">
          <nav>
            {jobIds.map((id, i) => (
              <button
                id={`ba-job-${id}`}
                className={active === i ? "active" : ""}
                onClick={() => setActive(i)}
                key={id}
              >
                <span>{jobMeta[id].index}</span>
                <b>{t(`jobs.${id}.name`)}</b>
                <small>{t(`jobs.${id}.short`)}</small>
              </button>
            ))}
          </nav>
          <article className={activeId === "tailored" ? "tailored-job" : ""}>
            <div className="job-kicker">
              <span>
                {jobMeta[activeId].index} / {t(`jobs.${activeId}.accent`)}
              </span>
              <small>{t(`jobs.${activeId}.kickerTag`)}</small>
            </div>
            <h3>{t(`jobs.${activeId}.name`)}</h3>
            <p className="job-outcome">{t(`jobs.${activeId}.outcome`)}</p>
            <DetailsDialog
              category={t("hero.meta1")}
              itemLabel={t(`details.${activeId}.itemLabel`)}
              title={t(`details.${activeId}.title`)}
              subtitle={t(`details.${activeId}.subtitle`)}
              intro={t(`details.${activeId}.intro`)}
              inclusions={t.raw(`details.${activeId}.inclusions`) as string[]}
              controlHeading={t("detailsLabels.youStayInControl")}
              control={t(`details.${activeId}.control`)}
              whoItSuits={t(`details.${activeId}.whoItSuits`)}
              example={t(`details.${activeId}.example`)}
              scope={t(`details.${activeId}.scope`)}
              labels={detailsLabels}
              action={{
                label: scope.has(`automation:${activeId}`) ? t("scopeAdd.added") : t("scopeAdd.add"),
                onClick: () => toggleScope(activeId),
                disabled: false,
              }}
            />
            <div className="job-facts">
              <div>
                <span>{t("jobFacts.idealFit")}</span>
                <p>{t(`jobs.${activeId}.fit`)}</p>
              </div>
              <div>
                <span>{t("jobFacts.worksThrough")}</span>
                <p>{t(`jobs.${activeId}.tools`)}</p>
              </div>
            </div>
            <div className="job-commercial">
              <div>
                <span>{t("jobFacts.buildFee")}</span>
                <strong>{buildFeeDisplay(activeId)}</strong>
                <small>{t("jobFacts.buildFeeNote")}</small>
              </div>
              <div>
                <span>{t("jobFacts.monthlyManagement")}</span>
                <strong>{jobMeta[activeId].monthlyLabel[locale === "fr" ? "fr" : "en"]}</strong>
                <small>{t("jobFacts.monthlyManagementNote")}</small>
              </div>
            </div>
            <button
              className={scope.has(`automation:${activeId}`) ? "scope-add added" : "scope-add"}
              onClick={() => toggleScope(activeId)}
            >
              {scope.has(`automation:${activeId}`) ? t("scopeAdd.added") : t("scopeAdd.add")}
              <span>↗</span>
            </button>
          </article>
          {/* Off-screen Details controls for the jobs not currently
              selected. Same real, functioning trigger+dialog as the
              visible one above — not duplicated text, an actual
              reachable control — just positioned with zero visual
              footprint so nothing changes for a sighted user browsing
              normally. Needed because this page only renders one
              job's full detail panel at a time; without this, the
              other 5 jobs' descriptions wouldn't exist in the page at
              all unless that job is the active selection. */}
          {jobIds
            .filter((id) => id !== activeId)
            .map((id) => (
              <span
                key={id}
                style={{
                  position: "absolute",
                  width: "1px",
                  height: "1px",
                  padding: 0,
                  margin: "-1px",
                  overflow: "hidden",
                  clipPath: "inset(50%)",
                  whiteSpace: "nowrap",
                  border: 0,
                }}
              >
                <DetailsDialog
                  category={t("hero.meta1")}
                  itemLabel={t(`details.${id}.itemLabel`)}
                  title={t(`details.${id}.title`)}
                  subtitle={t(`details.${id}.subtitle`)}
                  intro={t(`details.${id}.intro`)}
                  inclusions={t.raw(`details.${id}.inclusions`) as string[]}
                  controlHeading={t("detailsLabels.youStayInControl")}
                  control={t(`details.${id}.control`)}
                  whoItSuits={t(`details.${id}.whoItSuits`)}
                  example={t(`details.${id}.example`)}
                  scope={t(`details.${id}.scope`)}
                  labels={detailsLabels}
                  action={{
                    label: scope.has(`automation:${id}`) ? t("scopeAdd.added") : t("scopeAdd.add"),
                    onClick: () => toggleScope(id),
                    disabled: false,
                  }}
                />
              </span>
            ))}
        </div>
        <p className="commercial-note">{t("jobSelector.commercialNote")}</p>
      </section>
      <section className="existing-tools">
        <div>
          <p>{t("existingTools.eyebrow")}</p>
          <h2>
            {t("existingTools.title1")}
            <br />
            <span>{t("existingTools.title2")}</span>
          </h2>
        </div>
        <div>
          <p>{t("existingTools.body")}</p>
          <div className="tool-line">
            <span>{t("existingTools.tool1")}</span>
            <i>→</i>
            <span>{t("existingTools.tool2")}</span>
            <i>→</i>
            <span>{t("existingTools.tool3")}</span>
            <i>→</i>
            <span>{t("existingTools.tool4")}</span>
          </div>
        </div>
      </section>
      <section className="ba-job-journey">
        <p>{t("journey.eyebrow")}</p>
        <div>
          {([0, 1, 2, 3] as const).map((i) => (
            <article key={i}>
              <span>{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3>{t(`journey.steps.${i}.title`)}</h3>
                <p>{t(`journey.steps.${i}.body`)}</p>
              </div>
              {i < 3 && <i>→</i>}
            </article>
          ))}
        </div>
      </section>
      <section className="fee-explainer" id="packages">
        <div>
          <p>{t("feeExplainer.eyebrow")}</p>
          <h2>
            {t("feeExplainer.title1")}
            <br />
            <span>{t("feeExplainer.title2")}</span>
          </h2>
        </div>
        <div className="fee-pair">
          <article>
            <span>{t("feeExplainer.buildLabel")}</span>
            <h3>{t("feeExplainer.buildTitle")}</h3>
            <p>{t("feeExplainer.buildBody")}</p>
          </article>
          <article>
            <span>{t("feeExplainer.monthlyLabel")}</span>
            <h3>{t("feeExplainer.monthlyTitle")}</h3>
            <p>{t("feeExplainer.monthlyBody")}</p>
          </article>
        </div>
      </section>
      <PreFooterCta page="business-automation" />
      <SiteFooter />
      <ScopeTray
        items={scope.items}
        remove={scope.remove}
        clear={scope.clear}
        open={trayOpen}
        setOpen={setTrayOpen}
        activeArea="Automation"
      />
    </main>
  );
}

export default BusinessAutomationClient;
