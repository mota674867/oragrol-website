// Corrected ORAGROL Accessibility Statement — approved September 5, 2026.
// Legal entity name confirmed 2026-09-05 from the Certificate of Incorporation
// (Oragrol Global Inc., Canada Business Corporations Act) and inserted below --
// same fact, same source, same minimal treatment as Privacy Policy Section 01
// and Terms of Use Section 01. Location intentionally stays city-level only
// (Thunder Bay / Toronto) -- no street address is published anywhere on this
// page.
//
// Bilingual (Phase 2l, ORAGROL_Legal_Pages_FR_Translation.md):
// ACCESSIBILITY_STATEMENT_FR added below, same rationale as the other two
// legal pages' content files (structured legal-document content kept as one
// reviewable object per language rather than flattened into
// messages/{en,fr}.json). NEEDS A REAL LEGAL/TRANSLATION REVIEW before being
// treated as binding (Bill 96). Terminology: AODA kept as AODA with the
// French title given alongside (+ "LAPHO", the term used in the doc's own
// body translation), WCAG kept as WCAG per the doc's own note that
// French-language accessibility resources commonly use the same acronym.

export type AccessibilityBlock =
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] };

export type AccessibilitySection = {
  number: string;
  title: string;
  blocks: AccessibilityBlock[];
};

export type AccessibilityStatementContent = {
  title: string;
  subtitle: string;
  effectiveDate: string;
  lastUpdated: string;
  plainLanguage: AccessibilityBlock[];
  sections: AccessibilitySection[];
  contact: {
    heading: string;
    description: string;
    linkLabel: string;
    href: string;
    location: string;
  };
};

export const ACCESSIBILITY_STATEMENT_EN: AccessibilityStatementContent = {
  title: "Accessibility Statement",
  subtitle: "Our commitment to an accessible and inclusive ORAGROL Global website.",
  effectiveDate: "September 5, 2026",
  lastUpdated: "September 5, 2026",
  plainLanguage: [
    {
      type: "paragraph",
      text: "We want everyone, including people who use assistive technology, to be able to use this website and benefit from its content and services. We are building accessibility into the Site from the beginning, but we are not claiming certified conformance at this time. If you encounter a barrier, please tell us. We will review the issue and work to provide a reasonable solution or accessible alternative.",
    },
  ],
  sections: [
    {
      number: "01",
      title: "Our commitment",
      blocks: [
        {
          type: "paragraph",
          text: "ORAGROL Global, the operating name of Oragrol Global Inc., is committed to providing a website that is accessible to the widest possible audience, regardless of ability or the technology used to access it. Accessibility is treated as an ongoing responsibility, not a one-time task, and is considered as our Site continues to evolve.",
        },
      ],
    },
    {
      number: "02",
      title: "Standards that guide our work",
      blocks: [
        {
          type: "paragraph",
          text: "As a business operating in Ontario, we consider the requirements of Ontario's *Accessibility for Ontarians with Disabilities Act, 2005* (AODA) and its Integrated Accessibility Standards Regulation. The regulation uses the Web Content Accessibility Guidelines (WCAG) 2.0 Level AA as the applicable website benchmark for organizations within its website-accessibility requirements. Our internal design and development target is the more current WCAG 2.1 Level AA standard, which builds on and includes WCAG 2.0 Level AA.",
        },
        {
          type: "paragraph",
          text: "We have not yet completed a formal third-party accessibility audit of the Site. We therefore do not represent that the Site fully conforms to WCAG 2.1 Level AA at this time. This statement describes our current practices and ongoing target; it is not a certification or formal conformance claim.",
        },
      ],
    },
    {
      number: "03",
      title: "What we build in",
      blocks: [
        { type: "paragraph", text: "Where practical, we work to build our Site with:" },
        {
          type: "list",
          items: [
            "semantic HTML structure to support screen readers and other assistive technologies;",
            "keyboard-accessible navigation and controls, including menus, forms, and interactive tools such as the Cyber Health Score assessment;",
            "visible focus states and logical focus order;",
            "meaningful alternative text for informative images;",
            "colour and contrast choices designed to support readability;",
            "clear labels, instructions, validation messages, and error identification for forms; and",
            "clear, plain-language content consistent with our broader approach of avoiding unnecessary jargon.",
          ],
        },
      ],
    },
    {
      number: "04",
      title: "Known limitations and ongoing work",
      blocks: [
        {
          type: "paragraph",
          text: "Our Site was substantially redesigned in 2026, and accessibility review of the new design is an active process. Some newer interactive tools, third-party components, documents, or recently added pages may not yet fully meet our WCAG 2.1 Level AA target.",
        },
        {
          type: "paragraph",
          text: "We review accessibility as the Site changes and prioritize improvements according to their effect on users. When a reported barrier cannot be corrected immediately, we will work with the person making the request to identify a reasonable accessible alternative where possible.",
        },
      ],
    },
    {
      number: "05",
      title: "Evolving requirements",
      blocks: [
        {
          type: "paragraph",
          text: "Accessibility obligations under Ontario law can vary according to an organization's type, size, activities, and other circumstances. ORAGROL monitors the requirements that apply to its operations and will update its policies, practices, and this statement as the business and applicable obligations evolve.",
        },
        {
          type: "paragraph",
          text: "This statement is a public description of our website-accessibility approach. It is not intended to replace any accessibility policy, plan, training record, compliance report, or other document that may be required by applicable law.",
        },
      ],
    },
    {
      number: "06",
      title: "Tell us about an accessibility barrier",
      blocks: [
        {
          type: "paragraph",
          text: "If you encounter difficulty using the Site, or if content or a feature is not accessible to you, please contact us through our [Contact page](/contact) and begin your message with **\"Accessibility Request.\"**",
        },
        {
          type: "paragraph",
          text: "Where possible, include the page or feature involved, a description of the barrier, and the browser, device, or assistive technology you were using. You are not required to disclose a disability or provide information that is not necessary to understand the request. We will acknowledge and review accessibility feedback and work to respond within a reasonable period based on the nature and complexity of the issue.",
        },
      ],
    },
    {
      number: "07",
      title: "Accessible formats and communication supports",
      blocks: [
        {
          type: "paragraph",
          text: "If you need Site information in an accessible format or require a communication support, contact us through the [Contact page](/contact) and begin your message with **\"Accessibility Request.\"** We will consult with you to understand your needs and work to provide a suitable format or support within a reasonable period, where practicable.",
        },
      ],
    },
    {
      number: "08",
      title: "Changes to this statement",
      blocks: [
        {
          type: "paragraph",
          text: "We will review and update this statement as the Site, our accessibility practices, and applicable requirements evolve. The **\"Last updated\"** date at the top of this page identifies the most recent revision.",
        },
      ],
    },
  ],
  contact: {
    heading: "Accessibility feedback — ORAGROL Global",
    description: "For accessibility feedback, barrier reports, accessible formats, or communication-support requests, begin your message with \"Accessibility Request.\"",
    linkLabel: "Submit Accessibility Request",
    href: "/contact",
    location: "Thunder Bay, Ontario, Canada · Business presence: Toronto, Ontario, Canada",
  },
};

export const ACCESSIBILITY_STATEMENT_FR: AccessibilityStatementContent = {
  title: "Déclaration d'accessibilité",
  subtitle: "Notre engagement envers un site Web ORAGROL Global accessible et inclusif.",
  effectiveDate: "5 septembre 2026",
  lastUpdated: "5 septembre 2026",
  plainLanguage: [
    {
      type: "paragraph",
      text: "Nous voulons que tout le monde, y compris les personnes qui utilisent des technologies d'assistance, puisse utiliser ce site Web et profiter de son contenu et de ses services. Nous intégrons l'accessibilité au site dès le départ, mais nous ne prétendons pas à une conformité certifiée à l'heure actuelle. Si vous rencontrez un obstacle, veuillez nous en informer. Nous examinerons la question et travaillerons à fournir une solution raisonnable ou une solution de rechange accessible.",
    },
  ],
  sections: [
    {
      number: "01",
      title: "Notre engagement",
      blocks: [
        {
          type: "paragraph",
          text: "ORAGROL Global, le nom commercial d'Oragrol Global Inc., s'engage à offrir un site Web accessible au plus large public possible, peu importe les capacités ou la technologie utilisée pour y accéder. L'accessibilité est traitée comme une responsabilité continue, et non comme une tâche ponctuelle, et elle est prise en compte à mesure que notre site continue d'évoluer.",
        },
      ],
    },
    {
      number: "02",
      title: "Normes qui guident notre travail",
      blocks: [
        {
          type: "paragraph",
          text: "En tant qu'entreprise exploitée en Ontario, nous tenons compte des exigences de la *Loi de 2005 sur l'accessibilité pour les personnes handicapées de l'Ontario* (LAPHO / AODA) et de son Règlement sur les normes d'accessibilité intégrées. Le règlement utilise les Règles pour l'accessibilité des contenus Web (WCAG) 2.0, niveau AA, comme référence applicable aux sites Web pour les organisations visées par ses exigences d'accessibilité des sites Web. Notre cible interne de conception et de développement est la norme plus récente WCAG 2.1, niveau AA, qui s'appuie sur les normes WCAG 2.0, niveau AA, et les inclut.",
        },
        {
          type: "paragraph",
          text: "Nous n'avons pas encore effectué d'audit d'accessibilité formel par un tiers pour le site. Nous ne prétendons donc pas, à l'heure actuelle, que le site est entièrement conforme aux normes WCAG 2.1, niveau AA. Cette déclaration décrit nos pratiques actuelles et notre cible continue; il ne s'agit pas d'une certification ni d'une déclaration formelle de conformité.",
        },
      ],
    },
    {
      number: "03",
      title: "Ce que nous intégrons",
      blocks: [
        { type: "paragraph", text: "Lorsque cela est possible, nous nous efforçons de construire notre site avec :" },
        {
          type: "list",
          items: [
            "une structure HTML sémantique pour soutenir les lecteurs d'écran et autres technologies d'assistance;",
            "une navigation et des contrôles accessibles au clavier, y compris les menus, les formulaires et les outils interactifs comme l'évaluation Cyber Health Score;",
            "des états de focus visibles et un ordre de focus logique;",
            "un texte alternatif significatif pour les images informatives;",
            "des choix de couleurs et de contraste conçus pour favoriser la lisibilité;",
            "des étiquettes, instructions, messages de validation et identifications d'erreurs clairs pour les formulaires; et",
            "un contenu clair, en langage simple, conforme à notre approche générale visant à éviter le jargon inutile.",
          ],
        },
      ],
    },
    {
      number: "04",
      title: "Limites connues et travaux en cours",
      blocks: [
        {
          type: "paragraph",
          text: "Notre site a fait l'objet d'une refonte importante en 2026, et l'examen de l'accessibilité de la nouvelle conception est un processus actif. Certains outils interactifs plus récents, composants tiers, documents ou pages récemment ajoutées peuvent ne pas encore répondre entièrement à notre cible WCAG 2.1, niveau AA.",
        },
        {
          type: "paragraph",
          text: "Nous examinons l'accessibilité à mesure que le site évolue et priorisons les améliorations selon leur incidence sur les utilisateurs. Lorsqu'un obstacle signalé ne peut être corrigé immédiatement, nous travaillerons avec la personne à l'origine de la demande pour trouver une solution de rechange accessible raisonnable, dans la mesure du possible.",
        },
      ],
    },
    {
      number: "05",
      title: "Exigences en évolution",
      blocks: [
        {
          type: "paragraph",
          text: "Les obligations en matière d'accessibilité en vertu de la loi ontarienne peuvent varier selon le type, la taille, les activités et d'autres circonstances propres à une organisation. ORAGROL surveille les exigences applicables à ses activités et mettra à jour ses politiques, ses pratiques et la présente déclaration à mesure que l'entreprise et les obligations applicables évoluent.",
        },
        {
          type: "paragraph",
          text: "Cette déclaration est une description publique de notre approche en matière d'accessibilité du site Web. Elle ne vise pas à remplacer toute politique, tout plan, tout dossier de formation, tout rapport de conformité ou tout autre document en matière d'accessibilité qui pourrait être exigé par la loi applicable.",
        },
      ],
    },
    {
      number: "06",
      title: "Signalez-nous un obstacle à l'accessibilité",
      blocks: [
        {
          type: "paragraph",
          text: "Si vous éprouvez de la difficulté à utiliser le site, ou si un contenu ou une fonctionnalité ne vous est pas accessible, veuillez nous contacter par l'entremise de notre [page Contact](/contact) et commencer votre message par **« Demande d'accessibilité »**.",
        },
        {
          type: "paragraph",
          text: "Dans la mesure du possible, précisez la page ou la fonctionnalité concernée, une description de l'obstacle, ainsi que le navigateur, l'appareil ou la technologie d'assistance que vous utilisiez. Vous n'êtes pas tenu de divulguer un handicap ou de fournir des renseignements qui ne sont pas nécessaires à la compréhension de la demande. Nous accuserons réception de vos commentaires sur l'accessibilité, les examinerons et travaillerons à répondre dans un délai raisonnable, selon la nature et la complexité de la question.",
        },
      ],
    },
    {
      number: "07",
      title: "Formats accessibles et aides à la communication",
      blocks: [
        {
          type: "paragraph",
          text: "Si vous avez besoin des renseignements du site dans un format accessible ou d'une aide à la communication, contactez-nous par l'entremise de la [page Contact](/contact) et commencez votre message par **« Demande d'accessibilité »**. Nous nous entretiendrons avec vous pour comprendre vos besoins et travaillerons à fournir un format ou une aide adéquate dans un délai raisonnable, dans la mesure du possible.",
        },
      ],
    },
    {
      number: "08",
      title: "Modifications à cette déclaration",
      blocks: [
        {
          type: "paragraph",
          text: "Nous examinerons et mettrons à jour cette déclaration à mesure que le site, nos pratiques en matière d'accessibilité et les exigences applicables évoluent. La date de **« Dernière mise à jour »** en haut de cette page indique la révision la plus récente.",
        },
      ],
    },
  ],
  contact: {
    heading: "Commentaires sur l'accessibilité — ORAGROL Global",
    description: "Pour des commentaires sur l'accessibilité, des signalements d'obstacles, des formats accessibles ou des demandes d'aide à la communication, commencez votre message par « Demande d'accessibilité ».",
    linkLabel: "Soumettre une demande d'accessibilité",
    href: "/contact",
    location: "Thunder Bay, Ontario, Canada · Présence d'affaires : Toronto, Ontario, Canada",
  },
};

export function getAccessibilityStatement(locale: string): AccessibilityStatementContent {
  return locale === "fr" ? ACCESSIBILITY_STATEMENT_FR : ACCESSIBILITY_STATEMENT_EN;
}
