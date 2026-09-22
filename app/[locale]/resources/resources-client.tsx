"use client";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import PreFooterCta from "@/app/components/site/pre-footer-cta";
import SiteFooter from "@/app/components/site/footer";
import OragrolMegaNav from "@/app/components/site/oragrol-mega-nav";
import { NAV_ITEMS } from "@/app/components/site/nav-items";
import "@/app/gpt-pages.css";

/**
 * Bilingual (D-086, Task #21, Phase 2i): rewired to consume the
 * `Resources` namespace in messages/{en,fr}.json, sourced from
 * `ORAGROL_Resources_FR_Translation.md`. The canonical `resources`
 * array below stays untouched (hrefs, order, slice indices the two
 * card grids depend on) -- display text (title/type/summary) is
 * pulled from `t.raw("items")`, index-paired 1:1 against `resources`
 * in the same order, same pattern used throughout this project. Also
 * fixed the dead `<button>EN / FR</button>` into a working locale
 * switch, and switched `Link`/`usePathname` to `@/i18n/navigation`.
 */

type Resource = {
  title: string;
  type: string;
  path: string;
  topic: string;
  industry: string;
  read: string;
  summary: string;
  href?: string;
  featured?: boolean;
};

const resources: Resource[] = [
  {
    title: "What Is a Cyber Health Score?",
    type: "Article",
    path: "Protect",
    topic: "Cyber Health",
    industry: "General SMB",
    read: "3 min",
    summary:
      "A plain-language breakdown of what the score measures, how it is calculated and why a useful baseline matters more than a pass-or-fail grade.",
    href: "/resources/what-is-a-cyber-health-score",
    featured: true,
  },
  {
    title: "MFA: The One Control That Stops Most Breaches",
    type: "Article",
    path: "Protect",
    topic: "Identity & Access",
    industry: "General SMB",
    read: "4 min",
    summary:
      "How Canadian SMBs should prioritize MFA, choose stronger authentication and avoid common implementation mistakes.",
    href: "/resources/mfa-one-control-stops-most-breaches",
  },
  {
    title: "Ransomware Recovery: What Canadian SMBs Get Wrong",
    type: "Article",
    path: "Protect",
    topic: "Incident Response",
    industry: "General SMB",
    read: "4 min",
    summary:
      "Why an untested backup is not a recovery plan—and which gaps should be resolved before disruption becomes a crisis.",
    href: "/resources/ransomware-recovery-canadian-smbs",
  },
  {
    title: "Email Security Basics for Small Business",
    type: "Article",
    path: "Protect",
    topic: "Email Security",
    industry: "General SMB",
    read: "4 min",
    summary:
      "A practical email-security program protects the mailbox, the business domain and the people making financial decisions.",
    href: "/resources/email-security-basics-small-business",
  },
  {
    title: "Cybersecurity for Professional Services Firms: A Practical Guide",
    type: "Guide",
    path: "Protect",
    topic: "Industry Security",
    industry: "Professional Services",
    read: "5 min",
    summary:
      "Cybersecurity as part of client trust, business continuity and operational discipline for professional firms.",
    href: "/resources/cybersecurity-professional-services-firms",
  },
  {
    title: "Understanding PIPEDA: What It Means for Your Business",
    type: "Article",
    path: "Protect",
    topic: "Privacy & Compliance",
    industry: "General SMB",
    read: "5 min",
    summary:
      "Where Canadian privacy obligations and practical cybersecurity safeguards meet—and where they remain different.",
    href: "/resources/understanding-pipeda-business",
  },
  {
    title: "Cyber Insurance Readiness Checklist for Canadian SMBs",
    type: "Checklist",
    path: "Protect",
    topic: "Risk & Insurance",
    industry: "General SMB",
    read: "6 min",
    summary:
      "Organize the controls, evidence and operating information required for a stronger insurance application or renewal conversation.",
    href: "/resources/cyber-insurance-readiness-checklist-canadian-smbs",
  },
  {
    title: "DMARC Enforcement: From Monitoring to p=reject",
    type: "Guide",
    path: "Protect",
    topic: "Email Security",
    industry: "General SMB",
    read: "7 min",
    summary:
      "Move from visibility to enforcement without accidentally blocking legitimate business email.",
    href: "/resources/dmarc-enforcement-p-reject",
  },
  {
    title: "The First 24 Hours of a Cyber Incident",
    type: "Playbook",
    path: "Protect",
    topic: "Incident Response",
    industry: "General SMB",
    read: "7 min",
    summary:
      "A practical first-day structure for command, containment, evidence, communication and safe recovery.",
    href: "/resources/first-24-hours-cyber-incident",
  },
  {
    title: "Vendor Risk Before You Grant Access",
    type: "Checklist",
    path: "Protect",
    topic: "Third-Party Risk",
    industry: "General SMB",
    read: "6 min",
    summary:
      "Apply the right questions and controls before a supplier becomes part of your security environment.",
    href: "/resources/vendor-risk-before-granting-access",
  },
  {
    title: "A Practical AI Use Policy for Canadian Businesses",
    type: "Policy Guide",
    path: "Protect",
    topic: "AI Governance",
    industry: "General SMB",
    read: "7 min",
    summary:
      "Define approved tools, protected information, human accountability and operating limits without stopping responsible experimentation.",
    href: "/resources/practical-ai-use-policy-canadian-businesses",
  },
  {
    title: "Microsoft 365 Security Baseline for an SMB",
    type: "Technical Checklist",
    path: "Protect",
    topic: "Cloud & Identity",
    industry: "General SMB",
    read: "8 min",
    summary:
      "A focused baseline for identity, email, devices, collaboration, logging and recovery in Microsoft 365.",
    href: "/resources/microsoft-365-security-baseline-smb",
  },
  {
    title: "Cybersecurity for Accounting and Bookkeeping Firms",
    type: "Industry Brief",
    path: "Protect",
    topic: "Industry Security",
    industry: "Accounting & Bookkeeping",
    read: "7 min",
    summary:
      "Security priorities built around trusted email, financial information, cloud accounting and payment authority.",
    href: "/resources/cybersecurity-accounting-bookkeeping-firms",
  },
  {
    title: "Canadian SMB Cyber-Risk Brief 2026",
    type: "Executive Brief",
    path: "Protect",
    topic: "Cyber Risk",
    industry: "General SMB",
    read: "6 min",
    summary:
      "What current Canadian evidence means for leadership priorities, operational resilience and security investment.",
    href: "/resources/canadian-smb-cyber-risk-brief-2026",
  },
  {
    title: "Business Automation Readiness Assessment",
    type: "Assessment",
    path: "Automate",
    topic: "Business Automation",
    industry: "General SMB",
    read: "6 min",
    summary:
      "Five tests for choosing one valuable, bounded automation outcome before investing in tools or integrations.",
    href: "/resources/business-automation-readiness-assessment",
  },
  {
    title: "When Separate Automations Should Become OR ONE",
    type: "Executive Guide",
    path: "Unify",
    topic: "OR ONE",
    industry: "General SMB",
    read: "6 min",
    summary:
      "Recognize when several workflows, departments and controls need one coordinated secure operating system.",
    href: "/resources/when-automations-become-or-one",
  },
];

function ResourcesPageClient() {
  const t = useTranslations("Resources");
  const locale = useLocale();
  const otherLocale = locale === "fr" ? "en" : "fr";
  const pathname = usePathname();

  const items = t.raw("items") as { title: string; type: string; summary: string }[];
  // Index-paired against the canonical `resources` array above -- same
  // order, same length (16), translated display text only. `href` stays
  // canonical/English-only since it's a real route.
  const localized = resources.map((r, i) => ({ ...r, ...items[i] }));
  const essential = localized.slice(0, 6),
    newResources = localized.slice(6);

  return (
    <main className="res-page">
      <header className="industry-header res-header">
        <Link className="wordmark" href="/">
          <span>ORAGROL</span>
          <small>GLOBAL</small>
        </Link>
        <OragrolMegaNav items={NAV_ITEMS} activePath={pathname} />
        <div>
          <Link href="/cyber-health">{t("header.getCyberHealthScore")}</Link>
          <button className="search" aria-label={t("header.search")}>
            <span />
          </button>
          <Link
            className="language"
            href={pathname}
            locale={otherLocale}
            aria-label={t("header.changeLanguage")}
          >
            {locale.toUpperCase()} / {otherLocale.toUpperCase()}
          </Link>
        </div>
      </header>

      <section className="res-hero">
        <div className="res-signal" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
          <i />
          <span>OR</span>
        </div>
        <div className="res-hero-copy">
          <p>{t("hero.eyebrow")}</p>
          <h1>
            {t("hero.titleLine1")}
            <br />
            <span>{t("hero.titleLine2")}</span>
          </h1>
          <p>{t("hero.body")}</p>
          <div className="res-paths">
            <span>{t("hero.pathInsights")}</span>
            <span>{t("hero.pathGuides")}</span>
            <span>{t("hero.pathBriefs")}</span>
          </div>
          <a href="#resource-library">
            {t("hero.cta")} <b>↓</b>
          </a>
        </div>
      </section>

      <section className="res-simple-library" id="resource-library">
        <header>
          <div>
            <span>{t("essential.label")}</span>
            <h2>{t("essential.title")}</h2>
          </div>
          <p>{t("essential.body")}</p>
        </header>
        <div className="res-simple-grid">
          {essential.map((r, i) => (
            <Link className="res-simple-card" href={r.href || "#"} key={r.title}>
              <div>
                <span>
                  {String(i + 1).padStart(2, "0")} / {r.type}
                </span>
                <span>
                  {r.read} {t("readSuffix")}
                </span>
              </div>
              <h3>{r.title}</h3>
              <p>{r.summary}</p>
              <div className="res-card-action">
                <span>{t("readAction")}</span>
                <b>↗</b>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="res-simple-library res-new-library">
        <header>
          <div>
            <span>{t("newGuides.label")}</span>
            <h2>{t("newGuides.title")}</h2>
          </div>
          <p>{t("newGuides.body")}</p>
        </header>
        <div className="res-simple-grid">
          {newResources.map((r, i) => (
            <Link className="res-simple-card" href={r.href || "#"} key={r.title}>
              <div>
                <span>
                  {String(i + 7).padStart(2, "0")} / {r.type}
                </span>
                <span>
                  {r.read} {t("readSuffix")}
                </span>
              </div>
              <h3>{r.title}</h3>
              <p>{r.summary}</p>
              <div className="res-card-action">
                <span>{t("readAction")}</span>
                <b>↗</b>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <PreFooterCta page="resources" />

      <SiteFooter/>
    </main>
  );
}

export default ResourcesPageClient;
