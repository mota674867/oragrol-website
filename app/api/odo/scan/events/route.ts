import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest) {
  return NextResponse.json(
    { code: "not_implemented" },
    { status: 503 }
  );
}
