import {
  isResolvedPublishableKey,
  readPublishableKeyFromEnv,
} from "@lib/util/publishable-key"

export const getBaseURL = () => {
  const raw = process.env.NEXT_PUBLIC_BASE_URL?.trim()
  if (raw) {
    try {
      return new URL(raw).origin
    } catch {
      // Invalid NEXT_PUBLIC_BASE_URL must not crash `new URL()` in layouts.
    }
  }
  return "https://localhost:8000"
}

function isUsableBackendUrl(value?: string): value is string {
  const trimmed = value?.trim()
  if (!trimmed || trimmed.includes("${")) {
    return false
  }

  try {
    const url = new URL(trimmed)
    if (!url.hostname) {
      return false
    }
    if (
      process.env.NODE_ENV === "production" &&
      (url.hostname === "localhost" || url.hostname === "127.0.0.1")
    ) {
      return false
    }
    return true
  } catch {
    return false
  }
}

/** Private hostname on the server; public API URL is a fallback. */
export function getMedusaBackendUrl(): string {
  const candidates = [
    process.env.MEDUSA_BACKEND_URL,
    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL,
    process.env.API_URL,
  ]

  for (const candidate of candidates) {
    if (isUsableBackendUrl(candidate)) {
      return candidate.trim()
    }
  }

  return "http://localhost:9000"
}

/**
 * Browser requests go through this app so they never hit localhost:9000.
 * Server components talk to Medusa directly on the private network.
 */
export function getBrowserMedusaBackendUrl(): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/api/medusa`
  }

  return getMedusaBackendUrl()
}

/** Publishable key for Medusa store APIs (sync; use resolvePublishableKey on server when empty). */
export function getMedusaPublishableKey(): string {
  return readPublishableKeyFromEnv()
}

export { isResolvedPublishableKey }
