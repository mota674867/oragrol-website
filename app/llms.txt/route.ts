import { SITE_URL } from "../lib/site-config";
import { RESOURCE_ARTICLES } from "../[locale]/resources/[slug]/ORAGROL_ResourceArticles";

/**
 * /llms.txt — a short plain-text guide to the site for AI assistants and
 * search tools (SEO pass, 2026-11-17). Every statement below comes from what the
 * live site already says (homepage, services, Business Automation, OR ONE,
 * Cyber Health, resources). No prices, ratings, client names or claims.
 * Article titles come from the same data the article pages use.
 */
export const dynamic = "force-static";

export function GET() {
  const articles = RESOURCE_ARTICLES.map(
    (a) => `- [${a.title}](${SITE_URL}/resources/${a.slug}): ${a.seoDescription}`,
  ).join("\n");

  const body = `# ORAGROL Global

> ORAGROL Global provides cybersecurity services, intelligent business automation and coordinated security operations (OR ONE) for Canadian small and medium-sized businesses. It serves Ontario, Canada.

Pricing, package contents and service details are published on the pages below. The site is available in English and French (French pages are under /fr).

## What ORAGROL offers

- [Cybersecurity services](${SITE_URL}/services): four packages (Foundation, Advanced, Comprehensive, Elite), individual services available standalone, and specialist engagements.
- [Business Automation](${SITE_URL}/business-automation): five defined automation jobs (Sales, Customer Service, Finance, IT, Marketing) plus tailored automation.
- [OR ONE](${SITE_URL}/or-one): one coordinated system connecting security, automation and intelligence for a single organization.
- [Cyber Health Score](${SITE_URL}/cyber-health): an assessment of a business's security position.
- [Free Business Scan](${SITE_URL}/scan): a free scan offered on the site.
- [Industries](${SITE_URL}/industries): how ORAGROL's services apply to nine types of Canadian business.

## Company and contact

- [Company](${SITE_URL}/company)
- [FAQ](${SITE_URL}/faq)
- [Contact](${SITE_URL}/contact)

## Resources

${articles}
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
