import { forwardRef, useId } from "react";
import type { InputHTMLAttributes } from "react";
import { cn } from "../cn";
import { FieldChrome, describedBy } from "./field";

export interface TextInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "id"> {
  label?: string;
  hint?: string;
  error?: string;
  id?: string;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  function TextInput(
    { label, hint, error, required, className, id: idProp, ...props },
    ref,
  ) {
    const generatedId = useId();
    const id = idProp ?? generatedId;

    return (
      <FieldChrome id={id} label={label} hint={hint} error={error} required={required}>
        <input
          ref={ref}
          id={id}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, hint, error)}
          className={cn(
            "h-11 rounded-lg border bg-surface px-3.5 font-body text-sm text-text-primary transition-colors duration-150 placeholder:text-text-muted",
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
