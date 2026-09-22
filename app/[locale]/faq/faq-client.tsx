"use client";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import PreFooterCta from "@/app/components/site/pre-footer-cta";
import SiteFooter from "@/app/components/site/footer";
import OragrolMegaNav from "@/app/components/site/oragrol-mega-nav";
import { NAV_ITEMS } from "@/app/components/site/nav-items";
import "@/app/gpt-pages.css";

/**
 * Bilingual (D-086, Task #21): the 36-question `groups` array used to be a
 * hardcoded English module-level constant. It now comes from
 * `t.raw("groups")` instead, read inside the component so it's re-fetched
 * per locale -- this is a real functional fix, not just a display one: the
 * search box below filters over `q + " " + a`, so a French visitor typing
 * a French search term needs the array being searched to actually be in
 * French, not the English source text translated only for display.
 */

type FaqGroup = { title: string; items: { q: string; a: string }[] };

function FAQPageClient() {
  const t = useTranslations("Faq");
  const locale = useLocale();
  const otherLocale = locale === "fr" ? "en" : "fr";
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const groups = t.raw("groups") as FaqGroup[];
  const filtered = groups
    .map((g) => ({
      ...g,
      items: g.items.filter(({ q, a }) =>
        (q + " " + a).toLowerCase().includes(query.toLowerCase()),
      ),
    }))
    .filter((g) => g.items.length);
  return (
    <main className="faq-page">
      <header className="faq-nav">
        <Link className="wordmark" href="/">
          <span>ORAGROL</span>
          <small>GLOBAL</small>
        </Link>
        <OragrolMegaNav items={NAV_ITEMS} activePath={pathname} />
        <Link href="/contact">{t("nav.contactLink")}</Link>
        <span className="language">
          <span className="language-current">{locale.toUpperCase()}</span> / <Link href={pathname} locale={otherLocale}>{otherLocale.toUpperCase()}</Link>
        </span>
      </header>
      <section className="faq-hero">
        <span>OR</span>
        <div>
          <p>{t("hero.eyebrow")}</p>
          <h1>
            {t("hero.title1")}
            <br />
            <i>{t("hero.titleEmphasis")}</i>
          </h1>
          <p>{t("hero.sub")}</p>
          <label className="faq-search">
            <span aria-hidden="true" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="search"
              placeholder={t("hero.searchPlaceholder")}
              aria-label={t("hero.searchAriaLabel")}
            />
          </label>
        </div>
      </section>
      <section className="faq-content">
        {filtered.length ? (
          filtered.map((g, gi) => (
            <article key={g.title}>
              <header>
                <span>{String(gi + 1).padStart(2, "0")}</span>
                <h2>{g.title}</h2>
              </header>
              <div>
                {g.items.map(({ q, a }) => (
                  <details key={q}>
                    <summary>
                      {q}
                      <b>+</b>
                    </summary>
                    <p>{a}</p>
                  </details>
                ))}
              </div>
            </article>
          ))
        ) : (
          <p className="faq-no-results">{t("noResults")}</p>
        )}
      </section>
      <PreFooterCta page="faq" />
      <SiteFooter/>
    </main>
  );
}

export default FAQPageClient;
