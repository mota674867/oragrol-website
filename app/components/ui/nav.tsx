import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "./cn";
import { Icon } from "./icon-wrapper";

/**
 * Navigation primitives — Step 3 (shell only; final nav content is out of
 * scope for this step). NavLink lives in link.tsx and is reused here — see
 * that file for its underline/accent hover behavior.
 */

export interface NavBarProps {
  /** Logo / wordmark slot. */
  logo: ReactNode;
  /** Desktop nav links — hidden below `md`. */
  links?: ReactNode;
  /** Trailing actions (CTA button, mobile menu trigger, etc.). */
  actions?: ReactNode;
  className?: string;
}

export function NavBar({ logo, links, actions, className }: NavBarProps) {
  return (
    <header className={cn("w-full border-b border-border bg-background", className)}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 md:px-12">
        <div className="flex items-center">{logo}</div>
        {links && (
          <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
            {links}
          </nav>
        )}
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </header>
  );
}

export interface MobileMenuTriggerProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-expanded" | "aria-label" | "type"> {
  /** Whether the (out-of-scope) mobile menu this controls is open. */
  isOpen?: boolean;
}

/** Hamburger/close trigger only — the menu panel itself is out of scope. */
export function MobileMenuTrigger({
  isOpen = false,
  className,
  ...props
}: MobileMenuTriggerProps) {
  return (
    <button
      type="button"
      aria-label={isOpen ? "Close menu" : "Open menu"}
      aria-expanded={isOpen}
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-lg text-text-primary transition-colors duration-150 hover:bg-text-primary/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent md:hidden",
        className,
      )}
      {...props}
    >
      <Icon icon={isOpen ? X : Menu} size="md" />
    </button>
  );
}
