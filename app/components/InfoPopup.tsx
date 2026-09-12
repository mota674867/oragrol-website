"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Info, X } from "lucide-react";
import { Icon } from "./ui/icon-wrapper";

/**
 * InfoPopup — the site-wide ⓘ info icon + content card, per
 * Info_Icon_System_Design_Brief.md.
 *
 * Two variants, matched to content length:
 * - "modal": BA, Services, Specialist Engagements, OR ONE (19 items) —
 *   longer content, centered, scrolls internally if it overflows.
 * - "popover": À La Carte (12 items) — short content, anchored beside
 *   the icon, no scroll needed.
 *
 * Visual spec (locked, corrected from the original orange-background
 * proposal after a real WCAG contrast check): white text directly on
 * Burnt Orange only reaches 4.0:1, below the 4.5:1 AA minimum for body
 * text. Reuses the site's own existing `.env-light` environment
 * (Warm Off-White background, Deep Ink text, 15.55:1 — verified) instead
 * of inventing new colors, with Burnt Orange kept to what the token file
 * itself documents it for: "signature accent ONLY, never dominant" — a
 * thin top border here, plus the icon and tooltip.
 *
 * SEO/GEO (non-negotiable per the design brief): `content` is ALWAYS
 * rendered into the DOM — visibility is toggled with a CSS class, not by
 * conditionally mounting/unmounting the JSX. A crawler or AI answer
 * engine reading the page's initial HTML sees the full content whether
 * or not a visitor has ever clicked the icon. `plainText` feeds a
 * FAQPage/Question JSON-LD block for the same reason: structured data is
 * specifically what AI search/answer systems look for when deciding
 * what to cite.
 */

export function InfoPopup({
  id,
  title,
  variant,
  content,
  plainText,
}: {
  id: string;
  title: string;
  variant: "modal" | "popover";
  content: ReactNode;
  plainText: string;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
        return;
      }
      // Minimal focus trap between the close button and the panel's
      // last focusable element (there's no interactive content inside
      // the info body itself, so this wraps Tab back to close).
      if (event.key === "Tab" && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    const onClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        close();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    // Delay attaching the outside-click listener by a tick so the same
    // click that opened the popup doesn't immediately close it again.
    const t = setTimeout(() => document.addEventListener("mousedown", onClickOutside), 0);
    if (variant === "modal") {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        window.removeEventListener("keydown", onKeyDown);
        document.removeEventListener("mousedown", onClickOutside);
        clearTimeout(t);
        document.body.style.overflow = previousOverflow;
      };
    }
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onClickOutside);
      clearTimeout(t);
    };
  }, [open, variant]);

  const panelId = `info-panel-${id}`;
  const titleId = `info-title-${id}`;
  const [iconHover, setIconHover] = useState(false);

  return (
    <span className="relative inline-flex" style={{ marginLeft: "10px", verticalAlign: "middle" }}>
      <button
        ref={triggerRef}
        type="button"
        aria-label={`What's included: ${title}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setIconHover(true)}
        onMouseLeave={() => setIconHover(false)}
        className="group relative inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{
          // Inline, not a Tailwind utility class: confirmed via live
          // inspection that a plain utility class (0,1,0 specificity)
          // loses to this page's own .job-stage h3 rule and silently
          // inherits the surrounding heading's white color instead.
          // Inline styles always win regardless of a given page's
          // unknown ambient CSS — needed since this component gets
          // reused on 4 more pages next, each with its own legacy CSS.
          color: iconHover ? "#a43e1d" : "#db5227",
          outlineColor: "#db5227",
        }}
      >
        <Icon icon={Info} size="sm" className="h-4 w-4" />
        {/* Hover tooltip — desktop only (:hover has no effect on touch).
            Reuses the same env-light/Deep-Ink pairing as the panel itself,
            same reason: white text on plain Burnt Orange fails contrast
            at this size. Visibility is driven by iconHover state, not
            CSS :hover/group-hover — the same specificity risk that broke
            the icon's own color applies here too, and this tooltip only
            needs to work on desktop anyway (no touch equivalent). */}
        {iconHover && (
          <span
            role="tooltip"
            className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-md px-2 py-1 text-xs font-medium shadow-md md:block"
            style={{ backgroundColor: "#ffffff", color: "#0a0c12", border: "1px solid #d6d3c9" }}
          >
            What&apos;s included
          </span>
        )}
      </button>

      {/* Structured data — always present, for AI/search citation,
          independent of whether the popup has ever been opened. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Question",
            name: title,
            acceptedAnswer: { "@type": "Answer", text: plainText },
          }),
        }}
      />

      <div
        aria-hidden={!open}
        className={
          variant === "modal"
            ? open
              ? "fixed inset-0 z-[70]"
              : "hidden"
            : "contents"
        }
      >
        {variant === "modal" && (
          <div aria-hidden="true" className="absolute inset-0" style={{ backgroundColor: "rgba(10,12,18,0.95)" }} />
        )}
        <div
          ref={panelRef}
          id={panelId}
          role="dialog"
          aria-modal={variant === "modal"}
          aria-labelledby={titleId}
          className={
            variant === "modal"
              ? "relative mx-auto my-8 max-h-[calc(100vh-4rem)] w-[min(600px,calc(100vw-2rem))] overflow-y-auto rounded-2xl p-6 shadow-2xl md:p-8"
              : `absolute z-20 mt-2 w-[min(300px,calc(100vw-2rem))] rounded-xl p-4 shadow-xl ${open ? "block" : "hidden"}`
          }
          style={{
            backgroundColor: "#e9e5dc",
            borderTop: "4px solid #db5227",
          }}
          // Content stays in the DOM at all times for SEO/GEO — only
          // this wrapper's own display toggles via the ternary above.
          // The content node itself is never conditionally unmounted.
          // Colors are inline, not Tailwind/.env-light utility classes:
          // confirmed via live inspection on the BA page that a plain
          // utility class loses to that page's own ambient CSS rules —
          // inline styles are the only approach guaranteed to render
          // correctly regardless of which page this reuses on next.
        >
          <div className="mb-3 flex items-start justify-between gap-3">
            <h3 id={titleId} className="font-heading text-lg font-bold md:text-xl" style={{ color: "#0a0c12" }}>
              {title}
            </h3>
            <button
              ref={closeRef}
              type="button"
              onClick={close}
              aria-label="Close"
              tabIndex={open ? 0 : -1}
              className="shrink-0 rounded-full p-1 transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{ color: "#50545c", outlineColor: "#db5227" }}
            >
              <Icon icon={X} size="sm" />
            </button>
          </div>
          <div
            className="font-body text-sm leading-relaxed [&_a]:underline [&_strong]:font-semibold [&_sub]:text-xs [&_table]:w-full"
            style={{ color: "#0a0c12" }}
          >
            {content}
          </div>
        </div>
      </div>
    </span>
  );
}
