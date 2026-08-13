"use client";

import { useEffect, useState } from "react";
import { NavLink } from "../../ui";
import { cn } from "../../ui/cn";

/**
 * CategoryNav — Services' sticky left-side capability nav (D-016, item 3;
 * also resolves item 1's "dead gutter" complaint by giving that space a
 * real structural job instead of widening the reading column further).
 *
 * Lists all 8 real capabilities (from LIVE_SERVICES/FINALIZING_SERVICES —
 * nothing invented, per the explicit instruction), jump-scrolls to each
 * panel's real DOM id, and tracks which one is currently in view via
 * IntersectionObserver. Active state reuses `NavLink`'s own existing
 * accent-color convention (site-header active links) rather than
 * inventing a new one, plus a left accent-bar per the "underline or bold,
 * per existing design system" instruction.
 *
 * Sticky within LiveServices only (the 4 live rows — the tallest, most
 * detailed part of the page, where the gutter was most visible); the 4
 * finalizing capabilities are still real nav targets, just below where
 * the sidebar's own sticky container ends — consistent with the page's
 * existing live/finalizing visual-weight distinction (D-007).
 */

export interface CategoryNavItem {
  id: string;
  n: string;
  label: string;
}

export function CategoryNav({ items }: { items: CategoryNavItem[] }) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const targets = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 },
    );
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav aria-label="Capability categories" className="sticky top-28 hidden lg:block">
      <ul className="flex flex-col gap-3">
        {items.map((item) => {
          const active = activeId === item.id;
          return (
            <li
              key={item.id}
              className={cn(
                "border-l-2 pl-4 transition-colors duration-200",
                active ? "border-accent" : "border-border",
              )}
            >
              <NavLink href={`#${item.id}`} active={active} className="flex items-baseline gap-2">
                <span className="font-data text-[11px] text-text-muted">{item.n}</span>
                <span>{item.label}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
