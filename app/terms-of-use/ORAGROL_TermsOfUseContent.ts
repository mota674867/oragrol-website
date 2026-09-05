// Corrected ORAGROL Terms of Use content — approved September 5, 2026.
// Legal entity name confirmed 2026-09-05 from the Certificate of Incorporation
// (Oragrol Global Inc., Canada Business Corporations Act) and inserted below --
// same fact, same source, same minimal treatment as Privacy Policy Section 01.
// Location intentionally stays city-level only (Thunder Bay / Toronto) -- no
// street address is published anywhere on this page.

export type TermsBlock =
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] };

export type TermsSection = {
  number: string;
  title: string;
  blocks: TermsBlock[];
};

export type TermsOfUseContent = {
  title: string;
  subtitle: string;
  effectiveDate: string;
  lastUpdated: string;
  plainLanguage: TermsBlock[];
  sections: TermsSection[];
};

export const TERMS_OF_USE: TermsOfUseContent = {
  title: "Terms of Use",
  subtitle: "The terms governing access to and use of the ORAGROL Global website.",
  effectiveDate: "September 5, 2026",
  lastUpdated: "September 5, 2026",
  plainLanguage: [
    {
      type: "paragraph",
      text: "These Terms govern your use of the public ORAGROL Global website. They do not govern a paid cybersecurity, automation, consulting, or managed-services engagement. Client work begins only under a separate written agreement that defines the scope, responsibilities, fees, deliverables, confidentiality obligations, security requirements, and liability terms for that engagement.",
    },
    {
      type: "paragraph",
      text: "Use the website lawfully and responsibly. Do not attempt to access systems without authorization, interfere with the website, misuse its content, or submit information you do not have the right to share. Website content and Cyber Health Score results provide general information and are not a substitute for a professional assessment of your environment.",
    },
  ],
  sections: [
    {
      number: "01",
      title: "Acceptance of these Terms",
      blocks: [
        {
          type: "paragraph",
          text: "These Terms of Use (the \"Terms\") govern access to and use of the ORAGROL Global website and its public features (collectively, the \"Site\"). ORAGROL Global is the operating name of Oragrol Global Inc. and is referred to in these Terms as \"ORAGROL,\" \"we,\" \"us,\" or \"our.\"",
        },
        {
          type: "paragraph",
          text: "By accessing or using the Site, you agree to these Terms. If you do not agree, do not use the Site. Nothing in these Terms requires you to purchase a service from ORAGROL.",
        },
      ],
    },
    {
      number: "02",
      title: "Purpose and scope",
      blocks: [
        {
          type: "paragraph",
          text: "The Site is intended to provide information about ORAGROL's cybersecurity, business automation, OR ONE, Cyber Health Score, resources, and related services. These Terms govern the public Site only.",
        },
        {
          type: "paragraph",
          text: "A proposal, statement of work, master services agreement, data-processing addendum, confidentiality agreement, or other signed client contract is separate from these Terms. If you become a client, the signed agreement governs the engagement and controls in relation to its subject matter.",
        },
      ],
    },
    {
      number: "03",
      title: "Business use and authority",
      blocks: [
        {
          type: "paragraph",
          text: "The Site is primarily directed to business owners, operators, and decision-makers evaluating services for legitimate business purposes.",
        },
        {
          type: "paragraph",
          text: "If you submit information on behalf of an organization, you confirm that you are authorized to provide that information and request the relevant communication or assessment. Simply browsing the Site does not, by itself, mean that you have authority to enter a service contract on behalf of an organization.",
        },
      ],
    },
    {
      number: "04",
      title: "Acceptable use",
      blocks: [
        { type: "paragraph", text: "You must not:" },
        {
          type: "list",
          items: [
            "attempt to obtain unauthorized access to the Site, an account, data, infrastructure, or connected system;",
            "conduct vulnerability scanning, penetration testing, automated probing, or similar security testing without ORAGROL's prior written authorization;",
            "interfere with the availability, integrity, performance, or security of the Site;",
            "use scraping, automation, or excessive requests in a way that disrupts the Site or circumvents reasonable technical controls;",
            "introduce malware, harmful code, or malicious content;",
            "misrepresent your identity, authority, affiliation, or intentions;",
            "impersonate ORAGROL, its personnel, or another person or organization;",
            "submit information that is false, misleading, unlawful, malicious, or that you do not have the right to disclose;",
            "use Site content to create a misleading impression of endorsement, partnership, certification, or affiliation; or",
            "use the Site or its content for an unlawful purpose.",
          ],
        },
        {
          type: "paragraph",
          text: "We may restrict or block access where we reasonably believe it is necessary to protect the Site, ORAGROL, users, clients, providers, or others.",
        },
        {
          type: "paragraph",
          text: "If you believe you have found a genuine security vulnerability, do not exploit it or access data that is not yours. Report it through our [Contact page](/contact) and begin the message with **\"Security Report.\"**",
        },
      ],
    },
    {
      number: "05",
      title: "General information and Cyber Health Score",
      blocks: [
        {
          type: "paragraph",
          text: "The Site and its resources are provided for general informational and educational purposes. They are not legal, regulatory, insurance, financial, accounting, or professional cybersecurity advice.",
        },
        {
          type: "paragraph",
          text: "The Cyber Health Score is an illustrative, self-reported assessment based on the answers you provide. It is not a technical audit, penetration test, vulnerability assessment, certification, guarantee, or professional examination of your systems. Results may be incomplete or inaccurate if submitted information is incomplete, inaccurate, outdated, or misunderstood.",
        },
        {
          type: "paragraph",
          text: "Using the Site, submitting an enquiry, or receiving a Cyber Health Score does not create an advisory, fiduciary, consulting, managed-services, or client relationship. A professional engagement begins only when the parties sign an applicable written agreement.",
        },
        {
          type: "paragraph",
          text: "Do not delay urgent incident response or professional advice because of information presented on the Site. If you believe a cyber incident is occurring, use your established incident-response process and contact appropriate qualified assistance.",
        },
      ],
    },
    {
      number: "06",
      title: "Intellectual property",
      blocks: [
        {
          type: "paragraph",
          text: "Unless otherwise stated, the Site and its original content, visual design, graphics, service descriptions, assessments, and branding are owned by or licensed to ORAGROL and are protected by applicable intellectual-property laws. ORAGROL, ORAGROL Global, and OR ONE names and branding may not be used in a way that suggests authorization, endorsement, or affiliation without prior written permission.",
        },
        {
          type: "paragraph",
          text: "You may view, download, or print Site content for your own lawful, non-commercial, internal business reference. You must not reproduce, publish, distribute, sell, license, modify, publicly display, create derivative commercial materials from, or systematically extract Site content without prior written permission, except where applicable law permits otherwise.",
        },
        { type: "paragraph", text: "Third-party names, marks, and content remain the property of their respective owners." },
      ],
    },
    {
      number: "07",
      title: "Third-party links and services",
      blocks: [
        {
          type: "paragraph",
          text: "The Site may link to or use third-party websites, tools, platforms, or services. A link does not necessarily mean that ORAGROL endorses the third party or its content.",
        },
        {
          type: "paragraph",
          text: "ORAGROL does not control independent third-party services and is not responsible for their content, availability, security, or privacy practices. Your use of an external service is governed by that provider's terms and policies. Our handling of personal information is described in our [Privacy Policy](/privacy-policy).",
        },
      ],
    },
    {
      number: "08",
      title: "Information you submit",
      blocks: [
        { type: "paragraph", text: "You remain responsible for information you submit through the Site and for ensuring that you have the right and authority to provide it." },
        {
          type: "paragraph",
          text: "You permit ORAGROL and its authorized service providers to collect, use, store, and process submitted information only as reasonably necessary to respond to your request, provide the selected Site feature, operate and secure the Site, manage the prospective business relationship, and fulfil the purposes described in our [Privacy Policy](/privacy-policy).",
        },
        {
          type: "paragraph",
          text: "Do not submit passwords, authentication codes, private keys, payment-card numbers, government identification numbers, patient information, or credentials that could provide access to a system through public Site forms, live chat, the My Scope tool, or the Cyber Health Score.",
        },
      ],
    },
    {
      number: "09",
      title: "Site availability and security",
      blocks: [
        {
          type: "paragraph",
          text: "We may modify, suspend, restrict, or discontinue all or part of the Site for maintenance, security, operational, legal, or business reasons. We do not guarantee that every feature or item of content will remain available.",
        },
        {
          type: "paragraph",
          text: "Although we use reasonable safeguards appropriate to the Site, no internet service can be guaranteed completely secure, uninterrupted, or free from harmful components. You are responsible for using appropriate device, browser, account, and network security when accessing the Site.",
        },
      ],
    },
    {
      number: "10",
      title: "No warranties",
      blocks: [
        {
          type: "paragraph",
          text: "To the fullest extent permitted by applicable law, the Site and its content are provided **\"as is\"** and **\"as available.\"** ORAGROL disclaims warranties and conditions of every kind, whether express, implied, statutory, or collateral, including merchantability, fitness for a particular purpose, non-infringement, accuracy, completeness, availability, and security.",
        },
        {
          type: "paragraph",
          text: "We do not warrant that the Site will be uninterrupted, error-free, current at all times, or suitable for a particular business decision. Some jurisdictions do not allow particular warranty exclusions, so some exclusions may not apply to you.",
        },
      ],
    },
    {
      number: "11",
      title: "Limitation of liability",
      blocks: [
        {
          type: "paragraph",
          text: "To the fullest extent permitted by applicable law, ORAGROL and its directors, officers, employees, contractors, and Site service providers will not be liable for indirect, incidental, special, consequential, exemplary, or punitive damages, or for loss of profit, revenue, opportunity, goodwill, business interruption, or data, arising from or relating to the Site or your use of or inability to use it.",
        },
        {
          type: "paragraph",
          text: "Nothing in these Terms excludes or limits liability that cannot lawfully be excluded or limited. Liability arising under a signed client agreement is governed by that agreement, not by this Section.",
        },
      ],
    },
    {
      number: "12",
      title: "Indemnification",
      blocks: [
        {
          type: "paragraph",
          text: "To the extent permitted by law, you agree to indemnify ORAGROL against third-party claims, damages, and reasonable costs to the extent directly caused by your unlawful misuse of the Site, deliberate infringement of another person's rights through the Site, or material violation of Section 4.",
        },
        {
          type: "paragraph",
          text: "This obligation does not apply to the extent a claim was caused by ORAGROL's own conduct, and it does not expand or replace any indemnity negotiated in a signed client agreement.",
        },
      ],
    },
    {
      number: "13",
      title: "Governing law, disputes, and severability",
      blocks: [
        {
          type: "paragraph",
          text: "These Terms are governed by the laws of Ontario and the federal laws of Canada applicable in Ontario, without regard to conflict-of-law rules. Subject to any mandatory rights or jurisdiction that applicable law does not allow the parties to exclude, disputes concerning the Site or these Terms will be brought before the courts located in Ontario.",
        },
        {
          type: "paragraph",
          text: "Before starting a formal proceeding, we encourage you to contact ORAGROL through our [Contact page](/contact) so the matter can be considered and, where possible, resolved informally.",
        },
        {
          type: "paragraph",
          text: "If a provision of these Terms is held invalid, illegal, or unenforceable, it will be limited or removed only to the minimum extent necessary. The remaining provisions will continue in effect.",
        },
      ],
    },
    {
      number: "14",
      title: "Changes to these Terms",
      blocks: [
        {
          type: "paragraph",
          text: "We may update these Terms to reflect changes to the Site, our practices, or applicable requirements. The \"Last updated\" date identifies the latest version.",
        },
        {
          type: "paragraph",
          text: "Material changes will be communicated through a notice appropriate to the nature of the change. Updated Terms apply from the stated effective date. Your continued use of the Site after that date constitutes acceptance of the updated Terms. If you do not agree with an update, stop using the Site.",
        },
      ],
    },
    {
      number: "15",
      title: "Contact",
      blocks: [
        {
          type: "paragraph",
          text: "Questions about these Terms should be submitted through our [Contact page](/contact). Begin the message with **\"Legal Enquiry.\"**",
        },
        {
          type: "paragraph",
          text: "**ORAGROL Global**  \nThunder Bay, Ontario, Canada  \nBusiness presence: Toronto, Ontario, Canada",
        },
      ],
    },
  ],
};
