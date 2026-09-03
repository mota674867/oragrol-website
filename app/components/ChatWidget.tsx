"use client";
import {FormEvent,useEffect,useState} from "react";

type Message={from:"visitor"|"oragrol";text:string;email?:boolean};
const urgent=/breach|hacked|ransomware|compromised|attack|locked out|extort|active incident/i;
const human=/real person|human|someone|representative|speak to|talk to/i;
function answer(value:string){
  if(urgent.test(value))return {text:"If you are not an ORAGROL client, this chat is not emergency incident response and does not create a service relationship. I have marked your message as priority. Please send a short summary to our temporary monitored inbox.",email:true};
  if(human.test(value))return {text:"Human availability is Monday to Friday, 9am to 6pm ET, subject to availability. I have marked your request as priority; you can also email our temporary monitored inbox.",email:true};
  if(/price|cost|fee/i.test(value))return {text:"Starting prices are shown on the relevant Cybersecurity, Business Automation and OR ONE pages. Tell me which area interests you and I can point you there."};
  if(/assessment|score|cyber health/i.test(value))return {text:"The Cyber Health Assessment gives your business a directional 0–100 baseline across 20 security categories. It is not a certification or guarantee."};
  if(/industry|industries/i.test(value))return {text:"ORAGROL works with Canadian small and medium-sized businesses across nine industry profiles. You can review them on the Industries page."};
  if(/location|office|where/i.test(value))return {text:"Our Headquarters and Registered Office is in Thunder Bay, Ontario, with a Toronto presence in Toronto, Ontario."};
  return {text:"I can help with ORAGROL services, Business Automation, OR ONE, Cyber Health, pricing and company information. What would you like to explore?"};
}
export default function ChatWidget(){
 const [open,setOpen]=useState(false),[greeting,setGreeting]=useState(false),[dismissed,setDismissed]=useState(false),[value,setValue]=useState(""),[messages,setMessages]=useState<Message[]>([{from:"oragrol",text:"Welcome to ORAGROL. What would you like to explore?"}]);
 // Reads sessionStorage / listens for scroll after mount (client-only, can't
 // run during SSR). Kept as GPT built it — infra-only lint suppression, no
 // behavior change.
 // eslint-disable-next-line react-hooks/set-state-in-effect
 useEffect(()=>{if(sessionStorage.getItem("oragrol-chat-widget-dismissed")){setDismissed(true);return}if(sessionStorage.getItem("oragrol-chat-greeting-dismissed"))return;const show=()=>setGreeting(true);const timer=setTimeout(show,17000);const scroll=()=>{const depth=(scrollY+innerHeight)/document.documentElement.scrollHeight;if(depth>=.5){clearTimeout(timer);show();removeEventListener("scroll",scroll)}};addEventListener("scroll",scroll,{passive:true});return()=>{clearTimeout(timer);removeEventListener("scroll",scroll)}},[]);
 const dismissGreeting=()=>{setGreeting(false);sessionStorage.setItem("oragrol-chat-greeting-dismissed","1")};
 const dismissChat=()=>{setOpen(false);setGreeting(false);setDismissed(true);sessionStorage.setItem("oragrol-chat-widget-dismissed","1")};
 const launch=()=>{setOpen(!open);if(!open)dismissGreeting()};
 const submit=(e:FormEvent)=>{e.preventDefault();const clean=value.trim();if(!clean)return;const reply=answer(clean);setMessages(m=>[...m,{from:"visitor",text:clean},{from:"oragrol",...reply}]);setValue("")};
 if(dismissed)return null;
 return <div className="or-chat">{greeting&&!open&&<aside className="or-chat-greeting"><button onClick={dismissGreeting} aria-label="Dismiss chat greeting">×</button><small>ORAGROL</small><p>Have a question? We can help you find the right next step.</p><a onClick={launch}>Start a conversation ↗</a></aside>}<div className="or-chat-controls"><button className="or-chat-cancel" onClick={dismissChat} aria-label="Hide chat for this visit">×</button><button className="or-chat-launch" aria-label={open?"Close ORAGROL chat":"Open ORAGROL chat"} aria-expanded={open} onClick={launch}><span aria-hidden="true"/><b>{open?"Close":"Chat"}</b></button></div>{open&&<section className="or-chat-panel" role="dialog" aria-label="ORAGROL chat"><header><div><span className="or-chat-status" aria-hidden="true"/><div><strong>ORAGROL</strong><small>PRIVATE CONVERSATION</small></div></div><button onClick={()=>setOpen(false)} aria-label="Close chat window">×</button></header><div className="or-chat-log" aria-live="polite">{messages.map((m,i)=><article className={m.from} key={i}><small>{m.from==="oragrol"?"ORAGROL":"YOU"}</small><p>{m.text}</p>{m.email&&<a href="mailto:mota6748@gmail.com?subject=Priority ORAGROL enquiry">Email priority summary ↗</a>}</article>)}</div><form onSubmit={submit}><label htmlFor="or-chat-input">Your message</label><textarea id="or-chat-input" rows={2} value={value} onChange={e=>setValue(e.target.value)} placeholder="Write your question…"/><button aria-label="Send message">Send <span>↗</span></button></form><footer><span/>Available 24/7 · Human availability varies</footer></section>}</div>
}
