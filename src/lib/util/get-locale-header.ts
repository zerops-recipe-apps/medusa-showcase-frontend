import { getLocale } from "@lib/data/locale-actions"

export async function getLocaleHeader() {
  const locale = await getLocale()
  if (!locale?.trim()) {
    return {}
  }
  return {
    "x-medusa-locale": locale,
  }
}
