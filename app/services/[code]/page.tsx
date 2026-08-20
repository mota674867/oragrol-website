import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServiceDetail } from "../../components/sections/services/service-detail";
import { getAllServiceSlugs, getServiceBySlug } from "../../components/sections/services/services-data";

export function generateStaticParams() {
  return getAllServiceSlugs().map((code) => ({ code }));
}

type Params = { code: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { code } = await params;
  const result = getServiceBySlug(code);
  if (!result) return {};
  return {
    title: `${result.service.name} | Oragrol Global`,
    description: result.service.blurb,
  };
}

/**
 * Individual service page — 2026-08-20 restructure. Same
 * generateStaticParams/notFound pattern as `/resources/[slug]/page.tsx`.
 * `[code]` is the service's own real code, lowercased (`serviceSlug()` in
 * services-data.ts), e.g. `/services/c01-s01`.
 */
export default async function ServiceDetailPage({ params }: { params: Promise<Params> }) {
  const { code } = await params;
  const result = getServiceBySlug(code);
  if (!result) notFound();

  return <ServiceDetail service={result.service} category={result.category} />;
}
