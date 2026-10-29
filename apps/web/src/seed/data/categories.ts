/**
 * Static category seed data. Slugs are URL-safe and act as idempotency keys
 * (Req 3.1, 3.3). `imageKey` resolves to a media id via the mediaMap.
 */

export interface CategorySeed {
  title: string
  slug: string
  imageKey: string
}

export const categories: CategorySeed[] = [
  { title: "Rings", slug: "rings", imageKey: "category-rings" },
  { title: "Necklaces", slug: "necklaces", imageKey: "category-necklaces" },
  { title: "Earrings", slug: "earrings", imageKey: "category-earrings" },
  { title: "Bracelets", slug: "bracelets", imageKey: "category-bracelets" },
]
