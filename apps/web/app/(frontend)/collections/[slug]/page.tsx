import type { Metadata } from "next"
import { getCollectionBySlug } from "@/lib/payload/queries"
import { getImageUrl } from "@/lib/payload/image"
import { absoluteUrl, defaultOgImage } from "@/lib/seo"
import { CollectionHero } from "@/components/content/collection-hero"
import { CollectionGrid } from "@/components/commerce/collection-grid"

export const revalidate = 60

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const collection = await getCollectionBySlug(slug).catch(() => null)
  const label = collection?.title ?? slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  const title = `${label} Collection — Elowen`
  const description =
    collection?.description?.trim() ||
    `Discover the ${label} collection — handcrafted fine jewelry by Elowen.`

  const heroImage = collection?.heroImage ? getImageUrl(collection.heroImage) : null
  const ogImages = heroImage
    ? [{ url: absoluteUrl(heroImage), width: 1200, height: 630, alt: label }]
    : [defaultOgImage()]

  return {
    title,
    description,
    alternates: { canonical: `/collections/${slug}` },
    openGraph: { title, description, images: ogImages },
  }
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params
  const collection = await getCollectionBySlug(slug).catch(() => null)

  // No CMS collection for this slug — show a graceful "coming soon" state
  if (!collection) {
    const label = slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    return (
      <div className="pt-16 min-h-screen bg-[#FDFAF5]">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-24 flex flex-col items-center text-center gap-6">
          <p className="font-sans text-[0.65rem] tracking-[0.2em] uppercase text-[#C9B99A]">
            Coming Soon
          </p>
          <h1 className="font-serif text-[2.5rem] text-[#2C2C2C] leading-[1.2]">
            {label}
          </h1>
          <p className="font-sans text-[0.875rem] text-[#8C7B6B] leading-relaxed max-w-sm">
            We&apos;re curating something special for this collection. Check back soon.
          </p>
        </div>
      </div>
    )
  }

  const heroImageUrl = collection.heroImage
    ? getImageUrl(collection.heroImage)
    : undefined

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Collections", item: absoluteUrl("/collections") },
      { "@type": "ListItem", position: 3, name: collection.title, item: absoluteUrl(`/collections/${slug}`) },
    ],
  }

  return (
    <div className="pt-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <CollectionHero
        title={collection.title}
        description={collection.description}
        imageUrl={heroImageUrl}
      />
      <CollectionGrid products={collection.products ?? []} />
    </div>
  )
}
