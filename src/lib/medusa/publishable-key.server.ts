import "server-only"

import { readPublishableKeyFromEnv } from "@lib/util/publishable-key"

type KeyCache = {
  token: string
  at: number
}

let cache: KeyCache | null = null
const CACHE_MS = 5 * 60 * 1000

async function fetchPublishableKeyFromMedusa(): Promise<string> {
  const secret = process.env.RELOAD_SECRET?.trim()
  const rawHost = process.env.MEDUSA_HOST?.trim()
  const host =
    rawHost && !rawHost.includes("${") ? rawHost : "medusa"

  if (!secret) {
    return ""
  }

  try {
    const response = await fetch(
      `http://${host}:9000/internal/publishable-key`,
      {
        headers: { "x-reload-secret": secret },
        cache: "no-store",
        signal: AbortSignal.timeout(8_000),
      }
    )

    if (!response.ok) {
      console.error(
        `publishable-key: medusa internal endpoint returned ${response.status}`
      )
      return ""
    }

    const json = (await response.json()) as { token?: string }
    if (json.token?.startsWith("pk_")) {
      return json.token
    }
  } catch (error) {
    console.error("publishable-key: failed to fetch from medusa", error)
  }

  return ""
}

/** Server-only: env first, then medusa internal API (cached). */
export async function resolvePublishableKey(): Promise<string> {
  const fromEnv = readPublishableKeyFromEnv()
  if (fromEnv) {
    return fromEnv
  }

  if (cache && Date.now() - cache.at < CACHE_MS) {
    return cache.token
  }

  const fromMedusa = await fetchPublishableKeyFromMedusa()
  if (fromMedusa) {
    cache = { token: fromMedusa, at: Date.now() }
    process.env.MEDUSA_PUBLISHABLE_KEY = fromMedusa
    process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY = fromMedusa
    return fromMedusa
  }

  return ""
}
