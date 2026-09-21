import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/**
 * Locale-aware navigation primitives. Components that link between pages
 * should import `Link`/`useRouter`/`usePathname` from here instead of
 * `next/link` / `next/navigation`, so links automatically carry the
 * current locale (and never grow a `/fr/` prefix inside English pages).
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
