import { NextRequest, NextResponse } from "next/server";

export async function POST(_req: NextRequest) {
  return NextResponse.json(
    { code: "not_implemented", message: "ODO backend coming soon." },
    { status: 503 }
  );
}
