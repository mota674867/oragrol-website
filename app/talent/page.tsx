import type { Metadata } from "next";
import TalentClient from "./talent-client";

export const metadata: Metadata = {
  title: "Talent | ORAGROL Global",
  description:
    "Introduce your expertise or propose an idea to ORAGROL Global — exploratory collaboration in AI, intelligent agents, automation, sales, marketing and other relevant disciplines.",
  alternates: {
    canonical: "/talent",
  },
  openGraph: {
    title: "Talent | ORAGROL Global",
    description:
      "Bring your expertise. Share what comes next — exploratory collaboration with ORAGROL Global, no defined job or project role required.",
    url: "/talent",
    siteName: "ORAGROL Global",
    locale: "en_CA",
    type: "website",
  },
};

export default function TalentPage() {
  return <TalentClient />;
}
