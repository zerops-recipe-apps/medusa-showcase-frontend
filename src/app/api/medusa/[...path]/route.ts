import { NextRequest, NextResponse } from "next/server"
import {
  getMedusaBackendUrl,
  getMedusaPublishableKey,
} from "@lib/util/env"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const ALLOWED_ROOTS = new Set(["store", "auth"])

async function proxy(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params
  const root = path[0]

  if (!root || !ALLOWED_ROOTS.has(root)) {
    return NextResponse.json({ message: "Not found" }, { status: 404 })
  }

  const backend = getMedusaBackendUrl()
  if (!backend || backend.includes("localhost")) {
    return NextResponse.json(
      { message: "Medusa backend URL is not configured" },
      { status: 502 }
    )
  }

  const target = new URL(`/${path.join("/")}${request.nextUrl.search}`, backend)
  const headers = new Headers()
  const publishableKey =
    getMedusaPublishableKey() || request.headers.get("x-publishable-api-key")

  if (publishableKey) {
    headers.set("x-publishable-api-key", publishableKey)
  }

  for (const name of [
    "content-type",
    "authorization",
    "cookie",
    "x-medusa-locale",
  ]) {
    const value = request.headers.get(name)
    if (value) {
      headers.set(name, value)
    }
  }

  const init: RequestInit = {
    method: request.method,
    headers,
    cache: "no-store",
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.text()
  }

  try {
    const response = await fetch(target, init)
    const body = await response.arrayBuffer()
    const out = new NextResponse(body, { status: response.status })
    const contentType = response.headers.get("content-type")
    if (contentType) {
      out.headers.set("content-type", contentType)
    }
    return out
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`api/medusa: proxy to ${target.href} failed: ${message}`)
    return NextResponse.json(
      { message: "Failed to reach Medusa" },
      { status: 502 }
    )
  }
}

export const GET = proxy
export const POST = proxy
export const PUT = proxy
export const PATCH = proxy
export const DELETE = proxy
export const OPTIONS = proxy
