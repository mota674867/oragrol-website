# Lead Finder pilot

Finds, for a list of businesses, the owner or manager email each business **published on its own website**, and proves it. Sends nothing. No HubSpot, no mailbox, no change to ODO or the dashboard. See D-136.

## Rule: the AI picks, code proves
1. Code reads the home page and up to 4 same-site pages (team, about, contact) and collects every email (mailto links, visible text, `[at]`/`[dot]`, Cloudflare-protected).
2. Code rejects before any AI call: unreadable site, no email, only generic mailboxes (info@, sales@...), or a "no solicitation" notice.
3. The cheap model (Haiku) sees a numbered list of the remaining addresses and answers with a number, a name and a title. It cannot write an address.
4. Code checks the full name is written on the site. Grade **A** = name and email on the same page, **B** = name on another page, **C** = reject (reason code in the results).

## Run (needs internet and an Anthropic key in the environment; the key is never printed or saved)
```
npx tsx --env-file=.env.local scripts/lead-finder-pilot.ts businesses.csv
```
`businesses.csv` has a header row `name,website`. Options: `--max-cost-usd 7`, `--target-valid 70`, `--max-scan 400`, `--concurrency 3`, `--no-ai` (free dry run), `--out pilot-results`.

Results (CSV and JSON) go to `pilot-results/`, which is git-ignored because it holds business contact details. Review, then delete.

## Test (no network, no key, no cost)
```
npx tsx scripts/test-lead-finder.ts
```

## Not verified yet
Live page fetching, the Haiku model id (`claude-haiku-5-5`), its reply shape and real token cost, and the real share of businesses that give a valid lead. robots.txt handling is undecided.
