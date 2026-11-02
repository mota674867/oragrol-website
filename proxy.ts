import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Next.js 16 renamed the `middleware.ts` file convention to `proxy.ts`
// (middleware.ts still works but is deprecated — see AGENTS.md's warning
// to check installed-version docs before assuming a convention). Same
// createMiddleware call as next-intl's documented setup; only the
// filename and default-export-as-`proxy` naming are Next 16-specific.
export default createMiddleware(routing);

export const config = {
  // Match every path except API routes, Next internals, and any path with
  // a file extension (robots.txt, sitemap.xml, favicon.ico, images, etc.)
  // — and the private application forms (/apply/<code>): English only, outside the public site's layout and locale routing —
  // — those are handled by their own route handlers, not locale-routed.
  matcher: ["/((?!api|apply|_next|_vercel|.*\\..*).*)"],
};
