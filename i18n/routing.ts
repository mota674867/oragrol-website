import { defineRouting } from "next-intl/routing";

/**
 * Bilingual routing config (added for the EN/FR build — see
 * DECISIONS.md D-0xx and PROJECT_MEMORY.md for the full record).
 *
 * localePrefix: "as-needed" — English (the default locale) keeps every
 * existing unprefixed URL exactly as it is today (`/services`,
 * `/business-automation`, ...). Only French gets a visible prefix
 * (`/fr/services`, `/fr/business-automation`, ...). This is the whole
 * reason English URLs, backlinks, and existing SEO equity are untouched
 * by this change — there is no `/en/` prefix anywhere.
 */
export const routing = defineRouting({
  locales: ["en", "fr"],
  defaultLocale: "en",
  localePrefix: "as-needed",
});

export type AppLocale = (typeof routing.locales)[number];
