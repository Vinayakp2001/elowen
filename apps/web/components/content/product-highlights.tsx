import Link from "next/link"
import { ProductCard } from "@/components/commerce/product-card"

interface Product {
  _id: string
  title: string
  slug: { current: string }
  sku: string
  price: number
  compareAtPrice?: number
  images: Array<{ url: string; alt?: string }>
  isNew?: boolean
  inStock?: boolean
  category?: { title: string }
}

interface ProductHighlightsProps {
  products: Product[]
  sectionTitle?: string
}

export function ProductHighlights({
  products,
  sectionTitle = "Featured Pieces",
}: ProductHighlightsProps) {
  if (!products?.length) return null

  return (
    <section className="w-full py-16 md:py-20 bg-[#FDFAF5]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        {/* Header row */}
        <div className="flex items-end justify-between mb-8">
          <p className="font-sans text-[0.65rem] tracking-[0.15em] uppercase text-[#8C7B6B]">
            {sectionTitle}
          </p>
          <Link
            href="/collections/all"
            className="font-sans text-[0.65rem] tracking-[0.12em] uppercase text-[#2C2C2C] border-b border-[#2C2C2C] hover:text-[#B8975A] hover:border-[#B8975A] pb-0.5 transition-colors duration-200"
          >
            View All
          </Link>
        </div>

        {/* 5-col grid matching ÉRICE reference */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {products.slice(0, 5).map((product) => (
            <ProductCard key={product._id} {...product} />
          ))}
        </div>
      </div>
    </section>
  )
}
