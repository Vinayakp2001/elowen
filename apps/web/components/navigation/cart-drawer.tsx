"use client"

import Image from "next/image"
import Link from "next/link"
import { X, Minus, Plus, ShoppingBag } from "lucide-react"
import { useCartStore } from "@/lib/store/cart"
import { cn, formatPrice } from "@/lib/utils"

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, subtotal } =
    useCartStore()

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-[#2C2C2C]/30 backdrop-blur-[2px] transition-opacity duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-[#FDFAF5] flex flex-col shadow-[-4px_0_24px_rgba(44,44,44,0.08)] transition-transform duration-[350ms] ease-[cubic-bezier(0.4,0,0.2,1)]",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E8D9C0]">
          <h2 className="font-serif text-lg tracking-wide text-[#2C2C2C]">
            Your Cart
            {items.length > 0 && (
              <span className="ml-2 font-sans text-[0.75rem] text-[#8C7B6B]">
                ({items.length})
              </span>
            )}
          </h2>
          <button
            onClick={closeCart}
            aria-label="Close cart"
            className="text-[#8C7B6B] hover:text-[#2C2C2C] transition-colors duration-200"
          >
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-6 text-center">
              <ShoppingBag className="w-10 h-10 text-[#C9B99A]" strokeWidth={1} />
              <div>
                <p className="font-serif text-lg text-[#2C2C2C]">Your cart is empty</p>
                <p className="font-sans text-[0.875rem] text-[#8C7B6B] mt-1">
                  Discover pieces made to be cherished.
                </p>
              </div>
              <button
                onClick={closeCart}
                className="btn-ghost text-[0.7rem] tracking-[0.12em]"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <ul className="flex flex-col divide-y divide-[#E8D9C0]">
              {items.map((item) => (
                <li
                  key={`${item.sku}-${item.variantKey}`}
                  className="flex gap-4 py-5"
                >
                  {/* Image */}
                  <div className="relative w-20 h-20 bg-[#F5F0E8] shrink-0">
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={item.productTitle}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-sans text-[0.8rem] text-[#2C2C2C] leading-snug">
                      {item.productTitle}
                    </p>
                    {item.variantKey && (
                      <p className="font-sans text-[0.7rem] text-[#8C7B6B] mt-0.5 capitalize">
                        {item.variantKey.replace(/-/g, " ")}
                      </p>
                    )}
                    <p className="font-sans text-[0.8rem] text-[#2C2C2C] mt-1">
                      {formatPrice(item.unitPrice * item.quantity)}
                    </p>

                    {/* Qty controls */}
                    <div className="flex items-center gap-3 mt-2">
                      <button
                        onClick={() =>
                          updateQuantity(item.sku, item.variantKey, item.quantity - 1)
                        }
                        aria-label="Decrease quantity"
                        className="text-[#8C7B6B] hover:text-[#2C2C2C] transition-colors duration-200"
                      >
                        <Minus className="w-3 h-3" strokeWidth={1.5} />
                      </button>
                      <span className="font-sans text-[0.75rem] text-[#2C2C2C] w-4 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.sku, item.variantKey, item.quantity + 1)
                        }
                        aria-label="Increase quantity"
                        className="text-[#8C7B6B] hover:text-[#2C2C2C] transition-colors duration-200"
                      >
                        <Plus className="w-3 h-3" strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeItem(item.sku, item.variantKey)}
                    aria-label={`Remove ${item.productTitle}`}
                    className="text-[#C9B99A] hover:text-[#2C2C2C] transition-colors duration-200 self-start mt-1"
                  >
                    <X className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-6 border-t border-[#E8D9C0] flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="font-sans text-[0.75rem] tracking-[0.08em] uppercase text-[#8C7B6B]">
                Subtotal
              </span>
              <span className="font-serif text-lg text-[#2C2C2C]">
                {formatPrice(subtotal())}
              </span>
            </div>
            <p className="font-sans text-[0.7rem] text-[#8C7B6B]">
              Shipping and taxes calculated at checkout.
            </p>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="btn-primary w-full text-center"
            >
              Proceed to Checkout
            </Link>
            <button
              onClick={closeCart}
              className="btn-ghost w-full text-center text-[0.7rem]"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  )
}
