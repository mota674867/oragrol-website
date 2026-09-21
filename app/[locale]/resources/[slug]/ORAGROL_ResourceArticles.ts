// Generated from the approved ORAGROL Resources master content.
// Content is intentionally kept as trusted Markdown for the reusable article renderer.

export type ResourceSource = { label: string; href: string | null };

export type ResourceArticle = {
  number: string;
  title: string;
  slug: string;
  type: string;
  topic: string;
  industry: string;
  estimatedRead: string;
  seoTitle: string;
  seoDescription: string;
  summary: string;
  body: string;
  nextAction: string;
  primaryCta: { label: string; href: string };
  sources: ResourceSource[];
};

export const RESOURCE_ARTICLES: ResourceArticle[] = [
  {
    "number": "01",
    "title": "What Is a Cyber Health Score?",
    "slug": "what-is-a-cyber-health-score",
    "type": "Article",
    "topic": "Cyber Health / Getting Started",
    "industry": "General SMB",
    "estimatedRead": "3 minutes",
    "seoTitle": "What Is a Cyber Health Score? A Plain-Language Guide",
    "seoDescription": "How ORAGROL's Cyber Health Score works, what the number actually measures, and why it matters more than a pass-or-fail grade.",
    "summary": "A plain-language breakdown of how ORAGROL's Cyber Health Score works, what the number actually measures, and why it matters more than a pass or fail grade.",
    "body": "Most business owners have never had a clear answer to a simple question: how secure is my business, really? Not in vague terms like \"pretty good\" or \"we have antivirus,\" but an actual number they can point to, track over time, and act on.\n\nThat's what the Cyber Health Score is built to do.\n\n## What the score measures\n\nThe Cyber Health Score is a number from 0 to 100, calculated from a plain-language assessment covering 20 categories of business security. These aren't abstract IT concepts. They're things like whether employees use multi-factor authentication, whether backups have actually been tested (not just scheduled), whether an old employee's access gets removed when they leave, and whether anyone would know who to call if something looked wrong.\n\nEach category carries a different weight, because not every risk matters equally. A business with weak multi-factor authentication is exposed to a different level of risk than one without a formal cybersecurity insurance policy. The scoring model reflects that. Categories tied to the most common ways Canadian small and medium businesses actually get breached, like phishing, credential theft, and unpatched systems, carry more weight than lower-impact categories.\n\n## How the number is calculated\n\nEvery question in the assessment has three possible answers: Yes, No, or Not Sure. A \"Yes\" always represents the more secure practice. Each answer earns points, those points are totaled per category, and each category's result is combined into a single weighted score.\n\nThe result is a score between 0 and 100, which falls into one of four risk tiers:\n\n- **0–39: Critical**\n- **40–59: High**\n- **60–79: Medium**\n- **80–100: Low**\n\nA lower score doesn't mean a business is careless. Most businesses land somewhere in the middle. It usually means there are a handful of specific, fixable gaps that haven't been addressed yet, often because nobody had a clear picture of where to start.\n\n## Why a single number is useful\n\nCybersecurity advice is often either too technical to act on or too generic to matter. A Cyber Health Score gives a business a starting point that's specific to them: what's already working, what the biggest gaps are, and what to prioritize first.\n\nIt's also something a business can track. Improving a Cyber Health Score from a 45 to a 75 over six months is a concrete way to see that security work is actually paying off, not just a recurring invoice.\n\n## What happens after the score\n\nOnce the assessment is complete, the result includes more than just the number. A short summary explains the most significant risks found, a handful of practical recommendations are prioritized by impact, and the business receives a full report by email.\n\nFrom there, the next step depends on the risk tier. Higher-risk results are followed up quickly, since those gaps tend to be the ones that turn into real incidents. Lower-risk results are a good sign, but rarely mean there's nothing left to improve.\n\nThe goal isn't to hand a business a grade and walk away. It's to give them a clear, honest starting point, and a practical path forward from wherever they currently stand.",
    "nextAction": "Get your own Cyber Health Score and see exactly where your business stands.",
    "primaryCta": {
      "label": "Get Your Cyber Health Score",
      "href": "/cyber-health"
    },
    "sources": [
      {
        "label": "This article describes ORAGROL's own assessment methodology; no external sources are cited.",
        "href": null
      }
    ]
  },
  {
    "number": "02",
    "title": "MFA: The One Control That Stops Most Breaches",
    "slug": "mfa-one-control-stops-most-breaches",
    "type": "Article",
    "topic": "Identity & Access",
    "industry": "General SMB",
    "estimatedRead": "4 minutes",
    "seoTitle": "MFA for Canadian Small Businesses: What to Protect First",
    "seoDescription": "MFA is one of the most important security controls for Canadian SMBs. Learn where to enforce it first, which methods are stronger, and what MFA cannot protect against.",
    "summary": "A stolen password should not be enough to walk into your business. Here is how Canadian SMBs should prioritize MFA, choose stronger authentication methods, and avoid common implementation mistakes.",
    "body": "Imagine an employee receives an email that looks like it came from a familiar service. They follow the link, enter their username and password, and move on with their day.\n\nThe password is now in someone else's hands.\n\nIf that account has no second authentication factor, the attacker may have everything needed to sign in. MFA changes that equation by requiring another proof of identity.\n\nThat is why MFA deserves to be treated as a priority control, not a checkbox at the bottom of an IT list.\n\n## Start with the accounts that matter most\n\nFor a small business, \"enable MFA everywhere\" can sound simple until someone has to implement it across Microsoft 365, Google Workspace, banking portals, cloud applications, VPNs, administrator accounts, and other services.\n\nThe better starting point is risk.\n\nORAGROL's Cyber Health Assessment treats **Multi-Factor Authentication**, **Passwords & Login Security**, and **Access Control & Permissions** as separate assessment areas because authentication is only one part of the identity picture.\n\nStart with accounts that can cause the most damage if compromised:\n\n- administrator accounts\n- business email\n- remote access\n- cloud platforms containing sensitive information\n- financial and payment-related accounts\n- systems containing customer or employee information\n\nThe Canadian Centre for Cyber Security recommends prioritizing high-value accounts, including administrative and senior-management email accounts, when rolling out MFA. It also recommends considering MFA for all users, systems, applications, and endpoints where appropriate. [Source: Canadian Centre for Cyber Security, ITSAP.00.105]\n\n## Not all MFA is equally strong\n\nMFA is an additional layer, but the method matters.\n\nThe Canadian Cyber Centre recommends stronger authentication methods such as authenticator applications and hardware-based, FIDO-compatible solutions. It cautions that SMS is less secure and should generally be limited to lower-risk situations. [Source: Canadian Centre for Cyber Security, ITSAP.00.105]\n\nFor an SMB, the practical progression is:\n\n**First:** turn on MFA for important accounts.\n\n**Then:** move higher-risk users and systems toward stronger, phishing-resistant authentication where supported.\n\n**Finally:** make the policy consistent rather than leaving MFA as an optional setting that employees can quietly ignore.\n\n## MFA does not replace good access control\n\nA business can have MFA enabled and still have poor identity security.\n\nConsider a former employee whose account remains active. MFA may still be protecting that account, but the business should not have left the account available in the first place.\n\nThat is why ORAGROL's assessment also looks at **Access Control & Permissions**.\n\nA practical identity review should ask:\n\n- Are unique credentials used?\n- Is MFA enforced?\n- Are administrator privileges limited?\n- Are former employees removed promptly?\n- Are shared accounts avoided?\n- Are sensitive systems protected by stronger authentication?\n- Are access permissions reviewed when roles change?\n\nMFA is a barrier. It is not a complete identity strategy.\n\n## The MFA mistake that costs organizations trust\n\nOne common mistake is treating deployment as a technology-only project.\n\nThe Cyber Centre specifically recommends preparing users, explaining why MFA is being introduced, training them to recognize MFA fatigue or push-bombing, and providing a way to report suspicious authentication prompts. [Source: Canadian Centre for Cyber Security, ITSAP.00.105]\n\nThat matters because employees are part of the control.\n\nIf someone receives repeated unexpected MFA prompts, the correct response is not to approve one just to make the notifications stop. The correct response is to report it.\n\n## Where ORAGROL looks at MFA\n\nIn the Cyber Health Assessment, MFA is not viewed in isolation. It sits alongside:\n\n- Passwords & Login Security\n- Access Control & Permissions\n- Email Security\n- Remote Work & Personal Devices\n- Cloud Platform Security\n- Employee Security Awareness & Training\n- Incident Response & Reporting\n\nThat gives a business a more useful question than \"Do we have MFA?\" The better question is: **Where would a stolen credential still give an attacker too much access?**",
    "nextAction": "Check your five highest-value business accounts today and confirm that MFA is enforced, not merely available.",
    "primaryCta": {
      "label": "Talk to ORAGROL About Your Security Controls",
      "href": "/contact"
    },
    "sources": [
      {
        "label": "Canadian Centre for Cyber Security — Steps for Effectively Deploying Multi-Factor Authentication (ITSAP.00.105)",
        "href": "https://www.cyber.gc.ca/en/guidance/steps-effectively-deploying-multi-factor-authentication-mfa-itsap00105"
      }
    ]
  },
  {
    "number": "03",
    "title": "Ransomware Recovery: What Canadian SMBs Get Wrong",
    "slug": "ransomware-recovery-canadian-smbs",
    "type": "Article",
    "topic": "Ransomware / Business Continuity",
    "industry": "General SMB",
    "estimatedRead": "4 minutes",
    "seoTitle": "Ransomware Recovery for Canadian SMBs: What Businesses Get Wrong",
    "seoDescription": "Ransomware recovery is more than having backups. Learn what Canadian SMBs should test, protect, and prepare before an incident.",
    "summary": "A backup that has never been restored is a hope, not a recovery plan. Here are the recovery gaps Canadian SMBs should address before ransomware turns an IT problem into a business interruption.",
    "body": "It is 9:15 on Monday morning.\n\nEmployees cannot open shared files. A few computers display the same message. The server is unavailable. Someone says the backup system is running, so the business should be fine.\n\nThen someone asks the question nobody has tested: **Can we actually restore the business?**\n\nThat is where ransomware recovery becomes different from backup.\n\n## Having a backup is not the same as being able to recover\n\nCanadian Centre for Cyber Security guidance recommends regular backups, secure storage, offline copies, and regular testing of backup and restoration processes. Its ransomware playbook specifically recommends multiple copies stored offline and testing restore procedures regularly. [Source: Canadian Centre for Cyber Security, Ransomware Playbook]\n\nA backup can exist and still fail as a recovery mechanism because:\n\n- it is incomplete\n- it is too old\n- it is inaccessible\n- credentials required to access it are compromised\n- the backup system is connected to the same environment as the attack\n- nobody has tested the restoration process\n- the organization does not know which systems must be restored first\n\nRecovery begins before the incident.\n\n## The first mistake: protecting data but not recovery\n\nA business owner may know where documents are stored but not how the company would operate if those documents disappeared tomorrow.\n\nA useful recovery conversation starts with business operations: **What must be restored first?**\n\nFor a professional services firm, that might include email, client files, accounting systems, identity services, critical applications, and shared storage. For another business, the priority could be completely different.\n\nThis is why backup strategy should follow business requirements rather than a generic schedule. The Canadian Cyber Centre's baseline controls recommend determining which information is essential to the organization, how frequently it changes, and how quickly it needs to be restored. [Source: Canadian Centre for Cyber Security, Baseline Cyber Security Controls]\n\n## The second mistake: never testing the restore\n\nThis is one of the simplest tests in cybersecurity and one of the easiest to postpone.\n\nA business may receive successful backup notifications every day and still have no evidence that a complete restoration works.\n\nThe test does not have to begin with a disaster simulation. Start with one important system. Restore a known file or system into a controlled environment. Document how long it took, what failed, who performed the recovery, which credentials were needed, and whether the restored information was usable. Then improve the process.\n\nTesting turns \"we have backups\" into evidence that recovery is possible.\n\n## The third mistake: forgetting that attackers may target the backups\n\nModern ransomware operations can attempt to disrupt recovery as well as encrypt production systems.\n\nThe Canadian Cyber Centre recommends multiple backup copies, including offline copies, and regular testing. [Source: Canadian Centre for Cyber Security, Ransomware Playbook]\n\nThe principle is straightforward: the same compromised environment should not be the only place your recovery plan lives. Backups need their own protection, access controls, and recovery procedures.\n\n## Recovery also depends on identity\n\nRansomware is not only a file-encryption problem. If an attacker compromises administrative credentials, they may be able to affect systems, disable security controls, or interfere with recovery.\n\nThat connects ransomware readiness directly to the areas ORAGROL assesses: MFA, Passwords & Login Security, Access Control & Permissions, Device & Endpoint Protection, Software & System Updates, Data Backup & Recovery, Incident Response & Reporting, and Employee Security Awareness & Training.\n\nA resilient recovery plan therefore starts long before the first encrypted file appears.\n\n## The fourth mistake: having no decision structure\n\nDuring an incident, people need to know who is responsible for what.\n\nThe Canadian Cyber Centre recommends incident response planning so organizations can respond quickly, restore critical systems and data, and reduce interruptions and data loss. [Source: Canadian Centre for Cyber Security, incident response guidance]\n\nAt minimum, an SMB should know who coordinates the response, who contacts the IT/security provider, who can isolate systems, who communicates with leadership, and who decides when systems are safe to restore.\n\nThe exact structure depends on the business. The important part is that it exists before the crisis.\n\n## Recovery is a business capability\n\nRansomware recovery should not be measured by whether a backup product reports \"success.\" The more useful question is: **Can the business restore the systems it needs, in the order it needs them, using a process people have actually tested?**\n\nThat is why ORAGROL treats **Data Backup & Recovery** and **Incident Response & Reporting** as separate assessment categories. One addresses the ability to restore. The other addresses the ability to respond. You need both.",
    "nextAction": "Choose one business-critical system and perform a documented restore test this month.",
    "primaryCta": {
      "label": "Prepare Your Business for a Security Incident",
      "href": "/contact"
    },
    "sources": [
      {
        "label": "Canadian Centre for Cyber Security — Ransomware Playbook (ITSM.00.099)",
        "href": "https://www.cyber.gc.ca/en/guidance/ransomware-playbook-itsm00099"
      },
      {
        "label": "Canadian Centre for Cyber Security — Baseline Cyber Security Controls for Small and Medium Organizations",
        "href": "https://www.cyber.gc.ca/en/guidance/baseline-cyber-security-controls-small-and-medium-organizations"
      }
    ]
  },
  {
    "number": "04",
    "title": "Email Security Basics for Small Business",
    "slug": "email-security-basics-small-business",
    "type": "Article",
    "topic": "Email Security",
    "industry": "General SMB",
    "estimatedRead": "4 minutes",
    "seoTitle": "Email Security for Small Businesses: A Practical Canadian Guide",
    "seoDescription": "Email remains a critical business system and a common path to phishing and impersonation. Learn the practical email security controls Canadian SMBs should review.",
    "summary": "Email is where business communication, identity, payments, customer information, and sensitive documents often meet. A practical email security program protects both the mailbox and the people using it.",
    "body": "A supplier emails your accounts team with a new bank account.\n\nThe message looks normal. The sender name is familiar. The invoice is real. The only problem is that the bank account is not.\n\nEmail security is not just about blocking obvious spam. For a modern small business, email sits at the intersection of identity, finance, data, and daily operations. That makes it worth treating as a business system, not merely an inbox.\n\n## Start with the account\n\nThe first layer is the mailbox itself.\n\nIf an attacker takes control of a business email account, they may gain access to conversations, documents, contacts, calendars, and information that can be used to impersonate the employee.\n\nORAGROL therefore separates **Email Security** from **Multi-Factor Authentication**, **Passwords & Login Security**, and **Access Control & Permissions** in its Cyber Health Assessment. They overlap, but they are not the same problem.\n\nA practical review should confirm MFA is enabled for important email accounts, passwords are unique, former-user accounts are disabled, administrative access is restricted, suspicious sign-in activity can be identified, and employees know how to report suspicious messages.\n\n## Then protect the domain\n\nEmail security also involves the domain that sends your messages.\n\nThe Canadian Centre for Cyber Security's email-security guidance explains the role of SPF, DKIM, and DMARC in authenticating email and reducing spoofing and impersonation. [Source: Canadian Centre for Cyber Security, Email Security Best Practices]\n\nIn simple terms: **SPF** helps receiving systems check whether a sending server is authorized to send mail for a domain. **DKIM** helps verify the integrity and authenticity of messages associated with a domain. **DMARC** builds on SPF and DKIM and lets a domain owner publish a policy for handling messages that fail authentication checks.\n\nThese controls do not replace employee awareness or account security. They strengthen the domain's ability to defend against impersonation.\n\n## The email problem is also a payment problem\n\nConsider a small professional-services firm. An attacker gains access to a mailbox and watches a conversation about a client payment. Instead of sending a random phishing message, the attacker waits for the right moment and changes the payment instructions.\n\nThis is why email security belongs in a business-risk conversation. The question is not simply \"Do we have spam filtering?\" It is \"What could someone do if they controlled this mailbox?\" That question changes the priority.\n\n## Teach employees what verification looks like\n\nTechnical controls matter, but people still make decisions.\n\nThe Canadian Cyber Centre recommends training employees to identify malicious emails and links, while NIST's current small-business guidance also emphasizes phishing awareness and verification of suspicious requests. [Sources: Canadian Centre for Cyber Security; NIST Small Business Cybersecurity]\n\nThe most useful training is specific. If an email requests a payment change, sensitive information, a password reset, an urgent login, or a new vendor bank account, do not verify the request using the contact information contained in the message. Use a known phone number, an established contact, or another trusted communication channel.\n\nThat small procedural change can matter more than another hour of generic security awareness slides.\n\n## AI makes suspicious messages harder to dismiss\n\nPoor spelling used to be an easy warning sign. It is not enough anymore.\n\nModern phishing messages can be polished, personalized, and written to resemble legitimate business communication. NIST's current small-business phishing guidance specifically notes that AI can be used to create increasingly convincing phishing attempts. [Source: NIST Small Business Cybersecurity, Phishing]\n\nThat means training should focus less on \"spot the typo\" and more on: **What is this message asking me to do?** Urgency, payment changes, requests for credentials, unexpected attachments, and unusual instructions deserve verification even when the message looks professional.\n\n## Email security is a system, not a product\n\nA mature email-security posture combines identity protection, MFA, strong authentication, email filtering, SPF/DKIM/DMARC, employee awareness, access controls, incident reporting, and response procedures.\n\nThese map directly to several areas of ORAGROL's Cyber Health Assessment, which is useful because it gives an SMB a way to see email risk as part of the wider security posture rather than as one isolated software purchase.",
    "nextAction": "Verify that your business domain has SPF, DKIM, and DMARC configured correctly, then review MFA on every critical mailbox.",
    "primaryCta": {
      "label": "Review Your Business's Security Posture",
      "href": "/contact"
    },
    "sources": [
      {
        "label": "Canadian Centre for Cyber Security — Quick Guide to Email Configuration",
        "href": "https://www.cyber.gc.ca/en/guidance/quick-guide-email-configuration"
      },
      {
        "label": "NIST — Small Business Cybersecurity Corner",
        "href": "https://www.nist.gov/itl/smallbusinesscyber"
      },
      {
        "label": "NIST — Small Business Cybersecurity Corner, Phishing",
        "href": "https://www.nist.gov/itl/smallbusinesscyber/guidance-topic/phishing"
      }
    ]
  },
  {
    "number": "05",
    "title": "Cybersecurity for Professional Services Firms: A Practical Guide",
    "slug": "cybersecurity-professional-services-firms",
    "type": "Guide",
    "topic": "SMB Security / Industry",
    "industry": "Professional Services",
    "estimatedRead": "5 minutes",
    "seoTitle": "Cybersecurity for Professional Services Firms in Canada",
    "seoDescription": "A practical cybersecurity guide for Canadian professional services firms covering identity, email, client data, vendors, backups, and incident readiness.",
    "summary": "Professional services firms often protect information that belongs to other people. That makes cybersecurity part of client trust, business continuity, and operational discipline, not simply an IT responsibility.",
    "body": "A professional services firm can run most of its business without owning a large data centre.\n\nIts real infrastructure may be much simpler: a Microsoft 365 or Google Workspace account, a few laptops, cloud accounting or practice-management software, client documents, a website, several external vendors, and a small team with access to all of it.\n\nThat simplicity can be misleading. For a consulting firm, accounting practice, legal practice, agency, engineering company, or similar professional business, the most valuable assets may be the information entrusted to it by clients. Cybersecurity therefore becomes part of the firm's ability to deliver its service and maintain trust.\n\n## 1. Protect the identity layer first\n\nProfessional services firms often rely heavily on cloud applications. That makes identity one of the first places to look.\n\nStart with unique passwords, MFA, limited administrator privileges, prompt removal of former employees, regular access reviews, and controlled access to sensitive systems.\n\nORAGROL's Cyber Health Assessment separates **Passwords & Login Security**, **MFA**, and **Access Control & Permissions** because each answers a different question. A good identity posture asks not only whether people can sign in securely, but whether they can access only what they actually need.\n\n## 2. Treat client information as a security responsibility\n\nA professional services firm may hold financial records, contracts, identification information, employee information, business plans, intellectual property, and confidential correspondence.\n\nThe Office of the Privacy Commissioner of Canada states that organizations subject to PIPEDA must use safeguards appropriate to the sensitivity of personal information and protect it against loss, theft, and unauthorized access, disclosure, copying, use, or modification. [Source: Office of the Privacy Commissioner of Canada]\n\nThat does not mean every firm needs the same technology stack. It means the security approach should reflect the information being handled.\n\n## 3. Email deserves special attention\n\nClient work often moves through email, creating risks including phishing, account compromise, impersonation, malicious attachments, unauthorized forwarding, payment fraud, and exposure of sensitive conversations.\n\nReview MFA, email filtering, SPF/DKIM/DMARC, access permissions, employee awareness, and payment verification procedures. The Canadian Cyber Centre's email-security guidance provides specific technical guidance on SPF, DKIM, and DMARC. [Source: Canadian Centre for Cyber Security]\n\n## 4. Your vendors are part of your security environment\n\nA professional services business may depend on cloud storage, accounting platforms, payroll systems, CRM software, legal platforms, marketing systems, IT providers, and other vendors.\n\nThat does not mean every vendor needs a six-month security audit. It does mean the business should know which vendors have access to important information or systems, and what happens if that vendor is compromised.\n\nThis is why **Vendor & Third-Party Risk** is one of ORAGROL's assessment categories. The first step is visibility: create a practical list of important providers and record what information they access, what systems they connect to, who owns the relationship internally, what security controls they provide, and what happens when the relationship ends.\n\n## 5. Backups should be tested, not assumed\n\nA professional services firm may believe its documents are safe because they are stored in the cloud. Cloud storage is not automatically the same thing as a complete business-recovery strategy.\n\nThe Canadian Cyber Centre recommends backing up essential business information, protecting backups, and regularly verifying that backup and restore mechanisms work. [Source: Canadian Centre for Cyber Security]\n\nThe business question is simple: if our primary systems became unavailable tomorrow, what would we restore first? That answer should be known before an incident.\n\n## 6. Prepare for the day something goes wrong\n\nNo cybersecurity program should be built around the assumption that nothing will ever happen.\n\nThe Canadian Cyber Centre recommends an incident response plan that helps organizations respond quickly, restore critical systems and data, and reduce service interruptions and data loss. [Source: Canadian Centre for Cyber Security]\n\nFor a professional services firm, the plan should identify who leads the response, who contacts the IT/security provider, who can isolate affected systems, who communicates with leadership, who handles client communication, who evaluates privacy obligations, and who coordinates recovery.\n\nThe plan does not need to be a 100-page manual. It needs to be usable.\n\n## 7. Make cybersecurity someone's responsibility\n\nOne of the easiest gaps to overlook is ownership. If everyone is responsible for cybersecurity, nobody necessarily owns it.\n\nThe Canadian Cyber Centre's small-business guidance recommends assigning responsibility for cybersecurity within the organization. [Source: Canadian Centre for Cyber Security]\n\nThat person does not have to be a full-time security executive. They do need authority to maintain the security plan, track important risks, coordinate providers, escalate incidents, and report priorities to leadership.\n\n## A practical professional-services baseline\n\nA useful first-pass review can be organized around five questions:\n\n- **Identity:** Are important accounts protected by strong authentication and controlled access?\n- **Email:** Can the business reduce phishing, spoofing, and mailbox compromise?\n- **Client data:** Is sensitive information protected according to its risk and sensitivity?\n- **Vendors:** Does the firm know which third parties have meaningful access?\n- **Recovery:** Can the firm restore critical operations after a serious incident?\n\nThese questions align naturally with the broader areas evaluated in ORAGROL's Cyber Health Assessment. The point is not to collect the largest possible pile of security tools. The point is to identify the gaps that matter most.",
    "nextAction": "Create a one-page inventory of your firm's critical systems, sensitive client information, and third-party providers, and identify who is responsible for each.",
    "primaryCta": {
      "label": "Get Your Cyber Health Score",
      "href": "/cyber-health"
    },
    "sources": [
      {
        "label": "Office of the Privacy Commissioner of Canada — PIPEDA Fair Information Principle 7, Safeguards",
        "href": "https://www.priv.gc.ca/en/privacy-topics/privacy-laws-in-canada/the-personal-information-protection-and-electronic-documents-act-pipeda/p_principle/principles/p_safeguards/"
      },
      {
        "label": "Canadian Centre for Cyber Security — Quick Guide to Email Configuration",
        "href": "https://www.cyber.gc.ca/en/guidance/quick-guide-email-configuration"
      },
      {
        "label": "Canadian Centre for Cyber Security — Baseline Cyber Security Controls for Small and Medium Organizations",
        "href": "https://www.cyber.gc.ca/en/guidance/baseline-cyber-security-controls-small-and-medium-organizations"
      },
      {
        "label": "Canadian Centre for Cyber Security — Foundational Cyber Security Actions for Small Organizations (ITSAP.10.300)",
        "href": "https://www.cyber.gc.ca/en/guidance/foundational-cyber-security-actions-small-organizations-itsap10300"
      }
    ]
  },
  {
    "number": "06",
    "title": "Understanding PIPEDA: What It Means for Your Business",
    "slug": "understanding-pipeda-business",
    "type": "Article",
    "topic": "Risk & Compliance",
    "industry": "General SMB",
    "estimatedRead": "5 minutes",
    "seoTitle": "PIPEDA for Canadian Businesses: What SMBs Should Know",
    "seoDescription": "A practical introduction to PIPEDA for Canadian businesses, including privacy safeguards, breach reporting, and why cybersecurity supports privacy obligations.",
    "summary": "PIPEDA is not simply a cybersecurity standard. It is a Canadian privacy law governing the handling of personal information in certain commercial contexts. Understanding where it applies and how security supports privacy is essential for many businesses.",
    "body": "A company can have excellent cybersecurity tools and still have a poor privacy program. It can also have a privacy policy on its website and still have weak security. Those are different things.\n\nPIPEDA is about how organizations handle personal information. Cybersecurity is one important part of protecting that information.\n\nFor a business owner, the useful question is not simply \"Are we PIPEDA compliant?\" The first question is: **Which privacy rules apply to our business, and what personal information are we responsible for protecting?**\n\n## What PIPEDA does\n\nThe Personal Information Protection and Electronic Documents Act establishes rules for the collection, use, and disclosure of personal information in the course of commercial activities in circumstances where the federal law applies.\n\nBut PIPEDA does not apply identically to every organization in every province. The Office of the Privacy Commissioner of Canada explains that Alberta, British Columbia, and Quebec have private-sector privacy laws that have been recognized as substantially similar to PIPEDA. Certain health-information laws in other provinces can also affect which privacy regime applies. PIPEDA continues to apply in areas such as federally regulated private-sector organizations and certain interprovincial or international personal-information activities. [Source: Office of the Privacy Commissioner of Canada]\n\nThat is why a generic statement such as \"every Canadian business must comply with PIPEDA\" is too broad. The applicable law depends on the organization, its activities, the information involved, and the jurisdictions in which it operates.\n\n## Where cybersecurity fits\n\nPIPEDA includes a safeguards principle. The Office of the Privacy Commissioner explains that organizations must protect personal information with safeguards appropriate to its sensitivity and protect it against loss, theft, and unauthorized access, disclosure, copying, use, or modification. [Source: Office of the Privacy Commissioner of Canada]\n\nThe OPC also emphasizes that PIPEDA does not prescribe one fixed list of security technologies. Organizations should consider factors such as sensitivity, quantity, distribution, format, storage, and the types and levels of risk they face. Safeguards can include physical, organizational, and technological measures. [Source: OPC Privacy Guide for Businesses]\n\nPIPEDA is not a shopping list that says \"buy these five products and you are compliant.\" Security should be appropriate to the information and risk.\n\n## What this means for an SMB\n\nStart with the information, not the software. Ask what personal information is collected, why it's collected, where it's stored, who can access it, which vendors can access it, how long it's kept, how it's protected, what happens when it's no longer needed, and what happens if it's compromised.\n\nThese questions connect naturally to areas of ORAGROL's Cyber Health Assessment such as Data Handling & Storage, Access Control & Permissions, Vendor & Third-Party Risk, Email Security, Cloud Platform Security, Incident Response & Reporting, Governance & Leadership Accountability, and Cyber Insurance & Compliance Awareness.\n\nThe assessment does not determine legal compliance. It helps identify security and governance areas that may deserve attention.\n\n## What happens after a breach?\n\nPIPEDA includes mandatory breach-reporting and notification obligations in certain circumstances. Under section 10.1, an organization that experiences a breach of security safeguards involving personal information must report the breach to the Office of the Privacy Commissioner of Canada when it is reasonable to believe the breach creates a real risk of significant harm to affected individuals.\n\nAffected individuals must also be notified in the circumstances set out by the law. The OPC explains that organizations should assess factors including the sensitivity of the personal information and the probability that it will be misused. [Source: Office of the Privacy Commissioner of Canada]\n\nThis is one reason incident response matters. A privacy obligation can become an operational cybersecurity problem very quickly. If a business does not know what data it holds, where it's stored, who can access it, or what happened during an incident, it becomes harder to assess the situation accurately and respond appropriately.\n\n## Privacy and cybersecurity should talk to each other\n\nA privacy program asks: should we collect, use, disclose, and retain this information in this way? Cybersecurity asks: how do we protect the systems and information involved?\n\nThe two functions are different, but they should not operate in separate rooms. A practical SMB approach connects data inventory, access control, security safeguards, vendor management, employee awareness, incident response, and privacy responsibilities.\n\n## What PIPEDA does not mean\n\nPIPEDA does not mean that every organization must use a specific security product. It does not mean that obtaining a particular cybersecurity certification automatically makes a business compliant. It does not mean that a privacy policy alone proves that personal information is adequately protected. And it does not replace the need to determine whether another federal or provincial privacy law applies.\n\nFor business-specific legal interpretation, organizations should obtain qualified Canadian privacy/legal advice.\n\n## Where ORAGROL fits\n\nORAGROL approaches compliance as part of a broader cybersecurity risk picture. The Cyber Health Assessment includes Cyber Insurance & Compliance Awareness, Data Handling & Storage, Vendor & Third-Party Risk, Governance & Leadership Accountability, and Incident Response & Reporting among its 20 assessment areas.\n\nThat does not produce a legal compliance certificate. It provides a structured way to identify cybersecurity and governance areas that may need attention — often a more useful starting point than asking which compliance badge to buy.",
    "nextAction": "Identify the three most sensitive types of personal information your business holds and document where each is stored, who can access it, and which third parties receive it.",
    "primaryCta": {
      "label": "Understand Your Security & Compliance Risks",
      "href": "/contact"
    },
    "sources": [
      {
        "label": "Office of the Privacy Commissioner of Canada — PIPEDA Requirements in Brief",
        "href": "https://www.priv.gc.ca/en/privacy-topics/privacy-laws-in-canada/the-personal-information-protection-and-electronic-documents-act-pipeda/pipeda_brief/"
      },
      {
        "label": "Office of the Privacy Commissioner of Canada — Privacy Guide for Businesses",
        "href": "https://www.priv.gc.ca/en/privacy-topics/privacy-laws-in-canada/the-personal-information-protection-and-electronic-documents-act-pipeda/pipeda-compliance-help/guide_org/"
      },
      {
        "label": "Office of the Privacy Commissioner of Canada — What You Need to Know About Mandatory Reporting of Breaches",
        "href": "https://www.priv.gc.ca/en/privacy-topics/business-privacy/breaches-and-safeguards/privacy-breaches-at-your-business/gd_pb_201810/"
      },
      {
        "label": "Office of the Privacy Commissioner of Canada — PIPEDA Fair Information Principle 7, Safeguards",
        "href": "https://www.priv.gc.ca/en/privacy-topics/privacy-laws-in-canada/the-personal-information-protection-and-electronic-documents-act-pipeda/p_principle/principles/p_safeguards/"
      }
    ]
  },
  {
    "number": "07",
    "title": "Cyber Insurance Readiness Checklist for Canadian SMBs",
    "slug": "cyber-insurance-readiness-checklist-canadian-smbs",
    "type": "Checklist",
    "topic": "Risk & Insurance",
    "industry": "General SMB",
    "estimatedRead": "6 minutes",
    "seoTitle": "Cyber Insurance Readiness Checklist for Canadian SMBs",
    "seoDescription": "Prepare for a stronger cyber insurance application or renewal with this practical Canadian SMB checklist covering controls, evidence, and policy review.",
    "summary": "Cyber insurance is not a replacement for security. This checklist helps a Canadian SMB prepare for a more productive application or renewal conversation by organizing the controls, evidence and business information insurers commonly ask about.",
    "body": "Cyber insurance can help transfer part of the financial risk created by a cyber incident. It does not remove the operational risk, restore systems by itself or guarantee that every loss will be covered. Policy terms, exclusions, deductibles, sub-limits and security requirements vary, so coverage decisions must be made with a qualified broker or insurer.\n\nThe useful starting point is evidence. A business should be able to explain what it protects, which controls are operating and how it would respond if those controls failed.\n\n## 1. Know the business exposure\n\nDocument the systems and information that would create the greatest harm if they became unavailable, inaccurate or exposed. Include business email, financial systems, customer and employee information, cloud platforms, operational applications and critical vendors.\n\nEstimate the business impact of one day, three days and one week of disruption. This is not a prediction. It gives leadership and the broker a clearer view of business-interruption exposure.\n\n## 2. Confirm the essential controls\n\nBefore an application or renewal, verify that the following are operating — not merely planned:\n\n- MFA is enforced on business email, remote access, administrator accounts and critical cloud systems.\n- Privileged access is limited and separate from ordinary user activity.\n- Former employees and unnecessary accounts are removed promptly.\n- Supported systems receive security updates on a defined schedule.\n- Endpoint protection and monitoring cover business devices.\n- Backups include critical information, are protected from the primary environment and have been restored in a documented test.\n- Employees receive practical phishing and payment-fraud training.\n- Payment or banking-detail changes require independent verification.\n- An incident-response plan identifies decision-makers, technical contacts, legal/privacy support and communication responsibilities.\n\n## 3. Prepare evidence\n\nCollect concise evidence that can support answers in the application: MFA configuration reports, access-review records, patching summaries, endpoint coverage, restore-test results, training completion, incident-response contacts and key vendor lists.\n\nDo not overstate maturity. An inaccurate application can create serious problems during a claim. Where a control is incomplete, document the gap, interim safeguard, owner and target date.\n\n## 4. Review the policy as an operating document\n\nAsk the broker to explain what the policy may cover, what is excluded, which services are available during an incident, who must be contacted and whether consent is required before engaging outside specialists. Review ransomware, business interruption, data restoration, privacy response, legal support, notification, social engineering and funds-transfer fraud separately; they may not be treated the same way.\n\n## 5. Keep readiness current\n\nInsurance readiness should be reviewed when the business changes — not only at renewal. A new acquisition, cloud migration, major vendor, payment workflow, remote workforce or AI deployment can change the risk profile.",
    "nextAction": "Schedule a 45-minute evidence review with the person responsible for IT/security and the person responsible for insurance. Identify the three application answers for which the business currently has the weakest proof.",
    "primaryCta": {
      "label": "Get Your Cyber Health Score",
      "href": "/cyber-health"
    },
    "sources": [
      {
        "label": "Insurance Bureau of Canada — Cyber Safety",
        "href": "https://www.ibc.ca/stay-protected/protect-your-business/cyber-safety"
      },
      {
        "label": "Statistics Canada — Impact of Cybercrime on Canadian Businesses, 2023",
        "href": "https://www150.statcan.gc.ca/n1/daily-quotidien/241021/dq241021a-eng.htm"
      },
      {
        "label": "Canadian Centre for Cyber Security — Baseline Cyber Security Controls for Small and Medium Organizations",
        "href": "https://www.cyber.gc.ca/en/guidance/baseline-cyber-security-controls-small-and-medium-organizations"
      }
    ]
  },
  {
    "number": "08",
    "title": "DMARC Enforcement: From Monitoring to p=reject",
    "slug": "dmarc-enforcement-p-reject",
    "type": "Practical Guide",
    "topic": "Email Security",
    "industry": "General SMB",
    "estimatedRead": "7 minutes",
    "seoTitle": "DMARC Enforcement Guide: From Monitoring to p=reject",
    "seoDescription": "A step-by-step guide to moving your domain from DMARC monitoring to full enforcement without blocking legitimate business email.",
    "summary": "Publishing a DMARC record is only the beginning. This guide explains how to move carefully from visibility to enforcement without blocking legitimate business email.",
    "body": "Your company domain is part of your identity. When criminals impersonate it, customers, suppliers and employees can receive fraudulent messages that appear to come from your business.\n\nSPF, DKIM and DMARC help receiving mail systems determine whether a message is authorized and what to do when authentication fails. DMARC also provides reporting that can reveal which services are sending mail for your domain.\n\n## Stage 1: Build the sending inventory\n\nList every legitimate service that sends email using your domain: Microsoft 365 or Google Workspace, marketing platforms, CRM systems, invoicing tools, support systems, website forms, payroll systems and specialist vendors. Include rarely used services and subdomains.\n\nDo not move to enforcement until the inventory is credible. A forgotten sender can become a legitimate message that gets quarantined or rejected.\n\n## Stage 2: Confirm SPF and DKIM\n\nSPF identifies servers authorized to send on behalf of a domain. DKIM adds a cryptographic signature that allows the recipient to validate the message and detect certain changes. DMARC requires alignment: at least one passing SPF or DKIM result must align with the domain visible in the From address.\n\nKeep SPF maintainable. Excessive third-party inclusions and outdated services create fragility. Enable DKIM for each supported sender and confirm that the signing domain aligns correctly.\n\n## Stage 3: Begin with reporting\n\nA monitoring policy — commonly `p=none` — asks receivers to send reports without instructing them to block failing mail. Use those reports to identify legitimate senders, unauthorized sources and alignment failures.\n\nMonitoring is an observation stage, not the final protection state. Assign an owner to review reports and resolve findings. A record that nobody reviews provides limited operational value.\n\n## Stage 4: Move through quarantine\n\nAfter legitimate senders authenticate correctly, introduce enforcement gradually. A quarantine policy tells receivers to treat failing messages with suspicion, often directing them toward spam or quarantine.\n\nUse the percentage control where appropriate to limit initial exposure, observe results and expand deliberately. Monitor complaints, delivery failures and critical workflows throughout the change.\n\n## Stage 5: Enforce rejection\n\nAt `p=reject`, receiving systems are instructed to reject messages that fail DMARC. The Canadian Centre for Cyber Security's Cross-Sector Cyber Security Readiness Goals recommend enabling DMARC and setting it to reject on corporate email infrastructure.\n\nEnforcement is not a one-time configuration. New vendors, new campaigns and new systems can change the authorized-sender inventory. Review reports and DNS records continuously, and apply an appropriate policy to subdomains.\n\n## What DMARC does not solve\n\nDMARC cannot prevent an attacker from compromising a real mailbox, registering a lookalike domain or persuading an employee to act on a fraudulent request. Pair domain protection with MFA, mailbox monitoring, employee awareness and independent verification for payment changes.",
    "nextAction": "Generate a current list of every platform authorized to send as your domain, then compare it with the sources visible in DMARC reports.",
    "primaryCta": {
      "label": "Get Your Cyber Health Score",
      "href": "/cyber-health"
    },
    "sources": [
      {
        "label": "Canadian Centre for Cyber Security — Quick Guide to Email Configuration",
        "href": "https://www.cyber.gc.ca/en/guidance/quick-guide-email-configuration"
      },
      {
        "label": "Canadian Centre for Cyber Security — Implementation Guidance: Email Domain Protection",
        "href": "https://www.cyber.gc.ca/en/guidance/implementation-guidance-email-domain-protection"
      },
      {
        "label": "Canadian Centre for Cyber Security — Cross-Sector Cyber Security Readiness Goals Toolkit",
        "href": "https://www.cyber.gc.ca/en/cyber-security-readiness/cross-sector-cyber-security-readiness-goals-toolkit"
      }
    ]
  },
  {
    "number": "09",
    "title": "The First 24 Hours of a Cyber Incident",
    "slug": "first-24-hours-cyber-incident",
    "type": "Executive Playbook",
    "topic": "Incident Response",
    "industry": "General SMB",
    "estimatedRead": "7 minutes",
    "seoTitle": "The First 24 Hours of a Cyber Incident: An Executive Playbook",
    "seoDescription": "A practical hour-by-hour structure for the first day of a cyber incident, covering command, containment, evidence, communication and safe recovery.",
    "summary": "The first day is about control: protect people, preserve evidence, contain damage and establish a reliable decision structure.",
    "body": "An incident rarely arrives with a complete explanation. It may begin with inaccessible files, an unusual payment, repeated sign-in prompts, a supplier warning or a message from an attacker. The first objective is not to solve everything immediately. It is to move from confusion to controlled response.\n\n## First hour: establish command\n\nActivate the incident lead and open an out-of-band communication channel in case email or collaboration systems are affected. Record the time, initial symptoms, systems involved and people making decisions.\n\nContact the organization's approved IT/security response provider. If cyber insurance may apply, review the notification and consent requirements before retaining unfamiliar external services. Preserve suspicious messages, screenshots, alerts and timelines.\n\nDo not delete evidence, wipe devices or negotiate with an attacker without qualified guidance.\n\n## Hours 1–4: contain without destroying evidence\n\nIsolate affected devices or accounts based on technical advice. Disable confirmed compromised sessions, tokens or credentials. Protect administrator accounts and recovery systems. Determine whether the incident is still active and whether other systems show related indicators.\n\nContainment should be proportionate. Shutting down everything may interrupt the business and destroy useful context; leaving everything connected may increase damage. The response lead and technical lead should make and document this decision together.\n\n## Hours 4–8: determine the business impact\n\nIdentify which services are unavailable, which information may be affected and which business processes are at risk. Establish restoration priorities based on operational need, not convenience.\n\nBegin a structured privacy and legal assessment. Under PIPEDA, organizations subject to the law may have reporting and notification obligations where a breach of security safeguards creates a real risk of significant harm. Applicability and legal interpretation require qualified advice.\n\n## Hours 8–16: communicate with discipline\n\nPrepare one approved internal update covering what is known, what remains unknown, what employees must do and where new information should be reported. Avoid speculation.\n\nDecide whether clients, vendors, regulators, law enforcement or other parties must be contacted. Communications should be accurate, coordinated and reviewed by the appropriate legal/privacy adviser.\n\n## Hours 16–24: move toward safe recovery\n\nValidate clean backups and define recovery order. Confirm that the initial access path has been addressed before reconnecting restored systems. Reset credentials and strengthen controls according to the evidence, not through an uncontrolled blanket change.\n\nAt the end of the first day, leadership should have a current situation summary, known business impact, containment status, evidence log, communication decisions, recovery priorities and a plan for the next operational period.",
    "nextAction": "Put the names and after-hours contact details of your incident lead, technical responder, insurer/broker and privacy/legal adviser on one page that is available outside your normal systems.",
    "primaryCta": {
      "label": "Book a Scoping Call",
      "href": "/contact"
    },
    "sources": [
      {
        "label": "Canadian Centre for Cyber Security — Ransomware Playbook (ITSM.00.099)",
        "href": "https://www.cyber.gc.ca/en/guidance/ransomware-playbook-itsm00099"
      },
      {
        "label": "Office of the Privacy Commissioner of Canada — PIPEDA Resources",
        "href": "https://www.priv.gc.ca/en/privacy-topics/privacy-laws-in-canada/the-personal-information-protection-and-electronic-documents-act-pipeda/"
      }
    ]
  },
  {
    "number": "10",
    "title": "Vendor Risk Before You Grant Access",
    "slug": "vendor-risk-before-granting-access",
    "type": "Checklist",
    "topic": "Third-Party Risk",
    "industry": "General SMB",
    "estimatedRead": "6 minutes",
    "seoTitle": "Vendor Risk Checklist: What to Ask Before You Grant Access",
    "seoDescription": "A practical vendor risk checklist for Canadian SMBs — what to ask, how to classify vendors, and how to limit access before it becomes a liability.",
    "summary": "A vendor becomes part of your security environment when it can access your systems, information or operations. Ask the important questions before access is granted.",
    "body": "Canadian SMBs depend on cloud platforms, payroll providers, IT companies, accountants, marketing systems, developers and industry-specific software. The objective is not to audit every supplier like a bank. It is to apply more scrutiny where the access and business impact are greater.\n\n## Classify the relationship\n\nRecord what the vendor will access, whether personal or confidential information is involved, whether the service is operationally critical, whether subcontractors are used and how difficult replacement would be.\n\nClassify vendors as standard, controlled or critical. A newsletter platform and a managed administrator should not receive the same review.\n\n## Ask before access\n\n- Is MFA enforced for vendor personnel?\n- Are privileged actions attributable to named individuals?\n- How is access approved, reviewed and removed?\n- What security logging is available?\n- How are vulnerabilities and updates handled?\n- How are your data and backups protected?\n- In which jurisdictions is information stored or processed?\n- Will subcontractors receive access?\n- How quickly will the vendor notify you of an incident?\n- What happens to your data and accounts when the relationship ends?\n\n## Limit the access\n\nGrant only the permissions, systems and duration required. Use separate named accounts, time-bound administrative access and technical restrictions where available. Avoid shared administrator credentials.\n\nDocument the internal owner. That person should know why the vendor has access, when it should be reviewed and who can terminate it.\n\n## Put expectations in writing\n\nContracts should reflect the sensitivity and operational importance of the service. Address security responsibilities, incident notification, cooperation, data handling, subcontractors, return or deletion of information, access termination and evidence the vendor must provide.\n\n## Monitor what changes\n\nVendor risk changes after onboarding. The provider may add a subcontractor, change hosting locations, experience an incident, introduce AI features or gain broader access. Review critical vendors at least annually and when material changes occur.",
    "nextAction": "Identify every third party with administrator access or access to sensitive information. Confirm that each has a named business owner and a current offboarding method.",
    "primaryCta": {
      "label": "Get Your Cyber Health Score",
      "href": "/cyber-health"
    },
    "sources": [
      {
        "label": "Canadian Centre for Cyber Security — Cyber Supply Chain: An Approach to Assessing Risk (ITSAP.10.070)",
        "href": "https://www.cyber.gc.ca/en/guidance/cyber-supply-chain-approach-assessing-risk-itsap10070"
      },
      {
        "label": "Canadian Centre for Cyber Security — The Cyber Threat from Supply Chains",
        "href": "https://www.cyber.gc.ca/en/guidance/cyber-threat-supply-chains"
      }
    ]
  },
  {
    "number": "11",
    "title": "A Practical AI Use Policy for Canadian Businesses",
    "slug": "practical-ai-use-policy-canadian-businesses",
    "type": "Policy Guide",
    "topic": "AI Governance",
    "industry": "General SMB",
    "estimatedRead": "7 minutes",
    "seoTitle": "A Practical AI Use Policy for Canadian Businesses",
    "seoDescription": "Employees are already using AI. Build a practical AI use policy that protects information, defines approved tools, and keeps humans accountable.",
    "summary": "Employees are already using AI. A useful policy defines acceptable use, protects information and creates clear human accountability without blocking responsible experimentation.",
    "body": "An AI policy should answer a simple operational question: what may people do with AI tools, using which information, under whose approval and with what review?\n\n## Define approved tools and accounts\n\nMaintain a list of approved AI services and permitted business purposes. Require business accounts where available and prohibit employees from connecting unapproved AI tools to company email, files, CRM, finance or other systems.\n\n## Classify information before use\n\nDo not enter client-confidential information, personal information, credentials, financial details, legal advice, health information, proprietary source code or other restricted material into an AI service unless the specific use, provider terms, retention, training behaviour and security controls have been reviewed and approved.\n\n## Require human review\n\nAI output can be inaccurate, incomplete, biased or inappropriate. A qualified person remains accountable for validating facts, calculations, citations, legal implications and client-facing decisions. AI must not be the final decision-maker for hiring, termination, credit, payment, legal, privacy, security or other high-impact decisions without an approved control framework.\n\n## Protect intellectual property\n\nEmployees should verify whether they have the right to upload source material and whether generated output can be used for the intended purpose. Do not assume that content is safe to publish because an AI system produced it.\n\n## Be transparent where it matters\n\nDefine when customers, employees or partners should be told that AI materially contributed to an interaction, recommendation or deliverable. Provide a path to human review for consequential outcomes.\n\n## Control automation and integrations\n\nAn AI assistant that drafts text creates different risk from an agent that can send email, change records, issue refunds or access customer data. Require formal approval, least-privilege access, logging, testing, rollback and human gates before AI is connected to operational systems.\n\n## Report problems\n\nEmployees should know how to report accidental disclosure, harmful output, suspicious prompts, unexpected agent actions or use of an unapproved tool. The response process should connect AI governance with privacy, cybersecurity and incident management.",
    "nextAction": "Publish a one-page interim rule today: approved tools, prohibited data, mandatory human review and the person who can approve exceptions.",
    "primaryCta": {
      "label": "Book a Scoping Call",
      "href": "/contact"
    },
    "sources": [
      {
        "label": "Innovation, Science and Economic Development Canada — Voluntary Code of Conduct on the Responsible Development and Management of Advanced Generative AI Systems",
        "href": "https://ised-isde.canada.ca/site/ised/en/voluntary-code-conduct-responsible-development-and-management-advanced-generative-ai-systems"
      },
      {
        "label": "Innovation, Science and Economic Development Canada — Implementation Guide for Managers of AI Systems",
        "href": "https://ised-isde.canada.ca/site/ised/en/implementation-guide-managers-artificial-intelligence-systems"
      },
      {
        "label": "Office of the Privacy Commissioner of Canada — Privacy Topics",
        "href": "https://www.priv.gc.ca/en/privacy-topics/"
      }
    ]
  },
  {
    "number": "12",
    "title": "Microsoft 365 Security Baseline for an SMB",
    "slug": "microsoft-365-security-baseline-smb",
    "type": "Technical Checklist",
    "topic": "Cloud & Identity",
    "industry": "General SMB",
    "estimatedRead": "8 minutes",
    "seoTitle": "Microsoft 365 Security Baseline for Small and Medium Business",
    "seoDescription": "A practical Microsoft 365 security baseline covering identity, email, endpoints, SharePoint, logging, and the controls that reduce common compromise paths.",
    "summary": "Microsoft 365 is often the centre of an SMB's identity, email and files. This baseline focuses on the controls that reduce common compromise paths without pretending every tenant is identical.",
    "body": "## 1. Protect every identity\n\nEnable Security Defaults for a small tenant where they are appropriate, or use properly designed Conditional Access policies where licensing and operational needs justify them. Enforce MFA, protect administrative roles and block legacy authentication.\n\nMaintain at least two carefully controlled emergency-access accounts and monitor their use. Administrators should use separate privileged accounts rather than reading email or browsing with an administrative identity.\n\n## 2. Control access lifecycle\n\nUse a documented joiner, mover and leaver process. Remove departed users promptly, review guest accounts and examine privileged-role assignments regularly. Avoid permanent exceptions to MFA or access policies; where exceptions are necessary, assign an owner and expiry/review date.\n\n## 3. Strengthen email and domain protection\n\nConfigure SPF, DKIM and DMARC for every sending domain. Review anti-phishing, anti-spam and malware policies. Protect high-risk users such as finance, administrators and senior leadership with stronger controls and specific awareness training.\n\n## 4. Secure endpoints\n\nKnow which devices access company information. Apply supported operating systems, automatic security updates, disk encryption, screen locking and endpoint protection. For personal devices, define what data may be accessed and what management or application-protection controls apply.\n\n## 5. Protect SharePoint, OneDrive and Teams\n\nReview external sharing defaults, anonymous links, guest access and sensitive sites. Use the least permissive sharing method that still supports the business. Ensure that important files have an independent recovery strategy appropriate to the organization's needs.\n\n## 6. Turn on logging and response visibility\n\nConfirm that audit logging is available and retained for the required period. Review risky sign-ins, unusual mailbox rules, unexpected forwarding, privileged changes and application consent. Establish who will receive and investigate alerts.\n\n## 7. Measure without chasing a score\n\nMicrosoft Secure Score can help identify recommended actions, but the score is not proof that the business is secure. Prioritize actions by actual exposure, licensing, compatibility and operational impact. Record accepted risks and compensating controls.\n\n## 8. Test the operating process\n\nRun a quarterly access review, a mailbox-compromise exercise and a file-restore test. A secure configuration that nobody monitors or tests degrades quietly.",
    "nextAction": "Review all privileged roles, MFA exclusions, legacy-authentication activity and external forwarding rules this week.",
    "primaryCta": {
      "label": "Get Your Cyber Health Score",
      "href": "/cyber-health"
    },
    "sources": [
      {
        "label": "Microsoft — Baseline Security Measures",
        "href": "https://learn.microsoft.com/en-us/security/zero-trust/prioritizing-defense/baseline-security-measures"
      },
      {
        "label": "Microsoft — Set Up Multi-Factor Authentication",
        "href": "https://learn.microsoft.com/en-us/microsoft-365/admin/security-and-compliance/set-up-multi-factor-authentication"
      },
      {
        "label": "Microsoft Secure Score",
        "href": "https://learn.microsoft.com/en-us/defender-xdr/microsoft-secure-score"
      },
      {
        "label": "Canadian Centre for Cyber Security — Baseline Cyber Security Controls for Small and Medium Organizations",
        "href": "https://www.cyber.gc.ca/en/guidance/baseline-cyber-security-controls-small-and-medium-organizations"
      }
    ]
  },
  {
    "number": "13",
    "title": "Cybersecurity for Accounting and Bookkeeping Firms",
    "slug": "cybersecurity-accounting-bookkeeping-firms",
    "type": "Industry Brief",
    "topic": "Industry Security",
    "industry": "Accounting & Bookkeeping",
    "estimatedRead": "7 minutes",
    "seoTitle": "Cybersecurity for Accounting and Bookkeeping Firms in Canada",
    "seoDescription": "Accounting and bookkeeping firms combine sensitive client data with payment authority. Here are the security priorities that reflect that risk.",
    "summary": "Accounting and bookkeeping firms combine sensitive client information, trusted email relationships and authority around payments. Their security priorities should reflect that operating reality.",
    "body": "## The risk is concentrated in trust\n\nAttackers do not need to break every system. A compromised mailbox can reveal client names, payment timing, tax documents and the language used in real conversations. That context can support convincing impersonation or fraudulent banking-detail changes.\n\nProtect business email with enforced MFA, strong domain authentication, monitoring and a defined method for independently verifying payment changes. Staff should use a known phone number or established contact — not contact details supplied in the request itself.\n\n## Cloud accounting is still your responsibility\n\nUsing a reputable cloud platform transfers parts of infrastructure management, not the firm's responsibility for accounts, permissions, integrations, devices and client data. Review who has access to each client environment, which third-party apps are connected and how access is removed when staff or contractors leave.\n\n## Client files need deliberate handling\n\nIdentify where tax records, payroll information, identification documents and financial statements are stored and shared. Reduce uncontrolled downloads, personal email use and public links. Apply safeguards appropriate to sensitivity and verify that retention and deletion practices match legal and professional obligations.\n\n## Busy season changes the threat model\n\nHigh workload increases urgency, temporary access, remote work and exception-making. Before busy season, complete access reviews, patching, backup tests and staff refreshers. Define escalation paths so a suspicious request does not sit unanswered because everyone is overloaded.\n\n## Recovery must protect deadlines\n\nMap critical systems to client and filing deadlines. Test restoration for email, shared files, identity systems and practice-management or accounting data. Record recovery priorities and the people authorized to make decisions during an interruption.\n\n## Cyber insurance renewal should be evidence-led\n\nControls can support a clearer renewal conversation, but they do not guarantee coverage or lower premiums. Maintain evidence of MFA enforcement, access reviews, endpoint coverage, backups, restore tests, training and incident-response planning. Answer insurer questions accurately and involve a qualified broker.\n\n## Where automation fits\n\nSecurity is only one part of operating resilience. Carefully governed automation can improve lead follow-up, onboarding, document collection, recurring client communication and management reporting. High-risk steps — payments, filings, payroll and privileged access — need stronger approval, logging and human review.\n\nWhen intake, engagement, billing, staff capacity and client communication must operate as one coordinated system, the requirement may have moved beyond separate automation into OR ONE territory.",
    "nextAction": "Review the last ten requests to change client or vendor banking details. Confirm that each was independently verified using a trusted channel.",
    "primaryCta": {
      "label": "Discover OR ONE",
      "href": "/or-one"
    },
    "sources": [
      {
        "label": "RCMP — Business Email Compromise",
        "href": "https://www.rcmp.ca/en/federal-policing/cybercrime/cyber-features/business-email-compromise"
      },
      {
        "label": "Office of the Privacy Commissioner of Canada — PIPEDA",
        "href": "https://www.priv.gc.ca/en/privacy-topics/privacy-laws-in-canada/the-personal-information-protection-and-electronic-documents-act-pipeda/"
      },
      {
        "label": "Canadian Centre for Cyber Security — Quick Guide to Email Configuration",
        "href": "https://www.cyber.gc.ca/en/guidance/quick-guide-email-configuration"
      }
    ]
  },
  {
    "number": "14",
    "title": "Canadian SMB Cyber-Risk Brief 2026",
    "slug": "canadian-smb-cyber-risk-brief-2026",
    "type": "Executive Brief",
    "topic": "Cyber Risk",
    "industry": "General SMB",
    "estimatedRead": "6 minutes",
    "seoTitle": "Canadian SMB Cyber-Risk Brief 2026: What the Data Shows",
    "seoDescription": "What the latest Statistics Canada cybercrime data means for Canadian SMB leaders — incident rates, recovery costs, and the governance gap.",
    "summary": "Canadian businesses are reporting fewer incidents than in earlier survey years, but recovery costs and several high-impact methods continue to demand leadership attention.",
    "body": "Statistics Canada reported that 16% of Canadian businesses were impacted by cybersecurity incidents in 2023, compared with 18% in 2021 and 21% in 2019. That decline should not be read as permission to reduce readiness — this remains the most recently published cycle of this survey; a 2025 cycle has been fielded, with results not yet released.\n\nAmong affected businesses, scams and fraud remained the most commonly reported method. Identity theft affected 31% of impacted businesses, and 13% reported ransomware attacks. Total recovery spending doubled from approximately $600 million in 2021 to $1.2 billion in 2023.\n\n## What the numbers mean for an SMB\n\nThe practical issue is concentration. A small business may depend on one email tenant, one accounting platform, a few administrators and a small number of critical vendors. A single identity compromise can therefore affect communication, payments, customer trust and operations at the same time.\n\nThe most useful priorities remain disciplined fundamentals:\n\n1. Enforce MFA on email, remote access, administrators and critical cloud systems.\n2. Remove unsupported systems and apply security updates.\n3. Protect business email through account controls, SPF, DKIM, DMARC and payment verification.\n4. Maintain protected backups and test restoration.\n5. Limit privileged access and remove departed users promptly.\n6. Know which vendors can reach critical systems or information.\n7. Prepare a usable incident-response plan and external contact list.\n\n## The governance gap\n\nStatistics Canada found that only 26% of businesses had written cybersecurity policies in 2023, while 22% had cyber-risk insurance. A policy document is not a control by itself, but the absence of written ownership and response expectations can slow decisions when an incident occurs.\n\nLeadership should know who owns cybersecurity risk, which systems are essential, which gaps have been accepted, what evidence exists and when the next review will occur.\n\n## AI increases both opportunity and exposure\n\nAI can improve analysis, communication and automation, but it can also increase convincing phishing, uncontrolled data disclosure and automated operational errors. Businesses need clear approved-use rules, human review for consequential actions and stricter controls when AI connects to live systems.\n\n## A useful 2026 objective\n\nDo not try to implement every control at once. Establish a credible baseline, rank gaps by business impact and complete a small number of measurable improvements each quarter.",
    "nextAction": "Ask leadership to name the three cyber events most capable of interrupting revenue this year. Confirm that each has an owner, preventive control and tested response.",
    "primaryCta": {
      "label": "Get Your Cyber Health Score",
      "href": "/cyber-health"
    },
    "sources": [
      {
        "label": "Statistics Canada — Impact of Cybercrime on Canadian Businesses, 2023",
        "href": "https://www150.statcan.gc.ca/n1/daily-quotidien/241021/dq241021a-eng.htm"
      },
      {
        "label": "Canadian Centre for Cyber Security — Baseline Cyber Security Controls for Small and Medium Organizations",
        "href": "https://www.cyber.gc.ca/en/guidance/baseline-cyber-security-controls-small-and-medium-organizations"
      }
    ]
  },
  {
    "number": "15",
    "title": "Business Automation Readiness Assessment",
    "slug": "business-automation-readiness-assessment",
    "type": "Assessment Guide",
    "topic": "Business Automation",
    "industry": "General SMB",
    "estimatedRead": "6 minutes",
    "seoTitle": "Business Automation Readiness Assessment for SMBs",
    "seoDescription": "Five tests to run before committing to a business automation build — outcome, process, data, risk, and ownership.",
    "summary": "Automation works best when a business chooses one valuable, bounded outcome — not when it tries to automate confusion.",
    "body": "Use the following five tests before committing to an automation build.\n\n## 1. Is the outcome specific?\n\nA strong target can be measured: reduce lead-response time, resolve repeat support questions, shorten monthly reporting, improve employee onboarding or reactivate dormant customers. \"Use AI in the business\" is not a defined outcome.\n\n## 2. Is the process stable enough?\n\nDocument the current trigger, steps, decisions, exceptions, systems and owner. If every employee performs the work differently, first agree on the operating process. Automation will otherwise reproduce inconsistency at greater speed.\n\n## 3. Is the information usable?\n\nConfirm where required data lives, who owns it, whether it is accurate and whether the business has authority to use it. Identify personal, confidential or regulated information before choosing tools or integrations.\n\n## 4. Can the risk be controlled?\n\nClassify actions as standard, controlled or critical. Drafting, research and reversible administration may allow more autonomy. Customer communication, invoicing preparation and CRM changes need stronger controls. Payments, payroll, refunds, hiring, filings, privileged access and security changes require explicit authorization, logs and human approval.\n\n## 5. Is there an operating owner?\n\nEvery automation needs someone responsible for performance, exceptions and change. Define success measures, escalation, monitoring, rollback and what happens when a connected system changes.\n\n## A simple readiness decision\n\n**Ready:** One clear outcome, repeatable process, accessible information, manageable integrations and accountable owner.\n\n**Ready with discovery:** The value is clear, but process, data or integration details remain uncertain.\n\n**Not ready:** No measurable outcome, no owner, uncontrolled high-risk actions or unresolved data/privacy concerns.\n\n## Choose the right starting job\n\n- **Sales Flow Automation:** lead capture, qualification, reminders and proposal follow-up.\n- **Customer Support Automation:** intake, routing, knowledge-assisted responses and escalation.\n- **Operational Intelligence:** reliable management reporting and decision visibility.\n- **Managed IT Operations:** support, assets, monitoring and routine IT coordination.\n- **Customer Growth Automation:** retention, reactivation and lifecycle communication.\n- **Tailored Automation:** one bounded outcome that does not fit the five standard jobs.",
    "nextAction": "Write one sentence in this format: \"When [trigger] occurs, the system should [outcome], except when [high-risk exception], which requires [human owner].\"",
    "primaryCta": {
      "label": "Explore Business Automation",
      "href": "/business-automation"
    },
    "sources": [
      {
        "label": "This article reflects ORAGROL's own automation-scoping methodology; no external sources are cited.",
        "href": null
      }
    ]
  },
  {
    "number": "16",
    "title": "When Separate Automations Should Become OR ONE",
    "slug": "when-automations-become-or-one",
    "type": "Executive Guide",
    "topic": "OR ONE",
    "industry": "General SMB",
    "estimatedRead": "6 minutes",
    "seoTitle": "When Separate Automations Should Become OR ONE",
    "seoDescription": "Several disconnected automations can create fragmentation. Here's how to recognize when a business needs one coordinated operating system instead.",
    "summary": "Several disconnected automations can create another layer of fragmentation. OR ONE becomes relevant when multiple departments, decisions and controls must operate as one secure system.",
    "body": "A focused automation is usually the right starting point. It solves one bounded job, reaches value faster and keeps risk understandable.\n\nThe design threshold changes when the business needs several functions to share the same information, rules and accountability.\n\n## Signals that the requirement has changed\n\nConsider OR ONE when:\n\n- Sales, operations, finance and customer service need a shared workflow rather than separate handoffs.\n- The same customer or operational data is copied between several systems.\n- Automation decisions depend on context held by another department.\n- Leadership needs one current operational view rather than several reports.\n- Exceptions, approvals and security controls must remain consistent across workflows.\n- A change in one system should safely coordinate actions in several others.\n- Managing separate automation vendors and integrations has become an operating burden.\n\n## What OR ONE should provide\n\nOR ONE is not one large chatbot and it is not a license bundle. It is a secure operating system designed around how the client's business actually works.\n\nThe design should include a shared information model, defined responsibilities, governed integrations, role-based access, audit history, approval gates, exception handling, monitoring and a clear human escalation path.\n\n## Start from the operating model\n\nMap the business journey before selecting technology. Identify triggers, decisions, information, systems, owners, exceptions and critical actions. Separate what can be automated from what must remain under human authority.\n\nUse the responsibility model:\n\n- **Standard:** research, drafting, scheduling and reversible administration.\n- **Controlled:** customer communication, invoicing preparation, CRM updates and operational integrations.\n- **Critical:** payments, payroll, refunds, hiring, regulatory filings, privileged access and security changes.\n\n## Avoid premature unification\n\nDo not choose OR ONE merely because the business uses several tools. If one job can be solved cleanly and independently, a focused automation is likely more appropriate.\n\nOR ONE should be selected because coordination creates material business value — not because a larger project sounds more advanced.\n\n## The decision question\n\nAsk: \"If we improve this workflow alone, will the business receive the intended outcome — or must several departments, systems and decisions change together?\"\n\nIf the answer is \"together,\" the requirement may be OR ONE territory.",
    "nextAction": "Draw the workflow across departments. Mark every handoff, duplicated data entry, approval and system boundary. If the value depends on coordinating three or more of them, book a scoping conversation.",
    "primaryCta": {
      "label": "Discover OR ONE",
      "href": "/or-one"
    },
    "sources": [
      {
        "label": "This article reflects ORAGROL's own OR ONE scoping framework; no external sources are cited.",
        "href": null
      }
    ]
  }
];

export const RESOURCE_ARTICLES_BY_SLUG = Object.fromEntries(
  RESOURCE_ARTICLES.map((article) => [article.slug, article]),
) as Record<string, ResourceArticle>;
