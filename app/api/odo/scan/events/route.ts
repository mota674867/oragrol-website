// GET /api/odo/scan/events?session_id=xxx
// Server-Sent Events (SSE) stream — pushes live progress to the front-end.
// Front-end connects and receives real-time updates as research completes.

import { NextRequest } from "next/server";
import { getSession } from "@/app/lib/odo-redis";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id");
  if (!sessionId) {
    return new Response("session_id is required", { status: 400 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: Record<string, unknown>) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch { /* client disconnected */ }
      };

      send({ type: "connected", session_id: sessionId });

      let lastStatus = "";
      let lastStep = "";
      let attempts = 0;
      const MAX_ATTEMPTS = 120; // 2 minutes at 1s intervals

      const poll = async () => {
        if (attempts >= MAX_ATTEMPTS) {
          send({ type: "timeout", message: "Research is taking longer than expected. Please wait — we will notify you when your report is ready." });
          controller.close();
          return;
        }

        attempts++;

        try {
          const session = await getSession(sessionId);
          if (!session) {
            send({ type: "error", message: "Session not found." });
            controller.close();
            return;
          }

          // Only send updates when something changed
          if (session.status !== lastStatus || session.step !== lastStep) {
            lastStatus = session.status;
            lastStep = session.step;

            const findings = session.findings as Record<string, unknown>;

            send({
              type: "status",
              status: session.status,
              phase: session.phase,
              step: session.step,
              questions_asked: session.questionsAsked,
              question: session.status === "questioning" ? findings._nextQuestion : undefined,
            });

            // Terminal states — close the stream
            if (["complete", "insufficient_data", "failed", "cancelled"].includes(session.status)) {
              if (session.status === "complete" || session.status === "insufficient_data") {
                send({
                  type: "complete",
                  condition: session.condition,
                  status: session.status,
                  swot: session.swot,
                  service_matches: session.serviceMatches,
                  findings_summary: buildFindingsSummary(findings),
                });
              }
              controller.close();
              return;
            }
          }
        } catch (err) {
          console.error("[ODO SSE] Poll error:", err);
        }

        // Continue polling
        setTimeout(poll, 1000);
      };

      // Start polling after a short delay
      setTimeout(poll, 500);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

function buildFindingsSummary(findings: Record<string, unknown>): Record<string, unknown> {
  const f = findings as import("@/app/lib/odo-research").ResearchFindings;
  let securityIssues = 0;
  let marketingGaps = 0;
  let opportunities = 0;

  if (f.ssl?.grade && ["C", "D", "F"].includes(f.ssl.grade)) securityIssues++;
  if (!f.emailSecurity?.spf) securityIssues++;
  if (!f.emailSecurity?.dmarc) securityIssues++;
  if (f.breachHistory?.breached) securityIssues++;
  if (f.shodan?.openPorts && f.shodan.openPorts.length > 3) securityIssues++;
  if (!f.virusTotal?.clean) securityIssues++;
  if (!f.paidAds?.runningFacebookAds && !f.paidAds?.runningGoogleAds) marketingGaps++;
  if (f.website?.pageSpeedScore && f.website.pageSpeedScore < 50) marketingGaps++;
  if (f.seo?.domainAuthority && f.seo.domainAuthority < 20) marketingGaps++;
  if (f.technologies?.allTech && f.technologies.allTech.length < 5) opportunities++;
  if (f.competitors?.competitors && f.competitors.competitors.length > 0) opportunities++;

  return {
    security_issues: securityIssues,
    marketing_gaps: marketingGaps,
    opportunities,
    total: securityIssues + marketingGaps + opportunities,
  };
}
