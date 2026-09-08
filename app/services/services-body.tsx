"use client";

import { useId, useState } from "react";
import {
  SERVICE_PACKAGES,
  INDIVIDUAL_SERVICES,
  SPECIALIST_ENGAGEMENTS,
  type ServicesSelection,
} from "./services-catalog";

/**
 * Services page BODY only — rendered inside app/services/services-client.tsx,
 * between the page's existing header and its existing PreFooterCta/footer.
 * Do not add a header, CTA block or footer here.
 *
 * Dimension pass (2026-09-08): hero height, breakpoints and scroll-margin-top
 * were adjusted from the original handoff to match the sitewide conventions
 * already used by .hero (/services' predecessor) and .ba-hero
 * (/business-automation) in app/gpt-pages.css, so the page doesn't feel like
 * a size/rhythm mismatch when navigating between it and neighboring pages.
 *
 * Catalog data (packages/services/specialists) lives in services-catalog.ts,
 * a plain module without "use client" — it's re-exported below so existing
 * imports of SERVICE_PACKAGES etc. from this file keep working, but the
 * data itself is defined where both this client component and the server
 * page.tsx (for JSON-LD) can safely import it. See that file's top comment.
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

const money = (value: number) => `$${value.toLocaleString("en-CA")}`;
const packageSelection = (p: typeof SERVICE_PACKAGES[number]): ServicesSelection => ({ kind: "package", id: p.id, name: p.name, priceCAD: p.price, billing: "monthly", includedServices: p.services });
const serviceSelection = (s: typeof INDIVIDUAL_SERVICES[number]): ServicesSelection => ({ kind: "service", id: s.code, name: s.name, priceCAD: s.price, billing: s.billing });

function Action({ children, perform, disabled = false }: { children: React.ReactNode; perform: () => void | Promise<void>; disabled?: boolean }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return <div className="os-action"><button type="button" disabled={disabled || busy} onClick={async () => { setBusy(true); setError(""); try { await perform(); } catch { setError("Unable to complete this action. Please try again."); } finally { setBusy(false); } }}>{busy ? "Please wait…" : children}</button>{error && <p role="alert">{error}</p>}</div>;
}

export default function ServicesPage({ onAddToScope, isInScope, onDiscussEngagement }: ServicesPageProps) {
  const [selected, setSelected] = useState(0);
  const uid = useId();
  const current = SERVICE_PACKAGES[selected];
  const selection = packageSelection(current);
  return <div className="oragrol-services">
    <style>{styles}</style>
    <section className="os-hero" aria-labelledby={`${uid}-title`}>
      <div className="os-watermark" aria-hidden="true">OR</div>
      <div className="os-kicker"><span>SERVICES / CYBERSECURITY</span><span>PROTECT / AUTOMATE / UNIFY</span></div>
      <div className="os-headline"><h1 id={`${uid}-title`}>CYBERSECURITY<span className="os-orange">.</span><br/><span>BUILT AROUND<br/>YOUR BUSINESS.</span></h1><p>ORAGROL delivers cybersecurity as four fixed packages, twelve individual services or specialist engagements.<br/><span>Choose the scope that fits how your business actually operates.</span></p></div>
      <div className="os-hero-links">{[{ count: "04", label: "Packages", detail: "Foundation to Elite", href: "#service-packages" }, { count: "12", label: "À La Carte", detail: "Available standalone", href: "#individual-services" }, { count: "04", label: "Specialist Services", detail: "Available by engagement", href: "#specialist-engagements" }].map(item => <a key={item.href} href={item.href}><div><span className="os-orange">{item.count}</span><h2>{item.label}</h2><span aria-hidden="true">↘</span></div><p>{item.detail}</p></a>)}</div>
      <div className="os-kicker os-hero-end"><span>BUILT FOR CANADIAN BUSINESS</span><a href="#services-clarity">CLARITY BEFORE COMPLEXITY ↓</a></div>
    </section>

    <section className="os-clarity os-light" id="services-clarity" aria-labelledby={`${uid}-clarity`}>
      <div><p className="os-eyebrow">NOT SURE WHERE TO START?</p><h2 id={`${uid}-clarity`}>Clarity before<br/>complexity.</h2></div>
      <div className="os-clarity-copy"><p>Start with your priorities. Your Cyber Health assessment can help identify areas to review before choosing a package, individual service or specialist engagement.</p><ol><li>Understand your position</li><li>Prioritize what needs attention</li><li>Choose the scope that fits</li></ol></div>
    </section>

    <section className="os-packages os-dark os-section" id="service-packages" aria-labelledby={`${uid}-packages`}>
      <div className="os-section-head"><p className="os-eyebrow">04 / CHOOSE YOUR PROTECTION</p><h2 id={`${uid}-packages`}>Four packages.<br/><span>One clear starting point.</span></h2><p>Select a package to explore its fit and included services. Add your preferred scope for review.</p></div>
      <p className="os-price-note">Prices in CAD. Package rates below are monthly rates for a 12-month contract.</p>
      <div className="os-package-layout"><div className="os-selector" role="group" aria-label="Choose a cybersecurity package">{SERVICE_PACKAGES.map((p, i) => <button key={p.id} type="button" aria-pressed={selected === i} aria-controls={`${uid}-package-panel`} onClick={() => setSelected(i)}><span className="os-selector-top"><span>0{i + 1}</span><span>{p.services.length} SERVICES</span></span><span className="os-package-name">{p.name}</span><span className="os-selector-price">{money(p.price)}<small>/mo</small></span><span className="os-selector-value">{p.value}</span></button>)}</div>
        <div id={`${uid}-package-panel`} className="os-package-panel" aria-live="polite" aria-atomic="true"><p className="os-eyebrow">{current.services.length} INCLUDED SERVICES</p><h3>{current.name}</h3><p className="os-package-value">{current.value}</p><div className="os-package-summary"><div><p className="os-eyebrow">IDEAL FIT</p><p>{current.fit}</p></div><div><p className="os-eyebrow">MONTHLY RATE · 12-MONTH CONTRACT</p><p className="os-main-price">{money(current.price)}<small>/mo</small></p></div></div><p className="os-eyebrow">WHAT&apos;S INCLUDED</p><ul className="os-inclusions">{current.services.map(name => <li key={name}>{name}</li>)}</ul><div className="os-package-bottom"><p>Initial three-month option: {money(current.initialPrice)}/mo. Then moves into a 12-month standard contract.</p><Action disabled={isInScope(selection)} perform={() => onAddToScope(selection)}>{isInScope(selection) ? "Added to My Scope" : "Add to My Scope ↗"}</Action></div></div>
      </div>
    </section>

    <section className="os-individual os-light os-section" id="individual-services" aria-labelledby={`${uid}-individual`}>
      <div className="os-section-head"><p className="os-eyebrow">12 / À LA CARTE</p><h2 id={`${uid}-individual`}>The capability<br/>you need.</h2><p>Choose an individual service, available standalone or alongside a package.</p></div>
      <p className="os-price-note">Prices in CAD. Monthly rates are for a 12-month contract. An initial three-month option carries a 20% uplift, then moves into a 12-month standard contract. Project services have no recurring term.</p>
      <div className="os-service-grid">{INDIVIDUAL_SERVICES.map(s => { const item = serviceSelection(s); const added = isInScope(item); return <article key={s.code} className="os-service-card"><p className="os-eyebrow">{s.billing === "monthly" ? "MONTHLY SERVICE" : "PROJECT SERVICE"}</p><h3>{s.name}</h3><p className="os-description">{s.line}</p><div className="os-card-price">{money(s.price)}<small>{s.billing === "monthly" ? "/mo" : s.billing === "per-application" ? "/app" : ""}</small></div><p className="os-billing">{s.billing === "monthly" ? "Monthly recurring" : s.billing === "per-application" ? "One-time / project · per application" : "One-time / project"}</p><p className="os-standalone">Available standalone.</p><Action disabled={added} perform={() => onAddToScope(item)}>{added ? "Added to My Scope" : "Add to My Scope ↗"}</Action></article>; })}</div>
    </section>

    <section className="os-specialists os-dark os-section" id="specialist-engagements" aria-labelledby={`${uid}-specialists`}>
      <div className="os-section-head"><p className="os-eyebrow">04 / SPECIALIST ENGAGEMENTS</p><h2 id={`${uid}-specialists`}>Specialist expertise.<br/><span>Defined engagements.</span></h2><p>Available by Engagement. Confirm requirements, boundaries and the appropriate specialist before work begins.</p></div>
      <p className="os-price-note">Indicative engagement ranges in CAD. Final scope and fees are confirmed in your proposal.</p>
      <div className="os-specialist-grid">{SPECIALIST_ENGAGEMENTS.map((s, i) => <article className="os-specialist-card" key={s.code}><p className="os-eyebrow">0{i + 1} / AVAILABLE BY ENGAGEMENT</p><h3>{s.name}</h3><p className="os-description">{s.line}</p><div className="os-engagement-prices">{s.prices.map(p => <div key={p.model}><p>{p.amount}</p><span>{p.model}</span></div>)}</div><Action perform={() => onDiscussEngagement({ code: s.code, name: s.name })}>Discuss Your Engagement ↗</Action></article>)}</div>
    </section>
  </div>;
}

const styles = `
.oragrol-services{--os-dark:#141618;--os-light:#cecec7;--os-ink:#111416;--os-muted:#a8abad;--os-line:#3e4245;--os-orange:#ef4d00;font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;font-stretch:normal;color:#f2f2ef;background:var(--os-dark);line-height:1.5}
.oragrol-services *{box-sizing:border-box}.oragrol-services h1,.oragrol-services h2,.oragrol-services h3,.oragrol-services p{margin:0}.oragrol-services a{color:inherit;text-decoration:none}.oragrol-services button{font:inherit;cursor:pointer}.oragrol-services button:disabled{cursor:default;opacity:.7}.oragrol-services :is(a,button):focus-visible{outline:2px solid var(--os-orange);outline-offset:5px}.oragrol-services section[id]{scroll-margin-top:28px}.oragrol-services .os-orange{color:var(--os-orange)}
.os-hero{position:relative;isolation:isolate;overflow:hidden;padding:34px 4% 28px;height:calc(100svh - 88px);min-height:max(680px,calc(100svh - 88px));display:flex;flex-direction:column;justify-content:space-between}.os-watermark{position:absolute;right:-45px;top:12%;font-size:clamp(350px,48vw,850px);line-height:1;font-weight:300;letter-spacing:-.1em;color:#202325;z-index:-1;pointer-events:none}.os-kicker{display:flex;justify-content:space-between;gap:20px;font-size:12px;letter-spacing:.14em;color:#afb2b4}.os-headline{padding:70px 0 60px}.os-headline h1{font-size:clamp(44px,7.3vw,120px);font-weight:400;letter-spacing:-.055em;line-height:.98}.os-headline h1>span:not(.os-orange){color:#a8abad}.os-headline>p{font-size:16px;line-height:1.65;margin-top:28px;color:#d0d1d1}.os-headline>p span{color:#a8abad}.os-hero-links{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));border-top:1px solid #626668;border-bottom:1px solid var(--os-line)}.os-hero-links>a{padding:24px 28px;border-right:1px solid var(--os-line)}.os-hero-links>a:first-child{padding-left:0}.os-hero-links>a:last-child{border:0}.os-hero-links>a>div{display:flex;align-items:baseline;gap:15px}.os-hero-links h2{font-size:clamp(19px,1.9vw,29px);font-weight:400;letter-spacing:-.025em}.os-hero-links>a>div>span:last-child{margin-left:auto}.os-hero-links p{font-size:14px;color:#adb0b1;margin-top:10px}.os-hero-links>a:hover h2{text-decoration:underline;text-underline-offset:6px}.os-hero-end{padding-top:24px;font-size:12px}
.os-light{background:var(--os-light);color:var(--os-ink)}.os-dark{background:var(--os-dark);color:#f2f2ef}.os-eyebrow{font-size:12px;letter-spacing:.14em;line-height:1.6}.os-clarity{padding:90px 4%;display:grid;grid-template-columns:1.2fr 1fr;gap:9%}.os-clarity h2{font-size:clamp(42px,6.2vw,96px);font-weight:400;letter-spacing:-.055em;line-height:1.02;margin-top:30px}.os-clarity-copy{padding-top:30px}.os-clarity-copy>p{font-size:16px;max-width:550px}.os-clarity ol{list-style:none;counter-reset:steps;margin:35px 0 0;padding:0}.os-clarity li{counter-increment:steps;border-top:1px solid #969a97;padding:15px 0;font-size:14px}.os-clarity li:before{content:'0' counter(steps);margin-right:20px}
.os-section{padding:85px 4%}.os-section-head{display:grid;grid-template-columns:.7fr 1.4fr 1fr;gap:35px;align-items:start;margin-bottom:35px}.os-section-head h2{font-size:clamp(35px,4.1vw,65px);font-weight:400;line-height:1.08;letter-spacing:-.05em}.os-section-head h2 span{color:#a8abad}.os-section-head>p:last-child{font-size:16px;align-self:end;max-width:380px}.os-price-note{font-size:14px;line-height:1.6;color:#b7bbbd;margin-bottom:24px!important;max-width:950px}.os-light .os-price-note{color:#444a4c}.os-package-layout{display:grid;grid-template-columns:30% 70%;border-top:1px solid #686c6e;border-bottom:1px solid var(--os-line)}.os-selector{border-right:1px solid var(--os-line)}.os-selector button{display:block;text-align:left;width:100%;padding:23px 25px;background:transparent;color:inherit;border:0;border-bottom:1px solid var(--os-line)}.os-selector button[aria-pressed=true]{background:#e5e3da;color:#141618}.os-selector-top{display:flex;justify-content:space-between;font-size:12px;letter-spacing:.08em}.os-package-name{display:block;font-size:27px;letter-spacing:-.025em;margin:10px 0}.os-selector-price{display:block;font-size:22px}.os-selector-price small{font-size:14px;margin-left:4px}.os-selector-value{display:block;font-size:14px;margin-top:10px}.os-package-panel{padding:35px 4%}.os-package-panel>h3{font-size:clamp(35px,4.7vw,72px);font-weight:400;letter-spacing:-.05em;margin:10px 0}.os-package-value{font-size:20px;color:#c2c5c6}.os-package-summary{display:grid;grid-template-columns:1.2fr 1fr;gap:30px;border-top:1px solid var(--os-line);padding-top:25px;margin:30px 0}.os-package-summary .os-eyebrow{color:#b0b4b5;margin-bottom:10px}.os-main-price{font-size:36px!important;letter-spacing:-.03em}.os-main-price small{font-size:16px;margin-left:5px}.os-inclusions{list-style:none;display:grid;grid-template-columns:1fr 1fr;column-gap:25px;padding:0;margin:12px 0 30px}.os-inclusions li{font-size:15px;padding:9px 0;border-bottom:1px solid var(--os-line)}.os-package-bottom>p{font-size:14px;color:#bfc2c3;margin-bottom:18px}.os-action button{background:transparent;color:inherit;border:0;border-top:1px solid currentColor;border-bottom:1px solid currentColor;padding:13px 0;text-align:left;min-height:46px;font-size:15px}.os-action button:hover:not(:disabled){color:var(--os-orange)}.os-action>p{font-size:14px;margin-top:8px;color:inherit}
.os-service-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));border-top:1px solid #999e9b;border-left:1px solid #999e9b}.os-service-card{padding:28px;display:flex;flex-direction:column;border-right:1px solid #999e9b;border-bottom:1px solid #999e9b}.os-service-card h3{font-size:25px;line-height:1.15;letter-spacing:-.03em;font-weight:400;margin:17px 0}.os-description{font-size:16px;line-height:1.6}.os-service-card .os-description{flex:1;margin-bottom:28px}.os-card-price{font-size:32px;letter-spacing:-.025em}.os-card-price small{font-size:16px}.os-billing,.os-standalone{font-size:14px}.os-standalone{margin:13px 0 20px!important;color:#454a4b}.os-service-card .os-action button{width:100%}.os-specialist-grid{display:grid;grid-template-columns:1fr 1fr;border-top:1px solid #666b6d}.os-specialist-card{padding:35px 35px 35px 0;border-bottom:1px solid var(--os-line);display:flex;flex-direction:column}.os-specialist-card:nth-child(even){padding-left:35px;border-left:1px solid var(--os-line)}.os-specialist-card h3{font-size:34px;font-weight:400;letter-spacing:-.035em;line-height:1.15;margin:20px 0}.os-specialist-card .os-description{max-width:550px;color:#bec2c4}.os-engagement-prices{display:flex;gap:24px;flex-wrap:wrap;margin:28px 0;flex:1}.os-engagement-prices p{font-size:25px;letter-spacing:-.025em}.os-engagement-prices span{font-size:14px;color:#b6bbbd}
@media(min-width:1400px){.os-headline{position:relative}.os-headline>p{position:absolute;right:0;bottom:65px;max-width:310px}}
@media(max-width:1100px){.os-section-head{grid-template-columns:1fr 2fr}.os-section-head>p:last-child{grid-column:2}.os-package-layout{grid-template-columns:35% 65%}.os-selector button{padding:20px 16px}.os-package-summary{grid-template-columns:1fr}.os-service-grid{grid-template-columns:1fr 1fr}.os-package-name{font-size:23px}.os-hero-links>a{padding:20px 16px}.os-section-head h2{font-size:42px}}
@media(max-width:700px){.os-hero{padding:25px 22px;height:auto;min-height:calc(100svh - 70px)}.os-kicker{font-size:10px;letter-spacing:.08em}.os-kicker>span:last-child{text-align:right;max-width:110px}.os-headline{padding:50px 0 35px}.os-headline h1{font-size:clamp(27px,7.55vw,49px);letter-spacing:-.045em;overflow-wrap:normal}.os-watermark{font-size:380px;top:120px;right:-85px}.os-headline>p{font-size:16px}.os-hero-links{grid-template-columns:1fr}.os-hero-links>a,.os-hero-links>a:first-child,.os-hero-links>a:last-child{padding:19px 0;border:0;border-bottom:1px solid var(--os-line)}.os-hero-links>a:last-child{border-bottom:0}.os-hero-links h2{font-size:23px}.os-hero-end{font-size:10px}.os-clarity{padding:55px 22px;grid-template-columns:1fr;gap:20px}.os-clarity h2{font-size:50px}.os-clarity-copy{padding:0}.os-section{padding:55px 22px}.os-section-head{display:block;margin-bottom:25px}.os-section-head h2{font-size:41px;margin:18px 0}.os-section-head>p:last-child{max-width:none}.os-package-layout{display:block}.os-selector{display:grid;grid-template-columns:1fr 1fr;border:0}.os-selector button{border:1px solid var(--os-line);padding:17px 12px}.os-package-name{font-size:20px;overflow-wrap:anywhere}.os-selector-price{font-size:21px}.os-selector-top{font-size:10px}.os-selector-value{font-size:14px}.os-package-panel{padding:30px 0 0}.os-package-panel>h3{font-size:38px}.os-inclusions{grid-template-columns:1fr}.os-service-grid,.os-specialist-grid{grid-template-columns:1fr}.os-service-card{padding:25px}.os-specialist-card,.os-specialist-card:nth-child(even){padding:30px 0;border-left:0}.os-specialist-card h3{font-size:30px}.os-engagement-prices{display:block}.os-engagement-prices>div+div{margin-top:18px}}
@media(prefers-reduced-motion:reduce){.oragrol-services{scroll-behavior:auto}}
`;
