import Image from "next/image"
import Link from "next/link"

interface BrandStoryProps {
  imageUrl: string
  imageAlt?: string
  headline: string
  body?: string
  ctaLabel?: string
  ctaHref?: string
}

export function BrandStory({
  imageUrl,
  imageAlt = "",
  headline,
  body,
  ctaLabel,
  ctaHref,
}: BrandStoryProps) {
  return (
    <section className="w-full py-16 md:py-20 bg-[#F5F0E8]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
          {/* Image — left */}
          <div className="relative aspect-[4/5] overflow-hidden">
            <Image
              src={imageUrl}
              alt={imageAlt}
              fill
              className="object-cover object-center"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>

          {/* Copy — right */}
          <div className="flex flex-col gap-6 md:max-w-md">
            <p className="font-sans text-[0.65rem] tracking-[0.15em] uppercase text-[#8C7B6B]">
              Our Story
            </p>
            <h2 className="font-serif text-[2rem] md:text-[2.5rem] leading-[1.2] text-[#2C2C2C]">
              {headline}
            </h2>
            {body && (
              <p className="font-sans text-[0.875rem] text-[#8C7B6B] leading-relaxed">
                {body}
              </p>
            )}
            {ctaLabel && ctaHref && (
              <Link
                href={ctaHref}
                className="self-start font-sans text-[0.7rem] tracking-[0.12em] uppercase text-[#2C2C2C] border-b border-[#2C2C2C] hover:text-[#B8975A] hover:border-[#B8975A] pb-0.5 transition-colors duration-200"
              >
                {ctaLabel}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
