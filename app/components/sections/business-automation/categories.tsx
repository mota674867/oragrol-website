import { CategorySection } from "../services/category-section";
import { businessAutomationDisplayNumeral, getBusinessAutomationTier2 } from "../services/services-data";
import { getIndividualServicesNote } from "./packages-data";

/**
 * BusinessAutomationCategories — 2026-08-20 nav split. Same
 * `CategorySection` implementation `/services` uses (cross-folder import,
 * not duplicated), rendering the 5 real Business Automation categories
 * with page-local 1-5 display numbering (real `code`s C11-C15 stay the
 * source of truth for slugs/lookups — see `services-data.ts`).
 *
 * 2026-08-21: `individual_services_note` (from the new packages data)
 * appended to the intro — this section IS the "buy individually" option
 * the note refers to, now that `ProjectOffers`/`RecurringPackages` sit
 * above it on the page, so it belongs here rather than repeated in the
 * packages sections.
 */
export function BusinessAutomationCategories() {
  const tier2 = getBusinessAutomationTier2();

  return (
    <CategorySection
      environment="dark"
      transitionFrom="deep-blue"
      eyebrow="AI & Automation"
      heading="Business Automation"
      intro={`${tier2.length} categories using AI and automation to save time and grow revenue. ${getIndividualServicesNote()}`}
      categories={tier2}
      basePath="/business-automation"
      numeralFor={(_category, index) => businessAutomationDisplayNumeral(index)}
    />
  );
}
