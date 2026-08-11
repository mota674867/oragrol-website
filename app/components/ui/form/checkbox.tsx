import { forwardRef, useId } from "react";
import type { InputHTMLAttributes } from "react";
import { Check } from "lucide-react";
import { cn } from "../cn";

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "type"> {
  label?: string;
  error?: string;
  id?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox({ label, error, className, id: idProp, ...props }, ref) {
    const generatedId = useId();
    const id = idProp ?? generatedId;

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={id} className="inline-flex cursor-pointer items-center gap-2.5">
          <span className="relative inline-flex h-5 w-5 shrink-0 items-center justify-center">
            <input
              ref={ref}
              id={id}
              type="checkbox"
              aria-invalid={error ? true : undefined}
              className={cn(
                "peer h-5 w-5 shrink-0 appearance-none rounded-md border bg-surface transition-colors duration-150",
                "checked:border-accent checked:bg-accent",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                "disabled:cursor-not-allowed disabled:opacity-50",
                error ? "border-risk-critical" : "border-border",
                className,
              )}
              {...props}
            />
            <Check
              aria-hidden="true"
              strokeWidth={2.5}
              className="pointer-events-none absolute h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100"
            />
          </span>
          {label && <span className="font-body text-sm text-text-primary">{label}</span>}
        </label>
        {error && <p className="font-body text-xs text-risk-critical">{error}</p>}
      </div>
    );
  },
);
