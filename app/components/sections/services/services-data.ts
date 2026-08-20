import type { ComponentType, SVGProps } from "react";
import {
  BarChart3,
  Bug,
  Cloud,
  Code2,
  Cpu,
  Database,
  KeyRound,
  Radar,
  Settings2,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  UserRound,
  Workflow,
} from "lucide-react";
import rawData from "../../../data/oragrol-services-data.json";

/**
 * Services data layer — 2026-08-20 restructure.
 *
 * Full replacement of the D-007/D-012/D-014 8-capability structure
 * (Virtual CISO, Risk Assessment & Compliance, ...) with the real 15-
 * category / 64-service taxonomy supplied in `oragrol-services-data.json`
 * (moved from the repo root into `app/data/`, imported directly rather
 * than hand-transcribed — avoids the exact transcription-drift risk D-052
 * caught on Resources). The JSON has no `live`/`finalizing` status field
 * anywhere, confirmed before building — this restructure renders all 15
 * categories/64 services uniformly, no status distinction invented.
 *
 * Pricing: only the JSON's own `price`/`unit` fields are used, per
 * Mohammad's explicit choice — `oragrol-pricing-reference.csv`'s richer
 * breakdown (setup fee, annual, month-to-month, bundle role, confidence)
 * stays a reference file, not wired into the page.
 */

export interface RawService {
  code: string;
  name: string;
  blurb: string;
  price: string;
  unit: string;
  problem: string;
  what_we_do: string;
  deliverables: string[];
  benefits: string[];
  process: string;
  outcome: string;
}

export interface RawCategory {
  code: string;
  name: string;
  tagline: string;
  tier: string;
  services: RawService[];
}

interface RawData {
  services_tier1: RawCategory[];
  business_automation_tier2: RawCategory[];
}

const data = rawData as RawData;

export type LucideIconComponent = ComponentType<SVGProps<SVGSVGElement>>;

/**
 * One icon per category, keyed by the category's own real code (C01-C15).
 * These are new UI choices (Lucide icons, same stopgap convention as every
 * other capability icon on this page since D-007) — not sourced from the
 * JSON, which carries no icon field. Picked to match each category's real
 * name, same as the existing Bug/ClipboardCheck/UserRound choices already
 * on this page.
 */
const CATEGORY_ICONS: Record<string, LucideIconComponent> = {
  C01: ShieldCheck, // Know & manage your risk
  C02: Bug, // Find & fix weaknesses
  C03: Radar, // Detect & stop threats
  C04: UserRound, // Protect your people & devices
  C05: KeyRound, // Control who gets in
  C06: Cloud, // Secure your cloud & systems
  C07: Code2, // Secure your apps & websites
  C08: Database, // Protect your data
  C09: Cpu, // Secure your AI systems
  C10: Target, // Test your real defenses
  C11: Sparkles, // Find your AI opportunities
  C12: Workflow, // Automate your workflows
  C13: BarChart3, // Turn data into decisions
  C14: Settings2, // Simplify your IT operations
  C15: TrendingUp, // Grow revenue automatically
};

export function getCategoryIcon(categoryCode: string): LucideIconComponent {
  return CATEGORY_ICONS[categoryCode] ?? ShieldCheck;
}

/** e.g. "C03" -> "03" — reuses the real source code, not an invented index. */
export function categoryNumeral(categoryCode: string): string {
  return categoryCode.replace(/^C/, "");
}

/** e.g. "C01-S01" -> "c01-s01" — deterministic, collision-free route slug. */
export function serviceSlug(serviceCode: string): string {
  return serviceCode.toLowerCase();
}

export function getServicesTier1(): RawCategory[] {
  return data.services_tier1;
}

export function getBusinessAutomationTier2(): RawCategory[] {
  return data.business_automation_tier2;
}

export function getAllCategories(): RawCategory[] {
  return [...data.services_tier1, ...data.business_automation_tier2];
}

export function getAllServiceSlugs(): string[] {
  return getAllCategories().flatMap((category) => category.services.map((s) => serviceSlug(s.code)));
}

/** Service slugs for the 10 cybersecurity categories only — /services/[code]'s own generateStaticParams. */
export function getServiceSlugsTier1(): string[] {
  return getServicesTier1().flatMap((category) => category.services.map((s) => serviceSlug(s.code)));
}

/** Service slugs for the 5 Business Automation categories only — /business-automation/[code]'s own generateStaticParams. */
export function getServiceSlugsTier2(): string[] {
  return getBusinessAutomationTier2().flatMap((category) => category.services.map((s) => serviceSlug(s.code)));
}

export interface ServiceWithCategory {
  service: RawService;
  category: RawCategory;
}

export function getServiceBySlug(slug: string): ServiceWithCategory | undefined {
  for (const category of getAllCategories()) {
    const service = category.services.find((s) => serviceSlug(s.code) === slug);
    if (service) return { service, category };
  }
  return undefined;
}

/**
 * 2026-08-20 nav split — Business Automation became its own top-level page,
 * no longer an anchor-scrolled tier of /services (see DECISIONS.md, this
 * date). Real source `code`s (C11-C15, and service slugs like `c11-s01`)
 * stay unchanged — only routing/display around them changes.
 */
export function isBusinessAutomationCategory(categoryCode: string): boolean {
  return getBusinessAutomationTier2().some((c) => c.code === categoryCode);
}

export function getCategoryRootPath(categoryCode: string): "/services" | "/business-automation" {
  return isBusinessAutomationCategory(categoryCode) ? "/business-automation" : "/services";
}

/**
 * Display-only renumbering for /business-automation's own page: "Category
 * 11" reads as an orphaned fragment once it's not nested under Services
 * anymore. Position-based (1-5), NOT derived from the real code — the real
 * code (C11-C15) stays the source of truth for slugs/lookups, unaffected.
 * /services keeps its own categories' real 1-10 numbering unchanged.
 */
export function businessAutomationDisplayNumeral(index: number): string {
  return String(index + 1).padStart(2, "0");
}
