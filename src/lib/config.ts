import { getLocaleHeader } from "@lib/util/get-locale-header"
import {
  getBrowserMedusaBackendUrl,
  getMedusaPublishableKey,
} from "@lib/util/env"
import Medusa, { FetchArgs, FetchInput } from "@medusajs/js-sdk"

const PUBLISHABLE_KEY_HEADER = "x-publishable-api-key"

function createMedusaClient() {
  return new Medusa({
    baseUrl: getBrowserMedusaBackendUrl(),
    debug: process.env.NODE_ENV === "development",
    publishableKey: getMedusaPublishableKey() || undefined,
  })
}

export const sdk = {
  client: {
    fetch: async <T>(input: FetchInput, init?: FetchArgs): Promise<T> => {
      const client = createMedusaClient()
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

      return client.client.fetch<T>(input, {
        ...init,
        headers,
      })
    },
  },
}
