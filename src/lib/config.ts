import { getLocaleHeader } from "@lib/util/get-locale-header"
import {
  getMedusaBackendUrl,
  getMedusaPublishableKey,
} from "@lib/util/env"
import Medusa, { FetchArgs, FetchInput } from "@medusajs/js-sdk"

const PUBLISHABLE_KEY_HEADER = "x-publishable-api-key"

export const sdk = new Medusa({
  baseUrl: getMedusaBackendUrl(),
  debug: process.env.NODE_ENV === "development",
  publishableKey: getMedusaPublishableKey() || undefined,
})

const originalFetch = sdk.client.fetch.bind(sdk.client)

sdk.client.fetch = async <T>(
  input: FetchInput,
  init?: FetchArgs
): Promise<T> => {
  const headers: Record<string, string | null | undefined> = {
    ...(init?.headers as Record<string, string | null | undefined>),
  }
  const publishableKey = getMedusaPublishableKey()
  if (publishableKey) {
    headers[PUBLISHABLE_KEY_HEADER] = publishableKey
  }

  try {
    const localeHeader = await getLocaleHeader()
    const locale = localeHeader["x-medusa-locale"]
    if (locale) {
      headers["x-medusa-locale"] ??= locale
    }
  } catch {}

  return originalFetch(input, {
    ...init,
    headers,
  })
}
