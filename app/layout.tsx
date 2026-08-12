import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono, Epilogue } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "./components/site/site-header";
import { SiteFooter } from "./components/site/site-footer";

// Design-token typefaces (current baseline — swappable, see app/styles/tokens.css).
// Changing a typeface only requires editing the import + call below; every
// component keeps using the semantic font-heading/font-body/font-data/font-brand
// Tailwind utilities untouched.
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const epilogue = Epilogue({
  variable: "--font-epilogue",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Oragrol Global | Cybersecurity clarity for modern businesses",
  description:
    "Oragrol helps businesses understand risk, prioritize what matters, and build practical protection that moves with the business.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} ${epilogue.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
