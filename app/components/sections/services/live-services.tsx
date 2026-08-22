import { Caption, Container, H2, Section, Text } from "../../ui";
import { Reveal } from "../../motion/reveal";
import { CategoryNav, type CategoryNavItem } from "./category-nav";
import { ServiceCategoryRow } from "./service-category-row";
import { categoryNumeral, getCategoryIcon, getServicesTier1 } from "./services-data";

/**
 * Services (cybersecurity) — Services Visual Redesign brief,
 * structural-scaffolding phase (`/services` only; `/business-automation`
 * still renders its own categories via the original, untouched
 * `CategorySection`/`ServiceCard`/`CapabilitySpotlightMark` — see those
 * files' own comments and `business-automation/categories.tsx`, which
 * this pass does not touch).
 *
 * Previously this component just called the shared `CategorySection`
 * directly (see git history / D-068-era comments). Now builds its own
 * shell — Container, `CategoryNav` sidebar (unchanged, already on-token:
 * accent active-state, IBM Plex Sans numerals), eyebrow/heading/intro,
 * and a list of `ServiceCategoryRow`s — so the redesigned row/card
 * treatment is fully independent of Business Automation's page. The
 * outer shell's own structure (sidebar-nav layout, `Container size="2xl"`
 * fluid width) is unchanged from before; what changed is what renders
 * INSIDE it per category.
 *
 * Removed the old `divide-y border-t border-border` rule between rows
 * (brief's own "excessive borders... rigid" complaint) — `py-14` on each
 * row already gives real separation; a border on top of that read as an
 * extra rigid line the redesign is explicitly moving away from.
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
      <Container size="2xl" className="pb-8 pt-24 md:pb-12 md:pt-32">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[220px_1fr] lg:items-start lg:gap-16">
          <CategoryNav items={navItems} />

          <div>
            <Reveal>
              <Caption tone="accent">Cybersecurity</Caption>
            </Reveal>
            <Reveal delay={0.05}>
              <H2 className="mt-4 max-w-xl">Services</H2>
            </Reveal>
            <Reveal delay={0.1}>
              <Text size="base" tone="secondary" className="mt-4 max-w-xl">
                {tier1.length} categories covering the full range of cybersecurity work.
              </Text>
            </Reveal>

            <div className="mt-8 flex flex-col">
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
