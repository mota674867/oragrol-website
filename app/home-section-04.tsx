"use client";
import Link from "next/link";
import { useState } from "react";
import s from "./home-section-04.module.css";

/**
 * Homepage section 04 — "Cybersecurity" circular selector.
 * Per Homepage_04_Claude_Handoff.md (2026-09-08). Replaces the old
 * 10-category "security-index"/orbit section with the approved 3-sector
 * circle: 4 Packages / 12 À La Carte / 4 Specialist Engagements.
 *
 * Deliberately does NOT reuse the old "security-index" className — that
 * global rule in homepage-v3.css forces min-height:92vh (the same
 * viewport-relative-height issue found and fixed on the /services hero),
 * and the handoff says not to alter existing global styles. Left that
 * file completely untouched; this component uses only its own CSS Module
 * classes, so the old rule is simply unused now rather than modified or
 * fought with.
 *
 * SSR note: all three offering panels are rendered unconditionally below
 * and hidden with the native `hidden` attribute (not conditionally
 * unmounted via `{selected===i && ...}`), so all three descriptions and
 * links are present in the server-rendered HTML regardless of which is
 * selected on first load — required per the handoff's SEO/GEO section.
 *
 * Judgment call flagged per the handoff's own request: the doc asks for
 * "three compact native selector buttons at widths where the circle
 * would require tiny text" without naming a breakpoint. Set at 359px and
 * below (see the .module.css file) — the circle is kept for the large
 * majority of real phones (360px+), buttons only for genuinely narrow/
 * older devices. Easy to move if it looks wrong on an actual device.
 */

type Offering = {
  label: string;
  count: string;
  name: string;
  copy: string;
  linkLabel: string;
  href: string;
};

const OFFERINGS: readonly Offering[] = [
  {
    label: "01 / PACKAGES",
    count: "4",
    name: "Packages",
    copy: "Four levels of protection: Foundation, Advanced, Comprehensive and Elite.",
    linkLabel: "Explore Packages",
    href: "/services#service-packages",
  },
  {
    label: "02 / À LA CARTE",
    count: "12",
    name: "À La Carte",
    copy: "Targeted support for specific needs, available individually or alongside a package.",
    linkLabel: "Explore Individual Services",
    href: "/services#individual-services",
  },
  {
    label: "03 / SPECIALIST ENGAGEMENTS",
    count: "4",
    name: "Specialist Engagements",
    copy: "Penetration testing, SOC 2 attestation, PCI-DSS assessment and forensic incident response.",
    linkLabel: "Discuss an Engagement",
    // Confirmed destination per the handoff is https://orgro.ca/contact —
    // this homepage IS that site, so a relative Link gives the same
    // destination via normal client-side navigation instead of a full
    // page reload.
    href: "/contact",
  },
] as const;

// Subtle "selected" shading only — outer sectors stay graphite, never
// orange, per the handoff ("Do not turn the outer sectors orange").
const SECTOR_ACTIVE = "#5c5b5b";
const SECTOR_BASE = "#454a53";
const SECTOR_DIVIDER = "#92959b";

function wheelBackground(selected: number) {
  const shade = (i: number) => (i === selected ? SECTOR_ACTIVE : SECTOR_BASE);
  return `conic-gradient(from 0deg, ${shade(0)} 0deg 119.5deg, ${SECTOR_DIVIDER} 119.5deg 120deg, ${shade(1)} 120deg 239.5deg, ${SECTOR_DIVIDER} 239.5deg 240deg, ${shade(2)} 240deg 359.5deg, ${SECTOR_DIVIDER} 359.5deg 360deg)`;
}

function HomeCybersecurity() {
  const [selected, setSelected] = useState(0);

  const sectors = (
    <>
      {OFFERINGS.map((o, i) => (
        <button
          key={o.name}
          type="button"
          className={s.sectorButton}
          data-index={i}
          aria-pressed={selected === i}
          onClick={() => setSelected(i)}
        >
          <strong>{o.count}</strong>
          <span>{o.name}</span>
        </button>
      ))}
    </>
  );

  return (
    <section
      className={s.section}
      id="home-cybersecurity"
      aria-labelledby="home-cyber-heading"
    >
      <p className={s.eyebrow}>04 / CYBERSECURITY</p>
      <div className={s.layout}>
        <div className={s.copy}>
          <h2 id="home-cyber-heading">
            Protection built around
            <br />
            <span>your business.</span>
          </h2>
          <p className={s.intro}>
            Choose a package, address a specific need or scope a specialist
            engagement.
          </p>
          <div className={s.detail} aria-live="polite">
            {OFFERINGS.map((o, i) => (
              <div key={o.name} hidden={selected !== i}>
                <small>{o.label}</small>
                <p>{o.copy}</p>
                <Link href={o.href}>
                  {o.linkLabel} <span aria-hidden="true">↗</span>
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div
          className={s.wheel}
          style={{ background: wheelBackground(selected) }}
          aria-label="Choose your cybersecurity support"
        >
          <div className={s.hub} aria-hidden="true">
            <div>
              CYBERSECURITY
              <span>
                Built around
                <br />
                your business
              </span>
            </div>
          </div>
          {sectors}
        </div>

        {/* Narrow-phone fallback (see .module.css breakpoint) — same
            offerings, same selected state, plain buttons instead of the
            circle so labels stay readable at very small widths. */}
        <div
          className={s.compactButtons}
          role="group"
          aria-label="Choose your cybersecurity support"
        >
          {OFFERINGS.map((o, i) => (
            <button
              key={o.name}
              type="button"
              aria-pressed={selected === i}
              onClick={() => setSelected(i)}
            >
              <strong>{o.count}</strong>
              <span>{o.name}</span>
            </button>
          ))}
        </div>
      </div>
      <div className={s.base}>
        <span>THREE WAYS TO BUILD YOUR PROTECTION</span>
        <span>
          SELECT A SEGMENT <span aria-hidden="true">↗</span>
        </span>
      </div>
    </section>
  );
}

export default HomeCybersecurity;
