import type { Metadata } from "next"
import { getCollectionBySlug } from "@/lib/payload/queries"
import { getImageUrl } from "@/lib/payload/image"
import { CollectionHero } from "@/components/content/collection-hero"
import { CollectionGrid } from "@/components/commerce/collection-grid"

export const revalidate = 60

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const collection = await getCollectionBySlug(slug).catch(() => null)
  const title = collection?.title ?? slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  return {
    title,
    description: collection?.description,
    openGraph: { title, description: collection?.description },
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

  return (
    <div className="pt-16">
      <CollectionHero
        title={collection.title}
        description={collection.description}
        imageUrl={heroImageUrl}
      />
      <CollectionGrid products={collection.products ?? []} />
    </div>
  )
}
