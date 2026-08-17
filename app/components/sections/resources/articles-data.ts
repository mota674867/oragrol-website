/**
 * Resources — article content, copied verbatim from
 * ORAGROL_RESOURCES_ALL_ARTICLES_FINAL.md (the single source file for all
 * 6 articles). Every `text`/`items` string below is transcribed exactly
 * as written in the source — no rewording, embellishment, or added
 * claims, per that file's own "Content Rules" and this project's Honesty
 * Rule (CLAUDE.md §8). Verified byte-for-byte via a Node diff script
 * (see DECISIONS.md D-052) before this page shipped, the same discipline
 * used for Industries (D-044) and Contact (D-046).
 *
 * CTA text/hrefs come from the source file's own "Article-to-Oragrol
 * Mapping" table. "Get Your Cyber Health Score" links to `/cyber-health`
 * — the same internal-page target every other "Get Your Cyber Health
 * Score" CTA site-wide uses (FinalCta, etc.), not the external Tally URL
 * directly (that's reserved for the Cyber Health page's own CTAs). Every
 * other CTA in the mapping table is a "talk to us" variant with no other
 * real destination anywhere in the project, so all route to `/contact`,
 * matching the site-wide "Talk to Oragrol" convention (Services,
 * Industries).
 */

export type ContentBlock =
  | { kind: "h2"; text: string }
  | { kind: "h3"; text: string }
  | { kind: "p"; text: string }
  | { kind: "ul"; items: string[] };

export type ContentType = "Article" | "Guide";
export type Industry = "General SMB" | "Professional Services";

export interface ResourceArticle {
  slug: string;
  title: string;
  contentType: ContentType;
  topic: string;
  industry: Industry;
  seoTitle: string;
  seoDescription: string;
  summary: string;
  featured: boolean;
  body: ContentBlock[];
  oneNextAction: string;
  ctaText: string;
  ctaHref: string;
}

export const AUTHOR = "Oragrol Global";
/** ISO date; formatted for display where rendered. */
export const PUBLISHED_DATE = "2026-08-17";

export const ARTICLES: ResourceArticle[] = [
  {
    slug: "what-is-a-cyber-health-score",
    title: "What Is a Cyber Health Score?",
    contentType: "Article",
    topic: "Cyber Health / Getting Started",
    industry: "General SMB",
    seoTitle: "What Is a Cyber Health Score? | Oragrol Global",
    seoDescription:
      "A plain-language breakdown of how Oragrol's Cyber Health Score works, what the number actually measures, and why it matters more than a pass or fail grade.",
    summary:
      "A plain-language breakdown of how Oragrol's Cyber Health Score works, what the number actually measures, and why it matters more than a pass or fail grade.",
    featured: true,
    oneNextAction: "Get your own Cyber Health Score and see exactly where your business stands.",
    ctaText: "Get Your Cyber Health Score",
    ctaHref: "/cyber-health",
    body: [
      {
        kind: "p",
        text: `Most business owners have never had a clear answer to a simple question: how secure is my business, really? Not in vague terms like "pretty good" or "we have antivirus," but an actual number they can point to, track over time, and act on.`,
      },
      { kind: "p", text: "That's what the Cyber Health Score is built to do." },
      { kind: "h2", text: "What the score measures" },
      {
        kind: "p",
        text: "The Cyber Health Score is a number from 0 to 100, calculated from a plain-language assessment covering 20 categories of business security. These aren't abstract IT concepts. They're things like whether employees use multi-factor authentication, whether backups have actually been tested (not just scheduled), whether an old employee's access gets removed when they leave, and whether anyone would know who to call if something looked wrong.",
      },
      {
        kind: "p",
        text: "Each category carries a different weight, because not every risk matters equally. A business with weak multi-factor authentication is exposed to a different level of risk than one without a formal cybersecurity insurance policy. The scoring model reflects that. Categories tied to the most common ways Canadian small and medium businesses actually get breached, like phishing, credential theft, and unpatched systems, carry more weight than lower-impact categories.",
      },
      { kind: "h2", text: "How the number is calculated" },
      {
        kind: "p",
        text: `Every question in the assessment has three possible answers: Yes, No, or Not Sure. A "Yes" always represents the more secure practice. Each answer earns points, those points are totaled per category, and each category's result is combined into a single weighted score.`,
      },
      { kind: "p", text: "The result is a score between 0 and 100, which falls into one of four risk tiers:" },
      {
        kind: "ul",
        items: ["**0–39: Critical**", "**40–59: High**", "**60–79: Medium**", "**80–100: Low**"],
      },
      {
        kind: "p",
        text: "A lower score doesn't mean a business is careless. Most businesses land somewhere in the middle. It usually means there are a handful of specific, fixable gaps that haven't been addressed yet, often because nobody had a clear picture of where to start.",
      },
      { kind: "h2", text: "Why a single number is useful" },
      {
        kind: "p",
        text: "Cybersecurity advice is often either too technical to act on or too generic to matter. A Cyber Health Score gives a business a starting point that's specific to them: what's already working, what the biggest gaps are, and what to prioritize first.",
      },
      {
        kind: "p",
        text: "It's also something a business can track. Improving a Cyber Health Score from a 45 to a 75 over six months is a concrete way to see that security work is actually paying off, not just a recurring invoice.",
      },
      { kind: "h2", text: "What happens after the score" },
      {
        kind: "p",
        text: "Once the assessment is complete, the result includes more than just the number. A short summary explains the most significant risks found, a handful of practical recommendations are prioritized by impact, and the business receives a full report by email.",
      },
      {
        kind: "p",
        text: "From there, the next step depends on the risk tier. Higher-risk results are followed up quickly, since those gaps tend to be the ones that turn into real incidents. Lower-risk results are a good sign, but rarely mean there's nothing left to improve.",
      },
      {
        kind: "p",
        text: "The goal isn't to hand a business a grade and walk away. It's to give them a clear, honest starting point, and a practical path forward from wherever they currently stand.",
      },
    ],
  },
  {
    slug: "mfa-one-control-stops-most-breaches",
    title: "MFA: The One Control That Stops Most Breaches",
    contentType: "Article",
    topic: "Identity & Access",
    industry: "General SMB",
    seoTitle: "MFA for Canadian Small Businesses: What to Protect First",
    seoDescription:
      "MFA is one of the most important security controls for Canadian SMBs. Learn where to enforce it first, which methods are stronger, and what MFA cannot protect against.",
    summary:
      "A stolen password should not be enough to walk into your business. Here is how Canadian SMBs should prioritize MFA, choose stronger authentication methods, and avoid common implementation mistakes.",
    featured: false,
    oneNextAction:
      "Check your five highest-value business accounts today and confirm that MFA is enforced, not merely available.",
    ctaText: "Talk to Oragrol About Your Security Controls",
    ctaHref: "/contact",
    body: [
      {
        kind: "p",
        text: "Imagine an employee receives an email that looks like it came from a familiar service. They follow the link, enter their username and password, and move on with their day.",
      },
      { kind: "p", text: "The password is now in someone else's hands." },
      {
        kind: "p",
        text: "If that account has no second authentication factor, the attacker may have everything needed to sign in. MFA changes that equation by requiring another proof of identity.",
      },
      { kind: "p", text: "That is why MFA deserves to be treated as a priority control, not a checkbox at the bottom of an IT list." },
      { kind: "h2", text: "Start with the accounts that matter most" },
      {
        kind: "p",
        text: `For a small business, "enable MFA everywhere" can sound simple until someone has to implement it across Microsoft 365, Google Workspace, banking portals, cloud applications, VPNs, administrator accounts, and other services.`,
      },
      { kind: "p", text: "The better starting point is risk." },
      {
        kind: "p",
        text: "Oragrol's Cyber Health Assessment treats **Multi-Factor Authentication**, **Passwords & Login Security**, and **Access Control & Permissions** as separate assessment areas because authentication is only one part of the identity picture.",
      },
      { kind: "p", text: "Start with accounts that can cause the most damage if compromised:" },
      {
        kind: "ul",
        items: [
          "administrator accounts",
          "business email",
          "remote access",
          "cloud platforms containing sensitive information",
          "financial and payment-related accounts",
          "systems containing customer or employee information",
        ],
      },
      {
        kind: "p",
        text: "The Canadian Centre for Cyber Security recommends prioritizing high-value accounts, including administrative and senior-management email accounts, when rolling out MFA. It also recommends considering MFA for all users, systems, applications, and endpoints where appropriate. [Source: Canadian Centre for Cyber Security, ITSAP.00.105]",
      },
      { kind: "h2", text: "Not all MFA is equally strong" },
      { kind: "p", text: "MFA is an additional layer, but the method matters." },
      {
        kind: "p",
        text: "The Canadian Cyber Centre recommends stronger authentication methods such as authenticator applications and hardware-based, FIDO-compatible solutions. It cautions that SMS is less secure and should generally be limited to lower-risk situations. [Source: Canadian Centre for Cyber Security, ITSAP.00.105]",
      },
      { kind: "p", text: "For an SMB, the practical progression is:" },
      { kind: "p", text: "**First:** turn on MFA for important accounts." },
      {
        kind: "p",
        text: "**Then:** move higher-risk users and systems toward stronger, phishing-resistant authentication where supported.",
      },
      {
        kind: "p",
        text: "**Finally:** make the policy consistent rather than leaving MFA as an optional setting that employees can quietly ignore.",
      },
      { kind: "h2", text: "MFA does not replace good access control" },
      { kind: "p", text: "A business can have MFA enabled and still have poor identity security." },
      {
        kind: "p",
        text: "Consider a former employee whose account remains active. MFA may still be protecting that account, but the business should not have left the account available in the first place.",
      },
      { kind: "p", text: "That is why Oragrol's assessment also looks at **Access Control & Permissions**." },
      { kind: "p", text: "A practical identity review should ask:" },
      {
        kind: "ul",
        items: [
          "Are unique credentials used?",
          "Is MFA enforced?",
          "Are administrator privileges limited?",
          "Are former employees removed promptly?",
          "Are shared accounts avoided?",
          "Are sensitive systems protected by stronger authentication?",
          "Are access permissions reviewed when roles change?",
        ],
      },
      { kind: "p", text: "MFA is a barrier. It is not a complete identity strategy." },
      { kind: "h2", text: "The MFA mistake that costs organizations trust" },
      { kind: "p", text: "One common mistake is treating deployment as a technology-only project." },
      {
        kind: "p",
        text: "The Cyber Centre specifically recommends preparing users, explaining why MFA is being introduced, training them to recognize MFA fatigue or push-bombing, and providing a way to report suspicious authentication prompts. [Source: Canadian Centre for Cyber Security, ITSAP.00.105]",
      },
      { kind: "p", text: "That matters because employees are part of the control." },
      {
        kind: "p",
        text: "If someone receives repeated unexpected MFA prompts, the correct response is not to approve one just to make the notifications stop. The correct response is to report it.",
      },
      { kind: "h2", text: "Where Oragrol looks at MFA" },
      { kind: "p", text: "In the Cyber Health Assessment, MFA is not viewed in isolation. It sits alongside:" },
      {
        kind: "ul",
        items: [
          "Passwords & Login Security",
          "Access Control & Permissions",
          "Email Security",
          "Remote Work & Personal Devices",
          "Cloud Platform Security",
          "Employee Security Awareness & Training",
          "Incident Response & Reporting",
        ],
      },
      {
        kind: "p",
        text: `That gives a business a more useful question than "Do we have MFA?" The better question is: **Where would a stolen credential still give an attacker too much access?**`,
      },
    ],
  },
  {
    slug: "ransomware-recovery-canadian-smbs",
    title: "Ransomware Recovery: What Canadian SMBs Get Wrong",
    contentType: "Article",
    topic: "Ransomware / Business Continuity",
    industry: "General SMB",
    seoTitle: "Ransomware Recovery for Canadian SMBs: What Businesses Get Wrong",
    seoDescription:
      "Ransomware recovery is more than having backups. Learn what Canadian SMBs should test, protect, and prepare before an incident.",
    summary:
      "A backup that has never been restored is a hope, not a recovery plan. Here are the recovery gaps Canadian SMBs should address before ransomware turns an IT problem into a business interruption.",
    featured: false,
    oneNextAction: "Choose one business-critical system and perform a documented restore test this month.",
    ctaText: "Prepare Your Business for a Security Incident",
    ctaHref: "/contact",
    body: [
      { kind: "p", text: "It is 9:15 on Monday morning." },
      {
        kind: "p",
        text: "Employees cannot open shared files. A few computers display the same message. The server is unavailable. Someone says the backup system is running, so the business should be fine.",
      },
      { kind: "p", text: "Then someone asks the question nobody has tested: **Can we actually restore the business?**" },
      { kind: "p", text: "That is where ransomware recovery becomes different from backup." },
      { kind: "h2", text: "Having a backup is not the same as being able to recover" },
      {
        kind: "p",
        text: "Canadian Centre for Cyber Security guidance recommends regular backups, secure storage, offline copies, and regular testing of backup and restoration processes. Its ransomware playbook specifically recommends multiple copies stored offline and testing restore procedures regularly. [Source: Canadian Centre for Cyber Security, Ransomware Playbook]",
      },
      { kind: "p", text: "A backup can exist and still fail as a recovery mechanism because:" },
      {
        kind: "ul",
        items: [
          "it is incomplete",
          "it is too old",
          "it is inaccessible",
          "credentials required to access it are compromised",
          "the backup system is connected to the same environment as the attack",
          "nobody has tested the restoration process",
          "the organization does not know which systems must be restored first",
        ],
      },
      { kind: "p", text: "Recovery begins before the incident." },
      { kind: "h2", text: "The first mistake: protecting data but not recovery" },
      {
        kind: "p",
        text: "A business owner may know where documents are stored but not how the company would operate if those documents disappeared tomorrow.",
      },
      { kind: "p", text: "A useful recovery conversation starts with business operations: **What must be restored first?**" },
      {
        kind: "p",
        text: "For a professional services firm, that might include email, client files, accounting systems, identity services, critical applications, and shared storage. For another business, the priority could be completely different.",
      },
      {
        kind: "p",
        text: "This is why backup strategy should follow business requirements rather than a generic schedule. The Canadian Cyber Centre's baseline controls recommend determining which information is essential to the organization, how frequently it changes, and how quickly it needs to be restored. [Source: Canadian Centre for Cyber Security, Baseline Cyber Security Controls]",
      },
      { kind: "h2", text: "The second mistake: never testing the restore" },
      { kind: "p", text: "This is one of the simplest tests in cybersecurity and one of the easiest to postpone." },
      {
        kind: "p",
        text: "A business may receive successful backup notifications every day and still have no evidence that a complete restoration works.",
      },
      {
        kind: "p",
        text: "The test does not have to begin with a disaster simulation. Start with one important system. Restore a known file or system into a controlled environment. Document how long it took, what failed, who performed the recovery, which credentials were needed, and whether the restored information was usable. Then improve the process.",
      },
      { kind: "p", text: `Testing turns "we have backups" into evidence that recovery is possible.` },
      { kind: "h2", text: "The third mistake: forgetting that attackers may target the backups" },
      { kind: "p", text: "Modern ransomware operations can attempt to disrupt recovery as well as encrypt production systems." },
      {
        kind: "p",
        text: "The Canadian Cyber Centre recommends multiple backup copies, including offline copies, and regular testing. [Source: Canadian Centre for Cyber Security, Ransomware Playbook]",
      },
      {
        kind: "p",
        text: "The principle is straightforward: the same compromised environment should not be the only place your recovery plan lives. Backups need their own protection, access controls, and recovery procedures.",
      },
      { kind: "h2", text: "Recovery also depends on identity" },
      {
        kind: "p",
        text: "Ransomware is not only a file-encryption problem. If an attacker compromises administrative credentials, they may be able to affect systems, disable security controls, or interfere with recovery.",
      },
      {
        kind: "p",
        text: "That connects ransomware readiness directly to the areas Oragrol assesses: MFA, Passwords & Login Security, Access Control & Permissions, Device & Endpoint Protection, Software & System Updates, Data Backup & Recovery, Incident Response & Reporting, and Employee Security Awareness & Training.",
      },
      { kind: "p", text: "A resilient recovery plan therefore starts long before the first encrypted file appears." },
      { kind: "h2", text: "The fourth mistake: having no decision structure" },
      { kind: "p", text: "During an incident, people need to know who is responsible for what." },
      {
        kind: "p",
        text: "The Canadian Cyber Centre recommends incident response planning so organizations can respond quickly, restore critical systems and data, and reduce interruptions and data loss. [Source: Canadian Centre for Cyber Security, ITSAP.10.035]",
      },
      {
        kind: "p",
        text: "At minimum, an SMB should know who coordinates the response, who contacts the IT/security provider, who can isolate systems, who communicates with leadership, and who decides when systems are safe to restore.",
      },
      { kind: "p", text: "The exact structure depends on the business. The important part is that it exists before the crisis." },
      { kind: "h2", text: "Recovery is a business capability" },
      {
        kind: "p",
        text: `Ransomware recovery should not be measured by whether a backup product reports "success." The more useful question is: **Can the business restore the systems it needs, in the order it needs them, using a process people have actually tested?**`,
      },
      {
        kind: "p",
        text: "That is why Oragrol treats **Data Backup & Recovery** and **Incident Response & Reporting** as separate assessment categories. One addresses the ability to restore. The other addresses the ability to respond. You need both.",
      },
    ],
  },
  {
    slug: "email-security-basics-small-business",
    title: "Email Security Basics for Small Business",
    contentType: "Article",
    topic: "Email Security",
    industry: "General SMB",
    seoTitle: "Email Security for Small Businesses: A Practical Canadian Guide",
    seoDescription:
      "Email remains a critical business system and a common path to phishing and impersonation. Learn the practical email security controls Canadian SMBs should review.",
    summary:
      "Email is where business communication, identity, payments, customer information, and sensitive documents often meet. A practical email security program protects both the mailbox and the people using it.",
    featured: false,
    oneNextAction:
      "Verify that your business domain has SPF, DKIM, and DMARC configured correctly, then review MFA on every critical mailbox.",
    ctaText: "Review Your Business's Security Posture",
    ctaHref: "/contact",
    body: [
      { kind: "p", text: "A supplier emails your accounts team with a new bank account." },
      { kind: "p", text: "The message looks normal. The sender name is familiar. The invoice is real. The only problem is that the bank account is not." },
      {
        kind: "p",
        text: "Email security is not just about blocking obvious spam. For a modern small business, email sits at the intersection of identity, finance, data, and daily operations. That makes it worth treating as a business system, not merely an inbox.",
      },
      { kind: "h2", text: "Start with the account" },
      { kind: "p", text: "The first layer is the mailbox itself." },
      {
        kind: "p",
        text: "If an attacker takes control of a business email account, they may gain access to conversations, documents, contacts, calendars, and information that can be used to impersonate the employee.",
      },
      {
        kind: "p",
        text: "Oragrol therefore separates **Email Security** from **Multi-Factor Authentication**, **Passwords & Login Security**, and **Access Control & Permissions** in its Cyber Health Assessment. They overlap, but they are not the same problem.",
      },
      {
        kind: "p",
        text: "A practical review should confirm MFA is enabled for important email accounts, passwords are unique, former-user accounts are disabled, administrative access is restricted, suspicious sign-in activity can be identified, and employees know how to report suspicious messages.",
      },
      { kind: "h2", text: "Then protect the domain" },
      { kind: "p", text: "Email security also involves the domain that sends your messages." },
      {
        kind: "p",
        text: "The Canadian Centre for Cyber Security's email-security guidance explains the role of SPF, DKIM, and DMARC in authenticating email and reducing spoofing and impersonation. [Source: Canadian Centre for Cyber Security, Email Security Best Practices]",
      },
      {
        kind: "p",
        text: "In simple terms: **SPF** helps receiving systems check whether a sending server is authorized to send mail for a domain. **DKIM** helps verify the integrity and authenticity of messages associated with a domain. **DMARC** builds on SPF and DKIM and lets a domain owner publish a policy for handling messages that fail authentication checks.",
      },
      { kind: "p", text: "These controls do not replace employee awareness or account security. They strengthen the domain's ability to defend against impersonation." },
      { kind: "h2", text: "The email problem is also a payment problem" },
      {
        kind: "p",
        text: "Consider a small professional-services firm. An attacker gains access to a mailbox and watches a conversation about a client payment. Instead of sending a random phishing message, the attacker waits for the right moment and changes the payment instructions.",
      },
      {
        kind: "p",
        text: `This is why email security belongs in a business-risk conversation. The question is not simply "Do we have spam filtering?" It is "What could someone do if they controlled this mailbox?" That question changes the priority.`,
      },
      { kind: "h2", text: "Teach employees what verification looks like" },
      { kind: "p", text: "Technical controls matter, but people still make decisions." },
      {
        kind: "p",
        text: "The Canadian Cyber Centre recommends training employees to identify malicious emails and links, while NIST's current small-business guidance also emphasizes phishing awareness and verification of suspicious requests. [Sources: Canadian Centre for Cyber Security; NIST Small Business Cybersecurity]",
      },
      {
        kind: "p",
        text: "The most useful training is specific. If an email requests a payment change, sensitive information, a password reset, an urgent login, or a new vendor bank account, do not verify the request using the contact information contained in the message. Use a known phone number, an established contact, or another trusted communication channel.",
      },
      { kind: "p", text: "That small procedural change can matter more than another hour of generic security awareness slides." },
      { kind: "h2", text: "AI makes suspicious messages harder to dismiss" },
      { kind: "p", text: "Poor spelling used to be an easy warning sign. It is not enough anymore." },
      {
        kind: "p",
        text: "Modern phishing messages can be polished, personalized, and written to resemble legitimate business communication. NIST's current small-business phishing guidance specifically notes that AI can be used to create increasingly convincing phishing attempts. [Source: NIST Small Business Cybersecurity, Phishing]",
      },
      {
        kind: "p",
        text: "That means training should focus less on \"spot the typo\" and more on: **What is this message asking me to do?** Urgency, payment changes, requests for credentials, unexpected attachments, and unusual instructions deserve verification even when the message looks professional.",
      },
      { kind: "h2", text: "Email security is a system, not a product" },
      {
        kind: "p",
        text: "A mature email-security posture combines identity protection, MFA, strong authentication, email filtering, SPF/DKIM/DMARC, employee awareness, access controls, incident reporting, and response procedures.",
      },
      {
        kind: "p",
        text: "These map directly to several areas of Oragrol's Cyber Health Assessment, which is useful because it gives an SMB a way to see email risk as part of the wider security posture rather than as one isolated software purchase.",
      },
    ],
  },
  {
    slug: "cybersecurity-professional-services-firms",
    title: "Cybersecurity for Professional Services Firms: A Practical Guide",
    contentType: "Guide",
    topic: "SMB Security / Industry",
    industry: "Professional Services",
    seoTitle: "Cybersecurity for Professional Services Firms in Canada",
    seoDescription:
      "A practical cybersecurity guide for Canadian professional services firms covering identity, email, client data, vendors, backups, and incident readiness.",
    summary:
      "Professional services firms often protect information that belongs to other people. That makes cybersecurity part of client trust, business continuity, and operational discipline, not simply an IT responsibility.",
    featured: false,
    oneNextAction:
      "Create a one-page inventory of your firm's critical systems, sensitive client information, and third-party providers, and identify who is responsible for each.",
    ctaText: "Get Your Cyber Health Score",
    ctaHref: "/cyber-health",
    body: [
      { kind: "p", text: "A professional services firm can run most of its business without owning a large data centre." },
      {
        kind: "p",
        text: "Its real infrastructure may be much simpler: a Microsoft 365 or Google Workspace account, a few laptops, cloud accounting or practice-management software, client documents, a website, several external vendors, and a small team with access to all of it.",
      },
      {
        kind: "p",
        text: "That simplicity can be misleading. For a consulting firm, accounting practice, legal practice, agency, engineering company, or similar professional business, the most valuable assets may be the information entrusted to it by clients. Cybersecurity therefore becomes part of the firm's ability to deliver its service and maintain trust.",
      },
      { kind: "h2", text: "1. Protect the identity layer first" },
      { kind: "p", text: "Professional services firms often rely heavily on cloud applications. That makes identity one of the first places to look." },
      {
        kind: "p",
        text: "Start with unique passwords, MFA, limited administrator privileges, prompt removal of former employees, regular access reviews, and controlled access to sensitive systems.",
      },
      {
        kind: "p",
        text: "Oragrol's Cyber Health Assessment separates **Passwords & Login Security**, **MFA**, and **Access Control & Permissions** because each answers a different question. A good identity posture asks not only whether people can sign in securely, but whether they can access only what they actually need.",
      },
      { kind: "h2", text: "2. Treat client information as a security responsibility" },
      {
        kind: "p",
        text: "A professional services firm may hold financial records, contracts, identification information, employee information, business plans, intellectual property, and confidential correspondence.",
      },
      {
        kind: "p",
        text: "The Office of the Privacy Commissioner of Canada states that organizations subject to PIPEDA must use safeguards appropriate to the sensitivity of personal information and protect it against loss, theft, and unauthorized access, disclosure, copying, use, or modification. [Source: Office of the Privacy Commissioner of Canada]",
      },
      { kind: "p", text: "That does not mean every firm needs the same technology stack. It means the security approach should reflect the information being handled." },
      { kind: "h2", text: "3. Email deserves special attention" },
      {
        kind: "p",
        text: "Client work often moves through email, creating risks including phishing, account compromise, impersonation, malicious attachments, unauthorized forwarding, payment fraud, and exposure of sensitive conversations.",
      },
      {
        kind: "p",
        text: "Review MFA, email filtering, SPF/DKIM/DMARC, access permissions, employee awareness, and payment verification procedures. The Canadian Cyber Centre's email-security guidance provides specific technical guidance on SPF, DKIM, and DMARC. [Source: Canadian Centre for Cyber Security]",
      },
      { kind: "h2", text: "4. Your vendors are part of your security environment" },
      {
        kind: "p",
        text: "A professional services business may depend on cloud storage, accounting platforms, payroll systems, CRM software, legal platforms, marketing systems, IT providers, and other vendors.",
      },
      {
        kind: "p",
        text: "That does not mean every vendor needs a six-month security audit. It does mean the business should know which vendors have access to important information or systems, and what happens if that vendor is compromised.",
      },
      {
        kind: "p",
        text: "This is why **Vendor & Third-Party Risk** is one of Oragrol's assessment categories. The first step is visibility: create a practical list of important providers and record what information they access, what systems they connect to, who owns the relationship internally, what security controls they provide, and what happens when the relationship ends.",
      },
      { kind: "h2", text: "5. Backups should be tested, not assumed" },
      {
        kind: "p",
        text: "A professional services firm may believe its documents are safe because they are stored in the cloud. Cloud storage is not automatically the same thing as a complete business-recovery strategy.",
      },
      {
        kind: "p",
        text: "The Canadian Cyber Centre recommends backing up essential business information, protecting backups, and regularly verifying that backup and restore mechanisms work. [Source: Canadian Centre for Cyber Security]",
      },
      { kind: "p", text: "The business question is simple: if our primary systems became unavailable tomorrow, what would we restore first? That answer should be known before an incident." },
      { kind: "h2", text: "6. Prepare for the day something goes wrong" },
      { kind: "p", text: "No cybersecurity program should be built around the assumption that nothing will ever happen." },
      {
        kind: "p",
        text: "The Canadian Cyber Centre recommends an incident response plan that helps organizations respond quickly, restore critical systems and data, and reduce service interruptions and data loss. [Source: Canadian Centre for Cyber Security]",
      },
      {
        kind: "p",
        text: "For a professional services firm, the plan should identify who leads the response, who contacts the IT/security provider, who can isolate affected systems, who communicates with leadership, who handles client communication, who evaluates privacy obligations, and who coordinates recovery.",
      },
      { kind: "p", text: "The plan does not need to be a 100-page manual. It needs to be usable." },
      { kind: "h2", text: "7. Make cybersecurity someone's responsibility" },
      { kind: "p", text: "One of the easiest gaps to overlook is ownership. If everyone is responsible for cybersecurity, nobody necessarily owns it." },
      {
        kind: "p",
        text: "The Canadian Cyber Centre's small-business guidance recommends assigning responsibility for cybersecurity within the organization. [Source: Canadian Centre for Cyber Security]",
      },
      {
        kind: "p",
        text: "That person does not have to be a full-time security executive. They do need authority to maintain the security plan, track important risks, coordinate providers, escalate incidents, and report priorities to leadership.",
      },
      { kind: "h2", text: "A practical professional-services baseline" },
      { kind: "p", text: "A useful first-pass review can be organized around five questions:" },
      {
        kind: "ul",
        items: [
          "**Identity:** Are important accounts protected by strong authentication and controlled access?",
          "**Email:** Can the business reduce phishing, spoofing, and mailbox compromise?",
          "**Client data:** Is sensitive information protected according to its risk and sensitivity?",
          "**Vendors:** Does the firm know which third parties have meaningful access?",
          "**Recovery:** Can the firm restore critical operations after a serious incident?",
        ],
      },
      {
        kind: "p",
        text: "These questions align naturally with the broader areas evaluated in Oragrol's Cyber Health Assessment. The point is not to collect the largest possible pile of security tools. The point is to identify the gaps that matter most.",
      },
    ],
  },
  {
    slug: "understanding-pipeda-business",
    title: "Understanding PIPEDA: What It Means for Your Business",
    contentType: "Article",
    topic: "Risk & Compliance",
    industry: "General SMB",
    seoTitle: "PIPEDA for Canadian Businesses: What SMBs Should Know",
    seoDescription:
      "A practical introduction to PIPEDA for Canadian businesses, including privacy safeguards, breach reporting, and why cybersecurity supports privacy obligations.",
    summary:
      "PIPEDA is not simply a cybersecurity standard. It is a Canadian privacy law governing the handling of personal information in certain commercial contexts. Understanding where it applies and how security supports privacy is essential for many businesses.",
    featured: false,
    oneNextAction:
      "Identify the three most sensitive types of personal information your business holds and document where each is stored, who can access it, and which third parties receive it.",
    ctaText: "Understand Your Security & Compliance Risks",
    ctaHref: "/contact",
    body: [
      {
        kind: "p",
        text: "A company can have excellent cybersecurity tools and still have a poor privacy program. It can also have a privacy policy on its website and still have weak security. Those are different things.",
      },
      { kind: "p", text: "PIPEDA is about how organizations handle personal information. Cybersecurity is one important part of protecting that information." },
      {
        kind: "p",
        text: `For a business owner, the useful question is not simply "Are we PIPEDA compliant?" The first question is: **Which privacy rules apply to our business, and what personal information are we responsible for protecting?**`,
      },
      { kind: "h2", text: "What PIPEDA does" },
      {
        kind: "p",
        text: "The Personal Information Protection and Electronic Documents Act establishes rules for the collection, use, and disclosure of personal information in the course of commercial activities in circumstances where the federal law applies.",
      },
      {
        kind: "p",
        text: "But PIPEDA does not apply identically to every organization in every province. The Office of the Privacy Commissioner of Canada explains that Alberta, British Columbia, and Quebec have private-sector privacy laws that have been recognized as substantially similar to PIPEDA. Certain health-information laws in other provinces can also affect which privacy regime applies. PIPEDA continues to apply in areas such as federally regulated private-sector organizations and certain interprovincial or international personal-information activities. [Source: Office of the Privacy Commissioner of Canada]",
      },
      {
        kind: "p",
        text: `That is why a generic statement such as "every Canadian business must comply with PIPEDA" is too broad. The applicable law depends on the organization, its activities, the information involved, and the jurisdictions in which it operates.`,
      },
      { kind: "h2", text: "Where cybersecurity fits" },
      {
        kind: "p",
        text: "PIPEDA includes a safeguards principle. The Office of the Privacy Commissioner explains that organizations must protect personal information with safeguards appropriate to its sensitivity and protect it against loss, theft, and unauthorized access, disclosure, copying, use, or modification. [Source: Office of the Privacy Commissioner of Canada]",
      },
      {
        kind: "p",
        text: "The OPC also emphasizes that PIPEDA does not prescribe one fixed list of security technologies. Organizations should consider factors such as sensitivity, quantity, distribution, format, storage, and the types and levels of risk they face. Safeguards can include physical, organizational, and technological measures. [Source: OPC Privacy Guide for Businesses]",
      },
      { kind: "p", text: `PIPEDA is not a shopping list that says "buy these five products and you are compliant." Security should be appropriate to the information and risk.` },
      { kind: "h2", text: "What this means for an SMB" },
      {
        kind: "p",
        text: "Start with the information, not the software. Ask what personal information is collected, why it's collected, where it's stored, who can access it, which vendors can access it, how long it's kept, how it's protected, what happens when it's no longer needed, and what happens if it's compromised.",
      },
      {
        kind: "p",
        text: "These questions connect naturally to areas of Oragrol's Cyber Health Assessment such as Data Handling & Storage, Access Control & Permissions, Vendor & Third-Party Risk, Email Security, Cloud Platform Security, Incident Response & Reporting, Governance & Leadership Accountability, and Cyber Insurance & Compliance Awareness.",
      },
      { kind: "p", text: "The assessment does not determine legal compliance. It helps identify security and governance areas that may deserve attention." },
      { kind: "h2", text: "What happens after a breach?" },
      {
        kind: "p",
        text: "PIPEDA includes mandatory breach-reporting and notification obligations in certain circumstances. Under section 10.1, an organization that experiences a breach of security safeguards involving personal information must report the breach to the Office of the Privacy Commissioner of Canada when it is reasonable to believe the breach creates a real risk of significant harm to affected individuals.",
      },
      {
        kind: "p",
        text: "Affected individuals must also be notified in the circumstances set out by the law. The OPC explains that organizations should assess factors including the sensitivity of the personal information and the probability that it will be misused. [Source: Office of the Privacy Commissioner of Canada]",
      },
      {
        kind: "p",
        text: "This is one reason incident response matters. A privacy obligation can become an operational cybersecurity problem very quickly. If a business does not know what data it holds, where it's stored, who can access it, or what happened during an incident, it becomes harder to assess the situation accurately and respond appropriately.",
      },
      { kind: "h2", text: "Privacy and cybersecurity should talk to each other" },
      { kind: "p", text: "A privacy program asks: should we collect, use, disclose, and retain this information in this way? Cybersecurity asks: how do we protect the systems and information involved?" },
      {
        kind: "p",
        text: "The two functions are different, but they should not operate in separate rooms. A practical SMB approach connects data inventory, access control, security safeguards, vendor management, employee awareness, incident response, and privacy responsibilities.",
      },
      { kind: "h2", text: "What PIPEDA does not mean" },
      {
        kind: "p",
        text: "PIPEDA does not mean that every organization must use a specific security product. It does not mean that obtaining a particular cybersecurity certification automatically makes a business compliant. It does not mean that a privacy policy alone proves that personal information is adequately protected. And it does not replace the need to determine whether another federal or provincial privacy law applies.",
      },
      { kind: "p", text: "For business-specific legal interpretation, organizations should obtain qualified Canadian privacy/legal advice." },
      { kind: "h2", text: "Where Oragrol fits" },
      {
        kind: "p",
        text: "Oragrol approaches compliance as part of a broader cybersecurity risk picture. The Cyber Health Assessment includes Cyber Insurance & Compliance Awareness, Data Handling & Storage, Vendor & Third-Party Risk, Governance & Leadership Accountability, and Incident Response & Reporting among its 20 assessment areas.",
      },
      {
        kind: "p",
        text: "That does not produce a legal compliance certificate. It provides a structured way to identify cybersecurity and governance areas that may need attention — often a more useful starting point than asking which compliance badge to buy.",
      },
    ],
  },
];

export function getArticle(slug: string): ResourceArticle | undefined {
  return ARTICLES.find((article) => article.slug === slug);
}
