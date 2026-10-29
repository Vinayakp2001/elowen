/**
 * seed() orchestrator.
 *
 * Calls each seeder in dependency order (users → media → categories →
 * products → collections → nav-items → policies → homepage), threading the
 * shared SeedReport and the id maps produced by earlier steps through to
 * later ones. See seed-payload-cms design.md → Architecture.
 * Req 4.3, 5.3, 6.2, 8.2.
 */
import type { Payload } from "payload"
import { SeedReport } from "./report"
import { seedAdminUser } from "./seeders/users"
import { seedMedia } from "./seeders/media"
import { seedCategories } from "./seeders/categories"
import { seedProducts } from "./seeders/products"
import { seedCollections } from "./seeders/collections"
import { seedNavItems } from "./seeders/navItems"
import { seedPolicies } from "./seeders/policies"
import { seedHomepage } from "./seeders/homepage"

export async function seed(payload: Payload): Promise<SeedReport> {
  const report = new SeedReport()

  // 1. Admin user — independent.
  await seedAdminUser(payload, report)

  // 2. Media — referenced by everything below.
  const mediaMap = await seedMedia(payload, report)

  // 3. Categories — need media. → categoryMap (by slug)
  const categoryMap = await seedCategories(payload, mediaMap, report)

  // 4. Products — need media + categories. → productMap (by slug)
  const productMap = await seedProducts(payload, mediaMap, categoryMap, report)

  // 5. Collections — need media (hero) + products.
  await seedCollections(payload, mediaMap, productMap, report)

  // 6. Nav items — need products.
  await seedNavItems(payload, productMap, report)

  // 7. Policies — independent.
  await seedPolicies(payload, report)

  // 8. Homepage global — needs media, categories, products.
  await seedHomepage(payload, mediaMap, categoryMap, productMap, report)

  return report
}
