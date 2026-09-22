import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServiceDetail } from "@/app/components/sections/services/service-detail";
import {
  getServiceBySlug,
  getServiceSlugsTier2,
  isBusinessAutomationCategory,
} from "@/app/components/sections/services/services-data";
import { languageAlternates } from "@/app/lib/seo";

export function generateStaticParams() {
  return getServiceSlugsTier2().map((code) => ({ code }));
}

type Params = { code: string; locale: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { code, locale } = await params;
  const isFr = locale === "fr";
  const result = getServiceBySlug(code, isFr ? "fr" : "en");
  if (!result || !isBusinessAutomationCategory(result.category.code)) return {};
  const canonicalPath = isFr ? `/fr/business-automation/${code}` : `/business-automation/${code}`;
  return {
    title: `${result.service.name} | ORAGROL Global`,
    description: result.service.blurb,
    alternates: {
      canonical: canonicalPath,
      languages: languageAlternates(`/business-automation/${code}`),
    },
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
 *
 * Bilingual (Phase 2m, 2026-09-22): same `locale` wiring as
 * `/services/[code]/page.tsx` — see that file's own comment.
 */
export default async function BusinessAutomationServiceDetailPage({ params }: { params: Promise<Params> }) {
  const { code, locale } = await params;
  const isFr = locale === "fr";
  const result = getServiceBySlug(code, isFr ? "fr" : "en");
  if (!result || !isBusinessAutomationCategory(result.category.code)) notFound();

  return <ServiceDetail service={result.service} category={result.category} isFr={isFr} />;
}
