/**
 * seedCategories — create categories keyed by slug, wiring the image from the
 * mediaMap when available (Req 3). Returns Map<slug, id> for product wiring.
 */
import type { Payload } from "payload"
import type { SeedReport } from "../report"
import { findOrCreate } from "../upsert"
import { categories } from "../data/categories"

export async function seedCategories(
  payload: Payload,
  mediaMap: Map<string, number>,
  report: SeedReport,
): Promise<Map<string, number>> {
  const map = new Map<string, number>()

  for (const cat of categories) {
    const imageId = mediaMap.get(cat.imageKey)
    const data: Record<string, unknown> = {
      title: cat.title,
      slug: cat.slug,
    }
    if (imageId !== undefined) data.image = imageId

    const { id } = await findOrCreate({
      payload,
      collection: "categories",
      where: { slug: { equals: cat.slug } },
      data,
      report,
      label: "categories",
    })
    if (id !== null) map.set(cat.slug, id)
  }

  return map
}
