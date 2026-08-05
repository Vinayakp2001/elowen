import Image from "next/image"
import Link from "next/link"

interface SignatureProduct {
  _id: string
  title: string
  slug: { current: string }
  price: number
  images: Array<{ url: string; alt?: string }>
  category?: { title: string }
}

interface SignatureCollectionProps {
  products: SignatureProduct[]
}

export function SignatureCollection({ products }: SignatureCollectionProps) {
  if (!products?.length) return null

  const [featured, ...rest] = products.slice(0, 3)

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(p)

  return (
    <section className="w-full py-16 md:py-20 bg-[#F5F0E8]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        <p className="font-sans text-[0.65rem] tracking-[0.15em] uppercase text-[#8C7B6B] mb-8">
          Signature Pieces
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Large featured image — left */}
          {featured && (
            <Link
              href={`/products/${featured.slug.current}`}
              className="group relative block"
            >
              <div className="relative aspect-[3/4] bg-[#E8D9C0] overflow-hidden">
                {featured.images?.[0]?.url && (
                  <Image
                    src={featured.images[0].url}
                    alt={featured.images[0].alt ?? featured.title}
                    fill
                    className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.02]"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                )}
              </div>
              <div className="mt-4">
                {featured.category && (
                  <p className="font-sans text-[0.65rem] tracking-[0.1em] uppercase text-[#8C7B6B]">
                    {featured.category.title}
                  </p>
                )}
                <p className="font-serif text-lg text-[#2C2C2C] mt-1">{featured.title}</p>
                <p className="font-sans text-[0.8rem] text-[#8C7B6B] mt-0.5">{formatPrice(featured.price)}</p>
              </div>
            </Link>
          )}

          {/* Right column — 2 stacked cards */}
          <div className="flex flex-col gap-4 md:gap-6">
            {rest.map((product) => (
              <Link
                key={product._id}
                href={`/products/${product.slug.current}`}
                className="group flex gap-4 items-start"
              >
                <div className="relative w-32 md:w-40 aspect-square bg-[#E8D9C0] shrink-0 overflow-hidden">
                  {product.images?.[0]?.url && (
                    <Image
                      src={product.images[0].url}
                      alt={product.images[0].alt ?? product.title}
                      fill
                      className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
                      sizes="160px"
                    />
                  )}
                </div>
                <div className="pt-2">
                  {product.category && (
                    <p className="font-sans text-[0.65rem] tracking-[0.1em] uppercase text-[#8C7B6B]">
                      {product.category.title}
                    </p>
                  )}
                  <p className="font-serif text-base text-[#2C2C2C] mt-1 group-hover:text-[#B8975A] transition-colors duration-200">
                    {product.title}
                  </p>
                  <p className="font-sans text-[0.8rem] text-[#8C7B6B] mt-0.5">{formatPrice(product.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
