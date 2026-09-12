import type { ReactNode } from "react";

function ItemsTable({ left, right }: { left: string[]; right: string[] }) {
  const rows = Math.max(left.length, right.length);
  return (
    <table className="mb-3">
      <tbody>
        {Array.from({ length: rows }).map((_, i) => (
          <tr key={i}>
            <td className="py-0.5 pr-3">{left[i] ?? ""}</td>
            <td className="py-0.5">{right[i] ?? ""}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const guideFixBlock = (
  <>
    <p className="mb-3">
      Our services split into two real types: <strong>GUIDE</strong>, ongoing oversight, policies, and
      assessments, and <strong>FIX</strong>, automatic action with a real, measured response time.
      &quot;Device Guard isolates a compromised laptop in minutes&quot; isn&apos;t a claim, it&apos;s a
      number. That&apos;s the real difference between us and a company with no real security function, or
      one that just hands you a PDF report. A report tells you what&apos;s wrong. A number tells you what
      happened, and how fast we solved it.
    </p>
    <p className="mb-1">
      1. Every FIX service has a real, stated response time, isolated in minutes, blocked before delivery,
      contained in minutes. A report has no response time, it&apos;s static the moment it&apos;s delivered.
    </p>
    <p className="mb-1">
      2. Action happens automatically, not after someone reads a document and decides to act. The system
      responds in real time, a human analyst validates and steps in on anything serious, but the clock
      doesn&apos;t wait for someone to open a PDF next Monday.
    </p>
    <p className="mb-3">
      3. The report exists too, but it&apos;s a record of what already happened, not the deliverable itself.
    </p>
    <p className="mb-3">
      <sub>
        All ORAGROL services include human-validated response. Our own security analysts confirm and act on
        real threats, not the AI alone.
      </sub>
    </p>
  </>
);

export type ServicesInfoItem = { id: string; title: string; content: ReactNode; plainText: string };

// ---- Packages (4), modal variant ----
export const packagesInfoItems: ServicesInfoItem[] = [
  {
    id: "foundation",
    title: "Foundation",
    content: (
      <>
        <p className="mb-3">
          Foundation is your starting cybersecurity package, the core protections every business needs in
          place before anything else. 6 services, always running, covering the risks that hit small
          businesses most often.
        </p>
        <p className="mb-2 font-semibold">This package will deliver the following to you:</p>
        <ItemsTable
          left={["1. Security Rules Setup", "2. Security Weakness Check", "3. Device Guard"]}
          right={["4. Mail Shield", "5. Staff Security", "6. Login Shield"]}
        />
        {guideFixBlock}
        <p className="mb-3">
          <strong>Scale:</strong> Does the daily work of a security operations team watching your
          environment around the clock, not a once-a-quarter check.
        </p>
        <p>
          <strong>Who it&apos;s for:</strong> Businesses with no dedicated security function today, who need
          real, continuous protection in place, not a one-time assessment.
        </p>
      </>
    ),
    plainText:
      "Foundation, your starting cybersecurity package, 6 services always running: Security Rules Setup, Security Weakness Check, Device Guard, Mail Shield, Staff Security, Login Shield. Does the daily work of a security operations team watching your environment around the clock. Who it's for: businesses with no dedicated security function today, who need real, continuous protection.",
  },
  {
    id: "advanced",
    title: "Advanced",
    content: (
      <>
        <p className="mb-3">
          Advanced builds on Foundation with real vulnerability tracking, vendor risk, and access control on
          top of your core protections. 12 services, always running.
        </p>
        <p className="mb-2 font-semibold">This package will deliver the following to you:</p>
        <ItemsTable
          left={[
            "1. Security Rules Setup",
            "2. Security Weakness Check",
            "3. Device Guard",
            "4. Mail Shield",
            "5. Staff Security",
            "6. Login Shield",
          ]}
          right={[
            "7. Compliance Check",
            "8. Vendor Watch",
            "9. AI Security Monitoring",
            "10. Threat Watch",
            "11. Access Manager",
            "12. Access Governance",
          ]}
        />
        {guideFixBlock}
        <p className="mb-3">
          <strong>Scale:</strong> Does the daily work of a security operations team plus a compliance and
          vendor-risk analyst, continuous coverage no single hire could match.
        </p>
        <p>
          <strong>Who it&apos;s for:</strong> Businesses that need to show real compliance, manage
          third-party vendor risk, and control who has access to what, not just endpoint and email
          protection alone.
        </p>
      </>
    ),
    plainText:
      "Advanced, 12 services always running: Security Rules Setup, Security Weakness Check, Device Guard, Mail Shield, Staff Security, Login Shield, Compliance Check, Vendor Watch, AI Security Monitoring, Threat Watch, Access Manager, Access Governance. Does the daily work of a security operations team plus a compliance and vendor-risk analyst. Who it's for: businesses that need to show real compliance, manage third-party vendor risk, and control access.",
  },
  {
    id: "comprehensive",
    title: "Comprehensive",
    content: (
      <>
        <p className="mb-3">
          Comprehensive extends full coverage into your cloud, infrastructure, and applications, everywhere
          your business actually runs. 22 services, always running.
        </p>
        <p className="mb-2 font-semibold">This package will deliver the following to you:</p>
        <ItemsTable
          left={[
            "1. Security Rules Setup",
            "2. Security Weakness Check",
            "3. Device Guard",
            "4. Mail Shield",
            "5. Staff Security",
            "6. Login Shield",
            "7. Compliance Check",
            "8. Vendor Watch",
            "9. AI Security Monitoring",
            "10. Threat Watch",
            "11. Access Manager",
          ]}
          right={[
            "12. Access Governance",
            "13. Cloud Guard",
            "14. Workload Shield",
            "15. Infra Guard",
            "16. Cloud Compliance",
            "17. App Shield",
            "18. Web Shield",
            "19. API Guard",
            "20. Data Shield",
            "21. Data Guard",
            "22. Data Classifier",
          ]}
        />
        {guideFixBlock}
        <p className="mb-3">
          <strong>Scale:</strong> Does the daily work of a full security operations team plus cloud,
          infrastructure, and application security specialists, coverage a small business could never staff
          internally.
        </p>
        <p>
          <strong>Who it&apos;s for:</strong> Businesses running real infrastructure, cloud environments, and
          customer-facing applications, that need every layer protected, not just the network edge.
        </p>
      </>
    ),
    plainText:
      "Comprehensive, 22 services always running, extends full coverage into cloud, infrastructure, and applications. Does the daily work of a full security operations team plus cloud, infrastructure, and application security specialists. Who it's for: businesses running real infrastructure, cloud environments, and customer-facing applications.",
  },
  {
    id: "elite",
    title: "Elite",
    content: (
      <>
        <p className="mb-3">
          Elite adds active threat response and continuous data monitoring on top of full coverage, the
          complete package. 25 services, always running.
        </p>
        <p className="mb-2 font-semibold">This package will deliver the following to you:</p>
        <ItemsTable
          left={[
            "1. Security Rules Setup",
            "2. Security Weakness Check",
            "3. Device Guard",
            "4. Mail Shield",
            "5. Staff Security",
            "6. Login Shield",
            "7. Compliance Check",
            "8. Vendor Watch",
            "9. AI Security Monitoring",
            "10. Threat Watch",
            "11. Access Manager",
            "12. Access Governance",
            "13. Cloud Guard",
          ]}
          right={[
            "14. Workload Shield",
            "15. Infra Guard",
            "16. Cloud Compliance",
            "17. App Shield",
            "18. Web Shield",
            "19. API Guard",
            "20. Data Shield",
            "21. Data Guard",
            "22. Data Classifier",
            "23. Managed Threat Response",
            "24. Security Response",
            "25. Data Watch",
          ]}
        />
        {guideFixBlock}
        <p className="mb-3">
          <strong>Scale:</strong> Does the daily work of a complete security department, monitoring,
          response, and continuous data protection, running around the clock.
        </p>
        <p>
          <strong>Who it&apos;s for:</strong> Businesses that need everything covered and a real team
          actively responding the moment something goes wrong, not just monitored and reported on.
        </p>
      </>
    ),
    plainText:
      "Elite, 25 services always running, adds active threat response and continuous data monitoring on top of full coverage. Does the daily work of a complete security department, monitoring, response, and continuous data protection. Who it's for: businesses that need everything covered and a real team actively responding.",
  },
];

// ---- Individual Services (12), popover variant — Avoids/Saves format ----
export const individualServicesInfoItems: Record<string, { content: ReactNode; plainText: string }> = {
  "C01-S04": {
    content: (
      <>
        <p className="mb-2">
          A senior security leader for your business, without hiring one full-time. Reviews everything your
          other security services find and keeps your whole security program moving with real
          accountability behind it.
        </p>
        <p className="mb-1">
          <strong>Avoids:</strong> Wasted spend on the wrong priorities, and security decisions made by
          nobody in particular.
        </p>
        <p>
          <strong>Saves:</strong> The cost of a full-time Chief Information Security Officer, typically
          $200,000+ a year.
        </p>
      </>
    ),
    plainText:
      "Virtual CISO: a senior security leader for your business without hiring one full-time. Avoids wasted spend on the wrong priorities. Saves the cost of a full-time CISO, typically $200,000+ a year.",
  },
  "C07-S04": {
    content: (
      <>
        <p className="mb-2">
          Builds real security checks into how your development team writes and ships code, so problems get
          caught before release, not discovered by a customer or an attacker after.
        </p>
        <p className="mb-1">
          <strong>Avoids:</strong> Shipping a product with a security flaw already built in.
        </p>
        <p>
          <strong>Saves:</strong> The cost, and reputation damage, of fixing a vulnerability after it&apos;s
          already live and exploited.
        </p>
      </>
    ),
    plainText:
      "Secure Software Development: builds real security checks into how your team writes and ships code. Avoids shipping a flaw already built in. Saves the cost and reputation damage of fixing it after it's already exploited.",
  },
  "C08-S03": {
    content: (
      <>
        <p className="mb-2">
          Runs your privacy program day to day, PIPEDA and beyond, so personal data is actually handled
          correctly, not just written into a policy no one follows.
        </p>
        <p className="mb-1">
          <strong>Avoids:</strong> Mishandling customer personal data, the kind that triggers real
          regulatory penalties.
        </p>
        <p>
          <strong>Saves:</strong> Legal exposure and the fines that follow a real privacy violation.
        </p>
      </>
    ),
    plainText:
      "Data Privacy Management: runs your privacy program day to day, PIPEDA and beyond. Avoids mishandling customer personal data. Saves legal exposure and the fines that follow a real privacy violation.",
  },
  "C09-S01": {
    content: (
      <>
        <p className="mb-2">
          A one-time, thorough look at every AI tool your business already uses, mapping exactly where the
          real risk sits, before you build on top of AI tools you haven&apos;t actually checked.
        </p>
        <p className="mb-1">
          <strong>Avoids:</strong> Adopting AI tools that quietly expose your business data or systems.
        </p>
        <p>
          <strong>Saves:</strong> Discovering the risk after it&apos;s already caused a real incident.
        </p>
      </>
    ),
    plainText:
      "AI Security Assessment: a one-time, thorough look at every AI tool your business already uses. Avoids adopting AI tools that quietly expose your data. Saves discovering the risk after a real incident.",
  },
  "C09-S02": {
    content: (
      <>
        <p className="mb-2">
          Builds the real rules, ownership, and approval process your business needs as AI use grows, so AI
          adoption doesn&apos;t become the one risk nobody&apos;s actually watching.
        </p>
        <p className="mb-1">
          <strong>Avoids:</strong> AI tools spreading through your business unmonitored, with no one
          accountable for what they do.
        </p>
        <p>
          <strong>Saves:</strong> The cleanup cost of an ungoverned AI mistake, far more expensive than
          governing it from the start.
        </p>
      </>
    ),
    plainText:
      "AI Governance & Risk Management: builds the real rules, ownership, and approval process as AI use grows. Avoids AI spreading unmonitored. Saves the cleanup cost of an ungoverned AI mistake.",
  },
  "C05-S03": {
    content: (
      <>
        <p className="mb-2">
          Locks down and actively monitors every admin-level account in your business, the ones that can do
          the most damage if a hacker ever gets hold of one.
        </p>
        <p className="mb-1">
          <strong>Avoids:</strong> One stolen admin password turning into full control of your entire
          business.
        </p>
        <p>
          <strong>Saves:</strong> The cost of a total system compromise instead of one contained account.
        </p>
      </>
    ),
    plainText:
      "Privileged Access Management: locks down and monitors every admin-level account. Avoids one stolen admin password turning into full control of your business. Saves the cost of a total compromise instead of one contained account.",
  },
  "C05-S05": {
    content: (
      <>
        <p className="mb-2">
          Rebuilds how access decisions get made, checking identity, device, and context every time, instead
          of assuming anyone already inside your network can be trusted.
        </p>
        <p className="mb-1">
          <strong>Avoids:</strong> An attacker who gets past your front door having free run of everything
          behind it.
        </p>
        <p>
          <strong>Saves:</strong> The difference between a contained incident and a full breach.
        </p>
      </>
    ),
    plainText:
      "Zero Trust Access Security: checks identity, device, and context every time instead of assuming trust. Avoids an attacker having free run once past the front door. Saves the difference between a contained incident and a full breach.",
  },
  "C06-S04": {
    content: (
      <>
        <p className="mb-2">
          Segments and locks down your network so a breach in one part of your business can&apos;t
          automatically spread to everything else.
        </p>
        <p className="mb-1">
          <strong>Avoids:</strong> One compromised device taking down your whole operation.
        </p>
        <p>
          <strong>Saves:</strong> The scope, and cost, of an incident, contained to one corner instead of
          everywhere.
        </p>
      </>
    ),
    plainText:
      "Cloud Network Security: segments and locks down your network so a breach can't spread. Avoids one compromised device taking down your whole operation. Saves the scope and cost of an incident, contained instead of everywhere.",
  },
  "C09-S03": {
    content: (
      <>
        <p className="mb-2">
          Protects the actual AI models your business runs in production from being manipulated, tricked, or
          stolen outright.
        </p>
        <p className="mb-1">
          <strong>Avoids:</strong> An AI model being tricked into producing harmful, wrong, or leaked output.
        </p>
        <p>
          <strong>Saves:</strong> The cost of rebuilding trust, and the model itself, after it&apos;s been
          compromised.
        </p>
      </>
    ),
    plainText:
      "AI Model Security: protects the actual AI models you run in production from manipulation or theft. Avoids a model being tricked into harmful or leaked output. Saves the cost of rebuilding trust and the model after compromise.",
  },
  "C09-S04": {
    content: (
      <>
        <p className="mb-2">
          Protects the actual data flowing into and out of your AI tools, the prompts, the outputs, the
          training data, specifically, not just your general business data.
        </p>
        <p className="mb-1">
          <strong>Avoids:</strong> Sensitive business or customer information leaking out through an AI tool
          nobody was watching.
        </p>
        <p>
          <strong>Saves:</strong> The exposure of data your general data security tools were never built to
          see.
        </p>
      </>
    ),
    plainText:
      "AI Data Security & Privacy: protects the data flowing into and out of your AI tools specifically. Avoids sensitive information leaking through an unwatched AI tool. Saves the exposure your general data tools were never built to see.",
  },
  "C09-S05": {
    content: (
      <>
        <p className="mb-2">
          Watches for attacks aimed specifically at your AI systems, prompt injection, abuse, and suspicious
          activity that normal security tools aren&apos;t built to catch.
        </p>
        <p className="mb-1">
          <strong>Avoids:</strong> An AI-specific attack going completely undetected because it doesn&apos;t
          look like a traditional threat.
        </p>
        <p>
          <strong>Saves:</strong> The blind spot regular security monitoring leaves wide open on anything
          AI-related.
        </p>
      </>
    ),
    plainText:
      "AI Threat Detection & Protection: watches for attacks aimed specifically at your AI systems. Avoids an AI-specific attack going undetected. Saves the blind spot regular monitoring leaves open on anything AI-related.",
  },
  "C07-S05": {
    content: (
      <>
        <p className="mb-2">
          A real, hands-on test of your specific application, the way an actual attacker would try to break
          in, with a clear, fix-ready report of exactly what needs closing.
        </p>
        <p className="mb-1">
          <strong>Avoids:</strong> Finding out your application had a serious flaw only after someone else
          found it first.
        </p>
        <p>
          <strong>Saves:</strong> The cost of a breach through your own application versus catching it in a
          controlled test.
        </p>
      </>
    ),
    plainText:
      "Application Security Testing: a real, hands-on test of your application the way an attacker would. Avoids finding out about a flaw only after someone else did. Saves the cost of a breach versus catching it in a controlled test.",
  },
};

// ---- Specialist Engagements (4), modal variant — titles match the real page names ----
export const specialistInfoItems: Record<string, ServicesInfoItem> = {
  "C10-S01": {
    id: "C10-S01",
    title: "Penetration Testing",
    content: (
      <>
        <p className="mb-3">
          A real, certified ethical hacker is authorized to actually try to break into your systems, the
          same way a real attacker would, so you know your actual exposure, not a guess.
        </p>
        <p className="mb-2 font-semibold">What happens:</p>
        <p className="mb-1">1. We agree with you exactly what&apos;s in scope, and what&apos;s off-limits</p>
        <p className="mb-1">2. A certified specialist attempts real exploitation within that agreed scope</p>
        <p className="mb-1">3. Every step and finding is documented as evidence</p>
        <p className="mb-1">4. Our AI tools help organize that evidence into a clear report</p>
        <p className="mb-3">5. Our licensed specialist reviews and signs off on the final report before you see it</p>
        <p className="mb-3">
          <strong>Who does the actual work:</strong> A real, certified human tester. This is the one service
          where the hands-on work is intentionally not AI, some things need a real person actually trying to
          break in.
        </p>
        <p>
          <strong>Who it&apos;s for:</strong> Businesses that need real proof, not a guess, whether for an
          insurer, a bigger customer&apos;s due diligence, or their own peace of mind.
        </p>
      </>
    ),
    plainText:
      "Penetration Testing: a real, certified ethical hacker attempts to break into your systems within an agreed scope, documents every finding, and a licensed specialist reviews and signs off before you see the report. Who it's for: businesses that need real proof for an insurer, a customer's due diligence, or their own peace of mind.",
  },
  "C10-S02": {
    id: "C10-S02",
    title: "SOC 2 Type II Attestation",
    content: (
      <>
        <p className="mb-3">
          We build the real evidence and controls your business needs for SOC 2, then a licensed CPA reviews
          everything and signs the final attestation.
        </p>
        <p className="mb-2 font-semibold">What happens:</p>
        <p className="mb-1">1. We assess your current controls against what SOC 2 actually requires</p>
        <p className="mb-1">2. We build and organize the evidence your business is missing</p>
        <p className="mb-1">3. Our AI tools help track and structure that evidence over the monitoring period</p>
        <p className="mb-1">4. A licensed CPA reviews the complete evidence and controls</p>
        <p className="mb-3">5. The CPA signs the final attestation, the real, official document</p>
        <p className="mb-3">
          <strong>Who does the actual work:</strong> A licensed CPA signs off. This is a real, official
          attestation, not a report we write ourselves.
        </p>
        <p>
          <strong>Who it&apos;s for:</strong> Businesses that need to prove real, audited security controls,
          usually to win or keep enterprise customers who require it.
        </p>
      </>
    ),
    plainText:
      "SOC 2 Type II Attestation: we build the real evidence and controls, then a licensed CPA reviews everything and signs the final attestation. Who it's for: businesses that need to prove real, audited security controls to win or keep enterprise customers.",
  },
  "C10-S03": {
    id: "C10-S03",
    title: "PCI-DSS QSA Assessment",
    content: (
      <>
        <p className="mb-3">
          We build the real evidence and control mapping your business needs to handle card payments
          securely, then a certified QSA reviews and signs off.
        </p>
        <p className="mb-2 font-semibold">What happens:</p>
        <p className="mb-1">1. We assess your current setup against PCI-DSS requirements for your merchant level</p>
        <p className="mb-1">2. We build and organize the evidence and control mapping</p>
        <p className="mb-1">3. Our AI tools help track that evidence throughout the year</p>
        <p className="mb-1">4. A certified QSA reviews the complete assessment</p>
        <p className="mb-3">5. The QSA signs off on the final assessment, the real, official document</p>
        <p className="mb-3">
          <strong>Who does the actual work:</strong> A certified QSA signs off. This is a real, official
          assessment, required to legally handle certain volumes of card payments.
        </p>
        <p>
          <strong>Who it&apos;s for:</strong> Businesses processing card payments that need to prove real
          PCI-DSS compliance, not just claim it.
        </p>
      </>
    ),
    plainText:
      "PCI-DSS QSA Assessment: we build the real evidence and control mapping, then a certified QSA reviews and signs off. Who it's for: businesses processing card payments that need to prove real PCI-DSS compliance.",
  },
  "C10-S04": {
    id: "C10-S04",
    title: "Certified Forensic IR",
    content: (
      <>
        <p className="mb-3">
          If your business is breached, a certified forensic investigator builds a real, legally admissible
          record of exactly what happened, when, and how it was contained.
        </p>
        <p className="mb-2 font-semibold">What happens:</p>
        <p className="mb-1">1. A certified forensic investigator is engaged the moment a real incident is confirmed</p>
        <p className="mb-1">2. They investigate and document exactly what happened, step by step</p>
        <p className="mb-1">3. Our AI tools help organize the evidence and timeline</p>
        <p className="mb-1">4. The investigator builds a report that holds up legally and with insurers</p>
        <p className="mb-3">5. You receive a real, certified record, not just our own account of events</p>
        <p className="mb-3">
          <strong>Who does the actual work:</strong> A certified forensic investigator. This is real
          evidence, built to hold up in court or with an insurance claim, not an internal summary.
        </p>
        <p>
          <strong>Who it&apos;s for:</strong> Businesses that need real, certified proof after a breach, for
          insurance, legal protection, or regulatory requirements.
        </p>
      </>
    ),
    plainText:
      "Certified Forensic Incident Response: a certified forensic investigator builds a real, legally admissible record of what happened, when, and how it was contained. Who it's for: businesses that need real, certified proof after a breach.",
  },
};
