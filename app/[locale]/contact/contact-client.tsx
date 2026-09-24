"use client";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

import { FormEvent, useEffect, useState } from "react";
import PreFooterCta from "@/app/components/site/pre-footer-cta";
import SiteFooter from "@/app/components/site/footer";
import OragrolMegaNav from "@/app/components/site/oragrol-mega-nav";
import UtilityBar from "@/app/components/site/utility-bar";
import { NAV_ITEMS } from "@/app/components/site/nav-items";
import "@/app/gpt-pages.css";

type Conversation =
  | "Cybersecurity Services"
  | "Business Automation"
  | "OR ONE"
  | "Partnership or General Enquiry";
type ScopeItem = { id: string; area: string; code: string; title: string };

// Bilingual (D-086, Task #21): `options` below is left untouched -- its
// `name` values are submitted to /api/contact as free text (see
// app/lib/contact-schema.ts's `conversation: z.string()`) and land in
// Mohammad's internal notification email subject/body, so they stay the
// stable English identifiers on /fr too rather than becoming French text
// he'd have to context-switch to read. The *displayed* label/summary come
// from Contact.conversations.options instead, index-paired against this
// array (same pattern as OR ONE's builder categories).
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
  const t = useTranslations("Contact");
  const locale = useLocale();
  const otherLocale = locale === "fr" ? "en" : "fr";
  const pathname = usePathname();
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
        setSubmitError(data.error || t("form.genericSubmitError"));
        return;
      }
      setSubmitted(true);
    } catch {
      setSubmitError(t("form.networkError"));
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <>
    <UtilityBar />
    <main className="contact-page">
      <header className="industry-header contact-header">
        <Link className="wordmark" href="/">
          <span>ORAGROL</span>
          <small>GLOBAL</small>
        </Link>
        <OragrolMegaNav items={NAV_ITEMS} activePath={pathname} />
        <div>
          <a className="active" href="#enquiry">
            {t("nav.startEnquiry")}
          </a>
          <button className="search" aria-label={t("nav.search")}>
            <span />
          </button>
          <span className="language">
            <span className="language-current">{locale.toUpperCase()}</span> / <Link href={pathname} locale={otherLocale} aria-label={t("nav.changeLanguage")}>{otherLocale.toUpperCase()}</Link>
          </span>
        </div>
      </header>

      <section className="contact-hero">
        <div className="contact-hero-mark" aria-hidden="true">
          OR
        </div>
        <div>
          <p>{t("hero.eyebrow")}</p>
          <h1>
            {t("hero.title1")}
            <br />
            <span>{t("hero.titleEmphasis")}</span>
          </h1>
          <p>{t("hero.body")}</p>
          <a href="#conversations">
            {t("hero.chooseConversation")} <b>↓</b>
          </a>
        </div>
      </section>

      <section className="contact-conversations" id="conversations">
        <header>
          <span>{t("conversations.eyebrow")}</span>
          <h2>
            {t("conversations.title1")}
            <br />
            {t("conversations.titleEmphasis")}
          </h2>
          <p>{t("conversations.sub")}</p>
        </header>
        <div className="conversation-grid">
          {options.map((o, i) => (
            <button
              className={conversation === o.name ? "selected" : ""}
              onClick={() => setConversation(o.name)}
              aria-pressed={conversation === o.name}
              key={o.name}
            >
              <span>{o.index}</span>
              <i>{conversation === o.name ? t("conversations.selectedLabel") : t("conversations.selectLabel")}</i>
              <h3>{t(`conversations.options.${i}.label`)}</h3>
              <p>{t(`conversations.options.${i}.summary`)}</p>
              <b>↗</b>
            </button>
          ))}
        </div>
      </section>

      <section className="contact-enquiry" id="enquiry">
        <div className="enquiry-intro">
          <span>{t("enquiry.eyebrow")}</span>
          <h2>{t("enquiry.title")}</h2>
          <p>{t("enquiry.sub")}</p>
          {scope.length > 0 && (
            <aside>
              <small>{t("enquiry.scopeAttachedLabel")}</small>
              <strong>
                {String(scope.length).padStart(2, "0")} {t("enquiry.selectionWord")}
                {scope.length === 1 ? "" : "s"}
              </strong>
              <p>
                {scope
                  .slice(0, 3)
                  .map((x) => x.title)
                  .join(" · ")}
                {scope.length > 3 ? t("enquiry.moreSuffix", { count: scope.length - 3 }) : ""}
              </p>
            </aside>
          )}
        </div>
        <form onSubmit={submit}>
          <div className="selected-conversation">
            <span>{t("form.conversationLabel")}</span>
            <strong>{t(`conversations.options.${options.findIndex((o) => o.name === conversation)}.label`)}</strong>
            <button
              type="button"
              onClick={() =>
                document.getElementById("conversations")?.scrollIntoView()
              }
            >
              {t("form.changeButton")}
            </button>
          </div>
          <div className="field-pair">
            <label>
              {t("form.firstName")}
              <input required name="firstName" />
            </label>
            <label>
              {t("form.lastName")}
              <input required name="lastName" />
            </label>
          </div>
          <div className="field-pair">
            <label>
              {t("form.businessEmail")}
              <input
                required
                type="email"
                name="email"
                placeholder={t("form.emailPlaceholder")}
              />
            </label>
            <label>
              {t("form.company")}
              <input required name="company" />
            </label>
          </div>
          <div className="field-pair">
            <label>
              {t("form.jobTitle")}
              <input name="jobTitle" />
            </label>
            <label>
              {t("form.companySize")}
              <select name="companySize" defaultValue="">
                <option value="" disabled>
                  {t("form.selectPlaceholder")}
                </option>
                <option>{t("form.size1to10")}</option>
                <option>{t("form.size11to50")}</option>
                <option>{t("form.size51to200")}</option>
                <option>{t("form.size201plus")}</option>
              </select>
            </label>
          </div>
          <label>
            {t("form.achieveLabel")}
            <textarea
              required
              name="context"
              placeholder={t("form.achievePlaceholder")}
            />
          </label>
          <div className="field-pair">
            <label>
              {t("form.contactMethodLabel")}
              {/* Bilingual (D-086, Task #21): explicit `value` attrs keep
                  the submitted field and defaultValue matching stable
                  English identifiers regardless of locale -- only the
                  visible option text is translated. */}
              <select name="contactMethod" defaultValue="Email">
                <option value="Email">{t("form.methodEmail")}</option>
                <option value="Video call">{t("form.methodVideo")}</option>
              </select>
            </label>
            <label>
              {t("form.preferredTimeLabel")}
              <input
                name="preferredTime"
                placeholder={t("form.preferredTimePlaceholder")}
              />
            </label>
          </div>
          <label className="contact-consent">
            <input required type="checkbox" /> {t("form.consentLabel")}
          </label>
          <button className="contact-submit" type="submit" disabled={submitting}>
            {submitting ? t("form.sendingLabel") : t("form.submitButton")} <span>↗</span>
          </button>
          {submitError && (
            <div className="contact-confirmation" role="alert">
              <strong>{t("form.errorHeading")}</strong>
              <span>{submitError}</span>
            </div>
          )}
          {scope.length > 0 && (
            <button
              className="contact-pdf"
              type="button"
              onClick={() => alert(t("form.downloadScopeAlert"))}
            >
              {t("form.downloadScopePdf")}
            </button>
          )}
          {submitted && (
            <div className="contact-confirmation" role="status">
              <strong>{t("form.successHeading")}</strong>
              <span>{t("form.successBody")}</span>
            </div>
          )}
          <small className="contact-privacy">
            {t("form.privacyNote")}
          </small>
        </form>
      </section>

      <section className="contact-next">
        <header>
          <span>{t("next.eyebrow")}</span>
          <h2>
            {t("next.title1")}
            <br />
            <i>{t("next.titleEmphasis")}</i>
          </h2>
        </header>
        <div>
          {(t.raw("next.steps") as { number: string; title: string; copy: string }[]).map((s) => (
            <article key={s.number}>
              <span>{s.number}</span>
              <h3>{s.title}</h3>
              <p>{s.copy}</p>
            </article>
          ))}
        </div>
        <p>{t("next.footer")}</p>
      </section>

      <section className="contact-locations">
        <div>
          <span>{t("locations.eyebrow")}</span>
          <h2>
            {t("locations.title1")}
            <br />
            {t("locations.title2")}
          </h2>
        </div>
        <div className="location-cards">
          <article>
            <span>{t("locations.hq.label")}</span>
            <h3>{t("locations.hq.city")}</h3>
            <p>{t("locations.hq.region")}</p>
          </article>
          <article>
            <span>{t("locations.toronto.label")}</span>
            <h3>{t("locations.toronto.city")}</h3>
            <p>
              {t("locations.toronto.body")}
              <br />
              {t("locations.toronto.region")}
            </p>
          </article>
          <article>
            <span>{t("locations.digital.label")}</span>
            <h3>{t("locations.digital.domain")}</h3>
            <p>{t("locations.digital.body")}</p>
          </article>
        </div>
      </section>

      <PreFooterCta page="contact" />

      <SiteFooter/>
    </main>
    </>
  );
}

export default ContactPageClient;
