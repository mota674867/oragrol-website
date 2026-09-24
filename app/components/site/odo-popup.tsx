"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import "./odo-popup.css";

/*
 * ORAGROL ODO discovery popup — visual + behavior handoff for Claude.
 *
 * Drop <OdoDiscoveryPopup /> into the shared site shell. The component:
 * - runs only on /, /services, /business-automation, and /or-one;
 * - opens after 30 seconds or after 50% scroll, whichever comes first;
 * - uses a first-party browser-session cookie so all tabs share one decision;
 * - never opens again after dismissing, starting the scan, or using the nav scan;
 * - sends the CTA to /scan only;
 * - exposes onEvent for first-party analytics (no tracker is included here).
 *
 * The navigation utility's Free Scan link should use:
 *   onClick={markOdoFreeScanClicked}
 * or add data-odo-free-scan to that link.
 */

const ALLOWED_PATHS = new Set(["/", "/services", "/business-automation", "/or-one"]);
const COOKIE_SEEN = "oragrol_odo_popup_seen";
const COOKIE_NAV_SCAN = "oragrol_odo_nav_scan_clicked";
const STORAGE_SEEN = "oragrol_odo_popup_seen";
const STORAGE_NAV_SCAN = "oragrol_odo_nav_scan_clicked";
const noop = () => {};

const HOW_IT_WORKS = [
  {
    number: "01",
    title: "Public research",
    body: "ODO reviews your website and other relevant public business information.",
  },
  {
    number: "02",
    title: "Only useful questions",
    body: "ODO asks only what it needs to improve the recommendation. You can stop at any time.",
  },
  {
    number: "03",
    title: "Your personalized report",
    body: "You receive a clear report within 24 hours, free, with no sales call or commitment.",
  },
];

function normalizePath(pathname) {
  if (!pathname || pathname === "/") return "/";
  return pathname.replace(/\/+$/, "") || "/";
}

function readCookie(name) {
  if (typeof document === "undefined") return false;
  try {
    return document.cookie
      .split(";")
      .map((part) => part.trim())
      .some((part) => part.startsWith(`${name}=`));
  } catch {
    return false;
  }
}

function writeSessionCookie(name) {
  if (typeof document === "undefined") return;
  try {
    // No Max-Age/Expires: this is a first-party browser-session cookie.
    document.cookie = `${name}=1; Path=/; SameSite=Lax`;
  } catch {
    // sessionStorage below is the fallback when cookies are unavailable.
  }
}

function readSessionStorage(name) {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(name) === "1";
  } catch {
    return false;
  }
}

function writeSessionStorage(name) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(name, "1");
  } catch {
    // A cookie is still available in normal browser settings.
  }
}

function hasSessionFlag(cookieName, storageName) {
  return readCookie(cookieName) || readSessionStorage(storageName);
}

function markSeen() {
  writeSessionCookie(COOKIE_SEEN);
  writeSessionStorage(STORAGE_SEEN);
}

/** Call this from the header utility-bar Free Scan link. */
export function markOdoFreeScanClicked() {
  writeSessionCookie(COOKIE_NAV_SCAN);
  writeSessionStorage(STORAGE_NAV_SCAN);
}

function isElement(value) {
  return typeof Element !== "undefined" && value instanceof Element;
}

export default function OdoDiscoveryPopup({ onEvent = noop }) {
  const [visible, setVisible] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const closeButtonRef = useRef(null);
  const ctaRef = useRef(null);
  const learnRef = useRef(null);
  const noThanksRef = useRef(null);
  const previousFocusRef = useRef(null);

  const currentPath = () =>
    typeof window === "undefined" ? "/" : normalizePath(window.location.pathname);

  const emit = useCallback(
    (type, extra = {}) => {
      onEvent({ type, path: currentPath(), ...extra });
    },
    [onEvent],
  );

  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") return undefined;

    const path = normalizePath(window.location.pathname);
    if (!ALLOWED_PATHS.has(path)) return undefined;
    if (hasSessionFlag(COOKIE_SEEN, STORAGE_SEEN)) return undefined;
    if (hasSessionFlag(COOKIE_NAV_SCAN, STORAGE_NAV_SCAN)) return undefined;

    let triggered = false;
    let cleanUp = () => {};

    const show = (reason) => {
      if (triggered || document.visibilityState === "hidden") return;
      if (hasSessionFlag(COOKIE_SEEN, STORAGE_SEEN)) return;
      if (hasSessionFlag(COOKIE_NAV_SCAN, STORAGE_NAV_SCAN)) return;
      triggered = true;
      setVisible(true);
      emit("shown", { reason });
      cleanUp();
    };

    const hasPassedHalfway = () => {
      const total = document.documentElement.scrollHeight;
      const viewport = window.innerHeight;
      if (total <= viewport) return false;
      return window.scrollY + viewport >= total * 0.5;
    };

    const onScroll = () => {
      if (hasPassedHalfway()) show("scroll-50-percent");
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") onScroll();
    };

    const onNavScanClick = (event) => {
      if (!isElement(event.target)) return;
      const link = event.target.closest("[data-odo-free-scan]");
      if (link) markOdoFreeScanClicked();
    };

    const onCustomNavScan = () => markOdoFreeScanClicked();
    const timer = window.setTimeout(() => show("dwell-30-seconds"), 30000);

    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);
    document.addEventListener("click", onNavScanClick, true);
    document.addEventListener("odo:free-scan-click", onCustomNavScan);

    cleanUp = () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      document.removeEventListener("click", onNavScanClick, true);
      document.removeEventListener("odo:free-scan-click", onCustomNavScan);
    };

    return cleanUp;
  }, [emit]);

  useEffect(() => {
    if (!visible) return undefined;

    previousFocusRef.current = document.activeElement;
    closeButtonRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        markSeen();
        emit("dismissed", { method: "escape" });
        setVisible(false);
        return;
      }

      if (event.key !== "Tab") return;
      const focusables = [
        closeButtonRef.current,
        ctaRef.current,
        learnRef.current,
        noThanksRef.current,
      ].filter(Boolean);
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocusRef.current?.focus?.();
    };
  }, [emit, visible]);

  const dismiss = (method) => {
    markSeen();
    emit("dismissed", { method });
    setVisible(false);
  };

  const startScan = () => {
    markSeen();
    emit("start-scan");
    // The anchor below is the only CTA destination: /scan.
  };

  if (!visible) return null;

  return (
    <div className="odo-popup__backdrop" role="presentation">
      <div
        className="odo-popup"
        role="dialog"
        aria-modal="true"
        aria-labelledby="odo-popup-title"
        aria-describedby="odo-popup-description"
        onClick={(event) => {
          if (event.target === event.currentTarget) dismiss("backdrop");
        }}
      >
        <div className="odo-popup__card">
          <button
            ref={closeButtonRef}
            className="odo-popup__close"
            type="button"
            aria-label="Close ODO discovery"
            onClick={() => dismiss("close-button")}
          >
            <span aria-hidden="true">×</span>
          </button>

          <div className="odo-popup__accent" aria-hidden="true" />
          <p className="odo-popup__eyebrow">ODO  /  BUSINESS DISCOVERY</p>

          <h2 id="odo-popup-title" className="odo-popup__title">
            Not sure what your business needs? Let ODO map the right path.
          </h2>

          <p id="odo-popup-description" className="odo-popup__description">
            ODO researches your public business information, asks only the
            questions that matter, and delivers a personalized report within
            24 hours, free, with no sales call or commitment.
          </p>

          <div className="odo-popup__benefits" aria-label="ODO benefits">
            <span>5-minute scan</span>
            <span>Personalized report</span>
            <span>No commitment</span>
          </div>

          <a
            ref={ctaRef}
            className="odo-popup__primary"
            href="/scan"
            onClick={startScan}
          >
            Start my free scan
          </a>

          <div className="odo-popup__actions">
            <button
              ref={learnRef}
              className="odo-popup__learn"
              type="button"
              aria-expanded={showHowItWorks}
              aria-controls="odo-how-it-works"
              onClick={() => {
                const next = !showHowItWorks;
                setShowHowItWorks(next);
                emit(next ? "learn-opened" : "learn-closed");
              }}
            >
              <span>{showHowItWorks ? "Hide how it works" : "Learn how it works"}</span>
              <span aria-hidden="true" className="odo-popup__learn-arrow">
                {showHowItWorks ? "↑" : "→"}
              </span>
            </button>

            <button
              ref={noThanksRef}
              className="odo-popup__no-thanks"
              type="button"
              onClick={() => dismiss("no-thanks")}
            >
              No thanks
            </button>
          </div>

          {showHowItWorks && (
            <section
              id="odo-how-it-works"
              className="odo-popup__how-it-works"
              aria-label="How ODO works"
            >
              <div className="odo-popup__how-header">
                <p className="odo-popup__how-kicker">HOW ODO WORKS</p>
                <p className="odo-popup__how-note">
                  Simple, evidence-led, and designed to save your time.
                </p>
              </div>

              <ol className="odo-popup__steps">
                {HOW_IT_WORKS.map((step) => (
                  <li key={step.number} className="odo-popup__step">
                    <span className="odo-popup__step-number">{step.number}</span>
                    <span>
                      <strong>{step.title}</strong>
                      <span>{step.body}</span>
                    </span>
                  </li>
                ))}
              </ol>

              <p className="odo-popup__privacy-note">
                ODO does not request passwords or private credentials. A final
                human review checks the report before delivery.
              </p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
