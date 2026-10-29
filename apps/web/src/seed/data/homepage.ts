/**
 * Static homepage global seed data (Req 8). Relationship fields are resolved
 * at seed time: featuredCategories from categoryMap, signatureProducts /
 * featuredProducts from the isFeatured subset of productMap. Asset keys
 * resolve via mediaMap. Rich text (brandStory.body) is built with the lexical
 * helper.
 */

export interface HomepageSeed {
  hero: {
    headline: string
    subline: string
    ctaLabel: string
    ctaHref: string
    imageKey: string
  }
  /** Category slugs to feature. */
  featuredCategorySlugs: string[]
  /** Product slugs for the signature section. */
  signatureProductSlugs: string[]
  campaignBanner: {
    headline: string
    ctaLabel: string
    ctaHref: string
    imageKey: string
  }
  /** Product slugs for the featured section. */
  featuredProductSlugs: string[]
  brandStory: {
    headline: string
    body: string[]
    imageKey: string
  }
  newsletterHeadline: string
}

export const homepage: HomepageSeed = {
  hero: {
    headline: "Quietly Extraordinary",
    subline: "Fine jewelry made to be worn, loved, and passed on.",
    ctaLabel: "Shop the Collection",
    ctaHref: "/products",
    imageKey: "hero-main",
  },
  featuredCategorySlugs: ["rings", "necklaces", "earrings", "bracelets"],
  signatureProductSlugs: ["aurora-solitaire-ring", "seren-tennis-bracelet"],
  campaignBanner: {
    headline: "The Aurora Edit — now available",
    ctaLabel: "Explore",
    ctaHref: "/collections/aurora-edit",
    imageKey: "campaign-banner",
  },
  featuredProductSlugs: [
    "aurora-solitaire-ring",
    "celeste-pendant-necklace",
    "seren-tennis-bracelet",
    "isolde-chain-necklace",
  ],
  brandStory: {
    headline: "Crafted in India, worn everywhere",
    body: [
      "Elowen began with a simple belief: that fine jewelry should feel personal, not precious.",
      "Every piece is made by hand in small batches, using responsibly sourced metals and stones.",
    ],
    imageKey: "brand-story",
  },
  newsletterHeadline: "Join the inner circle",
}
