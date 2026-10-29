/**
 * seedNavItems — create nav-items keyed by slug, wiring `products` from the
 * productMap (Req 6). Unknown product slugs are skipped.
 */
import type { Payload } from "payload"
import type { SeedReport } from "../report"
import { findOrCreate } from "../upsert"
import { navItems } from "../data/navItems"

export async function seedNavItems(
  payload: Payload,
  productMap: Map<string, number>,
  report: SeedReport,
): Promise<void> {
  for (const item of navItems) {
    const productIds = item.productSlugs
      .map((slug) => productMap.get(slug))
      .filter((id): id is number => id !== undefined)

    await findOrCreate({
      payload,
      collection: "nav-items",
      where: { slug: { equals: item.slug } },
      data: {
        label: item.label,
        slug: item.slug,
        order: item.order,
        products: productIds,
      },
      report,
      label: "nav-items",
    })
  }
}
