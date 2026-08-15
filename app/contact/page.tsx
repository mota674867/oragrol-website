import type { Metadata } from "next";
import { ContactHero } from "../components/sections/contact/hero";
import { TwoPath } from "../components/sections/contact/two-path";
import { GeneralInquiry } from "../components/sections/contact/general-inquiry";
import { LocationsSection } from "../components/sections/contact/locations";

export const metadata: Metadata = {
  title: "Contact | Oragrol Global",
  description:
    "New to Oragrol? Start with your Cyber Health Score. Already a client, or need us urgently? Reach us directly.",
};

/**
 * Contact — Website Implementation Brief, Step 12.
 * Flow: Hero -> TwoPath (New to Oragrol / Existing client, kept visually
 * and functionally separate, not a merged generic form) -> GeneralInquiry
 * (a third, catch-all path for anything the two funneled ones don't cover
 * — real email send via /api/contact, not a fake success state) ->
 * LocationsSection (Toronto primary, Thunder Bay secondary/registered-
 * office) -> Footer (global, layout.tsx; EmergencyCta's site-wide pill
 * already links here). No closing CTA reused from Home — every other
 * page's `FinalCta` itself points at `/contact`, so adding it here would
 * be circular.
 */
export default function ContactPage() {
  return (
    <>
      <ContactHero />
      <TwoPath />
      <GeneralInquiry />
      <LocationsSection />
    </>
  );
}
