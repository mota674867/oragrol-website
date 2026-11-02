import type { Metadata, Viewport } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import "../globals.css";
import "./apply.css";

// The private application forms (orgro.ca/apply/<code>). Invite-only: this is its own root layout, outside the public site
// (no menu, no search, no chat widget, no locale routing). Never indexed; the address holds a private link code, so no referrer is sent.
const heading = Space_Grotesk({ variable: "--font-space-grotesk", subsets: ["latin"] });
const body = Manrope({ variable: "--font-manrope", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Private form | ORAGROL GLOBAL",
  robots: { index: false, follow: false, nocache: true, noarchive: true, nosnippet: true, noimageindex: true },
  referrer: "no-referrer",
};
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function ApplyLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${heading.variable} ${body.variable}`}>
      <body className="env-light ap-body">{children}</body>
    </html>
  );
}
