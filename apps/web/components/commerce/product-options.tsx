"use client"

import { cn } from "@/lib/utils"

interface ProductOption {
  name: string
  values: string[]
}

interface ProductOptionsProps {
  options: ProductOption[]
  selected: Record<string, string>
  onChange: (name: string, value: string) => void
}

export function ProductOptions({ options, selected, onChange }: ProductOptionsProps) {
  if (!options?.length) return null

  return (
    <div className="flex flex-col gap-6">
      {options.map((option) => (
        <div key={option.name}>
          <p className="font-sans text-[0.65rem] tracking-[0.12em] uppercase text-[#8C7B6B] mb-3">
            {option.name}
            {selected[option.name] && (
              <span className="ml-2 text-[#2C2C2C] normal-case tracking-normal">
                — {selected[option.name]}
              </span>
            )}
          </p>
          <div className="flex flex-wrap gap-2">
            {option.values.map((value) => (
              <button
                key={value}
                onClick={() => onChange(option.name, value)}
                aria-pressed={selected[option.name] === value}
                className={cn(
                  "font-sans text-[0.65rem] tracking-[0.08em] uppercase px-4 py-2 border transition-colors duration-200",
                  selected[option.name] === value
                    ? "border-[#2C2C2C] bg-[#2C2C2C] text-[#FDFAF5]"
                    : "border-[#C9B99A] text-[#2C2C2C] hover:border-[#2C2C2C]"
                )}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
