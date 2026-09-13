export type PackageDetailsContent = {
  itemLabel: string;
  title: string;
  subtitle: string;
  intro: string;
  inclusions: string[];
  controlHeading: string;
  control: string;
  whoItSuits: string;
  scope: string;
};

// Transcribed exactly from ORAGROL_Details_Claude_Complete.md, section 6.
export const packagesDetailsContent: Record<string, PackageDetailsContent> = {
  foundation: {
    itemLabel: "FOUNDATION",
    title: "Foundation",
    subtitle: "Establish your core security protections.",
    intro:
      "Foundation brings together six services covering security policies, weaknesses, devices, email, staff awareness and sign-in protection. It combines preventive controls with checks and monitoring appropriate to each service. You receive findings, activity reporting and agreed response or remediation steps for the systems in scope.",
    inclusions: [
      "Security Rules Setup",
      "Security Weakness Check",
      "Device Guard",
      "Mail Shield",
      "Staff Security",
      "Login Shield",
    ],
    controlHeading: "How action works",
    control:
      "Routine protective actions follow the agreed configuration and authorization. Findings that need further investigation or changes are escalated; detection does not mean every issue has been fixed.",
    whoItSuits: "Businesses establishing a coordinated baseline of security protection.",
    scope: "Covered users, devices, environments, review frequency and response arrangements are confirmed before service begins.",
  },
  advanced: {
    itemLabel: "ADVANCED",
    title: "Advanced",
    subtitle: "Extend protection into access, vendors and oversight.",
    intro:
      "Advanced includes Foundation and adds services covering compliance checks, vendor risk, AI security monitoring, threat monitoring and access oversight. It connects core protections with a broader view of security responsibilities and exposure. You receive findings and priorities across these areas, with actions handled under the agreed service scope.",
    inclusions: [
      "Security Rules Setup",
      "Security Weakness Check",
      "Device Guard",
      "Mail Shield",
      "Staff Security",
      "Login Shield",
      "Compliance Check",
      "Vendor Watch",
      "AI Security Monitoring",
      "Threat Watch",
      "Access Manager",
      "Access Governance",
    ],
    controlHeading: "How action works",
    control:
      "Monitoring, reviews and permitted protective actions follow the agreed rules. Sensitive access changes and issues requiring additional work are escalated. Compliance checks support readiness; they are not an independent attestation.",
    whoItSuits: "Businesses needing broader access governance, vendor oversight and compliance visibility.",
    scope: "Twelve listed services. Coverage, review frequency and escalation arrangements are confirmed before service begins.",
  },
  comprehensive: {
    itemLabel: "COMPREHENSIVE",
    title: "Comprehensive",
    subtitle: "Connect protection across your technology environment.",
    intro:
      "Comprehensive extends Advanced into cloud, infrastructure, applications and data. Its 22 services address a wider set of environments and help bring findings into a coordinated security view. You receive monitoring and assessment outputs, priorities and agreed actions across the covered systems.",
    inclusions: [
      "Security Rules Setup",
      "Security Weakness Check",
      "Device Guard",
      "Mail Shield",
      "Staff Security",
      "Login Shield",
      "Compliance Check",
      "Vendor Watch",
      "AI Security Monitoring",
      "Threat Watch",
      "Access Manager",
      "Access Governance",
      "Cloud Guard",
      "Workload Shield",
      "Infra Guard",
      "Cloud Compliance",
      "App Shield",
      "Web Shield",
      "API Guard",
      "Data Shield",
      "Data Guard",
      "Data Classifier",
    ],
    controlHeading: "How action works",
    control:
      "Controls and response actions depend on the connected environment and agreed permissions. Findings needing wider remediation or sensitive changes are referred for review; a broader package does not imply unlimited coverage.",
    whoItSuits: "Businesses operating cloud services, infrastructure and customer-facing applications that need coordinated security coverage.",
    scope: "Covered applications, cloud accounts, workloads and data sources are defined before service begins.",
  },
  elite: {
    itemLabel: "ELITE",
    title: "Elite",
    subtitle: "Bring broader monitoring and response together.",
    intro:
      "Elite includes Comprehensive and adds Managed Threat Response, Security Response and Data Watch. These 25 services bring broader monitoring and response coordination into the agreed security program. You receive investigation updates, recorded actions and follow-up priorities for incidents and findings within scope.",
    inclusions: [
      "Security Rules Setup",
      "Security Weakness Check",
      "Device Guard",
      "Mail Shield",
      "Staff Security",
      "Login Shield",
      "Compliance Check",
      "Vendor Watch",
      "AI Security Monitoring",
      "Threat Watch",
      "Access Manager",
      "Access Governance",
      "Cloud Guard",
      "Workload Shield",
      "Infra Guard",
      "Cloud Compliance",
      "App Shield",
      "Web Shield",
      "API Guard",
      "Data Shield",
      "Data Guard",
      "Data Classifier",
      "Managed Threat Response",
      "Security Response",
      "Data Watch",
    ],
    controlHeading: "How action works",
    control:
      "Agreed response procedures define what can happen automatically and what requires review. Investigation and recovery needs outside the package are identified separately; specialist forensic engagements are not automatically included.",
    whoItSuits: "Businesses needing the broadest listed package with additional response coordination and data monitoring.",
    scope:
      "Monitoring coverage, response availability, authorization and escalation targets are agreed before service begins. Do not publish an unverified response-time guarantee.",
  },
};

export type SpecialistDetailsContent = {
  itemLabel: string;
  title: string;
  subtitle: string;
  intro: string;
  inclusions: string[];
  controlHeading: string;
  control: string;
  whoItSuits: string;
  scope: string;
};

// Transcribed exactly from ORAGROL_Details_Claude_Complete.md, section 7.
// Titles match the real names on the page (services-catalog.ts), not the
// handoff's section headings, which use slightly different informal names.
export const specialistDetailsContent: Record<string, SpecialistDetailsContent> = {
  "C10-S01": {
    itemLabel: "SPECIALIST ENGAGEMENT",
    title: "Penetration Testing",
    subtitle: "Test how weaknesses could be exploited.",
    intro:
      "A scoped penetration test examines how an attacker could exploit weaknesses in the agreed systems or application. A qualified tester works within defined authorization and testing boundaries, documenting verified findings and their impact. You receive an evidence-based report with prioritized remediation guidance.",
    inclusions: [
      "Agreed targets, testing boundaries and permitted methods.",
      "Testing and exploitation attempts within that scope.",
      "Evidence and impact descriptions for verified findings.",
      "Prioritized remediation recommendations.",
      "Specialist review of the final report.",
    ],
    controlHeading: "Your involvement",
    control: "Approve the scope and testing authorization before work starts. Remediation and retesting are included only where expressly scoped.",
    whoItSuits: "Businesses seeking a practical assessment for their security program or a customer or insurer requirement.",
    scope: "Per-engagement quotation. Testing is bounded in time and scope and does not establish that every weakness has been found.",
  },
  "C10-S02": {
    itemLabel: "SPECIALIST ENGAGEMENT",
    title: "SOC 2 Type II Attestation",
    subtitle: "Prepare evidence for an independent examination.",
    intro:
      "We help organize the controls and evidence needed for a scoped SOC 2 Type II engagement with a qualified CPA audit partner. Preparation and evidence coordination support the examination over the agreed period. The independent auditor performs the examination and determines the resulting report and opinion.",
    inclusions: [
      "Readiness review against the agreed examination scope.",
      "Identification of control and evidence gaps.",
      "Evidence organization and coordination.",
      "Support during the agreed observation and examination process.",
      "Independent CPA engagement as defined in the proposal.",
    ],
    controlHeading: "Your involvement",
    control: "Your organization operates its controls and supplies accurate evidence. Preparation work does not guarantee a favorable audit opinion.",
    whoItSuits: "Businesses whose customers or stakeholders request independent assurance about scoped controls.",
    scope:
      "Readiness work and audit-partner fees must remain clearly distinguished in the existing pricing presentation. Confirm the reporting period and partner responsibilities before engagement.",
  },
  "C10-S03": {
    itemLabel: "SPECIALIST ENGAGEMENT",
    title: "PCI-DSS QSA Assessment",
    subtitle: "Assess your card-payment environment.",
    intro:
      "A qualified QSA assesses the agreed card-payment environment against applicable PCI DSS requirements. We help organize scope information, control mapping and supporting evidence for that assessment. You receive the agreed assessment documentation and a clear account of identified gaps and required follow-up.",
    inclusions: [
      "Confirmation of the assessment scope and validation requirements.",
      "Control and evidence review.",
      "Evidence organization and gap identification.",
      "Assessment by the qualified QSA.",
      "The agreed assessment documentation and findings.",
    ],
    controlHeading: "Your involvement",
    control:
      "Supply accurate environment details and maintain required controls. Required validation documents and assessment approach are confirmed with the relevant payment stakeholders; do not describe this as a blanket legal license to process payments.",
    whoItSuits: "Businesses needing a QSA assessment of their card-payment environment.",
    scope: "Requirements and fees depend on the environment and validation scope, not merchant volume alone. No guaranteed compliance result.",
  },
  "C10-S04": {
    itemLabel: "SPECIALIST ENGAGEMENT",
    title: "Certified Forensic IR",
    subtitle: "Investigate an incident and preserve its evidence.",
    intro:
      "A scoped forensic engagement investigates the available evidence of a security incident and documents what can be established. Qualified specialists preserve and analyze relevant material, develop a timeline and record findings and limitations. You receive a reviewed report to support recovery and discussions with relevant advisers or insurers.",
    inclusions: [
      "Initial incident scoping and evidence-preservation planning.",
      "Collection and analysis within the agreed scope.",
      "Evidence-handling records and an incident timeline.",
      "Findings, limitations and relevant response recommendations.",
      "Specialist review of the final report.",
    ],
    controlHeading: "Your involvement",
    control:
      "Authorize access and coordinate with relevant technical, legal and insurance contacts. Availability and mobilization are confirmed for the engagement; do not promise immediate attendance or court/insurer acceptance.",
    whoItSuits: "Businesses needing specialist investigation and documented evidence after an incident.",
    scope:
      "Per-incident engagement; any retainer is separately scoped. Confirm the credential supporting the existing word 'Certified' before publication; if unavailable, flag the title for owner review instead of inventing a credential.",
  },
};

export type ALaCarteDetailsContent = {
  itemLabel: string;
  title: string;
  subtitle: string;
  intro: string;
  inclusions: string[];
  control: string;
  whoItSuits: string;
};

// Transcribed exactly from ORAGROL_Details_Claude_Complete.md, section 8.
// "What's included" in the source is a semicolon-separated inline list for
// this family (shorter entries); split into an array here to reuse the
// same bulleted-list rendering as every other family, per "Use short
// lists, not dense two-column tables."
export const aLaCarteDetailsContent: Record<string, ALaCarteDetailsContent> = {
  "C01-S04": {
    itemLabel: "À LA CARTE",
    title: "Virtual CISO",
    subtitle: "Give your security program clear direction.",
    intro:
      "A virtual CISO provides security leadership on an agreed basis, reviewing risk, setting priorities and coordinating the security roadmap. The service connects findings with business decisions and accountable owners. You receive prioritized recommendations and progress reporting without assuming a full-time internal appointment.",
    inclusions: ["Risk and priority reviews", "Roadmap coordination", "Security reporting and decision support"],
    control: "Leadership advice does not authorize spending or changes on your behalf. Meeting frequency and deliverables are agreed.",
    whoItSuits: "Businesses needing security leadership and clearer accountability.",
  },
  "C07-S04": {
    itemLabel: "À LA CARTE",
    title: "Secure Software Development",
    subtitle: "Build security into your development workflow.",
    intro:
      "Integrate agreed security checks into the way your team develops and releases software. The service identifies relevant weaknesses during development and helps route findings to the people who can address them. You receive development-focused findings and guidance within the supported toolchain.",
    inclusions: ["Development security checks", "Findings triage", "Remediation guidance and workflow integration"],
    control: "Repositories, checks and release rules are agreed. Your team retains release authority; remediation ownership is defined at setup.",
    whoItSuits: "Teams building or maintaining software.",
  },
  "C08-S03": {
    itemLabel: "À LA CARTE",
    title: "Data Privacy Management",
    subtitle: "Put privacy responsibilities into everyday practice.",
    intro:
      "Coordinate the policies, records and recurring tasks involved in handling personal information. The service helps identify gaps between documented responsibilities and actual data-handling practices. You receive an organized privacy work plan and issues for review, with applicable requirements confirmed for your business.",
    inclusions: ["Privacy-program coordination", "Records and policy review", "Issue tracking and improvement recommendations"],
    control: "Sensitive privacy decisions and legal interpretation require appropriate review. Jurisdictions and covered activities are agreed.",
    whoItSuits: "Businesses needing a more consistent approach to personal information.",
  },
  "C09-S01": {
    itemLabel: "À LA CARTE",
    title: "AI Security Assessment",
    subtitle: "Understand the risks in your AI use.",
    intro:
      "A scoped assessment reviews the AI tools and use cases identified for your business. It examines relevant data flows, permissions and security concerns before further adoption or changes. You receive findings and prioritized recommendations for the assessed tools.",
    inclusions: ["Agreed AI inventory review", "Risk and data-flow assessment", "Prioritized findings"],
    control: "A one-time assessment of named tools and use cases, not automatic coverage of every AI system.",
    whoItSuits: "Businesses evaluating current or proposed AI use.",
  },
  "C09-S02": {
    itemLabel: "À LA CARTE",
    title: "AI Governance & Risk Mgmt",
    subtitle: "Establish clear rules for responsible AI use.",
    intro:
      "Develop the ownership, review and approval practices needed to govern AI within your business. The service connects identified AI use cases with risk records and practical operating rules. You receive a governance framework and actions to keep responsibilities visible as adoption changes.",
    inclusions: ["AI-use policies", "Ownership and approval rules", "Risk tracking and review coordination"],
    control: "Your leadership approves policies and risk decisions. Review cadence and covered use cases are agreed.",
    whoItSuits: "Businesses expanding AI use across teams.",
  },
  "C05-S03": {
    itemLabel: "À LA CARTE",
    title: "Privileged Access Mgmt",
    subtitle: "Strengthen control of powerful accounts.",
    intro:
      "Apply agreed controls to privileged accounts and the access they enable. The service helps limit unnecessary privileges and monitor supported administrative activity. You receive visibility into covered accounts, exceptions and recommended corrective actions.",
    inclusions: ["Privileged-account scope review", "Access controls", "Monitoring and exception reporting"],
    control: "Covered systems, access approvals and emergency access procedures are agreed before changes.",
    whoItSuits: "Businesses needing stronger oversight of administrative access.",
  },
  "C05-S05": {
    itemLabel: "À LA CARTE",
    title: "Zero Trust Access Security",
    subtitle: "Make access depend on verified context.",
    intro:
      "Strengthen access decisions using identity, device and other supported context signals. The service applies agreed access policies rather than relying solely on network location. You receive configured controls and visibility into relevant access exceptions.",
    inclusions: ["Access-policy design", "Supported identity/context checks", "Exception review"],
    control: "Connections and enforcement policies are agreed. Sensitive access changes follow approval rules.",
    whoItSuits: "Businesses managing access across distributed teams and systems.",
  },
  "C06-S04": {
    itemLabel: "À LA CARTE",
    title: "Cloud Network Security",
    subtitle: "Strengthen the boundaries in your cloud environment.",
    intro:
      "Review and configure agreed cloud-network controls to limit unnecessary exposure and movement between resources. The service focuses on the cloud environments and network paths in scope. You receive findings, configured protections where authorized and priorities for further improvement.",
    inclusions: ["Network exposure review", "Segmentation and access-rule work", "Monitoring or review as scoped"],
    control: "Cloud accounts and change permissions are defined before work. Segmentation reduces risk; it does not guarantee containment.",
    whoItSuits: "Businesses operating cloud networks and connected workloads.",
  },
  "C09-S03": {
    itemLabel: "À LA CARTE",
    title: "AI Model Security",
    subtitle: "Address threats to your deployed AI models.",
    intro:
      "Assess and strengthen the security of supported AI models and their deployment interfaces. The service considers relevant misuse, manipulation and model-access risks within the agreed use cases. You receive findings and protective measures suited to the model environment.",
    inclusions: ["Model security review", "Relevant protective-control configuration", "Findings and recommendations"],
    control: "Supported models and test methods are agreed. Model security does not guarantee every generated answer is correct.",
    whoItSuits: "Businesses deploying or operating AI models.",
  },
  "C09-S04": {
    itemLabel: "À LA CARTE",
    title: "AI Data Security & Privacy",
    subtitle: "Protect information used by your AI workflows.",
    intro:
      "Examine and strengthen handling of data entering, leaving or supporting your AI systems. The service focuses on agreed prompts, outputs, datasets and their access paths. You receive visibility into relevant exposure and practical controls for covered data flows.",
    inclusions: ["AI data-flow review", "Handling and access controls", "Exposure findings and recommendations"],
    control: "Covered data sources and permitted processing are agreed. Privacy-sensitive decisions are referred for review.",
    whoItSuits: "Businesses using sensitive information in AI workflows.",
  },
  "C09-S05": {
    itemLabel: "À LA CARTE",
    title: "AI Threat Detection & Protection",
    subtitle: "Watch for suspicious activity in your AI systems.",
    intro:
      "Monitor supported AI activity for relevant signs of abuse, manipulation or other threats. The service uses available signals and agreed detection rules to identify cases needing investigation. You receive alerts and scoped response guidance or protective actions where authorized.",
    inclusions: ["Supported AI monitoring", "Alert triage", "Agreed response and escalation rules"],
    control: "Signal availability, monitoring coverage and response permissions are confirmed at setup. No claim to detect every AI attack.",
    whoItSuits: "Businesses needing operational oversight of AI-specific threats.",
  },
  "C07-S05": {
    itemLabel: "À LA CARTE",
    title: "Application Security Testing",
    subtitle: "Identify weaknesses in a defined application.",
    intro:
      "Test a specific application using methods agreed for its scope and risk profile. The service examines relevant weaknesses and records findings that your team can investigate and address. You receive prioritized remediation guidance supported by the testing evidence.",
    inclusions: ["Application scope confirmation", "Agreed security testing", "Findings and remediation guidance"],
    control:
      "Targets, authorization and methods are agreed. This item is not automatically identical to a full penetration-testing engagement; manual exploitation and retesting must be confirmed in scope.",
    whoItSuits: "Businesses preparing to release or improve an application.",
  },
};
