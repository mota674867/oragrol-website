# Outbound engine (ODO outbound, sending OFF)

Finds, every night, 70 businesses with a named owner or manager email the business published on its own site, writes 4 emails for each, and holds a batch of 60 for Mohammad's approval. **It never sends.** Decision record: D-137 (and D-136 for the Lead Finder rule).

## How a night runs
1. Take the next area x sector from the search plan (GTA first, then Ontario, then the rest of Canada). A finished combination rests 90 days.
2. Ask Geoapify for one page of businesses.
3. For each business, free checks first: has its own website, not seen in 90 days (domain, name + postcode), not on the do-not-contact list, robots.txt allows us.
4. Read up to 5 pages (pause between pages). Haiku picks the owner or manager from the addresses the code found; code proves the name is on the site (Lead Finder, `app/lib/lead-finder/`).
5. Valid lead: free SPF/DMARC check, Sonnet writes day 0, 3, 8 and 15 emails, code checks them. Quebec leads are held.
6. Stop at 70 valid, 400 websites, CAD 25 that day, or the monthly cap. Then build the batch: the 60 oldest ready leads (yesterday's spares first).

Every business that is not a lead is recorded with a reason; those with a published main phone go on the phone list.

## Run it locally (the pilot)
Needs internet, `ANTHROPIC_API_KEY` and `GEOAPIFY_API_KEY` in `.env.local` (never paste keys in chat).

```bash
npx tsx --env-file=.env.local scripts/outbound-run.ts --max-scan 50 --max-cost-cad 10 --write-limit 10
```
Options: `--areas toronto,mississauga`, `--sectors law,accounting`, `--no-write` (no Sonnet), `--fresh`, `--out`. Results (private contact data) go to the git-ignored `outbound-local/` folder: leads CSV, rejects CSV, emails JSON, report JSON.

## Production switches (all off by default)
| Setting | Effect |
|---|---|
| `OUTBOUND_ENGINE_ENABLED=1` | `/api/outbound/cron` runs a slice (also needs `CRON_SECRET`) |
| `OUTBOUND_HUBSPOT_WRITE=1` | each lead is written to HubSpot (contact + note) |
| `OUTBOUND_API_SECRET` | lets the staff dashboard read `/api/outbound/report` |

The cron route is **not** in `vercel.json` yet. It must be called repeatedly (about every few minutes from 2 AM Toronto) until the day's run reports `done`; QStash or a Vercel cron will be chosen when the engine is switched on.

## Tests
```bash
npx tsx scripts/test-outbound-engine.ts   # 27 offline checks
npx tsx scripts/test-lead-finder.ts       # 31 offline checks
```

## NEEDS VERIFICATION (first live run)
Geoapify category names and response fields; Haiku `claude-haiku-5-5` and Sonnet `claude-sonnet-5-5` model ids and real cost; real yield per sector; HubSpot write against the live portal; RedisStore against Upstash; `npm run build` on a Vercel preview.

## Not built yet
Staff Outbound page and approval through the existing gate; sending (domains, mailboxes, warm-up, Smartlead or similar); reply, out-of-office and unsubscribe handling; address check before sending; proof screenshots (a page hash is stored); both owner and manager on one lead.
