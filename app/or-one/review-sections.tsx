import s from './review-sections.module.css';

export function RevisedProcess(){return <section className={`${s.section} ${s.process}`}><div className={s.heading}><p className={s.eyebrow}>FROM SCOPE TO OPERATION</p><h2>A clear path.<br/><span>A working system.</span></h2><p>Define the work, connect the right tools and agree the controls before launch.</p></div><div className={s.steps}>{[
['01','Define scope','Agree the workflows, tools, access and outcomes your system needs to support.','A defined scope'],
['02','Build & connect','Engineer the agreed workflows and connect them to your approved business systems.','Connected workflows'],
['03','Test & approve','Review real scenarios with your team, including exceptions and approval points.','Readiness for launch'],
['04','Launch & maintain','Put approved workflows into operation with the agreed monitoring and support.','An operating system'],
].map(([n,title,copy,result])=><article key={n}><span className={s.number}>{n}</span><h3>{title}</h3><p>{copy}</p><small>{result}</small></article>)}</div></section>}

export function RevisedPricing(){return <section className={`${s.section} ${s.pricing}`}><div className={s.heading}><p className={s.eyebrow}>OR ONE / SYSTEM FEES</p><h2>Know the investment.<br/><span>Define the scope.</span></h2><p>One build fee for your system. A base monthly fee for ongoing operation.</p></div><div className={s.prices}>{[
['STARTER','Up to 30 Points · one category','$22,000','$600','A focused first system.'],
['100','Up to 100 Points','$75,000','$1,800','A broader connected scope.'],
['200','Up to 200 Points','$150,000','$2,800','More workflows working together.'],
['400','Up to 400 Points','$220,000','$4,200','An extensive operating scope.'],
].map(([name,points,build,monthly,line])=><article key={name}><span className={s.eyebrow}>OR / ONE</span><h3>{name}</h3><p className={s.fit}>{line}</p><p className={s.points}>{points}</p><div className={s.fee}><span>BUILD FEE</span><strong>{build}</strong></div><div className={s.monthly}><span>BASE MONTHLY OR SERVICE FEE</span><strong>{monthly}<small>/mo</small></strong></div></article>)}</div><div className={s.pricingNote}><p>All fees in CAD. Points measure the complexity of your selected capabilities and help determine your system tier. Final scope and monthly fee are confirmed through private review.</p><p>The builder provides a preliminary tier, not a binding quote.</p></div></section>}

export function RevisedResponsibility(){return <section className={`${s.section} ${s.control}`}><div className={s.heading}><p className={s.eyebrow}>RESPONSIBILITY / AUTHORIZED ACTION</p><h2>You stay<br/><span>in control.</span></h2><p>Agree what the system may do, where your team reviews its work and which actions remain restricted.</p></div><div className={s.controlRows}>{[
['01','Routine work','Within agreed boundaries','Research, reporting and reversible administration can be configured to run within approved access and rules.'],
['02','Review points','Your team decides where','Customer communications, draft invoices and operational updates need clearly defined review and approval rules.'],
['03','Sensitive actions','Explicit authority required','Payments, payroll, hiring decisions and security changes require specific controls and authorization. Selecting a capability does not grant that authority.'],
].map(([n,title,tag,copy])=><article key={n}><span className={s.rowNumber}>{n}</span><div><h3>{title}</h3><small>{tag}</small></div><p>{copy}</p></article>)}</div><p className={s.footnote}>Approval rules, access limits and escalation responsibilities are agreed during scoping and validated before launch.</p></section>}

export function RevisedManagement(){return <section className={`${s.section} ${s.management}`}><div className={s.heading}><p className={s.eyebrow}>MONTHLY MANAGEMENT / OR SERVICE FEE</p><h2>Built once.<br/><span>Looked after continuously.</span></h2><p>The build fee covers engineering. The monthly OR Service Fee supports the live system within your agreed scope.</p></div><div className={s.managementGrid}>{[
['Monitor','Review workflow health and surface exceptions that need attention.'],
['Maintain','Maintain approved integrations and configurations as connected systems change.'],
['Test','Check agreed workflows and controls when changes are introduced.'],
['Support','Help your team resolve operating issues through the agreed support process.'],
].map(([title,copy],i)=><article key={title}><span className={s.eyebrow}>0{i+1}</span><h3>{title}</h3><p>{copy}</p></article>)}</div><p className={s.footnote}>Coverage, review frequency, support arrangements and the final monthly fee are confirmed in your proposal.</p></section>}

