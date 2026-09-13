"use client";

import { useEffect, useId, useRef } from "react";

/**
 * DetailsDialog — the ⓘ Details control and its content panel, per
 * ORAGROL_Details_Claude_Complete.md (13 Sept 2026 handoff).
 *
 * Built on the native <dialog> element with showModal(), not a
 * hand-rolled overlay. This is a deliberate change from an earlier,
 * failed attempt at this same feature: <dialog> opened via
 * showModal() renders in the browser's own top layer, a rendering
 * layer that sits above the entire document by construction — no
 * ancestor's position/z-index/overflow/transform can trap or clip it,
 * which is exactly the class of bug (a page's own CSS creating a
 * nested stacking context) that broke the previous version. Focus
 * trapping, Escape-to-close, and the backdrop are native browser
 * behavior, not reimplemented here.
 *
 * Colors are inline styles, not Tailwind color utility classes — an
 * earlier version of this feature found utility classes losing
 * specificity fights against some pages' own older CSS. Layout/
 * spacing Tailwind classes are fine; only color/font properties are
 * inherited/cascading values at risk of that specific problem.
 *
 * Contrast, computed with the real WCAG relative-luminance formula,
 * not estimated:
 * - Charcoal (#141717) on Ivory (#f4f1e9): 15.97:1
 * - accent-on-light (#a43e1d) on Ivory: 5.66:1 — used for orange TEXT,
 *   since pure Burnt Orange text only reaches 3.55:1, below the 4.5:1
 *   minimum for normal-size text (it does clear the 3:1 minimum for
 *   large text and icon/control boundaries, so pure Burnt Orange is
 *   used only for the icon outline and the CTA button's background).
 * - Charcoal on Burnt Orange (#db5227) button background: 4.51:1 —
 *   passes; white on the same background only reaches 4.0:1 and fails,
 *   confirming the handoff's own instruction to prefer charcoal.
 */

const IVORY = "#f4f1e9";
const CHARCOAL = "#141717";
const BURNT_ORANGE = "#db5227";
const ACCENT_ON_LIGHT = "#a43e1d";
const INSET_TINT = "#e9e1d3";
const HAIRLINE = "#d8d0bd";

export type DetailsAction = {
  label: string;
  onClick: () => void | Promise<void>;
  disabled?: boolean;
};

export function DetailsDialog({
  category,
  itemLabel,
  title,
  subtitle,
  intro,
  inclusions,
  controlHeading = "You stay in control",
  control,
  whoItSuits,
  example,
  scope,
  action,
}: {
  category: string;
  itemLabel: string;
  title: string;
  subtitle: string;
  intro: string;
  inclusions: string[];
  controlHeading?: string;
  control: string;
  whoItSuits: string;
  example?: string;
  scope?: string;
  action?: DetailsAction;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const reactId = useId();
  const headingId = `details-heading-${reactId}`;
  const tooltipId = `details-tooltip-${reactId}`;

  const open = () => {
    // Single dialog open at a time: close any other open DetailsDialog
    // before opening this one.
    document.querySelectorAll<HTMLDialogElement>("dialog[data-details-dialog]").forEach((d) => {
      if (d !== dialogRef.current && d.open) d.close();
    });
    dialogRef.current?.showModal();
  };

  useEffect(() => {
    const dialogEl = dialogRef.current;
    if (!dialogEl) return;
    const onClose = () => {
      // Native <dialog> already returns focus to whatever had it
      // before showModal() in most browsers, but explicitly returning
      // it to the trigger is more reliable across implementations and
      // matches the handoff's explicit requirement.
      triggerRef.current?.focus();
    };
    dialogEl.addEventListener("close", onClose);
    return () => dialogEl.removeEventListener("close", onClose);
  }, []);

  return (
    <>
      <span style={{ position: "relative", display: "inline-flex" }}>
        <button
          ref={triggerRef}
          type="button"
          onClick={open}
          aria-label={`View details for ${title}`}
          aria-describedby={tooltipId}
          title="View what's included"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            minHeight: "44px",
            minWidth: "44px",
            padding: "4px 10px",
            marginTop: "4px",
            border: "none",
            background: "transparent",
            cursor: "pointer",
            color: ACCENT_ON_LIGHT,
            font: "inherit",
          }}
        >
          <span
            aria-hidden="true"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "16px",
              height: "16px",
              borderRadius: "9999px",
              border: `1.5px solid ${BURNT_ORANGE}`,
              fontSize: "11px",
              fontWeight: 700,
              lineHeight: 1,
              color: BURNT_ORANGE,
            }}
          >
            i
          </span>
          <span style={{ fontSize: "14px", fontWeight: 600 }}>Details</span>
        </button>
        {/* Screen-reader-only: the visible hover tooltip is the native
            title attribute above (the browser positions it itself,
            can never overlap page content — a hand-positioned custom
            tooltip broke twice in a row before this). This span makes
            the same text available to assistive tech on keyboard
            focus too, via aria-describedby, satisfying the
            hover-AND-focus requirement without repeating the same
            custom-positioning risk. */}
        <span
          id={tooltipId}
          style={{
            position: "absolute",
            width: "1px",
            height: "1px",
            padding: 0,
            margin: "-1px",
            overflow: "hidden",
            clipPath: "inset(50%)",
            whiteSpace: "nowrap",
            border: 0,
          }}
        >
          View what&apos;s included
        </span>
      </span>

      <dialog
        ref={dialogRef}
        data-details-dialog=""
        aria-labelledby={headingId}
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          margin: 0,
          padding: 0,
          border: "none",
          borderRadius: "16px",
          maxWidth: "min(1080px, calc(100vw - 32px))",
          width: "100%",
          maxHeight: "90dvh",
          backgroundColor: IVORY,
          color: CHARCOAL,
        }}
      >
        <div style={{ position: "relative", maxHeight: "90dvh", overflowY: "auto", padding: "40px 44px" }}>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label="Close"
            style={{
              position: "sticky",
              float: "right",
              top: 0,
              right: 0,
              marginLeft: "16px",
              minWidth: "44px",
              minHeight: "44px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              color: CHARCOAL,
              fontSize: "22px",
              lineHeight: 1,
            }}
          >
            ×
          </button>

          <p
            style={{
              margin: 0,
              fontSize: "13px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: ACCENT_ON_LIGHT,
            }}
          >
            {category} / {itemLabel}
          </p>
          <h2
            id={headingId}
            style={{
              margin: "8px 0 0",
              fontSize: "clamp(32px, 4vw, 56px)",
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              color: CHARCOAL,
            }}
          >
            {title}
          </h2>
          <p style={{ margin: "10px 0 0", fontSize: "22px", fontWeight: 700, color: CHARCOAL }}>{subtitle}</p>
          <p style={{ margin: "16px 0 0", fontSize: "16px", lineHeight: 1.6, color: CHARCOAL, maxWidth: "72ch" }}>
            {intro}
          </p>

          <hr style={{ margin: "28px 0", border: "none", borderTop: `1px solid ${HAIRLINE}` }} />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "32px",
            }}
            className="details-dialog-grid"
          >
            <div>
              <h3 style={{ margin: 0, fontSize: "20px", fontWeight: 800, color: CHARCOAL }}>What&apos;s included</h3>
              <ul style={{ margin: "14px 0 0", padding: 0, listStyle: "none" }}>
                {inclusions.map((item, i) => (
                  <li
                    key={i}
                    style={{
                      display: "flex",
                      gap: "10px",
                      alignItems: "baseline",
                      fontSize: "16px",
                      lineHeight: 1.55,
                      color: CHARCOAL,
                      marginTop: i === 0 ? 0 : "10px",
                    }}
                  >
                    <span aria-hidden="true" style={{ color: BURNT_ORANGE, fontSize: "18px", lineHeight: 1 }}>
                      •
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "20px", fontWeight: 800, color: CHARCOAL }}>{controlHeading}</h3>
              <p style={{ margin: "12px 0 0", fontSize: "16px", lineHeight: 1.6, color: CHARCOAL }}>{control}</p>

              <h3 style={{ margin: "24px 0 0", fontSize: "20px", fontWeight: 800, color: CHARCOAL }}>Who it suits</h3>
              <p style={{ margin: "12px 0 0", fontSize: "16px", lineHeight: 1.6, color: CHARCOAL }}>{whoItSuits}</p>

              {example && (
                <div
                  style={{
                    marginTop: "24px",
                    padding: "18px 20px",
                    borderRadius: "10px",
                    backgroundColor: INSET_TINT,
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontSize: "12px",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: ACCENT_ON_LIGHT,
                    }}
                  >
                    Illustrative example
                  </p>
                  <p style={{ margin: "8px 0 0", fontSize: "16px", lineHeight: 1.55, color: CHARCOAL }}>{example}</p>
                </div>
              )}
            </div>
          </div>

          {(scope || action) && (
            <>
              <hr style={{ margin: "28px 0 20px", border: "none", borderTop: `1px solid ${HAIRLINE}` }} />
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "16px",
                }}
              >
                {scope ? (
                  <p style={{ margin: 0, fontSize: "14px", color: "#5a5f57", maxWidth: "48ch" }}>{scope}</p>
                ) : (
                  <span />
                )}
                {action && (
                  <button
                    type="button"
                    onClick={action.onClick}
                    disabled={action.disabled}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      minHeight: "44px",
                      padding: "12px 22px",
                      border: "none",
                      borderRadius: "8px",
                      backgroundColor: action.disabled ? "#c9beaa" : BURNT_ORANGE,
                      color: CHARCOAL,
                      fontSize: "15px",
                      fontWeight: 700,
                      cursor: action.disabled ? "default" : "pointer",
                    }}
                  >
                    {action.label}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </dialog>

      <style>{`
        @media (min-width: 800px) {
          .details-dialog-grid {
            grid-template-columns: 55fr 45fr !important;
          }
        }
        dialog[data-details-dialog]::backdrop {
          background-color: rgba(10, 12, 18, 0.72);
        }
      `}</style>
    </>
  );
}
