"use client"

import { useState } from "react"
import { ProductOptions } from "@/components/commerce/product-options"
import { AddToCartButton } from "@/components/commerce/add-to-cart-button"
import { WishlistToggle } from "@/components/commerce/wishlist-toggle"
import { EditorialAccordion } from "@/components/commerce/editorial-accordion"
import { RichText } from "@/components/ui/rich-text"
import { formatPrice } from "@/lib/utils"

interface Product {
  _id: string
  title: string
  sku: string
  price: number
  compareAtPrice?: number
  inStock: boolean
  isNew?: boolean
  materials?: string[]
  options?: Array<{ name: string; values: string[] }>
  // Lexical JSON from Payload
  description?: Record<string, unknown>
  craftsmanship?: Record<string, unknown>
  images: Array<{ url: string; alt?: string }>
  category?: { title: string }
}

export function ProductInfoPanel({ product }: { product: Product }) {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})

  const variantKey = Object.entries(selectedOptions)
    .map(([, v]) => v.toLowerCase().replace(/\s+/g, "-"))
    .join("-")

  const accordionItems = [
    ...(product.description
      ? [{ title: "Product Story", content: <RichText content={product.description} /> }]
      : []),
    ...(product.craftsmanship
      ? [{ title: "Materials & Craftsmanship", content: <RichText content={product.craftsmanship} /> }]
      : []),
    ...(product.materials?.length
      ? [{ title: "Materials", content: product.materials.join(", ") }]
      : []),
    {
      title: "Shipping & Returns",
      content:
        "Complimentary shipping on all orders. Returns accepted within 14 days of delivery in original condition.",
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Category */}
      {product.category && (
        <p className="font-sans text-[0.65rem] tracking-[0.12em] uppercase text-[#8C7B6B]">
          {product.category.title}
        </p>
      )}

      {/* Title */}
      <h1 className="font-serif text-[2rem] md:text-[2.5rem] leading-[1.2] text-[#2C2C2C]">
        {product.title}
      </h1>

      {/* Price */}
      <div className="flex items-center gap-3">
        <span className="font-sans text-lg text-[#2C2C2C]">{formatPrice(product.price)}</span>
        {product.compareAtPrice && product.compareAtPrice > product.price && (
          <span className="font-sans text-[0.875rem] text-[#8C7B6B] line-through">
            {formatPrice(product.compareAtPrice)}
          </span>
        )}
        {product.isNew && (
          <span className="font-sans text-[0.6rem] tracking-[0.1em] uppercase bg-[#F5F0E8] text-[#8C7B6B] px-2 py-0.5">
            New
          </span>
        )}
      </div>

      {/* Options */}
      {product.options && product.options.length > 0 && (
        <ProductOptions
          options={product.options}
          selected={selectedOptions}
          onChange={(name, value) =>
            setSelectedOptions((prev) => ({ ...prev, [name]: value }))
          }
        />
      )}

      {/* Add to cart */}
      <AddToCartButton
        item={{
          sku: product.sku,
          variantKey,
          productTitle: product.title,
          image: product.images?.[0]?.url ?? "",
          quantity: 1,
          unitPrice: product.price,
        }}
        inStock={product.inStock}
      />

      {/* Wishlist */}
      <WishlistToggle sku={product.sku} title={product.title} />

      {/* Accordion */}
      {accordionItems.length > 0 && (
        <EditorialAccordion items={accordionItems} />
      )}
    </div>
  )
}
