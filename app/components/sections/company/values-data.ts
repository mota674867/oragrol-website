import { Compass, Target, TrendingUp } from "lucide-react";
import type { LucideIconComponent } from "../../ui";

/**
 * Values / Differentiators content — copied verbatim from
 * ORAGROL_ABOUT_PAGE_CONTENT_FINAL.md section 4. Kept as its own typed
 * array (same convention as industries-data.ts / values used
 * site-wide) so values.tsx stays pure layout.
 */
export interface ValueItem {
  icon: LucideIconComponent;
  title: string;
  body: string;
}

export const VALUES: ValueItem[] = [
  {
    icon: Target,
    title: "Business First",
    body: "Security decisions should support how a business actually runs, not sit apart from it.",
  },
  {
    icon: Compass,
    title: "Practical, Not Complicated",
    body: "Clear priorities and recommendations a team can actually act on.",
  },
  {
    icon: TrendingUp,
    title: "Built for What's Next",
    body: "Cybersecurity is where Oragrol starts, not where it stops. As the company grows, that same practical approach will carry into whatever the next important problem turns out to be.",
  },
];

export const VALUES_SUMMARY =
  "Oragrol combines cybersecurity expertise and business thinking to help organizations act on what matters now, and as the company grows.";
