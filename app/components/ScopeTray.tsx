"use client";

import {FormEvent,useEffect,useMemo,useState} from "react";

export type ScopeArea="Cybersecurity"|"Automation"|"OR ONE";
export type ScopeItem={id:string;area:ScopeArea;code:string;title:string;detail:string;commercial?:string};
const key="oragrol-scope-v2";

export function useScope(){
 const[items,setItems]=useState<ScopeItem[]>([]);
 // Hydrate from localStorage after mount (client-only; SSR/first paint stays
 // empty on purpose to avoid a hydration mismatch). Kept as GPT built it —
 // infra-only lint suppression, no behavior change.
 // eslint-disable-next-line react-hooks/set-state-in-effect
 useEffect(()=>{try{setItems(JSON.parse(localStorage.getItem(key)||"[]"))}catch{}},[]);
 useEffect(()=>{try{localStorage.setItem(key,JSON.stringify(items))}catch{}},[items]);
 const has=(id:string)=>items.some(x=>x.id===id);
 const toggle=(item:ScopeItem)=>setItems(s=>s.some(x=>x.id===item.id)?s.filter(x=>x.id!==item.id):[...s,item]);
 const remove=(id:string)=>setItems(s=>s.filter(x=>x.id!==id));
 return{items,setItems,has,toggle,remove};
}

const clean=(s:string)=>s.replace(/[\u2018\u2019]/g,"'").replace(/[\u2013\u2014]/g,"-").replace(/[^\x20-\x7E]/g," ");
const esc=(s:string)=>clean(s).replace(/\\/g,"\\\\").replace(/\(/g,"\\(").replace(/\)/g,"\\)");
function wrap(text:string,max=72){const words=clean(text).split(/\s+/);const lines:string[]=[];let line="";for(const word of words){const next=line?`${line} ${word}`:word;if(next.length>max&&line){lines.push(line);line=word}else line=next}if(line)lines.push(line);return lines}
function premiumPdf(items:ScopeItem[],client:{name:string;email:string;company:string;timeframe:string;notes:string}){
 const date=new Date();const ref=`OR-${date.toISOString().slice(0,10).replace(/-/g,"")}-${String(date.getTime()).slice(-5)}`;
 const pages:string[][]=[[]];let page=0,y=720;const add=(line:string)=>pages[page].push(line);const next=()=>{pages.push([]);page++;y=720};
 const text=(value:string,x:number,size=10,color="0.08 0.09 0.10",font="F1")=>add(`${color} rg BT /${font} ${size} Tf ${x} ${y} Td (${esc(value)}) Tj ET`);
 const rule=(yy:number,color="0.82 0.82 0.80")=>add(`${color} RG 0.6 w 44 ${yy} m 551 ${yy} l S`);
 const header=()=>{add("0.08 0.09 0.10 rg 0 760 595 82 re f");add("0.94 0.28 0 rg 0 754 595 6 re f");y=790;text("ORAGROL",44,19,"1 1 1","F2");text("GLOBAL",147,7,"1 1 1","F2");y=774;text("PRIVATE SCOPE BRIEF",420,8,"0.72 0.73 0.74","F2");y=720;};
 header();text("A clearer first conversation.",44,25,"0.08 0.09 0.10","F2");y-=28;text("Preliminary scope prepared from your ORAGROL selections.",44,10,"0.35 0.36 0.37");y-=30;rule(y);y-=25;
 [["SCOPE REFERENCE",ref],["PREPARED",date.toLocaleDateString("en-CA")],["CLIENT",client.name||"Not provided"],["COMPANY",client.company||"Not provided"],["EMAIL",client.email||"Not provided"],["TIMEFRAME",client.timeframe||"Not provided"]].forEach(([a,b])=>{text(a,44,7,"0.94 0.28 0","F2");text(b,180,10);y-=20});
 y-=8;rule(y);y-=28;text("SELECTED SCOPE",44,9,"0.08 0.09 0.10","F2");y-=26;
 items.forEach((item,i)=>{if(y<125){next();header();text("SELECTED SCOPE / CONTINUED",44,9,"0.08 0.09 0.10","F2");y-=28}text(String(i+1).padStart(2,"0"),44,8,"0.94 0.28 0","F2");text(item.area.toUpperCase(),80,7,"0.42 0.43 0.44","F2");text(item.title,180,12,"0.08 0.09 0.10","F2");y-=18;for(const line of wrap(item.detail,62)){text(line,180,8,"0.35 0.36 0.37");y-=11}if(item.commercial){text(item.commercial,180,8,"0.94 0.28 0","F2");y-=14}rule(y);y-=22});
 if(y<190){next();header()}text("CLIENT CONTEXT",44,9,"0.08 0.09 0.10","F2");y-=22;for(const line of wrap(client.notes||"No additional context supplied.",82)){text(line,44,9,"0.30 0.31 0.32");y-=13}y-=18;rule(y);y-=24;text("NEXT STEP",44,8,"0.94 0.28 0","F2");text("ORAGROL will review this preliminary scope before any recommendation or proposal.",135,9);y-=28;text("This document is not a quote or contract. Final scope, feasibility, risk and fees require private review.",44,7,"0.42 0.43 0.44");
 const objects:string[]=[];const pageIds:number[]=[];const contentIds:number[]=[];const font1=3,font2=4;let id=5;pages.forEach(()=>{pageIds.push(id++);contentIds.push(id++)});
 objects[1]="<< /Type /Catalog /Pages 2 0 R >>";objects[2]=`<< /Type /Pages /Kids [${pageIds.map(x=>`${x} 0 R`).join(" ")}] /Count ${pages.length} >>`;objects[3]="<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";objects[4]="<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>";
 pages.forEach((lines,i)=>{const content=lines.join("\n");objects[pageIds[i]]=`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${font1} 0 R /F2 ${font2} 0 R >> >> /Contents ${contentIds[i]} 0 R >>`;objects[contentIds[i]]=`<< /Length ${content.length} >>\nstream\n${content}\nendstream`});
 let pdf="%PDF-1.4\n";const offsets=[0];for(let i=1;i<objects.length;i++){offsets[i]=pdf.length;pdf+=`${i} 0 obj\n${objects[i]}\nendobj\n`}const xref=pdf.length;pdf+=`xref\n0 ${objects.length}\n0000000000 65535 f \n`;for(let i=1;i<objects.length;i++)pdf+=`${String(offsets[i]).padStart(10,"0")} 00000 n \n`;pdf+=`trailer << /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
 const blob=new Blob([pdf],{type:"application/pdf"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=`ORAGROL_SCOPE_${ref}.pdf`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}

export function ScopeTray({items,remove,open,setOpen,activeArea}:{items:ScopeItem[];remove:(id:string)=>void;open:boolean;setOpen:(v:boolean)=>void;activeArea:ScopeArea}){
 const[submitted,setSubmitted]=useState(false);const[client,setClient]=useState({name:"",email:"",company:"",timeframe:"",notes:""});
 const grouped=useMemo(()=>["Cybersecurity","Automation","OR ONE"].map(area=>({area,items:items.filter(x=>x.area===area)})).filter(x=>x.items.length),[items]);
 const update=(name:string,value:string)=>setClient(s=>({...s,[name]:value}));
 const submit=(e:FormEvent)=>{e.preventDefault();setSubmitted(true)};
 return <><button className="scope-launcher" onClick={()=>setOpen(true)}><span>MY SCOPE</span><b>{String(items.length).padStart(2,"0")}</b></button>{open&&<div className="scope-scrim" onClick={()=>setOpen(false)}/>}<aside className={open?"scope-tray open":"scope-tray"} aria-hidden={!open}><div className="scope-or" aria-hidden="true">OR</div><header><div><span>ORAGROL / PRIVATE SCOPE</span><strong>{String(items.length).padStart(2,"0")} SELECTED</strong></div><button onClick={()=>setOpen(false)} aria-label="Close scope tray">×</button></header><div className="scope-rail">{(["Cybersecurity","Automation","OR ONE"] as ScopeArea[]).map((a,i)=><span className={a===activeArea?"current":""} key={a}>{i>0&&<i/>}{a.toUpperCase()}</span>)}</div><div className="scope-body">{items.length===0?<div className="scope-empty"><span>Begin your scope</span><h3>Choose what your business needs.</h3><p>Your selections stay together across Services, Business Automation and OR ONE.</p></div>:<><section className="scope-summary"><span>PRELIMINARY SCOPE</span><h3>A clearer first conversation.</h3><p>Review your selections, add context, then save a branded PDF or submit for private review.</p></section>{grouped.map(group=><section className="scope-group" key={group.area}><h4>{group.area}</h4>{group.items.map(item=><article key={item.id}><span>{item.code}</span><div><b>{item.title}</b><small>{item.commercial||item.detail}</small></div><button onClick={()=>remove(item.id)}>Remove</button></article>)}</section>)}<form onSubmit={submit}><label>Priority or context<textarea value={client.notes} onChange={e=>update("notes",e.target.value)} placeholder="What should improve first?"/></label><div><label>Name<input required value={client.name} onChange={e=>update("name",e.target.value)}/></label><label>Business email<input required type="email" value={client.email} onChange={e=>update("email",e.target.value)}/></label></div><label>Company<input required value={client.company} onChange={e=>update("company",e.target.value)}/></label><label>Target timeframe<select required value={client.timeframe} onChange={e=>update("timeframe",e.target.value)}><option value="" disabled>Select</option><option>Within 30 days</option><option>1-3 months</option><option>3-6 months</option><option>Exploring options</option></select></label><label className="scope-consent"><input required type="checkbox"/> I agree that ORAGROL may contact me about this scope.</label><button className="scope-submit" type="submit">Submit for Private Review <span>↗</span></button>{submitted&&<p className="scope-confirmation">Scope prepared. A live CRM and email connection will be activated before launch.</p>}</form></>}</div><footer><button disabled={!items.length} onClick={()=>premiumPdf(items,client)}>Download Branded PDF</button><button onClick={()=>setOpen(false)}>Continue browsing</button></footer></aside></>;
}
