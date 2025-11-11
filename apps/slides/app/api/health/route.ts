import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      status: "healthy",
      service: "darevel-slides",
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}
