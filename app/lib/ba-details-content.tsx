import type { DetailsAction } from "../components/DetailsDialog";

export type BaDetailsContent = {
  itemLabel: string;
  title: string;
  subtitle: string;
  intro: string;
  inclusions: string[];
  control: string;
  whoItSuits: string;
  example?: string;
  scope: string;
};

// Transcribed exactly from ORAGROL_Details_Claude_Complete.md, section 5.
// Do not paraphrase — if the source changes, update it there first.
export const baDetailsContent: Record<string, BaDetailsContent> = {
  "sales-flow": {
    itemLabel: "SALES",
    title: "BA Sales",
    subtitle: "Keep your pipeline moving.",
    intro:
      "Connect your CRM and inbox to organize incoming leads, maintain sales records and coordinate follow-up. The service prepares quotes, proposals and suggested next steps using your agreed sales process. You receive a clearer pipeline, regular reporting and drafts ready for review, while routine activity follows the rules agreed at setup.",
    inclusions: [
      "Lead qualification and scoring against agreed criteria.",
      "CRM updates and activity records.",
      "Quote and proposal drafts.",
      "Scheduled follow-up with existing clients.",
      "Upsell and cross-sell suggestions.",
      "Sales forecasts and reports based on available pipeline data.",
      "Referral reminders and request preparation.",
    ],
    control:
      "Quotes, proposals and new offers come to you for approval. Routine follow-ups run within agreed rules; requests outside those rules are escalated for your decision.",
    whoItSuits: "Businesses that want consistent follow-up and a clearer view of their sales pipeline.",
    example:
      "A lead arrives overnight. Its details are organized in your CRM, scored against your criteria and paired with a suggested next step for review.",
    scope: "Supported CRM and inbox connections, messaging rules and workflow coverage are confirmed before setup.",
  },
  "operational-intelligence": {
    itemLabel: "FINANCE",
    title: "BA Finance",
    subtitle: "Keep everyday finance organized.",
    intro:
      "Connect supported accounting software and financial data sources to coordinate invoicing, payment tracking and routine finance administration. The service prepares records, highlights exceptions and brings payroll, payables and reporting together for review. You receive a clearer financial picture while decisions involving payments or sensitive changes remain within your approval rules.",
    inclusions: [
      "Invoice preparation and sending under agreed rules.",
      "Payment collection workflows through approved payment tools.",
      "Cash-flow monitoring and exception flags.",
      "Expense tracking and recording.",
      "Incoming and outgoing payment records and reconciliation support.",
      "Subscription and recurring-charge tracking.",
      "Loan-payment tracking.",
      "Payroll preparation for approval.",
      "Accounts-payable preparation for approval.",
      "Tax-deadline reminders.",
      "Invoice-tax application using your confirmed configuration.",
      "Routine financial reports.",
    ],
    control:
      "Payroll, payables and sensitive financial actions require approval. Tax settings and accounting judgments require appropriate review; automation does not replace your accountant's professional judgment.",
    whoItSuits: "Owners who want coordinated invoicing, collections, expenses and reporting with less repetitive administration.",
    example:
      "Upcoming bills and recorded income indicate a possible cash shortfall. The service flags it so you can review timing and take action.",
    scope: "Available feeds, reconciliation frequency and payment permissions are confirmed during setup.",
  },
  "customer-support": {
    itemLabel: "CUSTOMER SERVICE",
    title: "BA Customer Service",
    subtitle: "Give every enquiry a clear next step.",
    intro:
      "Connect supported helpdesk, inbox and agreed customer-service channels to organize enquiries and coordinate responses. The service uses your approved knowledge and policies to answer routine questions, track tickets and identify cases needing a person. You receive a more consistent support workflow, with exceptions and sensitive decisions brought to your attention.",
    inclusions: [
      "Routine enquiry handling across agreed phone, email and chat connections.",
      "Complaint triage and escalation.",
      "Order and service issue handling within approved policies.",
      "FAQ and knowledge-base update preparation.",
      "Satisfaction surveys.",
      "Support-ticket tracking.",
      "After-sales follow-up.",
      "Return and refund preparation for approval.",
    ],
    control:
      "Refunds, returns and exceptions outside approved policies are referred for your decision. Unverified answers are escalated rather than presented as facts.",
    whoItSuits: "Businesses that need consistent support as enquiry volumes grow.",
    example:
      "A customer asks about a delayed order. The service checks the connected order record and provides the available status, or routes the case for investigation when information is missing.",
    scope: "Channels, knowledge sources, coverage hours and escalation arrangements are agreed before launch.",
  },
  "customer-growth": {
    itemLabel: "MARKETING",
    title: "BA Marketing",
    subtitle: "Turn your marketing plan into consistent activity.",
    intro:
      "Coordinate content, email, social and advertising workflows through your supported accounts. The service prepares material in your brand voice, organizes your calendar and reports on campaign activity. You review publication and spending decisions, while approved work proceeds within the agreed plan.",
    inclusions: [
      "Routine website-update preparation and coordination.",
      "SEO maintenance and improvement recommendations.",
      "Blog and article drafts.",
      "Social scheduling and publication after approval.",
      "Email campaigns and newsletters for eligible audiences.",
      "Paid-campaign management within approved budgets.",
      "Routine graphic-design preparation.",
      "Market and competitor research.",
      "Marketing performance reports.",
      "Lead-generation campaign preparation and coordination.",
    ],
    control:
      "Public material requires approval before publication. Spending follows your approved budget; proposed increases require a new decision. Audience permissions and unsubscribe preferences must be respected.",
    whoItSuits: "Businesses seeking a consistent marketing cadence without managing every repetitive step themselves.",
    example:
      "Research identifies a relevant market change. The service drafts a campaign adjustment and supporting content for your review before anything is published.",
    scope:
      "Channels, content volumes, ad accounts and publishing permissions are agreed at setup. Search rankings and campaign results are not guaranteed.",
  },
  "managed-it": {
    itemLabel: "IT",
    title: "BA IT",
    subtitle: "Keep routine technology work under control.",
    intro:
      "Connect supported systems to coordinate maintenance, helpdesk work and everyday IT administration. The service tracks issues, prepares or performs permitted routine actions and flags changes that need review. You receive maintenance visibility and exception reporting, with critical-system changes handled through agreed controls.",
    inclusions: [
      "Software maintenance and patch coordination.",
      "Software-license management.",
      "Helpdesk, password and access-request workflows.",
      "Backup operation and verification within the agreed scope.",
      "Basic cyber-hygiene monitoring.",
      "Routine website and hosting maintenance.",
      "Connections between supported software tools.",
    ],
    control:
      "Critical-system changes and sensitive access actions require approval. Routine changes follow agreed maintenance windows, verification and recovery procedures.",
    whoItSuits: "Businesses needing structured routine IT support and clearer ownership of recurring technical tasks.",
    example:
      "A relevant patch becomes available. The service identifies affected systems and prepares the update for the agreed testing and approval process.",
    scope:
      "Supported systems, backup verification depth and maintenance coverage are agreed before launch. This does not automatically include specialist cybersecurity or forensic response.",
  },
  tailored: {
    itemLabel: "TAILORED AUTOMATION",
    title: "BA Tailored Automation",
    subtitle: "Automate a workflow unique to your business.",
    intro:
      "Describe a repetitive task that does not fit the standard BA services. We assess the workflow, confirm the inputs and decisions it needs, and scope an automation around that specific process. You receive a tested workflow with defined boundaries, exception handling and approval points.",
    inclusions: [
      "Review of the task and its suitability for automation.",
      "Identification of required data, software connections and owners.",
      "A defined scope covering included actions and exclusions.",
      "Build and testing against the agreed workflow.",
      "Approval and exception-handling rules.",
      "A quotation based on the confirmed scope.",
    ],
    control:
      "Sensitive actions and exceptions follow agreed approval rules. Changes beyond the agreed workflow are reviewed before implementation.",
    whoItSuits: "Businesses with a specific recurring task that does not fit a standard package.",
    example:
      "A property manager needs maintenance requests matched to suitable contractors. A tailored workflow prepares matches using job type and available information, with exceptions referred for review.",
    scope:
      "Custom quotation. A request spanning a broader connected operation may be better suited to OR ONE; this is assessed before committing to a build.",
  },
};

export type { DetailsAction };
