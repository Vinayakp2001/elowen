"use client"

import { Heart } from "lucide-react"
import { useWishlistStore } from "@/lib/store/wishlist"
import { cn } from "@/lib/utils"

interface WishlistToggleProps {
  sku: string
  title: string
}

export function WishlistToggle({ sku, title }: WishlistToggleProps) {
  const { toggle, has } = useWishlistStore()
  const wishlisted = has(sku)

  return (
    <button
      onClick={() => toggle(sku)}
      aria-label={wishlisted ? `Remove ${title} from wishlist` : `Add ${title} to wishlist`}
      className="flex items-center gap-2 font-sans text-[0.65rem] tracking-[0.1em] uppercase text-[#8C7B6B] hover:text-[#B8975A] transition-colors duration-200"
    >
      <Heart
        className={cn("w-4 h-4", wishlisted && "fill-[#B8975A] text-[#B8975A]")}
        strokeWidth={1.5}
      />
      {wishlisted ? "Saved" : "Save to Wishlist"}
    </button>
  )
}
