import type { Metadata } from "next"
import Image from "next/image"

export const metadata: Metadata = {
  title: "About",
  description: "The story behind Elowen — fine jewelry crafted with intention.",
}

export default function AboutPage() {
  return (
    <div className="pt-16 min-h-screen bg-[#FDFAF5]">
      {/* Hero */}
      <div className="relative w-full h-[60vh] min-h-[360px] overflow-hidden">
        <Image
          src="/about-hero.png"
          alt="Model wearing a malachite crystal pendant — Elowen Fine Jewelry"
          fill
          priority
          className="object-cover object-[center_70%]"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[#2C2C2C]/30" />
        <div className="absolute inset-0 flex items-end pb-12 px-6 md:px-12">
          <h1 className="font-serif text-[3rem] md:text-[4rem] text-[#FDFAF5] leading-[1.1]">
            Our Story
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
          <div className="flex flex-col gap-8">
            <p className="font-sans text-[0.65rem] tracking-[0.15em] uppercase text-[#8C7B6B]">
              The Atelier
            </p>
            <h2 className="font-serif text-[2rem] text-[#2C2C2C] leading-[1.2]">
              Crafted with intention. Worn with meaning.
            </h2>
            <p className="font-sans text-[0.875rem] text-[#8C7B6B] leading-relaxed">
              Elowen was founded on the belief that fine jewelry should be more than an accessory — it should be a quiet declaration of who you are. Each piece is designed with restraint and made with care, using only the finest materials sourced responsibly.
            </p>
            <p className="font-sans text-[0.875rem] text-[#8C7B6B] leading-relaxed">
              Our atelier works with a small team of master craftspeople who share our commitment to quality and longevity. We believe in making fewer things, better — pieces that will be passed down, not discarded.
            </p>
          </div>

          <div className="relative aspect-[4/5] bg-[#F5F0E8] overflow-hidden">
            <Image
              src="/about-editorial.jpg"
              alt="Model wearing an ornate multi-gemstone gold choker necklace — Elowen Fine Jewelry"
              fill
              className="object-cover object-top"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
