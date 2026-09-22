"use client";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import PreFooterCta from "@/app/components/site/pre-footer-cta";
import SiteFooter from "@/app/components/site/footer";
import OragrolMegaNav from "@/app/components/site/oragrol-mega-nav";
import { NAV_ITEMS } from "@/app/components/site/nav-items";
import "@/app/gpt-pages.css";

/**
 * Bilingual (D-086, Task #21): rewired to consume the `Company`
 * namespace in messages/{en,fr}.json, sourced from
 * `ORAGROL_Company_FR_Translation.md`. Split out of what was a static
 * server-component `page.tsx` into this client component, same
 * page.tsx + *-client.tsx split every other converted page uses.
 *
 * Two strings are deliberately kept in English in BOTH locales, per
 * the translation doc's own explicit call: "Orchestrated AI
 * Governance, Risk, Operations and Learning" (hero.nameLine /
 * meaning.tagline) is the letter-by-letter expansion of the ORAGROL
 * name itself -- translating it would break the connection to the
 * brand name's own letters, since a French version wouldn't spell
 * "ORAGROL" anymore. Same reasoning for meaning.terms (the six
 * individual words: Orchestrated / AI / Governance / Risk /
 * Operations / Learning) -- those are the acronym's letters, not
 * ordinary copy.
 */

function CompanyPageClient() {
  const t = useTranslations("Company");
  const locale = useLocale();
  const otherLocale = locale === "fr" ? "en" : "fr";
  const pathname = usePathname();
  const paths = t.raw("paths") as {
    number: string;
    title: string;
    body: string;
    linkLabel: string;
  }[];
  const pathHrefs = ["/services", "/business-automation", "/or-one"];
  const terms = t.raw("meaning.terms") as string[];
  const points = t.raw("operating.points") as string[];

  return (
    <main className="company-page">
      <header className="industry-header company-header">
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
          <span className="language">
            <span className="language-current">{locale.toUpperCase()}</span> / <Link href={pathname} locale={otherLocale} aria-label={t("nav.changeLanguage")}>{otherLocale.toUpperCase()}</Link>
          </span>
        </div>
      </header>

      <section className="company-hero">
        <div className="company-hero-copy">
          <p>{t("hero.eyebrow")}</p>
          <h1>{t("hero.title")}</h1>
          <p>{t("hero.body")}</p>
          <a href="#company-story">
            {t("hero.discoverStory")} <span>↓</span>
          </a>
        </div>
        <div className="company-hero-mark" aria-hidden="true">
          <i />
          <i />
          <i />
          <span>OR</span>
        </div>
        <p className="company-name-line">{t("hero.nameLine")}</p>
      </section>

      <section className="company-story" id="company-story">
        <article className="company-why">
          <span>{t("why.eyebrow")}</span>
          <h2>{t("why.title")}</h2>
          <p>{t("why.body1")}</p>
          <p>{t("why.body2")}</p>
        </article>
        <article className="company-meaning">
          <span>{t("meaning.eyebrow")}</span>
          <h3>{t("meaning.title")}</h3>
          <p>
            <strong>{t("meaning.tagline")}</strong>
          </p>
          <p>{t("meaning.body")}</p>
          <div className="company-terms">
            {terms.map((term) => (
              <span key={term}>{term}</span>
            ))}
          </div>
        </article>
        <article className="company-orange">
          <span>{t("orange.eyebrow")}</span>
          <h3>{t("orange.title")}</h3>
          <p>{t("orange.body1")}</p>
          <p>{t("orange.body2")}</p>
        </article>
      </section>

      <section className="company-paths">
        {paths.map((p, i) => (
          <div key={p.number}>
            <span>{p.number}</span>
            <h3>{p.title}</h3>
            <p>{p.body}</p>
            <Link href={pathHrefs[i]}>{p.linkLabel} ↗</Link>
          </div>
        ))}
      </section>

      <section className="company-founder">
        <div className="founder-portrait">
          <div>
            <span>MCT</span>
            <small>
              {t("founder.portraitLabel")}
              <br />
              {t("founder.portraitPending")}
            </small>
          </div>
        </div>
        <article>
          <span>{t("founder.eyebrow")}</span>
          <h2>{t("founder.title")}</h2>
          <h3>
            {t("founder.name")} <small>{t("founder.role")}</small>
          </h3>
          <p>{t("founder.body1")}</p>
          <p>{t("founder.body2")}</p>
          <p>{t("founder.body3")}</p>
          <blockquote>&ldquo;{t("founder.quote")}&rdquo;</blockquote>
        </article>
      </section>

      <section className="company-operating">
        <article>
          <span>{t("operating.eyebrow")}</span>
          <h2>{t("operating.title")}</h2>
          <p>{t("operating.body")}</p>
          <div className="operating-points">
            {points.map((point) => (
              <span key={point}>{point}</span>
            ))}
          </div>
        </article>
        <aside>
          <span>{t("canadian.eyebrow")}</span>
          <h3>{t("canadian.title")}</h3>
          <div>
            <p>{t("canadian.hqLabel")}</p>
            <strong>{t("canadian.hqCity")}</strong>
          </div>
          <div>
            <p>{t("canadian.torontoLabel")}</p>
            <strong>{t("canadian.torontoCity")}</strong>
          </div>
          <p>{t("canadian.body")}</p>
        </aside>
      </section>

      <PreFooterCta page="company" />

      <SiteFooter/>
    </main>
  );
}

export default CompanyPageClient;
