// Corrected ORAGROL Privacy Policy content — approved September 4, 2026.
// Legal entity name confirmed 2026-09-05 from the Certificate of Incorporation
// (Oragrol Global Inc., Canada Business Corporations Act) and inserted below —
// no other detail from that filing (directors, corporation number, share
// classes) is used here. Location intentionally stays city-level only
// (Thunder Bay) per direction — no street/mailing address is published.
//
// Bilingual (Phase 2l, ORAGROL_Legal_Pages_FR_Translation.md): added a full
// French counterpart (PRIVACY_POLICY_FR) rather than routing this through
// messages/{en,fr}.json like other pages. This content is a single
// structured legal document (paragraph/list/table blocks with inline
// markdown), not a set of independent UI strings — keeping each language's
// full text as one reviewable object here (same pattern as the original
// English-only file) is both easier to hand to a lawyer for review later
// (the translation doc's own explicit caveat: AI-translated legal text
// needs a real legal/translation pass before being treated as binding,
// especially given Quebec's Bill 96) and avoids forcing table/list block
// structures into flat i18n message keys. `getPrivacyPolicy(locale)` is the
// single selector page.tsx uses.

export type PrivacyBlock =
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "table"; headers: string[]; rows: string[][] };

export type PrivacySection = { number: string; title: string; blocks: PrivacyBlock[] };

export type PrivacyPolicyContent = {
  title: string; effectiveDate: string; lastUpdated: string; subtitle: string;
  plainLanguage: PrivacyBlock[]; sections: PrivacySection[];
};

export const PRIVACY_POLICY_EN: PrivacyPolicyContent = {
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

// French counterpart — ORAGROL_Legal_Pages_FR_Translation.md. Legal-register
// French (formal, precise — matching Canadian contract/statute conventions,
// not conversational French), following that doc's terminology choices:
// PIPEDA -> LPRPDE, "Office of the Privacy Commissioner of Canada" ->
// "Commissariat à la protection de la vie privée du Canada (CPVP)" first use
// spelled out, brand marks (ORAGROL, OR ONE, Cyber Health Score, "My Scope")
// stay English. NEEDS A REAL LEGAL/TRANSLATION REVIEW before being treated
// as the binding French version (see file header + the doc's own caveat,
// especially re: Quebec's Bill 96 requirements) — flagged, not silently
// resolved.
export const PRIVACY_POLICY_FR: PrivacyPolicyContent = {
  "title": "Politique de confidentialité",
  "effectiveDate": "4 septembre 2026",
  "lastUpdated": "4 septembre 2026",
  "subtitle": "Comment ORAGROL Global recueille, utilise, conserve et protège les renseignements personnels.",
  "plainLanguage": [
    {
      "type": "paragraph",
      "text": "ORAGROL Global recueille les coordonnées professionnelles et d'autres renseignements que vous choisissez de fournir lorsque vous nous contactez, utilisez le clavardage en direct, définissez la portée d'un service ou remplissez l'évaluation Cyber Health Score. Nous utilisons ces renseignements pour répondre à vos demandes, préparer des propositions, fournir les résultats demandés, exploiter et sécuriser notre site Web, et gérer notre relation d'affaires avec vous."
    },
    {
      "type": "paragraph",
      "text": "Nous ne vendons ni ne louons de renseignements personnels. Nous faisons appel à un nombre limité de fournisseurs de services pour exploiter notre site Web, nos communications, notre gestion de la relation client, la génération de documents et nos flux de travail. Selon le fournisseur et sa configuration, les renseignements peuvent être traités à l'extérieur du Canada. Vous pouvez demander quels renseignements personnels nous détenons à votre sujet, demander une correction ou retirer votre consentement, sous réserve des limites légales et contractuelles applicables."
    }
  ],
  "sections": [
    {
      "number": "01",
      "title": "Qui nous sommes et qui est responsable",
      "blocks": [
        {
          "type": "paragraph",
          "text": "ORAGROL Global (« ORAGROL », « nous », « notre » ou « nos ») est le nom commercial d'Oragrol Global Inc., un fournisseur canadien de services de sécurité gérés et d'automatisation d'affaires. Notre siège social se trouve à Thunder Bay, en Ontario, et nous maintenons une présence d'affaires à Toronto, en Ontario."
        },
        {
          "type": "paragraph",
          "text": "Cette politique explique comment ORAGROL traite les renseignements personnels recueillis par l'entremise de notre site Web et de nos communications d'affaires connexes, y compris les formulaires de contact et de demande de renseignements, le clavardage en direct, l'outil « My Scope » et l'évaluation Cyber Health Score."
        },
        {
          "type": "paragraph",
          "text": "Le **responsable de la protection de la vie privée** d'ORAGROL est chargé de nos pratiques en matière de protection de la vie privée et de répondre aux questions, aux demandes d'accès, aux corrections, aux retraits de consentement et aux plaintes. Jusqu'à ce qu'une boîte de messagerie dédiée à la protection de la vie privée soit active, vous pouvez contacter le responsable de la protection de la vie privée par l'entremise de notre [page Contact](/contact) en inscrivant **« Demande relative à la vie privée »** au début de votre message."
        },
        {
          "type": "paragraph",
          "text": "ORAGROL traite les renseignements personnels conformément à la *Loi sur la protection des renseignements personnels et les documents électroniques* (LPRPDE) et aux autres lois canadiennes sur la protection de la vie privée applicables à une activité ou un territoire donné."
        }
      ]
    },
    {
      "number": "02",
      "title": "Portée de cette politique",
      "blocks": [
        {
          "type": "paragraph",
          "text": "Cette politique s'applique aux renseignements personnels que nous recueillons :"
        },
        {
          "type": "list",
          "items": [
            "directement auprès de vous lorsque vous remplissez une évaluation, soumettez un formulaire, entamez un clavardage, définissez la portée d'un service, vous abonnez à une communication ou nous contactez autrement;",
            "automatiquement par l'entremise des technologies standards requises pour exploiter et sécuriser le site Web; et",
            "pendant une relation d'affaires éventuelle ou active avec ORAGROL."
          ]
        },
        {
          "type": "paragraph",
          "text": "Lorsque vous devenez client, une entente de services, une entente de confidentialité, une annexe de traitement des données ou d'autres modalités écrites peuvent imposer des exigences supplémentaires en matière de confidentialité, de sécurité et de conservation. Ces modalités s'ajoutent à cette politique; elles ne retirent pas les droits ou obligations imposés par la loi applicable."
        },
        {
          "type": "paragraph",
          "text": "Cette politique ne régit pas les pratiques indépendantes de protection de la vie privée des sites Web ou services tiers que vous visitez par l'entremise d'un lien externe."
        }
      ]
    },
    {
      "number": "03",
      "title": "Renseignements personnels que nous recueillons",
      "blocks": [
        {
          "type": "paragraph",
          "text": "Selon la façon dont vous interagissez avec ORAGROL, nous pouvons recueillir :"
        },
        {
          "type": "list",
          "items": [
            "**Coordonnées :** votre nom, votre adresse courriel professionnelle, le nom de votre entreprise, votre rôle ou titre de poste, et votre numéro de téléphone si vous choisissez de le fournir.",
            "**Renseignements de demande et de cadrage :** votre message, vos intérêts de service, la portée sélectionnée, vos besoins d'affaires et vos notes de projet soumis par l'entremise de nos formulaires, outils ou clavardage en direct.",
            "**Renseignements du Cyber Health Score :** vos réponses au questionnaire et des renseignements généraux sur votre organisation, comme le secteur d'activité, le nombre approximatif d'employés et les plateformes technologiques utilisées.",
            "**Dossiers de communication :** correspondance avec ORAGROL et dossiers de consentement, préférences, demandes ou plaintes.",
            "**Renseignements techniques et d'utilisation :** adresse IP, type de navigateur et d'appareil, page de référence, pages demandées, horodatages, événements de sécurité et renseignements standards des journaux de serveur générés lors de l'utilisation du site Web."
          ]
        },
        {
          "type": "paragraph",
          "text": "Le Cyber Health Score et les formulaires publics du site Web ne sont pas conçus pour recevoir des mots de passe, des codes d'authentification, des clés privées, des numéros de carte de paiement, des numéros d'identification gouvernementaux, des renseignements sur des patients ou des renseignements permettant l'accès à un système. **Ne soumettez pas ce type de renseignements par l'entremise de ces outils.**"
        }
      ]
    },
    {
      "number": "04",
      "title": "Pourquoi nous recueillons et utilisons les renseignements personnels",
      "blocks": [
        {
          "type": "paragraph",
          "text": "Nous recueillons et utilisons les renseignements personnels pour :"
        },
        {
          "type": "list",
          "items": [
            "répondre aux questions, demandes de renseignements et demandes de services;",
            "générer et livrer les résultats du Cyber Health Score;",
            "préparer une proposition, un devis, une portée recommandée ou un document demandé;",
            "communiquer au sujet d'une relation d'affaires éventuelle ou active;",
            "consigner les interactions pertinentes dans notre système de gestion de la relation client;",
            "fournir les communications que vous avez demandées ou pour lesquelles vous avez consenti;",
            "exploiter, dépanner, protéger, surveiller et améliorer notre site Web et nos systèmes de communication;",
            "prévenir les utilisations abusives, la fraude, les menaces à la sécurité et les activités non autorisées;",
            "établir, exercer ou défendre des recours juridiques; et",
            "respecter les obligations légales, comptables, réglementaires et contractuelles."
          ]
        },
        {
          "type": "paragraph",
          "text": "Nous n'utiliserons pas les renseignements personnels à une fin substantiellement différente sans obtenir de consentement lorsque la loi l'exige."
        }
      ]
    },
    {
      "number": "05",
      "title": "Consentement et choix",
      "blocks": [
        {
          "type": "paragraph",
          "text": "Nous obtenons un consentement valable lorsque requis. Le consentement peut être exprès, comme cocher une case, ou implicite lorsque vous fournissez volontairement des renseignements à une fin évidente et limitée, comme soumettre une demande de renseignements afin que nous puissions y répondre."
        },
        {
          "type": "paragraph",
          "text": "Vous pouvez retirer votre consentement en tout temps, sous réserve des restrictions légales ou contractuelles et d'un préavis raisonnable. Le retrait du consentement peut nous empêcher de fournir une fonctionnalité ou un service demandé lorsque les renseignements sont nécessaires à cette fin. Les instructions pour contacter le responsable de la protection de la vie privée figurent à la section 15."
        },
        {
          "type": "paragraph",
          "text": "Les messages électroniques commerciaux sont envoyés conformément à la Loi canadienne anti-pourriel (LCAP). Lorsque requis, nous obtenons le consentement, identifions ORAGROL et fournissons un mécanisme de désabonnement. Les messages de service directement liés à une demande, une évaluation, une transaction ou une relation active ne sont pas traités comme des abonnements promotionnels."
        }
      ]
    },
    {
      "number": "06",
      "title": "Cyber Health Score et traitement automatisé",
      "blocks": [
        {
          "type": "paragraph",
          "text": "Le Cyber Health Score utilise les réponses que vous soumettez pour calculer un pointage et un niveau de risque, et pour générer des recommandations priorisées. Ce processus automatisé vise à fournir des conseils d'affaires généraux et un point de départ concret. Il ne prend aucune décision juridique, d'emploi, de crédit, d'assurance ou autre décision significative similaire à l'égard d'une personne."
        },
        {
          "type": "paragraph",
          "text": "Le personnel d'ORAGROL peut consulter les résultats de l'évaluation en répondant à une demande de renseignements ou en discutant de services possibles. N'utilisez pas l'évaluation comme substitut à une enquête professionnelle, un avis juridique, un avis réglementaire ou un mandat de réponse à un incident."
        }
      ]
    },
    {
      "number": "07",
      "title": "Fournisseurs de services et divulgations",
      "blocks": [
        {
          "type": "paragraph",
          "text": "Nous ne vendons, ne louons ni n'échangeons de renseignements personnels aux fins de marketing indépendant d'une autre organisation."
        },
        {
          "type": "paragraph",
          "text": "Nous faisons appel à des fournisseurs de services pour exécuter des fonctions définies en notre nom. Les fournisseurs actuellement prévus pour soutenir le site Web et les flux de travail connexes comprennent :"
        },
        {
          "type": "table",
          "headers": [
            "Fournisseur",
            "Fin"
          ],
          "rows": [
            [
              "HubSpot",
              "Gestion de la relation client et suivi des prospects"
            ],
            [
              "Brevo",
              "Envoi de courriels transactionnels et de marketing fondés sur le consentement"
            ],
            [
              "Vercel",
              "Hébergement du site Web, livraison et journaux d'infrastructure"
            ],
            [
              "APITemplate.io",
              "Génération des documents de rapport du Cyber Health Score"
            ],
            [
              "n8n",
              "Automatisation des flux de travail reliant les systèmes d'affaires approuvés"
            ]
          ]
        },
        {
          "type": "paragraph",
          "text": "Nous limitons les renseignements divulgués à ce qui est raisonnablement nécessaire à la fin assignée. ORAGROL demeure responsable des renseignements personnels transférés à un fournisseur de services aux fins de traitement et utilise des mesures contractuelles ou autres mesures appropriées conçues pour exiger un niveau de protection comparable."
        },
        {
          "type": "paragraph",
          "text": "Nous pouvons également divulguer des renseignements personnels :"
        },
        {
          "type": "list",
          "items": [
            "lorsque vous nous en donnez la directive ou l'autorisation;",
            "à des conseillers professionnels tenus de protéger la confidentialité;",
            "dans le cadre d'un financement, d'une réorganisation, d'une fusion, d'une vente ou d'un transfert proposé de tout ou partie de l'entreprise, sous réserve de protections appropriées; ou",
            "lorsque la loi le permet ou l'exige, y compris une ordonnance judiciaire valide, une exigence réglementaire, une enquête ou la protection de droits juridiques et de la sécurité."
          ]
        }
      ]
    },
    {
      "number": "08",
      "title": "Traitement à l'extérieur du Canada",
      "blocks": [
        {
          "type": "paragraph",
          "text": "Certains fournisseurs de services ou leurs sous-traitants peuvent stocker ou traiter des renseignements personnels à l'extérieur du Canada, y compris aux États-Unis ou dans d'autres territoires déterminés par la configuration de leur service contracté. Les renseignements traités dans un autre territoire peuvent être accessibles aux tribunaux, aux organismes d'application de la loi ou aux organismes de réglementation en vertu des lois de ce territoire."
        },
        {
          "type": "paragraph",
          "text": "ORAGROL demeure responsable en vertu de la loi canadienne applicable en matière de protection de la vie privée des renseignements personnels transférés à un fournisseur aux fins de traitement. Nous évaluons la sensibilité des renseignements, limitons la divulgation et utilisons des mesures de protection contractuelles ou autres mesures appropriées. Vous pouvez contacter le responsable de la protection de la vie privée pour obtenir les renseignements disponibles sur les fournisseurs de services pertinents et les lieux de traitement."
        }
      ]
    },
    {
      "number": "09",
      "title": "Conservation et destruction",
      "blocks": [
        {
          "type": "paragraph",
          "text": "Nous conservons les renseignements personnels seulement aussi longtemps que raisonnablement nécessaire à la fin identifiée, à une relation d'affaires active ou raisonnablement anticipée, et aux exigences légales, comptables, réglementaires, contractuelles, de sécurité ou de résolution de différends applicables."
        },
        {
          "type": "paragraph",
          "text": "La conservation est déterminée à l'aide de critères comprenant :"
        },
        {
          "type": "list",
          "items": [
            "si une demande, une évaluation, une proposition ou une relation client demeure active;",
            "si les renseignements sont nécessaires pour fournir un résultat demandé ou un suivi;",
            "la sensibilité et le volume des renseignements;",
            "les délais de prescription légaux et les obligations de tenue de dossiers;",
            "les demandes, différends, plaintes, enquêtes ou questions de sécurité non résolus; et",
            "si la conservation continue crée un risque inutile pour la vie privée ou la sécurité."
          ]
        },
        {
          "type": "paragraph",
          "text": "Lorsque les renseignements ne sont plus requis, nous les supprimons, les effaçons ou les anonymisons de façon sécuritaire conformément à nos procédures de conservation et aux capacités techniques du système concerné. Les copies de sauvegarde peuvent demeurer pendant une période limitée jusqu'à ce qu'elles soient écrasées ou retirées de façon sécuritaire. Les dossiers relatifs aux atteintes aux mesures de sécurité sont conservés pendant au moins 24 mois, comme l'exige le règlement de la LPRPDE, et peuvent être conservés plus longtemps lorsqu'une autre obligation légale s'applique."
        }
      ]
    },
    {
      "number": "10",
      "title": "Accès, correction et autres demandes relatives à la vie privée",
      "blocks": [
        {
          "type": "paragraph",
          "text": "Sous réserve des exceptions légales applicables, vous pouvez :"
        },
        {
          "type": "list",
          "items": [
            "demander si ORAGROL détient des renseignements personnels à votre sujet;",
            "demander l'accès à ces renseignements et un compte rendu de leur utilisation ou divulgation;",
            "demander la correction de renseignements inexacts ou incomplets;",
            "retirer votre consentement à la collecte, à l'utilisation ou à la divulgation future lorsque le consentement est le fondement applicable; et",
            "demander la suppression de renseignements qu'ORAGROL n'est plus tenu ni autorisé à conserver."
          ]
        },
        {
          "type": "paragraph",
          "text": "Soumettez une demande écrite au responsable de la protection de la vie privée, comme décrit à la section 15. Nous pouvons demander des renseignements raisonnablement nécessaires pour vérifier votre identité et localiser les dossiers pertinents. Nous n'utiliserons ces renseignements de vérification qu'aux fins de la demande."
        },
        {
          "type": "paragraph",
          "text": "Nous répondrons à une demande d'accès dans les 30 jours civils, sauf si une prolongation est permise par la loi. Si une prolongation est nécessaire, nous vous en aviserons dans le délai initial de 30 jours et en expliquerons la raison. Si l'accès doit être refusé en tout ou en partie, nous expliquerons la raison applicable, sauf si la loi nous empêche de le faire."
        }
      ]
    },
    {
      "number": "11",
      "title": "Mesures de sécurité et atteintes à la vie privée",
      "blocks": [
        {
          "type": "paragraph",
          "text": "Nous utilisons des mesures de sécurité administratives, techniques et physiques adaptées à la sensibilité, à la quantité, au format, à l'emplacement et à l'utilisation des renseignements. Ces mesures peuvent comprendre des restrictions d'accès, des contrôles d'authentification, une transmission sécurisée, une surveillance des systèmes, une révision des fournisseurs, des procédures pour le personnel et une destruction sécuritaire."
        },
        {
          "type": "paragraph",
          "text": "Aucune méthode de transmission ou de stockage n'est entièrement sécuritaire, et nous ne pouvons garantir une sécurité absolue. Si une atteinte aux mesures de sécurité présente un risque réel de préjudice grave, ORAGROL signalera l'atteinte au Commissariat à la protection de la vie privée du Canada et avisera les personnes touchées, comme l'exige la loi. Nous aviserons également une autre organisation ou institution gouvernementale lorsque cela est requis pour réduire ou atténuer le risque de préjudice."
        }
      ]
    },
    {
      "number": "12",
      "title": "Témoins et technologies similaires du site Web",
      "blocks": [
        {
          "type": "paragraph",
          "text": "Le site Web peut utiliser des technologies strictement nécessaires pour livrer les pages, maintenir la sécurité, répartir le trafic, mémoriser un paramètre demandé ou soutenir une fonctionnalité que vous choisissez d'utiliser. Des journaux de serveur standards peuvent être générés même lorsqu'aucun témoin de navigateur n'est stocké."
        },
        {
          "type": "paragraph",
          "text": "ORAGROL n'utilise actuellement aucun témoin publicitaire tiers ni témoin analytique non essentiel. Si cette pratique change, nous mettrons à jour cette politique et mettrons en place un mécanisme de consentement approprié avant d'installer des témoins non essentiels lorsque requis."
        },
        {
          "type": "paragraph",
          "text": "Les paramètres du navigateur peuvent vous permettre de bloquer ou de supprimer les témoins. Le blocage d'une technologie strictement nécessaire peut empêcher certaines parties du site Web de fonctionner correctement."
        }
      ]
    },
    {
      "number": "13",
      "title": "Protection de la vie privée des enfants",
      "blocks": [
        {
          "type": "paragraph",
          "text": "Le site Web et les services d'ORAGROL sont destinés aux entreprises et aux professionnels d'affaires, et non aux enfants. Nous ne sollicitons pas sciemment de renseignements personnels auprès d'enfants. Si nous apprenons qu'un enfant a fourni des renseignements personnels sans le consentement approprié, nous prendrons des mesures raisonnables pour les supprimer."
        }
      ]
    },
    {
      "number": "14",
      "title": "Modifications à cette politique",
      "blocks": [
        {
          "type": "paragraph",
          "text": "Nous pouvons mettre à jour cette politique lorsque nos pratiques, services, fournisseurs ou obligations légales changent. La date de « Dernière mise à jour » indique la révision la plus récente. Lorsqu'un changement est important, nous fournirons un avis adapté à la nature et à l'incidence du changement, et obtiendrons le consentement lorsque requis."
        }
      ]
    },
    {
      "number": "15",
      "title": "Contact et plaintes",
      "blocks": [
        {
          "type": "paragraph",
          "text": "Les questions, demandes d'accès, demandes de correction, retraits de consentement et plaintes relatives à la vie privée doivent être adressés au :"
        },
        {
          "type": "paragraph",
          "text": "**Responsable de la protection de la vie privée — ORAGROL Global** Thunder Bay, Ontario, Canada [Contactez le responsable de la protection de la vie privée](/contact) — commencez le message par **« Demande relative à la vie privée »**"
        },
        {
          "type": "paragraph",
          "text": "Nous enquêterons sur les plaintes relatives à la vie privée et expliquerons le résultat ainsi que toute mesure corrective appropriée. Si vous n'êtes pas satisfait de notre réponse, vous pouvez contacter le [Commissariat à la protection de la vie privée du Canada (CPVP)](https://www.priv.gc.ca/) et vous renseigner sur le dépôt d'une plainte."
        }
      ]
    }
  ]
};

export function getPrivacyPolicy(locale: string): PrivacyPolicyContent {
  return locale === "fr" ? PRIVACY_POLICY_FR : PRIVACY_POLICY_EN;
}
