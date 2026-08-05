import Image from "next/image"
import Link from "next/link"

interface CampaignBannerProps {
  imageUrl: string
  imageAlt?: string
  headline: string
  ctaLabel: string
  ctaHref: string
}

export function CampaignBanner({
  imageUrl,
  imageAlt = "",
  headline,
  ctaLabel,
  ctaHref,
}: CampaignBannerProps) {
  return (
    <section className="relative w-full aspect-[16/7] min-h-[320px] overflow-hidden">
      <Image
        src={imageUrl}
        alt={imageAlt}
        fill
        className="object-cover object-center"
        sizes="100vw"
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-[#1A1A1A]/45" />

      {/* Content — bottom left matching reference */}
      <div className="absolute bottom-10 left-6 md:left-12">
        <h2 className="font-serif text-[2rem] md:text-[3rem] leading-[1.1] text-[#FDFAF5] max-w-lg">
          {headline}
        </h2>
        <Link
          href={ctaHref}
          className="inline-block mt-5 font-sans text-[0.7rem] tracking-[0.12em] uppercase text-[#FDFAF5] border-b border-[#FDFAF5]/60 hover:border-[#FDFAF5] pb-0.5 transition-colors duration-200"
        >
          {ctaLabel}
        </Link>
      </div>
    </section>
  )
}
