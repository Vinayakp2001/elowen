/**
 * Static product seed data (Req 5). Slug is intentionally omitted — the
 * Products.beforeValidate hook derives it from the title (Req 5.2). The slug
 * the hook will produce is recorded as `expectedSlug` so seedProducts can use
 * it as the idempotency lookup key and for relationship wiring by other
 * seeders. compareAtPrice (when present) is always greater than price (Req
 * 5.5). Every product has at least one image key, a category slug, materials,
 * options (name + ≥1 value), and rich text (Req 5.1, 5.6, 5.7). Several are
 * flagged isFeatured so homepage/featured queries return results (Req 5.4).
 */

export interface ProductOptionSeed {
  name: string
  values: string[]
}

export interface ProductSeed {
  title: string
  /** The slug Products.beforeValidate will derive — used as the lookup key. */
  expectedSlug: string
  sku: string
  price: number
  compareAtPrice?: number
  imageKeys: string[]
  categorySlug: string
  materials: string[]
  options: ProductOptionSeed[]
  description: string[]
  craftsmanship: string[]
  isNew?: boolean
  isFeatured?: boolean
  inStock: boolean
}

export const products: ProductSeed[] = [
  {
    title: "Aurora Solitaire Ring",
    expectedSlug: "aurora-solitaire-ring",
    sku: "ELW-RING-001",
    price: 58000,
    compareAtPrice: 72000,
    imageKeys: ["product-aurora-ring-1", "product-aurora-ring-2"],
    categorySlug: "rings",
    materials: ["18k Yellow Gold", "Lab-grown Diamond"],
    options: [
      { name: "Ring Size", values: ["5", "6", "7", "8"] },
      { name: "Metal", values: ["Yellow Gold", "White Gold", "Rose Gold"] },
    ],
    description: [
      "A timeless solitaire that lets a single brilliant-cut stone take centre stage.",
      "Hand-set in a four-prong basket to maximise light return from every angle.",
    ],
    craftsmanship: [
      "Each Aurora ring is cast in solid 18k gold and finished by hand over three days.",
      "The stone is secured by a master setter and inspected under 10x magnification.",
    ],
    isNew: true,
    isFeatured: true,
    inStock: true,
  },
  {
    title: "Celeste Pendant Necklace",
    expectedSlug: "celeste-pendant-necklace",
    sku: "ELW-NECK-001",
    price: 42000,
    compareAtPrice: 49000,
    imageKeys: ["product-celeste-necklace-1"],
    categorySlug: "necklaces",
    materials: ["14k White Gold", "Sapphire"],
    options: [{ name: "Chain Length", values: ['16"', '18"', '20"'] }],
    description: [
      "A delicate pendant suspending a deep blue sapphire from a fine cable chain.",
    ],
    craftsmanship: [
      "The bezel is micro-polished to frame the sapphire without a single visible seam.",
    ],
    isFeatured: true,
    inStock: true,
  },
  {
    title: "Luna Drop Earrings",
    expectedSlug: "luna-drop-earrings",
    sku: "ELW-EAR-001",
    price: 36000,
    imageKeys: ["product-luna-earrings-1"],
    categorySlug: "earrings",
    materials: ["18k Rose Gold", "Freshwater Pearl"],
    options: [{ name: "Finish", values: ["Polished", "Matte"] }],
    description: [
      "Crescent drops cradling a single lustrous pearl, light enough for daily wear.",
    ],
    craftsmanship: [
      "Pearls are hand-matched for lustre and drilled with sub-millimetre precision.",
    ],
    isNew: true,
    inStock: true,
  },
  {
    title: "Seren Tennis Bracelet",
    expectedSlug: "seren-tennis-bracelet",
    sku: "ELW-BRAC-001",
    price: 94000,
    compareAtPrice: 110000,
    imageKeys: ["product-seren-bracelet-1"],
    categorySlug: "bracelets",
    materials: ["18k White Gold", "Lab-grown Diamond"],
    options: [{ name: "Length", values: ['6.5"', '7"', '7.5"'] }],
    description: [
      "A continuous line of matched stones in a flexible, feather-light setting.",
    ],
    craftsmanship: [
      "Fifty individually set stones are linked by hand for a fluid, unbroken sparkle.",
    ],
    isFeatured: true,
    inStock: true,
  },
  {
    title: "Verena Stacking Ring",
    expectedSlug: "verena-stacking-ring",
    sku: "ELW-RING-002",
    price: 22000,
    imageKeys: ["product-verena-ring-1"],
    categorySlug: "rings",
    materials: ["14k Yellow Gold"],
    options: [{ name: "Ring Size", values: ["5", "6", "7", "8", "9"] }],
    description: ["A slim, hammered band designed to be worn alone or stacked."],
    craftsmanship: ["Each band is hand-hammered to catch the light along its edge."],
    inStock: true,
  },
  {
    title: "Isolde Chain Necklace",
    expectedSlug: "isolde-chain-necklace",
    sku: "ELW-NECK-002",
    price: 31000,
    imageKeys: ["product-isolde-necklace-1"],
    categorySlug: "necklaces",
    materials: ["18k Gold Vermeil"],
    options: [{ name: "Chain Length", values: ['18"', '20"'] }],
    description: ["A substantial figaro chain with a reassuring, sculptural weight."],
    craftsmanship: ["Links are soldered and tumbled for a seamless, durable finish."],
    isFeatured: true,
    inStock: true,
  },
  {
    title: "Maren Huggie Hoops",
    expectedSlug: "maren-huggie-hoops",
    sku: "ELW-EAR-002",
    price: 18000,
    compareAtPrice: 24000,
    imageKeys: ["product-maren-earrings-1"],
    categorySlug: "earrings",
    materials: ["14k Yellow Gold"],
    options: [{ name: "Finish", values: ["Polished", "Textured"] }],
    description: ["Snug everyday huggies with a secure hinged closure."],
    craftsmanship: ["Hinges are precision-fitted so the hoops click shut and stay put."],
    inStock: true,
  },
  {
    title: "Thea Cuff Bracelet",
    expectedSlug: "thea-cuff-bracelet",
    sku: "ELW-BRAC-002",
    price: 47000,
    imageKeys: ["product-thea-bracelet-1"],
    categorySlug: "bracelets",
    materials: ["Sterling Silver", "Rhodium Plating"],
    options: [{ name: "Size", values: ["Small", "Medium", "Large"] }],
    description: ["A smooth, open cuff that slips on and holds its shape."],
    craftsmanship: ["Formed over a mandrel and polished to a mirror finish by hand."],
    inStock: false,
  },
]
