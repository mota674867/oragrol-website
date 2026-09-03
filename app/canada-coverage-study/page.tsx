"use client";
import Link from "next/link";

import { useEffect, useState } from "react";

const industries = [
  {name:"Professional Services",risk:"Protect client data, communication and trust."},
  {name:"Healthcare",risk:"Strengthen privacy, access and operational resilience."},
  {name:"Financial Services",risk:"Reduce fraud, regulatory and transaction exposure."},
  {name:"Retail & E-commerce",risk:"Protect payments, customers and digital revenue."},
  {name:"Manufacturing",risk:"Secure connected operations and production continuity."},
  {name:"Technology",risk:"Protect cloud environments, products and intellectual property."},
  {name:"Construction & Real Estate",risk:"Secure payments, mobile teams and partner access."},
  {name:"Education",risk:"Prioritize protection across users, data and shared systems."},
  {name:"Other Canadian SMBs",risk:"Shape protection around the way your business operates."}
];

export default function CanadaCoverageStudy(){
  const [active,setActive]=useState(0);
  useEffect(()=>{const timer=setInterval(()=>setActive(v=>(v+1)%industries.length),3400);return()=>clearInterval(timer)},[]);
  return <main className="or-industries-study">
    <header className="or-industries-header"><Link href="/">ORAGROL <small>GLOBAL</small></Link><p>07 / INDUSTRIES + CANADA</p><Link href="/">Return to homepage ↗</Link></header>
    <section className="or-industries-stage">
      <div className="or-mass" aria-hidden="true">OR</div>
      <div className="or-section-title"><span>07 / BUILT AROUND YOUR REALITY</span><h1>Different businesses.<br/>Different risks.</h1></div>
      <div className="o-content"><p className="o-label">SELECT AN INDUSTRY</p><nav aria-label="Industries">{industries.map((item,index)=><button key={item.name} onMouseEnter={()=>setActive(index)} onFocus={()=>setActive(index)} onClick={()=>setActive(index)} className={active===index?"active":""}><span>{String(index+1).padStart(2,"0")}</span>{item.name}</button>)}</nav><div className="o-counter"><strong>{String(active+1).padStart(2,"0")}</strong><span>/ 09</span></div></div>
      <article className="r-content" key={industries[active].name}><div className="r-canada"><span className="r-flag"><i>◆</i></span><p>CANADA-WIDE<br/>PERSPECTIVE</p></div><p className="r-selected">{industries[active].name}</p><h2>{industries[active].risk}</h2><Link href="#">Explore this industry ↗</Link><div className="r-reach"><span>WEST</span><i/><span>CENTRAL</span><i/><span>EAST</span><i/><span>NORTH</span></div></article>
      <footer className="or-industries-footer"><span>CYBERSECURITY FIRST</span><p>Business first.</p><p>Practical, not complicated.</p><p>Built for what’s next.</p><strong>COAST TO COAST TO COAST</strong></footer>
    </section>
  </main>
}
