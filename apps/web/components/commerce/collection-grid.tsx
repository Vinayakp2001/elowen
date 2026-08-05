"use client"

import { useState, useMemo } from "react"
import { ProductCard, ProductCardSkeleton } from "@/components/commerce/product-card"
import { FilterBar, type SortOption } from "@/components/commerce/filter-bar"
import { FilterDrawer } from "@/components/commerce/filter-drawer"

const PAGE_SIZE = 10

const CATEGORY_TABS = [
  "All Products",
  "New Arrivals",
  "Best Sellers",
  "Rings",
  "Necklaces",
  "Earrings",
]

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
  materials?: string[]
  category?: { title: string }
}

interface CollectionGridProps {
  products: Product[]
}

export function CollectionGrid({ products }: CollectionGridProps) {
  const [sort, setSort] = useState<SortOption>("featured")
  const [filterOpen, setFilterOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("All Products")
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([])
  const [inStockOnly, setInStockOnly] = useState(false)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  // Collect all unique materials
  const allMaterials = useMemo(() => {
    const set = new Set<string>()
    products.forEach((p) => p.materials?.forEach((m) => set.add(m)))
    return Array.from(set)
  }, [products])

  const filtered = useMemo(() => {
    let result = [...products]

    // Tab filter
    if (activeTab !== "All Products") {
      if (activeTab === "New Arrivals") result = result.filter((p) => p.isNew)
      else result = result.filter((p) => p.category?.title === activeTab)
    }

    // Material filter
    if (selectedMaterials.length > 0) {
      result = result.filter((p) =>
        p.materials?.some((m) => selectedMaterials.includes(m))
      )
    }

    // Stock filter
    if (inStockOnly) result = result.filter((p) => p.inStock !== false)

    // Sort
    if (sort === "price-asc") result.sort((a, b) => a.price - b.price)
    else if (sort === "price-desc") result.sort((a, b) => b.price - a.price)
    else if (sort === "newest") result.sort((a, b) => (a.isNew ? -1 : 1) - (b.isNew ? -1 : 1))

    return result
  }, [products, activeTab, selectedMaterials, inStockOnly, sort])

  const visible = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length

  function toggleMaterial(m: string) {
    setSelectedMaterials((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]
    )
  }

  function resetFilters() {
    setSelectedMaterials([])
    setInStockOnly(false)
  }

  return (
    <div className="bg-[#FDFAF5]">
      <FilterBar
        productCount={filtered.length}
        sort={sort}
        onSortChange={setSort}
        onFilterOpen={() => setFilterOpen(true)}
        categoryTabs={CATEGORY_TABS}
        activeTab={activeTab}
        onTabChange={(tab) => { setActiveTab(tab); setVisibleCount(PAGE_SIZE) }}
      />

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-10">
        {visible.length === 0 ? (
          <div className="py-20 text-center">
            <p className="font-serif text-lg text-[#8C7B6B]">No pieces found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {visible.map((product) => (
              <ProductCard key={product._id} {...product} />
            ))}
          </div>
        )}

        {hasMore && (
          <div className="flex justify-center mt-12">
            <button
              onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
              className="font-sans text-[0.65rem] tracking-[0.12em] uppercase text-[#2C2C2C] border-b border-[#2C2C2C] hover:text-[#B8975A] hover:border-[#B8975A] pb-0.5 transition-colors duration-200"
            >
              Load More
            </button>
          </div>
        )}
      </div>

      <FilterDrawer
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
        materials={allMaterials}
        selectedMaterials={selectedMaterials}
        onMaterialToggle={toggleMaterial}
        priceRange={[0, 10000]}
        onPriceChange={() => {}}
        inStockOnly={inStockOnly}
        onInStockChange={setInStockOnly}
        onReset={resetFilters}
      />
    </div>
  )
}

export function CollectionGridSkeleton() {
  return (
    <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-10">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
        {Array.from({ length: 10 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
