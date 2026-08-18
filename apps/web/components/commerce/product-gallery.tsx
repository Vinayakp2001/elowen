"use client"

import Image from "next/image"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface GalleryImage {
  url: string
  alt?: string
}

interface ProductGalleryProps {
  images: GalleryImage[]
  title: string
}

export function ProductGallery({ images, title }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  if (!images?.length) {
    return <div className="w-full h-64 bg-[#F5F0E8]" />
  }

  const validImages = images.filter((img) => !!img.url)

  if (!validImages.length) {
    return <div className="w-full h-64 bg-[#F5F0E8]" />
  }

  const active = validImages[activeIndex] ?? validImages[0]

  return (
    <>
      {/* Desktop: thumbnail strip + main image */}
      <div className="hidden md:flex gap-4 items-start">
        {/* Thumbnails */}
        {validImages.length > 1 && (
          <div className="flex flex-col gap-2 w-16 shrink-0 max-h-[600px] overflow-y-auto">
            {validImages.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                aria-label={`View image ${i + 1}`}
                className={cn(
                  "relative aspect-square w-16 shrink-0 overflow-hidden border transition-colors duration-200",
                  activeIndex === i
                    ? "border-[#2C2C2C]"
                    : "border-transparent hover:border-[#C9B99A]"
                )}
              >
                <Image
                  src={img.url}
                  alt={img.alt ?? `${title} ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </button>
            ))}
          </div>
        )}

        {/* Main image — square aspect ratio so it always fills the column */}
        <div className="flex-1 aspect-square bg-[#F5F0E8] flex items-center justify-center overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={active.url}
            src={active.url}
            alt={active.alt ?? title}
            className="w-full h-full object-contain transition-opacity duration-200"
          />
        </div>
      </div>

      {/* Mobile */}
      <div className="md:hidden relative bg-[#F5F0E8] aspect-square flex items-center justify-center overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={active.url}
          src={active.url}
          alt={active.alt ?? title}
          className="w-full h-full object-contain"
        />
        {validImages.length > 1 && (
          <div className="flex justify-center gap-1.5 absolute bottom-3 left-0 right-0">
            {validImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                aria-label={`Go to image ${i + 1}`}
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-colors duration-200",
                  activeIndex === i ? "bg-[#2C2C2C]" : "bg-[#C9B99A]"
                )}
              />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
