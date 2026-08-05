"use client"

import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface FilterDrawerProps {
  isOpen: boolean
  onClose: () => void
  materials: string[]
  selectedMaterials: string[]
  onMaterialToggle: (material: string) => void
  priceRange: [number, number]
  onPriceChange: (range: [number, number]) => void
  inStockOnly: boolean
  onInStockChange: (val: boolean) => void
  onReset: () => void
}

export function FilterDrawer({
  isOpen,
  onClose,
  materials,
  selectedMaterials,
  onMaterialToggle,
  inStockOnly,
  onInStockChange,
  onReset,
}: FilterDrawerProps) {
  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-[#2C2C2C]/30 backdrop-blur-[2px] transition-opacity duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer — slides up from bottom */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 bg-[#FDFAF5] rounded-t-lg max-h-[80vh] overflow-y-auto transition-transform duration-300 ease-in-out",
          isOpen ? "translate-y-0" : "translate-y-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Filter products"
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-8 h-0.5 bg-[#C9B99A] rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8D9C0]">
          <h2 className="font-sans text-[0.75rem] tracking-[0.1em] uppercase text-[#2C2C2C]">
            Filter
          </h2>
          <button onClick={onClose} aria-label="Close filters" className="text-[#8C7B6B]">
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>

        <div className="px-6 py-6 flex flex-col gap-8">
          {/* Materials */}
          {materials.length > 0 && (
            <div>
              <p className="font-sans text-[0.65rem] tracking-[0.12em] uppercase text-[#8C7B6B] mb-4">
                Material
              </p>
              <div className="flex flex-wrap gap-2">
                {materials.map((m) => (
                  <button
                    key={m}
                    onClick={() => onMaterialToggle(m)}
                    className={cn(
                      "font-sans text-[0.65rem] tracking-[0.08em] uppercase px-3 py-1.5 border transition-colors duration-200",
                      selectedMaterials.includes(m)
                        ? "border-[#2C2C2C] bg-[#2C2C2C] text-[#FDFAF5]"
                        : "border-[#C9B99A] text-[#2C2C2C] hover:border-[#2C2C2C]"
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Availability */}
          <div>
            <p className="font-sans text-[0.65rem] tracking-[0.12em] uppercase text-[#8C7B6B] mb-4">
              Availability
            </p>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => onInStockChange(e.target.checked)}
                className="accent-[#2C2C2C]"
              />
              <span className="font-sans text-[0.75rem] text-[#2C2C2C]">In Stock Only</span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-[#E8D9C0] flex gap-3">
          <button
            onClick={onReset}
            className="flex-1 font-sans text-[0.65rem] tracking-[0.1em] uppercase text-[#8C7B6B] border border-[#C9B99A] py-3 hover:border-[#2C2C2C] hover:text-[#2C2C2C] transition-colors duration-200"
          >
            Reset
          </button>
          <button
            onClick={onClose}
            className="flex-1 font-sans text-[0.65rem] tracking-[0.1em] uppercase bg-[#2C2C2C] text-[#FDFAF5] py-3 hover:bg-[#1A1A1A] transition-colors duration-200"
          >
            Apply
          </button>
        </div>
      </div>
    </>
  )
}
