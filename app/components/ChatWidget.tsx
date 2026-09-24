"use client";
import {FormEvent,useCallback,useEffect,useRef,useState} from "react";
import "../chat-widget.css";

type Message={
  from:"visitor"|"oragrol";
  text:string;
  email?:boolean;
  kind?:"form";
  reason?:"urgent"|"human-requested";
};

const urgent=/breach|hacked|ransomware|compromised|attack|locked out|extort|active incident/i;
const emailPattern=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_TYPES=["image/jpeg","image/jpg","image/png","image/webp"];
const MAX_FILE_SIZE=5*1024*1024;

function MsgText({text}:{text:string}){
  // Pre-process: convert markdown [label](url) to a placeholder, then split
  // This prevents [/contact](/contact) from rendering twice
  const mdLinkRe=/\[([^\]]+)\]\(([^)]+)\)/g;
  const mdLinks:{label:string;href:string}[]=[];
  const preprocessed=text.replace(mdLinkRe,(_, label, href)=>{
    const idx=mdLinks.length;
    mdLinks.push({label,href});
    return `\x00MDLINK${idx}\x00`;
  });

  const parts=preprocessed.split(/(\*\*.+?\*\*|\x00MDLINK\d+\x00|https?:\/\/[^\s),]+|\/[a-z][a-z0-9-]*(?:\/[a-z0-9-]*)*)/g);

  return(
    <p style={{fontSize:"13px",lineHeight:1.6,margin:"4px 0 0",overflowWrap:"break-word",wordBreak:"break-word",whiteSpace:"pre-wrap",minWidth:0,padding:0}}>
      {parts.map((seg,i)=>{
        if(!seg)return null;
        // Bold
        if(seg.startsWith("**")&&seg.endsWith("**"))return<strong key={i}>{seg.slice(2,-2)}</strong>;
        // Markdown link placeholder
        const mdMatch=seg.match(/^\x00MDLINK(\d+)\x00$/);
        if(mdMatch){
          const{label,href}=mdLinks[Number(mdMatch[1])];
          const isExternal=/^https?:\/\//.test(href)&&!/orgro\.ca|oragrolglobal\.com/.test(href);
          return<a key={i} href={href} {...(isExternal?{target:"_blank",rel:"noopener noreferrer"}:{})} style={{color:"#ef4d00",textDecoration:"underline"}}>{label}</a>;
        }
        // Full https:// URL
        if(seg.startsWith("http")){
          const isInternal=/orgro\.ca|oragrolglobal\.com/.test(seg);
          return<a key={i} href={seg} {...(isInternal?{}:{target:"_blank",rel:"noopener noreferrer"})} style={{color:"#ef4d00",textDecoration:"underline",wordBreak:"break-all"}}>{seg}</a>;
        }
        // Relative /path
        if(seg.startsWith("/")&&seg.length>1)return<a key={i} href={seg} style={{color:"#ef4d00",textDecoration:"underline"}}>{seg}</a>;
        // Plain text
        return<span key={i}>{seg}</span>;
      })}
    </p>
  );
}

const bubble=(from:"visitor"|"oragrol"):React.CSSProperties=>({
  padding:"10px 14px",
  borderRadius: from==="oragrol"?"2px 12px 12px 12px":"12px 2px 12px 12px",
  background: from==="oragrol"?"#f0ede6":"#1a1a1a",
  color: from==="oragrol"?"#111315":"#f4f1ea",
  alignSelf: from==="oragrol"?"flex-start":"flex-end",
  maxWidth:"82%",
  boxSizing:"border-box" as const,
  overflowWrap:"break-word",
  wordBreak:"break-word",
  minWidth:0,
});

export default function ChatWidget(){
  const [open,setOpen]=useState(false);
  const [greeting,setGreeting]=useState(false);
  const [dismissed,setDismissed]=useState(false);
  const [value,setValue]=useState("");
  const [sending,setSending]=useState(false);
  const [contact,setContact]=useState<{name:string;email:string}|null>(null);
  const [formValue,setFormValue]=useState({name:"",email:""});
  const [intakeValue,setIntakeValue]=useState({name:"",email:"",company:""});
  const [intakeDone,setIntakeDone]=useState(false);
  const [messages,setMessages]=useState<Message[]>([]);
  const [pendingFile,setPendingFile]=useState<{file:File;preview:string}|null>(null);
  const logRef=useRef<HTMLDivElement>(null);
  const fileInputRef=useRef<HTMLInputElement>(null);
  const inactivityRef=useRef<ReturnType<typeof setTimeout>|undefined>(undefined);
  const messagesRef=useRef<Message[]>([]);
  const contactRef=useRef<{name:string;email:string}|null>(null);
  const transcriptSentRef=useRef(false);

  useEffect(()=>{messagesRef.current=messages;},[messages]);
  useEffect(()=>{contactRef.current=contact;},[contact]);

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

  const fireClose=useCallback(()=>{
    const c=contactRef.current;
    const msgs=messagesRef.current.filter(m=>m.kind!=="form"&&(m.text||"").trim().length>0);
    if(!c||msgs.length===0||transcriptSentRef.current)return;
    transcriptSentRef.current=true;
    fetch("/api/chat-close",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        sessionId:"chat_"+Date.now(),
        visitorName:c.name,
        visitorEmail:c.email,
        messages:msgs.map(m=>({from:m.from,text:m.text,timestamp:Date.now()})),
        escalated:false,
      }),
      keepalive:true,
    }).catch(()=>{});
  },[]);

  // Inactivity timer — 3 min after last exchange, send transcript
  const resetInactivity=useCallback(()=>{
    clearTimeout(inactivityRef.current);
    inactivityRef.current=setTimeout(fireClose,3*60*1000);
  },[fireClose]);

  // Also fire on tab hide/close
  useEffect(()=>{
    const h=()=>{if(document.visibilityState==="hidden")fireClose();};
    document.addEventListener("visibilitychange",h);
    return()=>document.removeEventListener("visibilitychange",h);
  },[fireClose]);

  const dismissGreeting=()=>{setGreeting(false);sessionStorage.setItem("oragrol-chat-greeting-dismissed","1");};
  const dismissChat=()=>{setOpen(false);setGreeting(false);setDismissed(true);sessionStorage.setItem("oragrol-chat-widget-dismissed","1");};
  const restoreChat=()=>{setDismissed(false);sessionStorage.removeItem("oragrol-chat-widget-dismissed");};
  const launch=()=>{setOpen(!open);if(!open)dismissGreeting();};
  const closePanel=()=>{fireClose();setOpen(false);};

  const submitIntake=(e:FormEvent)=>{
    e.preventDefault();
    const name=intakeValue.name.trim(),email=intakeValue.email.trim(),company=intakeValue.company.trim();
    if(!name||!emailPattern.test(email))return;
    setIntakeDone(true);
    setContact({name,email});
    fetch("/api/chat-lead",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name,email,company}),keepalive:true}).catch(()=>{});
    setMessages([{from:"oragrol",text:"Hi "+name.split(" ")[0]+"! I am ORAGROL's AI assistant. I can help you with our services, pricing, and any questions about how we work. What would you like to know?"}]);
  };

  const runEscalate=async(name:string,email:string,reason:"urgent"|"human-requested")=>{
    setSending(true);
    try{
      const transcript=messages.filter(m=>m.kind!=="form").map(m=>({role:m.from,text:m.text}));
      const res=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({mode:"escalate",name,email,reason,transcript})});
      const json=await res.json().catch(()=>null);
      if(res.ok&&json?.ok){
        setMessages(m=>[...m,{from:"oragrol",text:"Got it. Our team has been notified and will follow up at "+email+" shortly. You can also reach us at info@orgro.ca."}]);
      }else{
        setMessages(m=>[...m,{from:"oragrol",text:"I was unable to notify the team right now. Please email us at info@orgro.ca.",email:true}]);
      }
    }catch{
      setMessages(m=>[...m,{from:"oragrol",text:"I was unable to notify the team right now. Please email us at info@orgro.ca.",email:true}]);
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

  const runReply=async(history:Message[],imageNote?:string)=>{
    setSending(true);
    try{
      const payload=history.filter(m=>m.kind!=="form").slice(-16).map(m=>({role:m.from,text:m.text}));
      const res=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({mode:"reply",messages:payload})});
      const json=await res.json().catch(()=>null);
      if(res.ok&&json?.ok&&json.reply){
        setMessages([...history,{from:"oragrol",text:json.reply}]);
        resetInactivity();
      }else{
        setMessages(m=>[...m,{from:"oragrol",text:"I could not reach the system right now. Please try again or email us at info@orgro.ca.",email:true}]);
      }
    }catch{
      setMessages(m=>[...m,{from:"oragrol",text:"I could not reach the system right now. Please try again or email us at info@orgro.ca.",email:true}]);
    }finally{setSending(false);}
  };

  const handleFile=(e:React.ChangeEvent<HTMLInputElement>)=>{
    const f=e.target.files?.[0];
    if(!f)return;
    if(!ALLOWED_TYPES.includes(f.type)){alert("Only JPG, PNG, WEBP images accepted.");return;}
    if(f.size>MAX_FILE_SIZE){alert("Image must be under 5MB.");return;}
    setPendingFile({file:f,preview:URL.createObjectURL(f)});
    e.target.value="";
  };

  const submit=(e:FormEvent)=>{
    e.preventDefault();
    const clean=value.trim();
    if((!clean&&!pendingFile)||sending)return;

    let msgText=clean;
    if(pendingFile){
      msgText=clean?(clean+" [image attached]"):"[image attached]";
      URL.revokeObjectURL(pendingFile.preview);
      setPendingFile(null);
    }
    setValue("");

    // Only escalate for genuine security incidents — not "talk to person"
    if(urgent.test(msgText)){
      const next:Message[]=[...messages,{from:"visitor",text:msgText},{from:"oragrol",text:"This sounds urgent. I have notified our team as a priority. Please share your name and email so we can follow up immediately."}];
      if(contact){setMessages(next);runEscalate(contact.name,contact.email,"urgent");}
      else{setMessages([...next,{from:"oragrol",text:"",kind:"form",reason:"urgent"}]);}
      return;
    }

    // For everything else including "talk to person" — let AI handle it first
    const next=[...messages,{from:"visitor" as const,text:msgText}];
    setMessages(next);
    runReply(next);
  };

  if(dismissed)return<div className="or-chat or-chat-collapsed"><button className="or-chat-restore" onClick={restoreChat} aria-label="Reopen ORAGROL chat"><span aria-hidden="true"/></button></div>;

  return(
    <div className="or-chat">
      {greeting&&!open&&(
        <aside className="or-chat-greeting">
          <button onClick={dismissGreeting} aria-label="Dismiss">×</button>
          <small>ORAGROL</small>
          <p>Have a question? We can help you find the right next step.</p>
          <a onClick={launch}>Start a conversation ↗</a>
        </aside>
      )}
      <div className="or-chat-controls">
        <button className="or-chat-cancel" onClick={dismissChat} aria-label="Hide chat">×</button>
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
            <button onClick={closePanel} aria-label="Close chat">×</button>
          </header>

          {!intakeDone?(
            <div style={{flex:1,overflowY:"auto",padding:"20px",display:"flex",flexDirection:"column",justifyContent:"center",background:"#f4f1ea"}}>
              <form onSubmit={submitIntake} style={{display:"flex",flexDirection:"column",gap:"10px"}}>
                <p style={{fontSize:"13px",lineHeight:1.5,margin:"0 0 8px",color:"#111315"}}>
                  <strong>Before we start</strong><br/>
                  We will send you a copy of this conversation when we are done.
                </p>
                <input required placeholder="Your name *" value={intakeValue.name}
                  onChange={e=>setIntakeValue(s=>({...s,name:e.target.value}))}
                  style={{border:"1px solid #aaa7a0",padding:"10px 12px",fontSize:"13px",background:"#fff",fontFamily:"inherit",outline:"none",color:"#111315"}}/>
                <input required type="email" placeholder="Email address *" value={intakeValue.email}
                  onChange={e=>setIntakeValue(s=>({...s,email:e.target.value}))}
                  style={{border:"1px solid #aaa7a0",padding:"10px 12px",fontSize:"13px",background:"#fff",fontFamily:"inherit",outline:"none",color:"#111315"}}/>
                <input placeholder="Company name (optional)" value={intakeValue.company}
                  onChange={e=>setIntakeValue(s=>({...s,company:e.target.value}))}
                  style={{border:"1px solid #aaa7a0",padding:"10px 12px",fontSize:"13px",background:"#fff",fontFamily:"inherit",outline:"none",color:"#111315"}}/>
                <p style={{fontSize:"11px",color:"#666",margin:"4px 0",lineHeight:1.5}}>
                  This chat is handled by AI and may be recorded. By continuing you consent to data collection per our{" "}
                  <a href="/privacy" target="_blank" rel="noopener" style={{color:"#ef4d00"}}>Privacy Policy</a>.
                </p>
                <button type="submit" style={{border:0,background:"#ef4d00",color:"#fff",padding:"11px 16px",fontSize:"13px",fontWeight:600,cursor:"pointer",fontFamily:"inherit",borderRadius:"2px"}}>
                  Start chat
                </button>
              </form>
            </div>
          ):(
            <div ref={logRef} style={{flex:1,overflowY:"auto",padding:"16px",display:"flex",flexDirection:"column",gap:"12px",background:"#f4f1ea",minHeight:0}}>
              {messages.map((m,i)=>
                m.kind==="form"?(
                  <div key={i} style={{...bubble("oragrol"),padding:"14px"}}>
                    <p style={{fontSize:"12px",color:"#ef4d00",margin:"0 0 8px",letterSpacing:".1em"}}>ORAGROL</p>
                    <form onSubmit={e=>submitForm(e,m.reason||"human-requested")} style={{display:"flex",flexDirection:"column",gap:"8px"}}>
                      <input required placeholder="Your name" value={formValue.name} onChange={e=>setFormValue(s=>({...s,name:e.target.value}))}
                        style={{border:"1px solid #ccc",padding:"8px 10px",fontSize:"13px",fontFamily:"inherit",outline:"none"}}/>
                      <input required type="email" placeholder="Your email" value={formValue.email} onChange={e=>setFormValue(s=>({...s,email:e.target.value}))}
                        style={{border:"1px solid #ccc",padding:"8px 10px",fontSize:"13px",fontFamily:"inherit",outline:"none"}}/>
                      <button disabled={sending} type="submit" style={{border:0,background:"#ef4d00",color:"#fff",padding:"9px 14px",fontSize:"13px",cursor:"pointer",fontFamily:"inherit"}}>
                        Notify our team
                      </button>
                    </form>
                  </div>
                ):(
                  <div key={i} style={bubble(m.from)}>
                    <p style={{fontSize:"11px",color:m.from==="oragrol"?"#ef4d00":"#999",margin:"0 0 4px",letterSpacing:".1em"}}>
                      {m.from==="oragrol"?"ORAGROL":"YOU"}
                    </p>
                    <MsgText text={m.text}/>
                    {m.email&&<a href="mailto:info@orgro.ca" style={{color:"#ef4d00",fontSize:"12px",display:"block",marginTop:"6px"}}>Email us directly ↗</a>}
                  </div>
                )
              )}
              {sending&&(
                <div style={bubble("oragrol")}>
                  <p style={{fontSize:"11px",color:"#ef4d00",margin:"0 0 4px",letterSpacing:".1em"}}>ORAGROL</p>
                  <p style={{fontSize:"13px",color:"#666",margin:0}}>Typing...</p>
                </div>
              )}
            </div>
          )}

          {intakeDone&&(
            <div style={{borderTop:"1px solid #ccc",background:"#f4f1ea",padding:"10px 12px",display:"flex",flexDirection:"column",gap:"6px"}}>
              {pendingFile&&(
                <div style={{fontSize:"12px",color:"#666",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"4px 8px",background:"#e8e5dc",borderRadius:"2px"}}>
                  <span>📎 {pendingFile.file.name}</span>
                  <button onClick={()=>setPendingFile(null)} style={{border:0,background:"none",cursor:"pointer",color:"#666",fontSize:"14px"}}>×</button>
                </div>
              )}
              <form onSubmit={submit} style={{display:"flex",gap:"6px",alignItems:"stretch"}}>
                <button type="button" onClick={()=>fileInputRef.current?.click()}
                  style={{border:"1px solid #aaa7a0",background:"#f4f1ea",padding:"0 10px",cursor:"pointer",fontSize:"16px",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",minHeight:"40px"}}
                  title="Attach image — JPG, PNG or WEBP, max 5MB">📎</button>
                <textarea value={value} onChange={e=>setValue(e.target.value)}
                  onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();submit(e as unknown as FormEvent);}}}
                  placeholder="Write your question..."
                  style={{flex:1,resize:"none",border:"1px solid #aaa7a0",padding:"8px 10px",fontSize:"13px",fontFamily:"inherit",background:"#fff",outline:"none",minHeight:"40px",maxHeight:"100px",height:"40px"}}/>
                <button type="submit" disabled={sending||(!value.trim()&&!pendingFile)}
                  style={{border:0,background:"#111315",color:"#fff",padding:"0 14px",cursor:"pointer",fontSize:"13px",fontWeight:600,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",minHeight:"40px",opacity:(sending||(!value.trim()&&!pendingFile))?0.5:1}}>
                  Send
                </button>
              </form>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" style={{display:"none"}} onChange={handleFile}/>
              <p style={{fontSize:"10px",color:"#999",margin:0,textAlign:"center"}}>
                AI assistant · May make mistakes · <a href="mailto:info@orgro.ca" style={{color:"#999"}}>info@orgro.ca</a>
              </p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
