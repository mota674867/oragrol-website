import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServiceDetail } from "../../components/sections/services/service-detail";
import {
  getServiceBySlug,
  getServiceSlugsTier2,
  isBusinessAutomationCategory,
} from "../../components/sections/services/services-data";

export function generateStaticParams() {
  return getServiceSlugsTier2().map((code) => ({ code }));
}

type Params = { code: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { code } = await params;
  const result = getServiceBySlug(code);
  if (!result || !isBusinessAutomationCategory(result.category.code)) return {};
  return {
    title: `${result.service.name} | Oragrol Global`,
    description: result.service.blurb,
  };
}

/**
 * Individual Business Automation service page — 2026-08-20 nav split.
 * Mirrors `/services/[code]/page.tsx` exactly (same `ServiceDetail`
 * component, reused not duplicated), scoped to the 5 Business Automation
 * categories' 25 services (`getServiceSlugsTier2`). Moved here from
 * `/services/[code]` in the same pass that split Business Automation out
 * to its own top-level nav item/page — real `code`s (C11-C15, service
 * slugs like `c11-s01`) unchanged, only the route prefix moved.
 */
export default async function BusinessAutomationServiceDetailPage({ params }: { params: Promise<Params> }) {
  const { code } = await params;
  const result = getServiceBySlug(code);
  if (!result || !isBusinessAutomationCategory(result.category.code)) notFound();

  return <ServiceDetail service={result.service} category={result.category} />;
}
