// ORAGROL ODO — Industry depth (Master Reference §37.8)
//
// "Depth over breadth": for a few industries ODO should sound like a
// specialist — knowing the systems they run, the rules they answer to, and
// where businesses like them actually get hurt — so its questions are
// sharper than a generic security checklist.
//
// WHICH industries is still Mohammad's open decision (§37.14 #7). These are
// the three candidates discussed (clinics, law firms, accounting). Adding,
// removing or swapping one is an edit to INDUSTRY_PACKS only — nothing else
// changes. Businesses outside these packs get the normal general interview.
//
// Each pack covers all five areas of ODO's split (Mohammad, 2026-10-03:
// IT 35 / Marketing 25 / Sales 15 / Finance 15 / Customer service 10) — not
// only where these businesses get breached, but where they lose patients,
// clients, time and money.
//
// This is QUESTION GUIDANCE for the interviewer, never facts about the
// visitor's business: the playbook's rules still apply (no invented facts,
// evidence only from answers and research).

export type IndustryPack = {
  id: string;
  label: string;
  match: RegExp;
  guidance: string;
};

export const INDUSTRY_PACKS: IndustryPack[] = [
  {
    id: "clinic",
    label: "Health clinic (dental, medical, physio, chiro, optometry, mental health)",
    match: /dental|dentist|orthodont|medical|clinic|physio|chiropract|optometr|optician|massage therap|naturopath|psycholog|counsell?ing|health ?care|pharmac/i,
    guidance: [
      "Rules: in Ontario, clinics are typically health information custodians under PHIPA (elsewhere in Canada, the provincial health-privacy act or PIPEDA). Privacy breaches involving patient information carry notification duties to patients and, in many cases, the regulator.",
      "Systems worth knowing about: a practice-management / EMR system (cloud, or a server in the back office), online booking, insurance-claim submission, imaging (x-rays, scans), email and fax for referrals.",
      "IT & cybersecurity — where clinics really get hurt: shared front-desk logins; ex-staff who still have access; patient records or images sent by plain email; an on-site server with no off-site backup (ransomware); look-alike emails to patients; a 'tech-savvy' staff member acting as IT with no plan.",
      "IT questions: is the patient system cloud or a local server, and when were backups last restored? does each person have their own login with MFA? how are records sent to other providers or insurers? who removes access when someone leaves?",
      "Marketing — where clinics lose patients: they rarely know which channel brings new patients; Google reviews drive new-patient choice but are rarely asked for or answered; lapsed patients (no visit in 12–18 months) are never brought back; recall/reminder messages are sent by hand or not at all.",
      "Sales — new-patient enquiries and treatment plans: how fast a web or phone enquiry is answered decides whether the patient books; accepted-vs-declined treatment plans are rarely followed up.",
      "Finance & admin: insurance claims and patient balances chased by hand; the same patient and billing data typed into booking, practice-management and accounting systems; month-end numbers known late.",
      "Customer service: the phone is the bottleneck — missed calls at lunch and after hours are lost bookings; the same questions (hours, parking, insurance, prep instructions) are answered all day; no-shows and late cancellations with no automated reminders.",
    ].join("\n"),
  },
  {
    id: "law",
    label: "Law firm / legal practice",
    match: /\blaw\b|lawyer|legal|attorney|barrister|solicitor|paralegal|notar/i,
    guidance: [
      "Rules: lawyers owe strict duties of confidentiality and solicitor-client privilege, and their law society expects reasonable technological competence when handling client information. Trust-account money is a prime fraud target.",
      "Systems worth knowing about: practice-management / document-management system, trust accounting, e-signature, client portals or file-sharing, email (where most matters actually live).",
      "IT & cybersecurity — where firms really get hurt: payment-redirection fraud (spoofed 'updated wire instructions', especially real-estate closings); compromised email used to impersonate the firm; files shared through personal accounts; laptops without encryption; staff working from home on shared devices.",
      "IT questions: how does the firm confirm changed payment instructions before money moves? is email protected with MFA? where do client files live and who can open them? what happens to access when a lawyer or assistant leaves? does the firm hold cyber insurance, and does it know what the policy requires?",
      "Marketing — where firms lose clients: most work comes from referrals, which nobody tracks or thanks systematically; past clients are never re-contacted for the next matter (wills, real estate, corporate renewals); the website takes enquiries but nobody knows which pages or searches bring them.",
      "Sales — intake: how fast a new enquiry gets a callback decides who gets hired; conflict checks and engagement letters done by hand slow intake; consultations that don't convert are never followed up.",
      "Finance & admin: time capture and billing by hand (unbilled hours are the classic leak); slow collections; the same matter data typed into several systems; trust reconciliation done manually.",
      "Customer service: clients chase updates by phone and email because there's no status visibility; the same procedural questions answered repeatedly; after-hours enquiries wait until morning.",
    ].join("\n"),
  },
  {
    id: "accounting",
    label: "Accounting, bookkeeping or tax practice",
    match: /accounting|accountant|bookkeep|\btax\b|\bcpa\b|payroll/i,
    guidance: [
      "Rules: firms handle SINs, bank details and full financial records, so privacy-law obligations (PIPEDA or provincial) are heavy; their professional body expects client information to be safeguarded. Government online-services access (e.g. representative access to client tax accounts) is a high-value target.",
      "Systems worth knowing about: tax software, the clients' accounting platforms the firm logs into, client document portals, payroll systems, email.",
      "IT & cybersecurity — where firms really get hurt: tax-season phishing and fake 'client' attachments; shared logins into client accounting platforms; documents exchanged by plain email; staff reusing passwords; a breach of the firm's account giving access to many clients at once.",
      "IT questions: how do clients send documents (portal, email, paper)? does each staff member have their own login with MFA to client accounting platforms and government portals? what is the plan if a staff email account is taken over in March? has any client asked them a security questionnaire?",
      "Marketing — where firms lose growth: almost all new clients are referrals and nobody asks for them systematically; existing clients are rarely offered the firm's other services (bookkeeping clients who'd buy tax planning, and the reverse); no off-season marketing at all.",
      "Sales — onboarding: engagement letters, ID checks and document requests done by hand; prospects who ask for a quote and go quiet are never followed up.",
      "Finance & admin (their own firm): chasing clients for missing documents eats tax season; their own invoicing and collections lag because client work comes first; the same client data rekeyed between tax, bookkeeping and practice-management tools.",
      "Customer service: 'did you get my documents?' and 'where's my return?' calls all season; no status updates; deadlines communicated by hand.",
    ].join("\n"),
  },
];

/** The pack that fits this business, if any — industry label first, then what the site says they sell. */
export function industryPackFor(industry: string | null, whatTheySell?: string | null): IndustryPack | null {
  for (const text of [industry, whatTheySell]) {
    if (!text) continue;
    const pack = INDUSTRY_PACKS.find((p) => p.match.test(text));
    if (pack) return pack;
  }
  return null;
}
