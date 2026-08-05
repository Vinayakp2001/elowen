"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { X, Search } from "lucide-react"
import { cn } from "@/lib/utils"

interface SearchResult {
  type: "product" | "collection"
  title: string
  slug: string
  imageUrl?: string
  price?: number
}

interface SearchOverlayProps {
  isOpen: boolean
  onClose: () => void
}

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
      setQuery("")
      setResults([])
    }
    return () => { document.body.style.overflow = "" }
  }, [isOpen])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length < 2) {
      setResults([])
      return
    }
    const timeout = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(trimmed)}`
        )
        const data = await res.json()
        setResults(data)
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timeout)
  }, [query])

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(p)

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 bg-[#FDFAF5]/98 backdrop-blur-sm flex flex-col transition-opacity duration-300",
        isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      )}
      role="dialog"
      aria-modal="true"
      aria-label="Search"
    >
      <div className="flex items-center justify-end px-6 md:px-12 h-16 border-b border-[#E8D9C0]">
        <button
          onClick={onClose}
          aria-label="Close search"
          className="text-[#8C7B6B] hover:text-[#2C2C2C] transition-colors duration-200"
        >
          <X className="w-5 h-5" strokeWidth={1.5} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col items-center pt-16 px-6">
        <div className="w-full max-w-2xl">
          <div className="flex items-center gap-4 border-b border-[#2C2C2C] pb-3">
            <Search className="w-5 h-5 text-[#8C7B6B] shrink-0" strokeWidth={1.5} />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for pieces..."
              className="flex-1 bg-transparent outline-none font-serif text-2xl text-[#2C2C2C] placeholder:text-[#C9B99A] placeholder:font-serif"
              aria-label="Search products"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="text-[#8C7B6B] hover:text-[#2C2C2C] transition-colors duration-200"
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            )}
          </div>

          {/* Results */}
          {loading && (
            <div className="mt-8 flex flex-col gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4 items-center">
                  <div className="w-12 h-12 bg-[#F5F0E8] animate-pulse shrink-0" />
                  <div className="flex-1">
                    <div className="h-4 bg-[#F5F0E8] animate-pulse w-2/3 mb-2" />
                    <div className="h-3 bg-[#F5F0E8] animate-pulse w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && results.length > 0 && (
            <ul className="mt-6 flex flex-col divide-y divide-[#E8D9C0]">
              {results.map((r, i) => (
                <li key={i}>
                  <Link
                    href={
                      r.type === "product"
                        ? `/products/${r.slug}`
                        : `/collections/${r.slug}`
                    }
                    onClick={onClose}
                    className="flex items-center gap-4 py-4 hover:opacity-70 transition-opacity duration-200"
                  >
                    <div className="relative w-12 h-12 bg-[#F5F0E8] shrink-0">
                      {r.imageUrl && (
                        <Image
                          src={r.imageUrl}
                          alt={r.title}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-sans text-[0.875rem] text-[#2C2C2C] truncate">
                        {r.title}
                      </p>
                      <p className="font-sans text-[0.7rem] tracking-[0.08em] uppercase text-[#8C7B6B]">
                        {r.type === "product" ? "Product" : "Collection"}
                      </p>
                    </div>
                    {r.price !== undefined && (
                      <p className="font-sans text-[0.875rem] text-[#2C2C2C] shrink-0">
                        {formatPrice(r.price)}
                      </p>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {!loading && query.trim().length >= 2 && results.length === 0 && (
            <p className="font-sans text-[0.875rem] text-[#8C7B6B] mt-8">
              No results for &ldquo;{query}&rdquo;
            </p>
          )}

          {!query && (
            <p className="font-sans text-[0.7rem] tracking-[0.08em] uppercase text-[#8C7B6B] mt-4">
              Try: rings, gold necklace, earrings
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
