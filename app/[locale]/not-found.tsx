import { getLocale } from "next-intl/server";
import { Container, H1, Text, Caption, ButtonLink } from "@/app/components/ui";
import { Section } from "@/app/components/ui/section";

/**
 * Branded 404 (logo rollout, approved 2026-10-09). Renders inside the
 * locale layout, so SiteChrome wraps it in the shared header (with the
 * header logo) and the shared footer (with the grey footer icon) like every
 * other page. Next.js returns HTTP 404 for this automatically.
 */
export default async function NotFound() {
  const isFr = (await getLocale()) === "fr";
  return (
    <Section environment="light">
      <Container size="md" className="flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
        <Caption tone="accent">404</Caption>
        <H1 className="mt-4">{isFr ? "Cette page n’existe pas." : "This page doesn’t exist."}</H1>
        <Text size="lg" tone="secondary" className="mx-auto mt-4 max-w-xl">
          {isFr
            ? "Le lien est peut-être ancien, ou la page a peut-être été déplacée."
            : "The link may be old, or the page may have moved."}
        </Text>
        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <ButtonLink href="/" variant="primary" size="lg">
            {isFr ? "Retour à l’accueil" : "Back to home"}
          </ButtonLink>
          <ButtonLink href="/cyber-health" variant="secondary" size="lg">
            {isFr ? "Obtenir votre score de cybersanté" : "Get your Cyber Health Score"}
          </ButtonLink>
        </div>
      </Container>
    </Section>
  );
}
