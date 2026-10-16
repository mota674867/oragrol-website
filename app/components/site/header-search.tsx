"use client";

import { Search } from "lucide-react";
import { Icon } from "../ui";

/**
 * HeaderSearch — the search icon for the legacy SiteHeader.
 *
 * It is only a trigger. PublicSiteSearch (mounted once in SiteChrome) listens
 * for every aria-label="Search" button on the site and opens the real
 * site-wide search dialog, so this component no longer carries its own
 * dialog. Keep the aria-label in sync with SEARCH_TRIGGER in
 * public-site-search.tsx.
 */
export function HeaderSearch() {
  return (
    <button
      type="button"
      aria-label="Search"
      aria-haspopup="dialog"
      aria-expanded={false}
      className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-text-primary transition-colors duration-150 hover:bg-text-primary/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <Icon icon={Search} size="md" />
    </button>
  );
}
