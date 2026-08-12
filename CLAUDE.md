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
