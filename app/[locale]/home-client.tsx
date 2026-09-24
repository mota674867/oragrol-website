"use client";
import {useState} from "react";
import {useLocale, useTranslations} from "next-intl";
import {Link, usePathname} from "@/i18n/navigation";
import type {ReactNode} from "react";
import CanadaCoverageStudy from "./canada-coverage-study/page";
import PreFooterCta from "@/app/components/site/pre-footer-cta";
import SiteFooter from "@/app/components/site/footer";
import OragrolMegaNav from "@/app/components/site/oragrol-mega-nav";
import UtilityBar from "@/app/components/site/utility-bar";
import { OragrolLogo } from "@/app/components/brand/oragrol-logo";
import {NAV_ITEMS} from "@/app/components/site/nav-items";
import "./homepage-v3.css";
import OdoDiscoveryPopup from "@/app/components/site/odo-popup";

// Language-neutral metadata only (code/key/href/number) — the actual
// display strings are resolved inside the component via useTranslations,
// since hooks can't run at module scope. `key` matches the corresponding
// namespace key in messages/en.json + messages/fr.json (Home.capabilities.*,
// Home.method.*, Home.entryPoints.*).
const capabilityDefs=[
 {key:"protect",code:"01",href:"/services"},
 {key:"automate",code:"02",href:"/business-automation"},
 {key:"unify",code:"03",href:"/or-one"},
] as const;
const stageDefs=[
 {key:"understand",number:"01"},
 {key:"prioritize",number:"02"},
 {key:"protect",number:"03"},
 {key:"automate",number:"04"},
 {key:"evolve",number:"05"},
] as const;
// Note: the old `security` array (10 category names) and `category` state
// used by the pre-2026-09-08 orbit section 04 were removed entirely along
// with that section — see home-section-04.tsx for the replacement.

function Arrow(){return <span aria-hidden="true">↗</span>}

// `cybersecuritySection` is home-section-04's <HomeCybersecurity/>, rendered
// server-side by app/[locale]/page.tsx (a Server Component) and passed down
// as a prop rather than imported directly here. HomeClient is "use client",
// and a Client Component that imports a Server Component module directly
// forces it into the client bundle — which breaks next-intl's
// server-only getTranslations() there ("not supported in Client
// Components"). Passing it as a prop/children from the server tree is the
// documented Next.js pattern that keeps it a true zero-JS Server Component.
function HomeClient({cybersecuritySection}:{cybersecuritySection:ReactNode}){
 const t=useTranslations("Home");
 const locale=useLocale();
 const otherLocale=locale==="fr"?"en":"fr";
 const[capability,setCapability]=useState(0),[stage,setStage]=useState(0);
 const capabilities=capabilityDefs.map(c=>({
  ...c,
  name:t(`capabilities.${c.key}.name`),
  title:t(`capabilities.${c.key}.title`),
  text:t(`capabilities.${c.key}.text`),
  link:t(`capabilities.${c.key}.link`),
 }));
 const stages=stageDefs.map(s=>({
  ...s,
  name:t(`method.${s.key}.name`),
  line:t(`method.${s.key}.line`),
 }));
 const activeCapability=capabilities[capability],activeStage=stages[stage];
 const pathname=usePathname();
 return <><UtilityBar /><main className="home-v3">
  <header className="home-nav"><Link className="home-wordmark" href="/" aria-label={t("nav.homeAriaLabel")}><OragrolLogo height={30} /></Link><OragrolMegaNav items={NAV_ITEMS} activePath={pathname}/><div className="home-actions"><Link className="health-link" href="/cyber-health">{t("nav.getCyberHealthScore")}</Link><button className="home-search" aria-label={t("nav.search")}><span/></button></div></header>
  <section className="home-hero"><div className="hero-or" aria-hidden="true">OR</div><p className="kicker">{t("hero.kicker")}</p><h1><span>{t("hero.headline1")}</span><span>{t("hero.headline2")}</span><span>{t("hero.headline3")}</span></h1><p className="hero-sub">{t("hero.sub")}</p><nav className="hero-choices" aria-label={t("hero.ariaCapabilities")}>{capabilityDefs.map(item=><Link href={item.href} key={item.key}><strong>{t(`entryPoints.${item.key}Name`)}</strong><span>{t(`entryPoints.${item.key}Sub`)}</span><Arrow/></Link>)}</nav></section>
  <section className="reality"><div><p className="section-label">{t("reality.label")}</p><h2>{t("reality.headline1")}<br/><span>{t("reality.headline2")}</span></h2></div><div className="reality-copy"><p>{t("reality.p1")}</p><p>{t("reality.p2")}</p></div><p className="reality-line">{t("reality.line")} <strong>{t("reality.lineStrong")}</strong></p></section>
  <section className="capabilities"><header><p className="section-label">{t("capabilities.label")}</p><h2>{t("capabilities.headline1")}<br/>{t("capabilities.headline2")}</h2></header><div className="capability-stage"><nav aria-label={t("capabilities.ariaSelect")}>{capabilities.map((item,index)=><button className={capability===index?"active":""} onMouseEnter={()=>setCapability(index)} onFocus={()=>setCapability(index)} onClick={()=>setCapability(index)} key={item.key}><span>{item.code}</span>{item.name}</button>)}</nav><article><span>{activeCapability.code}</span><p>{activeCapability.name}</p><h3>{activeCapability.title}</h3><p>{activeCapability.text}</p><Link href={activeCapability.href}>{activeCapability.link} <Arrow/></Link></article><div className="capability-or" aria-hidden="true">OR</div></div></section>
  <section className="method"><header><p className="section-label">{t("method.label")}</p><h2>{t("method.headline1")}<br/>{t("method.headline2")}</h2><p>{t("method.sub")}</p></header><div className="method-number" aria-hidden="true">{activeStage.number}</div><article><span>{activeStage.name}</span><h3>{activeStage.line}</h3></article><nav aria-label={t("method.ariaSelect")}>{stages.map((item,index)=><button className={stage===index?"active":""} onMouseEnter={()=>setStage(index)} onFocus={()=>setStage(index)} onClick={()=>setStage(index)} key={item.key}><span>{item.number}</span>{item.name}</button>)}</nav></section>
  {cybersecuritySection}
  <section className="cyber-health-home"><div className="health-copy"><p className="section-label">{t("cyberHealthCta.label")}</p><h2>{t("cyberHealthCta.headline1")}<br/><span>{t("cyberHealthCta.headline2")}</span></h2><p>{t("cyberHealthCta.sub")}</p><Link href="/cyber-health">{t("cyberHealthCta.link")} <Arrow/></Link></div><div className="health-score"><span>{t("cyberHealthCta.illustrativeLabel")}</span><strong>78</strong><small>/100</small><div><i style={{width:"78%"}}/><p><span>{t("cyberHealthCta.currentPosition")}</span><b>{t("cyberHealthCta.clearerPriorities")}</b></p></div></div></section>
  <section className="industries-wrap"><CanadaCoverageStudy/></section>
  <PreFooterCta page="home"/>
  <OdoDiscoveryPopup />
  <SiteFooter/>
 </main></>
}

export default HomeClient;
