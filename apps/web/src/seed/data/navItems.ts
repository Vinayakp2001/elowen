/**
 * Static nav-item seed data (Req 6). Slugs align with the /nav/[slug] route.
 * At least one nav item has `productSlugs` populated so its page renders
 * products (Req 6.2).
 */

export interface NavItemSeed {
  label: string
  slug: string
  order: number
  productSlugs: string[]
}

export const navItems: NavItemSeed[] = [
  {
    label: "New Arrivals",
    slug: "new-arrivals",
    order: 1,
    productSlugs: ["aurora-solitaire-ring", "luna-drop-earrings"],
  },
  {
    label: "Rings",
    slug: "rings",
    order: 2,
    productSlugs: ["aurora-solitaire-ring", "verena-stacking-ring"],
  },
  {
    label: "Necklaces",
    slug: "necklaces",
    order: 3,
    productSlugs: ["celeste-pendant-necklace", "isolde-chain-necklace"],
  },
  {
    label: "Earrings",
    slug: "earrings",
    order: 4,
    productSlugs: ["luna-drop-earrings", "maren-huggie-hoops"],
  },
]
