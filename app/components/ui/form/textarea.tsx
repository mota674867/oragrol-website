import { forwardRef, useId } from "react";
import type { TextareaHTMLAttributes } from "react";
import { cn } from "../cn";
import { FieldChrome, describedBy } from "./field";

export interface TextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id"> {
  label?: string;
  hint?: string;
  error?: string;
  id?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    { label, hint, error, required, rows = 4, className, id: idProp, ...props },
    ref,
  ) {
    const generatedId = useId();
    const id = idProp ?? generatedId;

    return (
      <FieldChrome id={id} label={label} hint={hint} error={error} required={required}>
        <textarea
          ref={ref}
          id={id}
          rows={rows}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, hint, error)}
          className={cn(
            "resize-y rounded-lg border bg-surface px-3.5 py-2.5 font-body text-sm text-text-primary transition-colors duration-150 placeholder:text-text-muted",
            "focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-accent",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error ? "border-risk-critical" : "border-border focus:border-accent",
            className,
          )}
          {...props}
        />
      </FieldChrome>
    );
  },
);
