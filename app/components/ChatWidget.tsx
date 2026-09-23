"use client";
import {FormEvent,useEffect,useRef,useState} from "react";
import "../chat-widget.css";

type Message={
  from:"visitor"|"oragrol";
  text:string;
  email?:boolean;
  kind?:"text"|"form"|"intake";
  reason?:"urgent"|"human-requested";
};

const urgent=/breach|hacked|ransomware|compromised|attack|locked out|extort|active incident/i;
const human=/real person|human|someone|representative|speak to|talk to/i;
const emailPattern=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function localEscalation(value:string):{text:string;reason:"urgent"|"human-requested"}|null{
  if(urgent.test(value))return {text:"If you are not an ORAGROL client, this chat is not emergency incident response and does not create a service relationship. I have marked your message as priority — please leave your name and email so our team can follow up.",reason:"urgent"};
  if(human.test(value))return {text:"Of course — just so I can brief our team, what's this regarding? Please share your name and email below.",reason:"human-requested"};
  return null;
}

// Render markdown-style text as safe HTML with clickable links
function renderText(text:string):string{
  // Convert **bold** to <strong>
  let html=text.replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>");
  // Convert [text](url) to clickable links
  html=html.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,'<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  // Convert bare URLs that aren't already in an <a> tag
  html=html.replace(/(?<!href="|">)(https?:\/\/[^\s<>"]+)/g,'<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
  // Convert line breaks
  html=html.replace(/\n/g,"<br/>");
  return html;
}

export default function ChatWidget(){
  const [open,setOpen]=useState(false),[greeting,setGreeting]=useState(false),[dismissed,setDismissed]=useState(false),[value,setValue]=useState(""),[sending,setSending]=useState(false);
  const [contact,setContact]=useState<{name:string;email:string}|null>(null);
  const [formValue,setFormValue]=useState({name:"",email:""});
  const [intakeValue,setIntakeValue]=useState({name:"",email:"",company:""});
  const [intakeDone,setIntakeDone]=useState(false);
  const [messages,setMessages]=useState<Message[]>([]);
  const logRef=useRef<HTMLDivElement>(null);

  useEffect(()=>{
    if(logRef.current)logRef.current.scrollTop=logRef.current.scrollHeight;
  },[messages,sending]);

  useEffect(()=>{
    if(sessionStorage.getItem("oragrol-chat-widget-dismissed")){setDismissed(true);return;}
    if(sessionStorage.getItem("oragrol-chat-greeting-dismissed"))return;
    const show=()=>setGreeting(true);
    const timer=setTimeout(show,15000);
    const scroll=()=>{
      const depth=(scrollY+innerHeight)/document.documentElement.scrollHeight;
      if(depth>=.5){clearTimeout(timer);show();removeEventListener("scroll",scroll);}
    };
    addEventListener("scroll",scroll,{passive:true});
    return()=>{clearTimeout(timer);removeEventListener("scroll",scroll);};
  },[]);

  const dismissGreeting=()=>{setGreeting(false);sessionStorage.setItem("oragrol-chat-greeting-dismissed","1");};
  const dismissChat=()=>{setOpen(false);setGreeting(false);setDismissed(true);sessionStorage.setItem("oragrol-chat-widget-dismissed","1");};
  const restoreChat=()=>{setDismissed(false);sessionStorage.removeItem("oragrol-chat-widget-dismissed");};
  const launch=()=>{setOpen(!open);if(!open)dismissGreeting();};

  const submitIntake=(e:FormEvent)=>{
    e.preventDefault();
    const name=intakeValue.name.trim(),email=intakeValue.email.trim();
    if(!name||!emailPattern.test(email))return;
    setIntakeDone(true);
    setContact({name,email});
    setMessages([{from:"oragrol",text:"Hi "+name.split(" ")[0]+"! I'm ORAGROL's AI assistant. I can help you explore our services, answer questions about pricing, or point you in the right direction. What's on your mind?"}]);
  };

  const runEscalate=async(name:string,email:string,reason:"urgent"|"human-requested")=>{
    setSending(true);
    try{
      const transcript=messages.filter(m=>m.kind!=="form"&&m.kind!=="intake").map(m=>({role:m.from,text:m.text}));
      const res=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({mode:"escalate",name,email,reason,transcript})});
      const json=await res.json().catch(()=>null);
      if(res.ok&&json?.ok){
        setContact({name,email});
        setMessages(m=>[...m,{from:"oragrol",text:"Thank you — you're flagged as priority and the ORAGROL team will follow up at "+email+". In the meantime, you can also reach us at info@orgro.ca."}]);
      }else{
        setMessages(m=>[...m,{from:"oragrol",text:"I couldn't send that through just now. Please email us directly at info@orgro.ca.",email:true}]);
      }
    }catch{
      setMessages(m=>[...m,{from:"oragrol",text:"I couldn't send that through just now. Please email us at info@orgro.ca.",email:true}]);
    }finally{setSending(false);}
  };

  const submitForm=(e:FormEvent,reason:"urgent"|"human-requested")=>{
    e.preventDefault();
    const name=formValue.name.trim(),email=formValue.email.trim();
    if(!name||!emailPattern.test(email))return;
    setMessages(m=>m.filter(x=>x.kind!=="form"));
    setFormValue({name:"",email:""});
    runEscalate(name,email,reason);
  };

  const runReply=async(history:Message[])=>{
    setSending(true);
    try{
      const payload=history.filter(m=>m.kind!=="form"&&m.kind!=="intake").slice(-16).map(m=>({role:m.from,text:m.text}));
      const res=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({mode:"reply",messages:payload})});
      const json=await res.json().catch(()=>null);
      if(res.ok&&json?.ok&&json.reply){
        setMessages(m=>[...m,{from:"oragrol",text:json.reply}]);
      }else{
        setMessages(m=>[...m,{from:"oragrol",text:"I couldn't reach our system just now — please try again or email us at info@orgro.ca.",email:true}]);
      }
    }catch{
      setMessages(m=>[...m,{from:"oragrol",text:"I couldn't reach our system just now — please try again or email us at info@orgro.ca.",email:true}]);
    }finally{setSending(false);}
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

  if(dismissed)return <div className="or-chat or-chat-collapsed"><button className="or-chat-restore" onClick={restoreChat} aria-label="Reopen ORAGROL chat"><span aria-hidden="true"/></button></div>;

  return (
    <div className="or-chat">
      {greeting&&!open&&(
        <aside className="or-chat-greeting">
          <button onClick={dismissGreeting} aria-label="Dismiss chat greeting">×</button>
          <small>ORAGROL</small>
          <p>Have a question? We can help you find the right next step.</p>
          <a onClick={launch}>Start a conversation ↗</a>
        </aside>
      )}
      <div className="or-chat-controls">
        <button className="or-chat-cancel" onClick={dismissChat} aria-label="Hide chat for this visit">×</button>
        <button className="or-chat-launch" aria-label={open?"Close ORAGROL chat":"Open ORAGROL chat"} aria-expanded={open} onClick={launch}>
          <span aria-hidden="true"/><b>{open?"Close":"Chat"}</b>
        </button>
      </div>
      {open&&(
        <section className="or-chat-panel" role="dialog" aria-label="ORAGROL chat">
          <header>
            <div>
              <span className="or-chat-status" aria-hidden="true"/>
              <div><strong>ORAGROL</strong><small>AI ASSISTANT</small></div>
            </div>
            <button onClick={()=>setOpen(false)} aria-label="Close chat window">×</button>
          </header>

          {/* Intake form — shown before chat starts */}
          {!intakeDone?(
            <div className="or-chat-log" style={{justifyContent:"center",padding:"20px"}}>
              <form onSubmit={submitIntake} style={{display:"flex",flexDirection:"column",gap:"10px"}}>
                <p style={{fontSize:"13px",lineHeight:"1.5",margin:"0 0 8px",color:"#111315"}}>
                  <strong>Before we start</strong><br/>
                  We'll send you a copy of this conversation when we're done.
                </p>
                <input
                  required
                  placeholder="Your name *"
                  value={intakeValue.name}
                  onChange={e=>setIntakeValue(s=>({...s,name:e.target.value}))}
                  style={{border:"1px solid #aaa7a0",padding:"10px 12px",fontSize:"13px",background:"#f6f4ef",fontFamily:"inherit"}}
                />
                <input
                  required
                  type="email"
                  placeholder="Email address *"
                  value={intakeValue.email}
                  onChange={e=>setIntakeValue(s=>({...s,email:e.target.value}))}
                  style={{border:"1px solid #aaa7a0",padding:"10px 12px",fontSize:"13px",background:"#f6f4ef",fontFamily:"inherit"}}
                />
                <input
                  placeholder="Company name (optional)"
                  value={intakeValue.company}
                  onChange={e=>setIntakeValue(s=>({...s,company:e.target.value}))}
                  style={{border:"1px solid #aaa7a0",padding:"10px 12px",fontSize:"13px",background:"#f6f4ef",fontFamily:"inherit"}}
                />
                <p style={{fontSize:"11px",color:"#666",margin:"4px 0",lineHeight:"1.5"}}>
                  This chat is handled by AI and may be recorded. By continuing you consent to data collection per our{" "}
                  <a href="/privacy" target="_blank" rel="noopener" style={{color:"#ef4d00"}}>Privacy Policy</a>.
                </p>
                <button type="submit" style={{border:0,background:"#111315",color:"#fff",padding:"11px 16px",fontSize:"13px",fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
                  Start chat
                </button>
              </form>
            </div>
          ):(
            <div className="or-chat-log" ref={logRef} aria-live="polite">
              {messages.map((m,i)=>
                m.kind==="form"?(
                  <article className="oragrol or-chat-form" key={i}>
                    <small>ORAGROL</small>
                    <form onSubmit={e=>submitForm(e,m.reason||"human-requested")}>
                      <label>Name<input required value={formValue.name} onChange={e=>setFormValue(s=>({...s,name:e.target.value}))}/></label>
                      <label>Email<input required type="email" value={formValue.email} onChange={e=>setFormValue(s=>({...s,email:e.target.value}))}/></label>
                      <button disabled={sending} type="submit">Send to ORAGROL ↗</button>
                    </form>
                  </article>
                ):(
                  <article className={m.from} key={i}>
                    <small>{m.from==="oragrol"?"ORAGROL":"YOU"}</small>
                    <p dangerouslySetInnerHTML={{__html:renderText(m.text)}}/>
                    {m.email&&<a href="mailto:info@orgro.ca?subject=Priority ORAGROL enquiry">Email priority summary ↗</a>}
                  </article>
                )
              )}
              {sending&&<article className="oragrol or-chat-typing"><small>ORAGROL</small><p>Typing…</p></article>}
            </div>
          )}

          {intakeDone&&(
            <form onSubmit={submit}>
              <label htmlFor="or-chat-input">Your message</label>
              <textarea id="or-chat-input" rows={2} value={value} onChange={e=>setValue(e.target.value)} placeholder="Write your question…"/>
              <button disabled={sending} aria-label="Send message">Send <span>↗</span></button>
            </form>
          )}

          <footer>
            <span/>
            AI assistant · May make mistakes · <a href="mailto:info@orgro.ca" style={{color:"inherit"}}>info@orgro.ca</a>
          </footer>
        </section>
      )}
    </div>
  );
}
