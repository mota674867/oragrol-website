import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { Badge, ButtonLink, Caption, Container, DataText, H1, H2, Icon, Section, Text } from "../../ui";
import { Reveal } from "../../motion/reveal";
import { InlineMarkdown } from "../resources/inline-markdown";
import { GlowEffect } from "./glow-effect";
import { getCategoryIcon, type RawCategory, type RawService } from "./services-data";

/**
 * ServiceDetail — per-service page (2026-08-20 restructure), same
 * dark-header/white-body template as Resources' `ArticleDetail`
 * (`../resources/article-detail.tsx`) rather than a new layout.
 *
 * `problem` is the one field in the source JSON that carries `**bold**`
 * markdown and `\n\n` paragraph breaks (confirmed via a full scan before
 * building: 50/64 services, only that field — `what_we_do`/`outcome` are
 * always single plain-text paragraphs). `InlineMarkdown` (Resources'
 * existing `**bold**` splitter, imported cross-folder — same reuse
 * pattern `GlowEffect` already has in the other direction, in
 * `article-detail.tsx`) handles the bold; paragraphs render as one `Text`
 * per `\n\n`-separated chunk, same shape as `ArticleBody`'s own paragraph
 * blocks.
 */
function Paragraphs({ text }: { text: string }) {
  const paragraphs = text.split(/\n\n+/).filter(Boolean);
  return (
    <>
      {paragraphs.map((p, i) => (
        <Text key={i} tone="secondary" size="lg" className="mt-4 first:mt-0">
          <InlineMarkdown text={p} />
        </Text>
      ))}
    </>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="mt-4 space-y-2.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3">
          <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
          <Text tone="secondary" className="flex-1">
            {item}
          </Text>
        </li>
      ))}
    </ul>
  );
}

function ServiceBreadcrumb({ category, serviceName }: { category: RawCategory; serviceName: string }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 font-body text-sm text-text-muted">
      <Link href="/services" className="transition-colors duration-150 hover:text-text-primary">
        Services
      </Link>
      <Icon icon={ChevronRight} size="sm" />
      <Link
        href={`/services#category-${category.code.toLowerCase()}`}
        className="transition-colors duration-150 hover:text-text-primary"
      >
        {category.name}
      </Link>
      <Icon icon={ChevronRight} size="sm" />
      <span aria-current="page" className="truncate text-text-secondary">
        {serviceName}
      </span>
    </nav>
  );
}

function formatPrice(price: string, unit: string): string {
  return unit.startsWith("/") ? `${price}${unit}` : `${price} — ${unit}`;
}

function ServiceField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-10 first:mt-0">
      <Caption tone="accent" size="sm">
        {label}
      </Caption>
      <div className="mt-3">{children}</div>
    </div>
  );
}

export function ServiceDetail({ service, category }: { service: RawService; category: RawCategory }) {
  const icon = getCategoryIcon(category.code);

  return (
    <>
      <Section environment="dark" className="pb-16 pt-28 md:pb-20 md:pt-36">
        <Container size="md">
          <Reveal>
            <ServiceBreadcrumb category={category} serviceName={service.name} />
          </Reveal>
          <Reveal delay={0.05}>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Badge tone="accent" className="gap-1.5">
                <Icon icon={icon} size="sm" />
                {category.name}
              </Badge>
              <Caption tone="secondary">{service.code}</Caption>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <H1 className="mt-4">{service.name}</H1>
          </Reveal>
          <Reveal delay={0.15}>
            <Text tone="secondary" size="lg" className="mt-5">
              {service.blurb}
            </Text>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-border pt-6">
              <DataText size="lg" tone="accent">
                {formatPrice(service.price, service.unit)}
              </DataText>
            </div>
          </Reveal>
        </Container>
      </Section>

      <Section environment="white" className="py-16 md:py-20">
        <Container size="md">
          <Reveal>
            <ServiceField label="The Challenge">
              <Paragraphs text={service.problem} />
            </ServiceField>
          </Reveal>
          <Reveal delay={0.05}>
            <ServiceField label="What Oragrol Does">
              <Paragraphs text={service.what_we_do} />
            </ServiceField>
          </Reveal>
          <Reveal delay={0.1}>
            <ServiceField label="What You Get">
              <BulletList items={service.deliverables} />
            </ServiceField>
          </Reveal>
          <Reveal delay={0.15}>
            <ServiceField label="Benefits">
              <BulletList items={service.benefits} />
            </ServiceField>
          </Reveal>
          <Reveal delay={0.2}>
            <ServiceField label="The Outcome">
              <Paragraphs text={service.outcome} />
            </ServiceField>
          </Reveal>

          <Reveal delay={0.25}>
            <div className="env-dark relative mt-14 overflow-hidden rounded-2xl border border-border bg-background p-8 md:p-10">
              <GlowEffect blur="strong" className="opacity-40" />
              <div className="relative">
                <Caption tone="accent">Next step</Caption>
                <H2 className="mt-3">{service.blurb}</H2>
                <ButtonLink href="/contact" variant="primary" size="lg" className="mt-6">
                  Talk to Oragrol
                </ButtonLink>
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
