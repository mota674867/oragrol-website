"use client";

import React, { useId, useState } from "react";
import type { FormEvent, ReactNode } from "react";

export type PageKind = "careers" | "talent" | "partnerships";
export type Vacancy = { id: string; title: string; description?: string };
export type ApplicationPayload = {
  page: PageKind;
  category: string;
  fields: Record<string, string>;
  files: File[];
};
export type OpportunityPageProps = {
  page: PageKind;
  logo?: ReactNode;
  privacyUrl: string;
  termsUrl: string;
  vacancies?: Vacancy[];
  /** Leave false until private storage, routing and server validation are connected. */
  submissionsEnabled?: boolean;
  onSubmit?: (payload: ApplicationPayload) => Promise<void>;
};

const MAX_BYTES = 8 * 1024 * 1024;
const wordCount = (value: string) => (value.trim() ? value.trim().split(/\s+/u).length : 0);
const content = {
  careers: {
    eyebrow: "CAREERS", title: "Build what comes next.",
    intro: "Join ORAGROL through employment or paid project-based work. Bring your expertise, initiative and commitment to meaningful outcomes.",
    categories: ["Sales & Growth", "Certified Specialists", "Current Vacancies"],
  },
  talent: {
    eyebrow: "TALENT", title: "Bring your expertise. Share what comes next.",
    intro: "Introduce your expertise or an idea worth exploring. This is a place for exploratory collaboration without a defined job or project role.",
    categories: ["Share Your Expertise", "Propose an Idea"],
  },
  partnerships: {
    eyebrow: "PARTNERSHIPS", title: "Stronger outcomes, built together.",
    intro: "Explore collaboration, regional growth or investment in new technology. Individuals and organizations in Canada and internationally are welcome.",
    categories: ["Business Collaboration", "Regional or Branch", "Technology Investment", "Other Opportunity"],
  },
};
const specialties = [
  ["Certified Penetration Tester", "OSCP / GPEN"],
  ["SOC 2 Audit Partner", "CPA firm · AICPA SOC practice"],
  ["PCI-DSS QSA", "PCI SSC accredited"],
  ["Certified Forensic Examiner", "GCFA / GCFE"],
];

/** One implementation for /careers, /talent and /partnerships. No site header/footer. */
export default function OragrolOpportunityPage(props: OpportunityPageProps) {
  return <OpportunityContent key={props.page} {...props} />;
}

function OpportunityContent({ page, logo, privacyUrl, termsUrl, vacancies = [], submissionsEnabled = false, onSubmit }: OpportunityPageProps) {
  const config = content[page];
  const [category, setCategory] = useState<string>(config.categories[0]);
  return <main className="op-page">
    <style>{styles}</style>
    <div className="op-shell">
      <div className="op-logo">{logo || <span className="op-wordmark">ORAGROL<span>GLOBAL</span></span>}</div>
      <header className="op-hero"><p className="op-eyebrow">{config.eyebrow}</p><h1>{config.title}</h1><p>{config.intro}</p></header>
      <fieldset className="op-categories"><legend className="op-sr">Choose your opportunity</legend>
        {config.categories.map(value => <label key={value} className={category === value ? "op-selected" : ""}>
          <input type="radio" name={`category-${page}`} value={value} checked={category === value} onChange={() => setCategory(value)} /><span>{value}</span>
        </label>)}
      </fieldset>
      <section className="op-context" aria-live="polite">
        {page === "careers" && category === "Sales & Growth" && <><h2>Sales & Growth</h2><p>Applications are always open for people who can build relationships, develop opportunities and help businesses grow.</p></>}
        {page === "careers" && category === "Certified Specialists" && <><h2>Certified Specialists & Audit Partners</h2><p>Project-based opportunities for independent specialists and qualified firms.</p><ul className="op-specialties">{specialties.map(([title, credential]) => <li key={title}>{title}<span>{credential}</span></li>)}</ul><p>Other relevant expertise is welcome.</p></>}
        {page === "careers" && category === "Current Vacancies" && <><h2>Current Vacancies</h2><p>{vacancies.length ? "Apply for a confirmed role below." : "There are no other vacancies listed at present. Sales and specialist project applications remain open."}</p>{vacancies.map(job => <div className="op-vacancy" key={job.id}><h3>{job.title}</h3>{job.description && <p>{job.description}</p>}</div>)}</>}
        {page === "talent" && <><h2>{category}</h2><p>{category === "Propose an Idea" ? "Introduce a problem, possibility or new approach and the value you believe it could create." : "Tell us what you do, where you could contribute and how you would like to collaborate."}</p><p>AI, intelligent agents, automation, sales and marketing are areas of interest—not limits. All relevant disciplines and ideas are welcome.</p></>}
        {page === "partnerships" && <><h2>{category}</h2><p>{category === "Business Collaboration" ? "Explore technology, delivery, referral, channel or strategic collaboration—or another way of working together." : category === "Regional or Branch" ? "Express interest in developing an ORAGROL presence in a Canadian region or another country." : category === "Technology Investment" ? "Tell us about your interest in investing in new technology or supporting its development and growth." : "Have a different opportunity in mind? Tell us what you would like to build together."}</p></>}
      </section>
      {!(page === "careers" && category === "Current Vacancies" && !vacancies.length) && <ApplicationForm key={category} page={page} category={category} vacancies={vacancies} privacyUrl={privacyUrl} enabled={submissionsEnabled && Boolean(onSubmit)} onSubmit={onSubmit} />}
      <div className="op-legal"><a href={privacyUrl}>Privacy Policy</a><a href={termsUrl}>Terms & Conditions</a></div>
    </div>
  </main>;
}

function ApplicationForm({ page, category, vacancies, privacyUrl, enabled, onSubmit }: {
  page: PageKind; category: string; vacancies: Vacancy[]; privacyUrl: string; enabled: boolean;
  onSubmit?: OpportunityPageProps["onSubmit"];
}) {
  const uid = useId();
  const [applyingAs, setApplyingAs] = useState("Individual");
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const career = page === "careers";
  const specialist = career && category === "Certified Specialists";
  const idea = page === "talent" && category === "Propose an Idea";
  const words = wordCount(description);
  const descriptionLabel = career ? "Relevant experience" : idea ? "Describe your idea and the value it could create" : page === "talent" ? "Your expertise and how you would like to contribute" : "Opportunity summary and what you would bring";

  function field(label: string, name: string, required = true, type = "text", autoComplete?: string) {
    return <label className="op-field" key={name}><span>{label}{!required && " (optional)"}</span><input name={name} type={type} required={required} autoComplete={autoComplete} maxLength={200} /></label>;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!enabled || !onSubmit || status === "pending") return;
    if (words > 300 || fileError || (career && !files.length)) {
      setStatus("error"); setMessage("Check the description and required PDF attachment before submitting."); return;
    }
    const form = event.currentTarget;
    const fields: Record<string, string> = {};
    new FormData(form).forEach((value, key) => { if (typeof value === "string") fields[key] = value.trim(); });
    setStatus("pending"); setMessage("");
    try {
      await onSubmit({ page, category, fields, files });
      setStatus("success"); setMessage("Your submission has been received. Thank you for your interest.");
      form.reset(); setDescription(""); setFiles([]); setApplyingAs("Individual");
    } catch {
      setStatus("error"); setMessage("We couldn’t complete your submission. Your details remain here so you can try again.");
    }
  }

  return <section className="op-form-panel" aria-labelledby={`${uid}-title`}>
    <h2 id={`${uid}-title`}>{career ? "Introduce yourself" : idea ? "Share your idea" : page === "talent" ? "Introduce your expertise" : "Start a conversation"}</h2>
    <p className="op-form-note">All fields are required unless marked optional.</p>
    <form onSubmit={submit} aria-busy={status === "pending"}>
      <div className="op-fields">
        {specialist && <label className="op-field"><span>Specialty</span><select name="specialty" required defaultValue=""><option value="" disabled>Select your specialty</option>{specialties.map(([title]) => <option key={title}>{title}</option>)}<option>Other relevant specialty</option></select></label>}
        {(specialist || page === "partnerships") && <label className="op-field"><span>Applying as</span><select name="applyingAs" value={applyingAs} onChange={event => setApplyingAs(event.target.value)}><option value="Individual">{specialist ? "Individual specialist" : "Individual"}</option><option value="Organization">{specialist ? "Firm / Team" : "Organization"}</option></select></label>}
        {applyingAs === "Organization" && field("Organization name", "organization")}
        {career && category === "Current Vacancies" && <label className="op-field"><span>Role</span><select name="role" defaultValue="" required><option value="" disabled>Select a role</option>{vacancies.map(job => <option key={job.id} value={job.id}>{job.title}</option>)}</select></label>}
        {field("Full name", "fullName", true, "text", "name")}
        {field("Email", "email", true, "email", "email")}
        {field("Country", "country", true, "text", "country-name")}
        {field("City", "city", true, "text", "address-level2")}
        <label className="op-field"><span>Phone country code</span><input name="phoneCountryCode" type="tel" autoComplete="tel-country-code" placeholder="+1" pattern="\+[1-9][0-9]{0,3}" title="Enter + followed by your country calling code, for example +1." maxLength={5} required /></label>
        {field("Phone number", "phone", true, "tel", "tel-national")}
        {specialist && field("Certifications or accreditation", "certifications")}
        {page === "talent" && field(idea ? "Idea title" : "Area of expertise", "subject")}
        {page === "talent" && field("Category / discipline (any area welcome)", "discipline")}
        {page === "partnerships" && category === "Regional or Branch" && field("Proposed country / region", "proposedRegion")}
        {page === "partnerships" && category === "Regional or Branch" && field("Local market experience", "marketExperience")}
        {page === "partnerships" && category === "Technology Investment" && field("Technology or opportunity of interest", "technology")}
        {page === "partnerships" && category === "Technology Investment" && field("Preferred involvement", "involvement")}
      </div>
      <label className="op-field op-description"><span>{descriptionLabel}</span><textarea name="description" rows={5} value={description} onChange={event => setDescription(event.target.value)} required maxLength={12000} aria-invalid={words > 300} aria-describedby={`${uid}-words`} /></label>
      <p className={`op-counter${words > 300 ? " op-error" : ""}`} id={`${uid}-words`}>{words} / 300 words{words > 300 ? " — shorten your response to continue" : " maximum"}</p>
      {idea && <p className="op-form-note">Please share a non-confidential overview at this stage.</p>}
      <label className="op-field"><span>{career ? "CV / professional profile and supporting document" : "Supporting documents (optional)"}</span>
        <input className="op-upload" name="documents" type="file" accept=".pdf,application/pdf" multiple required={career} aria-describedby={`${uid}-files`} aria-invalid={Boolean(fileError)} onChange={event => {
          const selected = Array.from(event.target.files || []);
          const error = selected.length > 2 ? "Choose no more than 2 PDFs." : selected.some(file => !/\.pdf$/i.test(file.name) || (file.type && file.type !== "application/pdf")) ? "Only PDF files are accepted." : selected.reduce((sum, file) => sum + file.size, 0) > MAX_BYTES ? "The combined file size must not exceed 8 MB." : selected.some(file => !file.size) ? "Empty files are not accepted." : "";
          event.target.setCustomValidity(error);
          setFileError(error); setFiles(error ? [] : selected);
        }} />
      </label>
      <p className="op-form-note" id={`${uid}-files`}>Maximum 2 PDFs · 8 MB combined{career ? " · At least one CV or professional profile is required." : "."}</p>
      {fileError && <p className="op-error" role="alert">{fileError}</p>}
      {files.length > 0 && <ul className="op-file-list">{files.map((file, i) => <li key={`${file.name}-${i}`}>{file.name} · {(file.size / 1024 / 1024).toFixed(2)} MB</li>)}</ul>}
      <p className="op-privacy">We use your information to review and respond to your {career ? "application" : "submission"}. <a href={privacyUrl}>Privacy Policy</a>.</p>
      {page !== "partnerships" && <label className="op-consent"><input type="checkbox" name="futureOpportunities" /><span>{career ? "Keep my application for future opportunities" : "Contact me about future relevant collaboration opportunities"}, as described in the Privacy Policy.</span></label>}
      {page === "partnerships" && <p className="op-form-note">Submitting an enquiry does not establish a partnership, branch appointment or investment agreement.</p>}
      {!enabled && <p className="op-hold" role="status">Online submissions are not open yet.</p>}
      <button className="op-submit" type="submit" disabled={!enabled || status === "pending" || words > 300 || Boolean(fileError) || (career && !files.length)}>{status === "pending" ? "Submitting…" : career ? "Submit Application" : page === "talent" ? "Send Introduction" : "Submit Enquiry"}</button>
      <p className={status === "error" ? "op-message op-error" : "op-message"} role="status" aria-live="polite">{message}</p>
    </form>
  </section>;
}

/*
 * Wordmark note: this project has no separate logo image asset — every real
 * page's header "logo" is this exact plain-text ORAGROL / GLOBAL pairing,
 * linked home (see app/company/page.tsx's `.wordmark` markup, and every
 * other redesigned page's own header). `.op-wordmark` below matches that
 * same site-wide treatment (700 weight, .13em tracking, small at .55em/7px)
 * rather than the guide's own placeholder styling, so the fallback used
 * here is the site's real wordmark, not an invented substitute — callers
 * can still pass a `logo` prop directly (see app/careers/page.tsx etc.,
 * which pass a real Link-wrapped wordmark identical to every other page).
 */
const styles = `
.op-page{min-height:100vh;background:#111315;color:#f2f2ee;font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;font-weight:400;font-stretch:normal;line-height:1.5;padding:40px 24px 28px;box-sizing:border-box}
.op-page *{box-sizing:border-box}.op-shell{max-width:1040px;margin:0 auto}.op-logo{max-width:210px;margin-bottom:64px}.op-logo img,.op-logo svg{max-width:100%;height:auto}.op-wordmark{display:flex;flex-direction:column;width:max-content;font-weight:700;letter-spacing:.13em;line-height:.9;font-size:19px}.op-wordmark>span{display:block;font-size:7px;letter-spacing:.55em;margin-top:8px;padding-left:3px}
.op-eyebrow{font-size:12px;letter-spacing:.14em;color:#b8b7b2;margin:0 0 15px}.op-hero h1{font-family:inherit;font-stretch:normal;font-size:clamp(34px,4.4vw,60px);font-weight:400;letter-spacing:-.035em;line-height:1.12;margin:0 0 20px;max-width:960px}.op-hero>p:last-child{font-size:18px;max-width:770px;color:#b8b7b2;margin:0}
.op-categories{display:flex;gap:26px;flex-wrap:wrap;margin:44px 0 26px;padding:0;border:0;border-bottom:1px solid #333}.op-categories label{position:relative;display:block;padding:14px 0;color:#b8b7b2;cursor:pointer;font-size:15px;border-bottom:2px solid transparent}.op-categories label.op-selected{color:#f2f2ee;border-bottom-color:#ef4d00}.op-categories input{position:absolute;opacity:0;width:1px;height:1px}.op-categories label:focus-within{outline:2px solid #b8b7b2;outline-offset:5px}
.op-context{margin-bottom:30px}.op-context h2{font-size:19px;font-weight:400;margin:0 0 6px}.op-context p{color:#b8b7b2;margin:6px 0;font-size:15px;max-width:850px}.op-specialties{list-style:none;padding:0;display:grid;grid-template-columns:1fr 1fr;gap:24px;margin:28px 0}.op-specialties li{font-size:16px}.op-specialties span{display:block;font-size:14px;color:#b8b7b2;margin-top:4px}.op-vacancy{margin-top:18px}.op-vacancy h3{font-weight:400;font-size:17px;margin:0}
.op-form-panel{background:#f2f2ee;color:#111315;border-radius:4px;padding:36px;max-width:100%;color-scheme:light}.op-form-panel h2{font-size:23px;font-weight:500;margin:0 0 10px}.op-fields{display:grid;grid-template-columns:1fr 1fr;gap:20px 24px;margin:23px 0}.op-field{display:block;min-width:0;font-size:14px}.op-field>span{display:block;margin-bottom:8px}.op-field input:not([type=file]),.op-field select,.op-field textarea{width:100%;min-width:0;border:1px solid #a5a5a0;border-radius:2px;background:transparent;color:#111315;font:inherit;font-size:16px;min-height:46px;padding:10px 12px}.op-field textarea{resize:vertical;line-height:1.6}.op-page :focus-visible{outline:2px solid #555;outline-offset:3px}.op-description{margin-top:10px}.op-counter{text-align:right;font-size:12px;color:#555;margin:5px 0 22px}.op-upload{display:block;width:100%;max-width:100%;font-size:14px;padding:15px;border:1px dashed #aaa;overflow-wrap:anywhere}.op-upload::file-selector-button{padding:9px 14px;background:transparent;border:1px solid #888;border-radius:2px;color:#111315;margin-right:12px;cursor:pointer}.op-form-note,.op-privacy{font-size:12px;line-height:1.6;color:#555;margin:10px 0}.op-file-list{font-size:12px;padding-left:20px;overflow-wrap:anywhere}.op-privacy{margin-top:22px}.op-privacy a{color:#111315;text-underline-offset:3px}.op-consent{display:flex;align-items:flex-start;gap:10px;font-size:12px;color:#555;margin:13px 0 20px}.op-consent input{margin-top:3px;accent-color:#111315;width:16px;height:16px;flex-shrink:0}.op-submit{width:100%;min-height:48px;background:#111315;color:#f2f2ee;border:1px solid #111315;border-radius:2px;font:inherit;font-size:15px;padding:12px 20px;cursor:pointer;margin-top:12px}.op-submit:hover:not(:disabled){background:#25282a}.op-submit:disabled{opacity:.5;cursor:not-allowed}.op-hold{font-size:13px;color:#555}.op-error{color:#9a2020;font-size:13px}.op-message{font-size:13px;margin-bottom:0}.op-legal{display:flex;justify-content:center;gap:28px;margin-top:30px;font-size:12px}.op-legal a{color:#b8b7b2;text-decoration:none}.op-legal a:hover{text-decoration:underline}.op-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
@media(max-width:600px){.op-page{padding:25px 18px}.op-logo{margin-bottom:40px}.op-hero>p:last-child{font-size:16px}.op-categories{gap:0 20px;margin-top:30px}.op-categories label{font-size:14px;min-height:48px}.op-specialties{grid-template-columns:1fr;gap:18px}.op-form-panel{padding:24px 18px}.op-fields{grid-template-columns:1fr;gap:18px}.op-legal{gap:20px}.op-upload{padding:12px 8px;font-size:12px}.op-form-panel h2{font-size:21px}}
`;
