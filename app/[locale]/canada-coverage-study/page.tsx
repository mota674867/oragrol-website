"use client";
import {useTranslations} from "next-intl";
import {Link} from "@/i18n/navigation";

import { useEffect, useState } from "react";

// Order matches the `Home.industries.list` namespace key order in
// messages/en.json + messages/fr.json — keys are stable identifiers,
// display text (name/risk) is resolved per-locale via useTranslations.
const industryKeys = [
  "professionalServices",
  "healthcare",
  "financialServices",
  "retail",
  "manufacturing",
  "technology",
  "construction",
  "education",
  "otherSmbs",
] as const;

export default function CanadaCoverageStudy(){
  const t=useTranslations("Home.industries");
  const industries=industryKeys.map(key=>({key,name:t(`list.${key}.name`),risk:t(`list.${key}.risk`)}));
  const [active,setActive]=useState(0);
  useEffect(()=>{const timer=setInterval(()=>setActive(v=>(v+1)%industries.length),3400);return()=>clearInterval(timer)},[industries.length]);
  return <main className="or-industries-study">
    <header className="or-industries-header"><Link href="/">ORAGROL <small>GLOBAL</small></Link><p>{t("eyebrow")}</p><Link href="/">{t("returnHome")} ↗</Link></header>
    <section className="or-industries-stage">
      <div className="or-mass" aria-hidden="true">OR</div>
      <div className="or-section-title"><span>{t("label")}</span><h1>{t("headline1")}<br/>{t("headline2")}</h1></div>
      <div className="o-content"><p className="o-label">{t("selectLabel")}</p><nav aria-label={t("ariaLabel")}>{industries.map((item,index)=><button key={item.key} onMouseEnter={()=>setActive(index)} onFocus={()=>setActive(index)} onClick={()=>setActive(index)} className={active===index?"active":""}><span>{String(index+1).padStart(2,"0")}</span>{item.name}</button>)}</nav><div className="o-counter"><strong>{String(active+1).padStart(2,"0")}</strong><span>/ 09</span></div></div>
      <article className="r-content" key={industries[active].key}><div className="r-canada"><span className="r-flag"><i>◆</i></span><p>{t("canadaWide")}<br/>{t("canadaPerspective")}</p></div><p className="r-selected">{industries[active].name}</p><h2>{industries[active].risk}</h2><Link href="/industries">{t("exploreIndustry")} ↗</Link><div className="r-reach"><span>{t("west")}</span><i/><span>{t("central")}</span><i/><span>{t("east")}</span><i/><span>{t("north")}</span></div></article>
      <footer className="or-industries-footer"><span>{t("footerEyebrow")}</span><p>{t("footerLine1")}</p><p>{t("footerLine2")}</p><p>{t("footerLine3")}</p><strong>{t("footerStrong")}</strong></footer>
    </section>
  </main>
}
