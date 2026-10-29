/**
 * Static collection seed data (Req 4). `heroImageKey` resolves via mediaMap;
 * `productSlugs` resolve via productMap to the `products` relationship.
 */

export interface CollectionSeed {
  title: string
  slug: string
  heroImageKey: string
  description: string
  productSlugs: string[]
}

export const collections: CollectionSeed[] = [
  {
    title: "The Aurora Edit",
    slug: "aurora-edit",
    heroImageKey: "collection-aurora-hero",
    description:
      "Our most luminous pieces, built around brilliant-cut stones and warm gold.",
    productSlugs: [
      "aurora-solitaire-ring",
      "celeste-pendant-necklace",
      "seren-tennis-bracelet",
    ],
  },
  {
    title: "Everyday Essentials",
    slug: "everyday-essentials",
    heroImageKey: "collection-essentials-hero",
    description:
      "Light, wearable staples designed to layer and live in, day after day.",
    productSlugs: [
      "verena-stacking-ring",
      "isolde-chain-necklace",
      "maren-huggie-hoops",
    ],
  },
]
