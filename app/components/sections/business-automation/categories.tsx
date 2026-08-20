import { CategorySection } from "../services/category-section";
import { businessAutomationDisplayNumeral, getBusinessAutomationTier2 } from "../services/services-data";

/**
 * BusinessAutomationCategories — 2026-08-20 nav split. Same
 * `CategorySection` implementation `/services` uses (cross-folder import,
 * not duplicated), rendering the 5 real Business Automation categories
 * with page-local 1-5 display numbering (real `code`s C11-C15 stay the
 * source of truth for slugs/lookups — see `services-data.ts`).
 */
export function BusinessAutomationCategories() {
  const tier2 = getBusinessAutomationTier2();

  return (
    <CategorySection
      environment="light-blue"
      eyebrow="AI & Automation"
      heading="Business Automation"
      intro={`${tier2.length} categories using AI and automation to save time and grow revenue.`}
      categories={tier2}
      basePath="/business-automation"
      numeralFor={(_category, index) => businessAutomationDisplayNumeral(index)}
    />
  );
}
