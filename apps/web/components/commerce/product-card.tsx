"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { Heart } from "lucide-react"
import { useWishlistStore } from "@/lib/store/wishlist"
import { cn } from "@/lib/utils"

interface ProductCardProps {
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

export function ProductCard({
  _id,
  title,
  slug,
  sku,
  price,
  compareAtPrice,
  images,
  isNew,
  inStock = true,
  category,
}: ProductCardProps) {
  const [hovered, setHovered] = useState(false)
  const { toggle, has } = useWishlistStore()
  const wishlisted = has(sku)

  const primaryImage = images?.[0]?.url
  const secondaryImage = images?.[1]?.url

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(p)

  return (
    <div className="group relative flex flex-col">
      {/* Image container */}
      <Link
        href={`/products/${slug.current}`}
        className="relative block overflow-hidden bg-[#F5F0E8]"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label={title}
      >
        <div className="relative aspect-square">
          {/* Primary image */}
          {primaryImage && (
            <Image
              src={primaryImage}
              alt={images[0].alt ?? title}
              fill
              className={cn(
                "object-cover object-center transition-opacity duration-300",
                hovered && secondaryImage ? "opacity-0" : "opacity-100"
              )}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            />
          )}

          {/* Secondary image — hover swap */}
          {secondaryImage && (
            <Image
              src={secondaryImage}
              alt={images[1].alt ?? title}
              fill
              className={cn(
                "object-cover object-center transition-opacity duration-300 absolute inset-0",
                hovered ? "opacity-100" : "opacity-0"
              )}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            />
          )}

          {/* Skeleton fallback */}
          {!primaryImage && <div className="w-full h-full skeleton" />}
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {isNew && (
            <span className="font-sans text-[0.6rem] tracking-[0.1em] uppercase bg-[#FDFAF5] text-[#2C2C2C] px-2 py-0.5">
              New
            </span>
          )}
          {!inStock && (
            <span className="font-sans text-[0.6rem] tracking-[0.1em] uppercase bg-[#2C2C2C] text-[#FDFAF5] px-2 py-0.5">
              Sold Out
            </span>
          )}
        </div>
      </Link>

      {/* Wishlist button */}
      <button
        onClick={() => toggle(sku)}
        aria-label={wishlisted ? `Remove ${title} from wishlist` : `Add ${title} to wishlist`}
        className="absolute top-3 right-3 text-[#8C7B6B] hover:text-[#B8975A] transition-colors duration-200"
      >
        <Heart
          className={cn("w-4 h-4", wishlisted && "fill-[#B8975A] text-[#B8975A]")}
          strokeWidth={1.5}
        />
      </button>

      {/* Info */}
      <div className="mt-3 flex flex-col gap-0.5">
        {category && (
          <p className="font-sans text-[0.6rem] tracking-[0.1em] uppercase text-[#8C7B6B]">
            {category.title}
          </p>
        )}
        <Link
          href={`/products/${slug.current}`}
          className="font-sans text-[0.8rem] text-[#2C2C2C] hover:text-[#B8975A] transition-colors duration-200 leading-snug"
        >
          {title}
        </Link>
        <div className="flex items-center gap-2">
          <span className="font-sans text-[0.8rem] text-[#2C2C2C]">
            {formatPrice(price)}
          </span>
          {compareAtPrice && compareAtPrice > price && (
            <span className="font-sans text-[0.75rem] text-[#8C7B6B] line-through">
              {formatPrice(compareAtPrice)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// Loading skeleton variant
export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <div className="aspect-square skeleton" />
      <div className="h-2.5 w-16 skeleton" />
      <div className="h-3 w-3/4 skeleton" />
      <div className="h-2.5 w-1/3 skeleton" />
    </div>
  )
}
