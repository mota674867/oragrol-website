import { forwardRef, useId } from "react";
import type { InputHTMLAttributes } from "react";
import { cn } from "../cn";

export interface RadioProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "type"> {
  label?: string;
  error?: string;
  id?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  function Radio({ label, error, className, id: idProp, ...props }, ref) {
    const generatedId = useId();
    const id = idProp ?? generatedId;

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={id} className="inline-flex cursor-pointer items-center gap-2.5">
          <span className="relative inline-flex h-5 w-5 shrink-0 items-center justify-center">
            <input
              ref={ref}
              id={id}
              type="radio"
              className={cn(
                "peer h-5 w-5 shrink-0 appearance-none rounded-full border bg-surface transition-colors duration-150",
                "checked:border-accent",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                "disabled:cursor-not-allowed disabled:opacity-50",
                error ? "border-risk-critical" : "border-border",
                className,
              )}
              {...props}
            />
            <span className="pointer-events-none absolute h-2.5 w-2.5 scale-0 rounded-full bg-accent transition-transform duration-150 peer-checked:scale-100" />
          </span>
          {label && <span className="font-body text-sm text-text-primary">{label}</span>}
        </label>
        {error && <p className="font-body text-xs text-risk-critical">{error}</p>}
      </div>
    );
  },
);
