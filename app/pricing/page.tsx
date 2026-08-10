import { PricingCard } from "../components/pricing-card";

export default function PricingPage() {
  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 px-6 py-24 dark:bg-black">
      <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          Simple, transparent pricing
        </h1>
        <p className="mt-4 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          Choose the plan that fits your team. Upgrade or cancel anytime.
        </p>
      </div>

      <div className="mt-16 grid w-full max-w-5xl grid-cols-1 items-start gap-8 lg:grid-cols-3">
        <PricingCard
          name="Starter"
          price="$19"
          period="/month"
          description="For individuals trying things out."
          features={[
            "Up to 3 projects",
            "1 GB storage",
            "Community support",
            "Basic analytics",
          ]}
          ctaLabel="Get started"
          ctaHref="/signup?plan=starter"
        />

        <PricingCard
          name="Pro"
          price="$49"
          period="/month"
          description="For growing teams that need more power."
          features={[
            "Unlimited projects",
            "50 GB storage",
            "Priority email support",
            "Advanced analytics",
            "Team collaboration",
          ]}
          ctaLabel="Start free trial"
          ctaHref="/signup?plan=pro"
          highlighted
          badge="Most popular"
        />

        <PricingCard
          name="Enterprise"
          price="Custom"
          description="For organizations with custom needs."
          features={[
            "Everything in Pro",
            "Unlimited storage",
            "Dedicated account manager",
            "SSO & advanced security",
            "Custom SLA",
          ]}
          ctaLabel="Contact sales"
          ctaHref="/contact"
        />
      </div>
    </div>
  );
}
