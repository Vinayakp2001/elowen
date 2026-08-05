"use client"

import { useState } from "react"
import { useCartStore, type CartItem } from "@/lib/store/cart"
import { cn } from "@/lib/utils"

interface AddToCartButtonProps {
  item: CartItem
  inStock: boolean
  className?: string
}

export function AddToCartButton({ item, inStock, className }: AddToCartButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { addItem, openCart } = useCartStore()

  async function handleAddToCart() {
    if (!inStock || loading) return
    setLoading(true)
    setError(null)

    try {
      // Validate stock with FastAPI
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      if (apiUrl) {
        const res = await fetch(`${apiUrl}/cart/validate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: [
              {
                sku: item.sku,
                variant_key: item.variantKey,
                quantity: item.quantity,
                unit_price: item.unitPrice,
              },
            ],
          }),
        })
        if (res.ok) {
          const data = await res.json()
          const validated = data.items?.[0]
          if (!validated?.available) {
            setError("This item is currently out of stock.")
            return
          }
        }
      }

      addItem(item)
      openCart()
    } catch {
      // If API is unavailable, add to cart optimistically
      addItem(item)
      openCart()
    } finally {
      setLoading(false)
    }
  }

  if (!inStock) {
    return (
      <button
        disabled
        className={cn(
          "w-full font-sans text-[0.75rem] tracking-[0.1em] uppercase py-4 bg-[#E8D9C0] text-[#8C7B6B] cursor-not-allowed",
          className
        )}
      >
        Sold Out
      </button>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleAddToCart}
        disabled={loading}
        className={cn(
          "w-full font-sans text-[0.75rem] tracking-[0.1em] uppercase py-4 bg-[#2C2C2C] text-[#FDFAF5] hover:bg-[#1A1A1A] transition-colors duration-200 disabled:opacity-60",
          className
        )}
      >
        {loading ? "Adding..." : "Add to Cart"}
      </button>
      {error && (
        <p className="font-sans text-[0.7rem] text-red-500 text-center">{error}</p>
      )}
    </div>
  )
}
