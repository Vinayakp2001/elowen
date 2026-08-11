import { getPayload } from "payload"
import config from "@payload-config"
import { getImageUrl } from "./image"

// ---------------------------------------------------------------------------
// Shared image shape that components expect
// ---------------------------------------------------------------------------
interface ImageShape {
  url: string
  alt?: string
}

// ---------------------------------------------------------------------------
// Transform helpers
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformImage(img: any): ImageShape | undefined {
  if (!img) return undefined
  return { url: getImageUrl(img), alt: img.alt ?? undefined }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformProductCard(doc: any) {
  if (!doc) return null
  return {
    _id: String(doc.id),
    id: String(doc.id),
    title: doc.title as string,
    slug: { current: doc.slug as string },
    sku: (doc.sku as string) ?? "",
    price: doc.price as number,
    compareAtPrice: doc.compareAtPrice as number | undefined,
    inStock: doc.inStock as boolean,
    isNew: doc.isNew as boolean | undefined,
    isFeatured: doc.isFeatured as boolean | undefined,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    images: ((doc.images as any[]) ?? []).map((img: any) => ({
      url: getImageUrl(img),
      alt: img?.alt ?? undefined,
    })).filter((img) => !!img.url),
    category: doc.category
      ? { title: doc.category.title as string, slug: { current: doc.category.slug as string } }
      : undefined,
  }
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export async function getAllProducts() {
  try {
    const payload = await getPayload({ config })
    const { docs } = await payload.find({
      collection: "products",
      depth: 2,
      sort: "-createdAt",
      limit: 100,
    })
    return docs.map(transformProductCard).filter(Boolean)
  } catch {
    return []
  }
}

export async function getProductsBySkus(skus: string[]) {
  if (!skus.length) return []
  try {
    const payload = await getPayload({ config })
    const { docs } = await payload.find({
      collection: "products",
      where: { sku: { in: skus } },
      depth: 2,
      limit: skus.length,
    })
    return docs.map(transformProductCard).filter(Boolean)
  } catch {
    return []
  }
}

export async function getHomepageSettings() {
  try {
    const payload = await getPayload({ config })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const settings = await payload.findGlobal({ slug: "homepage-settings", depth: 2 }) as any

    const hero = settings.hero
      ? {
          headline: settings.hero.headline as string | undefined,
          subline: settings.hero.subline as string | undefined,
          ctaLabel: settings.hero.ctaLabel as string | undefined,
          ctaHref: settings.hero.ctaHref as string | undefined,
          image: transformImage(settings.hero.image),
        }
      : undefined

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const featuredCategories = ((settings.featuredCategories as any[]) ?? []).map((cat: any) => ({
      _id: String(cat.id),
      title: cat.title as string,
      slug: { current: cat.slug as string },
      image: transformImage(cat.image),
    }))

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const signatureProducts = ((settings.signatureProducts as any[]) ?? [])
      .map(transformProductCard)
      .filter(Boolean)

    const banner = settings.campaignBanner
    const campaignBanner = banner
      ? {
          headline: banner.headline as string | undefined,
          ctaLabel: banner.ctaLabel as string | undefined,
          ctaHref: banner.ctaHref as string | undefined,
          image: transformImage(banner.image),
        }
      : undefined

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const featuredProducts = ((settings.featuredProducts as any[]) ?? [])
      .map(transformProductCard)
      .filter(Boolean)

    const story = settings.brandStory
    const brandStory = story
      ? {
          headline: story.headline as string | undefined,
          image: transformImage(story.image),
          // Expose Lexical JSON directly for RichText component
          body: story.body,
        }
      : undefined

    return {
      hero,
      featuredCategories,
      signatureProducts,
      campaignBanner,
      featuredProducts,
      brandStory,
      newsletterHeadline: settings.newsletterHeadline as string | undefined,
    }
  } catch {
    return null
  }
}

export async function getProductBySlug(slug: string) {
  try {
    const payload = await getPayload({ config })
    const { docs } = await payload.find({
      collection: "products",
      where: { slug: { equals: slug } },
      depth: 2,
      limit: 1,
    })
    if (!docs[0]) return null
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const doc = docs[0] as any
    const base = transformProductCard(doc)
    return {
      ...base,
      materials: doc.materials
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ? (doc.materials as any[]).map((m: any) => m.material as string)
        : [],
      options: doc.options
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ? (doc.options as any[]).map((o: any) => ({
            name: o.name as string,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            values: ((o.values as any[]) ?? []).map((v: any) => v.value as string),
          }))
        : [],
      // Lexical JSON — passed to <RichText> component
      description: doc.description,
      craftsmanship: doc.craftsmanship,
      collection: doc.collection
        ? { title: doc.collection.title as string, slug: { current: doc.collection.slug as string } }
        : undefined,
      related: [],
    }
  } catch {
    return null
  }
}

export async function getFeaturedProducts() {
  try {
    const payload = await getPayload({ config })
    const { docs } = await payload.find({
      collection: "products",
      where: { isFeatured: { equals: true } },
      limit: 6,
      depth: 2,
    })
    return docs.map(transformProductCard).filter(Boolean)
  } catch {
    return []
  }
}

export async function getAllCollections() {
  try {
    const payload = await getPayload({ config })
    const { docs } = await payload.find({
      collection: "collections",
      depth: 1,
      sort: "-createdAt",
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return docs.map((doc: any) => ({
      _id: String(doc.id),
      title: doc.title as string,
      slug: { current: doc.slug as string },
      description: doc.description as string | undefined,
      heroImage: transformImage(doc.heroImage),
    }))
  } catch {
    return []
  }
}

export async function getCollectionBySlug(slug: string) {
  try {
    const payload = await getPayload({ config })
    const { docs } = await payload.find({
      collection: "collections",
      where: { slug: { equals: slug } },
      depth: 2,
      limit: 1,
    })
    if (!docs[0]) return null
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const doc = docs[0] as any
    return {
      _id: String(doc.id),
      title: doc.title as string,
      slug: { current: doc.slug as string },
      description: doc.description as string | undefined,
      heroImage: transformImage(doc.heroImage),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      products: ((doc.products as any[]) ?? []).map(transformProductCard).filter((p): p is NonNullable<ReturnType<typeof transformProductCard>> => p !== null),
    }
  } catch {
    return null
  }
}

export async function getPolicyBySlug(slug: string) {
  try {
    const payload = await getPayload({ config })
    const { docs } = await payload.find({
      collection: "policies",
      where: { slug: { equals: slug } },
      limit: 1,
    })
    if (!docs[0]) return null
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const doc = docs[0] as any
    return {
      title: doc.title as string,
      slug: { current: doc.slug as string },
      body: doc.body, // Lexical JSON
    }
  } catch {
    return null
  }
}

export async function getAllPolicySlugs() {
  try {
    const payload = await getPayload({ config })
    const { docs } = await payload.find({ collection: "policies", depth: 0 })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return docs.map((doc: any) => ({ slug: doc.slug as string }))
  } catch {
    return []
  }
}

export async function getNavItems() {
  try {
    const payload = await getPayload({ config })
    const { docs } = await payload.find({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      collection: "nav-items" as any,
      depth: 0,
      sort: "order",
      limit: 50,
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (docs as any[]).map((doc: any) => ({
      id: String(doc.id),
      label: doc.label as string,
      slug: doc.slug as string,
      order: (doc.order as number) ?? 0,
    }))
  } catch {
    return []
  }
}

export async function getProductsByNavSlug(navSlug: string) {
  try {
    const payload = await getPayload({ config })
    // Find the nav item by slug, with products populated
    const { docs: navDocs } = await payload.find({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      collection: "nav-items" as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      where: { slug: { equals: navSlug } } as any,
      limit: 1,
      depth: 2, // populates the products relationship
    })
    if (!navDocs[0]) return null
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const navItem = navDocs[0] as any
    return {
      navItem: { id: String(navItem.id), label: navItem.label as string, slug: navItem.slug as string },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      products: ((navItem.products as any[]) ?? []).map(transformProductCard).filter(Boolean),
    }
  } catch {
    return null
  }
}

export async function getAllCategories() {
  try {
    const payload = await getPayload({ config })
    const { docs } = await payload.find({
      collection: "categories",
      depth: 1,
      sort: "title",
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return docs.map((doc: any) => ({
      _id: String(doc.id),
      title: doc.title as string,
      slug: { current: doc.slug as string },
      image: transformImage(doc.image),
    }))
  } catch {
    return []
  }
}
