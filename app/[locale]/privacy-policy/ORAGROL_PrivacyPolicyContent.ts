// Corrected ORAGROL Privacy Policy content — approved September 4, 2026.
// Legal entity name confirmed 2026-09-05 from the Certificate of Incorporation
// (Oragrol Global Inc., Canada Business Corporations Act) and inserted below —
// no other detail from that filing (directors, corporation number, share
// classes) is used here. Location intentionally stays city-level only
// (Thunder Bay) per direction — no street/mailing address is published.

export type PrivacyBlock =
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "table"; headers: string[]; rows: string[][] };

export type PrivacySection = { number: string; title: string; blocks: PrivacyBlock[] };

export type PrivacyPolicyContent = {
  title: string; effectiveDate: string; lastUpdated: string; subtitle: string;
  plainLanguage: PrivacyBlock[]; sections: PrivacySection[];
};

export const PRIVACY_POLICY: PrivacyPolicyContent = {
  "title": "Privacy Policy",
  "effectiveDate": "September 4, 2026",
  "lastUpdated": "September 4, 2026",
  "subtitle": "How ORAGROL Global collects, uses, stores and protects personal information.",
  "plainLanguage": [
    {
      "type": "paragraph",
      "text": "ORAGROL Global collects the business contact details and other information you choose to provide when you contact us, use live chat, define a service scope, or complete the Cyber Health Score assessment. We use that information to respond, prepare proposals, provide requested results, operate and secure our website, and manage our business relationship with you."
    },
    {
      "type": "paragraph",
      "text": "We do not sell or rent personal information. We use a limited number of service providers to operate our website, communications, customer relationship management, document generation, and workflows. Depending on the provider and its configuration, information may be processed outside Canada. You may ask what personal information we hold about you, request a correction, or withdraw consent, subject to applicable legal and contractual limits."
    }
  ],
  "sections": [
    {
      "number": "01",
      "title": "Who we are and who is accountable",
      "blocks": [
        {
          "type": "paragraph",
          "text": "ORAGROL Global (\"ORAGROL,\" \"we,\" \"us,\" or \"our\") is the operating name of Oragrol Global Inc., a Canadian managed security services and business automation provider. Our headquarters is in Thunder Bay, Ontario, and we maintain a business presence in Toronto, Ontario."
        },
        {
          "type": "paragraph",
          "text": "This policy explains how ORAGROL handles personal information collected through our website and related business communications, including contact and enquiry forms, live chat, the \"My Scope\" tool, and the Cyber Health Score assessment."
        },
        {
          "type": "paragraph",
          "text": "ORAGROL's **Privacy Officer** is responsible for our privacy practices and for responding to questions, access requests, corrections, withdrawals of consent, and complaints. Until a dedicated privacy mailbox is active, you may contact the Privacy Officer through our [Contact page](/contact) by writing **\"Privacy Request\"** at the beginning of your message."
        },
        {
          "type": "paragraph",
          "text": "ORAGROL handles personal information in accordance with the *Personal Information Protection and Electronic Documents Act* (PIPEDA) and other Canadian privacy laws that apply to a particular activity or jurisdiction."
        }
      ]
    },
    {
      "number": "02",
      "title": "Scope of this policy",
      "blocks": [
        {
          "type": "paragraph",
          "text": "This policy applies to personal information we collect:"
        },
        {
          "type": "list",
          "items": [
            "directly from you when you complete an assessment, submit a form, start a chat, define a service scope, subscribe to a communication, or otherwise contact us;",
            "automatically through the standard technologies required to operate and secure the website; and",
            "during a prospective or active business relationship with ORAGROL."
          ]
        },
        {
          "type": "paragraph",
          "text": "When you become a client, a services agreement, confidentiality agreement, data-processing addendum, or other written terms may impose additional privacy, confidentiality, security, and retention requirements. Those terms supplement this policy; they do not remove rights or obligations imposed by applicable law."
        },
        {
          "type": "paragraph",
          "text": "This policy does not govern the independent privacy practices of third-party websites or services that you visit through an external link."
        }
      ]
    },
    {
      "number": "03",
      "title": "Personal information we collect",
      "blocks": [
        {
          "type": "paragraph",
          "text": "Depending on how you interact with ORAGROL, we may collect:"
        },
        {
          "type": "list",
          "items": [
            "**Contact details:** your name, business email address, company name, role or job title, and telephone number if you choose to provide it.",
            "**Enquiry and scoping information:** your message, service interests, selected scope, business requirements, and project notes submitted through our forms, tools, or live chat.",
            "**Cyber Health Score information:** your questionnaire responses and general information about your organization, such as industry, approximate employee count, and technology platforms in use.",
            "**Communication records:** correspondence with ORAGROL and records of consent, preferences, requests, or complaints.",
            "**Technical and usage information:** IP address, browser and device type, referring page, pages requested, timestamps, security events, and standard server-log information generated when the website is used."
          ]
        },
        {
          "type": "paragraph",
          "text": "The Cyber Health Score and public website forms are not designed to receive passwords, authentication codes, private keys, payment-card numbers, government identification numbers, patient information, or information that would grant access to a system. **Do not submit those types of information through these tools.**"
        }
      ]
    },
    {
      "number": "04",
      "title": "Why we collect and use personal information",
      "blocks": [
        {
          "type": "paragraph",
          "text": "We collect and use personal information to:"
        },
        {
          "type": "list",
          "items": [
            "respond to questions, enquiries, and service requests;",
            "generate and deliver Cyber Health Score results;",
            "prepare a proposal, quotation, recommended scope, or requested document;",
            "communicate about a prospective or active business relationship;",
            "record relevant interactions in our customer relationship management system;",
            "provide communications you requested or consented to receive;",
            "operate, troubleshoot, protect, monitor, and improve our website and communication systems;",
            "prevent misuse, fraud, security threats, and unauthorized activity;",
            "establish, exercise, or defend legal claims; and",
            "meet legal, accounting, regulatory, and contractual obligations."
          ]
        },
        {
          "type": "paragraph",
          "text": "We will not use personal information for a materially different purpose without obtaining consent when required by law."
        }
      ]
    },
    {
      "number": "05",
      "title": "Consent and choices",
      "blocks": [
        {
          "type": "paragraph",
          "text": "We obtain meaningful consent where required. Consent may be express, such as selecting a checkbox, or implied where you voluntarily provide information for an obvious and limited purpose, such as submitting an enquiry so that we can reply."
        },
        {
          "type": "paragraph",
          "text": "You may withdraw consent at any time, subject to legal or contractual restrictions and reasonable notice. Withdrawing consent may prevent us from providing a requested feature or service when the information is necessary for that purpose. Instructions for contacting the Privacy Officer appear in Section 15."
        },
        {
          "type": "paragraph",
          "text": "Commercial electronic messages are sent in accordance with Canada's Anti-Spam Legislation (CASL). Where required, we obtain consent, identify ORAGROL and provide an unsubscribe mechanism. Service messages directly connected to an enquiry, assessment, transaction, or active relationship are not treated as promotional subscriptions."
        }
      ]
    },
    {
      "number": "06",
      "title": "Cyber Health Score and automated processing",
      "blocks": [
        {
          "type": "paragraph",
          "text": "The Cyber Health Score uses the answers you submit to calculate a score and risk tier and to generate prioritized recommendations. This automated process is intended to provide general business guidance and a practical starting point. It does not make a legal, employment, credit, insurance, or similarly significant decision about an individual."
        },
        {
          "type": "paragraph",
          "text": "ORAGROL personnel may review assessment results when responding to an enquiry or discussing possible services. Do not use the assessment as a substitute for a professional investigation, legal advice, regulatory advice, or an incident-response engagement."
        }
      ]
    },
    {
      "number": "07",
      "title": "Service providers and disclosures",
      "blocks": [
        {
          "type": "paragraph",
          "text": "We do not sell, rent, or trade personal information for another organization's independent marketing purposes."
        },
        {
          "type": "paragraph",
          "text": "We use service providers to perform defined functions on our behalf. The providers currently expected to support the website and related workflows include:"
        },
        {
          "type": "table",
          "headers": [
            "Provider",
            "Purpose"
          ],
          "rows": [
            [
              "HubSpot",
              "Customer relationship management and lead tracking"
            ],
            [
              "Brevo",
              "Transactional and consent-based marketing email delivery"
            ],
            [
              "Vercel",
              "Website hosting, delivery, and infrastructure logs"
            ],
            [
              "APITemplate.io",
              "Generation of Cyber Health Score report documents"
            ],
            [
              "n8n",
              "Workflow automation connecting approved business systems"
            ]
          ]
        },
        {
          "type": "paragraph",
          "text": "We limit the information disclosed to what is reasonably necessary for the assigned purpose. ORAGROL remains accountable for personal information transferred to a service provider for processing and uses contractual or other appropriate measures designed to require a comparable level of protection."
        },
        {
          "type": "paragraph",
          "text": "We may also disclose personal information:"
        },
        {
          "type": "list",
          "items": [
            "when you direct or authorize us to do so;",
            "to professional advisers who are required to protect confidentiality;",
            "in connection with a proposed financing, reorganization, merger, sale, or transfer of all or part of the business, subject to appropriate protections; or",
            "where permitted or required by law, including a valid court order, regulatory requirement, investigation, or protection of legal rights and safety."
          ]
        }
      ]
    },
    {
      "number": "08",
      "title": "Processing outside Canada",
      "blocks": [
        {
          "type": "paragraph",
          "text": "Some service providers or their subprocessors may store or process personal information outside Canada, including in the United States or other jurisdictions determined by their contracted service configuration. Information processed in another jurisdiction may be accessible to courts, law-enforcement bodies, or regulators under that jurisdiction's laws."
        },
        {
          "type": "paragraph",
          "text": "ORAGROL remains accountable under applicable Canadian privacy law for personal information transferred to a provider for processing. We assess the sensitivity of the information, limit disclosure, and use contractual or other appropriate safeguards. You may contact the Privacy Officer for available information about relevant service providers and processing locations."
        }
      ]
    },
    {
      "number": "09",
      "title": "Retention and disposal",
      "blocks": [
        {
          "type": "paragraph",
          "text": "We keep personal information only for as long as it is reasonably required for the identified purpose, an active or reasonably anticipated business relationship, and applicable legal, accounting, regulatory, contractual, security, or dispute-resolution requirements."
        },
        {
          "type": "paragraph",
          "text": "Retention is determined using criteria that include:"
        },
        {
          "type": "list",
          "items": [
            "whether an enquiry, assessment, proposal, or client relationship remains active;",
            "whether the information is needed to provide a requested result or follow-up;",
            "the sensitivity and volume of the information;",
            "legal limitation periods and record-keeping obligations;",
            "unresolved requests, disputes, complaints, investigations, or security matters; and",
            "whether continued retention creates an unnecessary privacy or security risk."
          ]
        },
        {
          "type": "paragraph",
          "text": "When information is no longer required, we securely delete, erase, or anonymize it in accordance with our retention procedures and the technical capabilities of the relevant system. Backup copies may remain for a limited period until they are overwritten or securely retired. Records of security-safeguard breaches are retained for at least 24 months as required by PIPEDA regulations and may be retained longer where another legal obligation applies."
        }
      ]
    },
    {
      "number": "10",
      "title": "Access, correction, and other privacy requests",
      "blocks": [
        {
          "type": "paragraph",
          "text": "Subject to applicable legal exceptions, you may:"
        },
        {
          "type": "list",
          "items": [
            "ask whether ORAGROL holds personal information about you;",
            "request access to that information and an account of its use or disclosure;",
            "request correction of information that is inaccurate or incomplete;",
            "withdraw consent to future collection, use, or disclosure where consent is the applicable basis; and",
            "request deletion of information that ORAGROL is no longer required or permitted to retain."
          ]
        },
        {
          "type": "paragraph",
          "text": "Submit a written request to the Privacy Officer as described in Section 15. We may ask for information reasonably necessary to verify your identity and locate the relevant records. We will use that verification information only for the request."
        },
        {
          "type": "paragraph",
          "text": "We will respond to an access request within 30 calendar days unless an extension is permitted by law. If an extension is required, we will notify you within the initial 30-day period and explain the reason. If access must be refused in whole or in part, we will explain the applicable reason unless the law prevents us from doing so."
        }
      ]
    },
    {
      "number": "11",
      "title": "Safeguards and privacy breaches",
      "blocks": [
        {
          "type": "paragraph",
          "text": "We use administrative, technical, and physical safeguards appropriate to the sensitivity, amount, format, location, and use of the information. These measures may include access restrictions, authentication controls, secure transmission, system monitoring, provider review, staff procedures, and secure disposal."
        },
        {
          "type": "paragraph",
          "text": "No method of transmission or storage is completely secure, and we cannot guarantee absolute security. If a breach of security safeguards creates a real risk of significant harm, ORAGROL will report the breach to the Office of the Privacy Commissioner of Canada and notify affected individuals as required by law. We will also notify another organization or government institution when required to reduce or mitigate the risk of harm."
        }
      ]
    },
    {
      "number": "12",
      "title": "Cookies and similar website technologies",
      "blocks": [
        {
          "type": "paragraph",
          "text": "The website may use technologies that are strictly necessary to deliver pages, maintain security, balance traffic, remember a requested setting, or support a feature you choose to use. Standard server logs may be generated even when no browser cookie is stored."
        },
        {
          "type": "paragraph",
          "text": "ORAGROL does not currently use third-party advertising cookies or non-essential analytics cookies. If that practice changes, we will update this policy and implement an appropriate consent mechanism before setting non-essential cookies where required."
        },
        {
          "type": "paragraph",
          "text": "Browser settings may allow you to block or delete cookies. Blocking a strictly necessary technology may prevent part of the website from functioning correctly."
        }
      ]
    },
    {
      "number": "13",
      "title": "Children's privacy",
      "blocks": [
        {
          "type": "paragraph",
          "text": "ORAGROL's website and services are intended for businesses and business professionals, not children. We do not knowingly solicit personal information from children. If we learn that a child provided personal information without appropriate consent, we will take reasonable steps to delete it."
        }
      ]
    },
    {
      "number": "14",
      "title": "Changes to this policy",
      "blocks": [
        {
          "type": "paragraph",
          "text": "We may update this policy when our practices, services, providers, or legal obligations change. The \"Last updated\" date identifies the latest revision. When a change is material, we will provide notice appropriate to the nature and impact of the change and obtain consent where required."
        }
      ]
    },
    {
      "number": "15",
      "title": "Contact and complaints",
      "blocks": [
        {
          "type": "paragraph",
          "text": "Questions, access requests, correction requests, withdrawals of consent, and privacy complaints should be directed to:"
        },
        {
          "type": "paragraph",
          "text": "**Privacy Officer — ORAGROL Global** Thunder Bay, Ontario, Canada [Contact the Privacy Officer](/contact) — begin the message with **\"Privacy Request\"**"
        },
        {
          "type": "paragraph",
          "text": "We will investigate privacy complaints and explain the outcome and any corrective action that is appropriate. If you are not satisfied with our response, you may contact the [Office of the Privacy Commissioner of Canada](https://www.priv.gc.ca/) and ask about filing a complaint."
        }
      ]
    }
  ]
};
