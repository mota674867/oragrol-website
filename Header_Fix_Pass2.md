# Header Fix — Pass 2

## Scope

Fix three specific issues with the header. Do not touch the Hero images, scroll sequence, or any other Home section.

## Issue 1: Layout breaks on large screens

On smaller/fit screens the header looks correct, but on large desktop monitors the header layout breaks (elements likely spread too far apart or misaligned). Diagnose the cause — most likely a missing or incorrect max-width constraint on the header's inner container — and fix it so the header looks correct and consistent across small laptop screens through large desktop monitors (test at common widths: ~1280px, ~1440px, ~1920px).

## Issue 2: Header background is a hard black bar

The current header sits on a solid black rectangle that looks disconnected from the Hero image behind it. Fix this:

- Remove the solid black background.
- Replace it with either full transparency, or a subtle dark gradient (e.g. fading from a soft dark tint at the very top down to fully transparent) so the header blends into the Hero image rather than sitting on top of a hard black bar.
- Ensure nav text, logo, and buttons remain fully readable/accessible against the Hero image with this change (add a subtle text-shadow or minimal scrim if needed for contrast, but keep it as light-touch as possible).

## Issue 3: Logo is not using the actual confirmed asset

The header logo is currently hand-coded/recreated rather than using the actual confirmed logo file. Fix this:

- The confirmed logo file is `Oragrol_Logo_Final.svg`. Locate it in the project (check `public/brand/`, project root, and any other location it may have been placed — search if needed).
- Replace the current hand-coded header logo implementation with a direct import/use of this actual SVG file (e.g. via `next/image` or as an inline SVG import, whichever fits the existing codebase pattern).
- Do not recreate, redraw, or approximate the logo in code — use the real file directly.
- Confirm it renders at the correct size and color in the header, consistent with the "logo slightly larger" adjustment from the previous header pass.

## Process

1. First locate the actual `Oragrol_Logo_Final.svg` file in the project and confirm you're using the real file, not a recreation.
2. Fix the large-screen layout issue.
3. Fix the header background transparency/gradient.
4. Run typecheck, lint, and build to confirm everything is clean.
5. Take screenshots at a few screen widths (small laptop, standard desktop, large desktop) to confirm the layout holds up.
6. Confirm nav/logo/button contrast is still accessible against the Hero image.
7. Report back with screenshots before committing.
