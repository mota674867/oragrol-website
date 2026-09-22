import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import s from './review-sections.module.css';
import { DetailsDialog, type DetailsDialogLabels } from "@/app/components/DetailsDialog";
import { orOneDetailsContent } from "@/app/lib/or-one-details-content";

/**
 * Bilingual (D-086, Task #21): all five sections below now read from the
 * `OrOne` messages namespace via useTranslations. No "use client" pragma
 * here on purpose — this module is only ever imported from
 * or-one-client.tsx, which already has one, so it's part of the client
 * bundle transitively (same pattern already used for other page-local
 * section modules in this codebase).
 *
 * Fee amounts (build fee / monthly OR Service Fee) stay as plain numbers
 * here, formatted through the same locale-aware money() helper used on
 * Business Automation, rather than living as literal currency strings in
 * messages/*.json — these are pricing facts, not translated copy.
 */

const money = (value: number, locale: string) =>
  locale === "fr" ? `${value.toLocaleString("fr-CA")} $` : `$${value.toLocaleString("en-CA")}`;

export function RevisedSignature() {
  const t = useTranslations("OrOne.signature");
  return (
    <section id="or-one-signature" className={s.signature} aria-labelledby="or-one-signature-heading">
      <div className={s.signatureGrid}>
        <div className={s.signatureCopy}>
          <div className={s.signatureLabelRow}>
            <p className={s.signatureLabel}>{t("label")}</p>
            <span className={s.signatureRule} aria-hidden="true"></span>
          </div>
          <h2 id="or-one-signature-heading">{t("heading")}</h2>
          <p>{t("body1")}</p>
          <p>{t("body2")}</p>
          <Link href="/contact#enquiry" className={s.signatureCta}>
            {t("cta")} <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <svg className={s.signatureMotif} viewBox="0 0 420 420" aria-hidden="true" focusable="false">
          <line x1="140" y1="0" x2="140" y2="420" stroke="#45494b" strokeWidth="1" />
          <line x1="310" y1="0" x2="310" y2="420" stroke="#45494b" strokeWidth="1" />
          <line x1="0" y1="140" x2="420" y2="140" stroke="#45494b" strokeWidth="1" />
          <line x1="0" y1="290" x2="420" y2="290" stroke="#45494b" strokeWidth="1" />
          <path d="M310 290 A170 170 0 0 0 420 155" fill="none" stroke="#5a5e61" strokeWidth="1" />
          <rect x="140" y="30" width="220" height="330" rx="28" fill="none" stroke="#ef4d00" strokeWidth="2" />
          <rect x="304" y="284" width="12" height="12" fill="none" stroke="#7a7e81" strokeWidth="1" />
        </svg>
      </div>
    </section>
  );
}

export function RevisedProcess() {
  const t = useTranslations("OrOne.process");
  const steps = t.raw("steps") as { number: string; title: string; copy: string; result: string }[];
  return (
    <section className={`${s.section} ${s.process}`}>
      <div className={s.heading}>
        <p className={s.eyebrow}>{t("eyebrow")}</p>
        <h2>
          {t("title1")}
          <br />
          <span>{t("titleEmphasis")}</span>
        </h2>
        <p>{t("sub")}</p>
      </div>
      <div className={s.steps}>
        {steps.map((step) => (
          <article key={step.number}>
            <span className={s.number}>{step.number}</span>
            <h3>{step.title}</h3>
            <p>{step.copy}</p>
            <small>{step.result}</small>
          </article>
        ))}
      </div>
    </section>
  );
}

const TIER_KEYS = ["STARTER", "100", "200", "400"] as const;
const TIER_FEES: Record<(typeof TIER_KEYS)[number], { build: number; monthly: number }> = {
  STARTER: { build: 22000, monthly: 999 },
  "100": { build: 75000, monthly: 3999 },
  "200": { build: 150000, monthly: 5999 },
  "400": { build: 220000, monthly: 8999 },
};

export function RevisedPricing() {
  const t = useTranslations("OrOne");
  const locale = useLocale();
  const detailsLabels: DetailsDialogLabels = {
    detailsButton: t("detailsLabels.detailsButton"),
    viewWhatsIncluded: t("detailsLabels.viewWhatsIncluded"),
    viewDetailsFor: t("detailsLabels.viewDetailsFor"),
    close: t("detailsLabels.close"),
    whatsIncluded: t("detailsLabels.whatsIncluded"),
    whoItSuitsHeading: t("detailsLabels.whoItSuitsHeading"),
    illustrativeExample: t("detailsLabels.illustrativeExample"),
  };
  return (
    <section className={`${s.section} ${s.pricing}`}>
      <div className={s.heading}>
        <p className={s.eyebrow}>{t("pricing.eyebrow")}</p>
        <h2>
          {t("pricing.title1")}
          <br />
          <span>{t("pricing.titleEmphasis")}</span>
        </h2>
        <p>{t("pricing.sub")}</p>
      </div>
      <div className={s.prices}>
        {TIER_KEYS.map((key) => {
          const content = orOneDetailsContent[key];
          const fees = TIER_FEES[key];
          return (
            <article key={key}>
              <span className={s.eyebrow}>OR / ONE</span>
              <h3>{key}</h3>
              <p className={s.fit}>{t(`details.${key}.subtitle`)}</p>
              {content && (
                <DetailsDialog
                  category="OR ONE"
                  itemLabel={t(`details.${key}.itemLabel`)}
                  title={t(`details.${key}.title`)}
                  subtitle={t(`details.${key}.subtitle`)}
                  intro={t(`details.${key}.intro`)}
                  inclusions={t.raw(`details.${key}.inclusions`) as string[]}
                  controlHeading={t("detailsLabels.youStayInControl")}
                  control={t(`details.${key}.control`)}
                  whoItSuits={t(`details.${key}.whoItSuits`)}
                  example={t(`details.${key}.example`)}
                  scope={t(`details.${key}.scope`)}
                  labels={detailsLabels}
                />
              )}
              <p className={s.points}>{t(`details.${key}.pointsLabel`)}</p>
              <div className={s.fee}>
                <span>{t("pricing.buildFeeLabel")}</span>
                <strong>{money(fees.build, locale)}</strong>
              </div>
              <div className={s.monthly}>
                <span>{t("pricing.monthlyFeeLabel")}</span>
                <strong>
                  {money(fees.monthly, locale)}
                  <small>{t("pricing.perMonthSuffix")}</small>
                </strong>
              </div>
            </article>
          );
        })}
      </div>
      <div className={s.pricingNote}>
        <p>{t("pricing.note1")}</p>
        <p>{t("pricing.note2")}</p>
      </div>
    </section>
  );
}

export function RevisedResponsibility() {
  const t = useTranslations("OrOne.control");
  const rows = t.raw("rows") as { number: string; title: string; tag: string; copy: string }[];
  return (
    <section className={`${s.section} ${s.control}`}>
      <div className={s.heading}>
        <p className={s.eyebrow}>{t("eyebrow")}</p>
        <h2>
          {t("title1")}
          <br />
          <span>{t("titleEmphasis")}</span>
        </h2>
        <p>{t("sub")}</p>
      </div>
      <div className={s.controlRows}>
        {rows.map((row) => (
          <article key={row.number}>
            <span className={s.rowNumber}>{row.number}</span>
            <div>
              <h3>{row.title}</h3>
              <small>{row.tag}</small>
            </div>
            <p>{row.copy}</p>
          </article>
        ))}
      </div>
      <p className={s.footnote}>{t("footnote")}</p>
    </section>
  );
}

export function RevisedManagement() {
  const t = useTranslations("OrOne.management");
  const items = t.raw("items") as { title: string; copy: string }[];
  return (
    <section className={`${s.section} ${s.management}`}>
      <div className={s.heading}>
        <p className={s.eyebrow}>{t("eyebrow")}</p>
        <h2>
          {t("title1")}
          <br />
          <span>{t("titleEmphasis")}</span>
        </h2>
        <p>{t("sub")}</p>
      </div>
      <div className={s.managementGrid}>
        {items.map((item, i) => (
          <article key={item.title}>
            <span className={s.eyebrow}>0{i + 1}</span>
            <h3>{item.title}</h3>
            <p>{item.copy}</p>
          </article>
        ))}
      </div>
      <p className={s.footnote}>{t("footnote")}</p>
    </section>
  );
}
