/**
 * seedCollections — create collections keyed by slug, wiring heroImage from
 * the mediaMap and `products` from the productMap (Req 4). Product slugs that
 * are not present in the map are skipped so no bad relationship id is sent.
 */
import type { Payload } from "payload"
import type { SeedReport } from "../report"
import { findOrCreate } from "../upsert"
import { collections } from "../data/collections"

export async function seedCollections(
  payload: Payload,
  mediaMap: Map<string, number>,
  productMap: Map<string, number>,
  report: SeedReport,
): Promise<void> {
  for (const col of collections) {
    const heroId = mediaMap.get(col.heroImageKey)
    const productIds = col.productSlugs
      .map((slug) => productMap.get(slug))
      .filter((id): id is number => id !== undefined)

    const data: Record<string, unknown> = {
      title: col.title,
      slug: col.slug,
      description: col.description,
      products: productIds,
    }
    if (heroId !== undefined) data.heroImage = heroId

    await findOrCreate({
      payload,
      collection: "collections",
      where: { slug: { equals: col.slug } },
      data,
      report,
      label: "collections",
    })
  }
}
