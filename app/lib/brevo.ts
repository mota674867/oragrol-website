/**
 * Minimal Brevo (Sendinblue) integration for the Newsletter signup form
 * (app/components/site/footer.tsx, POST /api/newsletter). A direct
 * server-to-server call to Brevo's REST API using an API key
 * (`BREVO_API_KEY`), created 2026-09-19 under Brevo -> Settings -> SMTP &
 * API -> API keys & MCP, scoped to this site only ("Oragrol Website", 1
 * year expiry).
 *
 * Brevo — not HubSpot — is the actual send platform for the monthly
 * briefing (the "Newsletter" list, id 3, confirmed 2026-09-19 in
 * Mohammad's Brevo account), so this is the mandatory half of the
 * newsletter dual-write: the route treats a Brevo failure as a real,
 * reported failure (the signup didn't actually happen), while the
 * HubSpot sync (lib/hubspot.ts's syncNewsletterSubscriberToHubSpot) is
 * best-effort CRM visibility only — same "what actually delivers the
 * thing is mandatory, CRM sync is best-effort" split used by
 * /api/cyber-health for its PDF email vs. HubSpot sync.
 *
 * Uses POST /v3/contacts with updateEnabled: true, which upserts by
 * email in one call (201 on create, 204 on update) — no separate
 * exists-check needed.
 */

const BREVO_API_BASE = "https://api.brevo.com/v3";
const NEWSLETTER_LIST_ID = 3;

export type BrevoNewsletterSyncResult = { ok: true } | { ok: false; error: string };

export async function syncNewsletterSubscriberToBrevo(params: {
  email: string;
  firstName: string;
}): Promise<BrevoNewsletterSyncResult> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    return { ok: false, error: "BREVO_API_KEY is not set." };
  }
  try {
    const res = await fetch(`${BREVO_API_BASE}/contacts`, {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        email: params.email,
        attributes: params.firstName ? { FIRSTNAME: params.firstName } : undefined,
        listIds: [NEWSLETTER_LIST_ID],
        updateEnabled: true,
      }),
    });
    // 201 (created) and 204 (updated, no body) are both success.
    if (res.ok) return { ok: true };
    const text = await res.text().catch(() => "");
    return { ok: false, error: `Brevo contact upsert failed: ${res.status} ${text}`.slice(0, 500) };
  } catch (err) {
    return { ok: false, error: `Brevo newsletter sync threw: ${err instanceof Error ? err.message : String(err)}` };
  }
}
