import type { ReactNode } from "react";

/**
 * Shared label / hint / error chrome for the stacked form controls
 * (TextInput, Textarea, Select). Checkbox and Radio use their own layout
 * since their label sits beside the control, not above it.
 */

export interface FieldChromeProps {
  id: string;
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}

export function FieldChrome({
  id,
  label,
  hint,
  error,
  required,
  children,
}: FieldChromeProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={id}
          className="font-body text-sm font-medium text-text-primary"
        >
          {label}
          {required && (
            <span className="ml-0.5 text-risk-critical" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="font-body text-xs text-text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="font-body text-xs text-risk-critical">
          {error}
        </p>
      )}
    </div>
  );
}

/** Builds the aria-describedby value for a field's hint/error text, if any. */
export function describedBy(id: string, hint?: string, error?: string) {
  const ids = [
    error ? `${id}-error` : null,
    hint && !error ? `${id}-hint` : null,
  ].filter((value): value is string => Boolean(value));
  return ids.length ? ids.join(" ") : undefined;
}
