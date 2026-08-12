# Header Refinement — Pass 1

## Scope

Adjust ONLY the header/navigation. Do not touch the Hero, other Home sections, or any other page.

This is a refinement of an already-planned element — Section 6 of the locked brief already specifies a Search icon in the header; it was simply not yet implemented. This pass adds it along with general spacing/hierarchy cleanup.

## Changes

1. **Logo** — Use the complete ORAGROL GLOBAL logo on the left, slightly larger than its current size.
2. **Spacing** — More generous horizontal spacing between header elements overall. Fewer visual elements competing for attention.
3. **Search** — Add a search icon between the navigation links and the language/CTA group on the right.
   - This should be an icon only (no visible inline input box in the default header state).
   - Clicking it opens a search overlay/modal — not an inline expanding input in the header bar itself. Keep the header bar clean.
   - Style it as a clean outlined icon button, similar in restraint/cleanliness to Bell's search icon treatment — but see "Important" note below on styling.
4. **Language switcher** — Keep `EN | FR` simple, as currently implemented.
5. **CTA hierarchy** — "Get Your Cyber Health Score" should be the single strong filled/solid CTA in the header. If any other competing filled buttons exist in the header, reduce them to outline/ghost style so there is only one dominant call-to-action.
6. **Header height** — Slightly increase header height and improve vertical alignment/centering of all elements within it.
7. **Overall goal** — Keep the header visually quiet and clean so the Hero remains the dominant visual moment when the page loads.

## Important — Style Direction

Do NOT copy Bell's blue header or Bell's color palette. Keep Oragrol's existing black/dark cinematic style, brand colors, and typography exactly as locked. The reference to Bell is about the *level of cleanliness and restraint* in spacing and hierarchy — not about visually mimicking Bell's design. The goal is Bell-level cleanliness, not Bell cosplay.

## Technical Requirements

- After making spacing and sizing adjustments, verify nav link text still has sufficient color contrast against the dark background (per the accessibility requirements already locked in the brief).
- Maintain responsive behavior — confirm the header still works correctly on tablet and mobile widths after these changes (mobile menu trigger, etc.).
- Maintain keyboard navigability and focus states for the new search icon/overlay.

## Process

1. Implement the header changes.
2. Run typecheck, lint, and build to confirm everything is clean.
3. Take a screenshot of the updated header on desktop, and confirm mobile/tablet still work correctly.
4. Verify nav link contrast is still accessible.
5. Report back with a screenshot before committing.
