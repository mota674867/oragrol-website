import { Hero } from "./components/sections/home/hero";
import { SecurityChallenge } from "./components/sections/home/security-challenge";
import { Approach } from "./components/sections/home/approach";
import { Services } from "./components/sections/home/services";
import { Solutions } from "./components/sections/home/solutions";
import { CyberHealth } from "./components/sections/home/cyber-health";
import { Trust } from "./components/sections/home/trust";
import { HowWeWork } from "./components/sections/home/how-we-work";
import { Insights } from "./components/sections/home/insights";
import { Faq } from "./components/sections/home/faq";
import { FinalCta } from "./components/sections/home/final-cta";

/**
 * Home — Website Implementation Brief, Step 4.
 * Flow (locked, do not reorder): Hero → Security Challenge → Oragrol
 * Approach → Services → Solutions → Cyber Health → Trust/Evidence →
 * How We Work → Insights → FAQ → Final CTA → Footer (global, in layout.tsx).
 */
export default function Home() {
  return (
    <>
      <Hero />
      <SecurityChallenge />
      <Approach />
      <Services />
      <Solutions />
      <CyberHealth />
      <Trust />
      <HowWeWork />
      <Insights />
      <Faq />
      <FinalCta />
    </>
  );
}
