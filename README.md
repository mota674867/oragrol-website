# Oragrol Global website (orgro.ca)

Marketing and lead-capture website for Oragrol Global, in English and French. Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, next-intl.

## Run it locally

```bash
npm install
cp .env.local.example .env.local   # then fill in the values; never commit real keys
npm run dev                        # http://localhost:3000
```

Other commands: `npm run build`, `npm run lint`, `npx tsc --noEmit`.

## Where things are

See [`docs/CURRENT_SOURCES.md`](docs/CURRENT_SOURCES.md) for where each truth lives (colours, prices, routes, decisions, lead capture). Working rules for Claude Code sessions are in `CLAUDE.md`.

## Deploys

`main` deploys to production on Vercel. Other branches get a preview build. Merge to `main` only after checking the preview.
