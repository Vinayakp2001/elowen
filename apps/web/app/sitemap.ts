import type { MetadataRoute } from "next"
import { getAllProducts, getAllCollections, getNavItems } from "@/lib/payload/queries"

const BASE_URL = "https://elowen.co.in"

const STATIC_ROUTES: MetadataRoute.Sitemap = [
  { url: `${BASE_URL}/`, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
  { url: `${BASE_URL}/products`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
  { url: `${BASE_URL}/collections`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
  { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const dynamicEntries: MetadataRoute.Sitemap = []

  try {
    const [products, collections, navItems] = await Promise.all([
      getAllProducts(),
      getAllCollections(),
      getNavItems(),
    ])

    for (const product of products) {
      if (product?.slug?.current) {
        dynamicEntries.push({
          url: `${BASE_URL}/products/${product.slug.current}`,
          lastModified: new Date(),
          changeFrequency: "weekly",
          priority: 0.8,
        })
      }
    }

    for (const collection of collections) {
      if (collection?.slug?.current) {
        dynamicEntries.push({
          url: `${BASE_URL}/collections/${collection.slug.current}`,
          lastModified: new Date(),
          changeFrequency: "weekly",
          priority: 0.7,
        })
      }
    }

    for (const navItem of navItems) {
      if (navItem?.slug) {
        dynamicEntries.push({
          url: `${BASE_URL}/nav/${navItem.slug}`,
          lastModified: new Date(),
          changeFrequency: "weekly",
          priority: 0.6,
        })
      }
    }
  } catch {
    // Payload unavailable — degrade to static-only sitemap
  }

  return [...STATIC_ROUTES, ...dynamicEntries]
}
