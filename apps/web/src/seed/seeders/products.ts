/**
 * seedProducts — create products keyed by their (auto-derived) slug (Req 5).
 *
 * The `slug` field is omitted from the create payload so the
 * Products.beforeValidate hook derives it from the title (Req 5.2). The lookup
 * uses the pre-computed `expectedSlug` which matches what the hook produces.
 * Image and category ids are resolved from the passed maps; a missing image
 * key is dropped, a missing category is omitted. Returns Map<slug, id>.
 */
import type { Payload } from "payload"
import type { SeedReport } from "../report"
import { findOrCreate } from "../upsert"
import { richText } from "../lexical"
import { products } from "../data/products"

export async function seedProducts(
  payload: Payload,
  mediaMap: Map<string, number>,
  categoryMap: Map<string, number>,
  report: SeedReport,
): Promise<Map<string, number>> {
  const map = new Map<string, number>()

  for (const prod of products) {
    const imageIds = prod.imageKeys
      .map((key) => mediaMap.get(key))
      .filter((id): id is number => id !== undefined)

    const categoryId = categoryMap.get(prod.categorySlug)

    const data: Record<string, unknown> = {
      title: prod.title,
      sku: prod.sku,
      price: prod.price,
      materials: prod.materials.map((material) => ({ material })),
      options: prod.options.map((opt) => ({
        name: opt.name,
        values: opt.values.map((value) => ({ value })),
      })),
      description: richText(...prod.description),
      craftsmanship: richText(...prod.craftsmanship),
      isNew: prod.isNew ?? false,
      isFeatured: prod.isFeatured ?? false,
      inStock: prod.inStock,
    }
    if (prod.compareAtPrice !== undefined) data.compareAtPrice = prod.compareAtPrice
    if (imageIds.length > 0) data.images = imageIds
    if (categoryId !== undefined) data.category = categoryId

    const { id } = await findOrCreate({
      payload,
      collection: "products",
      where: { slug: { equals: prod.expectedSlug } },
      data,
      report,
      label: "products",
    })
    if (id !== null) map.set(prod.expectedSlug, id)
  }

  return map
}
