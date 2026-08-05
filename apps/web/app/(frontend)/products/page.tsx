import type { Metadata } from "next"
import { getAllProducts } from "@/lib/payload/queries"
import { CollectionGrid } from "@/components/commerce/collection-grid"

export const revalidate = 60

export const metadata: Metadata = {
  title: "Shop All",
  description: "Browse all Elowen fine jewelry.",
  alternates: { canonical: "/products" },
}

export default async function ProductsPage() {
  const products = (await getAllProducts().catch(() => null)) ?? []

  return (
    <div className="pt-16 min-h-screen bg-[#FDFAF5]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-16">
        <h1 className="font-serif text-[2.5rem] text-[#2C2C2C] mb-2">Shop All</h1>
        <p className="font-sans text-[0.75rem] tracking-[0.08em] text-[#8C7B6B] mb-12">
          {products.length} {products.length === 1 ? "piece" : "pieces"}
        </p>
        <CollectionGrid products={products} />
      </div>
    </div>
  )
}
