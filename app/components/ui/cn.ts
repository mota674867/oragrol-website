/**
 * Tiny class-name joiner — filters out falsy values and joins with a space.
 *
 * No clsx/tailwind-merge dependency: this component set only ever composes
 * non-conflicting utility groups (a fixed set of base classes + one variant
 * lookup), so plain concatenation is enough. It does NOT resolve conflicts
 * between two Tailwind classes for the same property (e.g. two different
 * `text-*` colors) — the later one in generated CSS wins, not the later one
 * in this list. Prefer a component's typed props (variant/tone/size) over
 * trying to override its color via `className` for that reason.
 */
export function cn(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}
