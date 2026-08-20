import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServiceDetail } from "../../components/sections/services/service-detail";
import {
  getServiceBySlug,
  getServiceSlugsTier1,
  isBusinessAutomationCategory,
} from "../../components/sections/services/services-data";

export function generateStaticParams() {
  return getServiceSlugsTier1().map((code) => ({ code }));
}

type Params = { code: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { code } = await params;
  const result = getServiceBySlug(code);
  if (!result || isBusinessAutomationCategory(result.category.code)) return {};
  return {
    title: `${result.service.name} | Oragrol Global`,
    description: result.service.blurb,
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
 */
export default async function ServiceDetailPage({ params }: { params: Promise<Params> }) {
  const { code } = await params;
  const result = getServiceBySlug(code);
  if (!result || isBusinessAutomationCategory(result.category.code)) notFound();

  return <ServiceDetail service={result.service} category={result.category} />;
}
