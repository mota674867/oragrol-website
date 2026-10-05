"use client";

import { useId, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  SERVICE_PACKAGES,
  INDIVIDUAL_SERVICES,
  SPECIALIST_ENGAGEMENTS,
  type ServicesSelection,
} from "./services-catalog";
import { DetailsDialog } from "@/app/components/DetailsDialog";
import { packagesDetailsContent, specialistDetailsContent, aLaCarteDetailsContent } from "@/app/lib/services-details-content";

/**
 * Services page BODY only — rendered inside app/services/services-client.tsx,
 * between the page's existing header and its existing PreFooterCta/footer.
 * Do not add a header, CTA block or footer here.
 *
 * Dimension pass (2026-09-08): breakpoints and scroll-margin-top were
 * adjusted to match the sitewide conventions in app/gpt-pages.css so the
 * page doesn't feel like a rhythm mismatch against its neighbors.
 *
 * Note on hero height specifically: an earlier version of this pass also
 * forced height:calc(100svh - 88px) to literally match .hero/.ba-hero's
 * formula. That was wrong — those heroes carry enough content to fill a
 * full-viewport box reasonably on most aspect ratios; this one doesn't,
 * and the same formula produced a cramped hero on a short/wide 24" monitor
 * and a hero with a large dead gap before the next section on a tall/narrow
 * 14" laptop panel (confirmed via screenshots on both). Reverted to the
 * original min-height:730px with no forced height, so the hero sizes
 * itself from its own content plus a floor — the same on every screen,
 * regardless of viewport aspect ratio.
 *
 * Catalog data (packages/services/specialists) lives in services-catalog.ts,
 * a plain module without "use client" — it's re-exported below so existing
 * imports of SERVICE_PACKAGES etc. from this file keep working, but the
 * data itself is defined where both this client component and the server
 * page.tsx (for JSON-LD) can safely import it. See that file's top comment.
 *
 * Bilingual (D-086, Task #21): SERVICE_PACKAGES/INDIVIDUAL_SERVICES/
 * SPECIALIST_ENGAGEMENTS stay English-only in services-catalog.ts (used
 * as-is for JSON-LD in page.tsx, same precedent as the Homepage's
 * organizationJsonLd not being locale-branched). All *display* text below
 * is resolved via useTranslations("Services") instead, keyed off each
 * catalog entry's stable id/code — never off its English name/value/fit/
 * line fields, which are ignored for rendering purposes. The 25 package
 * "simple names" (e.g. "Mail Shield") are looked up in the `serviceNames`
 * namespace by their exact English string as it appears in
 * services-catalog.ts's `services` arrays.
 *
 * NOTE: the "Details / View what's included" accordion dialogs
 * (packagesDetailsContent/aLaCarteDetailsContent/specialistDetailsContent,
 * ~370 lines of descriptive prose from ORAGROL_Details_Claude_Complete.md)
 * are NOT yet translated — deliberately deferred, flagged in
 * PROJECT_MEMORY.md, not silently left English. They render English at
 * both `/services` and `/fr/services` for now.
 */
export { SERVICE_PACKAGES, INDIVIDUAL_SERVICES, SPECIALIST_ENGAGEMENTS };
export type { ServicesSelection };

export type ServicesPageProps = {
  /** Connect to the existing ScopeTray. Do not create a second cart. */
  onAddToScope: (selection: ServicesSelection) => void | Promise<void>;
  /** Return true only when the existing ScopeTray actually contains this selection. */
  isInScope: (selection: ServicesSelection) => boolean;
  /** Connect to the existing contact/scoping flow, preserving this exact specialty. */
  onDiscussEngagement: (engagement: { code: string; name: string }) => void | Promise<void>;
};

// English keeps the exact previous format ($2,756) — byte-identical, never
// touched. French Canadian currency convention puts the symbol after the
// number with a space-grouped thousands separator (2 756 $), matching the
// approved translation doc's own examples ("3 307 $/mois").
// Packages are cumulative (each tier = previous tier + new services). "What's included"
// shows them as layers: the services each tier adds (2026-10-06, Mohammad chose P1).
const PACKAGE_LAYERS = SERVICE_PACKAGES.map((p, i) => ({ id: p.id, items: i === 0 ? [...p.services] : p.services.filter(name => !(SERVICE_PACKAGES[i - 1].services as readonly string[]).includes(name)) }));

// À la carte display (2026-10-06, Mohammad chose "option C, compact, numbered 01–12"):
// grouped by theme, four door-opener services shown as large dark featured tiles.
// Order only affects this grid; catalog order elsewhere (scope, JSON-LD) is unchanged.
const ALC_ORDER = ["C01-S04", "C08-S03", "C09-S02", "C09-S03", "C09-S04", "C09-S01", "C05-S05", "C05-S03", "C06-S04", "C09-S05", "C07-S04", "C07-S05"];
const ALC_FEATURED = new Set(["C01-S04", "C09-S01", "C05-S05", "C07-S05"]);
const alcRank = (code: string) => { const i = ALC_ORDER.indexOf(code); return i === -1 ? 99 : i; };
const ALC_SERVICES = [...INDIVIDUAL_SERVICES].sort((a, b) => alcRank(a.code) - alcRank(b.code));

const money = (value: number, locale: string) =>
  locale === "fr" ? `${value.toLocaleString("fr-CA")} $` : `$${value.toLocaleString("en-CA")}`;

const packageSelection = (p: typeof SERVICE_PACKAGES[number]): ServicesSelection => ({ kind: "package", id: p.id, name: p.name, priceCAD: p.price, billing: "monthly", includedServices: p.services });
const serviceSelection = (s: typeof INDIVIDUAL_SERVICES[number]): ServicesSelection => ({ kind: "service", id: s.code, name: s.name, priceCAD: s.price, billing: s.billing });

function Action({ children, perform, disabled = false }: { children: React.ReactNode; perform: () => void | Promise<void>; disabled?: boolean }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return <div className="os-action"><button type="button" disabled={disabled || busy} onClick={async () => { setBusy(true); setError(""); try { await perform(); } catch { setError("Unable to complete this action. Please try again."); } finally { setBusy(false); } }}>{busy ? "Please wait…" : children}</button>{error && <p role="alert">{error}</p>}</div>;
}

export default function ServicesPage({ onAddToScope, isInScope, onDiscussEngagement }: ServicesPageProps) {
  const t = useTranslations("Services");
  const locale = useLocale();
  const [selected, setSelected] = useState(0);
  const uid = useId();
  const current = SERVICE_PACKAGES[selected];
  const selection = packageSelection(current);
  const addLabel = (added: boolean) => (added ? t("packages.addedToScope") : `${t("packages.addToScope")} ↗︎`);
  const addLabelIndividual = (added: boolean) => (added ? t("individual.addedToScope") : `${t("individual.addToScope")} ↗︎`);
  return <div className="oragrol-services">
    <style>{styles}</style>
    <section className="os-hero" aria-labelledby={`${uid}-title`}>
      <div className="os-watermark" aria-hidden="true">OR</div>
      <div className="os-kicker"><span>{t("hero.kicker1")}</span><span>{t("hero.kicker2")}</span></div>
      <div className="os-headline"><h1 id={`${uid}-title`}>{t("hero.headline1")}<span className="os-orange">.</span><br/><span>{t("hero.headline2a")}<br/>{t("hero.headline2b")}</span></h1><p>{t("hero.sub1")}<br/><span>{t("hero.sub2")}</span></p></div>
      <div className="os-hero-links">{[{ count: t("hero.packagesCount"), label: t("hero.packagesLabel"), detail: t("hero.packagesDetail"), href: "#service-packages" }, { count: t("hero.alaCarteCount"), label: t("hero.alaCarteLabel"), detail: t("hero.alaCarteDetail"), href: "#individual-services" }, { count: t("hero.specialistCount"), label: t("hero.specialistLabel"), detail: t("hero.specialistDetail"), href: "#specialist-engagements" }].map(item => <a key={item.href} href={item.href}><div><span className="os-orange">{item.count}</span><h2>{item.label}</h2><span aria-hidden="true">↘︎</span></div><p>{item.detail}</p></a>)}</div>
      <div className="os-kicker os-hero-end"><span>{t("hero.footerKicker")}</span><a href="#services-clarity">{t("hero.footerCta")} ↓</a></div>
    </section>

    <section className="os-clarity os-light" id="services-clarity" aria-labelledby={`${uid}-clarity`}>
      <div><p className="os-eyebrow">{t("clarity.eyebrow")}</p><h2 id={`${uid}-clarity`}>{t("clarity.headline1")}<br/>{t("clarity.headline2")}</h2></div>
      <div className="os-clarity-copy"><p>{t("clarity.body")}</p><ol><li>{t("clarity.step1")}</li><li>{t("clarity.step2")}</li><li>{t("clarity.step3")}</li></ol></div>
    </section>

    <section className="os-packages os-dark os-section" id="service-packages" aria-labelledby={`${uid}-packages`}>
      <div className="os-section-head"><p className="os-eyebrow">{t("packages.eyebrow")}</p><h2 id={`${uid}-packages`}>{t("packages.headline1")}<br/><span>{t("packages.headline2")}</span></h2><p>{t("packages.sub")}</p></div>
      <p className="os-price-note">{t("packages.priceNote")}</p>
      <div className="os-package-layout"><div className="os-selector" role="group" aria-label="Choose a cybersecurity package">{SERVICE_PACKAGES.map((p, i) => <button key={p.id} type="button" aria-pressed={selected === i} aria-controls={`${uid}-package-panel`} onClick={() => setSelected(i)}><span className="os-selector-top"><span>0{i + 1}</span><span>{t("packages.servicesCount", { n: p.services.length })}</span></span><span className="os-package-name">{p.name}</span><span className="os-selector-price">{money(p.price, locale)}<small>{t("money.moSuffix")}</small></span><span className="os-selector-value">{t(`packages.list.${p.id}.value`)}</span></button>)}</div>
        <div id={`${uid}-package-panel`} className="os-package-panel os-pk" aria-live="polite" aria-atomic="true">
          <div className="os-pk-hd"><div><p className="os-eyebrow">0{selected + 1} / {t("packages.layersSummary", { n: current.services.length, layers: selected + 1 })}</p><h3>{current.name}</h3><p className="os-package-value">{t(`packages.list.${current.id}.value`)}</p><p className="os-pk-fit"><span>{t("packages.idealFit")}</span> {t(`packages.list.${current.id}.fit`)}</p>{packagesDetailsContent[current.id] && <DetailsDialog category="CYBERSECURITY" onDark {...packagesDetailsContent[current.id]} action={{ label: addLabel(isInScope(selection)), onClick: () => onAddToScope(selection), disabled: isInScope(selection) }} />}</div><div className="os-pk-price"><p className="os-eyebrow">{t("packages.monthlyRateLabel")}</p><p className="os-main-price">{money(current.price, locale)}<small>{t("money.moSuffix")}</small></p></div></div>
          <p className="os-eyebrow os-pk-inc-label">{t("packages.whatsIncluded")}</p>
          <div className="os-pk-layers">{PACKAGE_LAYERS.map((layer, i) => { const included = i <= selected; const isNew = i === selected && selected > 0; const next = i === selected + 1; const cls = included ? (isNew ? "os-pk-layer is-new" : "os-pk-layer") : "os-pk-layer is-off"; return <div key={layer.id} className={cls}><div className="os-pk-layer-name"><h4>{t(`packages.layers.${layer.id}`)}</h4><small>{included ? (isNew ? t("packages.layerNew", { pkg: current.name, n: layer.items.length }) : t("packages.layerIncluded", { n: layer.items.length })) : t("packages.layerIn", { pkg: SERVICE_PACKAGES[i].name, n: layer.items.length })}</small></div><ul className="os-pk-chips">{layer.items.map(name => <li key={name}>{t(`serviceNames.${name}`)}</li>)}</ul>{next ? <button type="button" className="os-pk-upgrade" onClick={() => setSelected(i)}>{t("packages.layerUpgrade", { pkg: SERVICE_PACKAGES[i].name, price: `${money(SERVICE_PACKAGES[i].price - current.price, locale)}${t("money.moSuffix")}` })}</button> : null}</div>; })}</div>
          <div className="os-package-bottom os-pk-ft"><p>{t("packages.initialOption", { price: `${money(current.initialPrice, locale)}${t("money.moSuffix")}` })}</p><Action disabled={isInScope(selection)} perform={() => onAddToScope(selection)}>{addLabel(isInScope(selection))}</Action></div></div>
      </div>
      {SERVICE_PACKAGES.filter(p => p.id !== current.id).map(p => packagesDetailsContent[p.id] ? <span key={p.id} style={{ position: "absolute", width: "1px", height: "1px", padding: 0, margin: "-1px", overflow: "hidden", clipPath: "inset(50%)", whiteSpace: "nowrap", border: 0 }}><DetailsDialog category="CYBERSECURITY" onDark {...packagesDetailsContent[p.id]} action={{ label: addLabel(isInScope(packageSelection(p))), onClick: () => onAddToScope(packageSelection(p)), disabled: isInScope(packageSelection(p)) }} /></span> : null)}
    </section>

    <section className="os-individual os-light os-section" id="individual-services" aria-labelledby={`${uid}-individual`}>
      <div className="os-section-head"><p className="os-eyebrow">{t("individual.eyebrow")}</p><h2 id={`${uid}-individual`}>{t("individual.headline1")}<br/>{t("individual.headline2")}</h2><p>{t("individual.sub")}</p></div>
      <p className="os-price-note">{t("individual.priceNote")}</p>
      <div className="os-service-grid">{ALC_SERVICES.map((s, i) => { const item = serviceSelection(s); const added = isInScope(item); const feat = ALC_FEATURED.has(s.code); return <article key={s.code} className={feat ? "os-service-card is-feat" : "os-service-card"}><span className="os-alc-idx" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span><p className="os-eyebrow">{s.billing === "monthly" ? t("individual.monthlyService") : t("individual.projectService")}</p><h3>{s.name}</h3><p className="os-description">{t(`individual.list.${s.code}.line`)}</p>{aLaCarteDetailsContent[s.code] && <DetailsDialog category="CYBERSECURITY" onDark={feat} {...aLaCarteDetailsContent[s.code]} action={{ label: addLabelIndividual(added), onClick: () => onAddToScope(item), disabled: added }} />}<div className="os-card-price">{money(s.price, locale)}<small>{s.billing === "monthly" ? t("money.moSuffix") : s.billing === "per-application" ? t("money.appSuffix") : ""}</small></div><p className="os-billing">{s.billing === "monthly" ? t("individual.monthlyBilling") : s.billing === "per-application" ? t("individual.perApplicationBilling") : t("individual.oneTimeBilling")}</p><Action disabled={added} perform={() => onAddToScope(item)}>{addLabelIndividual(added)}</Action></article>; })}</div>
    </section>

    <section className="os-specialists os-dark os-section" id="specialist-engagements" aria-labelledby={`${uid}-specialists`}>
      <div className="os-section-head"><p className="os-eyebrow">{t("specialists.eyebrow")}</p><h2 id={`${uid}-specialists`}>{t("specialists.headline1")}<br/><span>{t("specialists.headline2")}</span></h2><p>{t("specialists.sub")}</p></div>
      <p className="os-price-note">{t("specialists.priceNote")}</p>
      <div className="os-specialist-grid">{SPECIALIST_ENGAGEMENTS.map((s, i) => <article className="os-specialist-card" key={s.code}><span className="os-sp-idx" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span><h3>{s.name}</h3><p className="os-description">{t(`specialists.list.${s.code}.line`)}</p>{specialistDetailsContent[s.code] && <DetailsDialog category="SPECIALIST ENGAGEMENT" onDark {...specialistDetailsContent[s.code]} action={{ label: `${t("specialists.discussEngagement")} ↗︎`, onClick: () => onDiscussEngagement({ code: s.code, name: s.name }) }} />}<div className="os-engagement-prices"><p className="os-engagement-price-main">{s.priceLine}</p>{s.secondaryPriceLine ? <p className="os-engagement-price-secondary">{s.secondaryPriceLine}</p> : null}</div><Action perform={() => onDiscussEngagement({ code: s.code, name: s.name })}>{t("specialists.discussEngagement")} ↗︎</Action></article>)}</div>
    </section>
  </div>;
}

const styles = `
.oragrol-services{--os-dark:#141618;--os-light:#cecec7;--os-ink:#111416;--os-muted:#a8abad;--os-line:#3e4245;--os-orange:#ef4d00;font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;font-stretch:normal;color:#f2f2ef;background:var(--os-dark);line-height:1.5}
.oragrol-services *{box-sizing:border-box}.oragrol-services h1,.oragrol-services h2,.oragrol-services h3,.oragrol-services p{margin:0}.oragrol-services a{color:inherit;text-decoration:none}.oragrol-services button{font:inherit;cursor:pointer}.oragrol-services button:disabled{cursor:default;opacity:.7}.oragrol-services :is(a,button):focus-visible{outline:2px solid var(--os-orange);outline-offset:5px}.oragrol-services section[id]{scroll-margin-top:28px}.oragrol-services .os-orange{color:var(--os-orange)}
.os-hero{position:relative;isolation:isolate;overflow:hidden;padding:34px 4% 28px;min-height:730px;display:flex;flex-direction:column;justify-content:space-between}.os-watermark{position:absolute;right:-45px;top:12%;font-size:clamp(350px,48vw,850px);line-height:1;font-weight:300;letter-spacing:-.1em;color:#202325;z-index:-1;pointer-events:none}.os-kicker{display:flex;justify-content:space-between;gap:20px;font-size:12px;letter-spacing:.14em;color:#afb2b4}.os-headline{padding:70px 0 60px}.os-headline h1{font-size:clamp(44px,7.3vw,120px);font-weight:400;letter-spacing:-.055em;line-height:.98}.os-headline h1>span:not(.os-orange){color:#a8abad}.os-headline>p{font-size:16px;line-height:1.65;margin-top:28px;color:#d0d1d1}.os-headline>p span{color:#a8abad}.os-hero-links{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));border-top:1px solid #626668;border-bottom:1px solid var(--os-line)}.os-hero-links>a{padding:24px 28px;border-right:1px solid var(--os-line)}.os-hero-links>a:first-child{padding-left:0}.os-hero-links>a:last-child{border:0}.os-hero-links>a>div{display:flex;align-items:baseline;gap:15px}.os-hero-links h2{font-size:clamp(19px,1.9vw,29px);font-weight:400;letter-spacing:-.025em}.os-hero-links>a>div>span:last-child{margin-left:auto}.os-hero-links p{font-size:14px;color:#adb0b1;margin-top:10px}.os-hero-links>a:hover h2{text-decoration:underline;text-underline-offset:6px}.os-hero-end{padding-top:24px;font-size:12px}
.os-light{background:var(--os-light);color:var(--os-ink)}.os-dark{background:var(--os-dark);color:#f2f2ef}.os-eyebrow{font-size:12px;letter-spacing:.14em;line-height:1.6}.os-clarity{padding:90px 4%;display:grid;grid-template-columns:1.2fr 1fr;gap:9%}.os-clarity h2{font-size:clamp(42px,6.2vw,96px);font-weight:400;letter-spacing:-.055em;line-height:1.02;margin-top:30px}.os-clarity-copy{padding-top:30px}.os-clarity-copy>p{font-size:16px;max-width:550px}.os-clarity ol{list-style:none;counter-reset:steps;margin:35px 0 0;padding:0}.os-clarity li{counter-increment:steps;border-top:1px solid #969a97;padding:15px 0;font-size:14px}.os-clarity li:before{content:'0' counter(steps);margin-right:20px}
.os-section{padding:85px 4%}.os-section-head{display:grid;grid-template-columns:.7fr 1.4fr 1fr;gap:35px;align-items:start;margin-bottom:35px}.os-section-head h2{font-size:clamp(35px,4.1vw,65px);font-weight:400;line-height:1.08;letter-spacing:-.05em}.os-section-head h2 span{color:#a8abad}.os-section-head>p:last-child{font-size:16px;align-self:end;max-width:380px}.os-price-note{font-size:14px;line-height:1.6;color:#b7bbbd;margin-bottom:24px!important;max-width:950px}.os-light .os-price-note{color:#444a4c}.os-package-layout{display:grid;grid-template-columns:30% 70%;border-top:1px solid #686c6e;border-bottom:1px solid var(--os-line)}.os-selector{border-right:1px solid var(--os-line)}.os-selector button{display:block;text-align:left;width:100%;padding:23px 25px;background:transparent;color:inherit;border:0;border-bottom:1px solid var(--os-line)}.os-selector button[aria-pressed=true]{background:#e5e3da;color:#141618}.os-selector-top{display:flex;justify-content:space-between;font-size:12px;letter-spacing:.08em}.os-package-name{display:block;font-size:27px;letter-spacing:-.025em;margin:10px 0}.os-selector-price{display:block;font-size:22px}.os-selector-price small{font-size:14px;margin-left:4px}.os-selector-value{display:block;font-size:14px;margin-top:10px}.os-package-panel{padding:35px 4%}.os-package-panel>h3{font-size:clamp(35px,4.7vw,72px);font-weight:400;letter-spacing:-.05em;margin:10px 0}.os-package-value{font-size:20px;color:#c2c5c6}.os-package-summary{display:grid;grid-template-columns:1.2fr 1fr;gap:30px;border-top:1px solid var(--os-line);padding-top:25px;margin:30px 0}.os-package-summary .os-eyebrow{color:#b0b4b5;margin-bottom:10px}.os-main-price{font-size:36px!important;letter-spacing:-.03em}.os-main-price small{font-size:16px;margin-left:5px}.os-inclusions{list-style:none;display:grid;grid-template-columns:1fr 1fr;column-gap:25px;padding:0;margin:12px 0 30px}.os-inclusions li{font-size:15px;padding:9px 0;border-bottom:1px solid var(--os-line)}.os-package-bottom>p{font-size:14px;color:#bfc2c3;margin-bottom:18px}.os-action button{background:transparent;color:inherit;border:0;border-top:1px solid currentColor;border-bottom:1px solid currentColor;padding:13px 0;text-align:left;min-height:46px;font-size:15px}.os-action button:hover:not(:disabled){color:var(--os-orange)}.os-action>p{font-size:14px;margin-top:8px;color:inherit}
.os-service-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));border-top:1px solid #999e9b;border-left:1px solid #999e9b}.os-service-card{padding:28px;display:flex;flex-direction:column;border-right:1px solid #999e9b;border-bottom:1px solid #999e9b}.os-service-card h3{font-size:25px;line-height:1.15;letter-spacing:-.03em;font-weight:400;margin:17px 0}.os-description{font-size:16px;line-height:1.6}.os-service-card .os-description{flex:1;margin-bottom:28px}.os-card-price{font-size:32px;letter-spacing:-.025em}.os-card-price small{font-size:16px}.os-billing,.os-standalone{font-size:14px}.os-standalone{margin:13px 0 20px!important;color:#454a4b}.os-service-card .os-action button{width:100%}.os-specialist-grid{display:grid;grid-template-columns:1fr 1fr;border-top:1px solid #666b6d}.os-specialist-card{padding:35px 35px 35px 0;border-bottom:1px solid var(--os-line);display:flex;flex-direction:column}.os-specialist-card:nth-child(even){padding-left:35px;border-left:1px solid var(--os-line)}.os-specialist-card h3{font-size:34px;font-weight:400;letter-spacing:-.035em;line-height:1.15;margin:20px 0}.os-specialist-card .os-description{max-width:550px;color:#bec2c4}.os-engagement-prices{margin:28px 0;flex:1}.os-engagement-price-main{font-size:25px;letter-spacing:-.025em}.os-engagement-price-secondary{font-size:14px;color:#b6bbbd;margin-top:8px}
@media(min-width:1400px){.os-headline{position:relative}.os-headline>p{position:absolute;right:0;bottom:65px;max-width:310px}}
@media(max-width:1100px){.os-section-head{grid-template-columns:1fr 2fr}.os-section-head>p:last-child{grid-column:2}.os-package-layout{grid-template-columns:35% 65%}.os-selector button{padding:20px 16px}.os-package-summary{grid-template-columns:1fr}.os-service-grid{grid-template-columns:1fr 1fr}.os-package-name{font-size:23px}.os-hero-links>a{padding:20px 16px}.os-section-head h2{font-size:42px}}
@media(max-width:700px){.os-hero{padding:25px 22px;min-height:auto}.os-kicker{font-size:10px;letter-spacing:.08em}.os-kicker>span:last-child{text-align:right;max-width:110px}.os-headline{padding:50px 0 35px}.os-headline h1{font-size:clamp(27px,7.55vw,49px);letter-spacing:-.045em;overflow-wrap:normal}.os-watermark{font-size:380px;top:120px;right:-85px}.os-headline>p{font-size:16px}.os-hero-links{grid-template-columns:1fr}.os-hero-links>a,.os-hero-links>a:first-child,.os-hero-links>a:last-child{padding:19px 0;border:0;border-bottom:1px solid var(--os-line)}.os-hero-links>a:last-child{border-bottom:0}.os-hero-links h2{font-size:23px}.os-hero-end{font-size:10px}.os-clarity{padding:55px 22px;grid-template-columns:1fr;gap:20px}.os-clarity h2{font-size:50px}.os-clarity-copy{padding:0}.os-section{padding:55px 22px}.os-section-head{display:block;margin-bottom:25px}.os-section-head h2{font-size:41px;margin:18px 0}.os-section-head>p:last-child{max-width:none}.os-package-layout{display:block}.os-selector{display:grid;grid-template-columns:1fr 1fr;border:0}.os-selector button{border:1px solid var(--os-line);padding:17px 12px}.os-package-name{font-size:20px;overflow-wrap:anywhere}.os-selector-price{font-size:21px}.os-selector-top{font-size:10px}.os-selector-value{font-size:14px}.os-package-panel{padding:30px 0 0}.os-package-panel>h3{font-size:38px}.os-inclusions{grid-template-columns:1fr}.os-service-grid,.os-specialist-grid{grid-template-columns:1fr}.os-service-card{padding:25px}.os-specialist-card,.os-specialist-card:nth-child(even){padding:30px 0;border-left:0}.os-specialist-card h3{font-size:30px}}
@media(prefers-reduced-motion:reduce){.oragrol-services{scroll-behavior:auto}}

/* À la carte — option C, compact, numbered (2026-10-06) */
.os-individual .os-service-grid{grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;border:0;grid-auto-flow:dense}
.os-individual .os-service-card{background:#e8e6df;border:0;padding:20px 20px 16px;position:relative;overflow:hidden}
.os-individual .os-alc-idx{position:absolute;top:12px;right:16px;font-size:44px;font-weight:300;letter-spacing:-.06em;line-height:1;color:#c4c1b8;pointer-events:none}
.os-individual .os-service-card .os-eyebrow{font-size:9px;margin:0;color:#6a6e70}
.os-individual .os-service-card h3{font-size:20px;margin:8px 0 6px;max-width:78%}
.os-individual .os-service-card .os-description{font-size:13px;line-height:1.45;color:#55595c;margin-bottom:6px}
.os-individual .os-service-card>span[style] button{margin-top:0!important;min-height:34px!important;padding:2px 0!important}
.os-individual .os-card-price{font-size:26px;border-top:1px solid #bdbab1;padding-top:10px;margin-top:4px}
.os-individual .os-card-price small{font-size:13px}
.os-individual .os-billing{font-size:11px;color:#55595c;margin:1px 0 10px}
.os-individual .os-standalone{display:none}
.os-individual .os-action button{font-size:13px;padding:9px 0;min-height:38px}
.os-individual .os-service-card.is-feat{grid-column:span 2;background:#141618;color:#f2f0ea;padding:24px 26px 20px}
.os-individual .os-service-card.is-feat::after{content:"OR";position:absolute;right:-.06em;bottom:-.22em;font-size:170px;letter-spacing:-.1em;color:rgba(239,77,0,.13);line-height:1;pointer-events:none}
.os-individual .is-feat .os-alc-idx{color:#ef4d00;font-size:56px;top:14px;right:22px}
.os-individual .is-feat .os-eyebrow{color:#b9bcbe}
.os-individual .os-service-card.is-feat h3{font-size:30px}
.os-individual .os-service-card.is-feat .os-description,.os-individual .is-feat .os-billing{color:#b9bcbe}
.os-individual .is-feat .os-card-price{font-size:40px;color:#ef4d00;border-color:#3a3d40}
.os-individual .is-feat .os-card-price small{font-size:16px}
.os-individual .is-feat .os-action{position:relative;z-index:1}
.os-individual .is-feat .os-action button{background:#ef4d00;color:#111;border:0;padding:12px 16px}
.os-individual .is-feat .os-action button:hover:not(:disabled){background:#f2f0ea;color:#111}
@media(max-width:1100px){.os-individual .os-service-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:700px){
.os-individual .os-service-grid{gap:8px}
.os-individual .os-service-card{padding:16px 14px 12px}
.os-individual .os-alc-idx{font-size:30px;top:10px;right:10px}
.os-individual .os-service-card h3{font-size:16px;max-width:none;margin-top:26px}
.os-individual .os-service-card .os-eyebrow{font-size:8px}
.os-individual .os-service-card .os-description{font-size:12px}
.os-individual .os-card-price{font-size:21px}
.os-individual .os-card-price small{font-size:11px}
.os-individual .os-billing{font-size:10px}
.os-individual .os-action button{font-size:12px}
.os-individual .os-service-card.is-feat{padding:20px 18px 16px}
.os-individual .is-feat .os-alc-idx{font-size:42px}
.os-individual .os-service-card.is-feat h3{font-size:24px;margin-top:22px}
.os-individual .is-feat .os-card-price{font-size:32px}
.os-individual .os-service-card.is-feat::after{font-size:120px}}

/* Specialist engagements — option 3, four compact dark tiles, numbered (2026-10-06) */
.os-specialists .os-specialist-grid{border:0;gap:10px}
.os-specialists .os-specialist-card,.os-specialists .os-specialist-card:nth-child(even){position:relative;overflow:hidden;border:0;padding:24px 26px 20px}
.os-specialists .os-sp-idx{position:absolute;top:14px;right:22px;font-size:56px;font-weight:300;letter-spacing:-.06em;line-height:1;pointer-events:none}
.os-specialists .os-specialist-card h3{font-size:28px;margin:6px 0 8px;max-width:80%}
.os-specialists .os-specialist-card .os-description{font-size:14px;line-height:1.5;flex:1;margin:0 0 4px}
.os-specialists .os-specialist-card>span[style] button{margin-top:0!important;min-height:34px!important;padding:2px 0!important}
.os-specialists .os-engagement-prices{padding-top:12px;margin:6px 0 14px}
.os-specialists .os-engagement-price-main{font-size:24px;line-height:1.25;letter-spacing:-.02em;margin:0}
.os-specialists .os-engagement-price-secondary{font-size:12px;margin:4px 0 0}
.os-specialists .os-action{position:relative;z-index:1}
.os-specialists .os-action button{border:0;padding:12px 16px;min-height:0;font-size:13px;width:100%}
@media(max-width:700px){.os-specialists .os-specialist-grid{grid-template-columns:1fr;gap:8px}
.os-specialists .os-specialist-card,.os-specialists .os-specialist-card:nth-child(even){padding:20px 18px 16px}
.os-specialists .os-sp-idx{font-size:42px;top:12px;right:14px}.os-specialists .os-specialist-card h3{font-size:23px;margin-top:22px}
.os-specialists .os-engagement-price-main{font-size:20px}}

.os-specialists .os-specialist-card{background:#202326}
.os-specialists .os-specialist-card::after{content:"OR";position:absolute;right:-.06em;bottom:-.22em;font-size:170px;letter-spacing:-.1em;color:rgba(239,77,0,.11);line-height:1;pointer-events:none}
.os-specialists .os-sp-idx{color:#ef4d00}
.os-specialists .os-engagement-prices{border-top:1px solid #3a3d40}
.os-specialists .os-engagement-price-main{color:#ef4d00}
.os-specialists .os-action button{background:#ef4d00;color:#111}
.os-specialists .os-action button:hover:not(:disabled){background:#f2f0ea;color:#111}
@media(min-width:1101px){.os-specialists .os-specialist-grid{grid-template-columns:repeat(4,minmax(0,1fr))}.os-specialists .os-specialist-card h3{font-size:24px;max-width:72%}.os-specialists .os-engagement-price-main{font-size:20px}}
/* Packages "What's included" — P1 layered coverage (2026-10-06) */
.os-packages .os-selector-value{display:none}
.os-packages .os-selector button[aria-pressed="true"]{position:relative}
.os-packages .os-selector button[aria-pressed="true"]::before{content:"";position:absolute;left:0;top:0;bottom:0;width:4px;background:var(--os-orange,#ef4d00)}
.os-pk{padding-top:28px}
.os-pk .os-pk-hd{display:grid;grid-template-columns:1fr auto;gap:30px;align-items:end;padding-bottom:20px;border-bottom:1px solid #34373a}
.os-pk .os-pk-hd h3{font-size:clamp(46px,4.6vw,66px);font-weight:400;letter-spacing:-.05em;line-height:.92;margin:6px 0 10px}
.os-pk .os-package-value{margin:0;color:#c9cccd}
.os-pk .os-pk-fit{margin:8px 0 0;font-size:13px;line-height:1.5;color:#9fa3a6;max-width:560px}
.os-pk .os-pk-fit span{font-size:10px;letter-spacing:.16em;margin-right:6px}
.os-pk .os-pk-hd button[aria-describedby]{padding-left:0!important}
.os-pk .os-pk-price{text-align:right}
.os-pk .os-pk-price .os-main-price{font-size:clamp(34px,3.2vw,46px);letter-spacing:-.03em;color:#ef4d00;margin:4px 0 0}
.os-pk .os-pk-price .os-main-price small{font-size:16px;color:#f2f0ea}
.os-pk .os-pk-inc-label{margin:22px 0 10px}
.os-pk-layers{display:grid;gap:8px}
.os-pk-layer{display:grid;grid-template-columns:200px 1fr;gap:20px;padding:16px 18px;background:#1f2225;border-left:3px solid #3a3d40}
.os-pk-layer.is-new{border-left-color:#ef4d00;background:#26221f}
.os-pk-layer.is-off{background:transparent;border:1px dashed #3d4043}
.os-pk-layer h4{margin:0;font-size:16px;font-weight:400;color:#f2f0ea}
.os-pk-layer small{display:block;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#9fa3a6;margin-top:6px}
.os-pk-layer.is-new small{color:#ef4d00}
.os-pk-chips{display:flex;flex-wrap:wrap;gap:6px;align-content:flex-start;list-style:none;margin:0;padding:0}
.os-pk-chips li{font-size:12.5px;padding:6px 11px;border:1px solid #45484b;border-radius:999px;color:#e6e4de;white-space:nowrap}
.os-pk-layer.is-new .os-pk-chips li{border-color:rgba(239,77,0,.55)}
.os-pk-layer.is-off .os-pk-chips li{color:#8a8e91;border-style:dashed}
.os-pk-upgrade{grid-column:2;justify-self:start;background:transparent;border:0;padding:4px 0;color:#ef4d00;font:inherit;font-size:12.5px;cursor:pointer;text-align:left}
.os-pk-upgrade:hover{text-decoration:underline;text-underline-offset:3px}
.os-pk .os-pk-ft{display:flex;justify-content:space-between;align-items:center;gap:20px;margin-top:22px;padding-top:18px;border-top:1px solid #34373a}
.os-pk .os-pk-ft>p{margin:0;font-size:13px;color:#b9bcbe}
.os-pk .os-pk-ft .os-action button{background:#ef4d00;color:#111;border:0;padding:13px 20px;min-height:0;font-size:13px;width:auto;white-space:nowrap}
.os-pk .os-pk-ft .os-action button:hover:not(:disabled){background:#f2f0ea;color:#111}
.os-pk .os-pk-ft .os-action button:disabled{opacity:.6}
@media(max-width:700px){
.os-packages .os-selector{display:grid;grid-template-columns:1fr 1fr}
.os-pk .os-pk-hd{grid-template-columns:1fr;gap:16px}
.os-pk .os-pk-price{text-align:left}
.os-pk-layer{grid-template-columns:1fr;gap:10px}
.os-pk-upgrade{grid-column:1}
.os-pk .os-pk-ft{flex-direction:column;align-items:flex-start}
.os-pk .os-pk-ft .os-action{width:100%}
.os-pk .os-pk-ft .os-action button{width:100%;text-align:left}}

/* P1 compact pass */
.os-packages .os-package-layout{grid-template-columns:24% 76%}
.os-packages .os-selector button{padding:16px 20px}
.os-packages .os-package-name{font-size:23px;margin:6px 0 4px}
.os-packages .os-selector-price{font-size:17px}
.os-packages .os-package-panel.os-pk{padding:22px 0 22px 3%}
.os-pk .os-pk-hd{padding-bottom:16px;gap:24px}
.os-pk .os-pk-hd h3{font-size:clamp(40px,3.8vw,54px);margin:4px 0 6px}
.os-pk .os-pk-fit{margin-top:6px;font-size:12.5px}
.os-pk .os-pk-hd button[aria-describedby]{min-height:32px!important;margin-top:2px!important}
.os-pk .os-pk-inc-label{margin:16px 0 8px}
.os-pk-layers{gap:6px}
.os-pk-layer{grid-template-columns:180px 1fr;gap:16px;padding:12px 16px}
.os-pk-layer h4{font-size:15px}
.os-pk-layer small{margin-top:4px}
.os-pk-chips{gap:5px}
.os-pk-chips li{font-size:12px;padding:4px 10px}
.os-pk-upgrade{padding:2px 0;font-size:12px}
.os-pk .os-pk-ft{margin-top:16px;padding-top:14px}
.os-pk .os-pk-layer .os-pk-upgrade{font-size:13px;line-height:1.4}
@media(max-width:1100px){.os-packages .os-package-layout{grid-template-columns:30% 70%}}
@media(max-width:700px){.os-packages .os-package-panel.os-pk{padding:18px 0}.os-packages .os-selector button{padding:12px}.os-packages .os-package-name{font-size:18px}.os-packages .os-selector-price{font-size:16px}.os-pk-layer{grid-template-columns:1fr;gap:8px;padding:12px 14px}.os-pk-chips li{white-space:normal}}
`;
