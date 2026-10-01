// GET /api/odo/scan/events?session_id=xxx
// Server-Sent Events (SSE) stream — pushes live progress to the front-end.
// Front-end connects and receives real-time updates as research completes.

import { NextRequest } from "next/server";
import { getSession } from "@/app/lib/odo-redis";
import { buildFindingsSummary } from "@/app/lib/odo-research";

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
            const isTerminal = ["complete", "insufficient_data", "failed", "cancelled"].includes(session.status);
            const isTerminalComplete = session.status === "complete" || session.status === "insufficient_data";

            // FIXED 2026-10-01 — this used to send TWO messages back-to-back
            // on a terminal status: a bare "status" message first, then a
            // separate "complete" message carrying findings_summary. The
            // client's applyStatus() reacts to the FIRST message already
            // (status === "complete" is enough to close the EventSource),
            // so the second message — the only one with findings_summary —
            // was a race: sometimes delivered before the client tore down
            // the connection, sometimes not. A live test confirmed the
            // summary box went missing on the end screen. Every terminal
            // status is now exactly ONE self-sufficient message, matching
            // how the polling fallback (/api/odo/scan/status) already
            // worked — there is no second message left to race against.
            send({
              type: isTerminalComplete ? "complete" : "status",
              status: session.status,
              phase: session.phase,
              step: session.step,
              questions_asked: session.questionsAsked,
              question: session.status === "questioning" ? findings._nextQuestion : undefined,
              ...(isTerminalComplete
                ? {
                    condition: session.condition,
                    swot: session.swot,
                    service_matches: session.serviceMatches,
                    findings_summary: buildFindingsSummary(findings),
                  }
                : {}),
            });

            // Terminal states — close the stream
            if (isTerminal) {
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
