import { ProductCard } from "@/components/commerce/product-card"

interface Product {
  _id: string
  title: string
  slug: { current: string }
  sku: string
  price: number
  compareAtPrice?: number
  images: Array<{ asset: { url: string }; alt?: string }>
  isNew?: boolean
  inStock?: boolean
  category?: { title: string }
}

interface RelatedProductsProps {
  products: Product[]
}

export function RelatedProducts({ products }: RelatedProductsProps) {
  if (!products?.length) return null

  return (
    <section className="w-full py-16 bg-[#FDFAF5] border-t border-[#E8D9C0]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        <p className="font-sans text-[0.65rem] tracking-[0.15em] uppercase text-[#8C7B6B] mb-8">
          You May Also Like
        </p>
        <div className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-none pb-2">
          {products.slice(0, 4).map((product) => (
            <div key={product._id} className="w-48 md:w-56 shrink-0">
              <ProductCard {...product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
