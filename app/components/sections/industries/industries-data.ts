/**
 * Industries content — Step 9. Verbatim from Mohammad's supplied,
 * fact-checked brief (`ORAGROL_INDUSTRIES_CONTENT_CANADA.md`, aligned with
 * Canadian Centre for Cyber Security / OSFI guidance — see that file's own
 * "Content & Market Basis" section for sources). Not edited, not
 * summarized, no stats added — copied field-for-field so content stays
 * separate from `IndustriesExplorer`'s component logic, same "typed data
 * array, no invented copy" discipline as every other locked-content page
 * (Services' `LIVE_SERVICES`, How We Work's stage copy, Cyber Health's
 * `OUTPUT_ITEMS`).
 *
 * `nextStep.kind` is UI routing metadata only (which real, existing CTA
 * target this label points to), not new content — every `nextStep.label`
 * string below is copied verbatim from the brief. "Get Your Cyber Health
 * Score" routes to the real live Tally assessment (`AssessmentCta`, same
 * as Cyber Health/Services); every "Talk to Oragrol..." variant routes to
 * `/contact`, the same target the site's other "Talk to Oragrol" CTAs use
 * (Cyber Health hero, Services' live-service rows) — there is no
 * per-industry contact page to point to instead.
 */

export interface Industry {
  name: string;
  risk: string;
  priorities: string[];
  approach: string;
  nextStep: {
    label: string;
    kind: "assessment" | "contact";
  };
}

export const INDUSTRIES: Industry[] = [
  {
    name: "Professional Services",
    risk: "Professional firms hold valuable client files, financial records, contracts, and confidential communications, often across Microsoft 365, cloud apps, and remote devices. A compromised email account can quickly become a data breach or fraudulent payment.",
    priorities: [
      "MFA and strong identity/access controls",
      "Email security and business email compromise protection",
      "Secure client-data sharing and cloud access",
      "Tested backups and recovery",
    ],
    approach:
      "Oragrol focuses on protecting the people, accounts, and client information that professional firms depend on, with practical controls that fit smaller teams without creating unnecessary complexity.",
    nextStep: { label: "Get Your Cyber Health Score", kind: "assessment" },
  },
  {
    name: "Healthcare",
    risk: "Healthcare organizations cannot afford prolonged system outages, and they manage highly sensitive personal and health information. Ransomware, stolen credentials, and compromised third parties can disrupt care while exposing patient data.",
    priorities: [
      "MFA for clinical, administrative, and remote access",
      "Protection of patient and personal information",
      "Endpoint security and timely patching",
      "Offline or protected backups with recovery testing",
    ],
    approach:
      "Oragrol prioritizes continuity of care and protection of sensitive information, combining security controls with recovery planning so an incident does not become an operational crisis.",
    nextStep: { label: "Talk to Oragrol About Healthcare Security", kind: "contact" },
  },
  {
    name: "Financial Services",
    risk: "Financial organizations face credential theft, phishing, fraud, data exposure, and third-party risk. A security incident can affect money movement, customer trust, regulatory obligations, and business continuity at the same time.",
    priorities: [
      "MFA and privileged access management",
      "Transaction and email fraud controls",
      "Third-party and vendor risk",
      "Incident response and operational recovery",
    ],
    approach:
      "Oragrol takes a risk-based approach that connects technical controls to business and regulatory exposure, helping financial organizations identify the gaps that matter most before an incident does it for them.",
    nextStep: { label: "Talk to Oragrol About Financial Cyber Risk", kind: "contact" },
  },
  {
    name: "Retail & E-commerce",
    risk: "Retailers combine customer information, payment systems, online stores, employee accounts, and third-party platforms. A compromised account or vulnerable system can lead to payment fraud, customer-data exposure, or a shutdown during peak trading.",
    priorities: [
      "Payment and e-commerce security",
      "MFA for administrative and cloud accounts",
      "POS, endpoint, and patch management",
      "Customer-data protection and secure backups",
    ],
    approach:
      "Oragrol focuses on protecting the systems that keep transactions moving, while reducing the account, endpoint, and third-party weaknesses that can turn a retail incident into lost revenue and customer trust.",
    nextStep: { label: "Get Your Cyber Health Score", kind: "assessment" },
  },
  {
    name: "Manufacturing",
    risk: "Manufacturers face a unique mix of business IT, production systems, connected equipment, suppliers, and remote access. Ransomware or a compromised supplier can move beyond office systems and interrupt production.",
    priorities: [
      "IT/OT network separation",
      "Secure remote and privileged access",
      "Vulnerability and patch management",
      "Backups and production recovery planning",
    ],
    approach:
      "Oragrol looks beyond the corporate network and considers how cyber risk can affect production, suppliers, and operational continuity, with controls prioritized around the systems that keep the business running.",
    nextStep: { label: "Talk to Oragrol About Manufacturing Security", kind: "contact" },
  },
  {
    name: "Technology",
    risk: "Technology companies operate in an environment where cloud infrastructure, source code, APIs, SaaS platforms, developers, and customer data are constantly connected. One compromised identity or development environment can create a much larger downstream impact.",
    priorities: [
      "Identity, MFA, and privileged access",
      "Cloud and SaaS security",
      "Secure development and vulnerability management",
      "Secrets, code, and customer-data protection",
    ],
    approach:
      "Oragrol treats security as part of the technology environment itself, focusing on identity, cloud, applications, and development workflows without slowing down the business.",
    nextStep: { label: "Talk to Oragrol About Technology Security", kind: "contact" },
  },
  {
    name: "Construction & Real Estate",
    risk: "Construction and real estate organizations often rely on distributed teams, contractors, cloud platforms, email, property systems, and financial transactions. Weak access controls or compromised email can expose contracts, banking details, and project information.",
    priorities: [
      "MFA for employees, contractors, and remote access",
      "Email security and payment-fraud protection",
      "Vendor and third-party access controls",
      "Secure document storage and backups",
    ],
    approach:
      "Oragrol focuses on the real-world business processes behind projects and transactions, securing identities, email, documents, vendors, and financial workflows without adding unnecessary friction to field operations.",
    nextStep: { label: "Get Your Cyber Health Score", kind: "assessment" },
  },
  {
    name: "Education",
    risk: "Educational organizations manage large and diverse user populations, shared systems, personal information, and remote access. Phishing, ransomware, compromised accounts, and insider mistakes can disrupt learning while exposing sensitive information.",
    priorities: [
      "MFA and identity management",
      "Email and phishing protection",
      "Endpoint security and patching",
      "Backups and incident recovery",
    ],
    approach:
      "Oragrol designs security around the realities of education: many users, varied access levels, limited resources, and the need to keep learning systems available.",
    nextStep: { label: "Talk to Oragrol About Education Security", kind: "contact" },
  },
  {
    name: "Other SMBs",
    risk: "For many SMBs, one compromised email account, exposed credential, or unpatched system can stop operations quickly. Limited internal security resources also make recovery harder when an incident occurs.",
    priorities: [
      "MFA and secure account management",
      "Email and phishing protection",
      "Endpoint protection and patching",
      "Tested backups and recovery",
    ],
    approach:
      "Oragrol helps SMBs identify the security gaps that create the greatest business risk, then prioritize practical improvements instead of overwhelming them with enterprise-level complexity.",
    nextStep: { label: "Get Your Cyber Health Score", kind: "assessment" },
  },
];
