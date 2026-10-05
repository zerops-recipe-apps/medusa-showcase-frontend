declare global {
  interface Window {
    __MEDUSA_PUBLISHABLE_KEY__?: string
  }
}

export function isResolvedPublishableKey(value?: string | null): boolean {
  const trimmed = value?.trim()
  return Boolean(trimmed) && trimmed!.startsWith("pk_") && !trimmed!.includes("${")
}

/** Sync read from env / browser bootstrap (no network). */
export function readPublishableKeyFromEnv(): string {
  if (typeof window !== "undefined") {
    const injected = window.__MEDUSA_PUBLISHABLE_KEY__
    if (isResolvedPublishableKey(injected)) {
      return injected!.trim()
    }
  }

  for (const name of [
    "MEDUSA_PUBLISHABLE_KEY",
    "CHANNEL_PUBLISHABLE_KEY",
    "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY",
    "RUNTIME_NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY",
  ]) {
    const value = process.env[name]?.trim()
    if (isResolvedPublishableKey(value)) {
      return value!
    }
  }

  return ""
}
