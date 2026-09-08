import type { NavItem } from "./oragrol-mega-nav";

/**
 * Single source of truth for the site's top-level navigation, shared by
 * every page's header. Mirrors the real, existing top-nav link set and
 * order every page already used before the mega-nav (Services / Business
 * Automation / OR ONE / Industries / Resources / Company) — no new
 * top-level items added, none renamed.
 *
 * Group links point at real, existing destinations only:
 * - Services: the 3 real sections on the rebuilt /services page (2026-09-08
 *   — four packages, twelve à-la-carte services, four specialist
 *   engagements), using that page's own real `id="service-packages"` /
 *   `id="individual-services"` / `id="specialist-engagements"` anchors.
 *   Replaces the old 10-category radial index's `#or10-cat-N` anchors,
 *   which no longer exist on the page after that rebuild.
 * - Business Automation: the 6 real job tabs on /business-automation, each
 *   given a real `id="ba-job-<slug>"` anchor + hash-select effect (slugs
 *   are the jobs' own existing `id` field, not invented).
 * - Industries: the 9 real industries on /industries, using the page's
 *   own pre-existing `id="industry-tab-N"` anchors (now wired to a
 *   hash-select effect too).
 * - Resources: the 16 real articles on /resources, using their own
 *   pre-existing real `/resources/<slug>` routes.
 *
 * OR ONE and Company stay plain direct links — both are a single
 * narrative page with no independently navigable sub-content (OR ONE has
 * two generic layout-flow anchors, `#one-intro`/`#team-builder`, not
 * distinct sub-pages worth a dropdown; Company has one, `#company-story`).
 *
 * Single-column dropdowns for Services/Business Automation/Industries (no
 * invented group titles/category-of-categories) — none of those three
 * pages' real content has a further real grouping layer above its own list
 * of items, so forcing multi-column grouping there would invent structure
 * the source content doesn't have. Resources is the one exception: its 16
 * links overflowed a single column into an internally-scrolling panel, so
 * it's chunked into 3 untitled groups purely for layout (same links, same
 * order — no new category names, just a wider card instead of a tall one).
 */
export const NAV_ITEMS: NavItem[] = [
  {
    label: "Services",
    href: "/services",
    groups: [
      {
        links: [
          { label: "Four Packages", href: "/services#service-packages" },
          { label: "Individual Services", href: "/services#individual-services" },
          { label: "Specialist Engagements", href: "/services#specialist-engagements" },
        ],
      },
    ],
  },
  {
    label: "Business Automation",
    href: "/business-automation",
    groups: [
      {
        links: [
          { label: "Sales", href: "/business-automation#ba-job-sales-flow" },
          { label: "Customer Service", href: "/business-automation#ba-job-customer-support" },
          { label: "Finance", href: "/business-automation#ba-job-operational-intelligence" },
          { label: "IT", href: "/business-automation#ba-job-managed-it" },
          { label: "Marketing", href: "/business-automation#ba-job-customer-growth" },
          { label: "Tailored Automation", href: "/business-automation#ba-job-tailored" },
        ],
      },
    ],
  },
  { label: "OR ONE", href: "/or-one" },
  {
    label: "Industries",
    href: "/industries",
    groups: [
      {
        links: [
          { label: "Professional Services", href: "/industries#industry-tab-0" },
          { label: "Healthcare", href: "/industries#industry-tab-1" },
          { label: "Financial Services", href: "/industries#industry-tab-2" },
          { label: "Retail & E-commerce", href: "/industries#industry-tab-3" },
          { label: "Manufacturing", href: "/industries#industry-tab-4" },
          { label: "Technology", href: "/industries#industry-tab-5" },
          { label: "Construction & Real Estate", href: "/industries#industry-tab-6" },
          { label: "Education", href: "/industries#industry-tab-7" },
          { label: "Other Canadian SMBs", href: "/industries#industry-tab-8" },
        ],
      },
    ],
  },
  {
    label: "Resources",
    href: "/resources",
    // Split into 3 untitled groups purely so the panel lays out as a wide
    // multi-column card instead of one tall single column that has to
    // scroll internally — same 16 real links/routes/order as before, just
    // chunked for layout. No new category titles invented; each group
    // still renders with no <h2>, so nothing implies a real topic split
    // that doesn't exist.
    groups: [
      {
        links: [
          { label: "What Is a Cyber Health Score?", href: "/resources/what-is-a-cyber-health-score" },
          { label: "MFA: The One Control That Stops Most Breaches", href: "/resources/mfa-one-control-stops-most-breaches" },
          { label: "Ransomware Recovery: What Canadian SMBs Get Wrong", href: "/resources/ransomware-recovery-canadian-smbs" },
          { label: "Email Security Basics for Small Business", href: "/resources/email-security-basics-small-business" },
          { label: "Cybersecurity for Professional Services Firms", href: "/resources/cybersecurity-professional-services-firms" },
          { label: "Understanding PIPEDA: What It Means for Your Business", href: "/resources/understanding-pipeda-business" },
        ],
      },
      {
        links: [
          { label: "Cyber Insurance Readiness Checklist", href: "/resources/cyber-insurance-readiness-checklist-canadian-smbs" },
          { label: "DMARC Enforcement: Monitoring to p=reject", href: "/resources/dmarc-enforcement-p-reject" },
          { label: "The First 24 Hours of a Cyber Incident", href: "/resources/first-24-hours-cyber-incident" },
          { label: "Vendor Risk Before You Grant Access", href: "/resources/vendor-risk-before-granting-access" },
          { label: "A Practical AI Use Policy for Canadian Businesses", href: "/resources/practical-ai-use-policy-canadian-businesses" },
        ],
      },
      {
        links: [
          { label: "Microsoft 365 Security Baseline for an SMB", href: "/resources/microsoft-365-security-baseline-smb" },
          { label: "Cybersecurity for Accounting and Bookkeeping Firms", href: "/resources/cybersecurity-accounting-bookkeeping-firms" },
          { label: "Canadian SMB Cyber-Risk Brief 2026", href: "/resources/canadian-smb-cyber-risk-brief-2026" },
          { label: "Business Automation Readiness Assessment", href: "/resources/business-automation-readiness-assessment" },
          { label: "When Separate Automations Should Become OR ONE", href: "/resources/when-automations-become-or-one" },
        ],
      },
    ],
  },
  { label: "Company", href: "/company" },
];
