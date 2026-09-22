import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServiceDetail } from "@/app/components/sections/services/service-detail";
import {
  getServiceBySlug,
  getServiceSlugsTier1,
  isBusinessAutomationCategory,
} from "@/app/components/sections/services/services-data";
import { languageAlternates } from "@/app/lib/seo";

export function generateStaticParams() {
  return getServiceSlugsTier1().map((code) => ({ code }));
}

type Params = { code: string; locale: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { code, locale } = await params;
  const isFr = locale === "fr";
  const result = getServiceBySlug(code, isFr ? "fr" : "en");
  if (!result || isBusinessAutomationCategory(result.category.code)) return {};
  const canonicalPath = isFr ? `/fr/services/${code}` : `/services/${code}`;
  return {
    title: `${result.service.name} | ORAGROL Global`,
    description: result.service.blurb,
    alternates: {
      canonical: canonicalPath,
      languages: languageAlternates(`/services/${code}`),
    },
  };
}

/**
 * Individual cybersecurity service page — 2026-08-20 nav split. Scoped to
 * the 10 cybersecurity categories only (`getServiceSlugsTier1`); the 5
 * Business Automation categories' 25 detail pages moved to
 * `/business-automation/[code]` (see that route + DECISIONS.md, same
 * date). The `isBusinessAutomationCategory` guard below covers a
 * dynamically-requested slug outside the statically generated set (this
 * app isn't configured for `dynamicParams: false`, so an unlisted param
 * still reaches the page function) — without it, a stale/shared
 * `/services/c11-s01` link would silently render Business Automation
 * content under the wrong URL instead of 404ing.
 *
 * Bilingual (Phase 2m, 2026-09-22): `locale` now flows through to
 * `getServiceBySlug` (selects the French JSON) and to `ServiceDetail`
 * (translates the page's own field labels/CTA). See
 * `services-data.ts`/`oragrol-services-data.fr.json` for the content side.
 */
export default async function ServiceDetailPage({ params }: { params: Promise<Params> }) {
  const { code, locale } = await params;
  const isFr = locale === "fr";
  const result = getServiceBySlug(code, isFr ? "fr" : "en");
  if (!result || isBusinessAutomationCategory(result.category.code)) notFound();

  return <ServiceDetail service={result.service} category={result.category} isFr={isFr} />;
}
