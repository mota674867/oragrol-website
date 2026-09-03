"use client";
import Link from "next/link";
import {useMemo,useState} from "react";
import {categories,questions,sections} from "./assessment-data";
import "../gpt-pages.css";

type Answer="Yes"|"No"|"Not Sure";
type Stage="intro"|"profile"|"qualify"|"assessment"|"result";
type Profile={company:string;industry:string;province:string;employees:string;platform:string;name:string;email:string;phone:string};
const industries=["Retail","Professional Services","Healthcare","Construction","Manufacturing","Hospitality","Non-Profit","Other"];
const provinces=["Alberta","British Columbia","Manitoba","New Brunswick","Newfoundland and Labrador","Northwest Territories","Nova Scotia","Nunavut","Ontario","Prince Edward Island","Quebec","Saskatchewan","Yukon","Other"];
const qualification=[
  {id:"business",label:"Do you represent a business?",choices:["Yes","No","Not sure"]},
  {id:"decision",label:"Are you responsible for IT or cybersecurity decisions at your business?",choices:["Yes","No","Not sure"]},
  {id:"budget",label:"What's your rough budget range for improving cybersecurity in the next 12 months?",choices:["Under $2,000","$2,000–$10,000","$10,000+","Not sure yet"]},
  {id:"timing",label:"When are you looking to make security improvements?",choices:["Immediately","Within 3 months","Within 6 months","Just researching"]},
] as const;

function CyberHealthClient(){
  const [stage,setStage]=useState<Stage>("intro"),[step,setStep]=useState(0);
  const [answers,setAnswers]=useState<Record<string,Answer>>({}),[qual,setQual]=useState<Record<string,string>>({});
  const [profile,setProfile]=useState<Profile>({company:"",industry:"",province:"",employees:"",platform:"",name:"",email:"",phone:""});
  const visibleQuestions=useMemo(()=>questions.filter(q=>profile.platform==="Google Workspace"?!q.id.match(/^Q08-[12]$/):!q.id.includes("-GWS")),[profile.platform]);
  const sectionQuestions=visibleQuestions.filter(q=>q.section===sections[step]);
  const sectionComplete=sectionQuestions.every(q=>answers[q.id]);
  const profileComplete=Object.values(profile).every(Boolean)&&/^\S+@\S+\.\S+$/.test(profile.email);
  const qualComplete=qualification.every(q=>qual[q.id]);
  const categoryScores=useMemo(()=>categories.map(c=>{const qs=visibleQuestions.filter(q=>q.id.startsWith(`Q${c.id}-`));const earned=qs.reduce((n,q)=>n+(answers[q.id]==="Yes"?2:answers[q.id]==="Not Sure"?1:0),0);return {...c,score:qs.length?earned/(2*qs.length)*100:0}}),[answers,visibleQuestions]);
  const score=useMemo(()=>Math.round(categoryScores.reduce((n,c)=>n+c.score*c.weight,0)/38),[categoryScores]);
  const tier=score>=80?"Low":score>=60?"Medium":score>=40?"High":"Critical";
  const pkg=score>=80?"Starter":score>=60?"Standard":"Premium";
  const answered=visibleQuestions.filter(q=>answers[q.id]).length;
  const go=(s:Stage)=>{setStage(s);scrollTo(0,0)};
  const header=(label:string)=><header><Link href="/">ORAGROL <small>GLOBAL</small></Link><b>{label}</b></header>;

  if(stage==="intro")return <main className="nch intro"><span className="nch-or">OR</span>{header("CYBER HEALTH / PRIVATE ASSESSMENT")}<section><p>5–7 MINUTES · 42 SECURITY QUESTIONS</p><h1>Know where you stand.<br/><i>Know what to do next.</i></h1><p>Build a practical baseline across identity, email, devices, cloud, people, data and governance.</p><button onClick={()=>go("profile")}>Begin assessment ↗</button></section></main>;

  if(stage==="profile")return <main className="nch formstage">{header("01 / COMPANY PROFILE")}<section><aside><p>PRIVATE ASSESSMENT</p><h1>Tell us about your business.</h1><p>These details personalize your report. They do not affect your Cyber Health Score.</p></aside><form onSubmit={e=>{e.preventDefault();if(profileComplete)go("qualify")}}>{[
    ["company","Company Name","text"],["industry","Industry","select"],["province","Province","select"],["employees","Number of Employees","select"],["platform","Cloud Platform","select"],["name","Contact Name","text"],["email","Business Email","email"],["phone","Phone","tel"]
  ].map(([key,label,type])=><label key={key}><span>{label}</span>{type==="select"?<select required value={profile[key as keyof Profile]} onChange={e=>setProfile({...profile,[key]:e.target.value})}><option value="">Select</option>{(key==="industry"?industries:key==="province"?provinces:key==="employees"?["1-10","11-25","26-50","51-100","101-200"]:["Microsoft 365","Google Workspace","Neither","Not Sure"]).map(x=><option key={x}>{x}</option>)}</select>:<input required minLength={key==="name"?3:undefined} type={type} value={profile[key as keyof Profile]} onChange={e=>setProfile({...profile,[key]:e.target.value})}/>}</label>)}<footer><button type="button" onClick={()=>go("intro")}>← Back</button><button disabled={!profileComplete}>Continue →</button></footer><small>Your responses are used to create your report and follow up about it. We do not sell your data.</small></form></section></main>;

  if(stage==="qualify")return <main className="nch formstage">{header("02 / BUSINESS CONTEXT")}<section><aside><p>QUICK QUESTIONS</p><h1>A little context.</h1><p>Your answers help us make the next conversation relevant. They do not affect your score.</p></aside><div className="nch-q compact">{qualification.map((q,qi)=><fieldset key={q.id}><legend><small>0{qi+1}</small>{q.label}</legend><div>{q.choices.map((v,i)=><label className={qual[q.id]===v?"chosen":""} key={v}><input type="radio" name={q.id} onChange={()=>setQual({...qual,[q.id]:v})}/><b>{String.fromCharCode(65+i)}</b>{v}</label>)}</div></fieldset>)}<footer><button onClick={()=>go("profile")}>← Back</button><button disabled={!qualComplete} onClick={()=>go("assessment")}>Start questions →</button></footer></div></section></main>;

  if(stage==="result")return <main className="nch result">{header("YOUR RESULT")}<section><div><p>CYBER HEALTH SCORE</p><strong>{score}</strong><span>/100</span><dl><div><dt>Risk tier</dt><dd>{tier}</dd></div><div><dt>Suggested path</dt><dd>{pkg}</dd></div></dl></div><article><p className="eyebrow">{profile.company||"YOUR BUSINESS"}</p><h1>{score>=80?"Strong foundation.":score>=60?"A workable base with clear gaps.":score>=40?"Material improvement is needed.":"Start with the essentials."}</h1><p>A directional baseline, not a certification or guarantee. Review uncertain and missing controls before deciding what to improve first.</p><button onClick={()=>{setStep(0);go("assessment")}}>Review answers</button></article></section></main>;

  return <main className="nch assess"><header><Link href="/">ORAGROL <small>GLOBAL</small></Link><div><b>{answered} / {visibleQuestions.length}</b><i><em style={{width:`${answered/visibleQuestions.length*100}%`}}/></i></div></header><section><aside><p>{String(step+1).padStart(2,"0")} / {String(sections.length).padStart(2,"0")}</p><h1>{sections[step]}</h1><p>Select what best reflects the business today.</p><nav>{sections.map((s,i)=><span className={i===step?"on":i<step?"done":""} key={s}>{String(i+1).padStart(2,"0")} {s}</span>)}</nav></aside><div className="nch-q">{sectionQuestions.map(q=><fieldset key={q.id}><legend><small>{q.id.replace("-GWS","")}</small>{q.text}</legend><div>{(["Yes","No","Not Sure"] as Answer[]).map((v,i)=><label className={answers[q.id]===v?"chosen":""} key={v}><input type="radio" name={q.id} checked={answers[q.id]===v} onChange={()=>setAnswers({...answers,[q.id]:v})}/><b>{String.fromCharCode(65+i)}</b>{v}</label>)}</div></fieldset>)}<footer><button onClick={()=>step?setStep(step-1):go("qualify")}>← Back</button>{step<sections.length-1?<button disabled={!sectionComplete} onClick={()=>{setStep(step+1);scrollTo(0,0)}}>Next section →</button>:<button disabled={!sectionComplete} onClick={()=>go("result")}>Calculate score →</button>}</footer></div></section></main>;
}

export default CyberHealthClient;
