import { Metadata } from "next"

import FeaturedProducts from "@modules/home/components/featured-products"
import Hero from "@modules/home/components/hero"
import { listCollections } from "@lib/data/collections"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { HttpTypes } from "@medusajs/types"

export const metadata: Metadata = {
  title: "Medusa Next.js Starter Template",
  description:
    "A performant frontend ecommerce starter template with Next.js 15 and Medusa.",
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params

  const { countryCode } = params

  const region = await getRegion(countryCode)

  const { collections } = await listCollections({
    fields: "id, handle, title",
  })

  let homepageCollections = collections ?? []

  if (region && homepageCollections.length === 0) {
    const {
      response: { products },
    } = await listProducts({
      countryCode,
      queryParams: {
        limit: 12,
        fields: "*variants.calculated_price",
      },
    })

    if (products.length) {
      homepageCollections = [
        {
          id: "homepage-all",
          title: "Latest Drops",
          handle: "store",
          metadata: { fallback: true },
        } as HttpTypes.StoreCollection,
      ]
    }
  }

  return (
    <>
      <Hero />
      {region && homepageCollections.length > 0 && (
        <div className="py-12">
          <ul className="flex flex-col gap-x-6">
            <FeaturedProducts collections={homepageCollections} region={region} />
          </ul>
        </div>
      )}
    </>
  )
}
