import Link from "next/link";
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
 */

function HomeCybersecurity() {
  return (
    <section
      className={s.section}
      id="home-cybersecurity"
      aria-labelledby="home-cyber-heading"
    >
      <p className={s.eyebrow}>04 / CYBERSECURITY</p>
      <header className={s.header}>
        <h2 id="home-cyber-heading">
          Protection built
          <br />
          around your business.
        </h2>
        <p className={s.intro}>
          Choose a package, address a specific need or scope a specialist
          engagement.
        </p>
      </header>

      <div className={s.offerings}>
        <article>
          <p className={s.count} aria-label="4">
            04
          </p>
          <h3>Packages</h3>
          <p className={s.description}>
            Four levels of protection.
            <br />
            Foundation, Advanced,
            <br />
            Comprehensive and Elite.
          </p>
          <Link href="/services#service-packages">
            <span>Explore Packages</span>
            <span aria-hidden="true">↗</span>
          </Link>
        </article>

        <article>
          <p className={s.count}>12</p>
          <h3>À La Carte</h3>
          <p className={s.description}>
            Individual services for specific needs. Available standalone or
            alongside a package.
          </p>
          <Link href="/services#individual-services">
            <span>Explore Individual Services</span>
            <span aria-hidden="true">↗</span>
          </Link>
        </article>

        <article>
          <p className={s.count} aria-label="4">
            04
          </p>
          <h3>
            Specialist
            <br />
            Engagements
          </h3>
          <p className={s.description}>
            Penetration testing, SOC 2 attestation, PCI-DSS assessment and
            forensic incident response.
          </p>
          <Link href="/contact">
            <span>Discuss an Engagement</span>
            <span aria-hidden="true">↗</span>
          </Link>
        </article>
      </div>
    </section>
  );
}

export default HomeCybersecurity;
