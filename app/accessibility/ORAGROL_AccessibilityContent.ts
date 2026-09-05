// Corrected ORAGROL Accessibility Statement — approved September 5, 2026.
// Legal entity name confirmed 2026-09-05 from the Certificate of Incorporation
// (Oragrol Global Inc., Canada Business Corporations Act) and inserted below --
// same fact, same source, same minimal treatment as Privacy Policy Section 01
// and Terms of Use Section 01. Location intentionally stays city-level only
// (Thunder Bay / Toronto) -- no street address is published anywhere on this
// page.

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

export const ACCESSIBILITY_STATEMENT: AccessibilityStatementContent = {
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
