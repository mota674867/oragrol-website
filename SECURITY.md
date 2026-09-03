# ORAGROL Website — Security Hardening (Pre-Launch)

Status as of 2026-09-03. Tracks the 10-point pre-launch security pass.
Each item is marked **Done (code)**, **Ready — needs your action**, or
**Deferred** (with why). "Needs your action" items require account
access I don't have (GitHub org, Vercel, DNS, Resend) — they're not
something I can complete from here.

## 1. Cloudflare WAF, DDoS, bot protection — Ready, needs your action
Site currently deploys straight to Vercel with no CDN/WAF in front.
Two real options, pick one (don't stack both — redundant and slower):
- **Vercel Firewall** (Pro plan, no new vendor): rate limiting, bot
  protection, custom rules, built into the same dashboard you already
  deploy from.
- **Cloudflare in proxy mode** in front of Vercel: point DNS through
  Cloudflare (orange-cloud), free tier includes WAF + DDoS + bot
  fight mode.
Decide which, then either flip it on in the Vercel dashboard or move
DNS to Cloudflare — both are account actions, not code.

## 2. Secure headers, CSP, HTTPS, HSTS — Done (code)
`next.config.ts` `headers()`: CSP, `Strict-Transport-Security`
(2yr, includeSubDomains, preload), `X-Content-Type-Options: nosniff`,
`X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`.
HTTPS is enforced automatically by Vercel. CSP currently allows
`'unsafe-inline'` for script/style (Next.js hydration + inline
`style={{}}` usage across ported pages need it without a nonce
pipeline) — tightening to per-request nonces is a real follow-up, not
done in this pass.
**Once live:** submit https://oragrolglobal.com/ to
https://securityheaders.com and https://hstspreload.org to confirm
headers land as configured, and to actually get on the HSTS preload
list (a manual submission, not automatic).

## 3. MFA and restricted admin access — Ready, needs your action
Not something I can turn on remotely. Enable:
- **GitHub org** (mota674867): Settings → Password and authentication
  → require 2FA for all org members.
- **Vercel team**: Settings → Security → require 2FA.
- **Resend, domain registrar, DNS provider**: enable 2FA on each
  individually — these are usually the accounts attackers actually
  want (they can redirect the whole site/email).
- Restrict who has push access to `main` / deploy access to production.

## 4. Form, chat, API validation + rate limiting — Done (code), partial
`/api/contact` already had Zod validation + HTML-escaping (pre-existing).
Added in this pass: a per-IP rate limiter (`app/lib/rate-limit.ts`,
5 requests / 10 min). **Real limitation:** it's in-memory per serverless
instance, not shared across concurrent lambdas — a distributed attacker
can exceed the stated limit. Good enough as a stopgap; the real fix at
launch is Vercel Firewall rate limiting (item 1) or a shared store like
Upstash Redis (`@upstash/ratelimit`), which needs its own account.
No chat-widget backend or other API routes exist yet to secure.

## 5. Secrets management and dependency scanning — Done (code) + your action
- `.github/dependabot.yml` added: weekly npm + GitHub Actions update
  PRs, grouped by prod/dev. **Needs your action:** enable "Dependabot
  alerts" and "Dependabot security updates" in GitHub repo Settings →
  Code security — the config file alone doesn't turn them on.
- `.github/workflows/security-checks.yml` added: `npm audit
  --audit-level=high` + `tsc` + `lint` on every push/PR.
- Secrets already handled correctly: `RESEND_API_KEY` etc. only in
  `.env.local` (gitignored), never hardcoded — confirmed, no change
  needed. Set the same env vars in Vercel's dashboard (Encrypted),
  not in a committed file.
- `npm audit`: 0 vulnerabilities as of this pass.

## 6. Malware / file-upload protection — Deferred, not yet applicable
No file upload exists anywhere on the site today (Contact form is
text fields only, ScopeTray PDF generation is client-side from typed
data, not an upload). Nothing to harden yet — revisit if/when an
upload feature is actually built.

## 7. Centralized logging and security alerts — Deferred, needs real traffic first
No real backend/CRM/DB exists yet to generate meaningful security
events beyond Vercel's own request logs (already captured, viewable
in the Vercel dashboard) and the `console.error` calls already in
`/api/contact`. Wiring a real SIEM/alerting pipeline (e.g. a Vercel
log drain to a monitoring tool) is reasonable once there's live
customer data flowing — premature before then.

## 8. Encrypted backups and tested recovery — Deferred, needs a real data store first
No database exists yet — everything client-facing is either static
content or `localStorage` (ScopeTray). Nothing to back up. Revisit
when a real CRM/DB is added.

## 9. Vulnerability scanning and penetration testing — Ready, needs your action
`npm audit` (automated, in CI now) covers dependency-level scanning.
A real penetration test needs a third-party firm and a live production
URL with real traffic/data behind it — worth booking closer to launch,
not from an empty pre-launch site. As an MSSP, this is also a natural
fit to have done by a partner/peer firm rather than in-house, for an
unbiased result.

## 10. Privacy, cookie consent, Canadian data-handling review — Ready, needs your decision
No cookies/tracking are currently set anywhere in the ported pages
(no analytics script wired in yet) — so no consent banner is legally
required *today*. The moment analytics (GA4, etc.) or any tracking
cookie is added, a consent mechanism is required under PIPEDA. Privacy
policy page itself is still a `href="#"` placeholder across every
ported page (Company/Resources/Contact footers) — this is a content/
legal-review task, not something to draft without your (or legal
counsel's) input given it needs to accurately state what data is
actually collected.

---
**Bottom line — safe to do entirely in-code, done now:** 2, 4 (partial), 5.
**Needs an account action from you:** 1, 3, 5 (Dependabot toggle), 9.
**Genuinely premature until real data/traffic exists:** 6, 7, 8.
**Needs a decision, not just code:** 10.
