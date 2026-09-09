"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ScopeTray, useScope, type ScopeItem } from "../components/ScopeTray";
import PreFooterCta from "../components/site/pre-footer-cta";
import SiteFooter from "../components/site/footer";
import OragrolMegaNav from "../components/site/oragrol-mega-nav";
import { NAV_ITEMS } from "../components/site/nav-items";
import ServicesPage, {
  INDIVIDUAL_SERVICES,
  type ServicesSelection,
} from "./services-body";
import "../gpt-pages.css";

/**
 * Client body for /services (2026-09-08 rebuild). The header, ScopeTray,
 * PreFooterCta and footer below are unchanged from the page this replaces —
 * only the middle (hero through guidance) changed, from the old OR10 radial
 * index to the package / à-la-carte / specialist structure in
 * services-body.tsx. See services-body.tsx's own top comment for the
 * hero-dimension notes.
 */

// Individual services reuse the exact `cyber:<code>` scope id the site
// already used before this rebuild, so a returning visitor's existing My
// Scope selections are recognized as the same item, not duplicated.
// Packages are a new concept with no prior id to preserve.
const serviceScopeId = (code: string) => `cyber:${code}`;
const packageScopeId = (id: string) => `cyber-package:${id}`;

function billingSuffix(billing: ServicesSelection["billing"]) {
  if (billing === "monthly") return "/mo";
  if (billing === "per-application") return "/app · one-time";
  return "one-time";
}

function toScopeItem(selection: ServicesSelection): ScopeItem {
  const commercial = `$${selection.priceCAD.toLocaleString("en-CA")}${billingSuffix(selection.billing)}`;
  if (selection.kind === "package") {
    const includedCount = selection.includedServices?.length ?? 0;
    return {
      id: packageScopeId(selection.id),
      area: "Cybersecurity",
      code: selection.id.toUpperCase(),
      title: selection.name,
      detail: `${includedCount} included services: ${(selection.includedServices ?? []).join(", ")}`,
      commercial: `${commercial} · 12-month contract`,
    };
  }
  return {
    id: serviceScopeId(selection.id),
    area: "Cybersecurity",
    code: selection.id,
    title: selection.name,
    detail: selection.name,
    commercial,
  };
}

function ServicesClient() {
  const pathname = usePathname();
  const router = useRouter();
  const [trayOpen, setTrayOpen] = useState(false);
  const scope = useScope();

  // Reconcile stale cart data: a returning visitor may have items added
  // under the previous OR10 catalogue's `cyber:<code>` ids and prices —
  // e.g. Virtual CISO (C01-S04) previously showed "$2,500-$4,500/mo"; this
  // rebuild sells it at a flat $3,500/mo. Same id (so it still reads as
  // "already added", no duplicate SKU), but a stale commercial figure the
  // visitor never re-confirmed. Patch title/detail/commercial in place on
  // mount so the ScopeTray, any submitted enquiry and the downloaded PDF
  // reflect the current figure. Runs once per hydration (length-based dep,
  // not the array itself, so it doesn't re-fire on every render — see
  // ScopeTray.tsx's own hydration effect for the same localStorage timing).
  useEffect(() => {
    const canonical = new Map(
      INDIVIDUAL_SERVICES.map((s) => [serviceScopeId(s.code), s]),
    );
    let changed = false;
    const next = scope.items.map((item) => {
      const current = canonical.get(item.id);
      if (!current) return item;
      const commercial = `$${current.price.toLocaleString("en-CA")}${billingSuffix(current.billing)}`;
      if (item.title === current.name && item.commercial === commercial) {
        return item;
      }
      changed = true;
      return { ...item, title: current.name, detail: current.name, commercial };
    });
    if (changed) {
      scope.setItems(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope.items.length]);

  const addToScope = (selection: ServicesSelection) => {
    if (selection.kind === "package") {
      // One selected package at a time — replace, don't stack — per the
      // handoff. Unrelated Automation/OR ONE items and individual
      // Cybersecurity services are left untouched.
      scope.items
        .filter(
          (item) =>
            item.id.startsWith("cyber-package:") &&
            item.id !== packageScopeId(selection.id),
        )
        .forEach((item) => scope.remove(item.id));
    }
    scope.toggle(toScopeItem(selection));
    setTrayOpen(true);
  };

  const isInScope = (selection: ServicesSelection) =>
    scope.has(
      selection.kind === "package"
        ? packageScopeId(selection.id)
        : serviceScopeId(selection.id),
    );

  const discussEngagement = (engagement: { code: string; name: string }) => {
    // Deliberately unused for now — see the comment below on why the
    // specialty can't yet be carried through to the contact form.
    void engagement;
    // The contact form (app/contact/contact-client.tsx) has no mechanism
    // today to receive a pre-selected specialty — no query param it reads,
    // and per the handoff we shouldn't invent one it would silently ignore,
    // nor add specialist engagements to the subscription-style scope cart.
    // Modifying contact-client.tsx itself is out of scope here too (see the
    // "other pages" limit). This sends the visitor straight to the real,
    // existing enquiry form; today they still need to name the engagement
    // by hand in "what would you like to achieve" — a real, known gap,
    // flagged rather than papered over.
    router.push("/contact#enquiry");
  };

  return (
    <main className="services-page">
      <header className="site-header">
        <Link className="wordmark" href="/">
          <span>ORAGROL</span>
          <small>GLOBAL</small>
        </Link>
        <OragrolMegaNav items={NAV_ITEMS} activePath={pathname} />
        <div className="header-actions">
          <button
            className="scope-nav-button"
            onClick={() => setTrayOpen(true)}
          >
            My Scope <b>{scope.items.length}</b>
          </button>
          <Link className="score-link" href="/cyber-health">
            Get Cyber Health Score
          </Link>
          <button className="search" aria-label="Search">
            <span />
          </button>
          <button className="language">EN / FR</button>
        </div>
      </header>

      <ServicesPage
        onAddToScope={addToScope}
        isInScope={isInScope}
        onDiscussEngagement={discussEngagement}
      />

      <PreFooterCta page="services" />
      <SiteFooter />
      <ScopeTray
        items={scope.items}
        remove={scope.remove}
        clear={scope.clear}
        open={trayOpen}
        setOpen={setTrayOpen}
        activeArea="Cybersecurity"
      />
    </main>
  );
}

export default ServicesClient;
