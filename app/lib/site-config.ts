/**
 * Single source of truth for the site's live domain and default contact
 * email. Everything else (metadataBase, JSON-LD, sitemap.xml, robots.txt,
 * the /api/contact fallback) imports from here instead of hardcoding the
 * domain — so migrating to oragrolglobal.com later (once that domain is
 * back under control) is a one-line change here, not a repo-wide find and
 * replace.
 *
 * Current domain: orgro.ca (registered, DNS-live). Email hosting on
 * orgro.ca is NOT active yet — CONTACT_TO_EMAIL below is a placeholder
 * that becomes real the moment a working @orgro.ca inbox exists (e.g. via
 * Cloudflare Email Routing). Until then, the actual delivery address for
 * the live contact form is set separately via the CONTACT_TO_EMAIL env
 * var (see .env.local.example) — this constant is NOT used as a fallback
 * for real mail delivery for exactly that reason (see route.ts).
 */
export const SITE_URL = "https://orgro.ca";
export const SITE_DOMAIN = "orgro.ca";

// Not yet a live mailbox — see the note above. Referenced only in UI copy
// and structured data, never as the /api/contact delivery fallback.
export const PENDING_CONTACT_EMAIL = "info@orgro.ca";
