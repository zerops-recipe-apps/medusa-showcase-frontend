import { resolvePublishableKey } from "@lib/medusa/publishable-key.server"
import { getBaseURL } from "@lib/util/env"
import { readPublishableKeyFromEnv } from "@lib/util/publishable-key"
import { Metadata } from "next"
import "styles/globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const publishableKey =
    readPublishableKeyFromEnv() || (await resolvePublishableKey())

  return (
    <html lang="en" data-mode="light">
      <head>
        {publishableKey ? (
          <script
            dangerouslySetInnerHTML={{
              __html: `window.__MEDUSA_PUBLISHABLE_KEY__=${JSON.stringify(publishableKey)};`,
            }}
          />
        ) : null}
      </head>
      <body>
        <main className="relative">{props.children}</main>
      </body>
    </html>
  )
}
