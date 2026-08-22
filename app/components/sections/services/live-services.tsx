import { Container, Section } from "../../ui";
import { Reveal } from "../../motion/reveal";
import { CategoryNav, type CategoryNavItem } from "./category-nav";
import { ServiceCategoryRow } from "./service-category-row";
import { categoryNumeral, getCategoryIcon, getServicesTier1 } from "./services-data";

/**
 * Services (cybersecurity) — Services Landing Page brief, Level 2 (the
 * existing service-category architecture, deliberately untouched beyond
 * removing its own leading intro text — see below). `/business-automation`
 * still renders its own categories via the original `CategorySection`/
 * `ServiceCard`/`CapabilitySpotlightMark`, which this pass does not
 * touch either.
 *
 * The eyebrow/heading/intro this component used to render at the top of
 * its own body now lives in `ServicesOverview` (Level 1, panel 2) instead
 * — same copy, just relocated up into the new landing composition so it
 * isn't duplicated on the page. This component's own body now starts
 * directly at the sidebar + category-row list, unchanged from before
 * that split: same `CategoryNav`, same `ServiceCategoryRow` per category,
 * same `Container size="2xl"` fluid width, same D-069/D-070 behavior
 * (this Section still carries no transition props — every section on
 * this page is `environment="dark"`).
 */
export function LiveServices() {
  const tier1 = getServicesTier1();
  const navItems: CategoryNavItem[] = tier1.map((c) => ({
    id: `category-${c.code.toLowerCase()}`,
    n: categoryNumeral(c.code),
    label: c.name,
  }));

  return (
    <Section environment="dark">
      <Container size="2xl" className="pb-8 pt-8 md:pb-12 md:pt-12">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[220px_1fr] lg:items-start lg:gap-16">
          <CategoryNav items={navItems} />

          <div>
            <div className="flex flex-col">
              {tier1.map((category, i) => (
                <Reveal key={category.code} delay={i * 0.06}>
                  <ServiceCategoryRow
                    category={category}
                    icon={getCategoryIcon(category.code)}
                    basePath="/services"
                    numeral={categoryNumeral(category.code)}
                  />
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
