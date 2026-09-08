"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";

export type MenuLink = { label: string; href: string; description?: string };
export type MenuGroup = { title?: string; links: MenuLink[] };
export type NavItem = { label: string; href?: string; groups?: MenuGroup[] };
export type OragrolMegaNavProps = {
  /** Real site navigation + actual subpages — see nav-items.ts, the single
   *  source of truth this is built from. No invented routes. */
  items: NavItem[];
  label?: string;
  /** Current page's pathname (from next/navigation's usePathname()) — used
   *  to mark the matching top-level item with the site's existing active
   *  underline. Adapted in from the standalone spec: every page already
   *  needed this (each page previously hardcoded its own `active` class by
   *  index), so the shared component owns it instead of every caller
   *  reimplementing the same pathname-compare. */
  activePath?: string | null;
};

/**
 * Shared mega-nav, mounted identically in every page's existing header
 * (replacing that page's own inline `<nav>`), alongside its current
 * logo/actions — see ORAGROL_MegaNav_Guide.md for the full spec this was
 * built against. Two deliberate departures from the standalone reference
 * component, both called out in the guide as this project's own call to
 * make ("adapting to existing conventions"):
 *
 * 1. `activePath` prop (above) — reuses the site's pre-existing orange
 *    active-underline convention on the top-level trigger/link itself. The
 *    approved "no orange in navigation dropdowns" rule governs the PANEL
 *    (group titles/links/hover) below, not the top-level active-page
 *    indicator every page already had.
 * 2. Trigger/direct link font-size and inter-item gap are hardcoded to this
 *    site's own already-unified nav values (12px / clamp(18px,2vw,38px) —
 *    see gpt-pages.css `.primary-nav`/`.one-nav`/`.industry-header nav`/
 *    `.ba-nav`, all matched to the same values earlier this project) rather
 *    than the reference file's own placeholder 14px/28px — otherwise this
 *    would reintroduce the exact per-page nav inconsistency that was fixed
 *    site-wide before this component existed.
 * 3. Breakpoint moved from the reference's default 900px to 1100px — the
 *    actual width where every existing page's own header grid collapses
 *    (112px 1fr, dropping its 380px action column: see gpt-pages.css
 *    `.ba-header`/`.one-header`/`.industry-header` and their matching
 *    @media(max-width:1100px) blocks, homepage-v3.css's `.home-nav` at
 *    1050px). Per the guide's own instruction to tune this rather than
 *    keep the default: at 900px there would be a 900-1099px band where the
 *    surrounding header is still full desktop width while this component
 *    had already switched to its mobile accordion, or the reverse — either
 *    way a visible mismatch between the header's own layout state and this
 *    component's. 1100px is also, not coincidentally, where every one of
 *    these pages previously just set its nav to `display:none` outright
 *    below that width with no replacement — see the guide-flagged
 *    integration note in nav-items.ts / the shipped commit message: this
 *    component's own mobile accordion is the first working mobile nav
 *    these pages have had, not a duplicate of an existing drawer.
 */
export default function OragrolMegaNav({ items, label = "Main navigation", activePath = null }: OragrolMegaNavProps) {
  const [open, setOpen] = useState<number | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  // Measured, not guessed: every page's actual header height differs
  // (88px normally, 70/72px past its own smaller breakpoint) and none of
  // that matches the reference component's own hardcoded mobile-panel
  // offset, so the mobile drawer's top position is read live off this
  // component's own rendered position instead of assuming a fixed value.
  const [mobileTop, setMobileTop] = useState(88);
  const root = useRef<HTMLElement>(null);
  const triggers = useRef<Array<HTMLButtonElement | null>>([]);
  const mobileTrigger = useRef<HTMLButtonElement>(null);
  const uid = useId();

  useEffect(() => {
    function measure() {
      const rect = root.current?.getBoundingClientRect();
      if (rect) setMobileTop(Math.round(rect.bottom));
    }
    if (mobileOpen) measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [mobileOpen]);

  useEffect(() => {
    // Only listen while something is actually open — previously this ran
    // unconditionally on every single pointerdown anywhere on the page
    // (clicking a footer link included) and always called setOpen(null)/
    // setMobileOpen(false) regardless of state, forcing a redundant
    // re-render of this component on every click on the page. Harmless by
    // itself, but unnecessary and one less thing competing with a click
    // elsewhere on the page while this fires.
    if (open === null && !mobileOpen) return;
    function outside(event: PointerEvent) {
      if (event.target instanceof Node && !root.current?.contains(event.target)) {
        setOpen(null);
        setMobileOpen(false);
      }
    }
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open, mobileOpen]);

  // Close on route change — every item click already calls close(), but
  // this also covers browser back/forward and the logo link. A textbook
  // "reset state when an external value changes" effect, not something
  // to restructure away.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- see comment above
    setOpen(null);
    setMobileOpen(false);
  }, [activePath]);

  function close() {
    setOpen(null);
    setMobileOpen(false);
  }

  return (
    <nav
      className="om-nav"
      ref={root}
      aria-label={label}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) close();
      }}
      onKeyDown={(event) => {
        if (event.key !== "Escape") return;
        event.stopPropagation();
        if (open !== null) {
          triggers.current[open]?.focus();
          setOpen(null);
        } else if (mobileOpen) {
          mobileTrigger.current?.focus();
          setMobileOpen(false);
        }
      }}
    >
      <style>{styles}</style>
      <button
        ref={mobileTrigger}
        className="om-mobile-toggle"
        type="button"
        aria-expanded={mobileOpen}
        aria-controls={`${uid}-list`}
        onClick={() => {
          setMobileOpen(!mobileOpen);
          setOpen(null);
        }}
      >
        {mobileOpen ? "Close menu" : "Menu"}
      </button>
      <ul
        id={`${uid}-list`}
        className={`om-list${mobileOpen ? " om-mobile-open" : ""}`}
        style={mobileOpen ? ({ "--om-mobile-top": `${mobileTop}px` } as React.CSSProperties) : undefined}
      >
        {items.map((item, index) => {
          const groups = item.groups?.filter((group) => group.links.length > 0) || [];
          const expanded = open === index;
          const panelId = `${uid}-panel-${index}`;
          const triggerId = `${uid}-trigger-${index}`;
          const isActive = !!(activePath && item.href && activePath === item.href);
          return (
            <li className="om-item" key={`${item.label}-${index}`}>
              {groups.length ? (
                <>
                  <button
                    id={triggerId}
                    ref={(node) => {
                      triggers.current[index] = node;
                    }}
                    className={`om-trigger${isActive ? " om-active" : ""}`}
                    type="button"
                    aria-expanded={expanded}
                    aria-controls={panelId}
                    onClick={() => setOpen(expanded ? null : index)}
                  >
                    {item.label}
                    <svg className="om-chevron" viewBox="0 0 12 12" width="12" height="12" fill="none" aria-hidden="true">
                      <path d="m2 4 4 4 4-4" stroke="currentColor" strokeWidth="1.4" />
                    </svg>
                  </button>
                  <div
                    id={panelId}
                    aria-labelledby={triggerId}
                    className="om-panel"
                    hidden={!expanded}
                    style={{ "--om-columns": Math.min(groups.length, 3) } as React.CSSProperties}
                  >
                    {item.href && (
                      <Link className="om-overview" href={item.href} onClick={close}>
                        {item.label}
                        <span aria-hidden="true"> →</span>
                      </Link>
                    )}
                    <div className="om-groups">
                      {groups.map((group, groupIndex) => (
                        <section className="om-group" key={`${group.title}-${groupIndex}`}>
                          {group.title && <h2>{group.title}</h2>}
                          <ul>
                            {group.links.map((link) => (
                              <li key={`${link.label}-${link.href}`}>
                                <Link className="om-link" href={link.href} onClick={close}>
                                  <span className="om-link-title">{link.label}</span>
                                  {link.description && <span className="om-description">{link.description}</span>}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </section>
                      ))}
                    </div>
                  </div>
                </>
              ) : item.href ? (
                <Link className={`om-direct${isActive ? " om-active" : ""}`} href={item.href} onClick={close}>
                  {item.label}
                </Link>
              ) : (
                <span className="om-direct">{item.label}</span>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

const styles = `
.om-nav{--om-panel:#d9d9d6;--om-text:#111315;--om-muted:#666;--om-rule:#b8b7b2;position:relative;font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;font-stretch:normal;font-weight:400;z-index:50}
.om-nav *{box-sizing:border-box}
.om-list,.om-group ul{list-style:none;padding:0;margin:0}
.om-list{display:flex;align-items:center;justify-content:center;gap:clamp(18px,2vw,38px)}
.om-item{position:relative}
.om-trigger,.om-direct{font-family:inherit;font-size:12px;line-height:1.4;color:inherit;text-decoration:none;display:inline-flex;align-items:center;gap:6px;padding:0;border:0;background:transparent;cursor:pointer;white-space:nowrap;position:relative}
.om-active{position:relative}
.om-active:after{content:"";position:absolute;left:0;right:0;bottom:-14px;height:2px;background:var(--om-active,#ef4d00)}
.om-chevron{transition:transform .15s ease}
.om-trigger[aria-expanded=true] .om-chevron{transform:rotate(180deg)}
.om-panel{position:absolute;top:100%;left:50%;transform:translateX(-50%);margin-top:24px;width:min(calc(var(--om-columns)*280px + 72px),calc(100vw - 32px));max-height:calc(100dvh - 140px);overflow:auto;padding:28px 32px 32px;background:var(--om-panel);color:var(--om-text);border:1px solid var(--om-rule);border-radius:4px}
.om-panel[hidden]{display:none!important}
.om-overview{display:inline-block;margin:0 0 22px;font-size:17px;font-weight:500;color:var(--om-text);text-decoration:none}
.om-groups{display:grid;grid-template-columns:repeat(var(--om-columns),minmax(0,1fr));gap:28px}
.om-group h2{font-size:11px;line-height:1.5;color:var(--om-muted);font-weight:400;margin:0 0 14px;letter-spacing:.08em;text-transform:uppercase}
.om-group li+li{margin-top:10px}
.om-link{display:block;color:var(--om-text);text-decoration:none;padding:6px 0;overflow-wrap:anywhere;background:transparent}
.om-link-title{display:block;font-size:13px;font-weight:500;line-height:1.4}
.om-description{display:block;font-size:11px;line-height:1.5;margin-top:4px;font-weight:400;color:var(--om-muted)}
.om-panel a:hover,.om-panel a:focus-visible{color:#fff;background:transparent;text-decoration:underline;text-underline-offset:4px}
.om-panel a:hover .om-description,.om-panel a:focus-visible .om-description{color:inherit}
.om-nav :focus-visible{outline:2px solid currentColor;outline-offset:4px}
.om-panel a:focus-visible{outline-color:#111315}
/* Several pages' own header CSS sets a blanket !important color on every
   bare <a>/<button> inside their header, meant for the visible top-bar
   wordmark/CTA on that page's own theme (e.g. light text on Resources'
   dark header). Since the panel is DOM-nested inside that same header,
   those rules were bleeding into the panel's own content too — turning
   its "dark text on a light titanium panel" into invisible white-on-
   light. The panel's own colors must never depend on which page it's
   mounted in, so every rule below is deliberately over-specified
   (.om-nav .om-panel ...) plus !important to always win regardless of
   what a given page's header CSS does. Only the panel's own content is
   covered here — .om-trigger/.om-direct and .om-mobile-toggle are left
   alone on purpose, since those sit directly on the header itself and
   correctly take on that page's own header color scheme (light text on
   a dark header, dark text on a light one). */
.om-nav .om-panel{color:var(--om-text)!important}
.om-nav .om-overview{color:var(--om-text)!important}
.om-nav .om-link{color:var(--om-text)!important}
.om-nav .om-group h2{color:var(--om-muted)!important}
.om-nav .om-description{color:var(--om-muted)!important}
.om-nav .om-panel a:hover,.om-nav .om-panel a:focus-visible{color:#fff!important}
.om-nav .om-panel a:hover .om-description,.om-nav .om-panel a:focus-visible .om-description{color:inherit!important}
.om-mobile-toggle{display:none;font:inherit;font-size:12px;color:inherit;border:1px solid currentColor;background:transparent;padding:8px 14px;min-height:38px}
@media(max-width:1100px){
.om-nav{width:100%}
.om-mobile-toggle{display:inline-flex;align-items:center;cursor:pointer}
.om-list{display:none}
.om-list.om-mobile-open{display:block;position:fixed;left:18px;right:18px;top:var(--om-mobile-top,88px);margin-top:0;background:var(--om-panel);color:var(--om-text);padding:8px 18px;max-height:calc(100dvh - var(--om-mobile-top,88px) - 20px);overflow:auto;border:1px solid var(--om-rule);border-radius:4px;z-index:60}
.om-item+.om-item{border-top:1px solid var(--om-rule)}
.om-trigger,.om-direct{width:100%;min-height:48px;white-space:normal;justify-content:space-between;text-align:left;font-size:14px}
.om-active:after{display:none}
.om-panel{position:static;transform:none;width:100%;max-height:none;overflow:visible;border:0;border-radius:0;padding:10px 0 22px;margin-top:0}
.om-groups{grid-template-columns:1fr;gap:20px}
.om-overview{font-size:14px;margin-bottom:16px}
.om-group h2{margin-bottom:8px}
.om-link{min-height:44px;padding:10px 0}
}
@media(prefers-reduced-motion:reduce){.om-chevron{transition:none}}
`;
