"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import { EmergencyCta } from "./emergency-cta";
import ChatWidget from "../ChatWidget";

/**
 * Routes rebuilt from the GPT V38 redesign ship their own full-bleed
 * header/footer — the old site-wide SiteHeader/SiteFooter/EmergencyCta must
 * not also render on these, or the page gets two headers and two footers
 * stacked. GPT's own root layout also renders its ChatWidget globally, so we
 * add it here for every redesigned route (old, not-yet-ported routes keep
 * their current chrome — and no chat widget — until their own redesign pass).
 * Grows by one entry each time another page is ported.
 *
 * Resource article detail pages (/resources/<slug>) are a dynamic route, so
 * they can't be listed here individually — they're matched by prefix below
 * instead, alongside the exact-match set.
 */
const REDESIGNED_ROUTES = new Set<string>(["/", "/services", "/business-automation", "/or-one", "/industries", "/resources", "/company", "/contact", "/cyber-health", "/faq", "/privacy-policy", "/terms-of-use"]);

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isRedesigned =
    pathname !== null &&
    (REDESIGNED_ROUTES.has(pathname) || pathname.startsWith("/resources/"));

  if (isRedesigned) {
    return (
      <>
        {children}
        <ChatWidget />
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <EmergencyCta />
    </>
  );
}
