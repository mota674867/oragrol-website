# Claude Code Project Rules — Oragrol Website

## 1. Purpose
Keep Claude Code's memory reliable across sessions, minimize token/API burn, and never lose a prior decision. This file is static (rules). `PROJECT_MEMORY.md` is the rolling session log. `DECISIONS.md` is the permanent record of "why we chose X."

---

## 2. Before Starting Any Work
1. Read this file (`CLAUDE.md`).
2. Read only the **last 3–5 entries** of `PROJECT_MEMORY.md` — not the whole file. If more history is needed, check `PROJECT_MEMORY_ARCHIVE.md`.
3. Run `git status` and `git log --oneline -10`.
4. Inspect only the specific files relevant to the task — don't scan the repo.

Never assume something is missing just because it's not mentioned in the current chat. Check the memory files first.

---

## 3. Editing Philosophy (Token Control)
- Prefer targeted edits (diffs/patches) over rewriting whole files.
- Never regenerate a full file to change a few lines.
- Don't re-read a file you already have open in context unless it changed.
- Don't re-run the same search/analysis twice in a session.
- Batch related file reads instead of one-by-one round trips.
- If a task looks like it needs >15–20 tool calls, stop and outline a plan before continuing.

---

## 4. Context Checkpoints
If a session has been running long (many file edits, long back-and-forth):
- Proactively say: "This session is getting long — want me to summarize progress into PROJECT_MEMORY.md and start fresh?"
- Do this **before** context gets so full that quality drops, not after.

---

## 5. Never Forget Existing Decisions
Before changing an existing feature or pattern:
- Check `DECISIONS.md` first — if a decision is logged there, it was made on purpose. Don't silently redesign it.
- Check `PROJECT_MEMORY.md` for recent related work.
- If you still think a past decision is wrong, say so explicitly and ask — don't just change it.

---

## 6. Git Workflow
```bash
git status                          # before starting
git add .
git commit -m "Clear, specific description"   # after each logical unit of work
```
- Commit messages ARE part of memory — write them like you're leaving a note for the next session, not just "update files."
- Do not push to GitHub unless explicitly told to.
- Never force-push, delete branches, or overwrite history without explicit confirmation.

---

## 7. Verification Before Marking Anything Done
Run the actual project commands:
- Typecheck: `npx tsc --noEmit` (no dedicated `typecheck` script in package.json)
- Build: `npm run build`
- Lint: `npm run lint`
- Dev preview: `npm run dev` (port 3000)
- Check: no console errors, responsive layout intact, existing pages/routes still work.
- No `chromium-cli` in this environment — visual/responsive checks use Playwright directly: `require('playwright-core')` from `node_modules` (the `playwright` package isn't installed, only `@playwright/test`'s `playwright-core` dependency), scripted from outside the repo (e.g. the scratchpad), pointed at the running dev server.

---

## 8. Honesty Rule
Never claim something is done unless it's implemented AND verified. If uncertain, mark it:
- `TODO`
- `NEEDS VERIFICATION`

Never invent: pricing, copy claims about Oragrol, integrations, credentials, features, or business facts. If it's not confirmed, flag it instead of guessing (this matters — client-facing site copy carries real liability/accuracy risk for an MSSP).

---

## 9. Credentials & Secrets
Never write API keys, tokens, passwords, or secrets into `CLAUDE.md`, `PROJECT_MEMORY.md`, `DECISIONS.md`, commit messages, or source files. Use environment variables / `.env` (gitignored).

---

## 10. Memory File Rotation
`PROJECT_MEMORY.md` is capped at roughly the **last 10 sessions**. When it exceeds that:
1. Move older entries into `PROJECT_MEMORY_ARCHIVE.md` (append, don't overwrite).
2. Keep `PROJECT_MEMORY.md` lean — current + recent only.
Do this as part of Session Completion (Section 11), not mid-task.

---

## 11. Session Completion Checklist
At the end of every meaningful session:
1. Verify the work (Section 7).
2. Update `PROJECT_MEMORY.md` (new entry, rotate old ones if over cap).
3. Log any durable architectural/design choice in `DECISIONS.md` (not in PROJECT_MEMORY).
4. `git status` → commit if clean logical unit of work exists.
5. Report clearly: what was completed, files changed, verification performed, what's still open, recommended next step.

---

## 12. Codebase Architecture Reference

**Stack:** Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS v4, `motion` (Framer Motion), `next/font` (Google Fonts), Resend (contact-form email), react-hook-form + zod. `next-intl` is an installed dependency but is **not wired into the app** — the header's "EN | FR" is static text, not real i18n routing; don't assume locale routing exists. `tests/example.spec.ts` is the untouched Playwright scaffold, not a real suite, and there's no `npm test` script — actual visual/responsive verification is done ad hoc via `playwright-core` scripted from outside the repo against a running dev server (Section 7 above), not `npx playwright test`.

**Routes** (`app/`, one `page.tsx` per route): Home, Services (+ `[code]` detail pages), Solutions, Cyber Health, Industries, Company, How We Work, Contact, Business Automation (+ `[code]`), Resources (+ `[slug]`), Style Guide. `app/api/contact/route.ts` is the only API route.

**Design token system** (`app/styles/tokens.css`) — read this before touching any color, spacing, or typeface:
1. Raw palette (`--palette-*`) — the 6 approved brand colors, verbatim hex. Never referenced directly by components.
2. Semantic layer (`--background`, `--text-primary`, `--accent`, etc.) — what components actually use, via Tailwind utilities (`bg-background`, `text-accent`, ...).
3. Environment overrides — `.env-dark` / `.env-deep-blue` / `.env-light` classes repoint the semantic layer. Every page section opts into one via `<Section environment="...">` (`app/components/ui/section.tsx`); a component written against semantic tokens works correctly in any environment without knowing which one wraps it.
4. `@theme inline` exposes the semantic layer as Tailwind utilities.

Fonts follow the same indirection: `font-heading`/`font-body`/`font-data`/`font-brand` Tailwind classes → CSS vars set by the `next/font` calls in `app/layout.tsx` → real typefaces. Swap a typeface by editing the import there; no component references a font name directly.

**`Section` + `Container`** (`app/components/ui/`): nearly every page section is a `<Section>` (environment + optional `transitionFrom`/`transitionTo` atmospheric gradient blend into the adjacent section's environment) wrapping a `<Container size="...">`. Container widths (`CONTAINER_MAX_WIDTH` in `container.tsx`) are `clamp()`-based, not flat breakpoints — each size holds at a floor, ramps with viewport width, then caps at a ceiling, so wide monitors get neither a column frozen at laptop width nor text stretched edge-to-edge. Other components needing the same width (e.g. `nav.tsx`) import `CONTAINER_MAX_WIDTH` directly rather than re-hardcoding a value.

**Component layout** (`app/components/`):
- `ui/` — generic, environment-agnostic primitives (Button, Card, Typography, Section, Container, Nav, form fields). Reference semantic tokens only, never raw hex.
- `site/` — global chrome rendered on every page from `app/layout.tsx` (SiteHeader, SiteFooter, nav dropdowns, search overlay, emergency-CTA pill).
- `sections/<page>/` — one folder per top-level route holding that page's own section components (e.g. `sections/services/hero.tsx`). Content-heavy pages keep a co-located `*-data.ts` module in the same folder (e.g. `services-data.ts`, `articles-data.ts`) that either wraps a JSON file from `app/data/` (Services/Solutions/Business Automation) or holds content as TS literals directly (Resources articles) — imported by both `page.tsx` and the section components, so content exists in exactly one place, never duplicated between the list view and the detail view.
- `brand/` — the two canonical brand-mark components (`OragrolLogo`, `OragrolRing`). Both inline the *exact* geometry from `Oragrol_Logo_Final.svg` (same circle cx/cy/r/stroke-dasharray, same text x/y/font-size) rather than approximating the mark with hand-tuned CSS — a past regression (a hand-recreated footer logo drifting from the header's) made this the deliberate, enforced pattern. Always import one of these two components; never redraw the mark by eye.
- `motion/` — shared animation primitives (`Reveal`, the scroll-triggered fade/slide-in wrapper used throughout).

**Dynamic routes are data-driven, not authored per page:** `[code]`/`[slug]` routes call `generateStaticParams` off the same data-accessor module the corresponding static list page uses, so a service/article's canonical content lives in exactly one place. `services/[code]` specifically guards against a Business Automation slug leaking into the wrong route (Business Automation detail pages moved to their own `business-automation/[code]` route, split out from Services) since this app isn't configured for `dynamicParams: false` — an unlisted param still reaches the page function and must explicitly `notFound()`.

**Next.js version note:** `AGENTS.md` is auto-generated/re-added by `next dev` (don't strip it from a diff — that only recreates the change) and flags that this Next.js version's APIs/conventions may differ from training data. Check `node_modules/next/dist/docs/` for the installed version's actual behavior before assuming a convention from general Next.js knowledge.
