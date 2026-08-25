import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { getAllCollections } from "@/lib/payload/queries"
import { getImageUrl } from "@/lib/payload/image"

export const revalidate = 60

export const metadata: Metadata = {
  title: "Collections",
  description: "Explore Elowen's fine jewelry collections — handcrafted luxury pieces including rings, necklaces, bracelets, and earrings. Each collection tells a unique story.",
  alternates: { canonical: "/collections" },
}

export default async function CollectionsPage() {
  const collections = (await getAllCollections().catch(() => null)) ?? []

  return (
    <div className="pt-16 min-h-screen bg-[#FDFAF5]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-16">
        <h1 className="font-serif text-[2.5rem] text-[#2C2C2C] mb-2">Collections</h1>
        <p className="font-sans text-[0.75rem] tracking-[0.08em] text-[#8C7B6B] mb-12">
          {collections.length} collections
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map(
            (col: {
              _id: string
              title: string
              slug: { current: string }
              description?: string
              heroImage?: { url?: string; alt?: string } | null
            }) => (
              <Link
                key={col._id}
                href={`/collections/${col.slug.current}`}
                className="group block"
              >
                <div className="relative aspect-[4/3] bg-[#F5F0E8] overflow-hidden">
                  {col.heroImage && (
                    <Image
                      src={getImageUrl(col.heroImage)}
                      alt={col.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  )}
                </div>
                <div className="mt-4">
                  <h2 className="font-serif text-lg text-[#2C2C2C] group-hover:text-[#B8975A] transition-colors duration-200">
                    {col.title}
                  </h2>
                  {col.description && (
                    <p className="font-sans text-[0.75rem] text-[#8C7B6B] mt-1 line-clamp-2">
                      {col.description}
                    </p>
                  )}
                </div>
              </Link>
            )
          )}
        </div>
      </div>
    </div>
  )
}
