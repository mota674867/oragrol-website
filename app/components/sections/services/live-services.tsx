import { CategorySection } from "./category-section";
import { categoryNumeral, getServicesTier1 } from "./services-data";

/**
 * Services (cybersecurity) — 2026-08-20 nav split: Business Automation
 * moved out to its own top-level page/nav item (`/business-automation`,
 * see `app/components/sections/business-automation/`), so this now
 * renders ONLY the 10 cybersecurity categories, real 01-10 numbering
 * (from the source `code`, via `categoryNumeral`). Previously (2026-08-20
 * restructure, same day) this rendered both tiers as two sections — see
 * git history / DECISIONS.md for that superseded version.
 *
 * Row-rendering itself is unchanged and unduplicated: `CategorySection`
 * (extracted into `category-section.tsx` this same pass) is the exact
 * same schematic-shell/`ServiceCard` implementation, now shared with
 * `/business-automation`'s own page instead of copy-pasted.
 */
export function LiveServices() {
  const tier1 = getServicesTier1();

  return (
    <CategorySection
      environment="dark"
      eyebrow="Cybersecurity"
      heading="Services"
      intro={`${tier1.length} categories covering the full range of cybersecurity work.`}
      categories={tier1}
      basePath="/services"
      numeralFor={(category) => categoryNumeral(category.code)}
    />
  );
}
