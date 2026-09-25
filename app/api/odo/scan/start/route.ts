import { NextRequest, NextResponse } from "next/server";

// TODO: Full implementation pending — connect to n8n, Redis, Postgres, HubSpot, Tavily, Jev
// Backend contract documented in: ORAGROL_ODO_Complete_Master_Reference_v4_2026-09-25.md
export async function POST(_req: NextRequest) {
  return NextResponse.json(
    { code: "not_implemented", message: "ODO backend coming soon." },
    { status: 503 }
  );
}
