import { readPublishableKeyFromEnv } from "@lib/util/publishable-key"

/**
 * Warm up the publishable key in the background. Never exit the process here —
 * Zerops readiness hits /api/health on :8000; exiting on boot causes deploy failure.
 * After medusa seed updates CHANNEL_PUBLISHABLE_KEY, medusa calls reload-env.
 */
void (async () => {
  if (readPublishableKeyFromEnv()) {
    return
  }

  try {
    const { resolvePublishableKey } = await import(
      "@lib/medusa/publishable-key.server"
    )
    const key = await resolvePublishableKey()
    if (key) {
      console.log("instrumentation: publishable key loaded")
      return
    }
  } catch (error) {
    console.warn("instrumentation: publishable key bootstrap failed", error)
  }

  console.warn(
    "instrumentation: publishable key not set yet; storefront will retry on requests until medusa seed writes CHANNEL_PUBLISHABLE_KEY"
  )
})()
