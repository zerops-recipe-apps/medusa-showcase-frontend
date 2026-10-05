import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export function GET() {
  console.log("GET /api/health")
  return NextResponse.json({ ok: true }, { status: 200 })
}
