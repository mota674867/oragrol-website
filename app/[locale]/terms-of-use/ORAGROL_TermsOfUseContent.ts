// Corrected ORAGROL Terms of Use content — approved September 5, 2026.
// Legal entity name confirmed 2026-09-05 from the Certificate of Incorporation
// (Oragrol Global Inc., Canada Business Corporations Act) and inserted below --
// same fact, same source, same minimal treatment as Privacy Policy Section 01.
// Location intentionally stays city-level only (Thunder Bay / Toronto) -- no
// street address is published anywhere on this page.
//
// Bilingual (Phase 2l, ORAGROL_Legal_Pages_FR_Translation.md): TERMS_OF_USE_FR
// added below, same rationale as ORAGROL_PrivacyPolicyContent.ts's header
// comment (structured legal-document content kept as one reviewable object
// per language rather than flattened into messages/{en,fr}.json). NEEDS A
// REAL LEGAL/TRANSLATION REVIEW before being treated as binding (Bill 96).

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

export const TERMS_OF_USE_EN: TermsOfUseContent = {
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

export const TERMS_OF_USE_FR: TermsOfUseContent = {
  title: "Conditions d'utilisation",
  subtitle: "Les conditions régissant l'accès et l'utilisation du site Web d'ORAGROL Global.",
  effectiveDate: "5 septembre 2026",
  lastUpdated: "5 septembre 2026",
  plainLanguage: [
    {
      type: "paragraph",
      text: "Ces conditions régissent votre utilisation du site Web public d'ORAGROL Global. Elles ne régissent pas un mandat payant de cybersécurité, d'automatisation, de conseil ou de services gérés. Le travail client débute uniquement en vertu d'une entente écrite distincte définissant la portée, les responsabilités, les frais, les livrables, les obligations de confidentialité, les exigences de sécurité et les modalités de responsabilité de ce mandat.",
    },
    {
      type: "paragraph",
      text: "Utilisez le site Web de façon légale et responsable. Ne tentez pas d'accéder à des systèmes sans autorisation, de nuire au site Web, de faire un usage abusif de son contenu ou de soumettre des renseignements que vous n'avez pas le droit de partager. Le contenu du site Web et les résultats du Cyber Health Score fournissent des renseignements généraux et ne remplacent pas une évaluation professionnelle de votre environnement.",
    },
  ],
  sections: [
    {
      number: "01",
      title: "Acceptation de ces conditions",
      blocks: [
        {
          type: "paragraph",
          text: "Les présentes conditions d'utilisation (les « conditions ») régissent l'accès et l'utilisation du site Web d'ORAGROL Global et de ses fonctionnalités publiques (collectivement, le « site »). ORAGROL Global est le nom commercial d'Oragrol Global Inc. et est désigné dans les présentes conditions par « ORAGROL », « nous », « notre » ou « nos ».",
        },
        {
          type: "paragraph",
          text: "En accédant au site ou en l'utilisant, vous acceptez les présentes conditions. Si vous n'êtes pas d'accord, n'utilisez pas le site. Rien dans les présentes conditions ne vous oblige à acheter un service d'ORAGROL.",
        },
      ],
    },
    {
      number: "02",
      title: "But et portée",
      blocks: [
        {
          type: "paragraph",
          text: "Le site vise à fournir des renseignements sur les services de cybersécurité, d'automatisation d'affaires, OR ONE, Cyber Health Score, ressources et services connexes d'ORAGROL. Les présentes conditions régissent uniquement le site public.",
        },
        {
          type: "paragraph",
          text: "Une proposition, un énoncé de travaux, une entente-cadre de services, une annexe de traitement des données, une entente de confidentialité ou un autre contrat client signé est distinct des présentes conditions. Si vous devenez client, l'entente signée régit le mandat et prévaut en ce qui concerne son objet.",
        },
      ],
    },
    {
      number: "03",
      title: "Utilisation d'affaires et autorité",
      blocks: [
        {
          type: "paragraph",
          text: "Le site s'adresse principalement aux propriétaires d'entreprise, aux exploitants et aux décideurs évaluant des services à des fins d'affaires légitimes.",
        },
        {
          type: "paragraph",
          text: "Si vous soumettez des renseignements au nom d'une organisation, vous confirmez être autorisé à fournir ces renseignements et à demander la communication ou l'évaluation pertinente. Le simple fait de parcourir le site ne signifie pas, en soi, que vous avez l'autorité de conclure un contrat de service au nom d'une organisation.",
        },
      ],
    },
    {
      number: "04",
      title: "Utilisation acceptable",
      blocks: [
        { type: "paragraph", text: "Vous ne devez pas :" },
        {
          type: "list",
          items: [
            "tenter d'obtenir un accès non autorisé au site, à un compte, à des données, à une infrastructure ou à un système connecté;",
            "effectuer une analyse de vulnérabilités, un test d'intrusion, un sondage automatisé ou un test de sécurité semblable sans l'autorisation écrite préalable d'ORAGROL;",
            "nuire à la disponibilité, à l'intégrité, à la performance ou à la sécurité du site;",
            "utiliser l'extraction de données, l'automatisation ou des demandes excessives d'une manière qui perturbe le site ou contourne des contrôles techniques raisonnables;",
            "introduire un logiciel malveillant, du code nuisible ou du contenu malveillant;",
            "fausser votre identité, votre autorité, votre affiliation ou vos intentions;",
            "usurper l'identité d'ORAGROL, de son personnel ou d'une autre personne ou organisation;",
            "soumettre des renseignements faux, trompeurs, illégaux, malveillants ou que vous n'avez pas le droit de divulguer;",
            "utiliser le contenu du site pour créer une impression trompeuse d'approbation, de partenariat, de certification ou d'affiliation; ou",
            "utiliser le site ou son contenu à des fins illégales.",
          ],
        },
        {
          type: "paragraph",
          text: "Nous pouvons restreindre ou bloquer l'accès lorsque nous croyons raisonnablement que cela est nécessaire pour protéger le site, ORAGROL, les utilisateurs, les clients, les fournisseurs ou autrui.",
        },
        {
          type: "paragraph",
          text: "Si vous croyez avoir découvert une véritable vulnérabilité de sécurité, ne l'exploitez pas et n'accédez pas à des données qui ne vous appartiennent pas. Signalez-la par l'entremise de notre [page Contact](/contact) et commencez le message par **« Signalement de sécurité »**.",
        },
      ],
    },
    {
      number: "05",
      title: "Renseignements généraux et Cyber Health Score",
      blocks: [
        {
          type: "paragraph",
          text: "Le site et ses ressources sont fournis à des fins générales d'information et d'éducation. Ils ne constituent pas des conseils juridiques, réglementaires, d'assurance, financiers, comptables ou professionnels en cybersécurité.",
        },
        {
          type: "paragraph",
          text: "Le Cyber Health Score est une évaluation illustrative et autodéclarée fondée sur les réponses que vous fournissez. Il ne s'agit pas d'un audit technique, d'un test d'intrusion, d'une évaluation de vulnérabilités, d'une certification, d'une garantie ou d'un examen professionnel de vos systèmes. Les résultats peuvent être incomplets ou inexacts si les renseignements soumis sont incomplets, inexacts, désuets ou mal compris.",
        },
        {
          type: "paragraph",
          text: "L'utilisation du site, la soumission d'une demande de renseignements ou l'obtention d'un Cyber Health Score ne crée aucune relation consultative, fiduciaire, de conseil, de services gérés ou client. Un mandat professionnel débute uniquement lorsque les parties signent une entente écrite applicable.",
        },
        {
          type: "paragraph",
          text: "Ne retardez pas une réponse urgente à un incident ou un avis professionnel en raison de renseignements présentés sur le site. Si vous croyez qu'un cyberincident est en cours, suivez votre processus établi de réponse aux incidents et contactez une assistance qualifiée appropriée.",
        },
      ],
    },
    {
      number: "06",
      title: "Propriété intellectuelle",
      blocks: [
        {
          type: "paragraph",
          text: "Sauf indication contraire, le site et son contenu original, sa conception visuelle, ses graphiques, ses descriptions de services, ses évaluations et son image de marque sont la propriété d'ORAGROL ou lui sont concédés sous licence, et sont protégés par les lois applicables en matière de propriété intellectuelle. Les noms et l'image de marque ORAGROL, ORAGROL Global et OR ONE ne peuvent être utilisés d'une manière suggérant une autorisation, un appui ou une affiliation sans permission écrite préalable.",
        },
        {
          type: "paragraph",
          text: "Vous pouvez consulter, télécharger ou imprimer le contenu du site pour votre propre référence d'affaires interne, légale et non commerciale. Vous ne devez pas reproduire, publier, distribuer, vendre, concéder sous licence, modifier, afficher publiquement, créer du matériel commercial dérivé ou extraire systématiquement le contenu du site sans permission écrite préalable, sauf lorsque la loi applicable le permet autrement.",
        },
        { type: "paragraph", text: "Les noms, marques et contenus de tiers demeurent la propriété de leurs détenteurs respectifs." },
      ],
    },
    {
      number: "07",
      title: "Liens et services tiers",
      blocks: [
        {
          type: "paragraph",
          text: "Le site peut contenir des liens vers des sites Web, outils, plateformes ou services tiers, ou les utiliser. Un lien ne signifie pas nécessairement qu'ORAGROL approuve le tiers ou son contenu.",
        },
        {
          type: "paragraph",
          text: "ORAGROL ne contrôle pas les services tiers indépendants et n'est pas responsable de leur contenu, de leur disponibilité, de leur sécurité ou de leurs pratiques en matière de protection de la vie privée. Votre utilisation d'un service externe est régie par les conditions et politiques de ce fournisseur. Notre traitement des renseignements personnels est décrit dans notre [politique de confidentialité](/privacy-policy).",
        },
      ],
    },
    {
      number: "08",
      title: "Renseignements que vous soumettez",
      blocks: [
        { type: "paragraph", text: "Vous demeurez responsable des renseignements que vous soumettez par l'entremise du site et de vous assurer que vous avez le droit et l'autorité de les fournir." },
        {
          type: "paragraph",
          text: "Vous permettez à ORAGROL et à ses fournisseurs de services autorisés de recueillir, d'utiliser, de stocker et de traiter les renseignements soumis uniquement dans la mesure raisonnablement nécessaire pour répondre à votre demande, fournir la fonctionnalité du site sélectionnée, exploiter et sécuriser le site, gérer la relation d'affaires éventuelle et remplir les fins décrites dans notre [politique de confidentialité](/privacy-policy).",
        },
        {
          type: "paragraph",
          text: "Ne soumettez pas de mots de passe, de codes d'authentification, de clés privées, de numéros de carte de paiement, de numéros d'identification gouvernementaux, de renseignements sur des patients ou d'identifiants pouvant donner accès à un système, par l'entremise des formulaires publics du site, du clavardage en direct, de l'outil My Scope ou du Cyber Health Score.",
        },
      ],
    },
    {
      number: "09",
      title: "Disponibilité et sécurité du site",
      blocks: [
        {
          type: "paragraph",
          text: "Nous pouvons modifier, suspendre, restreindre ou cesser tout ou partie du site pour des raisons d'entretien, de sécurité, opérationnelles, légales ou d'affaires. Nous ne garantissons pas que chaque fonctionnalité ou élément de contenu demeurera disponible.",
        },
        {
          type: "paragraph",
          text: "Bien que nous utilisions des mesures de sécurité raisonnables adaptées au site, aucun service Internet ne peut être garanti entièrement sécuritaire, ininterrompu ou exempt de composants nuisibles. Vous êtes responsable d'utiliser une sécurité appropriée pour votre appareil, votre navigateur, votre compte et votre réseau lorsque vous accédez au site.",
        },
      ],
    },
    {
      number: "10",
      title: "Aucune garantie",
      blocks: [
        {
          type: "paragraph",
          text: "Dans toute la mesure permise par la loi applicable, le site et son contenu sont fournis **« tels quels »** et **« selon leur disponibilité »**. ORAGROL décline toute garantie et condition de quelque nature que ce soit, qu'elle soit expresse, implicite, légale ou accessoire, y compris la qualité marchande, l'adéquation à un usage particulier, l'absence de contrefaçon, l'exactitude, l'exhaustivité, la disponibilité et la sécurité.",
        },
        {
          type: "paragraph",
          text: "Nous ne garantissons pas que le site sera ininterrompu, exempt d'erreurs, à jour en tout temps ou adapté à une décision d'affaires particulière. Certains territoires n'autorisent pas certaines exclusions de garantie; il se peut donc que certaines exclusions ne s'appliquent pas à vous.",
        },
      ],
    },
    {
      number: "11",
      title: "Limitation de responsabilité",
      blocks: [
        {
          type: "paragraph",
          text: "Dans toute la mesure permise par la loi applicable, ORAGROL ainsi que ses administrateurs, dirigeants, employés, entrepreneurs et fournisseurs de services du site ne seront pas responsables des dommages indirects, accessoires, particuliers, consécutifs, exemplaires ou punitifs, ni de la perte de profits, de revenus, d'occasions d'affaires, d'achalandage, d'interruption des activités ou de données, découlant du site ou de votre utilisation ou incapacité à l'utiliser, ou s'y rapportant.",
        },
        {
          type: "paragraph",
          text: "Rien dans les présentes conditions n'exclut ni ne limite une responsabilité qui ne peut légalement être exclue ou limitée. La responsabilité découlant d'une entente client signée est régie par cette entente, et non par la présente section.",
        },
      ],
    },
    {
      number: "12",
      title: "Indemnisation",
      blocks: [
        {
          type: "paragraph",
          text: "Dans la mesure permise par la loi, vous acceptez d'indemniser ORAGROL contre les réclamations de tiers, les dommages et les coûts raisonnables dans la mesure où ils sont directement causés par votre usage abusif illégal du site, une violation délibérée des droits d'une autre personne par l'entremise du site, ou une violation importante de la section 4.",
        },
        {
          type: "paragraph",
          text: "Cette obligation ne s'applique pas dans la mesure où une réclamation a été causée par la propre conduite d'ORAGROL, et elle n'élargit ni ne remplace toute indemnisation négociée dans une entente client signée.",
        },
      ],
    },
    {
      number: "13",
      title: "Loi applicable, différends et divisibilité",
      blocks: [
        {
          type: "paragraph",
          text: "Les présentes conditions sont régies par les lois de l'Ontario et les lois fédérales du Canada applicables en Ontario, sans égard aux règles de conflit de lois. Sous réserve de tout droit impératif ou de toute compétence que la loi applicable ne permet pas aux parties d'exclure, les différends concernant le site ou les présentes conditions seront portés devant les tribunaux situés en Ontario.",
        },
        {
          type: "paragraph",
          text: "Avant d'entamer une procédure formelle, nous vous encourageons à contacter ORAGROL par l'entremise de notre [page Contact](/contact) afin que la question puisse être examinée et, dans la mesure du possible, résolue à l'amiable.",
        },
        {
          type: "paragraph",
          text: "Si une disposition des présentes conditions est jugée invalide, illégale ou inapplicable, elle sera limitée ou retirée uniquement dans la mesure minimale nécessaire. Les autres dispositions demeureront en vigueur.",
        },
      ],
    },
    {
      number: "14",
      title: "Modifications aux présentes conditions",
      blocks: [
        {
          type: "paragraph",
          text: "Nous pouvons mettre à jour les présentes conditions pour refléter des changements au site, à nos pratiques ou aux exigences applicables. La date de « Dernière mise à jour » indique la version la plus récente.",
        },
        {
          type: "paragraph",
          text: "Les changements importants seront communiqués par un avis adapté à la nature du changement. Les conditions mises à jour s'appliquent à compter de la date d'entrée en vigueur indiquée. Votre utilisation continue du site après cette date constitue une acceptation des conditions mises à jour. Si vous n'êtes pas d'accord avec une mise à jour, cessez d'utiliser le site.",
        },
      ],
    },
    {
      number: "15",
      title: "Contact",
      blocks: [
        {
          type: "paragraph",
          text: "Les questions au sujet des présentes conditions doivent être soumises par l'entremise de notre [page Contact](/contact). Commencez le message par **« Demande juridique »**.",
        },
        {
          type: "paragraph",
          text: "**ORAGROL Global**  \nThunder Bay, Ontario, Canada  \nPrésence d'affaires : Toronto, Ontario, Canada",
        },
      ],
    },
  ],
};

export function getTermsOfUse(locale: string): TermsOfUseContent {
  return locale === "fr" ? TERMS_OF_USE_FR : TERMS_OF_USE_EN;
}
