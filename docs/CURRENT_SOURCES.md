# Current sources (read this first)

Where each truth lives in this repository. If a document disagrees with the code, the code wins.

| Question | Source |
|---|---|
| Colours, spacing, section environments | `app/styles/tokens.css` |
| Typefaces | `app/[locale]/layout.tsx` (`next/font`) |
| Live Services and Business Automation prices and text | `app/data/oragrol-services-data.json` and `.fr.json` |
| Resources articles | `app/components/sections/resources/articles-data.ts` |
| English and French strings | `messages/en.json`, `messages/fr.json` |
| Routes, redirects | `app/[locale]/`, `next.config.ts`, `app/sitemap.ts` |
| Bilingual routing | `i18n/`, `proxy.ts` |
| Why something was decided | `DECISIONS.md` (see the index at the top) |
| Lead capture design (eight sources) | `docs/LEAD_CAPTURE_PLAN.md` |
| What was done recently | `PROJECT_MEMORY.md` (last ~10 sessions) |
| Working rules for sessions | `CLAUDE.md`, `AGENTS.md` |

Not sources of truth: `PROJECT_MEMORY_ARCHIVE.md` and everything under `docs/archive/` (history only).

Known facts that old documents get wrong:
- There is no Solutions page and no How We Work page (both redirect).
- next-intl is wired: English unprefixed, French under `/fr`.
- Month-to-month prices from the old Solutions tiers were never live.
