import type { Metadata } from "next";
import { Space_Grotesk, Manrope, IBM_Plex_Sans, Epilogue } from "next/font/google";
import "./globals.css";
import { SiteChrome } from "./components/site/site-chrome";
import { SITE_URL } from "./lib/site-config";

// Design-token typefaces (D-068 visual-system migration — see
// app/styles/tokens.css). Changing a typeface only requires editing the
// import + call below; every component keeps using the semantic
// font-heading/font-body/font-data/font-brand Tailwind utilities untouched.
// Space Grotesk (heading/brand identity) is unchanged from the original
// system. Manrope replaces Inter (body/UI — nav, buttons, paragraphs,
// forms). IBM Plex Sans replaces JetBrains Mono (technical/data — service
// codes, tables, Cyber Health Score data). Space Grotesk and Manrope are
// both variable fonts (the full weight axis loads at once, so every
// 500/600/700 or 400/500/600/700 class used in components already renders
// as that real weight — no explicit `weight` array needed, same as the
// original setup). IBM Plex Sans is NOT a variable font on Google Fonts,
// so its `weight` array below is required by next/font, not optional —
// 400/500/600 covers every technical/data weight the brief calls for.
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const epilogue = Epilogue({
  variable: "--font-epilogue",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "ORAGROL Global | Cybersecurity, Automation & Coordinated Protection",
    template: "%s | ORAGROL Global",
  },
  description:
    "ORAGROL Global helps Canadian businesses understand risk, prioritize what matters, and build practical protection and automation that move with the business.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${manrope.variable} ${ibmPlexSans.variable} ${epilogue.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
