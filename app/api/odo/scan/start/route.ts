// POST /api/odo/scan/start
// Entry point for every ODO scan. Validates intake, checks cooldowns,
// creates HubSpot contact, initializes Redis session, kicks off research.
// Returns session_id to the front-end immediately — research runs async.

import { NextRequest, NextResponse } from "next/server";
import { checkCooldowns, createSession, getIncompleteSession } from "@/app/lib/odo-redis";
import { runParallelResearch } from "@/app/lib/odo-research";
import { getClientIp, rateLimit } from "@/app/lib/rate-limit";

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
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ code: "validation_error", message: "Please enter a valid email address." }, { status: 400 });
  }
  if (!consent) {
    return NextResponse.json({ code: "consent_required", message: "You must accept the consent notice to proceed." }, { status: 400 });
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
    const message = cooldownCheck.reason === "email_cooldown"
      ? `It looks like you've already completed a scan with this email recently. To keep your results accurate and meaningful, each business scan is available once every 7 days. Your next scan will be available on ${nextDate}. If you have an urgent security concern in the meantime, please contact us at info@orgro.ca.`
      : `We've already completed a discovery scan for this website on ${cooldownCheck.previousScanDate}. Each business URL can be scanned once every 30 days to ensure meaningful results. Your next scan will be available on ${nextDate}. If something critical has changed, contact our team directly — we can prioritize a manual review.`;
    return NextResponse.json({ code: cooldownCheck.reason, message, nextAvailableAt: cooldownCheck.nextAvailableAt }, { status: 429 });
  }

  // Create HubSpot contact immediately (best-effort — never blocks the scan)
  const hubspotContactId = await createHubSpotContact({ name, email, company, website }).catch(() => null);

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

  // Kick off research asynchronously — do not await
  // The front-end polls /api/odo/scan/status for updates
  runResearchAsync(session.sessionId, company, website, hasWebsite, hubspotContactId).catch(err => {
    console.error("[ODO] Async research failed:", err);
  });

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
  hubspotContactId: string | null
): Promise<void> {
  const { updateSession, getSession } = await import("@/app/lib/odo-redis");

  try {
    // Update status to researching
    await updateSession(sessionId, { status: "researching", phase: "researching", step: "Analyzing your website..." });

    // Run all parallel API research
    const findings = await runParallelResearch(businessName, website, hasWebsite);

    // Update session with findings
    await updateSession(sessionId, {
      findings: findings as unknown as Record<string, unknown>,
      phase: "questioning",
      step: "Research complete — preparing questions...",
      status: "questioning",
    });

    // Generate first question based on findings
    // (Jev would do this — placeholder until TypeSafe DPA confirmed)
    const firstQuestion = generateFirstQuestion(findings.industry, findings.businessSize, hasWebsite, findings);

    await updateSession(sessionId, {
      phase: "questioning",
      step: "Ready for questions",
      status: "questioning",
    });

    // Store the first question in session for the front-end to pick up
    const session = await getSession(sessionId);
    if (session) {
      await updateSession(sessionId, {
        findings: {
          ...session.findings,
          _nextQuestion: firstQuestion,
          _industryDetected: findings.industry,
          _businessSizeDetected: findings.businessSize,
          _researchErrors: findings.errors,
        },
      });
    }

    // Update HubSpot with research summary (best-effort)
    if (hubspotContactId && HUBSPOT_TOKEN) {
      const securityScore = calculateSecurityScore(findings);
      await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${hubspotContactId}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${HUBSPOT_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          properties: {
            odo_scan_status: "questioning",
            odo_industry_detected: findings.industry || "Unknown",
            odo_business_size: findings.businessSize || "Unknown",
            odo_security_score: String(securityScore),
            odo_research_errors: findings.errors.length > 0 ? findings.errors.slice(0, 5).join("; ") : "None",
          },
        }),
      }).catch(() => {});
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

function generateFirstQuestion(
  industry: string | null,
  businessSize: "micro" | "small" | "medium" | "large" | null,
  hasWebsite: boolean,
  findings: import("@/app/lib/odo-research").ResearchFindings
): { id: string; text: string; options?: string[] } {
  // If no website — start with the most important question
  if (!hasWebsite) {
    return {
      id: "q_industry",
      text: "What industry or sector does your business operate in?",
      options: ["Healthcare", "Legal", "Finance & Accounting", "Technology", "Retail", "Construction", "Food & Beverage", "Education", "Marketing & Advertising", "Consulting", "Manufacturing", "Other"],
    };
  }
  // If industry not detected — ask
  if (!industry) {
    return {
      id: "q_industry",
      text: "What industry or sector does your business operate in?",
      options: ["Healthcare", "Legal", "Finance & Accounting", "Technology", "Retail", "Construction", "Food & Beverage", "Education", "Marketing & Advertising", "Consulting", "Manufacturing", "Other"],
    };
  }
  // If DMARC is published but enforcing nothing — ask about email security awareness.
  // Note: monitor-only is the finding, not the absence of DMARC.
  if (findings.dns?.dmarc.state === "observed" && findings.dns.dmarc.value.isMonitorOnly) {
    return {
      id: "q_email_security_awareness",
      text: "Has your team experienced any phishing attempts or suspicious emails targeting your business in the last 12 months?",
      options: ["Yes, frequently", "Yes, occasionally", "Not that we know of", "We don't monitor this"],
    };
  }
  // If business size not known — ask
  if (!businessSize) {
    return {
      id: "q_staff_count",
      text: "Approximately how many people work at your company?",
      options: ["1–10", "11–50", "51–200", "200+"],
    };
  }
  // Default first question
  return {
    id: "q_biggest_challenge",
    text: "What is your biggest operational challenge right now?",
    options: ["Cybersecurity and data protection", "Day-to-day efficiency and automation", "Growing the business", "Managing costs", "Customer experience", "Compliance and regulations"],
  };
}

function calculateSecurityScore(findings: import("@/app/lib/odo-research").ResearchFindings): number {
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
