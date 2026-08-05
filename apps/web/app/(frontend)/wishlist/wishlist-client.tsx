"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Heart } from "lucide-react"
import { useWishlistStore } from "@/lib/store/wishlist"
import { useCartStore } from "@/lib/store/cart"

interface ProductData {
  sku: string
  title: string
  price: number
  imageUrl: string
  slug: string
}

export function WishlistClient() {
  const { items, toggle } = useWishlistStore()
  const { addItem, openCart } = useCartStore()
  const [products, setProducts] = useState<Record<string, ProductData>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (items.length === 0) return
    setLoading(true)
    fetch(`/api/products-by-skus?skus=${items.join(",")}`)
      .then((r) => r.json())
      .then((data: ProductData[]) => {
        const map: Record<string, ProductData> = {}
        data.forEach((p) => { map[p.sku] = p })
        setProducts(map)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [items])

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(p)

  return (
    <div className="pt-16 min-h-screen bg-[#FDFAF5]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-16">
        <h1 className="font-serif text-[2.5rem] text-[#2C2C2C] mb-2">Wishlist</h1>
        <p className="font-sans text-[0.75rem] tracking-[0.08em] text-[#8C7B6B] mb-12">
          {items.length} {items.length === 1 ? "piece" : "pieces"} saved
        </p>

        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-6 py-20 text-center">
            <Heart className="w-10 h-10 text-[#C9B99A]" strokeWidth={1} />
            <div>
              <p className="font-serif text-lg text-[#2C2C2C]">Your wishlist is empty</p>
              <p className="font-sans text-[0.875rem] text-[#8C7B6B] mt-1">
                Save pieces you love to revisit them later.
              </p>
            </div>
            <Link
              href="/collections"
              className="font-sans text-[0.7rem] tracking-[0.12em] uppercase text-[#2C2C2C] border-b border-[#2C2C2C] hover:text-[#B8975A] hover:border-[#B8975A] pb-0.5 transition-colors duration-200"
            >
              Explore Collections
            </Link>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {items.map((sku) => (
              <div key={sku} className="flex flex-col gap-3">
                <div className="aspect-square bg-[#F5F0E8] animate-pulse" />
                <div className="h-4 bg-[#F5F0E8] animate-pulse w-3/4" />
                <div className="h-4 bg-[#F5F0E8] animate-pulse w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {items.map((sku) => {
              const product = products[sku]
              return (
                <div key={sku} className="flex flex-col gap-3">
                  <div className="relative aspect-square bg-[#F5F0E8] overflow-hidden group">
                    {product?.imageUrl ? (
                      <Link href={`/products/${product.slug}`}>
                        <Image
                          src={product.imageUrl}
                          alt={product.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                          sizes="(max-width: 640px) 50vw, 20vw"
                        />
                      </Link>
                    ) : null}
                    <button
                      onClick={() => toggle(sku)}
                      aria-label="Remove from wishlist"
                      className="absolute top-2 right-2 z-10 text-[#B8975A] hover:text-[#8C7B6B] transition-colors duration-200"
                    >
                      <Heart className="w-4 h-4 fill-[#B8975A]" strokeWidth={1.5} />
                    </button>
                  </div>

                  {product ? (
                    <>
                      <Link href={`/products/${product.slug}`} className="group">
                        <p className="font-sans text-[0.8rem] text-[#2C2C2C] leading-snug group-hover:text-[#B8975A] transition-colors duration-200 truncate">
                          {product.title}
                        </p>
                        <p className="font-sans text-[0.75rem] text-[#8C7B6B] mt-0.5">
                          {formatPrice(product.price)}
                        </p>
                      </Link>
                      <button
                        onClick={() => {
                          addItem({
                            sku,
                            variantKey: "",
                            productTitle: product.title,
                            image: product.imageUrl,
                            quantity: 1,
                            unitPrice: product.price,
                          })
                          openCart()
                        }}
                        className="font-sans text-[0.65rem] tracking-[0.1em] uppercase text-[#2C2C2C] border border-[#2C2C2C] py-2 hover:bg-[#2C2C2C] hover:text-[#FDFAF5] transition-colors duration-200"
                      >
                        Add to Cart
                      </button>
                    </>
                  ) : (
                    <p className="font-sans text-[0.75rem] text-[#8C7B6B] truncate">{sku}</p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
