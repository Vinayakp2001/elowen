"use client"

import { useState } from "react"
import { Plus, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

interface AccordionItem {
  title: string
  content: string | React.ReactNode
}

interface EditorialAccordionProps {
  items: AccordionItem[]
}

export function EditorialAccordion({ items }: EditorialAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="flex flex-col border-t border-[#E8D9C0]">
      {items.map((item, i) => (
        <div key={i} className="border-b border-[#E8D9C0]">
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            aria-expanded={openIndex === i}
            className="flex items-center justify-between w-full py-4 text-left"
          >
            <span className="font-sans text-[0.7rem] tracking-[0.12em] uppercase text-[#2C2C2C]">
              {item.title}
            </span>
            {openIndex === i ? (
              <Minus className="w-3.5 h-3.5 text-[#8C7B6B] shrink-0" strokeWidth={1.5} />
            ) : (
              <Plus className="w-3.5 h-3.5 text-[#8C7B6B] shrink-0" strokeWidth={1.5} />
            )}
          </button>
          <div
            className={cn(
              "overflow-hidden transition-all duration-300",
              openIndex === i ? "max-h-96 pb-4" : "max-h-0"
            )}
          >
            {typeof item.content === "string" ? (
              <p className="font-sans text-[0.8rem] text-[#8C7B6B] leading-relaxed">
                {item.content}
              </p>
            ) : (
              item.content
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
