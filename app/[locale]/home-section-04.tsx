import {getTranslations} from "next-intl/server";
import {Link} from "@/i18n/navigation";
import s from "./home-section-04.module.css";

/**
 * Homepage section 04 — "Cybersecurity" editorial layout.
 * Per Homepage_04_Final_Claude_Handoff.md (2026-09-08), which explicitly
 * supersedes the earlier circular-selector handoff and its implementation.
 * Source of truth for content/visuals: Homepage_04_Approved.html.
 *
 * No interactivity in the approved design — no selector, no client state —
 * so unlike the circle this ships with zero "use client" directive. It's a
 * true Server Component: no JS shipped for this section at all beyond the
 * Link prefetch Next already does site-wide. Also means all three
 * descriptions and links are trivially present in the initial server HTML
 * (there's nothing to hide/show), which was a hard requirement on the
 * circle and is just a natural side effect of this design having no state.
 *
 * Anchors: the approved HTML preview points both Services links at plain
 * /services. The handoff explicitly permits using verified existing
 * Services anchors instead ("You may use verified existing Services
 * anchors, but never invent them") — re-confirmed both exist in
 * app/services/services-body.tsx before using them here, same as the
 * circle did.
 *
 * Bilingual (D-086): content is sourced from the Home.cybersecurity
 * namespace via next-intl's server-side getTranslations, so this section
 * renders correctly (and with the right hreflang-matching text) at both
 * `/` and `/fr` with zero client JS added. Links use next-intl's Link so
 * they stay on the current locale (e.g. /fr/services, not /services).
 */

async function HomeCybersecurity() {
  const t = await getTranslations("Home.cybersecurity");

  return (
    <section
      className={s.section}
      id="home-cybersecurity"
      aria-labelledby="home-cyber-heading"
    >
      <p className={s.eyebrow}>{t("eyebrow")}</p>
      <header className={s.header}>
        <h2 id="home-cyber-heading">
          {t("headline1")}
          <br />
          {t("headline2")}
        </h2>
        <p className={s.intro}>{t("intro")}</p>
      </header>

      <div className={s.offerings}>
        <article>
          <p className={s.count} aria-label="4">
            {t("packages.count")}
          </p>
          <h3>{t("packages.title")}</h3>
          <p className={s.description}>
            {t("packages.description1")}
            <br />
            {t("packages.description2")}
            <br />
            {t("packages.description3")}
          </p>
          <Link href="/services#service-packages">
            <span>{t("packages.link")}</span>
            <span aria-hidden="true">↗</span>
          </Link>
        </article>

        <article>
          <p className={s.count}>{t("alaCarte.count")}</p>
          <h3>{t("alaCarte.title")}</h3>
          <p className={s.description}>{t("alaCarte.description")}</p>
          <Link href="/services#individual-services">
            <span>{t("alaCarte.link")}</span>
            <span aria-hidden="true">↗</span>
          </Link>
        </article>

        <article>
          <p className={s.count} aria-label="4">
            {t("specialist.count")}
          </p>
          <h3>
            {t("specialist.title1")}
            <br />
            {t("specialist.title2")}
          </h3>
          <p className={s.description}>{t("specialist.description")}</p>
          <Link href="/contact">
            <span>{t("specialist.link")}</span>
            <span aria-hidden="true">↗</span>
          </Link>
        </article>
      </div>
    </section>
  );
}

export default HomeCybersecurity;
