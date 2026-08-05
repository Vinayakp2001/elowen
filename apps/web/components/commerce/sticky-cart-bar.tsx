"use client"

import { useCartStore, type CartItem } from "@/lib/store/cart"
import { useState } from "react"

interface StickyCartBarProps {
  item: CartItem
  inStock: boolean
  productTitle: string
  price: number
}

export function StickyCartBar({ item, inStock, productTitle, price }: StickyCartBarProps) {
  const [loading, setLoading] = useState(false)
  const { addItem, openCart } = useCartStore()

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(p)

  async function handleAdd() {
    if (!inStock || loading) return
    setLoading(true)
    try {
      addItem(item)
      openCart()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#FDFAF5] border-t border-[#E8D9C0] px-4 py-3 flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <p className="font-sans text-[0.7rem] text-[#2C2C2C] truncate">{productTitle}</p>
        <p className="font-sans text-[0.75rem] text-[#8C7B6B]">{formatPrice(price)}</p>
      </div>
      <button
        onClick={handleAdd}
        disabled={!inStock || loading}
        className="shrink-0 font-sans text-[0.65rem] tracking-[0.1em] uppercase px-6 py-3 bg-[#2C2C2C] text-[#FDFAF5] hover:bg-[#1A1A1A] transition-colors duration-200 disabled:bg-[#E8D9C0] disabled:text-[#8C7B6B]"
      >
        {!inStock ? "Sold Out" : loading ? "..." : "Add to Cart"}
      </button>
    </div>
  )
}
