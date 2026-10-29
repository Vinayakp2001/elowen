/**
 * Media asset manifest (Req 2). Every image referenced by any other seeder
 * (categories, collection heroes, product images, hero, campaign banner,
 * brand story) MUST have an entry here. `key` is the stable idempotency key
 * used by the mediaMap; `alt` is the descriptive alt text and also the lookup
 * key for ensureMedia; `file` is the filename under src/seed/assets/.
 */

export interface MediaSeed {
  key: string
  file: string
  alt: string
}

export const media: MediaSeed[] = [
  // Category images
  { key: "category-rings", file: "category-rings.jpg", alt: "Elowen rings category" },
  { key: "category-necklaces", file: "category-necklaces.jpg", alt: "Elowen necklaces category" },
  { key: "category-earrings", file: "category-earrings.jpg", alt: "Elowen earrings category" },
  { key: "category-bracelets", file: "category-bracelets.jpg", alt: "Elowen bracelets category" },

  // Collection hero images
  { key: "collection-aurora-hero", file: "collection-aurora-hero.jpg", alt: "The Aurora Edit collection" },
  { key: "collection-essentials-hero", file: "collection-essentials-hero.jpg", alt: "Everyday Essentials collection" },

  // Product images
  { key: "product-aurora-ring-1", file: "product-aurora-ring-1.jpg", alt: "Aurora Solitaire Ring front view" },
  { key: "product-aurora-ring-2", file: "product-aurora-ring-2.jpg", alt: "Aurora Solitaire Ring side view" },
  { key: "product-celeste-necklace-1", file: "product-celeste-necklace-1.jpg", alt: "Celeste Pendant Necklace" },
  { key: "product-luna-earrings-1", file: "product-luna-earrings-1.jpg", alt: "Luna Drop Earrings" },
  { key: "product-seren-bracelet-1", file: "product-seren-bracelet-1.jpg", alt: "Seren Tennis Bracelet" },
  { key: "product-verena-ring-1", file: "product-verena-ring-1.jpg", alt: "Verena Stacking Ring" },
  { key: "product-isolde-necklace-1", file: "product-isolde-necklace-1.jpg", alt: "Isolde Chain Necklace" },
  { key: "product-maren-earrings-1", file: "product-maren-earrings-1.jpg", alt: "Maren Huggie Hoops" },
  { key: "product-thea-bracelet-1", file: "product-thea-bracelet-1.jpg", alt: "Thea Cuff Bracelet" },

  // Homepage images
  { key: "hero-main", file: "hero-main.jpg", alt: "Elowen fine jewelry hero" },
  { key: "campaign-banner", file: "campaign-banner.jpg", alt: "The Aurora Edit campaign banner" },
  { key: "brand-story", file: "brand-story.jpg", alt: "Elowen craftsmanship brand story" },
]
