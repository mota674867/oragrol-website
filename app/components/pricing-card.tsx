import Link from "next/link";

export interface PricingCardProps {
  /** Plan name, e.g. "Pro" */
  name: string;
  /** Price to display, e.g. "$49" or "Custom" */
  price: string;
  /** Billing period shown next to the price, e.g. "/month". Omit for custom pricing. */
  period?: string;
  /** Short one-line description of who the plan is for */
  description: string;
  /** List of included features */
  features: string[];
  /** Call-to-action button label */
  ctaLabel: string;
  /** Where the CTA button links to */
  ctaHref?: string;
  /** Makes this card stand out as the recommended plan */
  highlighted?: boolean;
  /** Small pill label shown above the card, e.g. "Most popular" */
  badge?: string;
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
      className="h-5 w-5 shrink-0"
    >
      <path
        fillRule="evenodd"
        d="M16.704 5.29a1 1 0 0 1 0 1.415l-7.5 7.5a1 1 0 0 1-1.414 0l-3.5-3.5a1 1 0 1 1 1.414-1.414l2.793 2.792 6.793-6.793a1 1 0 0 1 1.414 0Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function PricingCard({
  name,
  price,
  period,
  description,
  features,
  ctaLabel,
  ctaHref = "#",
  highlighted = false,
  badge,
}: PricingCardProps) {
  return (
    <div
      className={[
        "relative flex w-full max-w-sm flex-col rounded-2xl p-8",
        "bg-white dark:bg-zinc-900",
        highlighted
          ? "border-2 border-black shadow-xl shadow-black/10 dark:border-white dark:shadow-black/40 lg:-translate-y-3"
          : "border border-zinc-200 dark:border-zinc-800",
      ].join(" ")}
    >
      {badge && (
        <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black px-3 py-1 text-xs font-semibold text-white dark:bg-white dark:text-black">
          {badge}
        </span>
      )}

      <h3 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
        {name}
      </h3>
      <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
        {description}
      </p>

      <div className="mt-6 flex items-baseline gap-1">
        <span className="text-4xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
          {price}
        </span>
        {period && (
          <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            {period}
          </span>
        )}
      </div>

      <Link
        href={ctaHref}
        className={[
          "mt-6 flex h-12 w-full cursor-pointer items-center justify-center rounded-full px-5 text-base font-medium transition-colors",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black dark:focus-visible:outline-white",
          highlighted
            ? "bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            : "border border-black/10 text-zinc-950 hover:bg-black/[.04] dark:border-white/15 dark:text-zinc-50 dark:hover:bg-white/[.08]",
        ].join(" ")}
      >
        {ctaLabel}
      </Link>

      <ul className="mt-8 flex flex-col gap-3">
        {features.map((feature) => (
          <li
            key={feature}
            className="flex items-start gap-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400"
          >
            <span className="text-emerald-600 dark:text-emerald-400">
              <CheckIcon />
            </span>
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
}
