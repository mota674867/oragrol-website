"use client";
import {FormEvent,useEffect,useRef,useState} from "react";
import {Link} from "@/i18n/navigation";
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
const MAX_VISITOR_MESSAGES=25;
const MAX_MESSAGE_CHARS=1000;

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
          // CodeQL didn't flag this branch, but it's the one actually worth
          // fixing: markdown syntax `[label](url)` puts whatever's inside
          // the parens straight into `href` with NO scheme check at all —
          // unlike the two branches below, a chat message containing
          // `[click here](javascript:alert(1))` would render a real,
          // clickable XSS link, since React does not block javascript:
          // hrefs. Only allow it through as a link when it's http(s) or a
          // site-relative path; anything else renders as plain text.
          const isSafeHref=/^https?:\/\//i.test(href)||(href.startsWith("/")&&href.length>1);
          if(!isSafeHref)return<span key={i}>{label}</span>;
          const isExternal=/^https?:\/\//.test(href)&&!/orgro\.ca|oragrolglobal\.com/.test(href);
          return<a key={i} href={href} {...(isExternal?{target:"_blank",rel:"noopener noreferrer"}:{})} style={{color:"#ef4d00",textDecoration:"underline"}}>{label}</a>;
        }
        // Full https:// URL
        // CodeQL #13 (js/xss-through-dom) — flagged here even though `seg`
        // can only reach this branch already matching the split regex's
        // `https?:\/\/[^\s),]+` alternative above (line 29), which makes a
        // non-http(s) scheme structurally impossible. Re-checking the full
        // scheme with .test() right at the sink, instead of relying on the
        // split regex elsewhere in the file, makes that guarantee local and
        // explicit rather than implicit.
        if(/^https?:\/\//i.test(seg)){
          const isInternal=/orgro\.ca|oragrolglobal\.com/.test(seg);
          return<a key={i} href={seg} {...(isInternal?{}:{target:"_blank",rel:"noopener noreferrer"})} style={{color:"#ef4d00",textDecoration:"underline",wordBreak:"break-all"}}>{seg}</a>;
        }
        // Relative /path
        // CodeQL #14 — same reasoning as #13: the split regex's path
        // alternative (`\/[a-z][a-z0-9-]*...`) already makes a dangerous
        // scheme here structurally impossible, but checking it explicitly
        // at the sink removes any doubt.
        if(/^\/[a-z0-9][a-z0-9/-]*$/i.test(seg))return<a key={i} href={seg} style={{color:"#ef4d00",textDecoration:"underline"}}>{seg}</a>;
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
  const [contact,setContact]=useState<{name:string;email:string;company?:string;sendCopy:boolean}|null>(null);
  const [formValue,setFormValue]=useState({name:"",email:""});
  const [intakeValue,setIntakeValue]=useState({name:"",email:"",company:"",sendCopy:true});
  const [intakeDone,setIntakeDone]=useState(false);
  const [messages,setMessages]=useState<Message[]>([]);
  const [pendingFile,setPendingFile]=useState<{file:File;preview:string}|null>(null);
  const logRef=useRef<HTMLDivElement>(null);
  const fileInputRef=useRef<HTMLInputElement>(null);
  const messagesRef=useRef<Message[]>([]);
  const contactRef=useRef<{name:string;email:string;company?:string;sendCopy:boolean}|null>(null);
  const handoffRef=useRef(false);
  const escalatedRef=useRef(false);
  const sessionIdRef=useRef("");

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

  // The server saves every answered turn and closes the chat itself after 15 minutes of silence,
  // emailing the transcript (see lib/chat-session.ts). The browser no longer decides when a chat ends.
  const dismissGreeting=()=>{setGreeting(false);sessionStorage.setItem("oragrol-chat-greeting-dismissed","1");};
  const dismissChat=()=>{setOpen(false);setGreeting(false);setDismissed(true);sessionStorage.setItem("oragrol-chat-widget-dismissed","1");};
  const restoreChat=()=>{setDismissed(false);sessionStorage.removeItem("oragrol-chat-widget-dismissed");};
  const launch=()=>{setOpen(!open);if(!open)dismissGreeting();};
  const closePanel=()=>{setOpen(false);};

  const submitIntake=(e:FormEvent)=>{
    e.preventDefault();
    const name=intakeValue.name.trim(),email=intakeValue.email.trim(),company=intakeValue.company.trim();
    if(!name||!emailPattern.test(email))return;
    setIntakeDone(true);
    if(!sessionIdRef.current)sessionIdRef.current="chat_"+crypto.randomUUID().replace(/-/g,"");
    setContact({name,email,company:company||undefined,sendCopy:intakeValue.sendCopy});
    fetch("/api/chat-lead",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name,email,company}),keepalive:true}).catch(()=>{});
    setMessages([{from:"oragrol",text:"Hi "+name.split(" ")[0]+"! I am ORAGROL's AI assistant. Please note this chat is available in English only. I can help with our services, pricing, and how we work, or point you to our free business scan at /scan if you are not sure where to start. What would you like to know?"}]);
  };

  const runEscalate=async(name:string,email:string,reason:"urgent"|"human-requested")=>{
    escalatedRef.current=true;
    try{
      const transcript=messagesRef.current.filter(m=>m.kind!=="form"&&m.text.trim().length>0).slice(-30).map(m=>({role:m.from,text:m.text}));
      // Silent team alert only: the visitor is never told "we notified the team". Their only channel is the Contact button.
      await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({mode:"escalate",name,email,reason,transcript,sessionId:sessionIdRef.current||undefined})});
    }catch{
      // nothing to show the visitor
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

  const runReply=async(history:Message[],imageNote?:string)=>{
    setSending(true);
    try{
      const payload=history.filter(m=>m.kind!=="form").slice(-16).map(m=>({role:m.from,text:m.text}));
      const res=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({mode:"reply",messages:payload,sessionId:sessionIdRef.current||undefined,contact:contactRef.current||undefined})});
      const json=await res.json().catch(()=>null);
      if(res.ok&&json?.ok&&json.reply){
        const withReply:Message[]=[...history,{from:"oragrol",text:json.reply}];
        setMessages(withReply);
        messagesRef.current=withReply;
        // The AI could not answer (or the topic is for the team): send a REAL hand-off to ORAGROL, once per chat.
        const c=contactRef.current;
        if(json.handoff&&!json.capped&&c&&!handoffRef.current){
          handoffRef.current=true;
          void runEscalate(c.name,c.email,"human-requested");
        }
      }else if(res?.status===400&&json?.error){
        setMessages(m=>[...m,{from:"oragrol",text:String(json.error)}]);
      }else{
        setMessages(m=>[...m,{from:"oragrol",text:"I could not reach the system right now. Please try again or use our contact page.",email:true}]);
      }
    }catch{
      setMessages(m=>[...m,{from:"oragrol",text:"I could not reach the system right now. Please try again or use our contact page.",email:true}]);
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

    // Per-chat cap: keeps cost flat and stops runaway sessions.
    if(messages.filter(m=>m.from==="visitor").length>=MAX_VISITOR_MESSAGES){
      setMessages([...messages,{from:"visitor",text:msgText},{from:"oragrol",text:"We have reached the limit for this chat. Please continue through our contact page. A copy of this conversation will be sent to you."}]);
      return;
    }

    // Only escalate for genuine security incidents — not "talk to person"
    if(urgent.test(msgText)){
      const next:Message[]=[...messages,{from:"visitor",text:msgText},{from:"oragrol",text:"This sounds urgent. Please note this chat is not emergency incident response. Please use our contact page right away."}];
      setMessages(next);
      if(contact)void runEscalate(contact.name,contact.email,"urgent");
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
                  This chat is available in English only.
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
                <label style={{display:"flex",gap:"8px",alignItems:"center",fontSize:"12px",color:"#111315"}}>
                  <input type="checkbox" checked={intakeValue.sendCopy} onChange={e=>setIntakeValue(s=>({...s,sendCopy:e.target.checked}))}/>
                  Email me a copy of this conversation
                </label>
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
                    <MsgText text={m.from==="oragrol"?m.text.replace(/info@orgro\.ca/gi,"our contact page").replace(/(?<![(\w/])\/contact(?![\w-])/g,"our contact page"):m.text}/>
                    {m.from==="oragrol"&&(m.email||/\/contact|contact page|info@orgro\.ca|notified/i.test(m.text))&&<Link href="/contact" style={{display:"inline-block",marginTop:"8px",background:"#ef4d00",color:"#fff",padding:"7px 14px",fontSize:"12px",textDecoration:"none",fontFamily:"inherit"}}>Contact us</Link>}
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
                  placeholder="Write your question..." maxLength={MAX_MESSAGE_CHARS}
                  style={{flex:1,resize:"none",border:"1px solid #aaa7a0",padding:"8px 10px",fontSize:"13px",fontFamily:"inherit",background:"#fff",outline:"none",minHeight:"40px",maxHeight:"100px",height:"40px"}}/>
                <button type="submit" disabled={sending||(!value.trim()&&!pendingFile)}
                  style={{border:0,background:"#111315",color:"#fff",padding:"0 14px",cursor:"pointer",fontSize:"13px",fontWeight:600,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",minHeight:"40px",opacity:(sending||(!value.trim()&&!pendingFile))?0.5:1}}>
                  Send
                </button>
              </form>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" style={{display:"none"}} onChange={handleFile}/>
              <p style={{fontSize:"10px",color:"#999",margin:0,textAlign:"center"}}>
                AI assistant · May make mistakes · <Link href="/contact" style={{color:"#999"}}>Contact us</Link>
              </p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
