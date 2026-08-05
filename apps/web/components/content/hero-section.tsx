import Image from "next/image"
import Link from "next/link"

interface HeroSectionProps {
  headline: string
  subline?: string
  ctaLabel: string
  ctaHref: string
  imageUrl: string
  imageAlt?: string
}

export function HeroSection({
  headline,
  subline,
  ctaLabel,
  ctaHref,
  imageUrl,
  imageAlt = "",
}: HeroSectionProps) {
  return (
    <section className="relative w-full h-screen min-h-[600px] max-h-[900px] overflow-hidden">
      {/* Background image */}
      {imageUrl && (
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          priority
          unoptimized
          className="object-cover object-left-top"
          sizes="100vw"
        />
      )}

      {/* Subtle dark gradient at bottom for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#1A1A1A]/40" />

      {/* Content — bottom left, matching LAICE reference */}
      <div className="absolute bottom-12 left-6 md:left-12 max-w-lg animate-fade-in-up">
        <h1 className="font-serif text-[2.5rem] md:text-[3.5rem] leading-[1.1] tracking-[-0.01em] text-[#FDFAF5]">
          {headline}
        </h1>
        {subline && (
          <p className="font-sans text-[0.875rem] text-[#E8D9C0] mt-3 leading-relaxed tracking-wide">
            {subline}
          </p>
        )}
        <Link
          href={ctaHref}
          className="inline-block mt-6 font-sans text-[0.7rem] tracking-[0.12em] uppercase text-[#FDFAF5] border-b border-[#FDFAF5]/60 hover:border-[#FDFAF5] pb-0.5 transition-colors duration-200"
        >
          {ctaLabel}
        </Link>
      </div>
    </section>
  )
}
