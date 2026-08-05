"use client"

import { SlidersHorizontal } from "lucide-react"

export type SortOption = "featured" | "price-asc" | "price-desc" | "newest"

interface FilterBarProps {
  productCount: number
  sort: SortOption
  onSortChange: (sort: SortOption) => void
  onFilterOpen: () => void
  categoryTabs?: string[]
  activeTab?: string
  onTabChange?: (tab: string) => void
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
]

export function FilterBar({
  productCount,
  sort,
  onSortChange,
  onFilterOpen,
  categoryTabs,
  activeTab,
  onTabChange,
}: FilterBarProps) {
  return (
    <div className="w-full border-b border-[#E8D9C0] bg-[#FDFAF5]">
      {/* Category tabs — matching ÉRICE reference */}
      {categoryTabs && categoryTabs.length > 0 && (
        <div className="max-w-[1440px] mx-auto px-6 md:px-12">
          <div className="flex items-center gap-6 overflow-x-auto scrollbar-none py-3 border-b border-[#E8D9C0]">
            {categoryTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => onTabChange?.(tab)}
                className={`font-sans text-[0.65rem] tracking-[0.1em] uppercase whitespace-nowrap pb-2 border-b-2 transition-colors duration-200 ${
                  activeTab === tab
                    ? "border-[#2C2C2C] text-[#2C2C2C]"
                    : "border-transparent text-[#8C7B6B] hover:text-[#2C2C2C]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Count + sort row */}
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-3 flex items-center justify-between">
        <p className="font-sans text-[0.7rem] tracking-[0.08em] text-[#8C7B6B]">
          {productCount} {productCount === 1 ? "product" : "products"}
        </p>

        <div className="flex items-center gap-4">
          {/* Mobile filter button */}
          <button
            onClick={onFilterOpen}
            className="md:hidden flex items-center gap-1.5 font-sans text-[0.65rem] tracking-[0.1em] uppercase text-[#2C2C2C]"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" strokeWidth={1.5} />
            Filter
          </button>

          {/* Sort select */}
          <div className="flex items-center gap-2">
            <span className="font-sans text-[0.65rem] tracking-[0.08em] text-[#8C7B6B] hidden md:block">
              Sort By:
            </span>
            <select
              value={sort}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="bg-transparent font-sans text-[0.65rem] tracking-[0.08em] text-[#2C2C2C] outline-none cursor-pointer"
              aria-label="Sort products"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
