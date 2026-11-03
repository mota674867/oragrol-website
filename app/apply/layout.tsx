import type { Metadata, Viewport } from "next";
import "./apply.css";

// The private application forms (orgro.ca/apply/<code>). Invite-only: this is its own root layout, outside the public site
// (no menu, no search, no chat widget, no locale routing). Never indexed; the address holds a private link code, so no referrer is sent.
// Look: the same font (Inter) and the same light (Porcelain) / dark palette as the client dashboard, with the same switch.
export const metadata: Metadata = {
  title: "Private form | ORAGROL GLOBAL",
  robots: { index: false, follow: false, nocache: true, noarchive: true, nosnippet: true, noimageindex: true },
  referrer: "no-referrer",
};
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

// Same as the dashboard: light unless this browser chose dark.
const THEME_INIT = `try{var t=localStorage.getItem("og-theme");document.documentElement.dataset.theme=(t==="dark"||t==="light")?t:"light"}catch(e){document.documentElement.dataset.theme="light"}`;

export default function ApplyLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: THEME_INIT }} /></head>
      <body className="ap-root">{children}</body>
    </html>
  );
}
