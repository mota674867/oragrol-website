"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { ButtonLink, type ButtonSize, type ButtonVariant } from "../../ui";
import { AiLoader } from "./ai-loader";

const TRANSITION_DURATION_MS = 2600;

/**
 * AssessmentCta — wraps the real `ButtonLink` to the live Tally
 * assessment with a brief on-page loading transition (D-042).
 *
 * Deliberately NOT implemented as a JS-triggered `window.open()` inside
 * a delayed callback: once `window.open` isn't called synchronously
 * within the click event's own call stack, browsers reliably treat it
 * as a popup and block it — that would have quietly broken the real,
 * live, revenue-critical path to the Tally assessment the first time
 * someone actually clicked it. Instead, the underlying element stays a
 * genuine `<a target="_blank">` — the browser's own native new-tab
 * navigation is completely unmodified and unintercepted (no
 * `preventDefault`), so middle-click, right-click "open in new tab,"
 * and keyboard activation all keep working exactly as before. The
 * `onClick` handler here runs ALONGSIDE that native navigation purely
 * to show `AiLoader` as a cosmetic transition on the page the user is
 * still looking at — by the time it renders, the new tab has already
 * started loading in the background.
 */
export function AssessmentCta({
  href,
  variant = "primary",
  size = "lg",
  className,
  children,
}: {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
}) {
  const [showTransition, setShowTransition] = useState(false);

  return (
    <>
      <ButtonLink
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        variant={variant}
        size={size}
        className={className}
        onClick={() => {
          setShowTransition(true);
          window.setTimeout(() => setShowTransition(false), TRANSITION_DURATION_MS);
        }}
      >
        {children}
      </ButtonLink>

      {showTransition && (
        <div
          className="env-dark fixed inset-0 z-50 flex items-center justify-center bg-background/95"
          role="status"
          aria-live="polite"
        >
          <AiLoader />
        </div>
      )}
    </>
  );
}
