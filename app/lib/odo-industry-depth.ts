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
      "Where clinics really get hurt: shared front-desk logins; ex-staff who still have access; patient records or images sent by plain email; an on-site server with no off-site backup (ransomware); look-alike emails to patients; a 'tech-savvy' staff member acting as IT with no plan.",
      "Sharp question themes: is the patient system cloud or a local server, and when were backups last restored? does each person have their own login with MFA? how are records sent to other providers or insurers? who removes access when someone leaves? has the clinic ever had to tell patients about a privacy incident?",
    ].join("\n"),
  },
  {
    id: "law",
    label: "Law firm / legal practice",
    match: /\blaw\b|lawyer|legal|attorney|barrister|solicitor|paralegal|notar/i,
    guidance: [
      "Rules: lawyers owe strict duties of confidentiality and solicitor-client privilege, and their law society expects reasonable technological competence when handling client information. Trust-account money is a prime fraud target.",
      "Systems worth knowing about: practice-management / document-management system, trust accounting, e-signature, client portals or file-sharing, email (where most matters actually live).",
      "Where firms really get hurt: payment-redirection fraud (spoofed 'updated wire instructions', especially real-estate closings); compromised email used to impersonate the firm; files shared through personal accounts; laptops without encryption; staff working from home on shared devices.",
      "Sharp question themes: how does the firm confirm changed payment instructions before money moves? is email protected with MFA, and could someone spoof the firm's domain? where do client files live and who can open them? what happens to access when a lawyer or assistant leaves? does the firm hold cyber insurance, and does it know what the policy requires?",
    ].join("\n"),
  },
  {
    id: "accounting",
    label: "Accounting, bookkeeping or tax practice",
    match: /accounting|accountant|bookkeep|\btax\b|\bcpa\b|payroll/i,
    guidance: [
      "Rules: firms handle SINs, bank details and full financial records, so privacy-law obligations (PIPEDA or provincial) are heavy; their professional body expects client information to be safeguarded. Government online-services access (e.g. representative access to client tax accounts) is a high-value target.",
      "Systems worth knowing about: tax software, the clients' accounting platforms the firm logs into, client document portals, payroll systems, email.",
      "Where firms really get hurt: tax-season phishing and fake 'client' attachments; shared logins into client accounting platforms; documents exchanged by plain email; staff reusing passwords; a breach of the firm's account giving access to many clients at once.",
      "Sharp question themes: how do clients send documents (portal, email, paper)? does each staff member have their own login with MFA to client accounting platforms and government portals? how many client accounts can one person reach? what is the plan if a staff email account is taken over in March? has any client asked them a security question or questionnaire?",
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
