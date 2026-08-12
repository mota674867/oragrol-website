"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { Icon } from "../ui";

/**
 * HeaderSearch — Header Refinement Pass 1.
 *
 * Brief section 6 already specified a search icon in the header; it just
 * hadn't been built yet. This is that icon plus its overlay — a real,
 * functional, keyboard-accessible open/close dialog with a working text
 * input, but intentionally NOT wired to live results: there's no
 * content/index to search yet (no Services/Solutions/Insights pages
 * exist), and faking results would be worse than not having them. Submit
 * is a deliberate no-op. Same "shell now, wire up later" precedent as
 * MobileMenuTrigger in Step 3.
 *
 * Self-contained (owns its own open state) so it drops into the header's
 * actions row as a single unit — no state threading through SiteHeader.
 */
export function HeaderSearch() {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }
      // Minimal focus trap — exactly two focusable elements in the dialog
      // (input, close button) — wrap Tab/Shift+Tab between them so
      // keyboard focus can't leave the dialog while it's open.
      if (event.key === "Tab") {
        const active = document.activeElement;
        if (event.shiftKey && active === inputRef.current) {
          event.preventDefault();
          closeButtonRef.current?.focus();
        } else if (!event.shiftKey && active === closeButtonRef.current) {
          event.preventDefault();
          inputRef.current?.focus();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label="Search"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-text-primary transition-colors duration-150 hover:bg-text-primary/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <Icon icon={Search} size="md" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[60]">
          <div
            aria-hidden="true"
            onClick={close}
            className="absolute inset-0 bg-background/90 backdrop-blur-sm"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Search"
            className="relative mx-auto mt-24 w-full max-w-2xl px-6"
          >
            <form
              onSubmit={(event) => event.preventDefault()}
              className="flex items-center gap-3 rounded-xl border border-border bg-surface px-5 py-4 shadow-xl"
            >
              <Icon icon={Search} size="md" className="shrink-0 text-text-secondary" />
              <input
                ref={inputRef}
                type="search"
                placeholder="Search Oragrol"
                className="min-w-0 flex-1 bg-transparent font-body text-base text-text-primary placeholder:text-text-muted focus:outline-none [&::-webkit-search-cancel-button]:appearance-none"
              />
              <button
                ref={closeButtonRef}
                type="button"
                aria-label="Close search"
                onClick={close}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-secondary transition-colors duration-150 hover:bg-text-primary/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <Icon icon={X} size="sm" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
