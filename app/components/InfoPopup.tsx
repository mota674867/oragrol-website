"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Info, X } from "lucide-react";
import { Icon } from "./ui/icon-wrapper";

/**
 * InfoPopup — real fix: the modal now renders through a React portal
 * directly onto document.body, escaping this page's own CSS (every
 * direct child of the containing <article> gets position:relative;
 * z-index:1 applied to it, trapping the modal's stacking inside a
 * nested context instead of actually painting on top of the page).
 * Standard, proven technique for this exact class of bug.
 *
 * SEO/GEO: portals only exist client-side, so a separate, always
 * server-rendered, visually-hidden (not display:none) text block
 * carries the full content for crawlers/AI, independent of the portal.
 */

// Correct SSR-hydration-safe "is this running client-side yet" check —
// returns false during server rendering (getServerSnapshot), true once
// hydrated (getSnapshot). Needed because createPortal requires
// document.body, which doesn't exist during Next.js's server render.
function subscribeNoop() {
  return () => {};
}
function getClientSnapshot() {
  return true;
}
function getServerSnapshot() {
  return false;
}

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
  const mounted = useSyncExternalStore(subscribeNoop, getClientSnapshot, getServerSnapshot);
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

  const panel = (
    <div
      aria-hidden={!open}
      style={variant === "modal" ? { position: "fixed", inset: 0, zIndex: 9999 } : undefined}
      className={variant === "modal" ? (open ? "" : "hidden") : "relative inline-block"}
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
        style={{ backgroundColor: "#e9e5dc", borderTop: "4px solid #db5227" }}
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
  );

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
        className="relative inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{ color: "#db5227", outlineColor: "#db5227" }}
      >
        <Icon icon={Info} size="sm" className="h-4 w-4" />
      </button>

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

      <span
        style={{
          position: "absolute",
          width: "1px",
          height: "1px",
          padding: 0,
          margin: "-1px",
          overflow: "hidden",
          clip: "rect(0,0,0,0)",
          whiteSpace: "nowrap",
          border: 0,
        }}
      >
        {content}
      </span>

      {variant === "popover" && panel}
      {variant === "modal" && mounted && createPortal(panel, document.body)}
    </span>
  );
}
