import { forwardRef, useId } from "react";
import type { SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../cn";
import { FieldChrome, describedBy } from "./field";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "id"> {
  label?: string;
  hint?: string;
  error?: string;
  id?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select(
    {
      label,
      hint,
      error,
      required,
      className,
      id: idProp,
      options,
      placeholder,
      defaultValue,
      ...props
    },
    ref,
  ) {
    const generatedId = useId();
    const id = idProp ?? generatedId;

    return (
      <FieldChrome id={id} label={label} hint={hint} error={error} required={required}>
        <div className="relative">
          <select
            ref={ref}
            id={id}
            required={required}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy(id, hint, error)}
            defaultValue={defaultValue ?? (placeholder ? "" : undefined)}
            className={cn(
              "h-11 w-full appearance-none rounded-lg border bg-surface px-3.5 pr-10 font-body text-sm text-text-primary transition-colors duration-150",
              "focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-accent",
              "disabled:cursor-not-allowed disabled:opacity-50",
              error ? "border-risk-critical" : "border-border focus:border-accent",
              className,
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown
            aria-hidden="true"
            strokeWidth={1.75}
            className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary"
          />
        </div>
      </FieldChrome>
    );
  },
);
