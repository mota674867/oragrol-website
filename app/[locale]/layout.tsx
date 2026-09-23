import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { Space_Grotesk, Manrope, IBM_Plex_Sans, Epilogue } from "next/font/google";
import "@/app/globals.css";
import { SiteChrome } from "@/app/components/site/site-chrome";
import { SITE_URL } from "@/app/lib/site-config";
import { routing } from "@/i18n/routing";
import ChatWidget from "@/app/components/chat/ChatWidget";

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

// Bilingual EN/FR build. `[locale]` wraps every page (see i18n/routing.ts
// for why — English keeps its existing unprefixed URLs via
// localePrefix: "as-needed", only French is visibly prefixed with /fr).
// This file is now the true App Router root layout: there is no separate
// app/layout.tsx, matching next-intl's standard App Router structure.
export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Enables static rendering for this locale (next-intl requirement when
  // reading the locale via `useLocale()`/`getLocale()` anywhere below).
  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${spaceGrotesk.variable} ${manrope.variable} ${ibmPlexSans.variable} ${epilogue.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider messages={messages}>
          <SiteChrome>{children}</SiteChrome>
          <ChatWidget />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
