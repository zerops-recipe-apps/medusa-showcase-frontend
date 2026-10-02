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

function isResolvedPublishableKey(value: string): boolean {
  return Boolean(value) && value.startsWith("pk_") && !value.includes("${")
}

/**
 * Publishable key for Medusa store APIs.
 * NEXT_PUBLIC_* is baked at build; MEDUSA_PUBLISHABLE_KEY is the runtime fallback
 * when the first storefront build ran before backend seed wrote CHANNEL_PUBLISHABLE_KEY.
 * Rejects empty values and unresolved Zerops refs (${medusa_CHANNEL_PUBLISHABLE_KEY}).
 */
export function getMedusaPublishableKey(): string {
  const fromPublic = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY?.trim()
  if (fromPublic && isResolvedPublishableKey(fromPublic)) {
    return fromPublic
  }

  for (const name of [
    "MEDUSA_PUBLISHABLE_KEY",
    "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY",
    "RUNTIME_NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY",
  ]) {
    const value = process.env[name]?.trim() || ""
    if (isResolvedPublishableKey(value)) {
      return value
    }
  }

  return ""
}
