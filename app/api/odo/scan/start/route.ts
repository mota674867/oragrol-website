// POST /api/odo/scan/start
// Entry point for every ODO scan. Validates intake, checks cooldowns,
// creates HubSpot contact, initializes Redis session, kicks off research.
// Returns session_id to the front-end immediately — research runs async.

import { after, NextRequest, NextResponse } from "next/server";
import { checkCooldowns, createSession, getIncompleteSession, checkIpDailyLimit } from "@/app/lib/odo-redis";
import { runParallelResearch, type ResearchFindings } from "@/app/lib/odo-research";
import { interviewContext } from "@/app/lib/odo-pipeline";
import { openInterview } from "@/app/lib/odo-interviewer";
import { AI_UNAVAILABLE_MESSAGE } from "@/app/lib/odo-playbook";
import { getClientIp, rateLimit } from "@/app/lib/rate-limit";
import { EMPTY_USAGE, addClaudeUsage } from "@/app/lib/odo-cost";
import { checkDailySpendGate } from "@/app/lib/odo-spend";
import {
  verifyTurnstile,
  checkWebsiteValidity,
  checkIsRealBusiness,
  isDisposableEmail,
  emailDomainMatchesWebsite,
  isFreeEmailDomain,
} from "@/app/lib/odo-gate";

// Per-IP daily cap on scan STARTS (not attempts) — a real, shared, Redis-
// backed ceiling. The existing hourly in-memory limiter below still runs
// first as a cheap first filter; this is the one that actually matters
// against a distributed/determined source.
const IP_DAILY_SCAN_LIMIT = 3;

const HUBSPOT_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;

// --- HubSpot helpers ---

async function createHubSpotContact(data: {
  name: string; email: string; company: string; website: string | null;
}): Promise<string | null> {
  if (!HUBSPOT_TOKEN) return null;
  try {
    const [firstName, ...rest] = data.name.trim().split(" ");
    const lastName = rest.join(" ") || "";
    const res = await fetch("https://api.hubapi.com/crm/v3/objects/contacts", {
      method: "POST",
      headers: { Authorization: `Bearer ${HUBSPOT_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        properties: {
          firstname: firstName,
          lastname: lastName,
          email: data.email,
          company: data.company,
          website: data.website || "",
          lead_source: "ODO Scan",
          lead_category: "Inbound",
          hs_lead_status: "NEW",
        },
      }),
    });
    if (!res.ok) {
      // Contact may already exist — try to find it
      if (res.status === 409) {
        const findRes = await fetch(
          `https://api.hubapi.com/crm/v3/objects/contacts/${encodeURIComponent(data.email)}?idProperty=email`,
          { headers: { Authorization: `Bearer ${HUBSPOT_TOKEN}` } }
        );
        if (findRes.ok) {
          const found = await findRes.json() as { id: string };
          return found.id;
        }
      }
      return null;
    }
    const created = await res.json() as { id: string };
    return created.id;
  } catch {
    return null;
  }
}

async function addHubSpotNote(contactId: string, note: string): Promise<void> {
  if (!HUBSPOT_TOKEN || !contactId) return;
  try {
    const engRes = await fetch("https://api.hubapi.com/crm/v3/objects/notes", {
      method: "POST",
      headers: { Authorization: `Bearer ${HUBSPOT_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        properties: { hs_note_body: note, hs_timestamp: Date.now().toString() },
      }),
    });
    if (!engRes.ok) return;
    const eng = await engRes.json() as { id: string };
    // Associate note with contact
    await fetch(`https://api.hubapi.com/crm/v3/objects/notes/${eng.id}/associations/contact/${contactId}/note_to_contact`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${HUBSPOT_TOKEN}` },
    });
  } catch { /* best effort */ }
}

// --- Main handler ---

export async function POST(req: NextRequest): Promise<NextResponse> {
  // IP-based rate limit — max 15 scan starts per hour per IP. Was 3, which
  // blocked a single legitimate visitor retrying after a validation error
  // (and made internal testing painful). 15 still stops any real abuse.
  const ip = getClientIp(req);
  const limited = rateLimit(`odo:start:${ip}`, { limit: 15, windowMs: 60 * 60 * 1000 });
  if (!limited.ok) {
    return NextResponse.json(
      { code: "rate_limited", message: "Too many requests. Please wait before starting a new scan." },
      { status: 429 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ code: "invalid_json", message: "Invalid request body." }, { status: 400 });
  }

  // FIXED 2026-09-29 — the live scan form (odo-scan.tsx) has always sent
  // { lead: { name, email, company, website }, consent: { accepted, ... } },
  // but this route only ever read flat body.name/body.email/body.consent
  // (=== true). Every real submission failed validation with "Name, email,
  // and company are required" before this line existed — discovered via a
  // live test scan, not a code review. Flat fields are kept as a fallback
  // so nothing else calling this route with the old shape breaks.
  const lead = (body.lead && typeof body.lead === "object" ? body.lead : body) as Record<string, unknown>;
  const name = String(lead.name || body.name || "").trim();
  const email = String(lead.email || body.email || "").trim().toLowerCase();
  const company = String(lead.company || body.company || "").trim();
  const rawWebsite = lead.website ?? body.website;
  const website = rawWebsite ? String(rawWebsite).trim() : null;
  const consentField = body.consent;
  const consent =
    consentField === true ||
    (typeof consentField === "object" && consentField !== null && (consentField as Record<string, unknown>).accepted === true);
  const hasWebsite = body.has_website !== false && !!website;

  // Validate required fields
  if (!name || !email || !company) {
    return NextResponse.json({ code: "validation_error", message: "Name, email, and company are required." }, { status: 400 });
  }
  // CodeQL #15 (polynomial regex on uncontrolled data) — this is an
  // unauthenticated public API, so nothing stopped a raw POST (bypassing any
  // client-side maxlength) from sending a many-thousand-character "email" to
  // make the three-quantifier pattern below do real backtracking work. RFC
  // 5321 caps a real email address at 320 characters, so rejecting anything
  // longer first removes the attack surface regardless of the regex itself.
  if (email.length > 320 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ code: "validation_error", message: "Please enter a valid email address." }, { status: 400 });
  }
  if (!consent) {
    return NextResponse.json({ code: "consent_required", message: "You must accept the consent notice to proceed." }, { status: 400 });
  }

  // --- Entry gate (odo-gate.ts, odo-spend.ts) ---
  // ADDED 2026-10-01 — every check below runs BEFORE any paid AI call, per
  // Mohammad's explicit requirement after approving the ODO brain rebuild:
  // at ~$2/scan, only a real visitor should ever reach the point where that
  // money gets spent. See odo-gate.ts's header for the full design and the
  // one piece (free-email OTP) deliberately not built in this pass.

  // 1. Daily global spend ceiling — cheapest check, and the one that must
  // never be skipped: if ODO is already paused today, nothing below matters.
  const dailyGate = await checkDailySpendGate();
  if (dailyGate.paused) {
    return NextResponse.json(
      {
        code: "daily_cap_reached",
        message: "ODO has reached its scan capacity for today. Please try again tomorrow, or contact us directly at info@orgro.ca for an immediate consultation.",
      },
      { status: 503 }
    );
  }

  // 2. Captcha — proves a human submitted this form.
  const turnstileToken = String(body.turnstile_token || body.turnstileToken || "").trim();
  const captchaOk = await verifyTurnstile(turnstileToken, ip);
  if (!captchaOk) {
    return NextResponse.json(
      { code: "captcha_failed", message: "We couldn't verify you're human. Please try again." },
      { status: 403 }
    );
  }

  // 3. Per-IP daily limit (Redis-backed, shared across serverless instances —
  // the existing hourly limiter above is only a cheap first filter).
  const ipDaily = await checkIpDailyLimit(ip, IP_DAILY_SCAN_LIMIT).catch(() => ({ ok: true, count: 0 }));
  if (!ipDaily.ok) {
    return NextResponse.json(
      { code: "rate_limited", message: "You've reached today's scan limit from this connection. Please try again tomorrow or contact us directly at info@orgro.ca." },
      { status: 429 }
    );
  }

  // 4. No website → not allowed to scan (approved 2026-10-01: public
  // research needs a real site to work from; a no-website visitor is
  // routed to a consultation instead of an automated scan).
  if (!hasWebsite) {
    return NextResponse.json(
      {
        code: "website_required",
        message: "ODO's scan works from your website's public information, so a website is required to run it. If you don't have one yet, our team would rather talk to you directly — please book a quick consultation instead.",
        consultationUrl: "https://orgro.ca/contact",
      },
      { status: 400 }
    );
  }

  // 5. Disposable/temp-mail addresses are blocked outright.
  if (isDisposableEmail(email)) {
    return NextResponse.json(
      { code: "disposable_email", message: "Please use a permanent email address — temporary/disposable email services aren't supported." },
      { status: 400 }
    );
  }

  // 6. Website must be real, reachable, not parked/for-sale/empty, and not
  // registered within the last 48 hours.
  const websiteCheck = await checkWebsiteValidity(website!);
  if (!websiteCheck.valid) {
    return NextResponse.json({ code: "invalid_website", message: websiteCheck.reason }, { status: 400 });
  }

  // 7. Email must belong to the visitor's own business domain, or be a
  // well-known free provider. A mismatched custom domain (neither the
  // visitor's business nor a known free provider) is rejected outright —
  // this is the one layer that most directly stops someone scanning a
  // business that isn't theirs. (Free-email visitors pass this layer
  // unverified for now — see file header on the deferred OTP step.)
  if (!emailDomainMatchesWebsite(email, website!) && !isFreeEmailDomain(email)) {
    return NextResponse.json(
      {
        code: "email_mismatch",
        message: "Please use an email address at your own business's domain (or a personal provider like Gmail) to start a scan for this website.",
      },
      { status: 400 }
    );
  }

  // 8. Cheap AI check that the site reads like a real, currently operating
  // business — not a template never filled in or content unrelated to the
  // claimed company. Fails open (null = pass) if the AI check itself can't
  // run; only an explicit `looksReal: false` blocks the scan.
  const businessCheck = await checkIsRealBusiness(websiteCheck.bodyText, company);
  if (businessCheck && !businessCheck.looksReal) {
    return NextResponse.json(
      { code: "not_a_business", message: "We couldn't confirm this as an active business from its website. If this is a mistake, please contact us directly at info@orgro.ca." },
      { status: 400 }
    );
  }

  // Check for incomplete previous session (returning visitor)
  const incompleteSession = await getIncompleteSession(email).catch(() => null);
  if (incompleteSession) {
    // Session exists but is incomplete — allow restart (no cooldown penalty)
    // Front-end will handle this gracefully
  }

  // Check cooldowns (email: 7 days, domain: 30 days — completed scans only)
  const cooldownCheck = await checkCooldowns(email, hasWebsite ? website : null).catch(() => ({ allowed: true as const }));
  if (!cooldownCheck.allowed) {
    const nextDate = new Date(cooldownCheck.nextAvailableAt).toLocaleDateString("en-CA", {
      timeZone: "America/Toronto", year: "numeric", month: "long", day: "numeric",
    });
    // Word-for-word the locked copy from the master reference (Section 25) —
    // tightened 2026-10-01, this used to paraphrase it slightly ("please
    // contact us" instead of "please contact us directly", a reordered
    // first sentence on the URL message, and a dropped clause).
    const message = cooldownCheck.reason === "email_cooldown"
      ? `It looks like you've already completed a scan with this email recently. To keep your results accurate and meaningful, each business scan is available once every 7 days. Your next scan will be available on ${nextDate}. If you have an urgent security concern in the meantime, please contact us directly at info@orgro.ca.`
      : `We've already completed a discovery scan for this website on ${cooldownCheck.previousScanDate}. To ensure our analysis reflects meaningful changes, each business URL can be scanned once every 30 days. Your next scan will be available on ${nextDate}. If something critical has changed in your business or security situation, contact our team directly — we can prioritize a manual review.`;
    return NextResponse.json({ code: cooldownCheck.reason, message, nextAvailableAt: cooldownCheck.nextAvailableAt }, { status: 429 });
  }

  // Create HubSpot contact immediately (best-effort — never blocks the scan)
  const hubspotContactId = await createHubSpotContact({ name, email, company, website }).catch(() => null);

  // Mark it as an ODO lead from the first second, even if the visitor
  // abandons before finishing — a partial scan is still a real, working
  // lead worth following up on. This is also what the "ODO Scan Leads"
  // HubSpot list filters on (client_reference IS_KNOWN), so every scan
  // visitor shows up there immediately, not just the ones who finish.
  //
  // Property note (2026-09-30): the free HubSpot CRM plan was already at
  // 10/10 custom contact properties, so rather than fight that wall, ODO
  // repurposes "client_reference" (internal name `client_reference`,
  // originally created for an early Oragrol Client Reference concept that
  // was never wired up — confirmed dead via a full grep of this repo, zero
  // hits, plus 0% fill / 0 "Used In" in HubSpot itself, plus n8n — the only
  // other thing that could have written to it — is fully retired). We keep
  // ODO's own value in it (in_progress / complete / insufficient_data)
  // rather than creating a new odo_scan_condition property.
  if (hubspotContactId && HUBSPOT_TOKEN) {
    await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${hubspotContactId}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${HUBSPOT_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ properties: { client_reference: "in_progress" } }),
    }).catch(() => {});
  }

  // Create Redis session
  const session = await createSession({
    emailHash: email,
    domainHash: website || "",
    visitorName: name,
    visitorEmail: email,
    visitorCompany: company,
    visitorWebsite: website,
    hasWebsite,
    consentTimestamp: Date.now(),
    status: "researching",
    condition: null,
    phase: "researching",
    step: "Starting research...",
    questionsAsked: 0,
    findings: {},
    swot: null,
    serviceMatches: [],
    hubspotContactId,
  });

  // Add HubSpot note
  if (hubspotContactId) {
    await addHubSpotNote(
      hubspotContactId,
      `ODO Scan started.\nCompany: ${company}\nWebsite: ${website || "Not provided"}\nHas website: ${hasWebsite}\nSession ID: ${session.sessionId}\nConsent: Yes — ${new Date().toISOString()}`
    ).catch(() => {});
  }

  // FIXED 2026-09-29 — this used to be a bare "fire and forget" call
  // (runResearchAsync(...).catch(...) with no await and nothing telling
  // the platform to keep running). On Vercel's serverless runtime, once
  // this handler returns its NextResponse the function instance can be
  // frozen or torn down — an un-awaited promise has no guarantee it
  // keeps executing after the response is sent. That silently orphaned
  // every scan's research: the session got created, the browser got its
  // 200, and research just never continued. Confirmed via a live test
  // scan that sat frozen on "Analyzing your website..." for 60+ seconds
  // with zero progress, even though every individual API call in the
  // pipeline has its own 10-20s timeout — so it wasn't running slowly,
  // it had stopped running at all.
  // next/server's after() is Next.js's supported mechanism for exactly
  // this: it tells the platform to keep the function alive until this
  // callback finishes, instead of relying on a dangling promise that
  // may or may not survive past the response.
  after(() =>
    runResearchAsync(session.sessionId, company, website, hasWebsite, hubspotContactId, email).catch(err => {
      console.error("[ODO] Async research failed:", err);
    })
  );

  return NextResponse.json({
    session_id: session.sessionId,
    status: "researching",
    phase: "researching",
    step: "Starting research...",
    events_url: `/api/odo/scan/events?session_id=${session.sessionId}`,
    status_url: `/api/odo/scan/status?session_id=${session.sessionId}`,
  });
}

// --- Async research runner (fires and forgets from the POST handler) ---

async function runResearchAsync(
  sessionId: string,
  businessName: string,
  website: string | null,
  hasWebsite: boolean,
  hubspotContactId: string | null,
  visitorEmail: string
): Promise<void> {
  const { updateSession, getSession } = await import("@/app/lib/odo-redis");

  try {
    // Update status to researching
    await updateSession(sessionId, { status: "researching", phase: "researching", step: "Analyzing your website..." });

    // Run all parallel API research
    const findings = await runParallelResearch(businessName, website, hasWebsite, visitorEmail);

    // Research done → ODO writes its opening message and first question
    // from what it found (Master Reference §37.2). Status stays
    // "researching" until the opening actually exists, so the browser never
    // lands on an empty question screen.
    await updateSession(sessionId, {
      findings: findings as unknown as Record<string, unknown>,
      step: "Preparing your interview...",
    });
    const profile = { industry: findings.industry, businessSize: findings.businessSize };
    const session = await getSession(sessionId);
    if (!session) return;
    const opening = await openInterview(interviewContext(findings, session, profile));
    const aiUsageSoFar = addClaudeUsage(addClaudeUsage(EMPTY_USAGE, findings.businessProfileUsage), opening.usage);
    const baseFindings: Record<string, unknown> = {
      ...(findings as unknown as Record<string, unknown>),
      _industryDetected: findings.industry,
      _businessSizeDetected: findings.businessSize,
      _researchErrors: findings.errors,
      _aiUsage: aiUsageSoFar,
      _interview: opening.state,
      _chat: opening.chat,
    };

    if (opening.outcome === "failed") {
      // No fixed-question fallback exists (§37.2). The scan stops honestly;
      // no cooldown is set, so the visitor can simply try again later.
      await updateSession(sessionId, {
        findings: baseFindings,
        status: "failed",
        phase: "failed",
        step: AI_UNAVAILABLE_MESSAGE,
      });
      return;
    }

    await updateSession(sessionId, {
      findings: baseFindings,
      status: "questioning",
      phase: "questioning",
      step: `turn-${opening.state.version}`,
      questionsAsked: opening.state.questionsAsked,
    });

    // Update HubSpot with research summary (best-effort)
    //
    // FIXED 2026-09-30 — this used to PATCH odo_industry_detected,
    // odo_business_size and odo_security_score as separate custom contact
    // properties. None of them were ever created in HubSpot (the portal is
    // on the free CRM plan, already at its 10/10 custom-property cap — see
    // client_reference above), so every one of these PATCHes had been
    // silently no-op-ing since this was first written. Rather than spend
    // more of a full custom property's slot than the one already repurposed
    // (client_reference), this detail now goes into a note instead — free,
    // unlimited, and just as visible on the contact's timeline.
    if (hubspotContactId && HUBSPOT_TOKEN) {
      const securityScore = calculateSecurityScore(findings);
      await addHubSpotNote(
        hubspotContactId,
        `ODO research complete.\nIndustry detected: ${findings.industry || "Unknown"}\nBusiness size: ${findings.businessSize || "Unknown"}\nSecurity score: ${securityScore}`
      ).catch(() => {});
    }

  } catch (err) {
    console.error("[ODO] Research async failed:", err);
    await updateSession(sessionId, {
      status: "failed",
      phase: "failed",
      step: "Research encountered an error. Our team has been notified.",
    }).catch(() => {});
  }
}

// --- Helpers ---

function calculateSecurityScore(findings: ResearchFindings): number {
  // SCORING RULE — only a confirmed absence costs points.
  //
  // A check that could not be determined (timeout, no key, blocked origin)
  // must never reduce the score. The previous version deducted for every
  // source that returned null, so a prospect with perfect email security
  // scored the same as one with none whenever a key was missing — roughly a
  // 40-point systematic penalty applied to every scan.
  //
  // Scores are therefore computed over what was actually established, and
  // normalised, so a partial scan reports a fair score rather than a low one.
  //
  // NOTE — this is a rough HubSpot-property proxy only. It has no bearing
  // on the report itself: the report's findings/priorities come from
  // odo-matching.ts's §6.1-tiered service matches, not this score.
  let earned = 0;
  let possible = 0;

  const award = (weight: number, ok: boolean) => {
    possible += weight;
    if (ok) earned += weight;
  };

  if (findings.ssl?.grade) {
    award(25, !["C", "D", "E", "F", "T"].includes(findings.ssl.grade));
  }

  const dns = findings.dns;
  if (dns) {
    if (dns.spf.state !== "not_determined") {
      award(10, dns.spf.state === "observed");
      // A published SPF that ends in +all or ?all enforces nothing.
      if (dns.spf.state === "observed") {
        award(5, dns.spf.value.qualifier === "-all" || dns.spf.value.qualifier === "~all");
      }
    }
    if (dns.dkim.state !== "not_determined") award(10, dns.dkim.state === "observed");
    if (dns.dmarc.state !== "not_determined") {
      award(10, dns.dmarc.state === "observed");
      if (dns.dmarc.state === "observed") {
        // p=none is monitoring only — published but enforcing nothing.
        award(10, !dns.dmarc.value.isMonitorOnly);
        award(5, dns.dmarc.value.hasAggregateReporting);
      }
    }
    if (dns.hygiene.mtaSts.state !== "not_determined") award(5, dns.hygiene.mtaSts.state === "observed");
    if (dns.hygiene.caa.state !== "not_determined") award(5, dns.hygiene.caa.state === "observed");
  }

  const wk = findings.page?.wellKnown;
  if (wk) {
    if (wk.securityTxt.state !== "not_determined") award(3, wk.securityTxt.state === "observed");
    if (wk.privacyPolicy.state !== "not_determined") award(7, wk.privacyPolicy.state === "observed");
  }

  // Nothing could be established at all — report no score rather than a bad one.
  if (possible === 0) return -1;

  return Math.round((earned / possible) * 100);
}
