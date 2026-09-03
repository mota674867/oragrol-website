"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import { EmergencyCta } from "./emergency-cta";

/**
 * Home ("/") ships its own full-bleed header/footer as part of the GPT V38
 * redesign (see app/page.tsx + app/homepage-v3.css) — the old site-wide
 * SiteHeader/SiteFooter/EmergencyCta must not also render there, or the page
 * gets two headers and two footers stacked. Every other route keeps the
 * original global chrome untouched until it goes through its own redesign
 * pass.
 */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  if (isHome) {
    return <>{children}</>;
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
