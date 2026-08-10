import type { Metadata } from "next";

// Internal, disposable typography preview — Website Implementation Brief, Step 2.
// Purpose: let the current baseline fonts (set in Step 1's design tokens) be
// judged visually against a "Bell Business elegance" quality bar, so the
// final typography choice can be made by looking at it, not guessing.
//
// Nothing here locks a decision: font-heading, font-body, font-data, and
// font-brand are used exactly as defined in app/styles/tokens.css. Not
// linked from navigation — safe to delete once typography is finalized.

export const metadata: Metadata = {
  title: "Style Guide — Typography Preview",
  robots: { index: false, follow: false },
};

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="font-body text-xs font-medium uppercase tracking-widest text-text-secondary">
      {children}
    </p>
  );
}

function WeightTag({ children }: { children: string }) {
  return (
    <span className="font-body text-xs font-medium uppercase tracking-widest text-text-muted">
      {children}
    </span>
  );
}

export default function StyleGuidePage() {
  return (
    <div className="env-white min-h-screen bg-background text-text-primary">
      <div className="mx-auto max-w-5xl px-6 py-20 md:px-12">
        {/* Intro */}
        <header className="max-w-2xl">
          <p className="font-body text-xs font-medium uppercase tracking-widest text-accent">
            Typography Refinement — Step 2
          </p>
          <h1 className="mt-3 font-heading text-4xl font-bold tracking-tight text-text-primary">
            Style Guide
          </h1>
          <p className="mt-4 font-body text-base leading-relaxed text-text-secondary">
            An internal, disposable preview for evaluating the current
            baseline typefaces against a premium, &ldquo;Bell Business
            elegance&rdquo; quality bar. Final typography choice remains{" "}
            <strong className="font-semibold text-text-primary">OPEN</strong>{" "}
            — nothing on this page is locked. Not linked from navigation;
            delete once a decision is made.
          </p>
        </header>

        {/* 01 — Headings */}
        <section className="mt-20 border-t border-border pt-12">
          <SectionLabel>01 — Headings · font-heading · Space Grotesk</SectionLabel>

          <div className="mt-8 flex flex-col gap-10">
            <div>
              <div className="flex flex-wrap items-baseline gap-3">
                <WeightTag>H1 · 500</WeightTag>
              </div>
              <h1 className="mt-2 font-heading text-5xl font-medium leading-tight tracking-tight md:text-6xl">
                Enterprise-grade security, without the enterprise overhead.
              </h1>
              <div className="mt-6 flex flex-wrap items-baseline gap-3">
                <WeightTag>H1 · 700</WeightTag>
              </div>
              <h1 className="mt-2 font-heading text-5xl font-bold leading-tight tracking-tight md:text-6xl">
                Enterprise-grade security, without the enterprise overhead.
              </h1>
            </div>

            <div>
              <WeightTag>H2 · 500</WeightTag>
              <h2 className="mt-2 font-heading text-4xl font-medium leading-tight tracking-tight">
                Continuous monitoring for growing businesses
              </h2>
              <div className="mt-6">
                <WeightTag>H2 · 700</WeightTag>
              </div>
              <h2 className="mt-2 font-heading text-4xl font-bold leading-tight tracking-tight">
                Continuous monitoring for growing businesses
              </h2>
            </div>

            <div>
              <WeightTag>H3 · 500</WeightTag>
              <h3 className="mt-2 font-heading text-2xl font-medium leading-snug tracking-tight md:text-3xl">
                Real-time threat detection
              </h3>
              <div className="mt-6">
                <WeightTag>H3 · 700</WeightTag>
              </div>
              <h3 className="mt-2 font-heading text-2xl font-bold leading-snug tracking-tight md:text-3xl">
                Real-time threat detection
              </h3>
            </div>

            <div>
              <WeightTag>H4 · 500</WeightTag>
              <h4 className="mt-2 font-heading text-xl font-medium leading-snug tracking-tight">
                Vulnerability Management
              </h4>
              <div className="mt-6">
                <WeightTag>H4 · 700</WeightTag>
              </div>
              <h4 className="mt-2 font-heading text-xl font-bold leading-snug tracking-tight">
                Vulnerability Management
              </h4>
            </div>
          </div>
        </section>

        {/* 02 — Body / UI */}
        <section className="mt-20 border-t border-border pt-12">
          <SectionLabel>02 — Body / UI · font-body · Inter</SectionLabel>

          <p className="mt-6 max-w-2xl font-body text-lg leading-relaxed text-text-primary">
            Most breaches don&rsquo;t start with a zero-day — they start with
            a misconfigured firewall rule nobody remembered to close. Oragrol
            continuously monitors your infrastructure, flags the gaps that
            actually matter, and tells you exactly what to fix first. No
            hundred-page reports, no jargon — just a clear picture of where
            you stand, updated in real time, built for teams who have a
            business to run, not a security team to build.
          </p>
          <p className="mt-4 max-w-2xl font-body text-sm text-text-muted">
            Published August 2026 · 4 min read
          </p>
        </section>

        {/* 03 — Scores / Data */}
        <section className="mt-20 border-t border-border pt-12">
          <SectionLabel>03 — Scores / Data · font-data · JetBrains Mono</SectionLabel>

          <div className="mt-6 w-full max-w-sm rounded-2xl border border-border p-8">
            <p className="font-body text-xs font-medium uppercase tracking-widest text-text-secondary">
              Cyber Health Score
            </p>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-data text-7xl font-bold text-accent">
                78
              </span>
              <span className="font-data text-2xl text-text-secondary">
                /100
              </span>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full bg-risk-medium"
                aria-hidden="true"
              />
              <span className="font-body text-sm font-medium text-risk-medium">
                Medium risk
              </span>
            </div>
          </div>
        </section>

        {/* 04 — Logo / Brand */}
        <section className="mt-20 border-t border-border pt-12 pb-4">
          <SectionLabel>04 — Logo / Brand only · font-brand · Epilogue</SectionLabel>

          <span className="mt-6 block font-brand text-5xl font-semibold tracking-tight text-accent md:text-6xl">
            Oragrol
          </span>
          <p className="mt-4 font-body text-sm text-text-muted">
            Used exclusively for the logo wordmark — never for headings or
            body copy.
          </p>
        </section>
      </div>
    </div>
  );
}
