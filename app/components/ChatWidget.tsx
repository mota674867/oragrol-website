"use client";
import {FormEvent,useEffect,useState} from "react";

type Message={
  from:"visitor"|"oragrol";
  text:string;
  email?:boolean;
  // "form" messages render an inline name/email capture instead of
  // plain text — never sent to /api/chat as conversation history.
  kind?:"text"|"form";
  reason?:"urgent"|"human-requested";
};

const urgent=/breach|hacked|ransomware|compromised|attack|locked out|extort|active incident/i;
const human=/real person|human|someone|representative|speak to|talk to/i;
const emailPattern=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Deterministic, client-side, checked BEFORE any AI call — safety-
// critical escalation wording must never depend on the model
// cooperating. See app/lib/chat-knowledge.ts for the matching system
// prompt rules the AI itself follows for everything else.
function localEscalation(value:string):{text:string;reason:"urgent"|"human-requested"}|null{
  if(urgent.test(value))return {text:"If you are not an ORAGROL client, this chat is not emergency incident response and does not create a service relationship. I have marked your message as priority — please leave your name and email so our team can follow up.",reason:"urgent"};
  if(human.test(value))return {text:"Human availability is Monday to Friday, 9am to 6pm ET, subject to availability. I have marked your request as priority — please leave your name and email so our team can follow up.",reason:"human-requested"};
  return null;
}

export default function ChatWidget(){
 const [open,setOpen]=useState(false),[greeting,setGreeting]=useState(false),[dismissed,setDismissed]=useState(false),[value,setValue]=useState(""),[sending,setSending]=useState(false);
 const [contact,setContact]=useState<{name:string;email:string}|null>(null);
 const [formValue,setFormValue]=useState({name:"",email:""});
 const [messages,setMessages]=useState<Message[]>([{from:"oragrol",text:"Welcome to ORAGROL. What would you like to explore?"}]);
 // Reads sessionStorage / listens for scroll after mount (client-only, can't
 // run during SSR). Kept as GPT built it — infra-only lint suppression, no
 // behavior change.
 // eslint-disable-next-line react-hooks/set-state-in-effect
 useEffect(()=>{if(sessionStorage.getItem("oragrol-chat-widget-dismissed")){setDismissed(true);return}if(sessionStorage.getItem("oragrol-chat-greeting-dismissed"))return;const show=()=>setGreeting(true);const timer=setTimeout(show,17000);const scroll=()=>{const depth=(scrollY+innerHeight)/document.documentElement.scrollHeight;if(depth>=.5){clearTimeout(timer);show();removeEventListener("scroll",scroll)}};addEventListener("scroll",scroll,{passive:true});return()=>{clearTimeout(timer);removeEventListener("scroll",scroll)}},[]);
 const dismissGreeting=()=>{setGreeting(false);sessionStorage.setItem("oragrol-chat-greeting-dismissed","1")};
 const dismissChat=()=>{setOpen(false);setGreeting(false);setDismissed(true);sessionStorage.setItem("oragrol-chat-widget-dismissed","1")};
 const launch=()=>{setOpen(!open);if(!open)dismissGreeting()};

 // Sends {name, email} to /api/chat with mode "escalate" — a real email
 // to the ORAGROL team plus a best-effort HubSpot sync happen server-
 // side (app/api/chat/route.ts). Never marks a message as sent unless
 // this actually succeeded.
 const runEscalate=async(name:string,email:string,reason:"urgent"|"human-requested")=>{
  setSending(true);
  try{
   const transcript=messages.filter(m=>m.kind!=="form").map(m=>({role:m.from,text:m.text}));
   const res=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({mode:"escalate",name,email,reason,transcript})});
   const json=await res.json().catch(()=>null);
   if(res.ok&&json?.ok){
    setContact({name,email});
    setMessages(m=>[...m,{from:"oragrol",text:"Thank you — you're flagged as priority and the ORAGROL team will follow up at "+email+"."}]);
   }else{
    setMessages(m=>[...m,{from:"oragrol",text:"I couldn't send that through just now. Please email us directly instead.",email:true}]);
   }
  }catch{
   setMessages(m=>[...m,{from:"oragrol",text:"I couldn't send that through just now. Please email us directly instead.",email:true}]);
  }finally{
   setSending(false);
  }
 };

 const submitForm=(e:FormEvent,reason:"urgent"|"human-requested")=>{
  e.preventDefault();
  const name=formValue.name.trim(),email=formValue.email.trim();
  if(!name||!emailPattern.test(email))return;
  setMessages(m=>m.filter(x=>x.kind!=="form"));
  setFormValue({name:"",email:""});
  runEscalate(name,email,reason);
 };

 // Normal (non-escalation) messages go to /api/chat mode "reply" for a
 // real AI-generated answer, grounded in chat-knowledge.ts. A failure
 // here is shown honestly, never silently swapped for a fake reply.
 const runReply=async(history:Message[])=>{
  setSending(true);
  try{
   const payload=history.filter(m=>m.kind!=="form").slice(-16).map(m=>({role:m.from,text:m.text}));
   const res=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({mode:"reply",messages:payload})});
   const json=await res.json().catch(()=>null);
   if(res.ok&&json?.ok&&json.reply){
    setMessages(m=>[...m,{from:"oragrol",text:json.reply}]);
   }else{
    setMessages(m=>[...m,{from:"oragrol",text:"I couldn't reach our system just now — please try again, or reach us through the Contact page.",email:true}]);
   }
  }catch{
   setMessages(m=>[...m,{from:"oragrol",text:"I couldn't reach our system just now — please try again, or reach us through the Contact page.",email:true}]);
  }finally{
   setSending(false);
  }
 };

 const submit=(e:FormEvent)=>{
  e.preventDefault();
  const clean=value.trim();
  if(!clean||sending)return;
  setValue("");
  const escalation=localEscalation(clean);
  if(escalation){
   const next:Message[]=[...messages,{from:"visitor",text:clean},{from:"oragrol",text:escalation.text}];
   if(contact){
    setMessages(next);
    runEscalate(contact.name,contact.email,escalation.reason);
   }else{
    setMessages([...next,{from:"oragrol",text:"",kind:"form",reason:escalation.reason}]);
   }
   return;
  }
  const next=[...messages,{from:"visitor" as const,text:clean}];
  setMessages(next);
  runReply(next);
 };

 if(dismissed)return null;
 return <div className="or-chat">{greeting&&!open&&<aside className="or-chat-greeting"><button onClick={dismissGreeting} aria-label="Dismiss chat greeting">×</button><small>ORAGROL</small><p>Have a question? We can help you find the right next step.</p><a onClick={launch}>Start a conversation ↗</a></aside>}<div className="or-chat-controls"><button className="or-chat-cancel" onClick={dismissChat} aria-label="Hide chat for this visit">×</button><button className="or-chat-launch" aria-label={open?"Close ORAGROL chat":"Open ORAGROL chat"} aria-expanded={open} onClick={launch}><span aria-hidden="true"/><b>{open?"Close":"Chat"}</b></button></div>{open&&<section className="or-chat-panel" role="dialog" aria-label="ORAGROL chat"><header><div><span className="or-chat-status" aria-hidden="true"/><div><strong>ORAGROL</strong><small>PRIVATE CONVERSATION</small></div></div><button onClick={()=>setOpen(false)} aria-label="Close chat window">×</button></header><div className="or-chat-log" aria-live="polite">{messages.map((m,i)=>m.kind==="form"?<article className="oragrol or-chat-form" key={i}><small>ORAGROL</small><form onSubmit={e=>submitForm(e,m.reason||"human-requested")}><label>Name<input required value={formValue.name} onChange={e=>setFormValue(s=>({...s,name:e.target.value}))}/></label><label>Email<input required type="email" value={formValue.email} onChange={e=>setFormValue(s=>({...s,email:e.target.value}))}/></label><button disabled={sending} type="submit">Send to ORAGROL ↗</button></form></article>:<article className={m.from} key={i}><small>{m.from==="oragrol"?"ORAGROL":"YOU"}</small><p>{m.text}</p>{m.email&&<a href="mailto:mota6748@gmail.com?subject=Priority ORAGROL enquiry">Email priority summary ↗</a>}</article>)}{sending&&<article className="oragrol or-chat-typing"><small>ORAGROL</small><p>Typing…</p></article>}</div><form onSubmit={submit}><label htmlFor="or-chat-input">Your message</label><textarea id="or-chat-input" rows={2} value={value} onChange={e=>setValue(e.target.value)} placeholder="Write your question…"/><button disabled={sending} aria-label="Send message">Send <span>↗</span></button></form><footer><span/>Available 24/7 · Human availability varies</footer></section>}</div>
}
